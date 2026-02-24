import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";

export default function ReportPreview({ report }) {
  if (!report) return null;

  const metrics = report.metrics || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="glass-strong border border-white/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl text-gray-100 mb-2">{report.title}</CardTitle>
              <p className="text-sm text-gray-400">
                {report.date_range?.start_date} to {report.date_range?.end_date}
              </p>
            </div>
            <Badge className="bg-blue-500/20 text-blue-300 capitalize">
              {report.report_type.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* AI Summary */}
      {report.ai_summary && (
        <Card className="glass-strong border border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 leading-relaxed">{report.ai_summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.total_documents !== undefined && (
            <Card className="glass-strong border border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Documents Processed</span>
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-gray-100">{metrics.total_documents}</div>
                {metrics.document_growth && (
                  <div className={`text-xs flex items-center gap-1 mt-1 ${
                    metrics.document_growth > 0 ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {metrics.document_growth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(metrics.document_growth)}% vs previous period
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {metrics.anomaly_rate !== undefined && (
            <Card className="glass-strong border border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Anomaly Rate</span>
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-gray-100">{metrics.anomaly_rate}%</div>
                <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    style={{ width: `${metrics.anomaly_rate}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {metrics.workflow_success_rate !== undefined && (
            <Card className="glass-strong border border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Workflow Success</span>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-gray-100">{metrics.workflow_success_rate}%</div>
                <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                    style={{ width: `${metrics.workflow_success_rate}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {metrics.avg_processing_time !== undefined && (
            <Card className="glass-strong border border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Avg Processing</span>
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-gray-100">{metrics.avg_processing_time}s</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Insights */}
      {report.insights && report.insights.length > 0 && (
        <Card className="glass-strong border border-white/20">
          <CardHeader>
            <CardTitle className="text-gray-100">Key Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 glass rounded-lg p-3"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-400">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{insight}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Metrics */}
      {metrics.by_document_type && (
        <Card className="glass-strong border border-white/20">
          <CardHeader>
            <CardTitle className="text-gray-100">Performance by Document Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.by_document_type).map(([type, data]) => (
                <div key={type} className="glass rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-100 capitalize">{type}</span>
                    <Badge className="bg-slate-700/50 text-gray-300">{data.count} docs</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Avg Confidence:</span>
                      <span className="text-gray-200 ml-1 font-semibold">{data.avg_confidence}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Anomalies:</span>
                      <span className="text-gray-200 ml-1 font-semibold">{data.anomaly_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Processing:</span>
                      <span className="text-gray-200 ml-1 font-semibold">{data.avg_time}s</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}