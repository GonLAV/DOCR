import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  GitBranch,
  Plus,
  RotateCcw,
  CheckCircle,
  Clock,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function WorkflowVersionManager({ workflowId, currentWorkflow }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [versionLabel, setVersionLabel] = useState("");
  const [changesDescription, setChangesDescription] = useState("");
  const queryClient = useQueryClient();

  // Fetch versions
  const { data: versions = [] } = useQuery({
    queryKey: ["workflowVersions", workflowId],
    queryFn: () => base44.entities.WorkflowVersion.filter({ workflow_id: workflowId }, "-version_number")
  });

  // Create version mutation
  const createVersionMutation = useMutation({
    mutationFn: async () => {
      const latestVersion = versions[0];
      const newVersionNumber = (latestVersion?.version_number || 0) + 1;
      
      // Deactivate all versions
      for (const v of versions.filter(v => v.is_active)) {
        await base44.entities.WorkflowVersion.update(v.id, { is_active: false });
      }

      // Create new version
      return await base44.entities.WorkflowVersion.create({
        workflow_id: workflowId,
        version_number: newVersionNumber,
        version_label: versionLabel || `v${newVersionNumber}.0`,
        snapshot: {
          name: currentWorkflow.name,
          trigger: currentWorkflow.trigger,
          steps: currentWorkflow.steps,
          actions: currentWorkflow.actions
        },
        changes_description: changesDescription,
        created_by: (await base44.auth.me()).email,
        is_active: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflowVersions", workflowId] });
      setShowCreateForm(false);
      setVersionLabel("");
      setChangesDescription("");
      toast.success("Version created successfully");
    },
    onError: () => {
      toast.error("Failed to create version");
    }
  });

  // Revert to version mutation
  const revertMutation = useMutation({
    mutationFn: async (versionId) => {
      const version = versions.find(v => v.id === versionId);
      if (!version) throw new Error("Version not found");

      // Update workflow with version snapshot
      await base44.entities.Workflow.update(workflowId, version.snapshot);

      // Deactivate all versions and activate this one
      for (const v of versions) {
        await base44.entities.WorkflowVersion.update(v.id, { 
          is_active: v.id === versionId 
        });
      }

      // Log audit
      await base44.asServiceRole.entities.AuditLog.create({
        entity_type: "workflow",
        entity_id: workflowId,
        action: "update",
        user_email: (await base44.auth.me()).email,
        timestamp: new Date().toISOString(),
        changes: {
          reverted_to_version: version.version_number,
          version_label: version.version_label
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow", workflowId] });
      queryClient.invalidateQueries({ queryKey: ["workflowVersions", workflowId] });
      toast.success("Workflow reverted to selected version");
    },
    onError: () => {
      toast.error("Failed to revert workflow");
    }
  });

  return (
    <Card className="glass-strong border border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-100">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-purple-400" />
            <span>Version Control</span>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="gap-1.5 h-8"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Version
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create Version Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-xl p-4 space-y-3"
            >
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1.5 block">Version Label</label>
                <Input
                  value={versionLabel}
                  onChange={(e) => setVersionLabel(e.target.value)}
                  placeholder="e.g., v1.2, stable, beta"
                  className="bg-slate-800/50 border-slate-700/40 text-gray-100 h-8 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1.5 block">Changes Description</label>
                <Textarea
                  value={changesDescription}
                  onChange={(e) => setChangesDescription(e.target.value)}
                  placeholder="Describe what changed in this version..."
                  className="bg-slate-800/50 border-slate-700/40 text-gray-100 text-sm"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => createVersionMutation.mutate()}
                  disabled={createVersionMutation.isPending}
                  className="flex-1 h-8 text-xs"
                >
                  Save Version
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 h-8 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Versions List */}
        <div className="space-y-2">
          {versions.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No versions yet</p>
            </div>
          ) : (
            versions.map((version, index) => (
              <motion.div
                key={version.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`glass rounded-lg p-3 border ${
                  version.is_active ? "border-purple-500/40 bg-purple-500/5" : "border-slate-700/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-100">
                        {version.version_label || `Version ${version.version_number}`}
                      </span>
                      {version.is_active && (
                        <Badge className="bg-purple-500/20 text-purple-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>

                    {version.changes_description && (
                      <p className="text-xs text-gray-400 mb-2 leading-relaxed">
                        {version.changes_description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(version.created_date).toLocaleString()}
                      </span>
                      {version.execution_count > 0 && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {version.execution_count} runs
                        </span>
                      )}
                      {version.success_rate && (
                        <span className="text-emerald-400">
                          {version.success_rate}% success
                        </span>
                      )}
                    </div>
                  </div>

                  {!version.is_active && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => revertMutation.mutate(version.id)}
                      disabled={revertMutation.isPending}
                      className="h-7 gap-1.5 text-xs"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Revert
                    </Button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}