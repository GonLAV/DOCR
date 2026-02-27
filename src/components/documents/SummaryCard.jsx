import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, TrendingUp, AlertCircle, CheckCircle2, Sparkles, RefreshCw, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const FOCUS_OPTIONS = [
  { value: "general",        label: "General Overview" },
  { value: "key_findings",   label: "Key Findings" },
  { value: "action_items",   label: "Action Items" },
  { value: "financial_data", label: "Financial Data" },
  { value: "risks",          label: "Risks & Issues" },
  { value: "entities_people","label": "People & Entities" },
];

export default function SummaryCard({ summary, documentId }) {
  const [summaryLength, setSummaryLength] = useState("medium");
  const [summaryFocus, setSummaryFocus] = useState("general");
  const queryClient = useQueryClient();

  const generateSummaryMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke("generateDocumentSummary", {
        document_id: documentId,
        length: summaryLength,
        focus: summaryFocus
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      toast.success("AI summary generated successfully");
    },
    onError: (error) => {
      toast.error("Failed to generate summary: " + error.message);
    }
  });
  if (!summary) {
    return (
      <Card className="glass-strong border border-white/20">
        <CardContent className="p-4">
          <div className="text-center text-gray-400 mb-4">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs mb-3">No AI summary generated yet</p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-gray-400 mb-1.5 block">Summary Length</label>
              <Select value={summaryLength} onValueChange={setSummaryLength}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700/40 text-gray-100 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (Quick Overview)</SelectItem>
                  <SelectItem value="medium">Medium (Balanced)</SelectItem>
                  <SelectItem value="detailed">Detailed (Comprehensive)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 mb-1.5 block">Focus Area</label>
              <Select value={summaryFocus} onValueChange={setSummaryFocus}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700/40 text-gray-100 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOCUS_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => generateSummaryMutation.mutate()}
              disabled={generateSummaryMutation.isPending}
              className="w-full gap-2 h-8 text-xs"
            >
              {generateSummaryMutation.isPending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Summary
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-strong border border-cyan-500/30">
      <CardContent className="p-5 space-y-4">
        {/* Header with Regenerate */}
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
          <div className="flex items-center gap-2">
            <Select value={summaryLength} onValueChange={setSummaryLength}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700/40 text-gray-100 h-7 text-[10px] w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => generateSummaryMutation.mutate()}
              disabled={generateSummaryMutation.isPending}
              className="h-7 w-7 p-0 text-cyan-400 hover:text-cyan-300"
              title="Regenerate summary"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generateSummaryMutation.isPending ? "animate-spin" : ""}`} />
            </Button>
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