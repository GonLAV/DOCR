import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Workflow, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight,
  Layers,
  GitCompare,
  UserCheck,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import InteractiveCorrectionPanel from "@/components/correction/InteractiveCorrectionPanel";
import CrossDocumentVerification from "@/components/verification/CrossDocumentVerification";
import LayeredOutputViewer from "@/components/viewer/LayeredOutputViewer";

export default function ProcessingWorkflow() {
  const [selectedDocId, setSelectedDocId] = useState(null);

  const { data: documents } = useQuery({
    queryKey: ['documents-workflow'],
    queryFn: async () => {
      const docs = await base44.entities.Document.list('-created_date', 50);
      return docs.filter(d => d.status === 'completed');
    }
  });

  const { data: selectedDoc } = useQuery({
    queryKey: ['document-detail', selectedDocId],
    queryFn: async () => {
      if (!selectedDocId) return null;
      const docs = await base44.entities.Document.filter({ id: selectedDocId });
      return docs[0];
    },
    enabled: !!selectedDocId
  });

  const workflowStages = [
    {
      id: 'correction',
      title: 'Human-in-the-Loop',
      icon: UserCheck,
      color: 'from-orange-500 to-red-500',
      description: 'Review and correct low-confidence extractions with AI assistance'
    },
    {
      id: 'verification',
      title: 'Cross-Document Verification',
      icon: GitCompare,
      color: 'from-purple-500 to-pink-500',
      description: 'Compare with similar documents and external databases'
    },
    {
      id: 'output',
      title: 'Layered Output',
      icon: Layers,
      color: 'from-blue-500 to-cyan-500',
      description: 'View all 6 layers from original to trust score'
    }
  ];

  const getConfidenceBadge = (score) => {
    if (score >= 90) return { color: 'bg-green-500', label: 'High Confidence' };
    if (score >= 70) return { color: 'bg-yellow-500', label: 'Medium Confidence' };
    return { color: 'bg-red-500', label: 'Low Confidence' };
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-8 border border-white/20"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl">
            <Workflow className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Advanced Processing Workflow
            </h1>
            <p className="text-gray-400 mt-1">
              Complete document intelligence pipeline with human oversight
            </p>
          </div>
        </div>

        {/* Workflow Stages Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {workflowStages.map((stage, idx) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass rounded-2xl p-4 border border-white/10 group hover:border-white/30 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stage.color} group-hover:scale-110 transition-transform`}>
                  <stage.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm mb-1">{stage.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{stage.description}</p>
                </div>
              </div>
              {idx < workflowStages.length - 1 && (
                <div className="flex justify-center mt-3">
                  <ArrowRight className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Selection */}
        <div className="lg:col-span-1">
          <Card className="glass-strong border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Select Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {documents?.map((doc) => {
                  const badge = getConfidenceBadge(doc.confidence_score || 0);
                  return (
                    <motion.button
                      key={doc.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                        selectedDocId === doc.id
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-400 shadow-lg'
                          : 'glass border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">
                            {doc.title}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            {doc.document_class || 'Unknown Type'}
                          </p>
                        </div>
                        <Badge className={`${badge.color} text-white text-xs shrink-0`}>
                          {doc.confidence_score || 0}%
                        </Badge>
                      </div>
                    </motion.button>
                  );
                })}
                {!documents?.length && (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm">No completed documents yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Processing Stages */}
        <div className="lg:col-span-2">
          {!selectedDoc ? (
            <Card className="glass-strong border-white/20 h-full">
              <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto mb-4 inline-block"
                  >
                    <Workflow className="w-12 h-12 text-white" />
                  </motion.div>
                  <p className="text-white text-xl font-bold mb-2">Select a Document</p>
                  <p className="text-gray-400 text-sm">
                    Choose a document from the list to begin the workflow
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="correction" className="space-y-4">
              <TabsList className="glass-strong w-full grid grid-cols-3 p-1">
                <TabsTrigger value="correction" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500">
                  <UserCheck className="w-4 h-4 mr-2" />
                  HITL Correction
                </TabsTrigger>
                <TabsTrigger value="verification" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500">
                  <GitCompare className="w-4 h-4 mr-2" />
                  Verification
                </TabsTrigger>
                <TabsTrigger value="output" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500">
                  <Layers className="w-4 h-4 mr-2" />
                  6-Layer Output
                </TabsTrigger>
              </TabsList>

              <TabsContent value="correction" className="space-y-4">
                <InteractiveCorrectionPanel document={selectedDoc} />
              </TabsContent>

              <TabsContent value="verification" className="space-y-4">
                <CrossDocumentVerification document={selectedDoc} />
              </TabsContent>

              <TabsContent value="output" className="space-y-4">
                <LayeredOutputViewer document={selectedDoc} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Status Footer */}
      {selectedDoc && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-4 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-semibold text-sm">Processing: {selectedDoc.title}</p>
                <p className="text-gray-400 text-xs">
                  Confidence: {selectedDoc.confidence_score}% • 
                  Status: {selectedDoc.status} • 
                  Anomalies: {selectedDoc.anomalies?.length || 0}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                Stage {selectedDoc.pipeline_stage}
              </Badge>
              <Badge className={getConfidenceBadge(selectedDoc.confidence_score || 0).color + ' text-white'}>
                {getConfidenceBadge(selectedDoc.confidence_score || 0).label}
              </Badge>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}