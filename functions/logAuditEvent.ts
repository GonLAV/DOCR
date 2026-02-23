import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      entity_type, 
      entity_id, 
      action, 
      changes = {}, 
      metadata = {},
      status = "success"
    } = await req.json();

    if (!entity_type || !entity_id || !action) {
      return Response.json({ 
        error: 'Missing required fields: entity_type, entity_id, action' 
      }, { status: 400 });
    }

    // Create audit log entry
    const auditLog = await base44.asServiceRole.entities.AuditLog.create({
      entity_type,
      entity_id,
      action,
      user_email: user.email,
      timestamp: new Date().toISOString(),
      changes,
      metadata: {
        ...metadata,
        user_name: user.full_name || user.email,
        user_role: user.role
      },
      status
    });

    return Response.json({
      success: true,
      audit_log_id: auditLog.id
    });

  } catch (error) {
    console.error('Audit log creation error:', error);
    return Response.json({ 
      error: 'Failed to create audit log', 
      details: error.message 
    }, { status: 500 });
  }
});