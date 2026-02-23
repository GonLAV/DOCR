import React from "react";
import { Shield, Sparkles, LayoutGrid, Brain, BarChart3, FileOutput } from "lucide-react";

const stages = [
  { key: "preservation", label: "Forensic Preservation", icon: Shield, color: "blue" },
  { key: "enhancement", label: "AI Enhancement", icon: Sparkles, color: "violet" },
  { key: "layout", label: "Layout Analysis", icon: LayoutGrid, color: "amber" },
  { key: "semantic", label: "Semantic Understanding", icon: Brain, color: "emerald" },
  { key: "confidence", label: "Confidence Scoring", icon: BarChart3, color: "rose" },
  { key: "output", label: "Output Generation", icon: FileOutput, color: "slate" },
];

const colorMap = {
  blue: { active: "bg-blue-600", done: "bg-blue-100 text-blue-700", pending: "bg-slate-100 text-slate-400" },
  violet: { active: "bg-violet-600", done: "bg-violet-100 text-violet-700", pending: "bg-slate-100 text-slate-400" },
  amber: { active: "bg-amber-500", done: "bg-amber-100 text-amber-700", pending: "bg-slate-100 text-slate-400" },
  emerald: { active: "bg-emerald-600", done: "bg-emerald-100 text-emerald-700", pending: "bg-slate-100 text-slate-400" },
  rose: { active: "bg-rose-600", done: "bg-rose-100 text-rose-700", pending: "bg-slate-100 text-slate-400" },
  slate: { active: "bg-slate-600", done: "bg-slate-200 text-slate-700", pending: "bg-slate-100 text-slate-400" },
};

export default function PipelineStages({ currentStage }) {
  const stageOrder = stages.map(s => s.key);
  const currentIndex = stageOrder.indexOf(currentStage);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {stages.map((stage, i) => {
        const status = currentStage === "done"
          ? "done"
          : i < currentIndex ? "done"
          : i === currentIndex ? "active"
          : "pending";
        const c = colorMap[stage.color];

        return (
          <React.Fragment key={stage.key}>
            {i > 0 && (
              <div className={`w-6 h-[2px] shrink-0 ${status === "pending" ? "bg-slate-200" : "bg-slate-300"}`} />
            )}
            <div
              className={`pipeline-stage flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium shrink-0
                ${status === "active" ? `${c.active} text-white shadow-sm animate-gentle-pulse` : ""}
                ${status === "done" ? c.done : ""}
                ${status === "pending" ? c.pending : ""}
              `}
            >
              <stage.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{stage.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}