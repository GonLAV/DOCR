import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workflow_id, document_id } = await req.json();

    if (!workflow_id || !document_id) {
      return Response.json({ 
        error: 'Missing workflow_id or document_id' 
      }, { status: 400 });
    }

    // Fetch workflow definition
    const workflows = await base44.entities.Workflow.list();
    const workflow = workflows.find(w => w.id === workflow_id);

    if (!workflow) {
      return Response.json({ error: 'Workflow not found' }, { status: 404 });
    }

    if (!workflow.enabled) {
      return Response.json({ error: 'Workflow is disabled' }, { status: 400 });
    }

    // Fetch document
    const documents = await base44.entities.Document.list();
    const document = documents.find(d => d.id === document_id);

    if (!document) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    // Create execution record
    const execution = await base44.asServiceRole.entities.WorkflowExecution.create({
      workflow_id,
      document_id,
      status: "running",
      started_at: new Date().toISOString(),
      steps_completed: []
    });

    // Execute workflow steps
    const steps_completed = [];
    let currentStep = null;

    try {
      for (const step of workflow.steps) {
        const stepStart = new Date();
        currentStep = step.id;

        // Update execution status
        await base44.asServiceRole.entities.WorkflowExecution.update(execution.id, {
          current_step: step.id
        });

        // Check step conditions
        if (step.conditions && step.conditions.length > 0) {
          const conditionsMet = step.conditions.every(condition => {
            const fieldValue = document[condition.field];
            
            switch (condition.operator) {
              case "equals":
                return fieldValue == condition.value;
              case "not_equals":
                return fieldValue != condition.value;
              case "greater_than":
                return Number(fieldValue) > Number(condition.value);
              case "less_than":
                return Number(fieldValue) < Number(condition.value);
              case "contains":
                return String(fieldValue).includes(condition.value);
              default:
                return true;
            }
          });

          if (!conditionsMet) {
            steps_completed.push({
              step_id: step.id,
              status: "skipped",
              result: { reason: "Conditions not met" },
              started_at: stepStart.toISOString(),
              completed_at: new Date().toISOString()
            });
            continue;
          }
        }

        // Execute step based on type
        let stepResult = {};
        
        switch (step.type) {
          case "processing":
            // Run document processing
            stepResult = { processed: true };
            break;
            
          case "validation":
            // Validate document
            stepResult = { 
              validated: true,
              confidence: document.confidence_score 
            };
            break;
            
          case "routing":
            // Route to user/team
            stepResult = { routed_to: step.config?.assignee || "admin" };
            break;
            
          case "notification":
            // Send notification (would integrate with email service)
            stepResult = { 
              notification_sent: true,
              recipient: step.config?.recipient || user.email 
            };
            break;
            
          case "conditional":
            // Conditional logic already handled above
            stepResult = { condition_evaluated: true };
            break;
            
          case "approval":
            // Create approval request
            stepResult = { 
              approval_required: true,
              approver: step.config?.approver 
            };
            break;
        }

        steps_completed.push({
          step_id: step.id,
          status: "completed",
          result: stepResult,
          started_at: stepStart.toISOString(),
          completed_at: new Date().toISOString()
        });
      }

      // Execute completion actions
      for (const action of workflow.actions || []) {
        switch (action.type) {
          case "email":
            // Send email notification
            await base44.integrations.Core.SendEmail({
              to: action.config?.recipient || user.email,
              subject: `Workflow Completed: ${workflow.name}`,
              body: `Document "${document.title}" has completed the workflow "${workflow.name}".`
            });
            break;
            
          case "update_field":
            // Update document field
            if (action.config?.field && action.config?.value) {
              await base44.asServiceRole.entities.Document.update(document_id, {
                [action.config.field]: action.config.value
              });
            }
            break;
            
          case "route_to_user":
            // Route document to specific user
            await base44.asServiceRole.entities.Document.update(document_id, {
              assigned_to: action.config?.user_email
            });
            break;
        }
      }

      // Complete execution
      const completedAt = new Date();
      const duration = completedAt - new Date(execution.started_at);
      
      await base44.asServiceRole.entities.WorkflowExecution.update(execution.id, {
        status: "completed",
        steps_completed,
        completed_at: completedAt.toISOString(),
        duration_ms: duration
      });

      // Update workflow execution count
      await base44.asServiceRole.entities.Workflow.update(workflow_id, {
        execution_count: (workflow.execution_count || 0) + 1,
        last_execution: completedAt.toISOString()
      });

      return Response.json({
        success: true,
        execution_id: execution.id,
        steps_completed: steps_completed.length,
        duration_ms: duration
      });

    } catch (stepError) {
      // Handle step failure
      await base44.asServiceRole.entities.WorkflowExecution.update(execution.id, {
        status: "failed",
        error_message: stepError.message,
        current_step: currentStep,
        steps_completed,
        completed_at: new Date().toISOString()
      });

      return Response.json({
        success: false,
        error: 'Workflow execution failed',
        details: stepError.message,
        failed_at_step: currentStep
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Workflow execution error:', error);
    return Response.json({ 
      error: 'Workflow execution failed', 
      details: error.message 
    }, { status: 500 });
  }
});