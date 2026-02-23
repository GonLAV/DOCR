import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function ConfidenceChart({ documents }) {
  const completedDocs = documents.filter(d => d.status === "completed" && d.confidence_score != null);

  const distribution = [
    { range: "0-20", count: 0, color: "#ef4444" },
    { range: "21-40", count: 0, color: "#f97316" },
    { range: "41-60", count: 0, color: "#f59e0b" },
    { range: "61-80", count: 0, color: "#84cc16" },
    { range: "81-100", count: 0, color: "#10b981" },
  ];

  completedDocs.forEach(doc => {
    const score = doc.confidence_score;
    if (score <= 20) distribution[0].count++;
    else if (score <= 40) distribution[1].count++;
    else if (score <= 60) distribution[2].count++;
    else if (score <= 80) distribution[3].count++;
    else distribution[4].count++;
  });

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-900">Confidence Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {completedDocs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No completed documents yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={distribution} barSize={32}>
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {distribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}