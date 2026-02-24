import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { report_id } = await req.json();

    if (!report_id) {
      return Response.json({ error: 'Missing report_id' }, { status: 400 });
    }

    // Fetch report
    const reports = await base44.entities.Report.list();
    const report = reports.find(r => r.id === report_id);

    if (!report) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    // Build CSV content
    let csvContent = `Report: ${report.title}\n`;
    csvContent += `Date Range: ${report.date_range.start_date} to ${report.date_range.end_date}\n\n`;

    // Metrics section
    csvContent += 'Metric,Value\n';
    const metrics = report.metrics || {};
    
    if (metrics.total_documents !== undefined) {
      csvContent += `Total Documents,${metrics.total_documents}\n`;
    }
    if (metrics.anomaly_rate !== undefined) {
      csvContent += `Anomaly Rate,${metrics.anomaly_rate}%\n`;
    }
    if (metrics.workflow_success_rate !== undefined) {
      csvContent += `Workflow Success Rate,${metrics.workflow_success_rate}%\n`;
    }
    if (metrics.avg_processing_time !== undefined) {
      csvContent += `Average Processing Time,${metrics.avg_processing_time}s\n`;
    }
    if (metrics.avg_confidence !== undefined) {
      csvContent += `Average Confidence,${metrics.avg_confidence}%\n`;
    }

    // By document type
    if (metrics.by_document_type) {
      csvContent += '\n\nDocument Type,Count,Avg Confidence,Avg Time,Anomaly Count\n';
      Object.entries(metrics.by_document_type).forEach(([type, data]) => {
        csvContent += `${type},${data.count},${data.avg_confidence}%,${data.avg_time}s,${data.anomaly_count}\n`;
      });
    }

    // Insights
    if (report.insights && report.insights.length > 0) {
      csvContent += '\n\nInsight\n';
      report.insights.forEach(insight => {
        csvContent += `"${insight.replace(/"/g, '""')}"\n`;
      });
    }

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=report-${report_id}.csv`
      }
    });

  } catch (error) {
    console.error('CSV export error:', error);
    return Response.json({ 
      error: 'Failed to export CSV', 
      details: error.message 
    }, { status: 500 });
  }
});