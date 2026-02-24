import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { execution_id, action } = await req.json();

    if (!execution_id || !action) {
      return Response.json({ 
        error: 'Missing required fields: execution_id, action' 
      }, { status: 400 });
    }

    if (!['pause', 'resume', 'cancel'].includes(action)) {
      return Response.json({ 
        error: 'Invalid action. Must be: pause, resume, or cancel' 
      }, { status: 400 });
    }

    // Fetch execution
    const executions = await base44.entities.WorkflowExecution.list();
    const execution = executions.find(e => e.id === execution_id);

    if (!execution) {
      return Response.json({ error: 'Execution not found' }, { status: 404 });
    }

    // Apply control action
    let newStatus = execution.status;
    let updateData = {};

    switch (action) {
      case 'pause':
        if (execution.status !== 'running') {
          return Response.json({ 
            error: 'Can only pause running executions' 
          }, { status: 400 });
        }
        newStatus = 'pending';
        updateData = { status: 'pending' };
        break;

      case 'resume':
        if (execution.status !== 'pending') {
          return Response.json({ 
            error: 'Can only resume pending executions' 
          }, { status: 400 });
        }
        newStatus = 'running';
        updateData = { 
          status: 'running',
          started_at: new Date().toISOString()
        };
        break;

      case 'cancel':
        if (!['running', 'pending'].includes(execution.status)) {
          return Response.json({ 
            error: 'Can only cancel running or pending executions' 
          }, { status: 400 });
        }
        newStatus = 'cancelled';
        updateData = { 
          status: 'cancelled',
          completed_at: new Date().toISOString(),
          error_message: 'Cancelled by user'
        };
        break;
    }

    // Update execution
    await base44.asServiceRole.entities.WorkflowExecution.update(
      execution_id, 
      updateData
    );

    // Log audit event
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: "workflow",
      entity_id: execution.workflow_id,
      action: "execute",
      user_email: user.email,
      timestamp: new Date().toISOString(),
      changes: {
        execution_id,
        control_action: action,
        previous_status: execution.status,
        new_status: newStatus
      }
    });

    return Response.json({
      success: true,
      execution_id,
      action,
      new_status: newStatus
    });

  } catch (error) {
    console.error('Workflow control error:', error);
    return Response.json({ 
      error: 'Failed to control workflow execution', 
      details: error.message 
    }, { status: 500 });
  }
});