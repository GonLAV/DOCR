import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function ConfidenceOverview({ document }) {
  const score = document.confidence_score || 0;
  const color = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 80 ? "High" : score >= 50 ? "Medium" : "Low";

  const data = [
    { name: "Confidence", value: score },
    { name: "Uncertainty", value: 100 - score },
  ];

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-900">Overall Confidence</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={32}
                  outerRadius={48}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={color} />
                  <Cell fill="#f1f5f9" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-slate-900">{score}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-sm font-medium text-slate-700">{label} Confidence</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {score >= 80
                ? "This document was analyzed with high confidence. Most fields were clearly readable."
                : score >= 50
                ? "Some fields required inference. Review flagged areas for accuracy."
                : "Significant portions required AI reconstruction. Manual verification recommended."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}