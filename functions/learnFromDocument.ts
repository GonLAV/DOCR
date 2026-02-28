import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Called whenever a document reaches "completed" status.
 * Extracts patterns and stores learnings in WorkflowLearning so future
 * AI calls can reference real-world outcomes to improve accuracy.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both authenticated user calls and service-role automation calls
    const payload = await req.json();
    const document_id = payload?.document_id || payload?.event?.entity_id;

    if (!document_id) {
      return Response.json({ error: 'Missing document_id' }, { status: 400 });
    }

    // Fetch the completed document
    const allDocs = await base44.asServiceRole.entities.Document.list();
    const doc = allDocs.find(d => d.id === document_id);

    if (!doc || doc.status !== 'completed') {
      return Response.json({ skipped: true, reason: 'Not completed' });
    }

    // ── 1. ROUTING / CLASSIFICATION PATTERN ──────────────────────────────────
    if (doc.document_class) {
      const existingList = await base44.asServiceRole.entities.WorkflowLearning.filter({
        learning_type: 'routing_pattern',
        workflow_id: 'system'
      });

      const key = doc.document_class.toLowerCase().replace(/\s+/g, '_');
      const existing = existingList.find(l => l.pattern_data?.class_key === key);

      if (existing) {
        const prev = existing.pattern_data;
        const totalDocs = (prev.sample_count || 1) + 1;
        const newAvgConf = Math.round(
          ((prev.avg_confidence || 0) * (totalDocs - 1) + (doc.confidence_score || 0)) / totalDocs
        );
        const anomalyRate = Math.round(
          (((prev.anomaly_rate || 0) * (totalDocs - 1)) +
            ((doc.anomalies?.length || 0) > 0 ? 100 : 0)) / totalDocs
        );
        await base44.asServiceRole.entities.WorkflowLearning.update(existing.id, {
          pattern_data: {
            ...prev,
            sample_count: totalDocs,
            avg_confidence: newAvgConf,
            anomaly_rate: anomalyRate,
            last_document_id: document_id,
            common_entities: mergeEntityKeys(prev.common_entities, doc.extracted_entities),
            common_anomaly_types: mergeAnomalyTypes(prev.common_anomaly_types, doc.anomalies)
          },
          confidence_score: Math.min(99, Math.round((existing.confidence_score || 50) + 2)),
          success_count: (existing.success_count || 0) + 1,
          last_applied: new Date().toISOString()
        });
      } else {
        await base44.asServiceRole.entities.WorkflowLearning.create({
          workflow_id: 'system',
          learning_type: 'routing_pattern',
          pattern_data: {
            class_key: key,
            document_class: doc.document_class,
            sample_count: 1,
            avg_confidence: doc.confidence_score || 0,
            anomaly_rate: (doc.anomalies?.length || 0) > 0 ? 100 : 0,
            last_document_id: document_id,
            common_entities: entityKeysFrom(doc.extracted_entities),
            common_anomaly_types: anomalyTypesFrom(doc.anomalies)
          },
          confidence_score: 50,
          success_count: 1,
          last_applied: new Date().toISOString(),
          is_active: true
        });
      }
    }

    // ── 2. FAILURE PATTERN (anomalies / tampering) ────────────────────────────
    if ((doc.anomalies?.length || 0) > 0 || doc.tampering_risk === 'high') {
      const existingFP = await base44.asServiceRole.entities.WorkflowLearning.filter({
        learning_type: 'failure_pattern',
        workflow_id: 'system'
      });

      const fpKey = `failure_${doc.document_class || 'unknown'}`;
      const existingF = existingFP.find(l => l.pattern_data?.failure_key === fpKey);

      if (existingF) {
        const prev = existingF.pattern_data;
        await base44.asServiceRole.entities.WorkflowLearning.update(existingF.id, {
          pattern_data: {
            ...prev,
            sample_count: (prev.sample_count || 1) + 1,
            anomaly_types: mergeAnomalyTypes(prev.anomaly_types, doc.anomalies),
            tampering_count: (prev.tampering_count || 0) + (doc.tampering_risk === 'high' ? 1 : 0)
          },
          success_count: (existingF.success_count || 0) + 1,
          last_applied: new Date().toISOString()
        });
      } else {
        await base44.asServiceRole.entities.WorkflowLearning.create({
          workflow_id: 'system',
          learning_type: 'failure_pattern',
          pattern_data: {
            failure_key: fpKey,
            document_class: doc.document_class || 'unknown',
            sample_count: 1,
            anomaly_types: anomalyTypesFrom(doc.anomalies),
            tampering_count: doc.tampering_risk === 'high' ? 1 : 0
          },
          confidence_score: 60,
          success_count: 1,
          last_applied: new Date().toISOString(),
          is_active: true
        });
      }
    }

    // ── 3. RESOURCE / PERFORMANCE PATTERN ────────────────────────────────────
    const existingRP = await base44.asServiceRole.entities.WorkflowLearning.filter({
      learning_type: 'resource_prediction',
      workflow_id: 'system'
    });

    const rpKey = `perf_${doc.file_type || 'unknown'}`;
    const existingR = existingRP.find(l => l.pattern_data?.perf_key === rpKey);

    if (existingR) {
      const prev = existingR.pattern_data;
      const n = (prev.sample_count || 1) + 1;
      const newAvgTime = Math.round(
        ((prev.avg_processing_ms || 0) * (n - 1) + (doc.processing_time_ms || 0)) / n
      );
      await base44.asServiceRole.entities.WorkflowLearning.update(existingR.id, {
        pattern_data: {
          ...prev,
          sample_count: n,
          avg_processing_ms: newAvgTime,
          avg_confidence: Math.round(
            ((prev.avg_confidence || 0) * (n - 1) + (doc.confidence_score || 0)) / n
          )
        },
        success_count: (existingR.success_count || 0) + 1,
        last_applied: new Date().toISOString()
      });
    } else {
      await base44.asServiceRole.entities.WorkflowLearning.create({
        workflow_id: 'system',
        learning_type: 'resource_prediction',
        pattern_data: {
          perf_key: rpKey,
          file_type: doc.file_type || 'unknown',
          sample_count: 1,
          avg_processing_ms: doc.processing_time_ms || 0,
          avg_confidence: doc.confidence_score || 0
        },
        confidence_score: 55,
        success_count: 1,
        last_applied: new Date().toISOString(),
        is_active: true
      });
    }

    return Response.json({ success: true, document_id });

  } catch (error) {
    console.error('Learning error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function entityKeysFrom(entities = []) {
  const counts = {};
  for (const e of entities) {
    if (e?.field) counts[e.field] = (counts[e.field] || 0) + 1;
  }
  return counts;
}

function mergeEntityKeys(prev = {}, entities = []) {
  const result = { ...prev };
  for (const e of entities) {
    if (e?.field) result[e.field] = (result[e.field] || 0) + 1;
  }
  return result;
}

function anomalyTypesFrom(anomalies = []) {
  const counts = {};
  for (const a of anomalies) {
    if (a?.type) counts[a.type] = (counts[a.type] || 0) + 1;
  }
  return counts;
}

function mergeAnomalyTypes(prev = {}, anomalies = []) {
  const result = { ...prev };
  for (const a of anomalies) {
    if (a?.type) result[a.type] = (result[a.type] || 0) + 1;
  }
  return result;
}