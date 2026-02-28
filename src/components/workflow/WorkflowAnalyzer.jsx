import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, RefreshCw, Zap, AlertTriangle, ArrowRight,
  Lightbulb, TrendingUp, GitMerge, Shield, ChevronDown, ChevronUp, CheckCircle2
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const SEVERITY_CONFIG = {
  critical: { color: "text-rose-300", bg: "bg-rose-500/10 border-rose-500/20", icon: AlertTriangle, badge: "bg-rose-500/20 text-rose-300" },
  warning:  { color: "text-amber-300", bg: "bg-amber-500/10 border-amber-500/20", icon: Zap,           badge: "bg-amber-500/20 text-amber-300" },
  info:     { color: "text-blue-300",  bg: "bg-blue-500/10 border-blue-500/20",   icon: Lightbulb,     badge: "bg-blue-500/20 text-blue-300" },
  success:  { color: "text-emerald-300", bg: "bg-emerald-500/10 border-emerald-500/20", icon: TrendingUp, badge: "bg-emerald-500/20 text-emerald-300" },
};

const CATEGORY_ICONS = {
  bottleneck: AlertTriangle,
  consolidation: GitMerge,
  logic: Shield,
  efficiency: TrendingUp,
  best_practice: Lightbulb,
};

function SuggestionCard({ suggestion, onApply }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[suggestion.severity] || SEVERITY_CONFIG.info;
  const Icon = CATEGORY_ICONS[suggestion.category] || Lightbulb;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-3 ${cfg.bg}`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 shrink-0 ${cfg.color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className={`text-xs font-bold ${cfg.color}`}>{suggestion.title}</p>
            <Badge className={`text-[9px] ${cfg.badge}`}>{suggestion.severity}</Badge>
            <Badge className="text-[9px] bg-slate-700 text-slate-400 capitalize">{suggestion.category?.replace("_", " ")}</Badge>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{suggestion.description}</p>

          {suggestion.affected_steps?.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {suggestion.affected_steps.map((s, i) => (
                <span key={i} className="text-[10px] bg-slate-800 rounded px-1.5 py-0.5 text-slate-300">
                  {s}
                </span>
              ))}
            </div>
          )}

          {suggestion.recommendation && (
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 p-2 rounded-lg bg-slate-800/60 border border-slate-700/30">
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      <span className="font-semibold text-slate-200">Recommendation: </span>
                      {suggestion.recommendation}
                    </p>
                    {suggestion.estimated_impact && (
                      <p className="text-[10px] text-emerald-400 mt-1">
                        Expected impact: {suggestion.estimated_impact}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          <div className="flex items-center gap-2 mt-2">
            {suggestion.recommendation && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-0.5 transition-colors"
              >
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expanded ? "Less" : "Details"}
              </button>
            )}
            {suggestion.auto_applicable && onApply && (
              <button
                onClick={() => onApply(suggestion)}
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5 transition-colors"
              >
                <ArrowRight className="w-3 h-3" />
                Apply fix
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function WorkflowAnalyzer({ workflowData, executionStats, onApplySuggestion }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const hasSteps = workflowData?.steps?.length > 0;

  const analyze = async () => {
    if (!hasSteps) {
      toast.warning("Add at least one step before analyzing");
      return;
    }
    setLoading(true);
    setAnalysis(null);
    try {
      const executionContext = executionStats
        ? `Historical execution data: ${JSON.stringify(executionStats)}`
        : "No historical execution data available yet.";

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert workflow optimization consultant for DocIntel, an AI-powered document processing platform.

Analyze this workflow configuration and provide actionable optimization suggestions.

WORKFLOW:
Name: ${workflowData.name || "Unnamed"}
Description: ${workflowData.description || "None"}
Trigger: ${JSON.stringify(workflowData.trigger)}
Steps (${workflowData.steps.length}):
${workflowData.steps.map((s, i) => `  Step ${i+1}: ${s.name} [type: ${s.type}] conditions: ${JSON.stringify(s.conditions || [])}`).join("\n")}
Completion Actions: ${JSON.stringify(workflowData.actions || [])}

${executionContext}

Analyze for:
1. BOTTLENECKS - steps that are likely to slow execution (e.g. approval/manual steps without fallbacks, no timeouts, blocking sequential steps that could be parallel)
2. CONSOLIDATION - redundant or adjacent steps that could be merged (e.g. two notification steps, validation before routing without branching)
3. LOGIC - conditional steps with missing branches, unreachable steps, missing error handling
4. EFFICIENCY - better step types for the intent (e.g. using processing where routing is needed), missing caching, unnecessary complexity
5. BEST PRACTICES - missing validation before approval, no fallback for failed steps, trigger conditions that are too broad

For each suggestion, specify if it's auto-applicable (simple field/type changes you can describe precisely).
Be specific — reference actual step names from the workflow.
Only flag real issues, don't invent problems. If the workflow is well-designed, say so with a "success" severity summary.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number", description: "Workflow quality score 0-100" },
            overall_assessment: { type: "string", description: "1-2 sentence summary" },
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string", enum: ["critical", "warning", "info", "success"] },
                  category: { type: "string", enum: ["bottleneck", "consolidation", "logic", "efficiency", "best_practice"] },
                  affected_steps: { type: "array", items: { type: "string" } },
                  recommendation: { type: "string" },
                  estimated_impact: { type: "string" },
                  auto_applicable: { type: "boolean" },
                  auto_fix: {
                    type: "object",
                    description: "If auto_applicable, describe the fix",
                    properties: {
                      step_name: { type: "string" },
                      change_field: { type: "string" },
                      new_value: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      });
      setAnalysis(result);
      setExpanded(true);
    } catch (e) {
      toast.error("Analysis failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = (suggestion) => {
    if (!suggestion.auto_fix || !onApplySuggestion) return;
    onApplySuggestion(suggestion.auto_fix);
    toast.success(`Applied: ${suggestion.title}`);
  };

  const scoreColor = !analysis ? "" :
    analysis.overall_score >= 80 ? "text-emerald-400" :
    analysis.overall_score >= 60 ? "text-amber-400" : "text-rose-400";

  const criticalCount = analysis?.suggestions?.filter(s => s.severity === "critical").length || 0;
  const warningCount = analysis?.suggestions?.filter(s => s.severity === "warning").length || 0;

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {analysis && (
            <>
              <span className={`text-2xl font-black ${scoreColor}`}>{analysis.overall_score}</span>
              <span className="text-xs text-slate-500">/100</span>
              {criticalCount > 0 && (
                <Badge className="bg-rose-500/20 text-rose-300 text-[9px]">{criticalCount} critical</Badge>
              )}
              {warningCount > 0 && (
                <Badge className="bg-amber-500/20 text-amber-300 text-[9px]">{warningCount} warnings</Badge>
              )}
            </>
          )}
        </div>
        <Button
          size="sm"
          onClick={analyze}
          disabled={loading || !hasSteps}
          className="gap-1.5 h-7 text-xs bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500"
        >
          {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          {loading ? "Analyzing…" : analysis ? "Re-analyze" : "Analyze Workflow"}
        </Button>
      </div>

      {/* Assessment */}
      {analysis?.overall_assessment && (
        <div className="glass rounded-lg px-3 py-2">
          <p className="text-xs text-slate-300 leading-relaxed">{analysis.overall_assessment}</p>
        </div>
      )}

      {/* No steps hint */}
      {!hasSteps && !loading && (
        <p className="text-xs text-slate-500 italic">Add steps to enable AI analysis.</p>
      )}

      {/* Suggestions */}
      <AnimatePresence>
        {analysis?.suggestions?.length > 0 && expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {analysis.suggestions.map((s, i) => (
              <SuggestionCard
                key={i}
                suggestion={s}
                onApply={s.auto_applicable ? handleApplySuggestion : null}
              />
            ))}
          </motion.div>
        )}
        {analysis?.suggestions?.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-2 glass rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <p className="text-xs text-emerald-300">No issues found — your workflow looks great!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}