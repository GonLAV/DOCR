import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { report_type, date_range, filters = {} } = await req.json();

    if (!report_type) {
      return Response.json({ error: 'Missing report_type' }, { status: 400 });
    }

    // Fetch relevant data
    const documents = await base44.entities.Document.list();
    const workflowExecutions = await base44.entities.WorkflowExecution.list();
    
    // Filter by date range
    const startDate = new Date(date_range.start_date);
    const endDate = new Date(date_range.end_date);
    
    const filteredDocs = documents.filter(doc => {
      const docDate = new Date(doc.created_date);
      return docDate >= startDate && docDate <= endDate;
    });

    const filteredExecs = workflowExecutions.filter(exec => {
      const execDate = new Date(exec.created_date);
      return execDate >= startDate && execDate <= endDate;
    });

    // Apply additional filters
    let reportDocs = filteredDocs;
    if (filters.document_types && filters.document_types.length > 0) {
      reportDocs = reportDocs.filter(d => filters.document_types.includes(d.document_class));
    }

    let reportExecs = filteredExecs;
    if (filters.workflow_ids && filters.workflow_ids.length > 0) {
      reportExecs = reportExecs.filter(e => filters.workflow_ids.includes(e.workflow_id));
    }

    // Calculate metrics
    const metrics = {
      total_documents: reportDocs.length,
      total_executions: reportExecs.length,
      anomaly_rate: reportDocs.length > 0 
        ? ((reportDocs.filter(d => d.anomalies && d.anomalies.length > 0).length / reportDocs.length) * 100).toFixed(1)
        : 0,
      workflow_success_rate: reportExecs.length > 0
        ? ((reportExecs.filter(e => e.status === "completed").length / reportExecs.length) * 100).toFixed(1)
        : 0,
      avg_processing_time: reportDocs.length > 0
        ? (reportDocs.reduce((sum, d) => sum + (d.processing_time_ms || 0), 0) / reportDocs.length / 1000).toFixed(1)
        : 0,
      avg_confidence: reportDocs.length > 0
        ? (reportDocs.reduce((sum, d) => sum + (d.confidence_score || 0), 0) / reportDocs.length).toFixed(1)
        : 0
    };

    // Calculate by document type
    const byDocType = {};
    reportDocs.forEach(doc => {
      const type = doc.document_class || "unknown";
      if (!byDocType[type]) {
        byDocType[type] = { count: 0, total_confidence: 0, total_time: 0, anomaly_count: 0 };
      }
      byDocType[type].count++;
      byDocType[type].total_confidence += doc.confidence_score || 0;
      byDocType[type].total_time += (doc.processing_time_ms || 0) / 1000;
      byDocType[type].anomaly_count += (doc.anomalies?.length || 0);
    });

    metrics.by_document_type = Object.fromEntries(
      Object.entries(byDocType).map(([type, data]) => [
        type,
        {
          count: data.count,
          avg_confidence: (data.total_confidence / data.count).toFixed(1),
          avg_time: (data.total_time / data.count).toFixed(1),
          anomaly_count: data.anomaly_count
        }
      ])
    );

    // Generate AI summary and insights
    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a data analyst generating an executive report. Analyze the following metrics and provide:
1. A concise executive summary (2-3 sentences)
2. 3-5 key insights and actionable recommendations

Report Type: ${report_type}
Date Range: ${date_range.start_date} to ${date_range.end_date}

Metrics:
- Total Documents: ${metrics.total_documents}
- Anomaly Rate: ${metrics.anomaly_rate}%
- Workflow Success Rate: ${metrics.workflow_success_rate}%
- Average Processing Time: ${metrics.avg_processing_time}s
- Average Confidence: ${metrics.avg_confidence}%

Performance by Document Type:
${JSON.stringify(metrics.by_document_type, null, 2)}

Focus on trends, areas of concern, and opportunities for improvement.`,
      response_json_schema: {
        type: "object",
        properties: {
          summary: {
            type: "string",
            description: "2-3 sentence executive summary"
          },
          insights: {
            type: "array",
            items: { type: "string" },
            description: "Key insights and recommendations"
          }
        }
      }
    });

    // Create report
    const report = await base44.asServiceRole.entities.Report.create({
      title: `${report_type.replace("_", " ").toUpperCase()} - ${date_range.start_date}`,
      report_type,
      date_range,
      filters,
      metrics,
      ai_summary: aiAnalysis.summary,
      insights: aiAnalysis.insights,
      generated_by: user.email,
      status: "completed"
    });

    return Response.json({
      success: true,
      report_id: report.id
    });

  } catch (error) {
    console.error('Report generation error:', error);
    return Response.json({ 
      error: 'Failed to generate report', 
      details: error.message 
    }, { status: 500 });
  }
});