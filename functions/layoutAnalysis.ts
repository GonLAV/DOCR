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

    if (!document || !document.enhanced_file_url) {
      return Response.json({ error: 'Document or enhanced image not found' }, { status: 404 });
    }

    // AI-powered layout analysis
    const layoutAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Perform comprehensive document layout analysis on this image:

Detect and segment:
1. TEXT BLOCKS
   - Paragraphs with reading order
   - Headers and titles
   - Footnotes and captions
   - Column layout (single, multi-column)

2. TABLES
   - Table boundaries
   - Cell structure (rows, columns)
   - Header rows
   - Merged cells

3. IMAGES & GRAPHICS
   - Photos
   - Diagrams
   - Charts and graphs
   - Logos

4. SIGNATURES & STAMPS
   - Handwritten signatures
   - Official stamps/seals
   - Watermarks
   - Annotations

5. HANDWRITING REGIONS
   - Handwritten text blocks
   - Marginal notes
   - Form field entries

6. SPECIAL ELEMENTS
   - Checkboxes (checked/unchecked)
   - Barcodes/QR codes
   - Form fields
   - Underlines/highlights

Provide precise coordinates and reading order for text extraction.`,
      response_json_schema: {
        type: "object",
        properties: {
          document_type: {
            type: "string",
            enum: ["letter", "form", "invoice", "contract", "report", "mixed"]
          },
          layout_structure: {
            type: "object",
            properties: {
              columns: { type: "number" },
              reading_order: { type: "string", enum: ["left-to-right", "right-to-left", "top-to-bottom"] },
              orientation: { type: "string", enum: ["portrait", "landscape"] }
            }
          },
          text_blocks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                block_id: { type: "string" },
                type: { type: "string", enum: ["paragraph", "header", "footer", "caption"] },
                coordinates: { 
                  type: "object",
                  properties: {
                    x: { type: "number" },
                    y: { type: "number" },
                    width: { type: "number" },
                    height: { type: "number" }
                  }
                },
                reading_order: { type: "number" },
                font_size_estimate: { type: "string" },
                alignment: { type: "string" }
              }
            }
          },
          tables: {
            type: "array",
            items: {
              type: "object",
              properties: {
                table_id: { type: "string" },
                coordinates: { type: "object" },
                rows: { type: "number" },
                columns: { type: "number" },
                has_header: { type: "boolean" }
              }
            }
          },
          signatures: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["handwritten", "stamp", "seal"] },
                coordinates: { type: "object" },
                confidence: { type: "number" }
              }
            }
          },
          handwriting_regions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                region_id: { type: "string" },
                coordinates: { type: "object" },
                style: { type: "string", enum: ["cursive", "block", "mixed"] }
              }
            }
          }
        }
      },
      file_urls: document.enhanced_file_url || document.original_file_url
    });

    await base44.asServiceRole.entities.Document.update(document_id, {
      layout_analysis: layoutAnalysis,
      document_class: layoutAnalysis.document_type
    });

    return Response.json({
      success: true,
      layout: layoutAnalysis
    });

  } catch (error) {
    console.error('Layout analysis error:', error);
    return Response.json({ 
      error: 'Layout analysis failed', 
      details: error.message 
    }, { status: 500 });
  }
});