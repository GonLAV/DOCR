import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Evaluates all enabled DocumentTriggerRules against a document's extracted key_data_points.
 * Called by automation whenever a Document is updated (specifically when completed).
 * Also callable manually with { document_id }.
 */

function parseDateSafe(str) {
  if (!str) return null;
  // Handle ISO and common date formats
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function daysUntil(dateStr) {
  const d = parseDateSafe(dateStr);
  if (!d) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function evaluateTrigger(rule, document) {
  const fieldValue = document.key_data_points?.[rule.trigger_field];

  switch (rule.trigger_type) {
    case 'field_present':
      return !!fieldValue;

    case 'field_missing':
      return !fieldValue;

    case 'value_matches':
      return rule.match_value && fieldValue &&
        String(fieldValue).toLowerCase().includes(rule.match_value.toLowerCase());

    case 'date_approaching': {
      const days = daysUntil(fieldValue);
      if (days === null) return false;
      const threshold = rule.days_threshold ?? 30;
      return days >= 0 && days <= threshold;
    }

    case 'date_passed': {
      const days = daysUntil(fieldValue);
      if (days === null) return false;
      const threshold = rule.days_threshold ?? 0;
      return days < -threshold;
    }

    default:
      return false;
  }
}

async function executeAction(base44, rule, document) {
  const cfg = rule.action_config || {};

  switch (rule.action_type) {
    case 'flag_for_review': {
      const note = cfg.review_note ||
        `Auto-flagged by rule "${rule.name}": ${rule.trigger_field} = ${document.key_data_points?.[rule.trigger_field]}`;
      // Add a tag and update notes
      const currentTags = document.tags || [];
      const newTags = currentTags.includes('needs-review') ? currentTags : [...currentTags, 'needs-review'];
      await base44.asServiceRole.entities.Document.update(document.id, {
        tags: newTags,
        notes: document.notes ? `${document.notes}\n\n[AUTO] ${note}` : `[AUTO] ${note}`
      });
      break;
    }

    case 'send_email': {
      const daysLeft = daysUntil(document.key_data_points?.[rule.trigger_field]);
      const dateInfo = daysLeft !== null
        ? `\n\nDate: ${document.key_data_points?.[rule.trigger_field]} (${daysLeft >= 0 ? `${daysLeft} days away` : `${Math.abs(daysLeft)} days ago`})`
        : '';
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: cfg.email_recipient || document.created_by,
        subject: cfg.email_subject || `[DocIntel] Action Required: ${rule.name} — ${document.title}`,
        body: `A document trigger has been activated:\n\nDocument: ${document.title}\nClass: ${document.document_class || 'Unknown'}\nRule: ${rule.name}\n\n${rule.description || ''}${dateInfo}\n\nPlease review this document in DocIntel.`
      });
      break;
    }

    case 'add_tag': {
      const tag = cfg.tag || rule.name.toLowerCase().replace(/\s+/g, '-');
      const currentTags = document.tags || [];
      if (!currentTags.includes(tag)) {
        await base44.asServiceRole.entities.Document.update(document.id, {
          tags: [...currentTags, tag]
        });
      }
      break;
    }

    case 'set_status': {
      if (cfg.status) {
        await base44.asServiceRole.entities.Document.update(document.id, {
          status: cfg.status
        });
      }
      break;
    }
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const payload = await req.json();
    const document_id = payload?.document_id || payload?.event?.entity_id;

    if (!document_id) {
      return Response.json({ error: 'Missing document_id' }, { status: 400 });
    }

    // Only run on completed documents
    const allDocs = await base44.asServiceRole.entities.Document.list();
    const document = allDocs.find(d => d.id === document_id);

    if (!document || document.status !== 'completed') {
      return Response.json({ skipped: true, reason: 'Document not completed' });
    }

    // Skip if no key_data_points extracted
    if (!document.key_data_points || Object.keys(document.key_data_points).length === 0) {
      return Response.json({ skipped: true, reason: 'No key_data_points to evaluate' });
    }

    // Fetch all enabled rules
    const allRules = await base44.asServiceRole.entities.DocumentTriggerRule.list();
    const rules = allRules.filter(r => r.enabled !== false);

    const triggered = [];
    const skipped = [];

    for (const rule of rules) {
      // Skip if rule targets a specific class and document doesn't match
      if (rule.document_class && document.document_class &&
          rule.document_class.toLowerCase() !== document.document_class.toLowerCase()) {
        skipped.push({ rule: rule.name, reason: 'class mismatch' });
        continue;
      }

      const fires = evaluateTrigger(rule, document);

      if (fires) {
        await executeAction(base44, rule, document);

        // Log the trigger firing as an audit event
        await base44.asServiceRole.entities.AuditLog.create({
          entity_type: 'document',
          entity_id: document_id,
          action: 'update',
          user_email: 'system@auto-trigger',
          timestamp: new Date().toISOString(),
          changes: {
            trigger_rule: rule.name,
            trigger_field: rule.trigger_field,
            field_value: document.key_data_points?.[rule.trigger_field],
            action: rule.action_type
          }
        });

        // Increment rule fire count
        await base44.asServiceRole.entities.DocumentTriggerRule.update(rule.id, {
          times_fired: (rule.times_fired || 0) + 1,
          last_fired_at: new Date().toISOString()
        });

        triggered.push({ rule: rule.name, action: rule.action_type, field: rule.trigger_field });
      } else {
        skipped.push({ rule: rule.name, reason: 'condition not met' });
      }
    }

    return Response.json({
      success: true,
      document_id,
      rules_evaluated: rules.length,
      triggered,
      skipped_count: skipped.length
    });

  } catch (error) {
    console.error('Trigger evaluation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});