import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Lock, CheckCircle, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  "Unlimited AI document processing",
  "Advanced anomaly detection",
  "Automated workflow routing",
  "AI-powered root cause analysis",
  "Predictive resource planning",
  "Full analytics & reporting",
  "Batch processing (unlimited)",
  "Priority AI processing queue"
];

export default function UpgradeWall({ onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6"
      style={{ backdropFilter: "blur(20px)", background: "rgba(5, 0, 20, 0.85)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.3 }}
        className="glass-ultra rounded-3xl border border-violet-500/30 shadow-2xl max-w-lg w-full overflow-hidden"
        style={{ boxShadow: "0 0 80px rgba(139, 92, 246, 0.3)" }}
      >
        {/* Glow header */}
        <div className="relative bg-gradient-to-br from-violet-600/40 to-blue-600/40 p-8 text-center overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-pink-500/10 to-blue-500/10 animate-pulse" />
          <motion.div
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <Lock className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-black text-white mb-2">You've Used Your Free Credit</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            You just experienced the power of DocIntel AI. Unlock full access to process unlimited documents.
          </p>
        </div>

        {/* Features */}
        <div className="p-6">
          <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Everything in Full Access
          </div>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-xs text-gray-300">{f}</span>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
              boxShadow: "0 0 30px rgba(102, 126, 234, 0.5), 0 8px 30px rgba(0,0,0,0.3)"
            }}
          >
            <Zap className="w-5 h-5" />
            Get Full Access Now
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <p className="text-center text-xs text-gray-500 mt-3">
            Contact your administrator to upgrade your account
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}