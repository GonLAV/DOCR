import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles, RefreshCw, FileText, CheckSquare, Lightbulb,
  AlertCircle, TrendingUp, CheckCircle2, ChevronRight, Zap
} from "lucide-react";
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

function Section({ icon: Icon, color, title, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className="text-xs font-semibold text-white">{title}</span>
      </div>
      {children}
    </div>
  );
}

function BulletList({ items, color = "text-gray-300", dotColor = "bg-slate-400" }) {
  if (!items || items.length === 0) return <p className="text-xs text-gray-500 italic">None identified</p>;
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
          className="flex items-start gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${dotColor} mt-1.5 shrink-0`} />
          <span className={`text-xs leading-relaxed ${color}`}>{item}</span>
        </motion.div>
      ))}
    </div>
  );
}

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
            <p className="text-sm font-semibold text-white mb-0.5">AI Document Summary</p>
            <p className="text-xs text-gray-400 mb-3">Generate a summary highlighting main points, decisions & action items</p>
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
              className="w-full gap-2 h-9 text-xs"
            >
              {generateSummaryMutation.isPending ? (
                <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Generating…</>
              ) : (
                <><Sparkles className="w-3.5 h-3.5" />Generate AI Summary</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-strong border border-cyan-500/30">
      <CardContent className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white">AI Summary</h3>
            <p className="text-[10px] text-gray-400">
              {summary.generated_at ? `Generated ${new Date(summary.generated_at).toLocaleDateString()}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Select value={summaryLength} onValueChange={setSummaryLength}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700/40 text-gray-100 h-7 text-[10px] w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost"
              onClick={() => generateSummaryMutation.mutate()}
              disabled={generateSummaryMutation.isPending}
              className="h-7 w-7 p-0 text-cyan-400 hover:text-cyan-300" title="Regenerate">
              <RefreshCw className={`w-3.5 h-3.5 ${generateSummaryMutation.isPending ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Overview */}
        <div className="glass rounded-xl p-3">
          <p className="text-sm text-gray-200 leading-relaxed">{summary.overview}</p>
        </div>

        {/* Main Points */}
        {summary.main_points?.length > 0 && (
          <Section icon={FileText} color="text-emerald-400" title="Main Points">
            <div className="glass rounded-xl p-3">
              <BulletList items={summary.main_points} dotColor="bg-emerald-400" />
            </div>
          </Section>
        )}

        {/* Key Decisions */}
        <Section icon={CheckSquare} color="text-blue-400" title="Key Decisions">
          <div className="glass rounded-xl p-3">
            <BulletList items={summary.key_decisions} color="text-blue-200" dotColor="bg-blue-400" />
          </div>
        </Section>

        {/* Action Items */}
        <Section icon={Zap} color="text-amber-400" title="Action Items">
          <div className={`glass rounded-xl p-3 ${summary.action_items?.length > 0 ? "border border-amber-500/20" : ""}`}>
            {summary.action_items?.length > 0 ? (
              <div className="space-y-1.5">
                {summary.action_items.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-2 bg-amber-500/10 rounded-lg px-2.5 py-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <span className="text-xs text-amber-200 leading-relaxed">{item}</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No action items identified</p>
            )}
          </div>
        </Section>

        {/* Key Entities */}
        {summary.key_entities?.length > 0 && (
          <Section icon={FileText} color="text-violet-400" title="Key Entities">
            <div className="space-y-1.5">
              {summary.key_entities.slice(0, 5).map((entity, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  className="flex items-center justify-between glass rounded-lg px-3 py-1.5">
                  <span className="text-xs text-gray-400">{entity.field}</span>
                  <span className="text-xs font-semibold text-white truncate max-w-[55%] text-right">{entity.value}</span>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* Confidence */}
        {summary.confidence_summary && (
          <Section icon={TrendingUp} color="text-blue-400" title="Confidence">
            <div className="glass rounded-xl p-3">
              <p className="text-xs text-gray-300 leading-relaxed">{summary.confidence_summary}</p>
            </div>
          </Section>
        )}

        {/* Anomalies */}
        {summary.anomalies_summary && summary.anomalies_summary !== "None detected" && summary.anomalies_summary !== "N/A" && (
          <Section icon={AlertCircle} color="text-amber-400" title="Issues Detected">
            <div className="glass rounded-xl p-3 border border-amber-500/20">
              <p className="text-xs text-amber-200 leading-relaxed">{summary.anomalies_summary}</p>
            </div>
          </Section>
        )}

        {/* Recommendations */}
        {summary.recommendations?.length > 0 && (
          <Section icon={CheckCircle2} color="text-purple-400" title="Recommendations">
            <BulletList items={summary.recommendations} color="text-gray-300" dotColor="bg-purple-400" />
          </Section>
        )}
      </CardContent>
    </Card>
  );
}