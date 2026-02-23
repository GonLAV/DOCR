import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AISummaryLayer({ document }) {
  const queryClient = useQueryClient();

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('generateDocumentSummary', {
        document_id: document.id
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['document', document.id]);
      queryClient.invalidateQueries(['documents-workflow']);
      toast.success('AI summary regenerated');
    },
    onError: (error) => {
      toast.error('Failed to regenerate summary: ' + error.message);
    }
  });

  const summary = document.ai_summary;

  if (!summary) {
    return (
      <Card className="glass-strong border-white/20">
        <CardContent className="p-8 text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 mb-4"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-white font-semibold mb-2">No AI Summary Available</p>
          <p className="text-gray-400 text-sm mb-4">
            Generate an AI-powered executive summary of this document
          </p>
          <Button
            onClick={() => regenerateMutation.mutate()}
            disabled={regenerateMutation.isPending}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            {regenerateMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Summary
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Regenerate Button */}
      <Card className="glass-strong border-cyan-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              AI Executive Summary
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => regenerateMutation.mutate()}
              disabled={regenerateMutation.isPending}
              className="border-white/20 text-white hover:bg-white/10"
            >
              {regenerateMutation.isPending ? (
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3 mr-1" />
              )}
              Regenerate
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">
              Generated {new Date(summary.generated_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Section */}
      <Card className="glass-strong border-white/20">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-bold text-white">Executive Overview</h4>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">
            {summary.overview}
          </p>
        </CardContent>
      </Card>

      {/* Key Entities Grid */}
      {summary.key_entities && summary.key_entities.length > 0 && (
        <Card className="glass-strong border-white/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">Key Extracted Data</h4>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {summary.key_entities.map((entity, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-lg p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-1">{entity.field}</p>
                      <p className="text-sm font-semibold text-white break-words">
                        {entity.value}
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-300 shrink-0">
                      ✓
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confidence Assessment */}
      {summary.confidence_summary && (
        <Card className="glass-strong border-blue-500/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-bold text-white">Confidence Assessment</h4>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-200 leading-relaxed">
                {summary.confidence_summary}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Anomalies & Issues */}
      {summary.anomalies_summary && summary.anomalies_summary !== "N/A" && (
        <Card className="glass-strong border-amber-500/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">Issues & Anomalies</h4>
            </div>
            <div className="glass rounded-lg p-4 border border-amber-500/20">
              <p className="text-sm text-amber-200 leading-relaxed">
                {summary.anomalies_summary}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {summary.recommendations && summary.recommendations.length > 0 && (
        <Card className="glass-strong border-purple-500/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-bold text-white">Recommended Actions</h4>
            </div>
            <div className="space-y-2">
              {summary.recommendations.map((rec, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-lg p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-300">{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed flex-1">
                      {rec}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Metadata */}
      <Card className="glass-strong border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-400">
              <Sparkles className="w-3 h-3" />
              <span>AI-Generated Summary</span>
            </div>
            <Badge className="bg-cyan-500/20 text-cyan-300 text-xs">
              Forensic Grade
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}