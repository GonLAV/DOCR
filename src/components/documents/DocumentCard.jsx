import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
  uploaded: { color: "bg-slate-100 text-slate-600", icon: Clock },
  processing: { color: "bg-blue-100 text-blue-700", icon: Clock },
  analyzing: { color: "bg-violet-100 text-violet-700", icon: Clock },
  completed: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  failed: { color: "bg-rose-100 text-rose-700", icon: AlertTriangle },
};

export default function DocumentCard({ document }) {
  const sc = statusConfig[document.status] || statusConfig.uploaded;
  const StatusIcon = sc.icon;

  return (
    <Link to={createPageUrl("DocumentViewer") + `?id=${document.id}`}>
      <Card className="p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-slate-200/60 group cursor-pointer">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="w-16 h-20 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
            {document.thumbnail_url || document.original_file_url ? (
              <img
                src={document.thumbnail_url || document.original_file_url}
                alt=""
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
              />
            ) : null}
            <div className={`w-full h-full items-center justify-center ${document.thumbnail_url || document.original_file_url ? "hidden" : "flex"}`}>
              <FileText className="w-6 h-6 text-slate-300" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                {document.title}
              </p>
              <Badge className={`text-[10px] shrink-0 ${sc.color}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {document.status}
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              {document.document_class && (
                <span className="capitalize font-medium text-slate-500">{document.document_class}</span>
              )}
              {document.created_date && (
                <span>{format(new Date(document.created_date), "MMM d, yyyy")}</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {document.confidence_score != null && (
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    document.confidence_score >= 80 ? "bg-emerald-500" :
                    document.confidence_score >= 50 ? "bg-amber-500" : "bg-rose-500"
                  }`} />
                  <span className="text-xs font-medium text-slate-600">{document.confidence_score}% confidence</span>
                </div>
              )}
              {document.tampering_risk && document.tampering_risk !== "none" && (
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-amber-500" />
                  <span className="text-[11px] font-medium text-amber-600 capitalize">{document.tampering_risk} risk</span>
                </div>
              )}
              {document.anomalies && document.anomalies.length > 0 && (
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-500" />
                  <span className="text-[11px] font-medium text-rose-600">{document.anomalies.length} anomalies</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}