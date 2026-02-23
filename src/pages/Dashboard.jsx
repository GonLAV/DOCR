import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { FileText, CheckCircle2, AlertTriangle, Clock, TrendingUp, Zap, Shield, Brain } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: documents = [] } = useQuery({
    queryKey: ["documents"],
    queryFn: () => base44.entities.Document.list("-created_date", 50),
  });

  const total = documents.length;
  const completed = documents.filter(d => d.status === "completed").length;
  const processing = documents.filter(d => ["processing", "analyzing"].includes(d.status)).length;
  const flagged = documents.filter(d => d.tampering_risk === "high" || d.tampering_risk === "medium").length;
  const avgConfidence = completed > 0
    ? Math.round(documents.filter(d => d.confidence_score != null).reduce((s, d) => s + d.confidence_score, 0) / completed)
    : 0;

  const recentDocs = documents.slice(0, 5);

  return (
    <div className="min-h-screen p-6 lg:p-10 space-y-8">
      {/* Hero Header with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-strong rounded-3xl p-8 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/20 to-pink-600/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center neon-blue animate-float">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">Command Center</h1>
              <p className="text-cyan-300 text-lg font-medium">Real-time Document Intelligence</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="glass rounded-2xl p-4 hover-lift">
              <div className="text-cyan-300 text-sm font-semibold mb-1">Processing Speed</div>
              <div className="text-white text-3xl font-black">99.9<span className="text-xl">%</span></div>
            </div>
            <div className="glass rounded-2xl p-4 hover-lift">
              <div className="text-purple-300 text-sm font-semibold mb-1">AI Accuracy</div>
              <div className="text-white text-3xl font-black">{avgConfidence}<span className="text-xl">%</span></div>
            </div>
            <div className="glass rounded-2xl p-4 hover-lift">
              <div className="text-pink-300 text-sm font-semibold mb-1">Active Models</div>
              <div className="text-white text-3xl font-black">12<span className="text-xl">+</span></div>
            </div>
            <div className="glass rounded-2xl p-4 hover-lift">
              <div className="text-emerald-300 text-sm font-semibold mb-1">Trust Score</div>
              <div className="text-white text-3xl font-black">A<span className="text-xl">+</span></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid with Neon Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Documents"
          value={total}
          subtitle={`${processing} in pipeline`}
          icon={FileText}
          gradient="from-blue-500 to-cyan-500"
          delay={0}
        />
        <StatCard
          title="Completed"
          value={completed}
          subtitle={`${avgConfidence}% confidence`}
          icon={CheckCircle2}
          gradient="from-emerald-500 to-teal-500"
          delay={0.1}
        />
        <StatCard
          title="Processing"
          value={processing}
          subtitle="Active pipeline"
          icon={Clock}
          gradient="from-orange-500 to-red-500"
          delay={0.2}
        />
        <StatCard
          title="Flagged"
          value={flagged}
          subtitle="Needs review"
          icon={AlertTriangle}
          gradient="from-pink-500 to-rose-500"
          delay={0.3}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-strong rounded-3xl p-6 hover-lift"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            </div>
            <span className="text-xs text-cyan-300 font-semibold px-3 py-1 glass rounded-full">
              LIVE
            </span>
          </div>

          <div className="space-y-3">
            {recentDocs.length > 0 ? recentDocs.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="glass rounded-2xl p-4 hover:glass-strong transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getStatusGradient(doc.status)} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold group-hover:text-cyan-300 transition-colors">
                        {doc.title}
                      </div>
                      <div className="text-gray-400 text-sm mt-0.5">
                        {new Date(doc.created_date).toLocaleDateString()} • {new Date(doc.created_date).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={doc.status} />
                    {doc.confidence_score && (
                      <div className="text-emerald-400 font-bold text-sm">
                        {doc.confidence_score}%
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No documents yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Insights Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          {/* Trust Score */}
          <div className="glass-strong rounded-3xl p-6 hover-lift">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Trust Score</h3>
            </div>
            
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="url(#gradient1)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(avgConfidence / 100) * 352} 352`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-black text-white">{avgConfidence}</div>
                  <div className="text-xs text-cyan-300 font-semibold">TRUST</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <MetricBar label="Extraction" value={95} color="from-blue-500 to-cyan-500" />
              <MetricBar label="Validation" value={88} color="from-purple-500 to-pink-500" />
              <MetricBar label="Consensus" value={92} color="from-emerald-500 to-teal-500" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-strong rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <QuickAction icon={Zap} label="New Upload" gradient="from-cyan-500 to-blue-500" />
              <QuickAction icon={Brain} label="AI Analysis" gradient="from-purple-500 to-pink-500" />
              <QuickAction icon={FileText} label="View Reports" gradient="from-emerald-500 to-teal-500" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, gradient, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-strong rounded-3xl p-6 hover-lift relative overflow-hidden group cursor-pointer"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-20 rounded-full blur-2xl group-hover:opacity-30 transition-opacity`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center neon-blue group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className={`text-5xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {value}
          </div>
        </div>
        
        <div className="text-white font-semibold text-lg mb-1">{title}</div>
        <div className="text-gray-400 text-sm">{subtitle}</div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const config = {
    completed: { label: "Complete", gradient: "from-emerald-500 to-teal-500" },
    processing: { label: "Processing", gradient: "from-orange-500 to-red-500" },
    analyzing: { label: "Analyzing", gradient: "from-purple-500 to-pink-500" },
    uploaded: { label: "Queued", gradient: "from-blue-500 to-cyan-500" },
    failed: { label: "Failed", gradient: "from-red-500 to-rose-500" }
  };

  const { label, gradient } = config[status] || config.uploaded;

  return (
    <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${gradient} text-white text-xs font-bold`}>
      {label}
    </div>
  );
}

function getStatusGradient(status) {
  const gradients = {
    completed: "from-emerald-500 to-teal-500",
    processing: "from-orange-500 to-red-500",
    analyzing: "from-purple-500 to-pink-500",
    uploaded: "from-blue-500 to-cyan-500",
    failed: "from-red-500 to-rose-500"
  };
  return gradients[status] || gradients.uploaded;
}

function MetricBar({ label, value, color }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-300 font-medium">{label}</span>
        <span className="text-white font-bold">{value}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-full bg-gradient-to-r ${color} rounded-full`}
        />
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, gradient }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      className="w-full glass rounded-xl p-3 hover:glass-strong transition-all duration-300 group"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-semibold group-hover:text-cyan-300 transition-colors">{label}</span>
      </div>
    </motion.button>
  );
}