import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Lightbulb,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function WorkflowOptimizationPanel({ workflowId }) {
  const queryClient = useQueryClient();

  // Fetch latest optimization
  const { data: optimizations = [] } = useQuery({
    queryKey: ["workflowOptimizations", workflowId],
    queryFn: () => base44.entities.WorkflowOptimization.filter({ workflow_id: workflowId }, "-analysis_date", 1)
  });

  const optimization = optimizations[0];

  // Analyze workflow mutation
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke("analyzeWorkflowPerformance", {
        workflow_id: workflowId
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflowOptimizations", workflowId] });
      toast.success("Workflow analysis completed");
    },
    onError: () => {
      toast.error("Failed to analyze workflow");
    }
  });

  const severityConfig = {
    low: { color: "text-blue-400", bg: "bg-blue-500/20", icon: CheckCircle },
    medium: { color: "text-amber-400", bg: "bg-amber-500/20", icon: AlertTriangle },
    high: { color: "text-orange-400", bg: "bg-orange-500/20", icon: AlertTriangle },
    critical: { color: "text-rose-400", bg: "bg-rose-500/20", icon: AlertTriangle }
  };

  const impactConfig = {
    low: { color: "text-slate-400", label: "Low Impact" },
    medium: { color: "text-blue-400", label: "Medium Impact" },
    high: { color: "text-emerald-400", label: "High Impact" }
  };

  const effortConfig = {
    low: { color: "text-emerald-400", label: "Quick Win" },
    medium: { color: "text-amber-400", label: "Moderate Effort" },
    high: { color: "text-rose-400", label: "High Effort" }
  };

  if (!optimization) {
    return (
      <Card className="glass-strong border border-white/20">
        <CardContent className="p-12 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-400 opacity-60" />
          <h3 className="text-lg font-semibold text-gray-100 mb-2">AI Workflow Optimization</h3>
          <p className="text-sm text-gray-400 mb-4">
            Analyze workflow performance to identify bottlenecks and get AI-powered improvement recommendations
          </p>
          <Button
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
            className="gap-2"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run AI Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Performance Overview */}
      <Card className="glass-strong border border-purple-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              AI Optimization Insights
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => analyzeMutation.mutate()}
              disabled={analyzeMutation.isPending}
              className="gap-1.5"
            >
              {analyzeMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              Re-analyze
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="glass rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Efficiency</span>
              </div>
              <div className="text-2xl font-bold text-gray-100">
                {optimization.efficiency_score}%
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-2">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  style={{ width: `${optimization.efficiency_score}%` }}
                />
              </div>
            </div>

            <div className="glass rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-gray-400">Delay Risk</span>
              </div>
              <div className="text-2xl font-bold text-gray-100">
                {optimization.predicted_delay_risk}%
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-2">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                  style={{ width: `${optimization.predicted_delay_risk}%` }}
                />
              </div>
            </div>

            <div className="glass rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-gray-400">Success Rate</span>
              </div>
              <div className="text-2xl font-bold text-gray-100">
                {optimization.performance_metrics?.success_rate?.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Last analyzed: {new Date(optimization.analysis_date).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Bottlenecks */}
      {optimization.bottlenecks && optimization.bottlenecks.length > 0 && (
        <Card className="glass-strong border border-white/20">
          <CardHeader>
            <CardTitle className="text-gray-100 text-base">Identified Bottlenecks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {optimization.bottlenecks.map((bottleneck, index) => {
              const config = severityConfig[bottleneck.severity];
              const IconComponent = config.icon;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass rounded-lg p-3 border ${config.bg} border-opacity-20`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                      <IconComponent className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-100">{bottleneck.step_name}</span>
                        <Badge className={`${config.bg} ${config.color} capitalize`}>
                          {bottleneck.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{bottleneck.description}</p>
                      <div className="flex gap-3 text-xs text-gray-500">
                        <span>Avg: {bottleneck.avg_duration}s</span>
                        <span>Failure: {bottleneck.failure_rate}%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {optimization.recommendations && optimization.recommendations.length > 0 && (
        <Card className="glass-strong border border-white/20">
          <CardHeader>
            <CardTitle className="text-gray-100 text-base flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {optimization.recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-lg p-3"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="text-sm font-semibold text-gray-100">{rec.title}</h4>
                  <div className="flex gap-1 shrink-0">
                    <Badge className={`text-xs ${impactConfig[rec.impact].color}`}>
                      {impactConfig[rec.impact].label}
                    </Badge>
                    <Badge className={`text-xs ${effortConfig[rec.effort].color}`}>
                      {effortConfig[rec.effort].label}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{rec.description}</p>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}