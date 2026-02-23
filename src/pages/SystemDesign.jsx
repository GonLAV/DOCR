import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Layers, 
  Database, 
  Code, 
  TrendingUp, 
  Rocket,
  FileCode,
  GitBranch,
  Brain,
  Shield
} from "lucide-react";

export default function SystemDesign() {
  const [activeTab, setActiveTab] = useState("architecture");

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Brain className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Complete System Design
          </h1>
        </div>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Full technical documentation for the <strong>category-defining Document Intelligence & Restoration Engine</strong>
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Badge className="bg-blue-100 text-blue-700">Court-Grade</Badge>
          <Badge className="bg-emerald-100 text-emerald-700">99.9% Accuracy</Badge>
          <Badge className="bg-violet-100 text-violet-700">Forensic-Grade</Badge>
          <Badge className="bg-amber-100 text-amber-700">Trust-First</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="architecture" className="flex flex-col items-center gap-1 py-3">
            <Layers className="w-4 h-4" />
            <span className="text-xs">Architecture</span>
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="flex flex-col items-center gap-1 py-3">
            <GitBranch className="w-4 h-4" />
            <span className="text-xs">Pipeline</span>
          </TabsTrigger>
          <TabsTrigger value="models" className="flex flex-col items-center gap-1 py-3">
            <Brain className="w-4 h-4" />
            <span className="text-xs">AI Models</span>
          </TabsTrigger>
          <TabsTrigger value="schema" className="flex flex-col items-center gap-1 py-3">
            <Database className="w-4 h-4" />
            <span className="text-xs">Data Schema</span>
          </TabsTrigger>
          <TabsTrigger value="roadmap" className="flex flex-col items-center gap-1 py-3">
            <Rocket className="w-4 h-4" />
            <span className="text-xs">Roadmap</span>
          </TabsTrigger>
        </TabsList>

        {/* Architecture Tab */}
        <TabsContent value="architecture" className="space-y-6">
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Layers className="w-5 h-5" />
                System Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-900 rounded-xl p-6 text-slate-100 font-mono text-xs overflow-x-auto">
                <pre>{`┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Document   │  │   Layered    │  │   Human-in-  │          │
│  │    Viewer    │  │   Renderer   │  │   the-Loop   │          │
│  │  (6 layers)  │  │  + Heatmaps  │  │  Correction  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↕ API (REST + WebSocket)
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         Async Processing Queue (Celery/Prefect)            │ │
│  │  • Document ingestion → Forensic preservation              │ │
│  │  • Enhancement pipeline → Multi-stage AI processing        │ │
│  │  • OCR fusion → Confidence scoring                         │ │
│  │  • Validation → Trust score calculation                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                        AI MODEL LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Layout AI  │  │  Enhancement │  │  Multi-Model │          │
│  │  LayoutLMv3  │  │ Real-ESRGAN  │  │   OCR Fusion │          │
│  │    Donut     │  │    SwinIR    │  │ ABBYY+Google │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Vision LLM  │  │  Validation  │  │  Confidence  │          │
│  │  GPT-4V/     │  │    Engine    │  │  Propagation │          │
│  │  Gemini Pro  │  │ Domain Rules │  │   Algorithm  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                        STORAGE LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Object     │  │   Relational │  │   Vector DB  │          │
│  │   Storage    │  │   Database   │  │  (Weaviate/  │          │
│  │ (S3/Azure)   │  │  (Postgres)  │  │  Pinecone)   │          │
│  │              │  │              │  │              │          │
│  │ • Original   │  │ • Documents  │  │ • Embeddings │          │
│  │ • Enhanced   │  │ • TrustScore │  │ • Semantic   │          │
│  │ • Thumbnails │  │ • Corrections│  │   Search     │          │
│  │ • Layers     │  │ • Rules      │  │ • Similar    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATION LAYER                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │     Land     │  │   Building   │  │  Historical  │          │
│  │   Registry   │  │   Permits    │  │    Deeds     │          │
│  │     API      │  │     API      │  │  Database    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘`}</pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ArchComponent
                  title="Frontend Components"
                  items={[
                    "React + TypeScript + Tailwind",
                    "Layered document viewer (6 layers)",
                    "Real-time confidence heatmaps",
                    "Human correction interface",
                    "WebSocket for live updates"
                  ]}
                />
                <ArchComponent
                  title="Backend Services"
                  items={[
                    "FastAPI / Node.js REST API",
                    "Async job queue (Celery/Prefect)",
                    "Multi-model orchestration",
                    "Confidence scoring engine",
                    "Trust score calculator"
                  ]}
                />
                <ArchComponent
                  title="AI Pipeline"
                  items={[
                    "9-stage processing pipeline",
                    "Multi-model consensus voting",
                    "Adaptive enhancement per region",
                    "Semantic validation rules",
                    "Domain-specific learning"
                  ]}
                />
                <ArchComponent
                  title="Data Management"
                  items={[
                    "Immutable original storage",
                    "Versioned enhancements",
                    "Correction audit trail",
                    "Cross-document knowledge graph",
                    "Vector search for similarity"
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Key Design Principles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Principle
                  title="Trust-First Architecture"
                  description="Every decision optimized for trust, not speed. Confidence tracking at every layer from pixels to decisions."
                  icon={Shield}
                />
                <Principle
                  title="Forensic Integrity"
                  description="Original document never modified. Cryptographic verification. Complete audit trail for legal compliance."
                  icon={FileCode}
                />
                <Principle
                  title="Reconstruction Transparency"
                  description="All AI-inferred content explicitly marked. No hidden hallucinations. Full traceability per character."
                  icon={Layers}
                />
                <Principle
                  title="Continuous Learning"
                  description="Human corrections feed domain-specific models. Accuracy compounds over time per organization."
                  icon={TrendingUp}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>9-Stage Processing Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  stage: "1. Forensic Preservation",
                  duration: "2-5s",
                  tasks: [
                    "Store original binary immutably",
                    "Generate perceptual hash (pHash algorithm)",
                    "Extract EXIF metadata (scanner, timestamp, DPI)",
                    "Calculate SHA-256 fingerprint",
                    "Detect tampering risk indicators"
                  ],
                  output: "fingerprint, scan_metadata, tampering_risk"
                },
                {
                  stage: "2. Damage & Degradation Analysis",
                  duration: "3-8s",
                  tasks: [
                    "Detect fold lines using edge detection",
                    "Identify stains via color anomaly detection",
                    "Measure blur using Laplacian variance",
                    "Detect ink fading via histogram analysis",
                    "Tag each region by degradation type"
                  ],
                  output: "damage_assessment, degradation_map"
                },
                {
                  stage: "3. Multi-Model Enhancement",
                  duration: "8-15s",
                  tasks: [
                    "Deskew using Hough transform",
                    "Perspective correction (4-point transform)",
                    "Noise removal (bilateral filter + denoise)",
                    "Super-resolution (Real-ESRGAN 4x)",
                    "Ink restoration (diffusion-based)",
                    "Adaptive contrast per semantic region"
                  ],
                  output: "enhanced_file_url, enhancement_metadata"
                },
                {
                  stage: "4. Layout & Structural AI",
                  duration: "5-10s",
                  tasks: [
                    "Paragraph segmentation (LayoutLMv3)",
                    "Table detection and structure parsing",
                    "Column identification",
                    "Handwriting region detection",
                    "Signature and stamp localization",
                    "Diagram/map segmentation"
                  ],
                  output: "layout_analysis (tables, columns, signatures, etc.)"
                },
                {
                  stage: "5. Multi-Model OCR Consensus",
                  duration: "15-30s",
                  tasks: [
                    "Run ABBYY OCR (conservative)",
                    "Run Google Vision API (balanced)",
                    "Run Azure Form Recognizer (aggressive)",
                    "Character-level alignment",
                    "Consensus voting + disagreement detection",
                    "Hallucination risk scoring"
                  ],
                  output: "consensus_text, character_confidence_map, disagreements"
                },
                {
                  stage: "6. Semantic Extraction",
                  duration: "10-20s",
                  tasks: [
                    "Vision LLM contextual analysis",
                    "Entity extraction (names, dates, amounts)",
                    "Field classification per document type",
                    "Missing field detection",
                    "Contradiction detection",
                    "Anomaly flagging"
                  ],
                  output: "extracted_entities, anomalies, document_class"
                },
                {
                  stage: "7. Validation & Trust Scoring",
                  duration: "3-8s",
                  tasks: [
                    "Apply domain validation rules",
                    "Calculate extraction certainty",
                    "Measure reconstruction risk",
                    "Compute model consensus score",
                    "Aggregate pixel-level confidence",
                    "Determine court/bank readiness"
                  ],
                  output: "TrustScore entity with overall_trust, court_ready, bank_ready"
                },
                {
                  stage: "8. Human-in-the-Loop (if needed)",
                  duration: "Variable",
                  tasks: [
                    "Identify fields with confidence <80%",
                    "Present low-confidence regions only",
                    "Provide AI-assisted suggestions",
                    "Capture correction metadata",
                    "Generate new validation rules",
                    "Update model weights"
                  ],
                  output: "Correction records, learned rules"
                },
                {
                  stage: "9. Layered Output Generation",
                  duration: "2-5s",
                  tasks: [
                    "Layer 1: Original scan (immutable)",
                    "Layer 2: Enhanced image",
                    "Layer 3: OCR text overlay",
                    "Layer 4: Structured JSON export",
                    "Layer 5: Confidence heatmap",
                    "Layer 6: Trust score report"
                  ],
                  output: "Complete document package ready for review/export"
                }
              ].map((stage, i) => (
                <PipelineStage key={i} {...stage} />
              ))}

              <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-blue-900">Total Processing Time</p>
                    <p className="text-xs text-slate-600 mt-0.5">Court-grade analysis per document</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">45-90s</p>
                    <p className="text-xs text-slate-500">average</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>AI Model Stack & Fusion Strategy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ModelCategory
                title="Layout Understanding"
                models={[
                  {
                    name: "LayoutLMv3",
                    purpose: "Document layout analysis, table detection, reading order",
                    accuracy: "94% on DocVQA",
                    usage: "Primary layout model"
                  },
                  {
                    name: "Donut (OCR-free)",
                    purpose: "End-to-end document understanding without OCR",
                    accuracy: "92% on RVL-CDIP",
                    usage: "Backup for complex layouts"
                  }
                ]}
              />

              <ModelCategory
                title="Image Enhancement & Restoration"
                models={[
                  {
                    name: "Real-ESRGAN",
                    purpose: "4x super-resolution for degraded text documents",
                    accuracy: "PSNR 28dB on historical docs",
                    usage: "Primary upscaling"
                  },
                  {
                    name: "SwinIR",
                    purpose: "Transformer-based restoration for various degradations",
                    accuracy: "SSIM 0.92",
                    usage: "Fine-grained restoration"
                  },
                  {
                    name: "Diffusion-based Restoration",
                    purpose: "Ink restoration, faded text recovery",
                    accuracy: "Subjective quality high",
                    usage: "Severe degradation cases"
                  }
                ]}
              />

              <ModelCategory
                title="Multi-Model OCR Consensus"
                models={[
                  {
                    name: "ABBYY FineReader",
                    purpose: "Conservative, high-precision OCR",
                    accuracy: "99.8% on clean docs",
                    usage: "Ground truth baseline"
                  },
                  {
                    name: "Google Cloud Vision API",
                    purpose: "Balanced, context-aware OCR",
                    accuracy: "99.5% on mixed docs",
                    usage: "Primary consensus member"
                  },
                  {
                    name: "Azure Form Recognizer",
                    purpose: "Aggressive, form-optimized extraction",
                    accuracy: "98.5% on forms",
                    usage: "Structured document specialist"
                  }
                ]}
              />

              <ModelCategory
                title="Semantic Validation"
                models={[
                  {
                    name: "GPT-4V / Gemini Pro Vision",
                    purpose: "Contextual validation, semantic reasoning",
                    accuracy: "96% on domain tasks",
                    usage: "Cross-field validation, anomaly detection"
                  },
                  {
                    name: "Domain-Specific Rules Engine",
                    purpose: "Learned validation rules per document type",
                    accuracy: "Improves over time",
                    usage: "Format, range, cross-field validation"
                  }
                ]}
              />

              <div className="mt-6 p-5 bg-violet-50 rounded-xl border-2 border-violet-200">
                <h3 className="text-sm font-bold text-violet-900 mb-3">Fusion Strategy</h3>
                <div className="space-y-2 text-xs text-slate-700">
                  <p><strong>1. Character-Level Alignment:</strong> Align outputs from all OCR models character-by-character using edit distance</p>
                  <p><strong>2. Weighted Consensus Voting:</strong> Each model vote weighted by historical accuracy on similar document types</p>
                  <p><strong>3. Disagreement Detection:</strong> Flag regions where models differ significantly for human review</p>
                  <p><strong>4. Confidence Fusion:</strong> Aggregate per-character confidence using Bayesian fusion</p>
                  <p><strong>5. Hallucination Prevention:</strong> Conservative model acts as baseline; aggressive model outputs validated against it</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schema Tab */}
        <TabsContent value="schema" className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Database Schema & JSON Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <SchemaSection
                title="Document Entity"
                schema={{
                  id: "UUID (auto)",
                  title: "string",
                  original_file_url: "string (S3/Azure URL)",
                  enhanced_file_url: "string",
                  thumbnail_url: "string",
                  file_type: "enum: pdf | image | scan",
                  status: "enum: uploaded | processing | analyzing | completed | failed",
                  pipeline_stage: "enum: preservation | enhancement | layout | semantic | confidence | output",
                  document_class: "string (invoice, contract, deed, etc.)",
                  fingerprint: "string (SHA-256 + pHash)",
                  scan_metadata: "object {dpi, color_space, scanner, timestamp}",
                  damage_assessment: "object {overall_condition, detected_issues[], severity}",
                  layout_analysis: "object {tables, columns, signatures, handwriting}",
                  extracted_text: "string (consensus text)",
                  extracted_entities: "array of {field, value, confidence, inferred, source_region}",
                  structured_data: "object (full AI analysis + consensus + models)",
                  anomalies: "array of {type, description, severity, location}",
                  confidence_score: "number 0-100",
                  tampering_risk: "enum: none | low | medium | high",
                  degradation_estimate: "object {estimated_age, causes[], severity}",
                  processing_time_ms: "number",
                  created_by: "string (user email)",
                  created_date: "timestamp",
                  updated_date: "timestamp"
                }}
              />

              <SchemaSection
                title="TrustScore Entity"
                schema={{
                  id: "UUID",
                  document_id: "UUID (foreign key)",
                  overall_trust: "number 0-100",
                  extraction_certainty: "number 0-100",
                  reconstruction_risk: "number 0-100 (% AI-inferred)",
                  validation_pass_rate: "number 0-100",
                  model_consensus_score: "number 0-100",
                  pixel_quality_score: "number 0-100",
                  semantic_coherence: "number 0-100",
                  cross_document_verification: "number 0-100",
                  human_correction_count: "integer",
                  high_risk_fields: "array of strings",
                  court_ready: "boolean (trust≥95, reconstruction<10)",
                  bank_ready: "boolean (trust≥98, reconstruction<5)",
                  trust_factors: "object (detailed breakdown)",
                  recommended_action: "enum: approve | review_flagged_fields | manual_review | reject"
                }}
              />

              <SchemaSection
                title="Correction Entity (Learning Loop)"
                schema={{
                  id: "UUID",
                  document_id: "UUID",
                  field_path: "string (JSON path)",
                  original_value: "string (AI extracted)",
                  corrected_value: "string (human verified)",
                  confidence_before: "number 0-100",
                  correction_reason: "enum: misread_character | hallucination | missing_content | wrong_context | degradation",
                  region_coordinates: "object {x, y, width, height}",
                  visual_context: "string (cropped image URL)",
                  correction_notes: "string",
                  verified: "boolean (peer-reviewed)",
                  impact_score: "number 0-1",
                  created_by: "string",
                  created_date: "timestamp"
                }}
              />

              <SchemaSection
                title="ValidationRule Entity"
                schema={{
                  id: "UUID",
                  rule_name: "string",
                  document_type: "string",
                  field_name: "string",
                  rule_type: "enum: format | range | cross_field | semantic | external_lookup | statistical",
                  rule_logic: "object (pattern, min/max, dependencies)",
                  severity: "enum: error | warning | info",
                  confidence_penalty: "number 0-100",
                  enabled: "boolean",
                  learned_from_corrections: "boolean",
                  accuracy_stats: "object {precision, recall, f1}"
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roadmap Tab */}
        <TabsContent value="roadmap" className="space-y-6">
          <Card className="border-emerald-200 bg-emerald-50/30">
            <CardHeader>
              <CardTitle className="text-emerald-900">Product Roadmap: MVP → Unicorn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RoadmapPhase
                phase="MVP (Month 1-3)"
                status="Foundation"
                color="blue"
                features={[
                  "Basic document upload & storage",
                  "Single OCR model (Google Vision)",
                  "Simple confidence scoring",
                  "Basic viewer with original + OCR layers",
                  "Manual validation workflow",
                  "Core entities (Document, TrustScore)"
                ]}
                metrics={["10 documents/hour", "85% accuracy on clean docs"]}
              />

              <RoadmapPhase
                phase="Phase 2 (Month 4-6)"
                status="Multi-Model Consensus"
                color="violet"
                features={[
                  "3-model OCR fusion (ABBYY + Google + Azure)",
                  "Character-level confidence propagation",
                  "Disagreement detection",
                  "Enhanced viewer with heatmaps",
                  "Human-in-the-loop corrections",
                  "Basic validation rules engine"
                ]}
                metrics={["50 documents/hour", "92% accuracy on degraded docs"]}
              />

              <RoadmapPhase
                phase="Phase 3 (Month 7-9)"
                status="AI Enhancement & Layout"
                color="indigo"
                features={[
                  "Image enhancement pipeline (deskew, denoise, super-res)",
                  "Layout analysis (LayoutLMv3)",
                  "Table extraction",
                  "Damage assessment & adaptive processing",
                  "Domain-specific validation rules",
                  "Correction feedback loop"
                ]}
                metrics={["100 documents/hour", "96% accuracy", "Court-grade beta"]}
              />

              <RoadmapPhase
                phase="Phase 4 (Month 10-12)"
                status="Forensic Grade & Trust"
                color="emerald"
                features={[
                  "Forensic preservation layer",
                  "Reconstruction transparency tracking",
                  "Cross-document verification",
                  "Trust score refinement",
                  "Semantic validation (Vision LLM)",
                  "Court/bank readiness certification"
                ]}
                metrics={["200 documents/hour", "99.5% accuracy", "First court case"]}
              />

              <RoadmapPhase
                phase="Phase 5 (Year 2)"
                status="Enterprise & Scale"
                color="amber"
                features={[
                  "Multi-tenant architecture",
                  "API for integration",
                  "Batch processing at scale",
                  "Advanced cross-source verification",
                  "Custom model training per client",
                  "White-label options"
                ]}
                metrics={["10K documents/hour", "99.9% accuracy", "$10M ARR"]}
              />

              <RoadmapPhase
                phase="Unicorn Vision (Year 3+)"
                status="Category Leader"
                color="rose"
                features={[
                  "Real-time processing (<10s per doc)",
                  "50+ document types supported",
                  "100+ external data sources",
                  "Blockchain-based audit trail",
                  "Global compliance (GDPR, HIPAA, etc.)",
                  "AI-first workflow automation"
                ]}
                metrics={["1M documents/day", "99.95% accuracy", "$100M ARR", "Unicorn status"]}
              />
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Evaluation Methodology</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EvalMetric
                  name="Character Error Rate (CER)"
                  target="<0.1%"
                  method="Levenshtein distance vs ground truth"
                />
                <EvalMetric
                  name="Field Extraction Accuracy"
                  target=">99.5%"
                  method="Exact match on key fields (names, dates, amounts)"
                />
                <EvalMetric
                  name="Semantic Accuracy"
                  target=">98%"
                  method="Domain expert validation of extracted meaning"
                />
                <EvalMetric
                  name="Hallucination Rate"
                  target="<0.01%"
                  method="False positive content not in original"
                />
                <EvalMetric
                  name="Confidence Calibration"
                  target="ECE <0.05"
                  method="Expected Calibration Error between predicted and actual"
                />
                <EvalMetric
                  name="Reconstruction Fidelity"
                  target="SSIM >0.95"
                  method="Structural similarity between original and enhanced"
                />
                <EvalMetric
                  name="Human Correction Rate"
                  target="<5%"
                  method="% of fields requiring manual intervention"
                />
                <EvalMetric
                  name="Trust Score Accuracy"
                  target=">95%"
                  method="Predicted trust vs actual acceptance rate"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ArchComponent({ title, items }) {
  return (
    <div className="p-4 bg-white rounded-lg border-2 border-slate-200">
      <h3 className="text-sm font-bold text-slate-900 mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
            <span className="text-xs text-slate-600">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Principle({ title, description, icon: Icon }) {
  return (
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-start gap-3 mb-2">
        <Icon className="w-5 h-5 text-blue-600 mt-0.5" />
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function PipelineStage({ stage, duration, tasks, output }) {
  return (
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900">{stage}</h3>
        <Badge variant="outline" className="text-[10px]">{duration}</Badge>
      </div>
      <ul className="space-y-1.5 mb-3">
        {tasks.map((task, i) => (
          <li key={i} className="flex items-start gap-2">
            <div className="w-1 h-1 rounded-full bg-violet-400 mt-1.5 shrink-0" />
            <span className="text-xs text-slate-600">{task}</span>
          </li>
        ))}
      </ul>
      <div className="pt-2 border-t border-slate-200">
        <p className="text-[10px] text-slate-500"><strong>Output:</strong> {output}</p>
      </div>
    </div>
  );
}

function ModelCategory({ title, models }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900 mb-3">{title}</h3>
      <div className="space-y-3">
        {models.map((model, i) => (
          <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800">{model.name}</h4>
              <Badge variant="outline" className="text-[9px]">{model.usage}</Badge>
            </div>
            <p className="text-xs text-slate-600 mb-1">{model.purpose}</p>
            <p className="text-[10px] text-emerald-600 font-medium">{model.accuracy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SchemaSection({ title, schema }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900 mb-3">{title}</h3>
      <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
        <pre className="text-[11px] text-slate-100 font-mono">
          {JSON.stringify(schema, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function RoadmapPhase({ phase, status, color, features, metrics }) {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    violet: "bg-violet-50 border-violet-200 text-violet-900",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-900",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-900",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    rose: "bg-rose-50 border-rose-200 text-rose-900",
  };

  return (
    <div className={`p-5 rounded-xl border-2 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{phase}</h3>
        <Badge className={colors[color]}>{status}</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-semibold mb-2 opacity-70">Key Features</p>
          <ul className="space-y-1.5">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 shrink-0 opacity-60" />
                <span className="text-xs opacity-80">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold mb-2 opacity-70">Success Metrics</p>
          <div className="space-y-2">
            {metrics.map((metric, i) => (
              <div key={i} className="px-3 py-2 bg-white/60 rounded-lg border border-current/20">
                <p className="text-sm font-bold">{metric}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EvalMetric({ name, target, method }) {
  return (
    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-slate-800">{name}</h4>
        <Badge className="bg-emerald-100 text-emerald-700 text-[9px]">{target}</Badge>
      </div>
      <p className="text-[10px] text-slate-600">{method}</p>
    </div>
  );
}