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

Generate a structured summary with ALL of the following sections:
1. overview: A ${config.overview_sentences} high-level overview of the document (shaped by the focus instruction)
2. main_points: Top ${config.entities_count} main points / key findings from the document as short bullet strings
3. key_decisions: Any decisions, agreements, or conclusions documented — empty array if none
4. action_items: Specific tasks, obligations, or next steps that must be taken by any party — empty array if none. Each item should include WHO must act and WHAT they must do if determinable.
5. key_entities: Top ${config.entities_count} most important named fields and their values extracted from the document
6. confidence_summary: Brief explanation of the overall data confidence and reliability
7. anomalies_summary: Description of issues detected, or "None detected" if clean
8. recommendations: ${config.recommendations_count} actionable next steps for the reviewer

Keep the language professional, concise, and suitable for executives or legal reviewers.`,
      response_json_schema: {
        type: "object",
        properties: {
          overview: { 
            type: "string",
            description: "High-level executive overview"
          },
          main_points: {
            type: "array",
            items: { type: "string" },
            description: "Top main points / key findings"
          },
          key_decisions: {
            type: "array",
            items: { type: "string" },
            description: "Decisions, agreements, or conclusions in the document"
          },
          action_items: {
            type: "array",
            items: { type: "string" },
            description: "Specific tasks or obligations that must be actioned"
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
            description: "Top extracted entities as field-value pairs"
          },
          confidence_summary: {
            type: "string",
            description: "Summary of confidence levels and reliability"
          },
          anomalies_summary: {
            type: "string",
            description: "Summary of detected issues or 'None detected'"
          },
          recommendations: {
            type: "array",
            items: { type: "string" },
            description: "Actionable recommendations for the reviewer"
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