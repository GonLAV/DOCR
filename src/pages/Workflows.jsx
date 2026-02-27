import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/auth/useUser";
import PermissionGate from "@/components/auth/PermissionGate";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  GitBranch,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import WorkflowBuilder from "@/components/workflow/WorkflowBuilder";
import WorkflowVersionManager from "@/components/workflow/WorkflowVersionManager";
import WorkflowOptimizationPanel from "@/components/workflow/WorkflowOptimizationPanel";
import AILearningPanel from "@/components/workflow/AILearningPanel";

export default function Workflows() {
  const { permissions } = useUser();
  return (
    <PermissionGate allowed={permissions.canViewWorkflows}>
      <WorkflowsContent />
    </PermissionGate>
  );
}

function WorkflowsContent() {
  const { permissions } = useUser();
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const { data: workflows = [] } = useQuery({
    queryKey: ["workflows"],
    queryFn: () => base44.entities.Workflow.list("-created_date")
  });

  const { data: executions = [] } = useQuery({
    queryKey: ["workflow-executions"],
    queryFn: () => base44.entities.WorkflowExecution.list("-created_date", 20)
  });

  const handleEdit = (workflow) => {
    setSelectedWorkflow(workflow);
    setShowBuilder(true);
  };

  const handleNew = () => {
    setSelectedWorkflow(null);
    setShowBuilder(true);
  };

  if (showBuilder) {
    return (
      <div className="min-h-screen p-6 lg:p-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-100">
              {selectedWorkflow ? "Edit Workflow" : "Create Workflow"}
            </h1>
            <Button
              variant="outline"
              onClick={() => {
                setShowBuilder(false);
                setSelectedWorkflow(null);
              }}
            >
              Back to Workflows
            </Button>
          </div>
          <WorkflowBuilder
            workflow={selectedWorkflow}
            onSave={() => {
              setShowBuilder(false);
              setSelectedWorkflow(null);
            }}
          />
          {selectedWorkflow && (
            <>
              <WorkflowVersionManager 
                workflowId={selectedWorkflow.id} 
                currentWorkflow={selectedWorkflow}
              />
              <WorkflowOptimizationPanel workflowId={selectedWorkflow.id} />
              <AILearningPanel workflowId={selectedWorkflow.id} />
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-10 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <GitBranch className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">Workflow Automation</h1>
              <p className="text-blue-300 text-lg font-medium">
                Custom pipelines & conditional logic
              </p>
            </div>
          </div>
          <Button onClick={handleNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Workflow
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-gray-100">{workflows.length}</span>
            </div>
            <p className="text-sm text-gray-400">Total Workflows</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Play className="w-8 h-8 text-emerald-400" />
              <span className="text-3xl font-bold text-gray-100">
                {workflows.filter(w => w.enabled).length}
              </span>
            </div>
            <p className="text-sm text-gray-400">Active</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-cyan-400" />
              <span className="text-3xl font-bold text-gray-100">
                {executions.filter(e => e.status === "completed").length}
              </span>
            </div>
            <p className="text-sm text-gray-400">Completed Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-amber-400" />
              <span className="text-3xl font-bold text-gray-100">
                {executions.filter(e => e.status === "running").length}
              </span>
            </div>
            <p className="text-sm text-gray-400">Running</p>
          </CardContent>
        </Card>
      </div>

      {/* Workflows List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-100">Your Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workflows.map((workflow, index) => (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl p-4 hover:glass-strong transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-100">{workflow.name}</h3>
                      <Badge className={workflow.enabled ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-500/20 text-slate-400"}>
                        {workflow.enabled ? "Active" : "Paused"}
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                        {workflow.steps?.length || 0} steps
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{workflow.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span>Trigger: {workflow.trigger?.type?.replace("_", " ")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        <span>{workflow.execution_count || 0} executions</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(workflow)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-gray-300"
                    >
                      {workflow.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}

            {workflows.length === 0 && (
              <div className="text-center py-12">
                <GitBranch className="w-16 h-16 mx-auto mb-4 text-gray-500 opacity-50" />
                <p className="text-gray-400 mb-4">No workflows yet</p>
                <Button onClick={handleNew} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Workflow
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Executions */}
      {executions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-100">Recent Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {executions.slice(0, 5).map((execution) => (
                <div key={execution.id} className="glass rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {execution.status === "completed" && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    {execution.status === "running" && <Clock className="w-4 h-4 text-blue-400 animate-spin" />}
                    {execution.status === "failed" && <AlertCircle className="w-4 h-4 text-rose-400" />}
                    
                    <div>
                      <div className="text-sm font-semibold text-gray-100">
                        Workflow Execution
                      </div>
                      <div className="text-xs text-gray-400">
                        {execution.steps_completed?.length || 0} steps completed
                      </div>
                    </div>
                  </div>
                  
                  <Badge className={
                    execution.status === "completed" ? "bg-emerald-500/20 text-emerald-300" :
                    execution.status === "running" ? "bg-blue-500/20 text-blue-300" :
                    "bg-rose-500/20 text-rose-300"
                  }>
                    {execution.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}