import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { document_id, length = "medium", focus = "general" } = await req.json();

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

    // Define prompts based on length
    const lengthConfig = {
      short: {
        overview_sentences: "1-2 sentences",
        entities_count: 3,
        recommendations_count: 2,
        detail_level: "brief and high-level"
      },
      medium: {
        overview_sentences: "2-3 sentences",
        entities_count: 5,
        recommendations_count: 3,
        detail_level: "concise yet comprehensive"
      },
      detailed: {
        overview_sentences: "3-4 sentences with context",
        entities_count: 7,
        recommendations_count: 5,
        detail_level: "detailed and thorough"
      }
    };

    const config = lengthConfig[length] || lengthConfig.medium;

    const focusInstructions = {
      general: "Cover all aspects of the document holistically.",
      key_findings: "Focus primarily on the key findings, conclusions, and critical facts extracted from the document. Emphasize what was discovered or determined.",
      action_items: "Focus primarily on required actions, next steps, deadlines, obligations, and tasks that need to be completed by any party.",
      financial_data: "Focus primarily on financial figures, amounts, costs, payments, revenue, budgets, and any monetary data found in the document.",
      risks: "Focus primarily on risks, anomalies, issues, warnings, compliance concerns, and anything that requires attention or poses a potential problem.",
      entities_people: "Focus primarily on the people, organizations, dates, locations, and named entities involved in this document."
    };

    const focusText = focusInstructions[focus] || focusInstructions.general;

    // Generate summary using AI
    const summary = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert document analyst. Generate a ${config.detail_level} executive summary for the following processed document.

Focus instruction: ${focusText}

Document Data:
${JSON.stringify(documentContext, null, 2)}

Generate a summary that includes:
1. A ${config.overview_sentences} overview of the document (shaped by the focus instruction above)
2. Key entities (top ${config.entities_count} most important extracted fields, prioritized by the focus)
3. Confidence level summary (explain the overall confidence and any concerns)
4. Anomalies summary (if any issues were detected, explain them clearly; "N/A" if none)
5. Recommendations (${config.recommendations_count} actionable next steps relevant to the focus area)

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