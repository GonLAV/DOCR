import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

export default function MilestoneCelebration({ milestone, onDone }) {
  useEffect(() => {
    // Fire confetti
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#667eea", "#764ba2", "#f093fb", "#4facfe", "#00f2fe"]
    });

    const timer = setTimeout(onDone, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: -50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: -50 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="fixed top-24 left-1/2 -translate-x-1/2 z-[100]"
      >
        <div className="glass-ultra rounded-2xl border border-yellow-400/30 shadow-2xl px-8 py-5 text-center"
          style={{ boxShadow: "0 0 40px rgba(251, 191, 36, 0.3)" }}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-3"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Trophy className="w-7 h-7 text-white" />
            </div>
          </motion.div>

          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Milestone Unlocked</span>
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          </div>

          <h3 className="text-lg font-black text-gray-100 mb-1">{milestone}</h3>

          <div className="flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <p className="text-xs text-gray-400">Achievement unlocked!</p>
            <Sparkles className="w-3 h-3 text-violet-400" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}