import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import DropZone from "@/components/upload/DropZone";
import ProcessingStatus from "@/components/upload/ProcessingStatus";
import UpgradeWall from "@/components/paywall/UpgradeWall";
import { motion } from "framer-motion";
import { Sparkles, Zap, Shield, Brain, ArrowRight, Lock } from "lucide-react";

export default function Upload() {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [processingDocs, setProcessingDocs] = useState([]);
  const [enhancementMode] = useState("new_file");
  const [user, setUser] = useState(null);
  const [showUpgradeWall, setShowUpgradeWall] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      const credits = u?.credits ?? 1;
      const hasAccess = u?.has_full_access || u?.role === "admin";
      if (!hasAccess && credits <= 0) {
        setIsBlocked(true);
        setShowUpgradeWall(true);
      }
    }).catch(() => {});
  }, []);

  const runPipeline = async (doc) => {
    const stages = ["preservation", "enhancement", "layout", "semantic", "confidence", "output"];
    
    for (const stage of stages) {
      await base44.entities.Document.update(doc.id, {
        status: "processing",
        pipeline_stage: stage,
      });
      setProcessingDocs(prev => prev.map(d => d.id === doc.id ? { ...d, pipeline_stage: stage, status: "processing" } : d));

      let stageResult = {};
      
      if (stage === "preservation") {
        const fingerprint = `FP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        stageResult = { fingerprint, scan_metadata: { dpi: 300, color_space: "RGB", scanned: true } };
      }
      
      if (stage === "enhancement") {
        const enhancedImage = await base44.integrations.Core.GenerateImage({
          prompt: `Enhance this scanned document image to professional quality:
- Remove noise, scratches, stains, and artifacts
- Improve contrast and sharpness
- Straighten any skew or rotation
- Enhance text clarity and readability
- Preserve original content exactly without alterations
- Output high-quality, clean document scan`,
          existing_image_urls: [doc.original_file_url]
        });
        stageResult = {
          enhanced_file_url: enhancedImage.url,
          damage_assessment: { overall_condition: "moderate", detected_issues: ["slight_noise", "minor_skew"], severity: 0.3 }
        };
      }

      if (stage === "confidence") {
        const consensusResult = await base44.functions.invoke("multiModelConsensus", {
          document_id: doc.id, file_url: doc.original_file_url
        });
        stageResult = { structured_data: { ...doc.structured_data, consensus: consensusResult.data?.consensus } };
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
              entities: { type: "array", items: { type: "object", properties: { field: { type: "string" }, value: { type: "string" }, confidence: { type: "number" }, inferred: { type: "boolean" } } } },
              anomalies: { type: "array", items: { type: "object", properties: { type: { type: "string" }, description: { type: "string" }, severity: { type: "string" } } } },
              layout: { type: "object", properties: { has_tables: { type: "boolean" }, has_handwriting: { type: "boolean" }, has_signatures: { type: "boolean" }, has_stamps: { type: "boolean" }, columns: { type: "number" }, paragraph_count: { type: "number" } } },
              overall_confidence: { type: "number" },
              tampering_risk: { type: "string" },
              degradation: { type: "object", properties: { estimated_age: { type: "string" }, causes: { type: "array", items: { type: "string" } }, severity: { type: "string" } } }
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
        await base44.functions.invoke("applyValidationRules", { document_id: doc.id });
      }

      await base44.entities.Document.update(doc.id, stageResult);
    }

    await base44.entities.Document.update(doc.id, { status: "completed", pipeline_stage: "done" });
    setProcessingDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: "completed", pipeline_stage: "done" } : d));
  };

  const handleFilesSelected = async (files) => {
    const hasAccess = user?.has_full_access || user?.role === "admin";
    const credits = user?.credits ?? 1;

    if (!hasAccess && credits <= 0) {
      setShowUpgradeWall(true);
      return;
    }

    setIsUploading(true);

    // Deduct credit for non-full-access users
    if (!hasAccess) {
      await base44.auth.updateMe({ credits: Math.max(0, credits - 1) });
      setUser(prev => ({ ...prev, credits: Math.max(0, credits - 1) }));
    }

    const uploadedIds = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const doc = await base44.entities.Document.create({
        title: file.name,
        original_file_url: file_url,
        file_type: file.type.includes("pdf") ? "pdf" : "image",
        status: "uploaded",
      });
      uploadedIds.push(doc.id);
      setProcessingDocs(prev => [...prev, doc]);
      runPipeline(doc).then(() => {
        // After first doc finishes, redirect to Documents
        navigate(createPageUrl("Documents"));
      });
    }
    setIsUploading(false);
  };

  const credits = user?.credits ?? 1;
  const hasAccess = user?.has_full_access || user?.role === "admin";

  return (
    <>
      {showUpgradeWall && <UpgradeWall onDismiss={() => setShowUpgradeWall(false)} />}

      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 max-w-2xl"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-violet-400/30 text-violet-300 text-xs font-bold uppercase tracking-widest mb-5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Document Intelligence
          </motion.div>

          <h1 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
            Drop Your Document.{" "}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Watch AI Work.
            </span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Our AI instantly enhances, classifies, extracts entities, detects anomalies, and scores confidence — in seconds.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {[
              { icon: Zap, label: "Auto Enhancement" },
              { icon: Brain, label: "Entity Extraction" },
              { icon: Shield, label: "Anomaly Detection" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-lg border border-white/10 text-xs text-gray-300">
                <Icon className="w-3.5 h-3.5 text-blue-400" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Credit indicator */}
        {!hasAccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mb-6 px-5 py-3 rounded-xl border flex items-center gap-3 ${
              credits > 0
                ? "glass border-emerald-500/30 text-emerald-300"
                : "glass border-rose-500/30 text-rose-300"
            }`}
          >
            {credits > 0 ? (
              <>
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  You have <strong>{credits} free credit</strong> — upload your first document now!
                </span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  Free credit used — <button onClick={() => setShowUpgradeWall(true)} className="underline font-bold">upgrade for unlimited access</button>
                </span>
              </>
            )}
          </motion.div>
        )}

        {/* Drop Zone */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="w-full max-w-2xl"
        >
          <div className={isBlocked ? "pointer-events-none opacity-40 select-none" : ""}>
            <DropZone onFilesSelected={handleFilesSelected} isUploading={isUploading} />
          </div>
        </motion.div>

        {processingDocs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mt-6"
          >
            <ProcessingStatus documents={processingDocs} />
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-400">
              <ArrowRight className="w-4 h-4 text-violet-400" />
              Redirecting to your results...
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}