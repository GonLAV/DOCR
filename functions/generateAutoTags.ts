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

    // Prepare context for AI
    const context = {
      document_class: document.document_class,
      extracted_entities: document.extracted_entities?.slice(0, 10) || [],
      extracted_text_preview: document.extracted_text?.substring(0, 800),
      confidence_score: document.confidence_score,
      tampering_risk: document.tampering_risk,
      anomalies_count: document.anomalies?.length || 0,
      has_handwriting: (document.handwriting_regions?.length || 0) > 0
    };

    // Generate tag suggestions using AI
    const tagAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this document and suggest 5-8 relevant tags for organization and searchability.

Document Context:
${JSON.stringify(context, null, 2)}

Generate tags based on:
1. Document type/classification (e.g., "invoice", "contract", "legal", "medical")
2. Key entities (organizations, people, dates, locations)
3. Content themes (e.g., "financial", "compliance", "hr", "sales")
4. Document properties (e.g., "urgent", "archived", "verified", "needs-review")
5. Technical attributes (e.g., "handwritten", "degraded", "high-confidence")

For each tag, provide:
- The tag text (lowercase, hyphen-separated if multiple words)
- Confidence score (0-100) indicating how relevant this tag is
- Brief reason explaining why this tag applies

Return 5-8 highly relevant, specific tags. Prioritize actionable and searchable tags.`,
      response_json_schema: {
        type: "object",
        properties: {
          suggested_tags: {
            type: "array",
            items: {
              type: "object",
              properties: {
                tag: { 
                  type: "string",
                  description: "Tag text in lowercase-hyphenated format"
                },
                confidence: { 
                  type: "number",
                  description: "Confidence score 0-100"
                },
                reason: { 
                  type: "string",
                  description: "Brief explanation for this tag"
                }
              }
            },
            minItems: 5,
            maxItems: 8
          }
        }
      }
    });

    // Update document with suggested tags
    await base44.asServiceRole.entities.Document.update(document_id, {
      suggested_tags: tagAnalysis.suggested_tags
    });

    return Response.json({
      success: true,
      suggested_tags: tagAnalysis.suggested_tags
    });

  } catch (error) {
    console.error('Auto-tagging error:', error);
    return Response.json({ 
      error: 'Auto-tagging failed', 
      details: error.message 
    }, { status: 500 });
  }
});