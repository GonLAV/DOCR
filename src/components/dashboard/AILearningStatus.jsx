import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Brain, TrendingUp, AlertTriangle, Cpu, Zap } from "lucide-react";

const LEARNING_ICONS = {
  routing_pattern: TrendingUp,
  resource_prediction: Cpu,
  failure_pattern: AlertTriangle
};

const LEARNING_COLORS = {
  routing_pattern: "from-cyan-500 to-blue-500",
  resource_prediction: "from-emerald-500 to-teal-500",
  failure_pattern: "from-rose-500 to-pink-500"
};

const LEARNING_LABELS = {
  routing_pattern: "Document Pattern",
  resource_prediction: "Performance Model",
  failure_pattern: "Risk Pattern"
};

export default function AILearningStatus() {
  const { data: learnings = [] } = useQuery({
    queryKey: ["workflow-learnings"],
    queryFn: () => base44.entities.WorkflowLearning.filter({ workflow_id: "system", is_active: true }),
    refetchInterval: 30000
  });

  const totalSamples = learnings.reduce((s, l) => s + (l.pattern_data?.sample_count || 0), 0);
  const avgConfidence = learnings.length > 0
    ? Math.round(learnings.reduce((s, l) => s + (l.confidence_score || 0), 0) / learnings.length)
    : 0;

  const grouped = {
    routing_pattern: learnings.filter(l => l.learning_type === "routing_pattern"),
    resource_prediction: learnings.filter(l => l.learning_type === "resource_prediction"),
    failure_pattern: learnings.filter(l => l.learning_type === "failure_pattern")
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-3xl p-6 hover-lift"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center neon-purple">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">AI Learning Engine</h3>
            <p className="text-violet-300 text-xs">Improves with every document</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-white font-black text-2xl">{totalSamples}</div>
          <div className="text-gray-400 text-[10px]">patterns learned</div>
        </div>
      </div>

      {/* Global confidence bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">System Confidence</span>
          <span className="text-violet-300 font-bold">{avgConfidence}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${avgConfidence}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full"
          />
        </div>
      </div>

      {/* Learning categories */}
      <div className="space-y-3">
        {Object.entries(grouped).map(([type, items]) => {
          const Icon = LEARNING_ICONS[type];
          const color = LEARNING_COLORS[type];
          const label = LEARNING_LABELS[type];
          const samples = items.reduce((s, l) => s + (l.pattern_data?.sample_count || 0), 0);
          const conf = items.length > 0
            ? Math.round(items.reduce((s, l) => s + (l.confidence_score || 0), 0) / items.length)
            : 0;

          return (
            <div key={type} className="glass rounded-xl p-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-xs font-semibold">{label}</span>
                  <span className="text-gray-400 text-[10px]">{items.length} class{items.length !== 1 ? "es" : ""} · {samples} samples</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${conf}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full bg-gradient-to-r ${color} rounded-full`}
                  />
                </div>
              </div>
              <span className="text-white text-xs font-bold shrink-0">{conf}%</span>
            </div>
          );
        })}
      </div>

      {/* Pulse indicator */}
      <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
        </span>
        Learning automatically from every processed document
      </div>
    </motion.div>
  );
}