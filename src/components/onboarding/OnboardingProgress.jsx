import React from "react";
import { motion } from "framer-motion";
import { Trophy, CheckCircle, Circle, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const MILESTONE_LABELS = {
  first_login: { label: "First Login", icon: "🚀" },
  explored_dashboard: { label: "Dashboard Explorer", icon: "📊" },
  workflow_master: { label: "Workflow Master", icon: "⚙️" },
  tour_complete: { label: "Tour Graduate", icon: "🎓" },
  doc_explorer: { label: "Document Explorer", icon: "📄" },
  report_ready: { label: "Report Ready", icon: "📋" }
};

export default function OnboardingProgressWidget({ user }) {
  const { data: progress } = useQuery({
    queryKey: ["onboardingProgress", user?.email],
    queryFn: async () => {
      const results = await base44.entities.OnboardingProgress.filter({ user_email: user.email });
      return results[0] || null;
    },
    enabled: !!user?.email
  });

  if (!progress || (!progress.completed_steps?.length && !progress.milestones_achieved?.length)) return null;

  const achieved = progress.milestones_achieved || [];
  const allMilestones = Object.entries(MILESTONE_LABELS);
  const achievedMilestones = allMilestones.filter(([id]) => achieved.includes(id));
  const completionPct = progress.tour_completed ? 100 : Math.round((progress.completed_steps?.length || 0) / 8 * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl border border-white/10 p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-bold text-gray-200">Onboarding Progress</span>
        <span className="ml-auto text-xs text-gray-400">{completionPct}%</span>
      </div>

      <div className="h-1.5 bg-slate-700/50 rounded-full mb-3">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
          initial={{ width: 0 }}
          animate={{ width: `${completionPct}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>

      {achievedMilestones.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            Milestones Achieved
          </div>
          {achievedMilestones.map(([id, data]) => (
            <div key={id} className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-xs text-gray-300">{data.icon} {data.label}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}