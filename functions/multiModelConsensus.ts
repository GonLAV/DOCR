import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Multi-Model OCR Consensus Engine
 * 
 * Runs multiple OCR models in parallel, compares results, and generates
 * pixel-level confidence maps based on model agreement.
 * 
 * Strategy:
 * 1. Run 3+ OCR engines (simulated with LLM vision analysis)
 * 2. Character-level alignment and comparison
 * 3. Disagreement detection and confidence scoring
 * 4. Hallucination prevention through consensus voting
 * 5. Return consensus text + confidence map + disagreement regions
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { document_id, file_url } = await req.json();

    if (!file_url) {
      return Response.json({ error: 'file_url required' }, { status: 400 });
    }

    // Simulate multiple OCR models with different analysis strategies
    const modelConfigs = [
      {
        name: "Model_A_Conservative",
        prompt: "Extract text from this document with extreme conservatism. Only extract text you can see clearly. Mark uncertain regions as [UNCLEAR]. Return character-by-character with coordinates."
      },
      {
        name: "Model_B_Aggressive", 
        prompt: "Extract text from this document using context and inference. Reconstruct faded or damaged text. Return character-by-character with coordinates."
      },
      {
        name: "Model_C_Balanced",
        prompt: "Extract text from this document with balanced confidence. Use context to help with unclear characters but mark reconstructed content. Return character-by-character with coordinates."
      }
    ];

    // Run all models in parallel
    const modelResults = await Promise.all(
      modelConfigs.map(async (config) => {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `${config.prompt}

For each extracted text region, provide:
1. The text content
2. Confidence level (0-100) per character
3. Whether each character was: clearly_visible, partially_degraded, inferred, or unclear
4. Approximate coordinates if possible

Be extremely detailed and honest about uncertainty.`,
          file_urls: [file_url],
          response_json_schema: {
            type: "object",
            properties: {
              extracted_text: { type: "string" },
              character_analysis: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    char: { type: "string" },
                    confidence: { type: "number" },
                    status: { type: "string" },
                    position: { type: "number" }
                  }
                }
              },
              reconstructed_regions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: { type: "string" },
                    reason: { type: "string" }
                  }
                }
              }
            }
          }
        });

        return {
          model: config.name,
          ...result
        };
      })
    );

    // Compute consensus
    const consensusAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a consensus arbiter for multiple OCR model outputs.

Model outputs:
${JSON.stringify(modelResults, null, 2)}

Your task:
1. Create a consensus text by comparing all models character-by-character
2. For each character/word, calculate agreement level (0-100)
3. Identify disagreement regions where models differ significantly
4. Flag potential hallucinations (where aggressive model added content not in conservative model)
5. Calculate pixel-level confidence based on model agreement
6. Detect impossible or contradictory values

Return a court-grade analysis with full transparency.`,
      response_json_schema: {
        type: "object",
        properties: {
          consensus_text: { type: "string" },
          consensus_confidence: { type: "number" },
          character_confidence_map: {
            type: "array",
            items: {
              type: "object",
              properties: {
                char: { type: "string" },
                position: { type: "number" },
                confidence: { type: "number" },
                model_agreement: { type: "number" },
                status: { type: "string" }
              }
            }
          },
          disagreement_regions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                position: { type: "string" },
                models: {
                  type: "object",
                  properties: {
                    model_a: { type: "string" },
                    model_b: { type: "string" },
                    model_c: { type: "string" }
                  }
                },
                severity: { type: "string" },
                recommendation: { type: "string" }
              }
            }
          },
          hallucination_risks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                reason: { type: "string" },
                confidence_aggressive: { type: "number" },
                confidence_conservative: { type: "number" }
              }
            }
          },
          reconstruction_transparency: {
            type: "object",
            properties: {
              total_characters: { type: "number" },
              clearly_visible: { type: "number" },
              partially_degraded: { type: "number" },
              inferred: { type: "number" },
              uncertain: { type: "number" }
            }
          },
          trust_indicators: {
            type: "object",
            properties: {
              model_consensus_score: { type: "number" },
              hallucination_risk_score: { type: "number" },
              reconstruction_percentage: { type: "number" },
              requires_human_review: { type: "boolean" }
            }
          }
        }
      }
    });

    // Update document with consensus results
    if (document_id) {
      await base44.asServiceRole.entities.Document.update(document_id, {
        extracted_text: consensusAnalysis.consensus_text,
        confidence_score: consensusAnalysis.consensus_confidence,
        structured_data: {
          ...consensusAnalysis,
          model_results: modelResults
        }
      });

      // Create trust score
      await base44.asServiceRole.entities.TrustScore.create({
        document_id,
        overall_trust: consensusAnalysis.consensus_confidence,
        extraction_certainty: consensusAnalysis.consensus_confidence,
        reconstruction_risk: consensusAnalysis.reconstruction_transparency?.reconstruction_percentage || 0,
        model_consensus_score: consensusAnalysis.trust_indicators?.model_consensus_score || 0,
        pixel_quality_score: consensusAnalysis.consensus_confidence,
        high_risk_fields: consensusAnalysis.disagreement_regions?.map(r => r.position) || [],
        court_ready: consensusAnalysis.consensus_confidence >= 95 && 
                     (consensusAnalysis.reconstruction_transparency?.reconstruction_percentage || 0) < 10,
        bank_ready: consensusAnalysis.consensus_confidence >= 98 &&
                    (consensusAnalysis.reconstruction_transparency?.reconstruction_percentage || 0) < 5,
        trust_factors: consensusAnalysis.trust_indicators,
        recommended_action: consensusAnalysis.consensus_confidence >= 95 ? "approve" :
                           consensusAnalysis.consensus_confidence >= 80 ? "review_flagged_fields" :
                           consensusAnalysis.consensus_confidence >= 60 ? "manual_review" : "reject"
      });
    }

    return Response.json({
      success: true,
      consensus: consensusAnalysis,
      model_results: modelResults
    });

  } catch (error) {
    console.error('Multi-model consensus error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});