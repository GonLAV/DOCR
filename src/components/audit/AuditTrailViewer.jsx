import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock,
  User,
  Edit,
  Trash2,
  Share2,
  CheckCircle,
  AlertCircle,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function AuditTrailViewer({ entityId, entityType = "document" }) {
  const [expandedId, setExpandedId] = useState(null);
  const [filterAction, setFilterAction] = useState("all");

  const { data: auditLogs = [] } = useQuery({
    queryKey: ["auditLog", entityId],
    queryFn: () => base44.entities.AuditLog.filter({ entity_id: entityId, entity_type: entityType }, "-timestamp")
  });

  const filteredLogs = filterAction === "all" 
    ? auditLogs 
    : auditLogs.filter(log => log.action === filterAction);

  const actionIcons = {
    create: Edit,
    update: Edit,
    delete: Trash2,
    share: Share2,
    access: Share2,
    execute: CheckCircle,
    approve: CheckCircle,
    reject: AlertCircle
  };

  const actionColors = {
    create: "text-emerald-400",
    update: "text-blue-400",
    delete: "text-rose-400",
    share: "text-purple-400",
    access: "text-purple-400",
    execute: "text-cyan-400",
    approve: "text-emerald-400",
    reject: "text-amber-400"
  };

  return (
    <Card className="glass-strong border border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span>Audit Trail</span>
          </div>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700/40 text-gray-100 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="create">Created</SelectItem>
              <SelectItem value="update">Updated</SelectItem>
              <SelectItem value="delete">Deleted</SelectItem>
              <SelectItem value="share">Shared</SelectItem>
              <SelectItem value="approve">Approved</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No audit records found</p>
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const IconComponent = actionIcons[log.action] || Edit;
              
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    className="w-full p-3 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center ${actionColors[log.action]}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-gray-100 capitalize">
                            {log.action}
                          </span>
                          <Badge className={
                            log.status === "success" 
                              ? "bg-emerald-500/20 text-emerald-300" 
                              : "bg-rose-500/20 text-rose-300"
                          }>
                            {log.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <User className="w-3 h-3" />
                          <span>{log.user_email}</span>
                          <Clock className="w-3 h-3 ml-1" />
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {log.changes && (
                      <ChevronDown 
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          expandedId === log.id ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedId === log.id && log.changes && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-slate-700/30 bg-slate-800/30 p-3"
                      >
                        <div className="space-y-2 text-xs">
                          {Object.entries(log.changes).map(([key, value]) => (
                            <div key={key} className="flex items-start gap-2">
                              <span className="text-gray-400 min-w-fit">{key}:</span>
                              <span className="text-gray-200 break-words">
                                {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}