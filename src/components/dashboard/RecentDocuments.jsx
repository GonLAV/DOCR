import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  uploaded: "bg-slate-100 text-slate-600",
  processing: "bg-blue-100 text-blue-700",
  analyzing: "bg-violet-100 text-violet-700",
  completed: "bg-emerald-100 text-emerald-700",
  failed: "bg-rose-100 text-rose-700",
};

export default function RecentDocuments({ documents }) {
  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-900">Recent Documents</CardTitle>
          <Link
            to={createPageUrl("Documents")}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {documents.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No documents yet. Upload your first document.
          </div>
        ) : (
          documents.slice(0, 5).map((doc) => (
            <Link
              key={doc.id}
              to={createPageUrl("DocumentViewer") + `?id=${doc.id}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
                <FileText className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{doc.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock className="w-3 h-3 text-slate-300" />
                  <span className="text-[11px] text-slate-400">
                    {doc.created_date ? format(new Date(doc.created_date), "MMM d, h:mm a") : "Just now"}
                  </span>
                </div>
              </div>
              <Badge className={`text-[10px] ${statusColors[doc.status] || statusColors.uploaded}`}>
                {doc.status}
              </Badge>
              {doc.confidence_score != null && (
                <span className={`text-xs font-semibold tabular-nums
                  ${doc.confidence_score >= 80 ? "text-emerald-600" : doc.confidence_score >= 50 ? "text-amber-600" : "text-rose-600"}
                `}>
                  {doc.confidence_score}%
                </span>
              )}
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}