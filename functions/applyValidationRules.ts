import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Semantic Validation Engine
 * 
 * Applies domain-specific validation rules to detect:
 * - Impossible values (dates in future, negative amounts)
 * - Contradictions (total != sum of items)
 * - Missing required fields
 * - Format violations
 * - Cross-field inconsistencies
 * - Statistical anomalies
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { document_id } = await req.json();

    if (!document_id) {
      return Response.json({ error: 'document_id required' }, { status: 400 });
    }

    // Get document
    const documents = await base44.entities.Document.list();
    const document = documents.find(d => d.id === document_id);

    if (!document) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    // Get validation rules for this document type
    const rules = await base44.entities.ValidationRule.filter({
      document_type: document.document_class,
      enabled: true
    });

    // Apply each rule
    const validationResults = [];
    let totalPenalty = 0;

    for (const rule of rules) {
      const result = await applyRule(rule, document, base44);
      validationResults.push(result);
      
      if (!result.passed) {
        totalPenalty += rule.confidence_penalty || 0;
      }
    }

    // Calculate adjusted confidence
    const originalConfidence = document.confidence_score || 100;
    const adjustedConfidence = Math.max(0, originalConfidence - totalPenalty);

    // Update trust score
    const trustScores = await base44.entities.TrustScore.filter({ document_id });
    if (trustScores.length > 0) {
      await base44.asServiceRole.entities.TrustScore.update(trustScores[0].id, {
        validation_pass_rate: (validationResults.filter(r => r.passed).length / validationResults.length) * 100,
        semantic_coherence: adjustedConfidence,
        overall_trust: Math.min(adjustedConfidence, trustScores[0].overall_trust || 100)
      });
    }

    // Update document with validation results
    await base44.asServiceRole.entities.Document.update(document_id, {
      confidence_score: adjustedConfidence,
      anomalies: [
        ...(document.anomalies || []),
        ...validationResults.filter(r => !r.passed).map(r => ({
          type: "validation_failure",
          description: r.message,
          severity: r.severity,
          location: r.field
        }))
      ]
    });

    return Response.json({
      success: true,
      validation_results: validationResults,
      original_confidence: originalConfidence,
      adjusted_confidence: adjustedConfidence,
      penalty_applied: totalPenalty
    });

  } catch (error) {
    console.error('Validation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function applyRule(rule, document, base44) {
  const result = {
    rule_name: rule.rule_name,
    field: rule.field_name,
    passed: true,
    severity: rule.severity,
    message: null
  };

  try {
    // Get field value
    const fieldValue = getFieldValue(document, rule.field_name);

    if (rule.rule_type === "format") {
      // Regex validation
      const pattern = new RegExp(rule.rule_logic.pattern);
      result.passed = pattern.test(fieldValue);
      if (!result.passed) {
        result.message = `${rule.field_name} does not match expected format`;
      }
    }

    if (rule.rule_type === "range") {
      // Numeric range validation
      const value = parseFloat(fieldValue);
      if (rule.rule_logic.min !== undefined && value < rule.rule_logic.min) {
        result.passed = false;
        result.message = `${rule.field_name} is below minimum (${rule.rule_logic.min})`;
      }
      if (rule.rule_logic.max !== undefined && value > rule.rule_logic.max) {
        result.passed = false;
        result.message = `${rule.field_name} exceeds maximum (${rule.rule_logic.max})`;
      }
    }

    if (rule.rule_type === "cross_field") {
      // Cross-field validation
      const otherValue = getFieldValue(document, rule.rule_logic.compare_field);
      result.passed = eval(`${fieldValue} ${rule.rule_logic.operator} ${otherValue}`);
      if (!result.passed) {
        result.message = `${rule.field_name} fails cross-field validation with ${rule.rule_logic.compare_field}`;
      }
    }

    if (rule.rule_type === "semantic") {
      // Use AI for semantic validation
      const semanticCheck = await base44.integrations.Core.InvokeLLM({
        prompt: `Validate this field: ${rule.field_name} = "${fieldValue}"
        
Document context: ${JSON.stringify(document.extracted_entities)}

Validation: ${rule.rule_logic.description}

Is this value semantically valid and consistent with the document?`,
        response_json_schema: {
          type: "object",
          properties: {
            is_valid: { type: "boolean" },
            explanation: { type: "string" }
          }
        }
      });

      result.passed = semanticCheck.is_valid;
      result.message = semanticCheck.explanation;
    }

  } catch (error) {
    result.passed = false;
    result.message = `Validation error: ${error.message}`;
  }

  return result;
}

function getFieldValue(document, fieldPath) {
  // Simple field extraction (can be enhanced)
  if (document.extracted_entities) {
    const entity = document.extracted_entities.find(e => e.field === fieldPath);
    return entity?.value;
  }
  return null;
}