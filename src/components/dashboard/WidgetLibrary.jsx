import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  Clock,
  Activity,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";

export default function WidgetLibrary({ availableWidgets, onAddWidget }) {
  const widgetCatalog = [
    {
      id: "documents-overview",
      name: "Documents Overview",
      icon: FileText,
      description: "Total, processing, and completed documents"
    },
    {
      id: "recent-activity",
      name: "Recent Activity",
      icon: Clock,
      description: "Latest document processing activity"
    },
    {
      id: "ai-insights",
      name: "AI Insights",
      icon: Activity,
      description: "Trust scores and confidence metrics"
    },
    {
      id: "processing-stats",
      name: "Processing Stats",
      icon: BarChart3,
      description: "Processing time and accuracy charts"
    },
    {
      id: "alerts",
      name: "Alerts & Issues",
      icon: AlertCircle,
      description: "Flagged documents and anomalies"
    },
    {
      id: "performance",
      name: "Performance Metrics",
      icon: TrendingUp,
      description: "System performance overview"
    }
  ];

  return (
    <div className="glass-ultra rounded-2xl border border-slate-700/30 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-100 mb-1">Widget Library</h3>
        <p className="text-sm text-gray-400">Add widgets to customize your dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {widgetCatalog.map((widget) => {
          const isAdded = availableWidgets.includes(widget.id);
          const Icon = widget.icon;

          return (
            <motion.div
              key={widget.id}
              whileHover={{ scale: 1.02 }}
              className={`glass rounded-xl p-4 border ${
                isAdded 
                  ? "border-emerald-500/30 bg-emerald-500/5" 
                  : "border-slate-700/30 hover:border-slate-600/50"
              } transition-all`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-100">{widget.name}</h4>
                  </div>
                </div>
                {isAdded && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Added
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-3">{widget.description}</p>
              {!isAdded && (
                <Button
                  size="sm"
                  onClick={() => onAddWidget(widget.id)}
                  className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add Widget
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}