import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function getConfidenceTier(confidence) {
  if (confidence >= 85) return "high";
  if (confidence >= 60) return "medium";
  return "low";
}

const DEFAULT_CATEGORIES = [
  { name: "contract", description: "Legal contracts, service agreements, licensing agreements, NDAs, SLAs" },
  { name: "invoice", description: "Bills, invoices, payment requests, receipts, credit notes" },
  { name: "agreement", description: "MOUs, partnership agreements, settlement agreements, terms of service" },
  { name: "letter", description: "Business letters, cover letters, formal correspondence, notices" },
  { name: "report", description: "Business reports, financial reports, audit reports, research reports" },
  { name: "form", description: "Application forms, tax forms, regulatory filings, questionnaires" },
  { name: "other", description: "Documents that do not fit any of the above categories" }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { document_id } = await req.json();
    if (!document_id) return Response.json({ error: 'Missing document_id' }, { status: 400 });

    const documents = await base44.entities.Document.list();
    const document = documents.find(d => d.id === document_id);
    if (!document) return Response.json({ error: 'Document not found' }, { status: 404 });

    const configs = await base44.entities.DocumentClassificationConfig.list();
    const categories = configs[0]?.categories?.length ? configs[0].categories : DEFAULT_CATEGORIES;

    const classification = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert document classification specialist. Classify the following document.

Available categories:
${categories.map(c => `- ${c.name}: ${c.description}`).join('\n')}

Document:
- Title: ${document.title}
- File Type: ${document.file_type || 'unknown'}
- Content Preview: ${document.extracted_text?.substring(0, 1500) || "(no text)"}

Return:
1. The single best-matching category name (must exactly match one of the names above).
2. Confidence 0-100.
3. A one-sentence rationale explaining your decision.
4. Up to 3 alternative categories with confidence scores.
5. The specific text indicators that drove your choice.`,
      response_json_schema: {
        type: "object",
        properties: {
          category: { type: "string" },
          confidence: { type: "number" },
          rationale: { type: "string" },
          alternatives: { type: "array", items: { type: "object", properties: { category: { type: "string" }, confidence: { type: "number" } } } },
          indicators: { type: "array", items: { type: "string" } }
        }
      }
    });

    const classificationData = {
      document_class: classification.category,
      classification_confidence: classification.confidence,
      classification_tier: getConfidenceTier(classification.confidence || 0),
      classification_rationale: classification.rationale,
      classification_indicators: classification.indicators,
      alternative_classifications: classification.alternatives
    };

    await base44.asServiceRole.entities.Document.update(document_id, classificationData);

    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: "document",
      entity_id: document_id,
      action: "update",
      user_email: user.email,
      timestamp: new Date().toISOString(),
      changes: { classification: classification.category, confidence: classification.confidence, tier: classificationData.classification_tier }
    });

    return Response.json({ success: true, classification: classificationData });

  } catch (error) {
    return Response.json({ error: 'Classification failed', details: error.message }, { status: 500 });
  }
});