import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workflow_id, step_id } = await req.json();

    if (!workflow_id) {
      return Response.json({ error: 'Missing workflow_id' }, { status: 400 });
    }

    // Fetch all users
    const users = await base44.asServiceRole.entities.User.list();
    
    // Fetch recent workflow executions to analyze workload
    const executions = await base44.entities.WorkflowExecution.list("-created_date", 100);
    const recentExecutions = executions.filter(e => 
      ['running', 'pending'].includes(e.status) &&
      new Date(e.created_date) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24h
    );

    // Calculate user workload
    const userWorkload = {};
    users.forEach(u => {
      userWorkload[u.email] = {
        active_tasks: 0,
        recent_completions: 0,
        avg_completion_time: 0,
        success_rate: 0
      };
    });

    // Analyze workload distribution
    recentExecutions.forEach(exec => {
      const assignedUser = exec.current_step?.assigned_to || exec.created_by;
      if (assignedUser && userWorkload[assignedUser]) {
        userWorkload[assignedUser].active_tasks++;
      }
    });

    // Get historical performance
    const completedExecutions = executions.filter(e => e.status === 'completed');
    completedExecutions.forEach(exec => {
      const assignedUser = exec.created_by;
      if (assignedUser && userWorkload[assignedUser]) {
        userWorkload[assignedUser].recent_completions++;
      }
    });

    // Use AI to determine optimal routing
    const aiRouting = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a task routing optimizer. Analyze user workload data and recommend the best user to assign the next workflow task to.

Current Workload Distribution:
${Object.entries(userWorkload).map(([email, data]) => 
  `${email}: ${data.active_tasks} active tasks, ${data.recent_completions} recent completions`
).join('\n')}

Criteria:
- Minimize workload imbalance
- Prioritize users with lower active task counts
- Consider recent completion history
- Ensure fair distribution

Provide the recommended user email and reasoning.`,
      response_json_schema: {
        type: "object",
        properties: {
          recommended_user: { type: "string" },
          reasoning: { type: "string" },
          confidence: { type: "number" },
          alternative_users: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json({
      success: true,
      routing: {
        recommended_user: aiRouting.recommended_user,
        reasoning: aiRouting.reasoning,
        confidence: aiRouting.confidence,
        alternative_users: aiRouting.alternative_users,
        workload_snapshot: userWorkload
      }
    });

  } catch (error) {
    console.error('Task routing error:', error);
    return Response.json({ 
      error: 'Failed to optimize routing', 
      details: error.message 
    }, { status: 500 });
  }
});