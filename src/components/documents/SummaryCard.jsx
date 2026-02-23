import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function SummaryCard({ summary }) {
  if (!summary) {
    return (
      <Card className="glass-strong border border-white/20">
        <CardContent className="p-4 text-center text-gray-400">
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No AI summary generated yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-strong border border-cyan-500/30">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white">AI Summary</h3>
            <p className="text-[10px] text-gray-400">
              Generated {new Date(summary.generated_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Overview */}
        <div className="glass rounded-xl p-3">
          <p className="text-sm text-gray-200 leading-relaxed">
            {summary.overview}
          </p>
        </div>

        {/* Key Entities */}
        {summary.key_entities && summary.key_entities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-white">Key Entities</span>
            </div>
            <div className="space-y-1.5">
              {summary.key_entities.slice(0, 3).map((entity, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between glass rounded-lg px-3 py-1.5"
                >
                  <span className="text-xs text-gray-400">{entity.field}</span>
                  <span className="text-xs font-semibold text-white">{entity.value}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Confidence */}
        {summary.confidence_summary && (
          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-semibold text-white">Confidence</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {summary.confidence_summary}
            </p>
          </div>
        )}

        {/* Anomalies */}
        {summary.anomalies_summary && summary.anomalies_summary !== "N/A" && (
          <div className="glass rounded-xl p-3 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-white">Issues Detected</span>
            </div>
            <p className="text-xs text-amber-200 leading-relaxed">
              {summary.anomalies_summary}
            </p>
          </div>
        )}

        {/* Recommendations */}
        {summary.recommendations && summary.recommendations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-semibold text-white">Recommendations</span>
            </div>
            <div className="space-y-1.5">
              {summary.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <span className="text-xs text-gray-300 leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}