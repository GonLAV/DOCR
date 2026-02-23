import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import PipelineStages from "@/components/dashboard/PipelineStages";
import LayerToggle from "@/components/viewer/LayerToggle";
import EntityPanel from "@/components/viewer/EntityPanel";
import ForensicPanel from "@/components/viewer/ForensicPanel";
import StructuredDataPanel from "@/components/viewer/StructuredDataPanel";
import ConfidenceOverview from "@/components/viewer/ConfidenceOverview";
import TrustMeter from "@/components/trust/TrustMeter";
import CorrectionWorkflow from "@/components/correction/CorrectionWorkflow";
import ConfidenceHeatmap from "@/components/trust/ConfidenceHeatmap";
import HandwritingOverlay from "@/components/viewer/HandwritingOverlay";
import HandwritingPanel from "@/components/viewer/HandwritingPanel";

export default function DocumentViewer() {
  const params = new URLSearchParams(window.location.search);
  const docId = params.get("id");

  const [activeLayers, setActiveLayers] = useState(["original"]);
  const [activeTab, setActiveTab] = useState("entities");

  const { data: document, isLoading } = useQuery({
    queryKey: ["document", docId],
    queryFn: () => base44.entities.Document.list().then(docs => docs.find(d => d.id === docId)),
    enabled: !!docId,
    refetchInterval: (data) => data?.status === "completed" || data?.status === "failed" ? false : 3000,
  });

  const { data: trustScores = [] } = useQuery({
    queryKey: ["trustScore", docId],
    queryFn: () => base44.entities.TrustScore.filter({ document_id: docId }),
    enabled: !!docId && document?.status === "completed",
  });

  const trustScore = trustScores[0];

  const toggleLayer = (layer) => {
    setActiveLayers(prev =>
      prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]
    );
  };

  if (isLoading || !document) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="p-4 border-b border-slate-200 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl("Documents")}>
              <Button variant="ghost" size="sm" className="h-8 text-slate-500">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{document.title}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {document.document_class && (
                  <Badge variant="outline" className="text-[10px] capitalize">{document.document_class}</Badge>
                )}
                <Badge className={`text-[10px] ${
                  document.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                  document.status === "processing" ? "bg-blue-100 text-blue-700" :
                  "bg-slate-100 text-slate-600"
                }`}>
                  {document.status}
                </Badge>
              </div>
            </div>
          </div>
          {document.original_file_url && (
            <a href={document.original_file_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Download className="w-3.5 h-3.5" /> Original
              </Button>
            </a>
          )}
        </div>
        {document.pipeline_stage && (
          <PipelineStages currentStage={document.pipeline_stage} />
        )}
        <LayerToggle activeLayers={activeLayers} onToggle={toggleLayer} />
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Preview */}
        <div className="flex-1 bg-slate-100/50 p-6 overflow-auto flex items-start justify-center">
          <div className="relative max-w-2xl w-full">
            {activeLayers.includes("original") && document.original_file_url && (
              <div className="layer-original">
                {document.file_type === "pdf" ? (
                  <iframe
                    src={document.original_file_url}
                    className="w-full h-[800px] rounded-xl border border-slate-200 shadow-lg bg-white"
                    title="Document"
                  />
                ) : (
                  <img
                    src={document.original_file_url}
                    alt="Original document"
                    className="w-full rounded-xl border border-slate-200 shadow-lg"
                  />
                )}
              </div>
            )}

            {activeLayers.includes("enhanced") && !activeLayers.includes("original") && document.enhanced_file_url && (
              <img
                src={document.enhanced_file_url}
                alt="Enhanced document"
                className="w-full rounded-xl border border-blue-200 shadow-lg"
              />
            )}

            {activeLayers.includes("ocr") && document.extracted_text && !activeLayers.includes("original") && !activeLayers.includes("enhanced") && (
              <div className="p-8 bg-white rounded-xl border border-slate-200 shadow-lg">
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">
                  {document.extracted_text}
                </p>
              </div>
            )}

            {!activeLayers.includes("original") && !activeLayers.includes("enhanced") && !activeLayers.includes("ocr") && (
              <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                <p className="text-sm">Enable a layer to view the document</p>
              </div>
            )}

            {/* Confidence overlay */}
            {activeLayers.includes("confidence") && document.confidence_score != null && (
              <div className="absolute top-4 right-4 p-3 glass rounded-xl border border-white/50 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    document.confidence_score >= 80 ? "bg-emerald-500" :
                    document.confidence_score >= 50 ? "bg-amber-500" : "bg-rose-500"
                  }`} />
                  <span className="text-sm font-bold text-slate-800">{document.confidence_score}%</span>
                </div>
              </div>
            )}

            {/* Handwriting overlay */}
            {(activeLayers.includes("original") || activeLayers.includes("enhanced")) && document.handwriting_regions && (
              <HandwritingOverlay 
                regions={document.handwriting_regions}
                imageWidth={800}
                imageHeight={1000}
              />
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-[380px] border-l border-slate-200 bg-white overflow-y-auto">
          <div className="p-4">
            {document.confidence_score != null && (
              <div className="mb-4">
                <ConfidenceOverview document={document} />
              </div>
            )}
            {trustScore && (
              <div className="mb-4">
                <TrustMeter trustScore={trustScore} />
              </div>
            )}
            
            {document.status === "completed" && trustScore && (
              <div className="mb-4">
                <CorrectionWorkflow document={document} trustScore={trustScore} />
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-slate-100 mb-4">
                <TabsTrigger value="entities" className="flex-1 text-xs">Entities</TabsTrigger>
                <TabsTrigger value="handwriting" className="flex-1 text-xs">Handwriting</TabsTrigger>
                <TabsTrigger value="trust" className="flex-1 text-xs">Trust</TabsTrigger>
                <TabsTrigger value="forensic" className="flex-1 text-xs">Forensic</TabsTrigger>
                <TabsTrigger value="data" className="flex-1 text-xs">Data</TabsTrigger>
              </TabsList>
              <TabsContent value="entities">
                <EntityPanel entities={document.extracted_entities} anomalies={document.anomalies} />
              </TabsContent>
              <TabsContent value="handwriting">
                <HandwritingPanel regions={document.handwriting_regions} />
              </TabsContent>
              <TabsContent value="trust">
                <ConfidenceHeatmap 
                  document={document} 
                  consensusData={document.structured_data?.consensus}
                />
              </TabsContent>
              <TabsContent value="forensic">
                <ForensicPanel document={document} />
              </TabsContent>
              <TabsContent value="data">
                <StructuredDataPanel document={document} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}