import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from "lucide-react";

function ConfidenceBar({ value }) {
  const color = value >= 80 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[11px] font-mono text-slate-500 tabular-nums w-8 text-right">{value}%</span>
    </div>
  );
}

export default function EntityPanel({ entities, anomalies }) {
  return (
    <div className="space-y-4">
      {/* Extracted Entities */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-900">Extracted Entities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(!entities || entities.length === 0) ? (
            <p className="text-xs text-slate-400 text-center py-4">No entities extracted yet</p>
          ) : (
            entities.map((entity, i) => (
              <div key={i} className="p-3 bg-slate-50/80 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{entity.field}</span>
                  {entity.inferred && (
                    <Badge variant="outline" className="text-[9px] h-4 text-amber-600 border-amber-200 bg-amber-50">
                      <Lightbulb className="w-2.5 h-2.5 mr-0.5" /> Inferred
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-800">{entity.value}</p>
                {entity.confidence != null && (
                  <ConfidenceBar value={Math.round(entity.confidence)} />
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Anomalies */}
      {anomalies && anomalies.length > 0 && (
        <Card className="border-rose-200/60 bg-rose-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-rose-800">Anomalies Detected</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {anomalies.map((anomaly, i) => (
              <div key={i} className="p-3 bg-white rounded-lg border border-rose-100 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={`text-[10px] ${
                    anomaly.severity === "high" ? "bg-rose-100 text-rose-700" :
                    anomaly.severity === "medium" ? "bg-amber-100 text-amber-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {anomaly.severity}
                  </Badge>
                  <span className="text-xs font-medium text-slate-600 capitalize">{anomaly.type}</span>
                </div>
                <p className="text-xs text-slate-600">{anomaly.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}