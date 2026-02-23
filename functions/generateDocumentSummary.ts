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

    // Prepare document data for LLM
    const documentContext = {
      title: document.title,
      document_class: document.document_class,
      confidence_score: document.confidence_score,
      extracted_entities: document.extracted_entities || [],
      anomalies: document.anomalies || [],
      tampering_risk: document.tampering_risk,
      handwriting_regions: document.handwriting_regions?.length || 0,
      extracted_text_preview: document.extracted_text?.substring(0, 500)
    };

    // Generate summary using AI
    const summary = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert document analyst. Generate a concise executive summary for the following processed document.

Document Data:
${JSON.stringify(documentContext, null, 2)}

Generate a comprehensive but concise summary that includes:
1. A brief 2-3 sentence overview of the document
2. Key entities (top 5 most important extracted fields)
3. Confidence level summary (explain the overall confidence and any concerns)
4. Anomalies summary (if any issues were detected, explain them clearly)
5. Recommendations (2-3 actionable next steps or items needing attention)

Keep the language professional, clear, and suitable for executives or legal reviewers.`,
      response_json_schema: {
        type: "object",
        properties: {
          overview: { 
            type: "string",
            description: "2-3 sentence executive summary"
          },
          key_entities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                value: { type: "string" }
              }
            },
            description: "Top 5 most important extracted entities"
          },
          confidence_summary: {
            type: "string",
            description: "Summary of confidence levels and reliability"
          },
          anomalies_summary: {
            type: "string",
            description: "Summary of issues or N/A if none"
          },
          recommendations: {
            type: "array",
            items: { type: "string" },
            description: "2-3 actionable recommendations"
          }
        }
      }
    });

    // Add timestamp
    const aiSummary = {
      ...summary,
      generated_at: new Date().toISOString()
    };

    // Update document with summary
    await base44.asServiceRole.entities.Document.update(document_id, {
      ai_summary: aiSummary
    });

    return Response.json({
      success: true,
      summary: aiSummary
    });

  } catch (error) {
    console.error('Summary generation error:', error);
    return Response.json({ 
      error: 'Summary generation failed', 
      details: error.message 
    }, { status: 500 });
  }
});