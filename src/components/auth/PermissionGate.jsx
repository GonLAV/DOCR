import React from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

/**
 * Wraps content that requires a specific permission.
 * If the user lacks the permission, renders a locked overlay or redirect.
 *
 * Props:
 *   allowed  – boolean from permissions object (e.g. permissions.canViewAnalytics)
 *   fallback – optional custom fallback JSX; defaults to a "locked" card
 *   children – the protected content
 */
export default function PermissionGate({ allowed, fallback, children }) {
  if (allowed) return children;

  if (fallback) return fallback;

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-strong rounded-3xl border border-violet-500/20 p-10 max-w-md w-full text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-500/30">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Access Restricted</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          You don't have permission to view this section. Upgrade your account or contact your administrator for access.
        </p>
        <Link to={createPageUrl("Upload")}>
          <Button variant="default" className="w-full">
            Back to Upload
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}