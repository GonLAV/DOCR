import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workflow_id, forecast_days = 7 } = await req.json();

    if (!workflow_id) {
      return Response.json({ error: 'Missing workflow_id' }, { status: 400 });
    }

    // Fetch historical execution data
    const allExecutions = await base44.entities.WorkflowExecution.list();
    const historicalExecs = allExecutions.filter(e => e.workflow_id === workflow_id);

    if (historicalExecs.length < 10) {
      return Response.json({ 
        error: 'Insufficient historical data. Need at least 10 executions for prediction.' 
      }, { status: 400 });
    }

    // Calculate historical metrics
    const last30Days = historicalExecs.filter(e => 
      new Date(e.created_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    const avgExecutionsPerDay = last30Days.length / 30;
    const avgDuration = historicalExecs.reduce((sum, e) => sum + (e.duration_ms || 0), 0) / historicalExecs.length;
    const peakConcurrency = Math.max(...historicalExecs.map(e => e.steps_completed?.length || 1));

    // Get user availability
    const users = await base44.asServiceRole.entities.User.list();
    const activeUsers = users.filter(u => u.role !== 'viewer');

    // Use AI for resource prediction
    const aiPrediction = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a resource planning AI analyzing workflow execution patterns to predict future resource needs.

Historical Data:
- Total Executions: ${historicalExecs.length}
- Last 30 Days: ${last30Days.length} executions
- Average per Day: ${avgExecutionsPerDay.toFixed(1)}
- Average Duration: ${(avgDuration / 1000 / 60).toFixed(1)} minutes
- Peak Concurrent Steps: ${peakConcurrency}
- Available Users: ${activeUsers.length}

Forecast Period: Next ${forecast_days} days

Analyze trends and predict:
1. Expected execution volume
2. Required user capacity (person-hours)
3. Peak load times
4. Resource bottlenecks
5. Scaling recommendations

Consider growth trends, seasonal patterns, and system capacity.`,
      response_json_schema: {
        type: "object",
        properties: {
          predicted_executions: { type: "number" },
          predicted_volume_by_day: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day: { type: "number" },
                expected_count: { type: "number" }
              }
            }
          },
          resource_requirements: {
            type: "object",
            properties: {
              required_users: { type: "number" },
              person_hours_needed: { type: "number" },
              peak_concurrent_workflows: { type: "number" }
            }
          },
          capacity_warnings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                warning: { type: "string" },
                severity: { type: "string", enum: ["low", "medium", "high"] },
                recommendation: { type: "string" }
              }
            }
          },
          scaling_recommendations: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Save prediction learning
    await base44.asServiceRole.entities.WorkflowLearning.create({
      workflow_id,
      learning_type: "resource_prediction",
      pattern_data: {
        prediction: aiPrediction,
        forecast_days,
        current_capacity: activeUsers.length,
        predicted_at: new Date().toISOString(),
        historical_baseline: {
          avg_executions_per_day: avgExecutionsPerDay,
          avg_duration_ms: avgDuration
        }
      },
      confidence_score: 75,
      success_count: 0,
      is_active: true
    });

    return Response.json({
      success: true,
      prediction: aiPrediction,
      current_capacity: {
        available_users: activeUsers.length,
        current_avg_daily_load: avgExecutionsPerDay
      }
    });

  } catch (error) {
    console.error('Resource prediction error:', error);
    return Response.json({ 
      error: 'Failed to predict resources', 
      details: error.message 
    }, { status: 500 });
  }
});