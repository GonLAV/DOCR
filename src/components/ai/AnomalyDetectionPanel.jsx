import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AnomalyDetectionPanel({ document }) {
  const queryClient = useQueryClient();

  const detectMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke("detectAnomalies", {
        document_id: document.id
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", document.id] });
      toast.success("Anomaly detection completed");
    },
    onError: () => {
      toast.error("Failed to detect anomalies");
    }
  });

  const severityColors = {
    critical: "bg-red-500/20 text-red-300 border-red-500/30",
    high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    low: "bg-blue-500/20 text-blue-300 border-blue-500/30"
  };

  const severityIcons = {
    critical: AlertTriangle,
    high: AlertTriangle,
    medium: AlertCircle,
    low: TrendingUp
  };

  const hasAnomalies = document.anomalies && document.anomalies.length > 0;
  const riskScore = document.tampering_risk === "high" ? 75 : 
                    document.tampering_risk === "medium" ? 50 : 25;

  return (
    <Card className="glass-strong border border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Anomaly Detection</span>
          </div>
          <Button
            size="sm"
            onClick={() => detectMutation.mutate()}
            disabled={detectMutation.isPending || !document.document_class}
            className="gap-1.5 h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${detectMutation.isPending ? "animate-spin" : ""}`} />
            Scan
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!document.document_class && (
          <div className="text-center py-4 text-gray-400">
            <p className="text-xs">Classify document first to enable anomaly detection</p>
          </div>
        )}

        {document.document_class && (
          <>
            {/* Risk Score */}
            <div className="glass rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-300">Risk Score</span>
                <span className={`text-sm font-bold ${
                  riskScore > 70 ? "text-red-400" :
                  riskScore > 40 ? "text-amber-400" : "text-emerald-400"
                }`}>
                  {riskScore}%
                </span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    riskScore > 70 ? "bg-gradient-to-r from-red-500 to-red-400" :
                    riskScore > 40 ? "bg-gradient-to-r from-amber-500 to-orange-400" :
                    "bg-gradient-to-r from-emerald-500 to-green-400"
                  }`}
                  style={{ width: `${riskScore}%` }}
                />
              </div>
            </div>

            {/* Anomalies List */}
            {hasAnomalies ? (
              <div className="space-y-2">
                {document.anomalies.slice(0, 5).map((anomaly, index) => {
                  const IconComponent = severityIcons[anomaly.severity] || AlertCircle;
                  
                  return (
                    <div
                      key={index}
                      className={`glass rounded-lg p-3 border ${severityColors[anomaly.severity]}`}
                    >
                      <div className="flex items-start gap-2">
                        <IconComponent className="w-4 h-4 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="font-semibold text-sm mb-0.5">
                            {anomaly.type}
                          </div>
                          <p className="text-xs leading-relaxed">
                            {anomaly.description}
                          </p>
                          {anomaly.affected_fields && anomaly.affected_fields.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {anomaly.affected_fields.slice(0, 3).map((field, i) => (
                                <Badge key={i} className="bg-slate-700/50 text-gray-300 text-[9px]">
                                  {field}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Badge className={severityColors[anomaly.severity]} variant="outline" className="shrink-0">
                          {anomaly.severity}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No anomalies detected</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}