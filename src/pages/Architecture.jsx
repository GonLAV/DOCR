import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield, Zap, Brain, Scale, Users, Database, Workflow, TrendingUp } from "lucide-react";

export default function Architecture() {
  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Court-Grade Document Intelligence Architecture</h1>
        <p className="text-sm text-slate-500 mt-2">
          A trust-first, hallucination-resistant system designed for extreme accuracy in legal and financial contexts
        </p>
      </div>

      {/* Core Philosophy */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Scale className="w-5 h-5" />
            Core Philosophy: Trust Over Speed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <p className="leading-relaxed">
            Unlike traditional OCR systems optimized for throughput, this platform prioritizes <strong>extraction certainty</strong> and <strong>reconstruction transparency</strong>. Every extracted value includes confidence propagation from pixel to decision level, with explicit marking of AI-inferred content.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <p className="font-semibold text-blue-800">Court-Grade Standard</p>
              <p className="text-xs text-slate-600 mt-1">≥95% confidence, &lt;10% reconstruction, full audit trail</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <p className="font-semibold text-blue-800">Bank-Grade Standard</p>
              <p className="text-xs text-slate-600 mt-1">≥98% confidence, &lt;5% reconstruction, zero hallucinations</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multi-Model Consensus */}
      <ArchitectureSection
        icon={Brain}
        title="1. Multi-Model OCR Consensus"
        color="violet"
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-700 leading-relaxed">
            <strong>Strategy:</strong> Run 3+ OCR models in parallel with different inference strategies (conservative, aggressive, balanced). Compare results character-by-character to detect disagreements and prevent hallucinations.
          </p>
          <div className="bg-slate-900 rounded-lg p-4 text-xs font-mono text-slate-100 overflow-x-auto">
            {`Model A (Conservative): "Invoice #1234"  [95% confidence]
Model B (Aggressive):   "Invoice #12345" [78% confidence]
Model C (Balanced):     "Invoice #1234"  [92% confidence]

→ Consensus: "Invoice #1234" [95% confidence]
→ Disagreement: Last digit (4 vs 5) - FLAGGED FOR HUMAN REVIEW`}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <MetricBox label="Model Agreement" value="95%" color="emerald" />
            <MetricBox label="Hallucination Risk" value="Low" color="blue" />
            <MetricBox label="Flagged Regions" value="1" color="amber" />
          </div>
        </div>
      </ArchitectureSection>

      {/* Confidence Propagation */}
      <ArchitectureSection
        icon={TrendingUp}
        title="2. Pixel → Decision Confidence Propagation"
        color="emerald"
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-700 leading-relaxed">
            <strong>Algorithm:</strong> Confidence flows from individual pixels through characters, tokens, fields, and finally to document-level trust scores. Each level applies weighted aggregation with penalty for reconstruction.
          </p>
          <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-600 w-32">Pixel Level:</span>
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: "92%" }} />
              </div>
              <span className="font-mono text-slate-700">92%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-600 w-32">Character Level:</span>
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: "88%" }} />
              </div>
              <span className="font-mono text-slate-700">88%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-600 w-32">Field Level:</span>
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500" style={{ width: "85%" }} />
              </div>
              <span className="font-mono text-slate-700">85%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-600 w-32">Document Level:</span>
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: "82%" }} />
              </div>
              <span className="font-mono text-slate-700">82%</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 italic">
            Confidence degrades at each level due to uncertainty accumulation and validation penalties
          </p>
        </div>
      </ArchitectureSection>

      {/* Semantic Validation */}
      <ArchitectureSection
        icon={Shield}
        title="3. Domain-Specific Semantic Validation"
        color="rose"
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-700 leading-relaxed">
            <strong>Rules Engine:</strong> Apply 6 types of validation rules to detect impossible values, contradictions, and format violations. Each failed rule reduces confidence and flags the field for review.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <ValidationRule
              type="Format Validation"
              example="Date must match YYYY-MM-DD"
              penalty="5-10%"
            />
            <ValidationRule
              type="Range Validation"
              example="Amount must be 0 < x < 1M"
              penalty="10-20%"
            />
            <ValidationRule
              type="Cross-Field Logic"
              example="Total = Sum(line_items)"
              penalty="15-25%"
            />
            <ValidationRule
              type="Semantic Coherence"
              example="Invoice date before due date"
              penalty="10-20%"
            />
            <ValidationRule
              type="External Lookup"
              example="Verify company registry"
              penalty="20-30%"
            />
            <ValidationRule
              type="Statistical Anomaly"
              example="Outlier detection vs historical"
              penalty="5-15%"
            />
          </div>
        </div>
      </ArchitectureSection>

      {/* Human-in-the-Loop */}
      <ArchitectureSection
        icon={Users}
        title="4. Human-in-the-Loop Correction Workflow"
        color="amber"
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-700 leading-relaxed">
            <strong>Targeted Review:</strong> System identifies high-risk fields (low confidence, inferred content, validation failures) and presents them for human correction. Each correction is logged and used to retrain validation rules.
          </p>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <span className="text-amber-700 font-bold">1</span>
              </div>
              <div className="text-xs">
                <p className="font-semibold text-amber-900">Identify Low-Confidence Fields</p>
                <p className="text-slate-600">Confidence &lt;80%, inferred content, validation failures</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <span className="text-amber-700 font-bold">2</span>
              </div>
              <div className="text-xs">
                <p className="font-semibold text-amber-900">Present for Review</p>
                <p className="text-slate-600">Show original region, AI value, correction interface</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <span className="text-amber-700 font-bold">3</span>
              </div>
              <div className="text-xs">
                <p className="font-semibold text-amber-900">Capture Correction Metadata</p>
                <p className="text-slate-600">Reason (misread, hallucination, degradation), notes, visual context</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <span className="text-amber-700 font-bold">4</span>
              </div>
              <div className="text-xs">
                <p className="font-semibold text-amber-900">Adaptive Learning</p>
                <p className="text-slate-600">Generate new validation rules, update model weights, improve future accuracy</p>
              </div>
            </div>
          </div>
        </div>
      </ArchitectureSection>

      {/* Trust Score Calculation */}
      <ArchitectureSection
        icon={Database}
        title="5. Trust Score Calculation"
        color="blue"
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-700 leading-relaxed">
            <strong>Formula:</strong> Trust = f(extraction_certainty, model_consensus, validation_pass_rate, reconstruction_risk, human_corrections, cross_document_verification)
          </p>
          <div className="bg-slate-900 rounded-lg p-4 text-xs font-mono text-slate-100 overflow-x-auto">
            {`trust_score = (
    extraction_certainty * 0.30 +
    model_consensus * 0.25 +
    validation_pass_rate * 0.20 +
    (100 - reconstruction_risk) * 0.15 +
    pixel_quality * 0.10
) * (1 - penalty_for_corrections)

court_ready = trust_score >= 95 && reconstruction_risk < 10
bank_ready = trust_score >= 98 && reconstruction_risk < 5`}
          </div>
        </div>
      </ArchitectureSection>

      {/* Hallucination Prevention */}
      <ArchitectureSection
        icon={Zap}
        title="6. Hallucination Prevention Strategy"
        color="indigo"
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-700 leading-relaxed">
            <strong>Multi-Layer Defense:</strong>
          </p>
          <div className="space-y-2">
            <PreventionLayer
              layer="Model Diversity"
              description="Conservative model acts as ground truth, aggressive model flags over-inference"
            />
            <PreventionLayer
              layer="Disagreement Detection"
              description="Character-level comparison identifies regions where models disagree"
            />
            <PreventionLayer
              layer="Reconstruction Transparency"
              description="All inferred content explicitly marked, never silently added"
            />
            <PreventionLayer
              layer="Semantic Validation"
              description="Domain rules detect impossible or unlikely values"
            />
            <PreventionLayer
              layer="Human Verification"
              description="High-risk fields always routed for manual review"
            />
          </div>
        </div>
      </ArchitectureSection>

      {/* Evaluation Methodology */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Workflow className="w-5 h-5" />
            Evaluation Methodology
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <EvalMetric
              name="Character Error Rate"
              target="<0.1%"
              description="Levenshtein distance vs ground truth"
            />
            <EvalMetric
              name="Field Extraction Accuracy"
              target=">99.5%"
              description="Exact match on key fields"
            />
            <EvalMetric
              name="Hallucination Rate"
              target="<0.01%"
              description="False positive text detection"
            />
            <EvalMetric
              name="Confidence Calibration"
              target="ECE <0.05"
              description="Predicted vs actual accuracy alignment"
            />
            <EvalMetric
              name="Human Correction Rate"
              target="<5%"
              description="Fields requiring manual intervention"
            />
            <EvalMetric
              name="Court Acceptance Rate"
              target=">95%"
              description="Documents meeting legal standards"
            />
          </div>
        </CardContent>
      </Card>

      {/* Scalability */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Scalability & Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <p><strong>Processing Time:</strong> 30-120 seconds per document (vs 1-2 seconds for traditional OCR)</p>
          <p><strong>Throughput:</strong> Optimized for accuracy, not speed. Suitable for batch processing overnight.</p>
          <p><strong>Architecture:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-xs">
            <li>Async queue-based processing (background jobs)</li>
            <li>Parallel model execution (3+ models simultaneously)</li>
            <li>Caching layer for repeated validations</li>
            <li>Progressive enhancement (results improve over time)</li>
            <li>Human review queue with priority scoring</li>
          </ul>
        </CardContent>
      </Card>

      {/* Moat & Defensibility */}
      <Card className="border-emerald-200 bg-emerald-50/30">
        <CardHeader>
          <CardTitle className="text-emerald-900">Competitive Moat & Defensibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <MoatPoint
            point="Trust-First Architecture"
            description="Unlike accuracy-as-afterthought competitors, trust is embedded in every layer"
          />
          <MoatPoint
            point="Proprietary Correction Dataset"
            description="Each human correction strengthens the system, creating a defensible data moat"
          />
          <MoatPoint
            point="Court & Bank Certification"
            description="Meeting legal/financial standards creates regulatory barrier to entry"
          />
          <MoatPoint
            point="Domain-Specific Validation Rules"
            description="Learned rules per document type compound over time"
          />
          <MoatPoint
            point="Explainable AI Requirements"
            description="Legal contexts demand transparency traditional OCR can't provide"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ArchitectureSection({ icon: Icon, title, color, children }) {
  const colorMap = {
    violet: "border-violet-200 bg-violet-50/30",
    emerald: "border-emerald-200 bg-emerald-50/30",
    rose: "border-rose-200 bg-rose-50/30",
    amber: "border-amber-200 bg-amber-50/30",
    blue: "border-blue-200 bg-blue-50/30",
    indigo: "border-indigo-200 bg-indigo-50/30",
  };

  const textColorMap = {
    violet: "text-violet-900",
    emerald: "text-emerald-900",
    rose: "text-rose-900",
    amber: "text-amber-900",
    blue: "text-blue-900",
    indigo: "text-indigo-900",
  };

  return (
    <Card className={colorMap[color]}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${textColorMap[color]}`}>
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

function MetricBox({ label, value, color }) {
  const colorMap = {
    emerald: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
  };

  return (
    <div className={`p-3 rounded-lg ${colorMap[color]}`}>
      <p className="text-[10px] font-medium opacity-80">{label}</p>
      <p className="text-lg font-bold mt-0.5">{value}</p>
    </div>
  );
}

function ValidationRule({ type, example, penalty }) {
  return (
    <div className="p-3 bg-white rounded-lg border border-slate-200">
      <p className="text-xs font-semibold text-slate-800">{type}</p>
      <p className="text-[10px] text-slate-500 mt-1">{example}</p>
      <p className="text-[10px] text-rose-600 font-medium mt-1">Penalty: {penalty}</p>
    </div>
  );
}

function PreventionLayer({ layer, description }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-200">
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
      <div>
        <p className="text-xs font-semibold text-slate-800">{layer}</p>
        <p className="text-[10px] text-slate-600 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function EvalMetric({ name, target, description }) {
  return (
    <div className="p-3 bg-slate-50 rounded-lg">
      <p className="text-xs font-semibold text-slate-800">{name}</p>
      <p className="text-lg font-bold text-blue-600 mt-1">{target}</p>
      <p className="text-[10px] text-slate-500 mt-1">{description}</p>
    </div>
  );
}

function MoatPoint({ point, description }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-white rounded-lg border border-emerald-200">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
      <div>
        <p className="text-xs font-semibold text-emerald-900">{point}</p>
        <p className="text-[10px] text-slate-600 mt-0.5">{description}</p>
      </div>
    </div>
  );
}