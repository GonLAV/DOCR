import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity,
  Pause,
  Play,
  XCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function WorkflowMonitoring() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  // Fetch running executions
  const { data: executions = [] } = useQuery({
    queryKey: ["workflowExecutions", filterStatus],
    queryFn: async () => {
      const allExecutions = await base44.entities.WorkflowExecution.list("-created_date");
      return filterStatus === "all" 
        ? allExecutions 
        : allExecutions.filter(e => e.status === filterStatus);
    },
    refetchInterval: 3000 // Real-time updates every 3 seconds
  });

  // Fetch workflows for name mapping
  const { data: workflows = [] } = useQuery({
    queryKey: ["workflows"],
    queryFn: () => base44.entities.Workflow.list()
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = base44.entities.WorkflowExecution.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ["workflowExecutions"] });
    });
    return unsubscribe;
  }, [queryClient]);

  // Control mutations
  const controlMutation = useMutation({
    mutationFn: async ({ executionId, action }) => {
      const { data } = await base44.functions.invoke("controlWorkflowExecution", {
        execution_id: executionId,
        action
      });
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workflowExecutions"] });
      const actionLabels = { pause: "paused", resume: "resumed", cancel: "cancelled" };
      toast.success(`Workflow ${actionLabels[variables.action]}`);
    },
    onError: () => {
      toast.error("Failed to control workflow");
    }
  });

  const statusConfig = {
    pending: { icon: Clock, color: "text-slate-400", bg: "bg-slate-500/20", label: "Pending" },
    running: { icon: Loader2, color: "text-blue-400", bg: "bg-blue-500/20", label: "Running", spin: true },
    completed: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/20", label: "Completed" },
    failed: { icon: AlertCircle, color: "text-rose-400", bg: "bg-rose-500/20", label: "Failed" },
    cancelled: { icon: XCircle, color: "text-amber-400", bg: "bg-amber-500/20", label: "Cancelled" }
  };

  const getWorkflowName = (workflowId) => {
    const workflow = workflows.find(w => w.id === workflowId);
    return workflow?.name || "Unknown Workflow";
  };

  const filteredExecutions = executions.filter(exec => 
    getWorkflowName(exec.workflow_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: executions.length,
    running: executions.filter(e => e.status === "running").length,
    completed: executions.filter(e => e.status === "completed").length,
    failed: executions.filter(e => e.status === "failed").length
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Workflow Monitoring</h1>
          <p className="text-gray-400 text-sm">Real-time workflow execution dashboard</p>
        </div>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["workflowExecutions"] })}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-strong border border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Total Executions</p>
                <p className="text-2xl font-bold text-gray-100">{stats.total}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-strong border border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Running</p>
                <p className="text-2xl font-bold text-blue-400">{stats.running}</p>
              </div>
              <Loader2 className="w-8 h-8 text-blue-400 opacity-60 animate-spin" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-strong border border-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Completed</p>
                <p className="text-2xl font-bold text-emerald-400">{stats.completed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-strong border border-rose-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Failed</p>
                <p className="text-2xl font-bold text-rose-400">{stats.failed}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-rose-400 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-strong border border-white/20">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700/40 text-gray-100"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48 bg-slate-800/50 border-slate-700/40 text-gray-100">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Executions List */}
      <div className="space-y-3">
        {filteredExecutions.length === 0 ? (
          <Card className="glass-strong border border-white/20">
            <CardContent className="p-12 text-center">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-30 text-gray-400" />
              <p className="text-gray-400">No workflow executions found</p>
            </CardContent>
          </Card>
        ) : (
          filteredExecutions.map((execution, index) => {
            const config = statusConfig[execution.status];
            const IconComponent = config.icon;
            const progress = execution.steps_completed?.length || 0;
            
            return (
              <motion.div
                key={execution.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="glass-strong border border-white/20 hover:border-blue-500/30 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                          <IconComponent className={`w-5 h-5 ${config.color} ${config.spin ? "animate-spin" : ""}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-100 truncate">
                              {getWorkflowName(execution.workflow_id)}
                            </h3>
                            <Badge className={config.bg + " " + config.color}>
                              {config.label}
                            </Badge>
                          </div>

                          <div className="text-xs text-gray-400 mb-2">
                            Document: {execution.document_id?.substring(0, 8)}...
                          </div>

                          {execution.status === "running" && execution.current_step && (
                            <div className="text-xs text-gray-300 mb-2">
                              Current: {execution.current_step}
                            </div>
                          )}

                          {progress > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-700/50 rounded-full h-1.5">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                                  style={{ width: `${(progress / 5) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-400">{progress}/5 steps</span>
                            </div>
                          )}

                          {execution.error_message && (
                            <div className="text-xs text-rose-400 mt-2">
                              Error: {execution.error_message}
                            </div>
                          )}

                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span>Started: {new Date(execution.started_at || execution.created_date).toLocaleTimeString()}</span>
                            {execution.duration_ms && (
                              <span>Duration: {(execution.duration_ms / 1000).toFixed(1)}s</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Control Buttons */}
                      {execution.status === "running" && (
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => controlMutation.mutate({ executionId: execution.id, action: "pause" })}
                            disabled={controlMutation.isPending}
                            className="h-8 w-8 p-0"
                          >
                            <Pause className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => controlMutation.mutate({ executionId: execution.id, action: "cancel" })}
                            disabled={controlMutation.isPending}
                            className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}

                      {execution.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => controlMutation.mutate({ executionId: execution.id, action: "resume" })}
                          disabled={controlMutation.isPending}
                          className="h-8 w-8 p-0"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}