import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ChevronRight, ChevronLeft, Sparkles, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MilestoneCelebration from "./MilestoneCelebration";

const TOURS = {
  admin: [
    {
      id: "welcome_admin",
      title: "Welcome, Admin! 🎉",
      description: "You have full access to DocIntel's powerful AI engine. Let's get you started with the key features.",
      page: null,
      position: "center"
    },
    {
      id: "dashboard",
      title: "Command Center Dashboard",
      description: "Your real-time overview of all document processing, workflows, and AI performance metrics.",
      page: "Dashboard",
      highlight: null
    },
    {
      id: "upload_docs",
      title: "Upload & Process Documents",
      description: "Upload PDFs, images, or scans. Our AI pipeline automatically enhances, classifies, and extracts data.",
      page: "Upload",
      highlight: null
    },
    {
      id: "workflows",
      title: "Workflow Automation",
      description: "Create automated workflows with AI-powered routing, version control, and optimization recommendations.",
      page: "Workflows",
      highlight: null
    },
    {
      id: "ai_optimization",
      title: "AI Optimization Engine",
      description: "Our AI continuously learns from your workflows, predicts bottlenecks, and adapts routing rules automatically.",
      page: "Workflows",
      highlight: null
    },
    {
      id: "analytics",
      title: "Deep Analytics",
      description: "Track processing accuracy, confidence scores, anomaly rates, and AI performance over time.",
      page: "Analytics",
      highlight: null
    },
    {
      id: "config_admin",
      title: "System Configuration",
      description: "Configure document types, validation rules, external data sources, and anomaly detection models.",
      page: "DocumentTypeConfiguration",
      highlight: null
    },
    {
      id: "tour_done_admin",
      title: "You're All Set! 🚀",
      description: "You now have a full overview of DocIntel. Explore freely, and use the help tips (?) throughout the app whenever you need guidance.",
      page: null,
      position: "center"
    }
  ],
  user: [
    {
      id: "welcome_user",
      title: "Welcome to DocIntel! 👋",
      description: "An intelligent document processing platform. Let's take a quick tour of your key features.",
      page: null,
      position: "center"
    },
    {
      id: "upload_user",
      title: "Upload Your Documents",
      description: "Upload PDFs, images, or scans. AI will automatically process and extract key information within seconds.",
      page: "Upload",
      highlight: null
    },
    {
      id: "documents_user",
      title: "View Processed Documents",
      description: "Browse all your documents with AI-extracted data, confidence scores, and anomaly flags.",
      page: "Documents",
      highlight: null
    },
    {
      id: "workflow_monitor",
      title: "Track Workflow Progress",
      description: "Monitor your documents as they move through automated approval and processing workflows in real time.",
      page: "WorkflowMonitoring",
      highlight: null
    },
    {
      id: "reports_user",
      title: "Generate Reports",
      description: "Create AI-powered summaries and detailed reports from your processed documents.",
      page: "ReportGeneration",
      highlight: null
    },
    {
      id: "tour_done_user",
      title: "Ready to Go! 🎯",
      description: "Start by uploading your first document. Contextual tips will guide you through each feature.",
      page: null,
      position: "center"
    }
  ]
};

const MILESTONES = {
  admin: [
    { id: "first_login", label: "First Login", steps: ["welcome_admin"] },
    { id: "explored_dashboard", label: "Dashboard Explorer", steps: ["dashboard"] },
    { id: "workflow_master", label: "Workflow Master", steps: ["workflows", "ai_optimization"] },
    { id: "tour_complete", label: "Tour Graduate", steps: ["tour_done_admin"] }
  ],
  user: [
    { id: "first_login", label: "First Login", steps: ["welcome_user"] },
    { id: "doc_explorer", label: "Document Explorer", steps: ["documents_user"] },
    { id: "report_ready", label: "Report Ready", steps: ["reports_user"] },
    { id: "tour_complete", label: "Tour Graduate", steps: ["tour_done_user"] }
  ]
};

export default function OnboardingTour({ user, currentPageName }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [celebration, setCelebration] = useState(null);
  const queryClient = useQueryClient();

  const role = user?.role === "admin" ? "admin" : "user";
  const steps = TOURS[role] || TOURS.user;
  const milestones = MILESTONES[role] || MILESTONES.user;

  const { data: progress } = useQuery({
    queryKey: ["onboardingProgress", user?.email],
    queryFn: async () => {
      const results = await base44.entities.OnboardingProgress.filter({ user_email: user.email });
      return results[0] || null;
    },
    enabled: !!user?.email
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (progress?.id) {
        return base44.entities.OnboardingProgress.update(progress.id, data);
      }
      return base44.entities.OnboardingProgress.create({ user_email: user.email, user_role: role, ...data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboardingProgress", user?.email] });
    }
  });

  useEffect(() => {
    if (progress && steps) {
      const lastCompleted = steps.findLastIndex(s => progress.completed_steps?.includes(s.id));
      if (lastCompleted >= 0 && lastCompleted < steps.length - 1) {
        setCurrentStepIndex(lastCompleted + 1);
      }
    }
  }, [progress]);

  const currentStep = steps[currentStepIndex];
  const completedSteps = progress?.completed_steps || [];
  const achievedMilestones = progress?.milestones_achieved || [];

  const checkMilestones = (newCompletedSteps) => {
    milestones.forEach(milestone => {
      if (!achievedMilestones.includes(milestone.id)) {
        const allDone = milestone.steps.every(s => newCompletedSteps.includes(s));
        if (allDone) {
          setCelebration(milestone.label);
        }
      }
    });
  };

  const handleNext = () => {
    const newCompleted = [...completedSteps, currentStep.id];
    checkMilestones(newCompleted);
    const newMilestones = milestones
      .filter(m => !achievedMilestones.includes(m.id) && m.steps.every(s => newCompleted.includes(s)))
      .map(m => m.id);

    saveMutation.mutate({
      completed_steps: newCompleted,
      milestones_achieved: [...achievedMilestones, ...newMilestones],
      current_step: steps[currentStepIndex + 1]?.id || currentStep.id
    });

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      saveMutation.mutate({ tour_completed: true, completed_steps: newCompleted });
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
  };

  const handleDismiss = () => {
    saveMutation.mutate({ tour_dismissed: true });
  };

  // Don't show if dismissed or completed
  if (!user || progress?.tour_dismissed || progress?.tour_completed) return null;

  // If step requires a specific page, only show on that page (for non-center steps)
  if (currentStep?.page && currentStep.page !== currentPageName) return null;

  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;
  const progressPct = Math.round(((completedSteps.length) / steps.length) * 100);

  return (
    <>
      {celebration && (
        <MilestoneCelebration
          milestone={celebration}
          onDone={() => setCelebration(null)}
        />
      )}

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 w-80"
        >
          <div className="glass-ultra rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600/30 to-violet-600/30 px-4 py-3 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">Guided Tour</span>
                <Badge className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0 border-0">
                  {currentStepIndex + 1}/{steps.length}
                </Badge>
              </div>
              <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-slate-700/50">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Content */}
            <div className="p-4">
              {currentStep?.page && (
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-blue-400">{currentStep.page}</span>
                </div>
              )}
              <motion.div
                key={currentStep?.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-sm font-bold text-gray-100 mb-2">{currentStep?.title}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{currentStep?.description}</p>
              </motion.div>
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 flex items-center justify-between gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleBack}
                disabled={isFirst}
                className="text-xs h-8 gap-1"
              >
                <ChevronLeft className="w-3 h-3" />
                Back
              </Button>
              <button
                onClick={handleDismiss}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Skip tour
              </button>
              <Button
                size="sm"
                onClick={handleNext}
                className="text-xs h-8 gap-1"
              >
                {isLast ? "Finish" : "Next"}
                {!isLast && <ChevronRight className="w-3 h-3" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}