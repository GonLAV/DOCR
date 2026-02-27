import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Users, Eye, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CURSOR_COLORS = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#10b981",
  "#f59e0b", "#ef4444", "#06b6d4", "#84cc16"
];

function getColorForUser(email) {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

export default function ActiveUsers({ document }) {
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me()
  });

  const { data: activePresence = [] } = useQuery({
    queryKey: ["presence", document.id],
    queryFn: async () => {
      const cutoff = new Date(Date.now() - 15000).toISOString();
      const all = await base44.entities.DocumentPresence.filter({ document_id: document.id });
      return all.filter(p => p.last_seen > cutoff && p.is_active);
    },
    refetchInterval: 5000
  });

  // Real-time subscription
  useEffect(() => {
    const unsub = base44.entities.DocumentPresence.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ["presence", document.id] });
    });
    return unsub;
  }, [document.id, queryClient]);

  // Count including current user
  const totalCount = activePresence.length;

  if (totalCount === 0 && !currentUser) return null;

  const allUsers = currentUser
    ? [
        // Put current user first if not in presence list
        ...(activePresence.find(p => p.user_email === currentUser.email) ? [] : [{
          user_email: currentUser.email,
          user_name: currentUser.full_name || currentUser.email.split("@")[0],
          color: getColorForUser(currentUser.email),
          isCurrentUser: true
        }]),
        ...activePresence.map(p => ({
          ...p,
          isCurrentUser: p.user_email === currentUser.email
        }))
      ]
    : activePresence;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-xl p-3 border border-emerald-500/30"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Users className="w-4 h-4 text-emerald-400" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <span className="text-sm font-semibold text-gray-100">
            {allUsers.length} Collaborator{allUsers.length !== 1 ? "s" : ""} Active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">
            <Wifi className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <AnimatePresence>
          {allUsers.map((user, index) => {
            const color = user.color || getColorForUser(user.user_email);
            const initials = (user.user_name || user.user_email)?.[0]?.toUpperCase() || "?";
            return (
              <motion.div
                key={user.user_email}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-white/20 hover:ring-white/50 transition-all cursor-pointer"
                  style={{ backgroundColor: color }}
                >
                  <span className="text-white text-xs font-bold">{initials}</span>
                </div>
                {user.isCurrentUser && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-white/50" />
                )}
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {user.user_name || user.user_email.split("@")[0]}
                  {user.isCurrentUser && " (you)"}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}