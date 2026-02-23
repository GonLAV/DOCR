import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { document_id, change_type, change_description } = await req.json();

    if (!document_id || !change_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch document and existing versions
    const documents = await base44.entities.Document.list();
    const document = documents.find(d => d.id === document_id);

    if (!document) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    const existingVersions = await base44.asServiceRole.entities.DocumentVersion.filter({ 
      document_id 
    });
    
    const nextVersion = (existingVersions.length > 0 
      ? Math.max(...existingVersions.map(v => v.version_number)) 
      : 0) + 1;

    // Get annotations and comments for diff summary
    const annotations = await base44.entities.DocumentAnnotation.filter({ document_id });
    const comments = await base44.entities.DocumentComment.filter({ document_id });

    // Create version snapshot
    const version = await base44.asServiceRole.entities.DocumentVersion.create({
      document_id,
      version_number: nextVersion,
      changed_by: user.email,
      change_type,
      change_description: change_description || `${change_type} by ${user.full_name || user.email}`,
      snapshot: {
        title: document.title,
        status: document.status,
        confidence_score: document.confidence_score,
        tags: document.tags
      },
      diff_summary: {
        fields_changed: [],
        annotations_added: annotations.length,
        comments_added: comments.length
      }
    });

    return Response.json({
      success: true,
      version
    });

  } catch (error) {
    console.error('Version creation error:', error);
    return Response.json({ 
      error: 'Version creation failed', 
      details: error.message 
    }, { status: 500 });
  }
});