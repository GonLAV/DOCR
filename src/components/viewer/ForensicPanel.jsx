import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fingerprint, Shield, Clock, AlertTriangle } from "lucide-react";

export default function ForensicPanel({ document }) {
  const riskColors = {
    none: "bg-emerald-100 text-emerald-700",
    low: "bg-blue-100 text-blue-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="space-y-4">
      {/* Fingerprint */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-blue-600" />
            Document Fingerprint
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-slate-50 rounded-lg">
            <code className="text-xs text-slate-600 break-all font-mono">
              {document.fingerprint || "Pending analysis..."}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Tampering Risk */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-violet-600" />
            Integrity Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Tampering Risk:</span>
            <Badge className={`text-xs ${riskColors[document.tampering_risk] || riskColors.none}`}>
              {document.tampering_risk || "none"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Scan Metadata */}
      {document.scan_metadata && (
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900">Scan Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(document.scan_metadata).map(([key, value]) => (
                <div key={key} className="p-2 bg-slate-50 rounded-lg">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{key.replace(/_/g, " ")}</p>
                  <p className="text-xs font-medium text-slate-700 mt-0.5">{String(value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Degradation */}
      {document.degradation_estimate && (
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Degradation Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {document.degradation_estimate.estimated_age && (
              <div className="p-2 bg-slate-50 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase">Estimated Age</p>
                <p className="text-xs font-medium text-slate-700">{document.degradation_estimate.estimated_age}</p>
              </div>
            )}
            {document.degradation_estimate.causes && (
              <div className="p-2 bg-slate-50 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase mb-1">Degradation Causes</p>
                <div className="flex flex-wrap gap-1">
                  {document.degradation_estimate.causes.map((cause, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] text-slate-600">
                      {cause}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {document.degradation_estimate.severity && (
              <div className="p-2 bg-slate-50 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase">Severity</p>
                <p className="text-xs font-medium text-slate-700 capitalize">{document.degradation_estimate.severity}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Damage Assessment */}
      {document.damage_assessment && (
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Damage Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-2 bg-slate-50 rounded-lg">
                <p className="text-[10px] text-slate-400 uppercase">Overall Condition</p>
                <p className="text-xs font-medium text-slate-700 capitalize">
                  {document.damage_assessment.overall_condition}
                </p>
              </div>
              {document.damage_assessment.detected_issues && (
                <div className="flex flex-wrap gap-1">
                  {document.damage_assessment.detected_issues.map((issue, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] text-slate-600">
                      {issue.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}