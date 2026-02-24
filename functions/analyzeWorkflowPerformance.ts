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

    // Fetch workflow and its executions
    const workflows = await base44.entities.Workflow.list();
    const workflow = workflows.find(w => w.id === workflow_id);

    if (!workflow) {
      return Response.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const allExecutions = await base44.entities.WorkflowExecution.list();
    const executions = allExecutions.filter(e => e.workflow_id === workflow_id);

    // Calculate performance metrics
    const completedExecs = executions.filter(e => e.status === 'completed');
    const failedExecs = executions.filter(e => e.status === 'failed');
    
    const avgDuration = completedExecs.length > 0
      ? completedExecs.reduce((sum, e) => sum + (e.duration_ms || 0), 0) / completedExecs.length
      : 0;

    const successRate = executions.length > 0
      ? (completedExecs.length / executions.length) * 100
      : 0;

    // Analyze step performance
    const stepPerformance = {};
    executions.forEach(exec => {
      if (exec.steps_completed) {
        exec.steps_completed.forEach(step => {
          if (!stepPerformance[step.step_id]) {
            stepPerformance[step.step_id] = {
              durations: [],
              failures: 0,
              successes: 0
            };
          }
          
          const duration = step.completed_at && step.started_at
            ? new Date(step.completed_at) - new Date(step.started_at)
            : 0;
          
          stepPerformance[step.step_id].durations.push(duration);
          
          if (step.status === 'failed') {
            stepPerformance[step.step_id].failures++;
          } else {
            stepPerformance[step.step_id].successes++;
          }
        });
      }
    });

    // Identify bottlenecks
    const bottlenecks = [];
    Object.entries(stepPerformance).forEach(([stepId, data]) => {
      const avgDuration = data.durations.reduce((a, b) => a + b, 0) / data.durations.length;
      const failureRate = data.failures / (data.failures + data.successes);
      
      const step = workflow.steps?.find(s => s.id === stepId);
      
      if (avgDuration > 60000 || failureRate > 0.1) { // > 1 min or > 10% failure
        bottlenecks.push({
          step_id: stepId,
          step_name: step?.name || stepId,
          avg_duration: (avgDuration / 1000).toFixed(1),
          failure_rate: (failureRate * 100).toFixed(1),
          severity: avgDuration > 180000 || failureRate > 0.3 ? 'high' : 
                    avgDuration > 120000 || failureRate > 0.2 ? 'medium' : 'low',
          description: `Step takes ${(avgDuration / 1000).toFixed(1)}s on average with ${(failureRate * 100).toFixed(1)}% failure rate`
        });
      }
    });

    // Use AI to generate recommendations
    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a workflow optimization expert. Analyze this workflow performance data and provide optimization recommendations.

Workflow: ${workflow.name}
Total Executions: ${executions.length}
Success Rate: ${successRate.toFixed(1)}%
Average Duration: ${(avgDuration / 1000).toFixed(1)}s

Identified Bottlenecks:
${bottlenecks.map(b => `- ${b.step_name}: ${b.avg_duration}s average, ${b.failure_rate}% failure rate`).join('\n')}

Provide:
1. 3-5 specific, actionable recommendations to improve workflow performance
2. Predicted delay risk score (0-100) based on current metrics
3. An efficiency score (0-100) for the current workflow

Focus on practical improvements like parallelization, timeout adjustments, error handling, and resource allocation.`,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                impact: { type: "string", enum: ["low", "medium", "high"] },
                effort: { type: "string", enum: ["low", "medium", "high"] }
              }
            }
          },
          predicted_delay_risk: { type: "number" },
          efficiency_score: { type: "number" }
        }
      }
    });

    // Save optimization analysis
    const optimization = await base44.asServiceRole.entities.WorkflowOptimization.create({
      workflow_id,
      analysis_date: new Date().toISOString(),
      bottlenecks,
      recommendations: aiAnalysis.recommendations,
      predicted_delay_risk: aiAnalysis.predicted_delay_risk,
      efficiency_score: aiAnalysis.efficiency_score,
      performance_metrics: {
        total_executions: executions.length,
        success_rate: successRate,
        avg_duration: avgDuration,
        completed_count: completedExecs.length,
        failed_count: failedExecs.length
      }
    });

    return Response.json({
      success: true,
      optimization_id: optimization.id,
      analysis: optimization
    });

  } catch (error) {
    console.error('Workflow analysis error:', error);
    return Response.json({ 
      error: 'Failed to analyze workflow', 
      details: error.message 
    }, { status: 500 });
  }
});