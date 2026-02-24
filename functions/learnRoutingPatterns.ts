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

    // Fetch successful workflow executions
    const allExecutions = await base44.entities.WorkflowExecution.list();
    const successfulExecs = allExecutions.filter(e => 
      e.workflow_id === workflow_id && 
      e.status === 'completed' &&
      new Date(e.created_date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
    );

    if (successfulExecs.length < 5) {
      return Response.json({ 
        error: 'Insufficient data for learning. Need at least 5 successful executions.' 
      }, { status: 400 });
    }

    // Analyze routing patterns
    const routingData = successfulExecs.map(exec => ({
      assigned_to: exec.current_step?.assigned_to || exec.created_by,
      completion_time: exec.duration_ms,
      document_type: exec.document_id,
      steps_completed: exec.steps_completed?.length || 0
    }));

    // Use AI to learn optimal routing patterns
    const aiLearning = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a machine learning system analyzing workflow routing patterns. Based on successful task completions, identify optimal routing rules.

Historical Data (${routingData.length} successful executions):
${JSON.stringify(routingData.slice(0, 20), null, 2)}

Analyze patterns in:
1. Which users complete tasks fastest
2. Which users have highest success rates
3. Task characteristics (document type, complexity) matched with optimal assignees
4. Time-of-day patterns for user productivity

Generate adaptive routing rules that can be automatically applied to future executions.`,
      response_json_schema: {
        type: "object",
        properties: {
          routing_rules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                condition: { type: "string" },
                recommended_assignee: { type: "string" },
                reasoning: { type: "string" },
                confidence: { type: "number" }
              }
            }
          },
          performance_insights: {
            type: "array",
            items: { type: "string" }
          },
          suggested_improvements: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Save learned patterns
    const learning = await base44.asServiceRole.entities.WorkflowLearning.create({
      workflow_id,
      learning_type: "routing_pattern",
      pattern_data: {
        routing_rules: aiLearning.routing_rules,
        performance_insights: aiLearning.performance_insights,
        suggested_improvements: aiLearning.suggested_improvements,
        data_points: routingData.length,
        learned_at: new Date().toISOString()
      },
      confidence_score: aiLearning.routing_rules.reduce((sum, r) => sum + r.confidence, 0) / aiLearning.routing_rules.length,
      success_count: 0,
      is_active: true
    });

    return Response.json({
      success: true,
      learning_id: learning.id,
      routing_rules: aiLearning.routing_rules,
      insights: aiLearning.performance_insights
    });

  } catch (error) {
    console.error('Routing learning error:', error);
    return Response.json({ 
      error: 'Failed to learn routing patterns', 
      details: error.message 
    }, { status: 500 });
  }
});