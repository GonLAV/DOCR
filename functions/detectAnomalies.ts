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

    // Fetch document
    const documents = await base44.entities.Document.list();
    const document = documents.find(d => d.id === document_id);

    if (!document) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    if (!document.document_class) {
      return Response.json({ 
        error: 'Document must be classified first' 
      }, { status: 400 });
    }

    // Fetch anomaly model for document type
    const models = await base44.entities.AnomalyModel.list();
    const model = models.find(m => m.document_type === document.document_class);

    if (!model || !model.enabled) {
      return Response.json({ 
        success: true,
        anomalies: [],
        message: `No anomaly model available for ${document.document_class}`
      });
    }

    // Get similar historical documents for comparison
    const similarDocs = documents.filter(d => 
      d.document_class === document.document_class && 
      d.id !== document_id &&
      d.status === "completed"
    ).slice(0, 20);

    // Prepare context for anomaly detection
    const anomalyContext = {
      current_document: {
        title: document.title,
        confidence_score: document.confidence_score,
        extracted_entities: document.extracted_entities,
        anomalies: document.anomalies || [],
        extracted_text_length: document.extracted_text?.length || 0
      },
      baseline_metrics: model.baseline_metrics || {
        avg_entities: similarDocs.reduce((sum, d) => sum + (d.extracted_entities?.length || 0), 0) / Math.max(similarDocs.length, 1),
        avg_confidence: similarDocs.reduce((sum, d) => sum + (d.confidence_score || 0), 0) / Math.max(similarDocs.length, 1),
        avg_text_length: similarDocs.reduce((sum, d) => sum + (d.extracted_text?.length || 0), 0) / Math.max(similarDocs.length, 1)
      }
    };

    // Detect anomalies using AI
    const detection = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a document anomaly detection specialist. Analyze the current document for anomalies based on the provided baseline metrics and known anomaly patterns.

Anomaly Types to Check:
${model.anomaly_types.map(anom => `- ${anom.name} (${anom.severity}): ${anom.description}`).join('\n')}

Current Document Data:
${JSON.stringify(anomalyContext.current_document, null, 2)}

Baseline Metrics (from similar documents):
${JSON.stringify(anomalyContext.baseline_metrics, null, 2)}

Sensitivity Threshold: ${model.threshold_sensitivity}

Identify any anomalies in:
1. Data inconsistencies or contradictions
2. Missing critical fields
3. Unusual value distributions
4. Confidence score deviations
5. Structural irregularities

For each detected anomaly, provide the type, severity, and evidence.`,
      response_json_schema: {
        type: "object",
        properties: {
          detected_anomalies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                description: { type: "string" },
                severity: { 
                  type: "string",
                  enum: ["low", "medium", "high", "critical"]
                },
                evidence: { type: "string" },
                affected_fields: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            description: "List of detected anomalies"
          },
          overall_risk_score: {
            type: "number",
            description: "Overall anomaly risk 0-100"
          },
          recommendations: {
            type: "array",
            items: { type: "string" },
            description: "Recommended actions"
          }
        }
      }
    });

    // Update document with anomalies if any detected
    if (detection.detected_anomalies.length > 0) {
      await base44.asServiceRole.entities.Document.update(document_id, {
        anomalies: detection.detected_anomalies,
        tampering_risk: detection.overall_risk_score > 70 ? "high" : 
                        detection.overall_risk_score > 40 ? "medium" : "low"
      });
    }

    // Log audit event
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: "document",
      entity_id: document_id,
      action: "update",
      user_email: user.email,
      timestamp: new Date().toISOString(),
      changes: {
        anomalies_detected: detection.detected_anomalies.length,
        risk_score: detection.overall_risk_score
      }
    });

    return Response.json({
      success: true,
      anomalies: detection.detected_anomalies,
      risk_score: detection.overall_risk_score,
      recommendations: detection.recommendations
    });

  } catch (error) {
    console.error('Anomaly detection error:', error);
    return Response.json({ 
      error: 'Anomaly detection failed', 
      details: error.message 
    }, { status: 500 });
  }
});