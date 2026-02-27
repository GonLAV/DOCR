import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  FileSearch,
  LayoutDashboard,
  Upload,
  GitCompare,
  Settings,
  Layers,
  Workflow,
  Sparkles,
  Zap,
  BarChart3,
  Activity,
  FileText,
  Crown,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/effects/ParticleBackground";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import ThemeToggle from "@/components/theme/ThemeToggle";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import OnboardingProgressWidget from "@/components/onboarding/OnboardingProgress";
import { getPermissions } from "@/components/auth/permissions";

// permKey maps to a permission flag from getPermissions()
const navItems = [
  { name: "Upload",             icon: Upload,         page: "Upload",                   gradient: "from-pink-500 to-rose-500" },
  { name: "Dashboard",          icon: LayoutDashboard,page: "Dashboard",                gradient: "from-blue-500 to-cyan-500" },
  { name: "Documents",          icon: FileSearch,     page: "Documents",                gradient: "from-violet-500 to-purple-500" },
  { name: "Workflows",          icon: GitCompare,     page: "Workflows",                gradient: "from-violet-500 to-purple-500",  permKey: "canViewWorkflows" },
  { name: "Workflow Monitor",   icon: Activity,       page: "WorkflowMonitoring",       gradient: "from-cyan-500 to-teal-500",     permKey: "canViewWorkflowMonitor" },
  { name: "Analytics",          icon: BarChart3,      page: "Analytics",                gradient: "from-amber-500 to-orange-500",  permKey: "canViewAnalytics" },
  { name: "Reports",            icon: FileText,       page: "ReportGeneration",         gradient: "from-rose-500 to-pink-500",     permKey: "canViewReports" },
  { name: "Batch Processing",   icon: Settings,       page: "BatchProcessing",          gradient: "from-fuchsia-500 to-purple-500",permKey: "canViewBatchProcessing" },
  { name: "Compare",            icon: GitCompare,     page: "Compare",                  gradient: "from-cyan-500 to-blue-500",     permKey: "canViewCompare" },
  { name: "Vision",             icon: Sparkles,       page: "Vision",                   gradient: "from-purple-500 to-pink-500" },
  { name: "Features",           icon: Zap,            page: "Features",                 gradient: "from-emerald-500 to-teal-500" },
  { name: "Processing Workflow",icon: Workflow,       page: "ProcessingWorkflow",       gradient: "from-indigo-500 to-purple-500" },
  // Admin-only
  { name: "Pipeline",           icon: Workflow,       page: "Pipeline",                 gradient: "from-orange-500 to-red-500",    permKey: "canViewPipeline" },
  { name: "System Design",      icon: Layers,         page: "SystemDesign",             gradient: "from-indigo-500 to-purple-500", permKey: "canViewSystemDesign" },
  { name: "Config",             icon: Settings,       page: "DocumentTypeConfiguration",gradient: "from-slate-500 to-gray-500",    permKey: "canViewDocumentTypeConfig" },
  { name: "External Sources",   icon: Settings,       page: "ExternalSources",          gradient: "from-teal-500 to-emerald-500",  permKey: "canViewExternalSources" },
];

export default function Layout({ children, currentPageName }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  const permissions = getPermissions(user);

  return (
    <div className="flex h-screen overflow-hidden relative">
      <ParticleBackground />
      <div className="scan-line"></div>
      
      {/* Futuristic Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ 
          width: collapsed ? "80px" : "280px",
          x: 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative glass-dark border-r border-slate-700/30 flex flex-col shrink-0"
      >
        {/* Logo with Neon Effect */}
        <div className="h-20 flex items-center justify-center px-5 border-b border-slate-700/30">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-500 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-2xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-black text-gray-100 tracking-wider">DocIntel</h1>
                <p className="text-[10px] text-blue-300 font-semibold tracking-widest uppercase">AI Engine</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
            {navItems.map((item, index) => {
              // Hide items the user doesn't have permission to see
              if (item.permKey && !permissions[item.permKey]) return null;

              const isActive = currentPageName === item.page;
              return (
              <motion.div
                key={item.page}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={createPageUrl(item.page)}
                  className="group relative block"
                >
                  <div className={`
                    relative flex items-center gap-3 px-4 py-3.5 rounded-xl
                    transition-all duration-300 overflow-hidden
                    ${isActive 
                      ? 'glass-ultra neon-blue text-white shadow-lg shadow-purple-500/20' 
                      : 'text-gray-300 hover:text-white hover:glass-strong hover:shadow-lg hover:shadow-indigo-500/10'
                    }
                  `}>
                    {/* Active indicator gradient */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className={`absolute inset-0 bg-gradient-to-r from-blue-600/20 to-violet-600/20 rounded-xl`}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    {/* Icon with gradient on active */}
                    <div className={`relative z-10 ${isActive ? `bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent` : ''}`}>
                      <item.icon className={`w-5 h-5 ${!isActive ? 'group-hover:scale-110 transition-transform' : ''}`} />
                    </div>
                    
                    {!collapsed && (
                      <span className={`relative z-10 font-semibold text-sm ${isActive ? 'text-white' : ''}`}>
                        {item.name}
                      </span>
                    )}

                    {/* Hover glow effect */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-[-100%] group-hover:translate-x-[100%] transform" 
                        style={{ transition: 'transform 0.6s ease, opacity 0.3s ease' }}
                      />
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Onboarding Progress */}
        {user && !collapsed && (
          <div className="px-3 pb-2">
            <OnboardingProgressWidget user={user} />
          </div>
        )}

        {/* Theme & Settings */}
        <div className="p-4 border-t border-slate-700/30 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <ThemeToggle />
            <NotificationCenter />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCollapsed(!collapsed)}
            className="w-full py-3 glass-ultra rounded-xl text-gray-100 hover:bg-slate-700/60 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center gap-2"
            >
              <Settings className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-semibold">Toggle Menu</span>}
            </motion.div>
          </motion.button>
        </div>

        {/* Decorative bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-600/10 to-transparent pointer-events-none" />
      </motion.aside>

      {/* Main content with enhanced styling */}
      <main className="flex-1 overflow-auto relative">
        <div className="absolute inset-0 holographic opacity-30"></div>
        <div className="relative z-10">
          {children}
        </div>
      </main>

      {/* Onboarding Tour - Global */}
      {user && <OnboardingTour user={user} currentPageName={currentPageName} />}
    </div>
  );
}