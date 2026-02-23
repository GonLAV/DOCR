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
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard", gradient: "from-blue-500 to-cyan-500" },
  { name: "Vision", icon: Sparkles, page: "Vision", gradient: "from-purple-500 to-pink-500" },
  { name: "System Design", icon: Layers, page: "SystemDesign", gradient: "from-indigo-500 to-purple-500" },
  { name: "Features", icon: Zap, page: "Features", gradient: "from-emerald-500 to-teal-500" },
  { name: "Pipeline", icon: Workflow, page: "Pipeline", gradient: "from-orange-500 to-red-500" },
  { name: "Upload", icon: Upload, page: "Upload", gradient: "from-pink-500 to-rose-500" },
  { name: "Documents", icon: FileSearch, page: "Documents", gradient: "from-violet-500 to-purple-500" },
  { name: "Batch Processing", icon: Settings, page: "BatchProcessing", gradient: "from-fuchsia-500 to-purple-500" },
  { name: "Compare", icon: GitCompare, page: "Compare", gradient: "from-cyan-500 to-blue-500" },
  { name: "Config", icon: Settings, page: "DocumentTypeConfiguration", gradient: "from-slate-500 to-gray-500", adminOnly: true },
];

export default function Layout({ children, currentPageName }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Futuristic Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ 
          width: collapsed ? "80px" : "280px",
          x: 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative glass-dark border-r border-white/10 flex flex-col shrink-0"
      >
        {/* Logo with Neon Effect */}
        <div className="h-20 flex items-center justify-center px-5 border-b border-white/10">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-black text-white tracking-wider">DocIntel</h1>
                <p className="text-[10px] text-cyan-300 font-semibold tracking-widest uppercase">AI Engine</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
            {navItems.map((item, index) => {
              // Hide admin-only items for non-admin users
              if (item.adminOnly && user?.role !== 'admin') return null;

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
                    relative flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-300 overflow-hidden
                    ${isActive 
                      ? 'glass-strong neon-blue text-white' 
                      : 'text-gray-300 hover:text-white hover:glass'
                    }
                  `}>
                    {/* Active indicator gradient */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-20 rounded-xl`}
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

        {/* Collapse toggle */}
        <div className="p-4 border-t border-white/10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCollapsed(!collapsed)}
            className="w-full py-2 glass-strong rounded-xl text-white hover:neon-blue transition-all duration-300"
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Settings className="w-5 h-5 mx-auto" />
            </motion.div>
          </motion.button>
        </div>

        {/* Decorative bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-600/20 to-transparent pointer-events-none" />
      </motion.aside>

      {/* Main content with glass overlay */}
      <main className="flex-1 overflow-auto relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}