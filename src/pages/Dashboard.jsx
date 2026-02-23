import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { FileText, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import RecentDocuments from "@/components/dashboard/RecentDocuments";
import ConfidenceChart from "@/components/dashboard/ConfidenceChart";

export default function Dashboard() {
  const { data: documents = [] } = useQuery({
    queryKey: ["documents"],
    queryFn: () => base44.entities.Document.list("-created_date", 50),
  });

  const total = documents.length;
  const completed = documents.filter(d => d.status === "completed").length;
  const processing = documents.filter(d => ["processing", "analyzing"].includes(d.status)).length;
  const flagged = documents.filter(d => d.tampering_risk === "high" || d.tampering_risk === "medium").length;
  const avgConfidence = completed > 0
    ? Math.round(documents.filter(d => d.confidence_score != null).reduce((s, d) => s + d.confidence_score, 0) / completed)
    : 0;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Document intelligence overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Documents" value={total} icon={FileText} color="blue" subtitle={`${processing} processing`} />
        <StatCard title="Completed" value={completed} icon={CheckCircle2} color="emerald" subtitle={`${avgConfidence}% avg confidence`} />
        <StatCard title="In Progress" value={processing} icon={Clock} color="amber" />
        <StatCard title="Flagged" value={flagged} icon={AlertTriangle} color="rose" subtitle="Tampering risk" />
      </div>

      {/* Charts & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentDocuments documents={documents} />
        <ConfidenceChart documents={documents} />
      </div>
    </div>
  );
}