import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, ChevronRight, Lightbulb, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const EXAMPLES = [
  "When an invoice is flagged for review, send an email to accounts payable and assign it to the finance team",
  "When a contract is uploaded and confidence is below 70%, route it to legal for manual review and send a Slack notification",
  "After a document completes processing, validate the extracted entities and if any anomalies are found, flag for review and notify the compliance team",
];

const STEP_COLORS = {
  processing: "from-blue-500 to-cyan-500",
  validation: "from-emerald-500 to-teal-500",
  routing: "from-violet-500 to-purple-500",
  notification: "from-amber-500 to-orange-500",
  conditional: "from-pink-500 to-rose-500",
  approval: "from-red-500 to-rose-600",
};

export default function AIWorkflowGenerator({ onApply }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setPreview(null);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert workflow automation designer for a document processing system called DocIntel.

A user described a workflow in natural language. Convert it into a structured workflow configuration.

User description: "${prompt}"

The workflow system supports:
- Triggers: document_uploaded, document_completed, manual, scheduled
- Step types: processing, validation, routing, notification, conditional, approval
- Actions (on completion): email, route_to_user, update_field, create_task
- Condition operators: equals, not_equals, greater_than, less_than, contains

Generate a complete workflow with:
1. A clear name and description
2. The most appropriate trigger type and trigger conditions based on the description
3. A logical sequence of 2-5 steps that implement the described behavior
4. Completion actions where relevant
5. For each step, a brief explanation of what it does

Map the user's intent accurately. For example:
- "flagged for review" → condition on tags containing 'needs-review' or a routing step
- "send email" → notification step or email action
- "assign to team" → routing step with assignee
- "confidence below X" → conditional step checking confidence_score`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Workflow name" },
            description: { type: "string", description: "Workflow description" },
            trigger: {
              type: "object",
              properties: {
                type: { type: "string" },
                conditions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      field: { type: "string" },
                      operator: { type: "string" },
                      value: { type: "string" }
                    }
                  }
                }
              }
            },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  type: { type: "string" },
                  explanation: { type: "string" },
                  config: { type: "object" },
                  conditions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        field: { type: "string" },
                        operator: { type: "string" },
                        value: { type: "string" }
                      }
                    }
                  }
                }
              }
            },
            actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  config: { type: "object" }
                }
              }
            },
            ai_note: { type: "string", description: "Brief note from AI about design choices" }
          }
        }
      });
      // Ensure each step has a valid id
      if (result.steps) {
        result.steps = result.steps.map((s, i) => ({ ...s, id: s.id || `step_${Date.now()}_${i}` }));
      }
      setPreview(result);
    } catch (e) {
      toast.error("AI generation failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!preview) return;
    const { ai_note, ...workflowData } = preview;
    onApply({ ...workflowData, enabled: true });
    toast.success("AI workflow applied — review and save when ready");
  };

  return (
    <div className="space-y-4">
      {/* Prompt area */}
      <div className="space-y-2">
        <Textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Describe your workflow in plain English…&#10;e.g. 'When an invoice is flagged for review, send an email to accounts payable and assign it to the finance team'"
          className="bg-slate-800/50 border-slate-700/40 text-gray-100 min-h-[90px] text-sm resize-none placeholder:text-slate-500"
          onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate(); }}
        />
        <Button
          onClick={generate}
          disabled={loading || !prompt.trim()}
          className="w-full gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "AI is designing your workflow…" : "Generate Workflow with AI"}
        </Button>
      </div>

      {/* Examples */}
      {!preview && !loading && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Lightbulb className="w-3 h-3" /> Example prompts
          </p>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => setPrompt(ex)}
              className="w-full text-left text-xs text-slate-400 hover:text-slate-200 glass rounded-lg px-3 py-2 transition-colors">
              "{ex}"
            </button>
          ))}
        </div>
      )}

      {/* Preview */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="space-y-4">
            {/* Header */}
            <div className="glass rounded-xl p-4 border border-violet-500/30">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-white">{preview.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{preview.description}</p>
                </div>
                <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 shrink-0">AI Generated</Badge>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge className="bg-slate-700 text-slate-300 text-[10px]">
                  Trigger: {preview.trigger?.type?.replace(/_/g, " ")}
                </Badge>
                <Badge className="bg-slate-700 text-slate-300 text-[10px]">{preview.steps?.length || 0} steps</Badge>
                <Badge className="bg-slate-700 text-slate-300 text-[10px]">{preview.actions?.length || 0} actions</Badge>
              </div>
            </div>

            {/* Steps preview */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Steps</p>
              {preview.steps?.map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-3 glass rounded-xl p-3">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${STEP_COLORS[step.type] || "from-slate-500 to-slate-600"} flex items-center justify-center shrink-0 text-[10px] font-bold text-white`}>
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-white truncate">{step.name}</p>
                      <Badge className="text-[9px] bg-slate-700 text-slate-400 capitalize shrink-0">{step.type}</Badge>
                    </div>
                    {step.explanation && <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{step.explanation}</p>}
                    {step.conditions?.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {step.conditions.map((c, ci) => (
                          <span key={ci} className="text-[10px] bg-slate-800 rounded px-1.5 py-0.5 text-slate-300">
                            {c.field} {c.operator?.replace(/_/g, " ")} {c.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {i < (preview.steps?.length - 1) && (
                    <ChevronRight className="w-4 h-4 text-slate-600 mt-1 shrink-0" />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Actions preview */}
            {preview.actions?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completion Actions</p>
                {preview.actions.map((a, i) => (
                  <div key={i} className="glass rounded-lg px-3 py-2 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-xs text-slate-300 capitalize">{a.type?.replace(/_/g, " ")}</span>
                    {a.config?.recipient && <span className="text-[10px] text-slate-500">→ {a.config.recipient}</span>}
                  </div>
                ))}
              </div>
            )}

            {/* AI note */}
            {preview.ai_note && (
              <div className="glass rounded-xl p-3 border border-blue-500/20">
                <p className="text-[11px] text-blue-300 leading-relaxed">
                  <span className="font-semibold">AI note: </span>{preview.ai_note}
                </p>
              </div>
            )}

            {/* Apply button */}
            <Button onClick={handleApply} className="w-full gap-2">
              <Sparkles className="w-4 h-4" />
              Apply This Workflow
            </Button>
            <button onClick={() => setPreview(null)} className="w-full text-xs text-slate-500 hover:text-slate-400 text-center py-1">
              Discard and try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}