import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workflow_id } = await req.json();

    if (!workflow_id) {
      return Response.json({ error: 'Missing workflow_id' }, { status: 400 });
    }

    // Fetch workflow details
    const workflows = await base44.entities.Workflow.list();
    const workflow = workflows.find(w => w.id === workflow_id);

    if (!workflow) {
      return Response.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Fetch failed executions
    const allExecutions = await base44.entities.WorkflowExecution.list();
    const failedExecs = allExecutions.filter(e => 
      e.workflow_id === workflow_id && 
      e.status === 'failed' &&
      new Date(e.created_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    );

    if (failedExecs.length === 0) {
      return Response.json({
        success: true,
        message: 'No failures to analyze',
        failure_analysis: null
      });
    }

    // Extract failure details
    const failureDetails = failedExecs.map(exec => ({
      execution_id: exec.id,
      error_message: exec.error_message,
      failed_step: exec.current_step,
      steps_completed: exec.steps_completed?.length || 0,
      duration_before_failure: exec.duration_ms,
      created_date: exec.created_date
    }));

    // Use AI for root cause analysis
    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert system analyst performing root cause analysis on workflow failures.

Workflow: ${workflow.name}
Total Failures: ${failedExecs.length}
Workflow Steps: ${JSON.stringify(workflow.steps?.map(s => ({ id: s.id, name: s.name, type: s.type })))}

Failure Details:
${JSON.stringify(failureDetails, null, 2)}

Perform deep root cause analysis:
1. Identify common failure patterns
2. Determine root causes (not just symptoms)
3. Categorize failures by type
4. Provide specific, actionable remediation steps
5. Assess severity and impact
6. Suggest preventive measures

Be technical and precise.`,
      response_json_schema: {
        type: "object",
        properties: {
          root_causes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                cause: { type: "string" },
                affected_step: { type: "string" },
                frequency: { type: "number" },
                severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                explanation: { type: "string" }
              }
            }
          },
          failure_patterns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                pattern: { type: "string" },
                occurrences: { type: "number" },
                impact: { type: "string" }
              }
            }
          },
          remediation_steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
                expected_impact: { type: "string" }
              }
            }
          },
          preventive_measures: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Save failure learning
    await base44.asServiceRole.entities.WorkflowLearning.create({
      workflow_id,
      learning_type: "failure_pattern",
      pattern_data: {
        root_causes: aiAnalysis.root_causes,
        failure_patterns: aiAnalysis.failure_patterns,
        remediation_steps: aiAnalysis.remediation_steps,
        preventive_measures: aiAnalysis.preventive_measures,
        analyzed_failures: failedExecs.length,
        analysis_date: new Date().toISOString()
      },
      confidence_score: 85,
      success_count: 0,
      is_active: true
    });

    return Response.json({
      success: true,
      failure_count: failedExecs.length,
      analysis: aiAnalysis
    });

  } catch (error) {
    console.error('Failure analysis error:', error);
    return Response.json({ 
      error: 'Failed to analyze failures', 
      details: error.message 
    }, { status: 500 });
  }
});