import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Lock, 
  Users,
  Mail,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AccessControlPanel({ entityId, entityType = "document" }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("viewer");
  const [expiresAt, setExpiresAt] = useState("");
  
  const queryClient = useQueryClient();
  const entityName = entityType === "document" ? "DocumentAccess" : "WorkflowAccess";

  const { data: access = [] } = useQuery({
    queryKey: [entityName.toLowerCase(), entityId],
    queryFn: () => base44.entities[entityName].filter({ 
      [entityType === "document" ? "document_id" : "workflow_id"]: entityId 
    })
  });

  const addAccessMutation = useMutation({
    mutationFn: async (accessData) => {
      await base44.entities[entityName].create(accessData);
      
      // Log audit event
      await base44.asServiceRole.entities.AuditLog.create({
        entity_type: entityType,
        entity_id: entityId,
        action: "share",
        user_email: (await base44.auth.me()).email,
        timestamp: new Date().toISOString(),
        changes: {
          granted_to: accessData.user_email,
          role: accessData.role
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityName.toLowerCase(), entityId] });
      setNewUserEmail("");
      setNewUserRole("viewer");
      setExpiresAt("");
      setShowAddForm(false);
      toast.success("Access granted successfully");
    },
    onError: () => {
      toast.error("Failed to grant access");
    }
  });

  const removeAccessMutation = useMutation({
    mutationFn: async (accessId) => {
      await base44.entities[entityName].delete(accessId);
      
      // Log audit event
      await base44.asServiceRole.entities.AuditLog.create({
        entity_type: entityType,
        entity_id: entityId,
        action: "access",
        user_email: (await base44.auth.me()).email,
        timestamp: new Date().toISOString(),
        changes: { revoked_access_id: accessId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityName.toLowerCase(), entityId] });
      toast.success("Access revoked");
    },
    onError: () => {
      toast.error("Failed to revoke access");
    }
  });

  const handleAddAccess = () => {
    if (!newUserEmail) {
      toast.error("Please enter a user email");
      return;
    }

    addAccessMutation.mutate({
      [entityType === "document" ? "document_id" : "workflow_id"]: entityId,
      user_email: newUserEmail,
      role: newUserRole,
      granted_by: base44.auth.me().then(u => u.email),
      granted_at: new Date().toISOString(),
      ...(expiresAt && { expires_at: expiresAt })
    });
  };

  const roleColors = {
    owner: "bg-purple-500/20 text-purple-300",
    approver: "bg-blue-500/20 text-blue-300",
    editor: "bg-amber-500/20 text-amber-300",
    viewer: "bg-slate-500/20 text-slate-300"
  };

  return (
    <Card className="glass-strong border border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-100">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-400" />
            <span>Access Control</span>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="gap-1.5 h-8"
          >
            <Plus className="w-3.5 h-3.5" />
            Grant Access
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Access Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4 space-y-3"
          >
            <div>
              <label className="text-xs font-semibold text-gray-300 mb-1.5 block">User Email</label>
              <Input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="user@example.com"
                className="bg-slate-800/50 border-slate-700/40 text-gray-100 h-8 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1.5 block">Role</label>
                <Select value={newUserRole} onValueChange={setNewUserRole}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700/40 text-gray-100 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="approver">Approver</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1.5 block">Expires (Optional)</label>
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="bg-slate-800/50 border-slate-700/40 text-gray-100 h-8 text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddAccess}
                disabled={addAccessMutation.isPending}
                className="flex-1 h-8 text-xs"
              >
                Grant Access
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="flex-1 h-8 text-xs"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {/* Access List */}
        <div className="space-y-2">
          {access.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No users with access yet</p>
            </div>
          ) : (
            access.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm text-gray-100 font-medium">{item.user_email}</span>
                    <Badge className={roleColors[item.role]}>
                      {item.role}
                    </Badge>
                  </div>
                  {item.expires_at && (
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 ml-6">
                      <Calendar className="w-3 h-3" />
                      <span>Expires {new Date(item.expires_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeAccessMutation.mutate(item.id)}
                  disabled={removeAccessMutation.isPending}
                  className="text-rose-400 hover:text-rose-300 h-7 w-7 p-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}