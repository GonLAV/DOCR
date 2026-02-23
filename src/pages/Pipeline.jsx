import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import FlowDiagram from "@/components/pipeline/FlowDiagram";
import { FileText, Clock, Activity } from "lucide-react";
import { format } from "date-fns";

export default function Pipeline() {
  const [selectedDocId, setSelectedDocId] = useState(null);

  const { data: documents = [] } = useQuery({
    queryKey: ["documents"],
    queryFn: () => base44.entities.Document.list("-created_date", 50),
  });

  const processingDocs = documents.filter(d => 
    ["uploaded", "processing", "analyzing"].includes(d.status)
  );

  const selectedDoc = documents.find(d => d.id === selectedDocId) || processingDocs[0];

  // Map pipeline_stage to stage IDs
  const stageMapping = {
    "preservation": "preservation",
    "enhancement": "enhancement",
    "layout": "layout",
    "semantic": "semantic",
    "confidence": "confidence",
    "output": "output"
  };

  const completedStages = [];
  const currentStageId = selectedDoc?.pipeline_stage ? stageMapping[selectedDoc.pipeline_stage] : "input";
  
  // Mark all stages before current as completed
  const allStageIds = ["input", "preservation", "damage", "enhancement", "layout", "semantic", "confidence", "verification", "output"];
  const currentIndex = allStageIds.indexOf(currentStageId);
  for (let i = 0; i < currentIndex; i++) {
    completedStages.push(allStageIds[i]);
  }

  if (selectedDoc?.status === "completed") {
    completedStages.push(...allStageIds);
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Processing Pipeline</h1>
        <p className="text-sm text-slate-500 mt-1">
          Court-grade document intelligence with multi-stage AI processing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flow Diagram */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-900">Pipeline Flow</CardTitle>
                {selectedDoc && (
                  <Badge className={`${
                    selectedDoc.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                    selectedDoc.status === "processing" ? "bg-blue-100 text-blue-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {selectedDoc.status}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <FlowDiagram 
                currentStage={currentStageId} 
                completedStages={completedStages}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Document Selector */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-900">Select Document</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedDocId || processingDocs[0]?.id} onValueChange={setSelectedDocId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a document..." />
                </SelectTrigger>
                <SelectContent>
                  {documents.map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>
                      <div className="flex items-center gap-2">
                        <span className="truncate">{doc.title}</span>
                        <Badge className="text-[9px] ml-auto">{doc.status}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Processing Stats */}
          {processingDocs.length > 0 && (
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Active Processing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {processingDocs.slice(0, 5).map(doc => (
                  <div 
                    key={doc.id} 
                    className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => setSelectedDocId(doc.id)}
                  >
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{doc.title}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{doc.pipeline_stage || "queued"}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Current Document Info */}
          {selectedDoc && (
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900">Document Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <InfoRow label="Title" value={selectedDoc.title} />
                  <InfoRow label="Status" value={selectedDoc.status} />
                  <InfoRow label="Current Stage" value={selectedDoc.pipeline_stage || "initializing"} />
                  {selectedDoc.created_date && (
                    <InfoRow 
                      label="Uploaded" 
                      value={format(new Date(selectedDoc.created_date), "MMM d, h:mm a")} 
                    />
                  )}
                  {selectedDoc.processing_time_ms && (
                    <InfoRow 
                      label="Processing Time" 
                      value={`${(selectedDoc.processing_time_ms / 1000).toFixed(1)}s`} 
                    />
                  )}
                  {selectedDoc.confidence_score != null && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-slate-500">Confidence Score</span>
                        <span className={`text-sm font-bold ${
                          selectedDoc.confidence_score >= 80 ? "text-emerald-600" :
                          selectedDoc.confidence_score >= 50 ? "text-amber-600" :
                          "text-rose-600"
                        }`}>
                          {selectedDoc.confidence_score}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            selectedDoc.confidence_score >= 80 ? "bg-emerald-500" :
                            selectedDoc.confidence_score >= 50 ? "bg-amber-500" :
                            "bg-rose-500"
                          }`}
                          style={{ width: `${selectedDoc.confidence_score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pipeline Metrics */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-900">Pipeline Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <MetricRow 
                label="Completed Today" 
                value={documents.filter(d => d.status === "completed").length} 
                icon={<FileText className="w-3.5 h-3.5 text-emerald-500" />}
              />
              <MetricRow 
                label="In Progress" 
                value={processingDocs.length} 
                icon={<Activity className="w-3.5 h-3.5 text-blue-500" />}
              />
              <MetricRow 
                label="Avg Processing Time" 
                value="45s" 
                icon={<Clock className="w-3.5 h-3.5 text-violet-500" />}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-medium text-slate-800 capitalize">{value}</span>
    </div>
  );
}

function MetricRow({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-slate-600">{label}</span>
      </div>
      <span className="text-sm font-bold text-slate-800">{value}</span>
    </div>
  );
}