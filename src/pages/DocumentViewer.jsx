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
import InteractiveCorrectionPanel from "@/components/correction/InteractiveCorrectionPanel";
import CrossDocumentVerification from "@/components/verification/CrossDocumentVerification";
import LayeredOutputViewer from "@/components/viewer/LayeredOutputViewer";
import ConfidenceHeatmap from "@/components/trust/ConfidenceHeatmap";
import HandwritingOverlay from "@/components/viewer/HandwritingOverlay";
import HandwritingPanel from "@/components/viewer/HandwritingPanel";
import SummaryCard from "@/components/documents/SummaryCard";
import TagManager from "@/components/tags/TagManager";
import CommentThread from "@/components/collaboration/CommentThread";
import AnnotationTool from "@/components/collaboration/AnnotationTool";
import VersionHistory from "@/components/collaboration/VersionHistory";
import ActiveUsers from "@/components/collaboration/ActiveUsers";
import AccessControlPanel from "@/components/access/AccessControlPanel";
import AuditTrailViewer from "@/components/audit/AuditTrailViewer";

export default function DocumentViewer() {
  const params = new URLSearchParams(window.location.search);
  const docId = params.get("id");

  const [activeLayers, setActiveLayers] = useState(["original"]);
  const [activeTab, setActiveTab] = useState("entities");

  const { data: document, isLoading } = useQuery({
    queryKey: ["document", docId],
    queryFn: async () => {
      const docs = await base44.entities.Document.list();
      return docs.find(d => d.id === docId);
    },
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-2">Document not found</p>
          <p className="text-sm text-gray-500 mb-4">The document you're looking for doesn't exist or has been deleted.</p>
          <Link to={createPageUrl("Documents")}>
            <Button>Back to Documents</Button>
          </Link>
        </div>
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
          <div className="flex gap-2">
            {document.original_file_url && (
              <a href={document.original_file_url} download target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Original
                </Button>
              </a>
            )}
            {document.enhanced_file_url && (
              <a href={document.enhanced_file_url} download target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                  <Download className="w-3.5 h-3.5" /> Enhanced
                </Button>
              </a>
            )}
          </div>
        </div>
        {document.pipeline_stage && (
          <PipelineStages currentStage={document.pipeline_stage} />
        )}
        <ActiveUsers document={document} />
        <LayerToggle activeLayers={activeLayers} onToggle={toggleLayer} />
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Preview */}
        <div className="flex-1 bg-slate-100/50 p-6 overflow-auto flex items-start justify-center">
          <div className="relative max-w-4xl w-full">
            {activeLayers.includes("original") && document.original_file_url && (
              <div className="layer-original">
                {document.file_type === "pdf" ? (
                  <iframe
                    src={`${document.original_file_url}#view=FitH`}
                    className="w-full min-h-[1200px] rounded-xl border border-slate-200 shadow-lg bg-white"
                    title={`${document.title} - Original Document`}
                    allow="fullscreen"
                  />
                ) : (
                  <img
                    src={document.original_file_url}
                    alt={`${document.title} - Original`}
                    className="w-full h-auto rounded-xl border border-slate-200 shadow-lg object-contain"
                    loading="lazy"
                  />
                )}
              </div>
            )}

            {activeLayers.includes("enhanced") && !activeLayers.includes("original") && document.enhanced_file_url && (
              <div className="layer-enhanced">
                <img
                  src={document.enhanced_file_url}
                  alt={`${document.title} - Enhanced`}
                  className="w-full h-auto rounded-xl border border-blue-200 shadow-lg object-contain"
                  loading="lazy"
                />
              </div>
            )}

            {activeLayers.includes("ocr") && document.extracted_text && !activeLayers.includes("original") && !activeLayers.includes("enhanced") && (
              <div className="p-8 bg-white rounded-xl border border-slate-200 shadow-lg max-h-[1200px] overflow-y-auto">
                <div className="mb-4 pb-4 border-b border-slate-200">
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    Extracted Text ({document.extracted_text.length} characters)
                  </Badge>
                </div>
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

            {/* No file available warning */}
            {activeLayers.includes("original") && !document.original_file_url && (
              <div className="p-12 text-center bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-sm text-amber-700">Original file not available</p>
              </div>
            )}
            {activeLayers.includes("enhanced") && !document.enhanced_file_url && (
              <div className="p-12 text-center bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-sm text-amber-700">Enhanced file not available</p>
              </div>
            )}
            {activeLayers.includes("ocr") && !document.extracted_text && (
              <div className="p-12 text-center bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-sm text-amber-700">Extracted text not available</p>
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
        <div className="w-[420px] border-l border-slate-200 bg-white overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Document Metadata */}
            {document.file_type && (
              <div className="glass-strong rounded-xl p-3 border border-white/20">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">File Type</span>
                    <p className="text-white font-semibold uppercase">{document.file_type}</p>
                  </div>
                  {document.confidence_score != null && (
                    <div>
                      <span className="text-gray-400">Confidence</span>
                      <p className="text-white font-semibold">{document.confidence_score}%</p>
                    </div>
                  )}
                  {document.processing_time_ms && (
                    <div>
                      <span className="text-gray-400">Processing Time</span>
                      <p className="text-white font-semibold">{(document.processing_time_ms / 1000).toFixed(2)}s</p>
                    </div>
                  )}
                  {document.extracted_text && (
                    <div>
                      <span className="text-gray-400">Text Length</span>
                      <p className="text-white font-semibold">{document.extracted_text.length} chars</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* AI Summary */}
            {document.status === "completed" && (
              <div className="mb-4">
                <SummaryCard summary={document.ai_summary} documentId={document.id} />
              </div>
            )}

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
            
            {document.status === "completed" && (
              <div className="mb-4">
                <InteractiveCorrectionPanel document={document} />
              </div>
            )}

            {document.status === "completed" && (
              <div className="mb-4">
                <CrossDocumentVerification document={document} />
              </div>
            )}

            {/* Tag Manager */}
            <div className="mb-4">
              <TagManager document={document} />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-slate-100 mb-4 grid grid-cols-5 h-auto">
                <TabsTrigger value="entities" className="text-[10px]">Entities</TabsTrigger>
                <TabsTrigger value="layers" className="text-[10px]">6 Layers</TabsTrigger>
                <TabsTrigger value="handwriting" className="text-[10px]">Handwriting</TabsTrigger>
                <TabsTrigger value="trust" className="text-[10px]">Trust</TabsTrigger>
                <TabsTrigger value="forensic" className="text-[10px]">Forensic</TabsTrigger>
                <TabsTrigger value="data" className="text-[10px]">Data</TabsTrigger>
                <TabsTrigger value="comments" className="text-[10px]">Comments</TabsTrigger>
                <TabsTrigger value="annotations" className="text-[10px]">Annotate</TabsTrigger>
                <TabsTrigger value="versions" className="text-[10px]">History</TabsTrigger>
                <TabsTrigger value="access" className="text-[10px]">Access</TabsTrigger>
                <TabsTrigger value="audit" className="text-[10px]">Audit</TabsTrigger>
              </TabsList>
              <TabsContent value="entities">
                <EntityPanel entities={document.extracted_entities} anomalies={document.anomalies} />
              </TabsContent>
              <TabsContent value="layers">
                <LayeredOutputViewer document={document} />
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
              <TabsContent value="comments">
                <CommentThread document={document} />
              </TabsContent>
              <TabsContent value="annotations">
                <AnnotationTool 
                  document={document} 
                  imageUrl={document.original_file_url} 
                />
              </TabsContent>
              <TabsContent value="versions">
                <VersionHistory document={document} />
              </TabsContent>
              <TabsContent value="access">
                <AccessControlPanel entityId={document.id} entityType="document" />
              </TabsContent>
              <TabsContent value="audit">
                <AuditTrailViewer entityId={document.id} entityType="document" />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}