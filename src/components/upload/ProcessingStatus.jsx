import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Circle } from "lucide-react";
import PipelineStages from "@/components/dashboard/PipelineStages";

export default function ProcessingStatus({ documents }) {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-700">Processing Queue</h3>
      {documents.map((doc, i) => (
        <motion.div
          key={doc.id || i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-4 bg-white rounded-xl border border-slate-200 space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-800">{doc.title}</p>
            <div className="flex items-center gap-2">
              {doc.status === "completed" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : doc.status === "failed" ? (
                <Circle className="w-4 h-4 text-rose-500" />
              ) : (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              )}
              <span className="text-xs font-medium text-slate-500 capitalize">{doc.status}</span>
            </div>
          </div>
          {doc.pipeline_stage && doc.status !== "completed" && doc.status !== "failed" && (
            <PipelineStages currentStage={doc.pipeline_stage} />
          )}
          {doc.status === "completed" && (
            <PipelineStages currentStage="done" />
          )}
        </motion.div>
      ))}
    </div>
  );
}