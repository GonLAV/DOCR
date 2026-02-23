import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default function BatchHistoryTable({ batches }) {
  const statusConfig = {
    completed: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    failed: { color: "bg-rose-100 text-rose-700", icon: XCircle },
    cancelled: { color: "bg-gray-100 text-gray-700", icon: XCircle }
  };

  return (
    <Card className="glass-strong border border-white/20">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Job Name</th>
                <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Action</th>
                <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Documents</th>
                <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Success Rate</th>
                <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Completed</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch, index) => {
                const config = statusConfig[batch.status] || statusConfig.completed;
                const StatusIcon = config.icon;
                const progress = batch.progress || { total: 0, completed: 0, failed: 0 };
                const successRate = progress.total > 0 
                  ? Math.round(((progress.completed - progress.failed) / progress.total) * 100) 
                  : 0;

                return (
                  <tr 
                    key={batch.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">{batch.job_name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-300 capitalize">
                        {batch.action_type.replace('_', ' ')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">{progress.total}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-[10px] ${config.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {batch.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-[80px]">
                          <div 
                            className={`h-full ${successRate >= 90 ? 'bg-emerald-500' : successRate >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${successRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-white">{successRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-400">
                        {batch.completed_at 
                          ? format(new Date(batch.completed_at), "MMM d, HH:mm")
                          : "N/A"}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}