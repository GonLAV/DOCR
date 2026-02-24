import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.2';

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

    // Create PDF
    const doc = new jsPDF();
    let y = 20;

    // Title
    doc.setFontSize(20);
    doc.text(report.title, 20, y);
    y += 15;

    // Date range
    doc.setFontSize(10);
    doc.text(`${report.date_range.start_date} to ${report.date_range.end_date}`, 20, y);
    y += 15;

    // Summary
    if (report.ai_summary) {
      doc.setFontSize(14);
      doc.text('Executive Summary', 20, y);
      y += 10;
      doc.setFontSize(10);
      const summaryLines = doc.splitTextToSize(report.ai_summary, 170);
      doc.text(summaryLines, 20, y);
      y += summaryLines.length * 5 + 10;
    }

    // Metrics
    if (report.metrics) {
      doc.setFontSize(14);
      doc.text('Key Metrics', 20, y);
      y += 10;
      doc.setFontSize(10);
      
      if (report.metrics.total_documents !== undefined) {
        doc.text(`Total Documents: ${report.metrics.total_documents}`, 20, y);
        y += 7;
      }
      if (report.metrics.anomaly_rate !== undefined) {
        doc.text(`Anomaly Rate: ${report.metrics.anomaly_rate}%`, 20, y);
        y += 7;
      }
      if (report.metrics.workflow_success_rate !== undefined) {
        doc.text(`Workflow Success Rate: ${report.metrics.workflow_success_rate}%`, 20, y);
        y += 7;
      }
      if (report.metrics.avg_processing_time !== undefined) {
        doc.text(`Average Processing Time: ${report.metrics.avg_processing_time}s`, 20, y);
        y += 7;
      }
      y += 10;
    }

    // Insights
    if (report.insights && report.insights.length > 0) {
      doc.setFontSize(14);
      doc.text('Key Insights', 20, y);
      y += 10;
      doc.setFontSize(10);
      
      report.insights.forEach((insight, i) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const insightLines = doc.splitTextToSize(`${i + 1}. ${insight}`, 170);
        doc.text(insightLines, 20, y);
        y += insightLines.length * 5 + 5;
      });
    }

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=report-${report_id}.pdf`
      }
    });

  } catch (error) {
    console.error('PDF export error:', error);
    return Response.json({ 
      error: 'Failed to export PDF', 
      details: error.message 
    }, { status: 500 });
  }
});