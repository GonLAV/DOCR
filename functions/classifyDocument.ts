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

    // Fetch classification config
    const configs = await base44.entities.DocumentClassificationConfig.list();
    const config = configs[0]; // Use default config

    if (!config) {
      return Response.json({ 
        error: 'No classification config found. Set up document classification first.' 
      }, { status: 400 });
    }

    // Prepare document data for LLM
    const documentContext = {
      title: document.title,
      extracted_text: document.extracted_text?.substring(0, 1000) || "",
      extracted_entities: document.extracted_entities?.slice(0, 10) || [],
      file_type: document.file_type
    };

    // Classify using AI
    const classification = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a document classification expert. Classify the following document into one of these categories:

Available Categories:
${config.categories.map(cat => `- ${cat.name}: ${cat.description}`).join('\n')}

Document Information:
Title: ${documentContext.title}
File Type: ${documentContext.file_type}
Content Preview: ${documentContext.extracted_text}

Based on the document content, determine the most likely category. Provide:
1. The best matching category
2. Confidence score (0-100)
3. Alternative categories ranked by likelihood
4. Key indicators that led to this classification`,
      response_json_schema: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Best matching document category"
          },
          confidence: {
            type: "number",
            description: "Confidence score 0-100"
          },
          alternatives: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                confidence: { type: "number" }
              }
            },
            description: "Alternative categories"
          },
          indicators: {
            type: "array",
            items: { type: "string" },
            description: "Key indicators for classification"
          }
        }
      }
    });

    // Store classification in document
    const classificationData = {
      document_class: classification.category,
      classification_confidence: classification.confidence,
      classification_indicators: classification.indicators,
      alternative_classifications: classification.alternatives
    };

    await base44.asServiceRole.entities.Document.update(document_id, classificationData);

    // Log audit event
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: "document",
      entity_id: document_id,
      action: "update",
      user_email: user.email,
      timestamp: new Date().toISOString(),
      changes: {
        classification: classification.category,
        confidence: classification.confidence
      }
    });

    return Response.json({
      success: true,
      classification: classificationData
    });

  } catch (error) {
    console.error('Classification error:', error);
    return Response.json({ 
      error: 'Classification failed', 
      details: error.message 
    }, { status: 500 });
  }
});