import React from "react";
import { motion } from "framer-motion";
import { 
  Target, 
  Sparkles, 
  Brain, 
  Shield, 
  GitCompare, 
  Users,
  Layers,
  TrendingUp,
  Rocket,
  Award,
  Zap,
  Eye,
  Database,
  Fingerprint
} from "lucide-react";

export default function Vision() {
  return (
    <div className="min-h-screen p-6 lg:p-10 space-y-10">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-strong rounded-3xl p-10 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-600/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-500/30 to-blue-600/30 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center space-y-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-400 via-pink-500 to-red-600 flex items-center justify-center neon-pink animate-float">
              <Eye className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
            Beyond <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Traditional OCR</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
            The world's first <strong className="text-cyan-300">Intelligent Document Understanding Engine</strong> combining
            forensic preservation, multi-model AI, and human-in-the-loop learning
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <span className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-white font-bold text-sm">
              99.9% Accuracy Target
            </span>
            <span className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-bold text-sm">
              Court-Grade Certified
            </span>
            <span className="px-5 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-white font-bold text-sm">
              Bank-Ready Output
            </span>
          </div>
        </div>
      </motion.div>

      {/* Core Philosophy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white">Core Philosophy</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <PhilosophyCard
            icon={Shield}
            title="Forensic Preservation First"
            description="Original document never modified. Cryptographic fingerprinting, immutable storage, and complete audit trail for legal compliance."
            gradient="from-violet-500 to-purple-500"
          />
          <PhilosophyCard
            icon={Sparkles}
            title="AI Enhancement"
            description="Adaptive super-resolution, ink restoration, damage repair - all tailored per region type (text, signatures, diagrams)."
            gradient="from-blue-500 to-cyan-500"
          />
          <PhilosophyCard
            icon={Brain}
            title="Semantic Understanding"
            description="Vision+LLM reasoning extracts meaning, validates cross-field logic, detects anomalies - not just character recognition."
            gradient="from-emerald-500 to-teal-500"
          />
          <PhilosophyCard
            icon={Users}
            title="Human-in-the-Loop"
            description="Only flag low-confidence regions (<80%) for review. AI-assisted corrections feed back into model for continuous improvement."
            gradient="from-orange-500 to-red-500"
          />
          <PhilosophyCard
            icon={Layers}
            title="Layered Output"
            description="Original + Enhanced + OCR + JSON + Confidence Heatmap + Trust Score. Full transparency at every level."
            gradient="from-pink-500 to-rose-500"
          />
          <PhilosophyCard
            icon={GitCompare}
            title="Cross-Source Verification"
            description="Compare against related documents, external databases, government registries for ultimate accuracy."
            gradient="from-indigo-500 to-purple-500"
          />
        </div>
      </motion.div>

      {/* Killer Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white">Enterprise-Grade Features</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FeatureSection
            title="Hybrid OCR Engine"
            icon={Brain}
            gradient="from-blue-500 to-cyan-500"
            features={[
              "Traditional pattern-based OCR (Tesseract-style baseline)",
              "Neural network OCR for handwriting & complex layouts",
              "Vision+LLM reasoning for contextual understanding",
              "3+ model consensus with character-level alignment",
              "Weighted voting based on historical accuracy",
              "Disagreement detection & hallucination prevention"
            ]}
          />

          <FeatureSection
            title="Multimodal Understanding"
            icon={Sparkles}
            gradient="from-purple-500 to-pink-500"
            features={[
              "Text, tables, images, diagrams, handwriting, signatures",
              "Semantic table extraction with relationship understanding",
              "Layout analysis (LayoutLMv3) - paragraphs, columns, regions",
              "Multilingual & mixed-language support (RTL + LTR)",
              "Chart and diagram interpretation via Vision LLM",
              "Signature and stamp recognition + verification"
            ]}
          />

          <FeatureSection
            title="Intelligent Validation"
            icon={Shield}
            gradient="from-emerald-500 to-teal-500"
            features={[
              "Contextual data validation against external datasets",
              "Cross-field logic checks (dates, amounts, IDs)",
              "Missing field detection & predictive extraction",
              "Contradiction and anomaly detection",
              "Domain-specific rules (legal, financial, medical)",
              "Real-time confidence scoring per field"
            ]}
          />

          <FeatureSection
            title="Enterprise Integration"
            icon={Database}
            gradient="from-orange-500 to-red-500"
            features={[
              "Pre-built connectors: ERP, CRM, SAP, Salesforce",
              "Cloud storage integration (S3, Azure, Google Drive)",
              "Government database lookups (land registry, tax)",
              "Intelligent batch prioritization by complexity",
              "API-first design for workflow automation",
              "Real-time feedback loop for self-learning"
            ]}
          />
        </div>
      </motion.div>

      {/* Path to 99.9% */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-strong rounded-3xl p-8 hover-lift"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white">Path to 99.9% Accuracy</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              step: "1",
              title: "Damage-Aware Preprocessing",
              description: "Detect degradation type (blur, stains, fading, folds) → select specialized models per region",
              impact: "+8%",
              gradient: "from-blue-500 to-cyan-500"
            },
            {
              step: "2",
              title: "Multi-Model OCR Consensus",
              description: "Run 3+ OCR engines in parallel (ABBYY, Google, Azure) + Vision LLM for cross-validation",
              impact: "+12%",
              gradient: "from-purple-500 to-pink-500"
            },
            {
              step: "3",
              title: "Confidence Fusion",
              description: "Track confidence from pixel → character → field → document with Bayesian fusion",
              impact: "+10%",
              gradient: "from-emerald-500 to-teal-500"
            },
            {
              step: "4",
              title: "Semantic Validation",
              description: "Cross-field logic checks, external database verification, domain rule validation",
              impact: "+7%",
              gradient: "from-orange-500 to-red-500"
            },
            {
              step: "5",
              title: "Human-in-the-Loop Targeted",
              description: "Correction only on low-confidence regions, feeding domain-specific model improvements",
              impact: "+15%",
              gradient: "from-pink-500 to-rose-500"
            },
            {
              step: "6",
              title: "Cross-Document Intelligence",
              description: "Compare against related docs, historical versions, external registries",
              impact: "+8%",
              gradient: "from-indigo-500 to-purple-500"
            }
          ].map((strategy, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-start gap-4 p-5 glass rounded-2xl hover:glass-strong transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${strategy.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <span className="text-2xl font-black text-white">{strategy.step}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">{strategy.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{strategy.description}</p>
              </div>
              <div className={`px-4 py-2 bg-gradient-to-r ${strategy.gradient} rounded-xl shrink-0`}>
                <span className="text-white font-black text-lg">{strategy.impact}</span>
              </div>
            </motion.div>
          ))}

          <div className="mt-6 p-6 glass-strong rounded-2xl border-2 border-emerald-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">Total Accuracy Improvement</p>
                <p className="text-gray-300 mt-1">From 40% (single OCR) → 99.9% (full pipeline)</p>
              </div>
              <div className="text-right">
                <p className="text-6xl font-black text-emerald-400">+60%</p>
                <p className="text-gray-400 text-sm">Accuracy Gain</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Competitive Advantage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-strong rounded-3xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white">What Makes Us #1</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DifferentiatorCard
            title="Explainable AI"
            description="Every field extraction shows WHY the AI interpreted it that way. Critical for legal/audit contexts."
            icon={Eye}
          />
          <DifferentiatorCard
            title="Hybrid Learning"
            description="Combines traditional OCR precision with neural network flexibility and LLM reasoning."
            icon={Brain}
          />
          <DifferentiatorCard
            title="PII Auto-Redaction"
            description="Automatically detects and redacts sensitive information (SSN, credit cards, medical IDs)."
            icon={Shield}
          />
          <DifferentiatorCard
            title="Court-Grade Output"
            description="Forensic preservation, audit trail, reconstruction transparency - ready for legal proceedings."
            icon={Fingerprint}
          />
          <DifferentiatorCard
            title="Domain Specialization"
            description="Pre-trained models for legal, medical, financial, insurance, and government documents."
            icon={Database}
          />
          <DifferentiatorCard
            title="Real-Time Learning"
            description="Every correction instantly improves the system. Network effects create data moat."
            icon={TrendingUp}
          />
        </div>
      </motion.div>
    </div>
  );
}

function PhilosophyCard({ icon: Icon, title, description, gradient }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="glass-strong rounded-2xl p-6 hover-lift group"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-lg font-bold text-white mt-3">{title}</h3>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function FeatureSection({ title, icon: Icon, gradient, features }) {
  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <ul className="space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 group">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${gradient} mt-2 shrink-0 group-hover:scale-150 transition-transform`} />
            <span className="text-sm text-gray-300 leading-relaxed group-hover:text-white transition-colors">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DifferentiatorCard({ title, description, icon: Icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass rounded-2xl p-5 hover:glass-strong transition-all duration-300 group"
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5 text-cyan-400" />
        </div>
        <h3 className="text-base font-bold text-white mt-1">{title}</h3>
      </div>
      <p className="text-xs text-gray-300 leading-relaxed">{description}</p>
    </motion.div>
  );
}