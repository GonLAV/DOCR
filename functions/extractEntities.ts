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

    if (!document.document_class) {
      return Response.json({ 
        error: 'Document must be classified first' 
      }, { status: 400 });
    }

    // Fetch extraction template for document type
    const templates = await base44.entities.EntityExtractionTemplate.list();
    const template = templates.find(t => t.document_type === document.document_class);

    if (!template) {
      return Response.json({ 
        error: `No extraction template found for document type: ${document.document_class}` 
      }, { status: 400 });
    }

    // Build extraction prompt with field specifications
    const fieldDescriptions = template.fields.map(field => {
      const critical = field.business_critical ? " [CRITICAL]" : "";
      return `- ${field.field_name} (${field.data_type})${critical}: ${field.description}`;
    }).join('\n');

    // Extract entities using AI
    const extraction = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert data extraction specialist. Extract the following fields from the document content. Return only the specified fields with their values and confidence scores.

Document Content:
${document.extracted_text?.substring(0, 2000) || ""}

Fields to Extract:
${fieldDescriptions}

Instructions: ${template.instructions || 'Extract accurate values for each field based on the document content.'}

For each field, provide the extracted value, its confidence (0-100), and the source location in the document.`,
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
                confidence: { type: "number" },
                source_region: { type: "string" },
                data_type: { type: "string" }
              }
            },
            description: "Extracted entities"
          },
          critical_fields_status: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                found: { type: "boolean" },
                confidence: { type: "number" }
              }
            },
            description: "Status of critical fields"
          }
        }
      }
    });

    // Update document with extracted entities
    const enrichedEntities = extraction.entities.map(entity => ({
      ...entity,
      inferred: entity.confidence < 70
    }));

    await base44.asServiceRole.entities.Document.update(document_id, {
      extracted_entities: enrichedEntities
    });

    // Log audit event
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: "document",
      entity_id: document_id,
      action: "update",
      user_email: user.email,
      timestamp: new Date().toISOString(),
      changes: {
        entities_extracted: enrichedEntities.length,
        critical_fields: extraction.critical_fields_status
      }
    });

    return Response.json({
      success: true,
      extracted_entities: enrichedEntities,
      critical_fields_status: extraction.critical_fields_status
    });

  } catch (error) {
    console.error('Entity extraction error:', error);
    return Response.json({ 
      error: 'Entity extraction failed', 
      details: error.message 
    }, { status: 500 });
  }
});