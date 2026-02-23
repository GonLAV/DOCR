import React from "react";
import { Card } from "@/components/ui/card";
import { 
  Upload, 
  Shield, 
  AlertTriangle, 
  Sparkles, 
  LayoutGrid, 
  Brain, 
  Users, 
  GitCompare, 
  Layers,
  ArrowDown,
  Check
} from "lucide-react";

const stages = [
  {
    id: "input",
    title: "Scanned Document / Image Input",
    icon: Upload,
    color: "blue",
    description: "PDF, JPG, PNG, TIFF uploads"
  },
  {
    id: "preservation",
    title: "Forensic Preservation Layer",
    icon: Shield,
    color: "violet",
    details: [
      "Store original binary",
      "Perceptual hash & fingerprint",
      "Metadata extraction (scanner, date, etc.)"
    ]
  },
  {
    id: "damage",
    title: "Damage & Degradation Analyzer",
    icon: AlertTriangle,
    color: "amber",
    details: [
      "Detect fold, stain, blur, ink fading",
      "Tag each region by type of degradation"
    ]
  },
  {
    id: "enhancement",
    title: "Multi-Model Enhancement Pipeline",
    icon: Sparkles,
    color: "indigo",
    details: [
      "Deskew / perspective correction",
      "Noise removal / deblurring",
      "Super-resolution (typography optimized)",
      "AI ink restoration",
      "Region-aware adaptive contrast"
    ]
  },
  {
    id: "layout",
    title: "Layout & Structural AI",
    icon: LayoutGrid,
    color: "cyan",
    details: [
      "Paragraphs, columns",
      "Tables, signatures, stamps",
      "Handwriting / diagram segmentation"
    ]
  },
  {
    id: "semantic",
    title: "Multi-Model OCR & Semantic Extraction",
    icon: Brain,
    color: "emerald",
    details: [
      "ABBYY / Google OCR / Azure Form Recognizer fusion",
      "Vision LLM for context-aware text reading",
      "Cross-check token-level confidence",
      "Identify contradictions / missing fields"
    ]
  },
  {
    id: "confidence",
    title: "Human-in-the-Loop Correction Interface",
    icon: Users,
    color: "rose",
    details: [
      "Highlight low-confidence regions",
      "AI-assisted suggestions",
      "Corrections feed back into domain-specific learning"
    ]
  },
  {
    id: "verification",
    title: "Cross-Document Reasoning & Verification",
    icon: GitCompare,
    color: "purple",
    details: [
      "Compare with other documents",
      "Compare with external databases",
      "Flag anomalies / inconsistencies"
    ]
  },
  {
    id: "output",
    title: "Layered Output Generator",
    icon: Layers,
    color: "slate",
    details: [
      "Layer 1: Original scan",
      "Layer 2: Enhanced image",
      "Layer 3: OCR text layer",
      "Layer 4: Structured JSON with entities & relationships",
      "Layer 5: AI annotations + confidence heatmap",
      "Layer 6: Decision / trust score"
    ]
  }
];

const colorMap = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", text: "text-blue-900" },
  violet: { bg: "bg-violet-50", border: "border-violet-200", icon: "text-violet-600", text: "text-violet-900" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600", text: "text-amber-900" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", icon: "text-indigo-600", text: "text-indigo-900" },
  cyan: { bg: "bg-cyan-50", border: "border-cyan-200", icon: "text-cyan-600", text: "text-cyan-900" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-600", text: "text-emerald-900" },
  rose: { bg: "bg-rose-50", border: "border-rose-200", icon: "text-rose-600", text: "text-rose-900" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-600", text: "text-purple-900" },
  slate: { bg: "bg-slate-50", border: "border-slate-200", icon: "text-slate-600", text: "text-slate-900" },
};

export default function FlowDiagram({ currentStage, completedStages = [] }) {
  return (
    <div className="space-y-3">
      {stages.map((stage, index) => {
        const colors = colorMap[stage.color];
        const Icon = stage.icon;
        const isCompleted = completedStages.includes(stage.id);
        const isCurrent = currentStage === stage.id;
        const isPending = !isCompleted && !isCurrent;

        return (
          <div key={stage.id} className="relative">
            <Card className={`p-4 border-2 transition-all duration-300 ${
              isCurrent ? `${colors.border} ${colors.bg} shadow-lg scale-[1.02]` :
              isCompleted ? `border-emerald-200 bg-emerald-50/50` :
              `border-slate-200 bg-slate-50/50 opacity-70`
            }`}>
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isCurrent ? colors.bg :
                  isCompleted ? "bg-emerald-100" :
                  "bg-slate-100"
                }`}>
                  {isCompleted ? (
                    <Check className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <Icon className={`w-6 h-6 ${
                      isCurrent ? colors.icon :
                      isPending ? "text-slate-400" :
                      colors.icon
                    }`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`text-sm font-bold ${
                      isCurrent ? colors.text :
                      isCompleted ? "text-emerald-800" :
                      "text-slate-600"
                    }`}>
                      {stage.title}
                    </h3>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold animate-pulse">
                        PROCESSING
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">
                        COMPLETE
                      </span>
                    )}
                  </div>

                  {stage.description && (
                    <p className="text-xs text-slate-500 mb-2">{stage.description}</p>
                  )}

                  {stage.details && (
                    <ul className="space-y-1">
                      {stage.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${
                            isCompleted ? "bg-emerald-400" :
                            isCurrent ? colors.icon.replace("text-", "bg-") :
                            "bg-slate-300"
                          }`} />
                          <span className={`text-xs leading-relaxed ${
                            isCompleted ? "text-emerald-700" :
                            isCurrent ? "text-slate-700" :
                            "text-slate-400"
                          }`}>
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Card>

            {/* Arrow */}
            {index < stages.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowDown className={`w-5 h-5 ${
                  isCompleted ? "text-emerald-400" :
                  isCurrent ? "text-blue-400 animate-bounce" :
                  "text-slate-300"
                }`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}