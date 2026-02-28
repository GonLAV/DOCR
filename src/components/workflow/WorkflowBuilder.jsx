import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Save, 
  Play, 
  GitBranch,
  Mail,
  Webhook,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import AIWorkflowGenerator from "@/components/workflow/AIWorkflowGenerator";

export default function WorkflowBuilder({ workflow, onSave }) {
  const queryClient = useQueryClient();
  const [workflowData, setWorkflowData] = useState(workflow || {
    name: "",
    description: "",
    trigger: { type: "document_completed", conditions: [] },
    steps: [],
    actions: [],
    enabled: true
  });

  const saveWorkflowMutation = useMutation({
    mutationFn: async (data) => {
      if (workflow?.id) {
        await base44.entities.Workflow.update(workflow.id, data);
      } else {
        await base44.entities.Workflow.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Workflow saved successfully");
      if (onSave) onSave();
    },
    onError: (error) => {
      toast.error("Failed to save workflow: " + error.message);
    }
  });

  const addStep = () => {
    const newStep = {
      id: `step_${Date.now()}`,
      name: "New Step",
      type: "processing",
      config: {},
      conditions: []
    };
    setWorkflowData({
      ...workflowData,
      steps: [...workflowData.steps, newStep]
    });
  };

  const updateStep = (index, updates) => {
    const newSteps = [...workflowData.steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setWorkflowData({ ...workflowData, steps: newSteps });
  };

  const removeStep = (index) => {
    const newSteps = workflowData.steps.filter((_, i) => i !== index);
    setWorkflowData({ ...workflowData, steps: newSteps });
  };

  const addAction = (type) => {
    setWorkflowData({
      ...workflowData,
      actions: [...workflowData.actions, { type, config: {} }]
    });
  };

  const removeAction = (index) => {
    setWorkflowData({
      ...workflowData,
      actions: workflowData.actions.filter((_, i) => i !== index)
    });
  };

  const stepTypeIcons = {
    processing: Play,
    validation: CheckCircle,
    routing: UserPlus,
    notification: Mail,
    conditional: GitBranch,
    approval: AlertCircle
  };

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center justify-between">
            <span>Workflow Configuration</span>
            <Button
              onClick={() => saveWorkflowMutation.mutate(workflowData)}
              disabled={!workflowData.name || saveWorkflowMutation.isPending}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save Workflow
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-100 mb-2 block">
              Workflow Name
            </label>
            <Input
              value={workflowData.name}
              onChange={(e) => setWorkflowData({ ...workflowData, name: e.target.value })}
              placeholder="e.g., High Priority Invoice Processing"
              className="bg-slate-800/50 border-slate-700/40 text-gray-100"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-100 mb-2 block">
              Description
            </label>
            <Textarea
              value={workflowData.description}
              onChange={(e) => setWorkflowData({ ...workflowData, description: e.target.value })}
              placeholder="Describe what this workflow does..."
              className="bg-slate-800/50 border-slate-700/40 text-gray-100"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-100 mb-2 block">
              Trigger
            </label>
            <Select
              value={workflowData.trigger.type}
              onValueChange={(value) => 
                setWorkflowData({ 
                  ...workflowData, 
                  trigger: { ...workflowData.trigger, type: value } 
                })
              }
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-700/40 text-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="document_uploaded">Document Uploaded</SelectItem>
                <SelectItem value="document_completed">Document Completed</SelectItem>
                <SelectItem value="manual">Manual Trigger</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center justify-between">
            <span>Pipeline Steps</span>
            <Button size="sm" onClick={addStep} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Step
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowData.steps.map((step, index) => {
              const StepIcon = stepTypeIcons[step.type] || Play;
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl p-4 border border-slate-700/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shrink-0 mt-1">
                      <StepIcon className="w-4 h-4 text-white" />
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                          Step {index + 1}
                        </Badge>
                        <Input
                          value={step.name}
                          onChange={(e) => updateStep(index, { name: e.target.value })}
                          placeholder="Step name"
                          className="flex-1 bg-slate-800/50 border-slate-700/40 text-gray-100 h-8 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={step.type}
                          onValueChange={(value) => updateStep(index, { type: value })}
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-700/40 text-gray-100 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="validation">Validation</SelectItem>
                            <SelectItem value="routing">Routing</SelectItem>
                            <SelectItem value="notification">Notification</SelectItem>
                            <SelectItem value="conditional">Conditional</SelectItem>
                            <SelectItem value="approval">Approval</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeStep(index)}
                          className="text-rose-400 hover:text-rose-300 h-8"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      {step.type === "conditional" && (
                        <div className="glass rounded-lg p-3 text-xs">
                          <div className="text-gray-400 mb-2">Conditional Logic</div>
                          <div className="space-y-2">
                            <Input
                              placeholder="Field to check (e.g., confidence_score)"
                              className="bg-slate-800/50 border-slate-700/40 text-gray-100 h-7 text-xs"
                            />
                            <div className="flex gap-2">
                              <Select>
                                <SelectTrigger className="bg-slate-800/50 border-slate-700/40 text-gray-100 h-7 text-xs">
                                  <SelectValue placeholder="Operator" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="greater_than">Greater Than</SelectItem>
                                  <SelectItem value="less_than">Less Than</SelectItem>
                                  <SelectItem value="equals">Equals</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                placeholder="Value"
                                className="bg-slate-800/50 border-slate-700/40 text-gray-100 h-7 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {workflowData.steps.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <GitBranch className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No steps added yet. Click "Add Step" to begin.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completion Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-100">Completion Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => addAction("email")}
              className="gap-2"
            >
              <Mail className="w-3.5 h-3.5" />
              Email
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addAction("webhook")}
              className="gap-2"
            >
              <Webhook className="w-3.5 h-3.5" />
              Webhook
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addAction("route_to_user")}
              className="gap-2"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Route
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addAction("update_field")}
              className="gap-2"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Update
            </Button>
          </div>

          <div className="space-y-2">
            {workflowData.actions.map((action, index) => (
              <div key={index} className="glass rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="capitalize">{action.type.replace("_", " ")}</Badge>
                  <span className="text-sm text-gray-300">on completion</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeAction(index)}
                  className="text-rose-400 hover:text-rose-300 h-6 w-6 p-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}