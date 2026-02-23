import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function BatchStatusCard({ batch }) {
  const progress = batch.progress || { total: 0, completed: 0, failed: 0 };
  const percentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  const statusConfig = {
    pending: { color: "bg-slate-500", icon: Clock, label: "Pending" },
    processing: { color: "bg-blue-500", icon: Loader2, label: "Processing", animate: true },
    completed: { color: "bg-emerald-500", icon: CheckCircle2, label: "Completed" },
    failed: { color: "bg-rose-500", icon: XCircle, label: "Failed" },
    cancelled: { color: "bg-gray-500", icon: XCircle, label: "Cancelled" }
  };

  const config = statusConfig[batch.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="glass-strong border border-white/20">
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white mb-1">{batch.job_name}</h3>
              <p className="text-xs text-gray-400 capitalize">{batch.action_type.replace('_', ' ')}</p>
            </div>
            <Badge className={`${config.color} text-white text-[10px]`}>
              <StatusIcon className={`w-3 h-3 mr-1 ${config.animate ? 'animate-spin' : ''}`} />
              {config.label}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-gray-300 mb-2">
              <span>Progress</span>
              <span className="font-bold">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-2 bg-white/10" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="glass rounded-lg p-2 text-center">
              <div className="text-gray-400 mb-1">Total</div>
              <div className="text-white font-bold">{progress.total}</div>
            </div>
            <div className="glass rounded-lg p-2 text-center">
              <div className="text-gray-400 mb-1">Done</div>
              <div className="text-emerald-400 font-bold">{progress.completed}</div>
            </div>
            <div className="glass rounded-lg p-2 text-center">
              <div className="text-gray-400 mb-1">Failed</div>
              <div className="text-rose-400 font-bold">{progress.failed}</div>
            </div>
          </div>

          {/* Timestamp */}
          {batch.started_at && (
            <p className="text-[10px] text-gray-500">
              Started: {new Date(batch.started_at).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}