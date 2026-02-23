import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Database, Shield, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ExternalSourceCard from "../components/external/ExternalSourceCard";
import ExternalSourceForm from "../components/external/ExternalSourceForm";

export default function ExternalSources() {
  const [showForm, setShowForm] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me()
  });

  const { data: sources = [], isLoading } = useQuery({
    queryKey: ["external-sources"],
    queryFn: () => base44.entities.ExternalDataSource.list("-created_date")
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ExternalDataSource.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["external-sources"] });
      setShowForm(false);
      setEditingSource(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ExternalDataSource.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["external-sources"] });
      setShowForm(false);
      setEditingSource(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ExternalDataSource.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["external-sources"] });
    }
  });

  const handleSave = (data) => {
    if (editingSource) {
      updateMutation.mutate({ id: editingSource.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (source) => {
    setEditingSource(source);
    setShowForm(true);
  };

  const handleDelete = (source) => {
    if (confirm(`Are you sure you want to delete "${source.name}"?`)) {
      deleteMutation.mutate(source.id);
    }
  };

  const handleToggle = (source) => {
    updateMutation.mutate({
      id: source.id,
      data: { enabled: !source.enabled }
    });
  };

  // Admin check
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen p-6 lg:p-10 flex items-center justify-center">
        <div className="glass-strong rounded-3xl p-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold text-white mb-2">Admin Access Required</h2>
          <p className="text-gray-400">Only administrators can configure external data sources.</p>
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
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-black text-white mb-2">External Data Sources</h1>
          <p className="text-gray-400 text-lg">
            Configure connections to external databases and APIs for cross-document verification
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => {
              setEditingSource(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Source
          </Button>
        )}
      </motion.div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-strong rounded-3xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-3xl font-black text-white">{sources.length}</div>
              <div className="text-sm text-gray-400">Total Sources</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-3xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-3xl font-black text-white">
                {sources.filter(s => s.enabled).length}
              </div>
              <div className="text-sm text-gray-400">Active Sources</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-strong rounded-3xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-3xl font-black text-white">
                {sources.reduce((sum, s) => sum + (s.verification_rules?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-400">Verification Rules</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <ExternalSourceForm
            source={editingSource}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingSource(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Sources Grid */}
      {!showForm && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {sources.map((source) => (
              <ExternalSourceCard
                key={source.id}
                source={source}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            ))}
          </AnimatePresence>

          {sources.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full glass-strong rounded-3xl p-12 text-center"
            >
              <Database className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-bold text-white mb-2">No External Sources</h3>
              <p className="text-gray-400 mb-6">
                Configure your first external data source to enable cross-document verification
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Source
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}