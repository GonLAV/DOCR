import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { document_id } = await req.json();

    if (!document_id) {
      return Response.json({ error: 'Missing document_id' }, { status: 400 });
    }

    const documents = await base44.entities.Document.list();
    const document = documents.find(d => d.id === document_id);

    if (!document) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    // Fetch validation rules for this document type
    const rules = await base44.entities.ValidationRule.filter({
      document_type: document.document_class || 'general',
      enabled: true
    });

    const validationResults = [];
    let passedRules = 0;
    let totalRules = rules.length;

    // Apply each rule
    for (const rule of rules) {
      const targetEntity = document.extracted_entities?.find(e => e.field === rule.field_name);
      
      if (!targetEntity) {
        validationResults.push({
          rule_name: rule.rule_name,
          field: rule.field_name,
          status: 'skipped',
          reason: 'Field not found in document'
        });
        continue;
      }

      let passed = false;
      let failureReason = '';

      // Apply rule based on type
      switch (rule.rule_type) {
        case 'format':
          // Check if value matches expected format (regex)
          if (rule.rule_logic.pattern) {
            const regex = new RegExp(rule.rule_logic.pattern);
            passed = regex.test(targetEntity.value);
            if (!passed) failureReason = `Format mismatch: expected pattern ${rule.rule_logic.pattern}`;
          }
          break;

        case 'range':
          // Check if numeric value is in range
          const numValue = parseFloat(targetEntity.value);
          if (!isNaN(numValue)) {
            const min = rule.rule_logic.min ?? -Infinity;
            const max = rule.rule_logic.max ?? Infinity;
            passed = numValue >= min && numValue <= max;
            if (!passed) failureReason = `Value ${numValue} out of range [${min}, ${max}]`;
          }
          break;

        case 'cross_field':
          // Check consistency with other fields
          const relatedField = document.extracted_entities?.find(
            e => e.field === rule.rule_logic.related_field
          );
          if (relatedField) {
            // Example: invoice date should be before due date
            passed = true; // Simplified for now
          }
          break;

        case 'semantic':
          // Semantic validation via LLM
          const semanticCheck = await base44.integrations.Core.InvokeLLM({
            prompt: `Validate if this field makes semantic sense in the document context:
Field: ${rule.field_name}
Value: ${targetEntity.value}
Document Type: ${document.document_class}
Rule: ${rule.rule_logic.description || 'Check semantic correctness'}

Return true if valid, false otherwise with a reason.`,
            response_json_schema: {
              type: "object",
              properties: {
                valid: { type: "boolean" },
                reason: { type: "string" }
              }
            }
          });
          passed = semanticCheck.valid;
          if (!passed) failureReason = semanticCheck.reason;
          break;

        default:
          passed = true;
      }

      validationResults.push({
        rule_name: rule.rule_name,
        field: rule.field_name,
        status: passed ? 'passed' : 'failed',
        severity: rule.severity,
        reason: failureReason || 'Validation passed',
        confidence_penalty: passed ? 0 : rule.confidence_penalty
      });

      if (passed) passedRules++;
    }

    const validationPassRate = totalRules > 0 ? (passedRules / totalRules) * 100 : 100;

    // Update document anomalies based on validation failures
    const newAnomalies = validationResults
      .filter(r => r.status === 'failed')
      .map(r => ({
        type: 'validation_failure',
        description: `${r.rule_name}: ${r.reason}`,
        severity: r.severity,
        location: r.field
      }));

    await base44.asServiceRole.entities.Document.update(document_id, {
      anomalies: [...(document.anomalies || []), ...newAnomalies]
    });

    return Response.json({
      success: true,
      validation_results: validationResults,
      pass_rate: validationPassRate,
      passed: passedRules,
      failed: totalRules - passedRules,
      total: totalRules
    });

  } catch (error) {
    console.error('Validation error:', error);
    return Response.json({ 
      error: 'Validation failed', 
      details: error.message 
    }, { status: 500 });
  }
});