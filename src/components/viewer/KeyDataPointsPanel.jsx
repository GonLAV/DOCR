import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Users, FileText, Info } from "lucide-react";

const FIELD_META = {
  renewal_date:    { label: "Renewal Date",     icon: Calendar,   color: "violet" },
  renewal_terms:   { label: "Renewal Terms",    icon: FileText,   color: "violet" },
  effective_date:  { label: "Effective Date",   icon: Calendar,   color: "blue" },
  expiration_date: { label: "Expiration Date",  icon: Calendar,   color: "rose" },
  payment_terms:   { label: "Payment Terms",    icon: DollarSign, color: "emerald" },
  due_date:        { label: "Due Date",         icon: Calendar,   color: "amber" },
  total_amount:    { label: "Total Amount",     icon: DollarSign, color: "emerald" },
  contract_value:  { label: "Contract Value",   icon: DollarSign, color: "emerald" },
  key_personnel:   { label: "Key Personnel",    icon: Users,      color: "blue" },
  party_1:         { label: "Party 1",          icon: Users,      color: "blue" },
  party_2:         { label: "Party 2",          icon: Users,      color: "blue" },
  governing_law:   { label: "Governing Law",    icon: FileText,   color: "slate" },
  invoice_number:  { label: "Invoice Number",   icon: FileText,   color: "slate" },
  vendor_name:     { label: "Vendor",           icon: Users,      color: "blue" },
  customer_name:   { label: "Customer",         icon: Users,      color: "blue" }
};

const COLOR_CLASSES = {
  violet:  { bg: "bg-violet-50", border: "border-violet-200", icon: "text-violet-500", label: "text-violet-700" },
  blue:    { bg: "bg-blue-50",   border: "border-blue-200",   icon: "text-blue-500",   label: "text-blue-700" },
  rose:    { bg: "bg-rose-50",   border: "border-rose-200",   icon: "text-rose-500",   label: "text-rose-700" },
  amber:   { bg: "bg-amber-50",  border: "border-amber-200",  icon: "text-amber-500",  label: "text-amber-700" },
  emerald: { bg: "bg-emerald-50",border: "border-emerald-200",icon: "text-emerald-500",label: "text-emerald-700" },
  slate:   { bg: "bg-slate-50",  border: "border-slate-200",  icon: "text-slate-400",  label: "text-slate-600" }
};

export default function KeyDataPointsPanel({ keyDataPoints, documentClass, classificationTier, classificationRationale }) {
  if (!keyDataPoints || Object.keys(keyDataPoints).length === 0) return null;

  const entries = Object.entries(keyDataPoints).filter(([, v]) => v);

  return (
    <Card className="border-blue-200/60 bg-gradient-to-br from-blue-50/30 to-violet-50/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-800">Key Data Points</CardTitle>
          {classificationTier && (
            <Badge className={`text-[10px] ${
              classificationTier === "high"   ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
              classificationTier === "medium" ? "bg-amber-100 text-amber-700 border-amber-200" :
                                                "bg-rose-100 text-rose-700 border-rose-200"
            }`}>
              {classificationTier === "high" ? "High confidence" : classificationTier === "medium" ? "Review suggested" : "Low confidence"}
            </Badge>
          )}
        </div>
        {classificationRationale && (
          <p className="text-[11px] text-slate-500 flex items-start gap-1 mt-1">
            <Info className="w-3 h-3 shrink-0 mt-0.5 text-slate-400" />
            {classificationRationale}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {entries.map(([key, value]) => {
            const meta = FIELD_META[key] || { label: key.replace(/_/g, " "), icon: FileText, color: "slate" };
            const colors = COLOR_CLASSES[meta.color] || COLOR_CLASSES.slate;
            const Icon = meta.icon;
            return (
              <div key={key} className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${colors.bg} ${colors.border}`}>
                <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${colors.icon}`} />
                <div className="min-w-0">
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${colors.label}`}>{meta.label}</p>
                  <p className="text-xs text-slate-800 break-words mt-0.5">{value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}