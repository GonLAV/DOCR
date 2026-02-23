import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { document_id, image_url } = await req.json();

    if (!document_id || !image_url) {
      return Response.json({ error: 'Missing document_id or image_url' }, { status: 400 });
    }

    // Use Vision LLM to detect and recognize handwriting regions
    const handwritingAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this document image and identify all handwriting regions. For each region:
1. Detect the bounding box coordinates (x, y, width, height as percentages of image dimensions)
2. Classify the handwriting style: cursive, block letters, mixed, or signature
3. Convert the handwriting to text
4. Estimate confidence (0-100) based on legibility
5. Determine if it's a marginal annotation/note
6. Identify ink color (blue, black, red, etc.)

Return a JSON array with this structure for each handwriting region found.`,
      file_urls: [image_url],
      response_json_schema: {
        type: "object",
        properties: {
          regions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                coordinates: {
                  type: "object",
                  properties: {
                    x: { type: "number" },
                    y: { type: "number" },
                    width: { type: "number" },
                    height: { type: "number" }
                  }
                },
                style: { 
                  type: "string",
                  enum: ["cursive", "block", "mixed", "signature"]
                },
                recognized_text: { type: "string" },
                confidence: { type: "number" },
                is_annotation: { type: "boolean" },
                ink_color: { type: "string" }
              }
            }
          },
          total_handwriting_regions: { type: "number" },
          average_confidence: { type: "number" }
        }
      }
    });

    // Add unique IDs and pressure map simulation
    const enrichedRegions = handwritingAnalysis.regions.map((region, index) => ({
      id: `hw_${document_id}_${index}_${Date.now()}`,
      ...region,
      pressure_map: generatePressureMap(region.style)
    }));

    // Update document with handwriting regions
    await base44.asServiceRole.entities.Document.update(document_id, {
      handwriting_regions: enrichedRegions
    });

    return Response.json({
      success: true,
      regions: enrichedRegions,
      stats: {
        total_regions: handwritingAnalysis.total_handwriting_regions,
        average_confidence: handwritingAnalysis.average_confidence,
        styles_detected: [...new Set(enrichedRegions.map(r => r.style))]
      }
    });

  } catch (error) {
    console.error('Handwriting recognition error:', error);
    return Response.json({ 
      error: 'Handwriting recognition failed', 
      details: error.message 
    }, { status: 500 });
  }
});

// Simulate pressure map based on handwriting style
function generatePressureMap(style) {
  const length = style === 'signature' ? 50 : 30;
  const baseValue = style === 'cursive' ? 0.6 : 0.8;
  const variance = style === 'signature' ? 0.3 : 0.15;
  
  return Array.from({ length }, () => 
    Math.max(0.1, Math.min(1.0, baseValue + (Math.random() - 0.5) * variance))
  );
}