import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Confidence-based category tiers
function getConfidenceTier(confidence) {
  if (confidence >= 85) return { tier: "high", label: "High Confidence", color: "emerald" };
  if (confidence >= 60) return { tier: "medium", label: "Review Suggested", color: "amber" };
  return { tier: "low", label: "Manual Review Required", color: "rose" };
}

// Built-in classification categories (used when no config is set up)
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

    // Load custom config or fall back to built-in categories
    const configs = await base44.entities.DocumentClassificationConfig.list();
    const config = configs[0];
    const categories = config?.categories?.length ? config.categories : DEFAULT_CATEGORIES;

    const categoriesList = categories.map(cat => `- ${cat.name}: ${cat.description}`).join('\n');

    const classification = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert document classification specialist. Classify the following document.

Available categories:
${categoriesList}

Document Information:
- Title: ${document.title}
- File Type: ${document.file_type || 'unknown'}
- Content Preview (first 1500 chars): ${document.extracted_text?.substring(0, 1500) || "(no text)"}
- Existing extracted entities: ${JSON.stringify(document.extracted_entities?.slice(0, 5) || [])}

Instructions:
1. Assign the single best-matching category.
2. Give a confidence score 0-100 reflecting how certain you are.
3. List up to 3 alternative categories with confidence scores.
4. List the specific text indicators that drove your classification decision.
5. Provide a one-sentence rationale.`,
      response_json_schema: {
        type: "object",
        properties: {
          category: { type: "string", description: "Best matching category name" },
          confidence: { type: "number", description: "Confidence 0-100" },
          rationale: { type: "string", description: "One sentence explanation" },
          alternatives: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                confidence: { type: "number" }
              }
            }
          },
          indicators: {
            type: "array",
            items: { type: "string" },
            description: "Text indicators that drove the classification"
          }
        }
      }
    });

    const confidenceTier = getConfidenceTier(classification.confidence || 0);

    const classificationData = {
      document_class: classification.category,
      classification_confidence: classification.confidence,
      classification_tier: confidenceTier.tier,
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
      changes: {
        classification: classification.category,
        confidence: classification.confidence,
        tier: confidenceTier.tier
      }
    });

    return Response.json({
      success: true,
      classification: classificationData,
      confidence_tier: confidenceTier
    });

  } catch (error) {
    console.error('Classification error:', error);
    return Response.json({ error: 'Classification failed', details: error.message }, { status: 500 });
  }
});