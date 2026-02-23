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

    const documents = await base44.entities.Document.filter({ id: document_id });
    const document = documents[0];

    if (!document) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    // Semantic entity extraction with context awareness
    const semanticExtraction = await base44.integrations.Core.InvokeLLM({
      prompt: `Perform semantic entity extraction on this document:

Document Type: ${document.document_class || 'unknown'}
Extracted Text: ${document.extracted_text || 'No text extracted yet'}
Layout: ${JSON.stringify(document.layout_analysis)}

Extract key entities based on document type:
- Names (people, organizations, locations)
- Dates (transaction, effective, expiry)
- Amounts (monetary, quantities, percentages)
- IDs (account numbers, reference numbers, serial numbers)
- Addresses (physical, email, phone)
- Legal terms (clauses, obligations, rights)

For each entity:
1. Identify the exact value
2. Classify the type precisely
3. Locate in document (coordinates if available)
4. Assess extraction confidence
5. Flag if inferred vs explicitly stated
6. Identify relationships between entities

Also identify:
- Missing expected fields (based on document type)
- Contradictions or inconsistencies
- Unusual patterns that require review`,
      response_json_schema: {
        type: "object",
        properties: {
          entities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                value: { type: "string" },
                type: { 
                  type: "string",
                  enum: ["name", "date", "amount", "id", "address", "phone", "email", "legal_term", "other"]
                },
                confidence: { type: "number" },
                source_region: { type: "string" },
                inferred: { type: "boolean" },
                coordinates: { type: "object" }
              }
            }
          },
          relationships: {
            type: "array",
            items: {
              type: "object",
              properties: {
                entity1: { type: "string" },
                entity2: { type: "string" },
                relationship_type: { type: "string" }
              }
            }
          },
          missing_fields: {
            type: "array",
            items: { type: "string" }
          },
          contradictions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                issue: { type: "string" },
                severity: { type: "string" }
              }
            }
          },
          document_intent: { type: "string" },
          key_dates: {
            type: "array",
            items: { type: "string" }
          },
          parties_involved: {
            type: "array",
            items: { type: "string" }
          }
        }
      },
      file_urls: document.enhanced_file_url || document.original_file_url
    });

    // Calculate overall confidence
    const avgConfidence = semanticExtraction.entities.length > 0
      ? Math.round(semanticExtraction.entities.reduce((sum, e) => sum + e.confidence, 0) / semanticExtraction.entities.length)
      : 0;

    await base44.asServiceRole.entities.Document.update(document_id, {
      extracted_entities: semanticExtraction.entities,
      structured_data: {
        ...document.structured_data,
        semantic_extraction: semanticExtraction
      },
      confidence_score: avgConfidence,
      anomalies: semanticExtraction.contradictions || []
    });

    return Response.json({
      success: true,
      extraction: semanticExtraction,
      overall_confidence: avgConfidence
    });

  } catch (error) {
    console.error('Semantic extraction error:', error);
    return Response.json({ 
      error: 'Semantic extraction failed', 
      details: error.message 
    }, { status: 500 });
  }
});