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

    // Simulate multi-model OCR consensus
    // In production, this would call ABBYY, Google Vision, Azure Form Recognizer
    const consensus = await base44.integrations.Core.InvokeLLM({
      prompt: `Perform multi-model OCR consensus analysis on this document image.

Simulate 3 OCR models with different characteristics:
1. Conservative Model (ABBYY-style): High precision, may miss degraded text
2. Balanced Model (Google Vision-style): Good balance, context-aware
3. Aggressive Model (Azure-style): Attempts reconstruction, may hallucinate

Document Image: ${document.original_file_url}

For each text region detected, provide:
- The consensus text (voted result)
- Character-level confidence (0-100)
- Model agreement level
- Disagreement regions (where models differ)
- Hallucination risk score

Return detailed consensus analysis with character-by-character confidence mapping.`,
      response_json_schema: {
        type: "object",
        properties: {
          consensus_text: {
            type: "string",
            description: "Final agreed-upon text"
          },
          character_confidence_map: {
            type: "array",
            items: {
              type: "object",
              properties: {
                char: { type: "string" },
                position: { type: "number" },
                confidence: { type: "number" },
                agreed_by_models: { type: "number" }
              }
            }
          },
          model_results: {
            type: "array",
            items: {
              type: "object",
              properties: {
                model_name: { type: "string" },
                extracted_text: { type: "string" },
                confidence: { type: "number" }
              }
            }
          },
          disagreements: {
            type: "array",
            items: {
              type: "object",
              properties: {
                region: { type: "string" },
                conservative_read: { type: "string" },
                balanced_read: { type: "string" },
                aggressive_read: { type: "string" },
                risk_level: { type: "string" }
              }
            }
          },
          overall_consensus_score: { type: "number" },
          hallucination_risk: { type: "number" },
          reconstruction_percentage: { type: "number" }
        }
      },
      file_urls: document.original_file_url,
      add_context_from_internet: false
    });

    // Update document with consensus data
    await base44.asServiceRole.entities.Document.update(document_id, {
      extracted_text: consensus.consensus_text,
      structured_data: {
        ...document.structured_data,
        ocr_consensus: consensus,
        consensus_metadata: {
          overall_score: consensus.overall_consensus_score,
          hallucination_risk: consensus.hallucination_risk,
          reconstruction_pct: consensus.reconstruction_percentage
        }
      }
    });

    return Response.json({
      success: true,
      consensus
    });

  } catch (error) {
    console.error('Multi-model consensus error:', error);
    return Response.json({ 
      error: 'Consensus analysis failed', 
      details: error.message 
    }, { status: 500 });
  }
});