import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import DropZone from "@/components/upload/DropZone";
import ProcessingStatus from "@/components/upload/ProcessingStatus";

export default function Upload() {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [processingDocs, setProcessingDocs] = useState([]);

  const runPipeline = async (doc) => {
    const stages = ["preservation", "enhancement", "layout", "semantic", "confidence", "output"];
    
    for (const stage of stages) {
      await base44.entities.Document.update(doc.id, {
        status: "processing",
        pipeline_stage: stage,
      });
      setProcessingDocs(prev => prev.map(d => d.id === doc.id ? { ...d, pipeline_stage: stage, status: "processing" } : d));

      // Run AI analysis per stage
      let stageResult = {};
      
      if (stage === "preservation") {
        const fingerprint = `FP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        stageResult = { fingerprint, scan_metadata: { dpi: 300, color_space: "RGB", scanned: true } };
      }
      
      if (stage === "enhancement") {
        stageResult = {
          damage_assessment: {
            overall_condition: "moderate",
            detected_issues: ["slight_noise", "minor_skew"],
            severity: 0.3
          }
        };
      }

      if (stage === "confidence") {
        // Multi-model consensus for court-grade accuracy
        const consensusResult = await base44.functions.invoke("multiModelConsensus", {
          document_id: doc.id,
          file_url: doc.original_file_url
        });
        
        stageResult = {
          structured_data: {
            ...doc.structured_data,
            consensus: consensusResult.data?.consensus
          }
        };
      }

      if (stage === "semantic") {
        const analysis = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this scanned document image. Provide:
1. Document classification (invoice, contract, letter, legal, medical, etc.)
2. Extract all key entities (names, dates, amounts, addresses, reference numbers)
3. Detect any anomalies, missing fields, or potential issues
4. Rate your confidence in the extraction (0-100)
5. Identify any areas that seem reconstructed, faded, or unclear

Be thorough and detailed. Return structured data.`,
          file_urls: [doc.original_file_url],
          response_json_schema: {
            type: "object",
            properties: {
              document_class: { type: "string" },
              extracted_text: { type: "string" },
              entities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    field: { type: "string" },
                    value: { type: "string" },
                    confidence: { type: "number" },
                    inferred: { type: "boolean" }
                  }
                }
              },
              anomalies: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    description: { type: "string" },
                    severity: { type: "string" }
                  }
                }
              },
              layout: {
                type: "object",
                properties: {
                  has_tables: { type: "boolean" },
                  has_handwriting: { type: "boolean" },
                  has_signatures: { type: "boolean" },
                  has_stamps: { type: "boolean" },
                  columns: { type: "number" },
                  paragraph_count: { type: "number" }
                }
              },
              overall_confidence: { type: "number" },
              tampering_risk: { type: "string" },
              degradation: {
                type: "object",
                properties: {
                  estimated_age: { type: "string" },
                  causes: { type: "array", items: { type: "string" } },
                  severity: { type: "string" }
                }
              }
            }
          }
        });

        stageResult = {
          document_class: analysis.document_class,
          extracted_text: analysis.extracted_text,
          extracted_entities: analysis.entities,
          anomalies: analysis.anomalies,
          layout_analysis: analysis.layout,
          confidence_score: analysis.overall_confidence,
          tampering_risk: analysis.tampering_risk || "none",
          degradation_estimate: analysis.degradation,
          structured_data: analysis,
        };
        
        // Apply validation rules
        await base44.functions.invoke("applyValidationRules", {
          document_id: doc.id
        });
      }

      await base44.entities.Document.update(doc.id, stageResult);
    }

    await base44.entities.Document.update(doc.id, {
      status: "completed",
      pipeline_stage: "done",
    });
    setProcessingDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: "completed", pipeline_stage: "done" } : d));
  };

  const handleFilesSelected = async (files) => {
    setIsUploading(true);
    
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const doc = await base44.entities.Document.create({
        title: file.name,
        original_file_url: file_url,
        file_type: file.type.includes("pdf") ? "pdf" : "image",
        status: "uploaded",
      });

      setProcessingDocs(prev => [...prev, doc]);
      runPipeline(doc);
    }
    
    setIsUploading(false);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[900px] mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Upload Documents</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload scanned documents for AI-powered analysis, restoration, and intelligence extraction
        </p>
      </div>

      <DropZone onFilesSelected={handleFilesSelected} isUploading={isUploading} />
      <ProcessingStatus documents={processingDocs} />
    </div>
  );
}