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

    if (!document || !document.original_file_url) {
      return Response.json({ error: 'Document or file not found' }, { status: 404 });
    }

    // AI-powered damage assessment
    const damageAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this document image for damage and degradation patterns.

Identify and categorize:
1. Physical damage (folds, tears, creases, holes)
2. Stains (water, ink, oil, food, age spots)
3. Text degradation (fading, bleeding, smudging)
4. Image quality issues (blur, noise, low contrast)
5. Environmental damage (moisture, mold, sun exposure)

For each damage type found:
- Specify exact location (regions/coordinates)
- Rate severity (1-10 scale)
- Estimate impact on OCR accuracy
- Suggest restoration approach

Provide a comprehensive damage map suitable for targeted enhancement.`,
      response_json_schema: {
        type: "object",
        properties: {
          damage_regions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                region_id: { type: "string" },
                damage_type: { 
                  type: "string",
                  enum: ["fold", "tear", "stain", "fade", "blur", "noise", "crease", "hole", "moisture", "mold"]
                },
                coordinates: {
                  type: "object",
                  properties: {
                    x: { type: "number" },
                    y: { type: "number" },
                    width: { type: "number" },
                    height: { type: "number" }
                  }
                },
                severity: { 
                  type: "number",
                  description: "1-10 scale, 10 being most severe"
                },
                ocr_impact: {
                  type: "string",
                  enum: ["none", "low", "medium", "high", "critical"]
                },
                restoration_strategy: { type: "string" },
                color_affected: { type: "boolean" }
              }
            }
          },
          overall_condition: {
            type: "string",
            enum: ["excellent", "good", "fair", "poor", "critical"]
          },
          restoration_priority: {
            type: "array",
            items: { type: "string" },
            description: "Ordered list of regions requiring immediate restoration"
          },
          estimated_age: { 
            type: "number",
            description: "Estimated document age in years"
          },
          preservation_urgency: {
            type: "string",
            enum: ["immediate", "high", "medium", "low"]
          },
          recommended_enhancement_techniques: {
            type: "array",
            items: { type: "string" }
          }
        }
      },
      file_urls: document.original_file_url
    });

    // Update document with damage assessment
    await base44.asServiceRole.entities.Document.update(document_id, {
      damage_assessment: {
        overall_condition: damageAnalysis.overall_condition,
        detected_issues: damageAnalysis.damage_regions.map(r => r.damage_type),
        severity: damageAnalysis.preservation_urgency,
        regions: damageAnalysis.damage_regions,
        restoration_priority: damageAnalysis.restoration_priority
      }
    });

    return Response.json({
      success: true,
      damage_analysis: damageAnalysis
    });

  } catch (error) {
    console.error('Damage analysis error:', error);
    return Response.json({ 
      error: 'Damage analysis failed', 
      details: error.message 
    }, { status: 500 });
  }
});