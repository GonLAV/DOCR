import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/auth/useUser";
import PermissionGate from "@/components/auth/PermissionGate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  CheckSquare, 
  PlayCircle, 
  Loader2, 
  FileText,
  History,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Shield,
  Sparkles,
  Archive,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BatchStatusCard from "@/components/batch/BatchStatusCard";
import BatchHistoryTable from "@/components/batch/BatchHistoryTable";

export default function BatchProcessing() {
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [actionType, setActionType] = useState("revalidate");
  const [jobName, setJobName] = useState("");
  const queryClient = useQueryClient();

  const { data: documents = [] } = useQuery({
    queryKey: ["documents"],
    queryFn: () => base44.entities.Document.list("-created_date", 100),
  });

  const { data: batchJobs = [] } = useQuery({
    queryKey: ["batchJobs"],
    queryFn: () => base44.entities.BatchJob.list("-created_date", 50),
    refetchInterval: 3000, // Poll every 3s for active jobs
  });

  const createBatchMutation = useMutation({
    mutationFn: async ({ name, action, docIds }) => {
      const job = await base44.entities.BatchJob.create({
        job_name: name,
        action_type: action,
        document_ids: docIds,
        status: "pending",
        progress: { total: docIds.length, completed: 0, failed: 0 }
      });
      
      // Start processing
      await base44.functions.invoke('processBatch', { batch_job_id: job.id });
      
      return job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batchJobs"] });
      setSelectedDocs([]);
      setJobName("");
    },
  });

  const toggleDoc = (docId) => {
    setSelectedDocs(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const toggleAll = () => {
    if (selectedDocs.length === documents.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(documents.map(d => d.id));
    }
  };

  const handleStartBatch = () => {
    if (selectedDocs.length === 0) return;
    
    const name = jobName || `${actionType} - ${selectedDocs.length} documents`;
    createBatchMutation.mutate({
      name,
      action: actionType,
      docIds: selectedDocs
    });
  };

  const activeBatches = batchJobs.filter(j => 
    j.status === 'pending' || j.status === 'processing'
  );
  
  const completedBatches = batchJobs.filter(j => 
    j.status === 'completed' || j.status === 'failed' || j.status === 'cancelled'
  );

  const actionIcons = {
    reprocess: RefreshCw,
    revalidate: Shield,
    generate_summary: Sparkles,
    archive: Archive,
    export: Download
  };

  const ActionIcon = actionIcons[actionType] || PlayCircle;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Batch Processing</h1>
        <p className="text-sm text-slate-500 mt-1">Process multiple documents simultaneously</p>
      </div>

      {/* Active Batches */}
      {activeBatches.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            Active Batches
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeBatches.map(batch => (
              <BatchStatusCard key={batch.id} batch={batch} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="glass-strong border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-cyan-400" />
                  Select Documents
                </div>
                <Badge className="bg-cyan-500 text-white">
                  {selectedDocs.length} selected
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Checkbox 
                  checked={selectedDocs.length === documents.length && documents.length > 0}
                  onCheckedChange={toggleAll}
                />
                <span className="text-sm text-gray-300 font-medium">Select All ({documents.length})</span>
              </div>
              
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {documents.map(doc => (
                  <motion.div
                    key={doc.id}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-3 glass rounded-xl hover:glass-strong transition-all cursor-pointer"
                    onClick={() => toggleDoc(doc.id)}
                  >
                    <Checkbox 
                      checked={selectedDocs.includes(doc.id)}
                      onCheckedChange={() => toggleDoc(doc.id)}
                    />
                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className={`text-[10px] ${
                          doc.status === 'completed' ? 'bg-emerald-500' :
                          doc.status === 'processing' ? 'bg-blue-500' :
                          'bg-slate-500'
                        } text-white`}>
                          {doc.status}
                        </Badge>
                        {doc.document_class && (
                          <span className="text-[10px] text-gray-400 capitalize">{doc.document_class}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Panel */}
        <div className="space-y-4">
          <Card className="glass-strong border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-purple-400" />
                Batch Action
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Job Name (Optional)</label>
                <Input
                  placeholder="e.g., Q1 Revalidation"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block">Action Type</label>
                <Select value={actionType} onValueChange={setActionType}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reprocess">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Reprocess Documents
                      </div>
                    </SelectItem>
                    <SelectItem value="revalidate">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Revalidate All Fields
                      </div>
                    </SelectItem>
                    <SelectItem value="generate_summary">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Generate AI Summaries
                      </div>
                    </SelectItem>
                    <SelectItem value="archive">
                      <div className="flex items-center gap-2">
                        <Archive className="w-4 h-4" />
                        Archive Documents
                      </div>
                    </SelectItem>
                    <SelectItem value="export">
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export to PDF
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="glass rounded-xl p-3 border border-blue-500/20">
                <div className="text-xs text-gray-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Selected Documents:</span>
                    <span className="font-bold text-white">{selectedDocs.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Estimated Time:</span>
                    <span className="font-bold text-white">{selectedDocs.length * 2}s</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleStartBatch}
                disabled={selectedDocs.length === 0 || createBatchMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
              >
                {createBatchMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <ActionIcon className="w-4 h-4 mr-2" />
                    Start Batch
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* History */}
      {completedBatches.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-600" />
            Batch History
          </h2>
          <BatchHistoryTable batches={completedBatches} />
        </div>
      )}
    </div>
  );
}