import React, { useState } from "react";
import { useUser } from "@/components/auth/useUser";
import PermissionGate from "@/components/auth/PermissionGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  FileText,
  Download,
  Sparkles,
  Calendar,
  Filter,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import ReportPreview from "@/components/reports/ReportPreview";

export default function ReportGeneration() {
  const { permissions } = useUser();
  return (
    <PermissionGate allowed={permissions.canViewReports}>
      <ReportGenerationContent />
    </PermissionGate>
  );
}

function ReportGenerationContent() {
  const [reportType, setReportType] = useState("comprehensive");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDocTypes, setSelectedDocTypes] = useState([]);
  const [selectedWorkflows, setSelectedWorkflows] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const queryClient = useQueryClient();

  // Fetch existing reports
  const { data: reports = [] } = useQuery({
    queryKey: ["reports"],
    queryFn: () => base44.entities.Report.list("-created_date")
  });

  // Fetch workflows for filter
  const { data: workflows = [] } = useQuery({
    queryKey: ["workflows"],
    queryFn: () => base44.entities.Workflow.list()
  });

  // Generate report mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke("generateReport", {
        report_type: reportType,
        date_range: {
          start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: endDate || new Date().toISOString().split('T')[0]
        },
        filters: {
          document_types: selectedDocTypes,
          workflow_ids: selectedWorkflows
        }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report generated successfully");
    },
    onError: () => {
      toast.error("Failed to generate report");
    }
  });

  // Export mutations
  const exportPdfMutation = useMutation({
    mutationFn: async (reportId) => {
      const { data } = await base44.functions.invoke("exportReportPDF", {
        report_id: reportId
      });
      
      // Create download
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    onSuccess: () => {
      toast.success("PDF downloaded");
    },
    onError: () => {
      toast.error("Failed to export PDF");
    }
  });

  const exportCsvMutation = useMutation({
    mutationFn: async (reportId) => {
      const { data } = await base44.functions.invoke("exportReportCSV", {
        report_id: reportId
      });
      
      // Create download
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    onSuccess: () => {
      toast.success("CSV downloaded");
    },
    onError: () => {
      toast.error("Failed to export CSV");
    }
  });

  const reportTypes = [
    { value: "document_analysis", label: "Document Analysis", icon: FileText },
    { value: "workflow_performance", label: "Workflow Performance", icon: TrendingUp },
    { value: "anomaly_summary", label: "Anomaly Summary", icon: AlertCircle },
    { value: "comprehensive", label: "Comprehensive Report", icon: Sparkles }
  ];

  const docTypes = ["invoice", "contract", "scan", "letter", "form"];

  if (selectedReport) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setSelectedReport(null)}
            >
              ← Back to Reports
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={() => exportPdfMutation.mutate(selectedReport.id)}
                disabled={exportPdfMutation.isPending}
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button
                onClick={() => exportCsvMutation.mutate(selectedReport.id)}
                disabled={exportCsvMutation.isPending}
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
          <ReportPreview report={selectedReport} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Report Generation</h1>
        <p className="text-gray-400 text-sm">AI-powered insights and analytics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <Card className="glass-strong border border-white/20 sticky top-6">
            <CardHeader>
              <CardTitle className="text-gray-100 flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-400" />
                Report Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Report Type */}
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-2 block">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700/40 text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-2 block flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Date Range
                </label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Start Date"
                    className="bg-slate-800/50 border-slate-700/40 text-gray-100"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="End Date"
                    className="bg-slate-800/50 border-slate-700/40 text-gray-100"
                  />
                </div>
              </div>

              {/* Document Types Filter */}
              {(reportType === "document_analysis" || reportType === "comprehensive") && (
                <div>
                  <label className="text-xs font-semibold text-gray-300 mb-2 block">Document Types</label>
                  <div className="flex flex-wrap gap-2">
                    {docTypes.map(type => (
                      <Badge
                        key={type}
                        onClick={() => {
                          setSelectedDocTypes(prev =>
                            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                          );
                        }}
                        className={`cursor-pointer transition-all ${
                          selectedDocTypes.includes(type)
                            ? "bg-blue-500/30 text-blue-300"
                            : "bg-slate-700/50 text-gray-400"
                        }`}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Workflow Filter */}
              {(reportType === "workflow_performance" || reportType === "comprehensive") && (
                <div>
                  <label className="text-xs font-semibold text-gray-300 mb-2 block">Workflows</label>
                  <div className="space-y-2">
                    {workflows.slice(0, 5).map(workflow => (
                      <label
                        key={workflow.id}
                        className="flex items-center gap-2 cursor-pointer text-sm text-gray-300"
                      >
                        <input
                          type="checkbox"
                          checked={selectedWorkflows.includes(workflow.id)}
                          onChange={(e) => {
                            setSelectedWorkflows(prev =>
                              e.target.checked ? [...prev, workflow.id] : prev.filter(id => id !== workflow.id)
                            );
                          }}
                          className="rounded"
                        />
                        {workflow.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="w-full gap-2"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="glass-strong border border-white/20">
            <CardHeader>
              <CardTitle className="text-gray-100">Generated Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No reports generated yet</p>
                  </div>
                ) : (
                  reports.map((report, index) => {
                    const type = reportTypes.find(t => t.value === report.report_type);
                    const IconComponent = type?.icon || FileText;
                    
                    return (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass rounded-xl p-4 hover:glass-strong transition-all cursor-pointer"
                        onClick={() => setSelectedReport(report)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3 flex-1">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                              <IconComponent className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-100 mb-1">{report.title}</h3>
                              <p className="text-xs text-gray-400 mb-2">
                                {report.date_range?.start_date} to {report.date_range?.end_date}
                              </p>
                              {report.ai_summary && (
                                <p className="text-xs text-gray-300 line-clamp-2">
                                  {report.ai_summary.substring(0, 150)}...
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge className={
                            report.status === "completed" ? "bg-emerald-500/20 text-emerald-300" :
                            report.status === "generating" ? "bg-blue-500/20 text-blue-300" :
                            "bg-rose-500/20 text-rose-300"
                          }>
                            {report.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                            {report.status === "generating" && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                            {report.status}
                          </Badge>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}