import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle2, Scale, Building2 } from "lucide-react";

export default function TrustMeter({ trustScore }) {
  if (!trustScore) return null;

  const trust = trustScore.overall_trust || 0;
  
  const trustLevel = trust >= 95 ? {
    label: "Court-Grade",
    color: "emerald",
    icon: Scale,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200"
  } : trust >= 90 ? {
    label: "Bank-Grade",
    color: "blue",
    icon: Building2,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200"
  } : trust >= 70 ? {
    label: "High Trust",
    color: "violet",
    icon: Shield,
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200"
  } : trust >= 50 ? {
    label: "Review Required",
    color: "amber",
    icon: AlertTriangle,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200"
  } : {
    label: "Manual Review",
    color: "rose",
    icon: AlertTriangle,
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200"
  };

  const TrustIcon = trustLevel.icon;

  return (
    <Card className={`border-2 ${trustLevel.border} ${trustLevel.bg}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-sm font-bold ${trustLevel.text} flex items-center gap-2`}>
            <TrustIcon className="w-5 h-5" />
            Trust Score: {trust}%
          </CardTitle>
          <Badge className={`${trustLevel.bg} ${trustLevel.text} border ${trustLevel.border}`}>
            {trustLevel.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trust factors */}
        <div className="grid grid-cols-2 gap-3">
          <TrustFactor 
            label="Extraction Certainty"
            value={trustScore.extraction_certainty}
            color={trustLevel.color}
          />
          <TrustFactor 
            label="Model Consensus"
            value={trustScore.model_consensus_score}
            color={trustLevel.color}
          />
          <TrustFactor 
            label="Validation Pass"
            value={trustScore.validation_pass_rate}
            color={trustLevel.color}
          />
          <TrustFactor 
            label="Pixel Quality"
            value={trustScore.pixel_quality_score}
            color={trustLevel.color}
          />
        </div>

        {/* Reconstruction risk */}
        <div className="pt-3 border-t border-white/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600">Reconstruction Risk</span>
            <span className={`text-xs font-bold ${
              trustScore.reconstruction_risk > 20 ? "text-rose-600" :
              trustScore.reconstruction_risk > 10 ? "text-amber-600" : "text-emerald-600"
            }`}>
              {trustScore.reconstruction_risk?.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-white/60 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                trustScore.reconstruction_risk > 20 ? "bg-rose-500" :
                trustScore.reconstruction_risk > 10 ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, trustScore.reconstruction_risk)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5">
            {trustScore.reconstruction_risk > 20 
              ? "High AI inference - requires manual verification"
              : trustScore.reconstruction_risk > 10
              ? "Moderate AI inference - review flagged regions"
              : "Minimal AI inference - high source fidelity"}
          </p>
        </div>

        {/* Readiness indicators */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/50">
          <ReadinessIndicator 
            label="Court Ready"
            ready={trustScore.court_ready}
          />
          <ReadinessIndicator 
            label="Bank Ready"
            ready={trustScore.bank_ready}
          />
        </div>

        {/* Recommended action */}
        {trustScore.recommended_action && (
          <div className={`p-3 rounded-lg border ${
            trustScore.recommended_action === "approve" ? "bg-emerald-50/50 border-emerald-200" :
            trustScore.recommended_action === "review_flagged_fields" ? "bg-amber-50/50 border-amber-200" :
            "bg-rose-50/50 border-rose-200"
          }`}>
            <p className="text-xs font-semibold text-slate-700 mb-1">Recommended Action:</p>
            <p className="text-xs text-slate-600 capitalize">
              {trustScore.recommended_action.replace(/_/g, " ")}
            </p>
          </div>
        )}

        {/* High risk fields */}
        {trustScore.high_risk_fields && trustScore.high_risk_fields.length > 0 && (
          <div className="pt-3 border-t border-white/50">
            <p className="text-xs font-semibold text-slate-700 mb-2">Requires Review:</p>
            <div className="flex flex-wrap gap-1">
              {trustScore.high_risk_fields.map((field, i) => (
                <Badge key={i} variant="outline" className="text-[10px] text-rose-600 border-rose-200">
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TrustFactor({ label, value, color }) {
  const percentage = value || 0;
  const colorMap = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    violet: "bg-violet-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500"
  };

  return (
    <div className="p-2.5 bg-white/60 rounded-lg">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-medium text-slate-600">{label}</span>
        <span className="text-xs font-bold text-slate-700">{percentage?.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorMap[color] || colorMap.violet} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ReadinessIndicator({ label, ready }) {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border flex-1 justify-center ${
      ready 
        ? "bg-emerald-50/50 border-emerald-200" 
        : "bg-slate-50/50 border-slate-200"
    }`}>
      {ready ? (
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
      ) : (
        <AlertTriangle className="w-3 h-3 text-slate-400" />
      )}
      <span className={`text-[10px] font-medium ${
        ready ? "text-emerald-700" : "text-slate-500"
      }`}>
        {label}
      </span>
    </div>
  );
}