import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, Lightbulb, ExternalLink } from "lucide-react";
import { createPageUrl } from "@/utils";

const HELP_CONTENT = {
  "workflow_builder": {
    title: "Workflow Builder",
    tips: [
      "Add steps in sequence — each step can have conditions to branch logic.",
      "Use 'Conditional' step type to route documents based on extracted data values.",
      "The AI Optimization Panel (below) analyzes your workflow and suggests improvements automatically."
    ],
    link: "Workflows"
  },
  "ai_optimization": {
    title: "AI Optimization Engine",
    tips: [
      "Run analysis after at least 5 workflow executions for meaningful insights.",
      "Bottlenecks are scored by severity — focus on 'critical' ones first.",
      "The Adaptive Routing tab learns from successful completions and auto-suggests assignees."
    ],
    link: "Workflows"
  },
  "confidence_score": {
    title: "Confidence Scores",
    tips: [
      "Scores above 85% are considered reliable for automated processing.",
      "Low confidence fields are highlighted — click them to see AI correction suggestions.",
      "Human corrections feed back into the model to improve future accuracy."
    ],
    link: "Documents"
  },
  "anomaly_detection": {
    title: "Anomaly Detection",
    tips: [
      "Anomalies are flagged based on trained models for each document type.",
      "Configure detection sensitivity in Document Type Configuration.",
      "Critical anomalies automatically pause workflow execution for review."
    ],
    link: "DocumentTypeConfiguration"
  },
  "batch_processing": {
    title: "Batch Processing",
    tips: [
      "Select multiple documents to reprocess, validate, or export together.",
      "Batch jobs run asynchronously — you'll be notified on completion.",
      "Use filters to select documents by type, status, or confidence range."
    ],
    link: "BatchProcessing"
  },
  "version_control": {
    title: "Workflow Versioning",
    tips: [
      "Save a version before making significant workflow changes.",
      "You can revert to any previous version at any time.",
      "Version labels (e.g., 'stable', 'v2.0') help track major milestones."
    ],
    link: "Workflows"
  }
};

export default function ContextualHelp({ topic, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const content = HELP_CONTENT[topic];
  if (!content) return null;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 hover:bg-blue-500/30 transition-colors"
      >
        <HelpCircle className="w-3 h-3" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              className="absolute left-0 top-7 z-50 w-72"
            >
              <div className="glass-ultra rounded-xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600/20 to-violet-600/20 px-3 py-2 flex items-center justify-between border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-xs font-bold text-gray-200">{content.title}</span>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-200">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-3 space-y-2">
                  {content.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        {i + 1}
                      </span>
                      <p className="text-xs text-gray-300 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
                {content.link && (
                  <div className="px-3 pb-3">
                    <a
                      href={createPageUrl(content.link)}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open {content.title}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}