import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Brain, 
  Users, 
  GitCompare, 
  Sparkles, 
  TrendingUp, 
  Database,
  Fingerprint,
  AlertTriangle,
  Layers,
  Zap,
  Target,
  Rocket
} from "lucide-react";

const features = [
  {
    category: "Accuracy & Trust",
    icon: Target,
    color: "emerald",
    items: [
      {
        title: "Multi-Model OCR Consensus",
        description: "3+ OCR engines run in parallel, comparing results character-by-character to eliminate hallucinations",
        icon: Brain,
        badge: "Court-Grade"
      },
      {
        title: "Confidence Propagation",
        description: "Pixel → Character → Token → Field → Document level trust scoring with uncertainty quantification",
        icon: TrendingUp,
        badge: "99.9% Target"
      },
      {
        title: "Trust Score Engine",
        description: "Combines extraction certainty + reconstruction risk + semantic validation + cross-document verification",
        icon: Shield,
        badge: "Bank-Ready"
      }
    ]
  },
  {
    category: "Forensic Integrity",
    icon: Fingerprint,
    color: "violet",
    items: [
      {
        title: "Original Preservation",
        description: "Source document never modified. Immutable storage with cryptographic hash verification",
        icon: Database,
        badge: "Legal-Grade"
      },
      {
        title: "Fingerprint & Hash",
        description: "Perceptual hashing detects tampering. Complete audit trail for chain of custody",
        icon: Fingerprint,
        badge: "Tamper-Proof"
      },
      {
        title: "Reconstruction Transparency",
        description: "Every AI-inferred character explicitly marked. No hidden hallucinations or silent corrections",
        icon: Layers,
        badge: "Full Disclosure"
      }
    ]
  },
  {
    category: "AI Reconstruction",
    icon: Sparkles,
    color: "indigo",
    items: [
      {
        title: "Damage-Aware Super-Resolution",
        description: "Typography-optimized enhancement using Real-ESRGAN + SwinIR tailored to document degradation type",
        icon: Sparkles,
        badge: "4x Resolution"
      },
      {
        title: "Ink Restoration",
        description: "Diffusion-based restoration recovers faded text while maintaining forensic fidelity to original",
        icon: Zap,
        badge: "AI-Powered"
      },
      {
        title: "Degradation Timeline",
        description: "Estimate document age, ink fading progression, and damage causes from visual analysis",
        icon: AlertTriangle,
        badge: "Historical"
      }
    ]
  },
  {
    category: "Semantic Intelligence",
    icon: Brain,
    color: "blue",
    items: [
      {
        title: "Missing Field Detection",
        description: "Identifies incomplete documents by comparing against expected schema and domain templates",
        icon: AlertTriangle,
        badge: "Smart"
      },
      {
        title: "Contradiction Detection",
        description: "Cross-field validation detects impossible values, date conflicts, and mathematical errors",
        icon: GitCompare,
        badge: "Logic Engine"
      },
      {
        title: "Domain-Specific Reasoning",
        description: "Specialized validation rules for appraisal, legal, banking, medical, and government documents",
        icon: Database,
        badge: "Adaptive"
      }
    ]
  },
  {
    category: "Human-in-the-Loop Learning",
    icon: Users,
    color: "amber",
    items: [
      {
        title: "Targeted Review",
        description: "Only low-confidence regions (<80%) flagged for human correction, not entire document",
        icon: Target,
        badge: "Efficient"
      },
      {
        title: "Correction Feedback Loop",
        description: "Every human correction automatically generates new validation rules and retrains extraction models",
        icon: TrendingUp,
        badge: "Self-Improving"
      },
      {
        title: "Adaptive Learning",
        description: "System learns per domain, per document type, and per organization's specific patterns",
        icon: Brain,
        badge: "Personalized"
      }
    ]
  },
  {
    category: "Cross-Source Verification",
    icon: GitCompare,
    color: "rose",
    items: [
      {
        title: "Registry Integration",
        description: "Verify against land registry, building permits, cadastral maps, and government databases",
        icon: Database,
        badge: "External"
      },
      {
        title: "Historical Deeds",
        description: "Compare with previous versions, amendments, and related documents in corpus",
        icon: Layers,
        badge: "Timeline"
      },
      {
        title: "Document Cross-Check",
        description: "Detect discrepancies between related documents (contracts, invoices, permits)",
        icon: GitCompare,
        badge: "Verification"
      }
    ]
  }
];

const techStack = [
  {
    category: "Backend",
    items: [
      "Python + FastAPI / Node.js",
      "Async processing (Celery / Prefect)",
      "Object storage (S3 / Azure Blob)",
      "Vector DB (Weaviate / Pinecone)"
    ]
  },
  {
    category: "AI Models",
    items: [
      "Layout: Donut, LayoutLMv3",
      "Restoration: Real-ESRGAN, SwinIR",
      "OCR: ABBYY + Google + Azure fusion",
      "Vision LLM: GPT-4V / Gemini Pro Vision"
    ]
  },
  {
    category: "Frontend",
    items: [
      "Layered viewer (6 layers)",
      "Confidence heatmaps",
      "Human correction interface",
      "Real-time processing status"
    ]
  },
  {
    category: "Evaluation",
    items: [
      "Field-level extraction accuracy",
      "Semantic accuracy scoring",
      "Reconstruction fidelity metrics",
      "A/B testing with validators"
    ]
  }
];

const accuracyStrategies = [
  {
    title: "Adaptive Model Selection",
    description: "Preprocess per degradation type → select specialized models for blur, stains, fading",
    icon: Sparkles,
    impact: "+8% accuracy"
  },
  {
    title: "Multi-OCR + LLM Reasoning",
    description: "Resolve conflicts automatically using contextual understanding and consensus voting",
    icon: Brain,
    impact: "+12% accuracy"
  },
  {
    title: "Targeted Human Correction",
    description: "AI-assisted correction for only low-confidence regions, not entire document",
    icon: Users,
    impact: "+15% accuracy"
  },
  {
    title: "Feedback Loop Retraining",
    description: "Continuous learning from real corrections, building domain-specific knowledge",
    icon: TrendingUp,
    impact: "+10% accuracy"
  },
  {
    title: "Cross-Document Verification",
    description: "External database lookup and related document comparison",
    icon: GitCompare,
    impact: "+6% accuracy"
  },
  {
    title: "Pixel-Level Confidence",
    description: "Region heatmaps guide human focus to highest-risk areas",
    icon: Target,
    impact: "+4% accuracy"
  },
  {
    title: "Layered Output Transparency",
    description: "No hallucinations hidden from reviewer, explicit reconstruction marking",
    icon: Layers,
    impact: "+5% trust"
  }
];

const colorMap = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-900", icon: "text-emerald-600" },
  violet: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-900", icon: "text-violet-600" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-900", icon: "text-indigo-600" },
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900", icon: "text-blue-600" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900", icon: "text-amber-600" },
  rose: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-900", icon: "text-rose-600" },
};

export default function Features() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-10">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Rocket className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Unicorn-Level Features</h1>
        </div>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Court-grade document intelligence that reaches <strong>99.9% accuracy</strong> on degraded documents
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1">Court-Grade Certified</Badge>
          <Badge className="bg-blue-100 text-blue-700 px-3 py-1">Bank-Ready</Badge>
          <Badge className="bg-violet-100 text-violet-700 px-3 py-1">Legal-Compliant</Badge>
        </div>
      </div>

      {/* Core Features */}
      <div className="space-y-8">
        {features.map((category, idx) => {
          const colors = colorMap[category.color];
          const CategoryIcon = category.icon;

          return (
            <div key={idx}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                  <CategoryIcon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">{category.category}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {category.items.map((item, i) => {
                  const ItemIcon = item.icon;
                  return (
                    <Card key={i} className={`border-2 ${colors.border} ${colors.bg} hover:shadow-lg transition-all duration-300`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className={`w-9 h-9 rounded-lg ${colors.bg} ring-2 ${colors.border} flex items-center justify-center`}>
                            <ItemIcon className={`w-4 h-4 ${colors.icon}`} />
                          </div>
                          <Badge variant="outline" className={`text-[10px] ${colors.text} ${colors.border}`}>
                            {item.badge}
                          </Badge>
                        </div>
                        <CardTitle className={`text-sm font-bold ${colors.text}`}>
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Path to 99.9% Accuracy */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-blue-900">How We Reach 99.9% Accuracy on Degraded Documents</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accuracyStrategies.map((strategy, i) => {
              const StrategyIcon = strategy.icon;
              return (
                <div key={i} className="p-4 bg-white rounded-xl border-2 border-blue-200 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <StrategyIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1">{strategy.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{strategy.description}</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 text-[10px] font-semibold">
                    {strategy.impact}
                  </Badge>
                </div>
              );
            })}
          </div>
          <div className="mt-6 p-4 bg-white rounded-xl border-2 border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Total Accuracy Improvement</p>
                <p className="text-xs text-slate-600 mt-0.5">From 40% (single OCR) to 99.9% (full pipeline)</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-emerald-600">+60%</p>
                <p className="text-xs text-slate-500">accuracy gain</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Stack */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-violet-600" />
            <CardTitle className="text-slate-900">Technical Stack</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((stack, i) => (
              <div key={i} className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-200">
                  {stack.category}
                </h3>
                <ul className="space-y-2">
                  {stack.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                      <span className="text-xs text-slate-600 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitive Moat */}
      <Card className="border-emerald-200 bg-emerald-50/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-emerald-600" />
            <CardTitle className="text-emerald-900">Competitive Moat & Defensibility</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MoatCard
              title="Trust-First Architecture"
              description="Unlike traditional OCR, every design decision prioritizes trust and transparency over speed"
            />
            <MoatCard
              title="Proprietary Correction Dataset"
              description="Each human correction strengthens the system. Network effects create data moat"
            />
            <MoatCard
              title="Court & Bank Certification"
              description="Meeting legal/financial standards creates regulatory barrier to entry"
            />
            <MoatCard
              title="Domain Validation Rules"
              description="Learned rules compound over time. Switching cost increases with usage"
            />
            <MoatCard
              title="Multi-Model Consensus IP"
              description="Proprietary fusion algorithm and confidence propagation methodology"
            />
            <MoatCard
              title="Reconstruction Transparency"
              description="Legal contexts demand explainability that traditional OCR cannot provide"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MoatCard({ title, description }) {
  return (
    <div className="p-4 bg-white rounded-lg border-2 border-emerald-200">
      <div className="flex items-start gap-2 mb-2">
        <Shield className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        <h3 className="text-sm font-bold text-emerald-900">{title}</h3>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}