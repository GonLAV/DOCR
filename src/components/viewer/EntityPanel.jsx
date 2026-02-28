import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Star, Calendar, DollarSign, User, FileText, ChevronDown, ChevronUp } from "lucide-react";

const DATA_TYPE_ICONS = {
  date: Calendar,
  currency: DollarSign,
  email: FileText,
  phone: FileText,
  text: FileText,
  number: FileText
};

const FIELD_LABELS = {
  renewal_date: "Renewal Date",
  renewal_terms: "Renewal Terms",
  payment_terms: "Payment Terms",
  due_date: "Due Date",
  key_personnel: "Key Personnel",
  parties_involved: "Parties Involved",
  contract_value: "Contract Value",
  total_amount: "Total Amount",
  effective_date: "Effective Date",
  expiration_date: "Expiration Date"
};

function ConfidenceBar({ value }) {
  const color = value >= 80 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[11px] font-mono text-slate-500 tabular-nums w-8 text-right">{value}%</span>
    </div>
  );
}

function EntityRow({ entity }) {
  const Icon = DATA_TYPE_ICONS[entity.data_type] || FileText;
  const label = FIELD_LABELS[entity.field] || entity.field?.replace(/_/g, " ");

  return (
    <div className={`p-3 rounded-lg space-y-1.5 ${entity.business_critical ? "bg-violet-50/80 border border-violet-100" : "bg-slate-50/80"}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider capitalize">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          {entity.business_critical && (
            <Badge className="text-[9px] h-4 bg-violet-100 text-violet-700 border-violet-200 px-1">
              <Star className="w-2 h-2 mr-0.5" /> Critical
            </Badge>
          )}
          {entity.inferred && (
            <Badge variant="outline" className="text-[9px] h-4 text-amber-600 border-amber-200 bg-amber-50 px-1">
              <Lightbulb className="w-2.5 h-2.5 mr-0.5" /> Inferred
            </Badge>
          )}
        </div>
      </div>
      <p className="text-sm font-medium text-slate-800 break-words">{entity.value}</p>
      {entity.confidence != null && <ConfidenceBar value={Math.round(entity.confidence)} />}
      {entity.source_region && (
        <p className="text-[10px] text-slate-400 italic">Source: {entity.source_region}</p>
      )}
    </div>
  );
}

export default function EntityPanel({ entities, anomalies }) {
  const [showAll, setShowAll] = useState(false);

  const critical = (entities || []).filter(e => e.business_critical);
  const regular = (entities || []).filter(e => !e.business_critical);
  const displayRegular = showAll ? regular : regular.slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Critical Fields */}
      {critical.length > 0 && (
        <Card className="border-violet-200/60 bg-violet-50/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-violet-800 flex items-center gap-2">
              <Star className="w-4 h-4 text-violet-500" /> Critical Fields
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {critical.map((entity, i) => <EntityRow key={i} entity={entity} />)}
          </CardContent>
        </Card>
      )}

      {/* All Extracted Fields */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-900">
            Extracted Entities {entities?.length ? `(${entities.length})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(!entities || entities.length === 0) ? (
            <p className="text-xs text-slate-400 text-center py-4">No entities extracted yet</p>
          ) : (
            <>
              {displayRegular.map((entity, i) => <EntityRow key={i} entity={entity} />)}
              {critical.map((entity, i) => !showAll ? null : <EntityRow key={`c${i}`} entity={entity} />)}
              {regular.length > 4 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full text-xs text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 pt-1"
                >
                  {showAll ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show {regular.length - 4} more</>}
                </button>
              )}
            </>
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
                  }`}>{anomaly.severity}</Badge>
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