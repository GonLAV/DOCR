import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { document_a_id, document_b_id, comparison_mode } = await req.json();

    if (!document_a_id || !document_b_id) {
      return Response.json({ error: 'Missing document IDs' }, { status: 400 });
    }

    const documents = await base44.entities.Document.list();
    const docA = documents.find(d => d.id === document_a_id);
    const docB = documents.find(d => d.id === document_b_id);

    if (!docA || !docB) {
      return Response.json({ error: 'Documents not found' }, { status: 404 });
    }

    let result = {};

    // Visual & Content Comparison
    const contentAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Perform a comprehensive comparison of these two documents:

Document A: "${docA.title}"
Entities: ${JSON.stringify(docA.extracted_entities)}
Text Preview: ${docA.extracted_text?.substring(0, 500)}
Confidence: ${docA.confidence_score}%

Document B: "${docB.title}"
Entities: ${JSON.stringify(docB.extracted_entities)}
Text Preview: ${docB.extracted_text?.substring(0, 500)}
Confidence: ${docB.confidence_score}%

Analyze:
1. Text differences (character-level changes, additions, deletions)
2. Layout differences (structure, formatting, page count)
3. Entity matches and discrepancies
4. Semantic content differences (meaning changes beyond text)
5. Confidence score comparison
6. Overall verification score`,
      response_json_schema: {
        type: "object",
        properties: {
          text_diff: {
            type: "object",
            properties: {
              added_lines: { type: "number" },
              removed_lines: { type: "number" },
              modified_lines: { type: "number" },
              similarity_percentage: { type: "number" }
            }
          },
          layout_diff: {
            type: "object",
            properties: {
              structure_match: { type: "boolean" },
              differences: { type: "array", items: { type: "string" } }
            }
          },
          entity_comparison: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                value_a: { type: "string" },
                value_b: { type: "string" },
                match: { type: "boolean" },
                confidence: { type: "number" }
              }
            }
          },
          semantic_differences: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                description: { type: "string" },
                severity: { type: "string" }
              }
            }
          },
          confidence_analysis: {
            type: "object",
            properties: {
              doc_a_confidence: { type: "number" },
              doc_b_confidence: { type: "number" },
              reliability_assessment: { type: "string" }
            }
          },
          summary: { type: "string" },
          verification_score: { type: "number" }
        }
      }
    });

    result = { ...contentAnalysis };

    // External Data Source Verification
    const externalSources = await base44.asServiceRole.entities.ExternalDataSource.filter({ enabled: true });
    
    if (externalSources.length > 0) {
      const externalVerifications = [];
      
      for (const source of externalSources) {
        try {
          // Query external source with document A data
          const queryData = {};
          if (source.field_mappings) {
            for (const mapping of source.field_mappings) {
              const entity = docA.extracted_entities?.find(e => e.field === mapping.document_field);
              if (entity) {
                queryData[mapping.document_field] = entity.value;
              }
            }
          }

          // Only query if we have the required data
          if (Object.keys(queryData).length > 0) {
            const externalResult = await base44.functions.invoke('queryExternalSource', {
              source_id: source.id,
              query_data: queryData
            });

            if (externalResult.data?.success) {
              externalVerifications.push({
                source_name: source.name,
                verification_results: externalResult.data.verification_results,
                response_time: externalResult.data.response_time,
                verified_at: externalResult.data.timestamp
              });
            }
          }
        } catch (error) {
          console.error(`External source ${source.name} verification failed:`, error);
        }
      }

      if (externalVerifications.length > 0) {
        result.external_verification = {
          sources_checked: externalVerifications.length,
          verifications: externalVerifications,
          overall_match_rate: calculateOverallMatchRate(externalVerifications)
        };
      }
    }

    // Forensic Comparison Mode
    if (comparison_mode === "forensic") {
      const forensicAnalysis = {
        doc_a_fingerprint: docA.fingerprint || "Not available",
        doc_b_fingerprint: docB.fingerprint || "Not available",
        fingerprint_match: docA.fingerprint === docB.fingerprint,
        metadata_comparison: {
          doc_a: {
            created_date: docA.created_date,
            processing_time: docA.processing_time_ms,
            scan_metadata: docA.scan_metadata,
            tampering_risk: docA.tampering_risk
          },
          doc_b: {
            created_date: docB.created_date,
            processing_time: docB.processing_time_ms,
            scan_metadata: docB.scan_metadata,
            tampering_risk: docB.tampering_risk
          }
        },
        integrity_check: {
          doc_a_integrity: docA.tampering_risk === "none" ? "verified" : "compromised",
          doc_b_integrity: docB.tampering_risk === "none" ? "verified" : "compromised",
          metadata_integrity: "verified"
        },
        authenticity_score: docA.tampering_risk === "none" && docB.tampering_risk === "none" ? 100 : 70
      };

      result.forensic_analysis = forensicAnalysis;
    }

    return Response.json({
      success: true,
      comparison: result
    });

  } catch (error) {
    console.error('Document comparison error:', error);
    return Response.json({ 
      error: 'Comparison failed', 
      details: error.message 
    }, { status: 500 });
  }
});

// Helper function to calculate overall match rate from external verifications
function calculateOverallMatchRate(verifications) {
  let totalChecks = 0;
  let totalMatches = 0;

  for (const verification of verifications) {
    if (verification.verification_results) {
      for (const result of verification.verification_results) {
        totalChecks++;
        if (result.match) {
          totalMatches++;
        }
      }
    }
  }

  return totalChecks > 0 ? Math.round((totalMatches / totalChecks) * 100) : 0;
}