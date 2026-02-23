import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Users, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ActiveUsers({ document }) {
  const [activeUsers, setActiveUsers] = useState([]);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me()
  });

  // Simulate active presence tracking through recent activity
  const { data: recentComments = [] } = useQuery({
    queryKey: ["recent-comments", document.id],
    queryFn: async () => {
      const comments = await base44.entities.DocumentComment.filter({ 
        document_id: document.id 
      }, "-created_date", 10);
      return comments;
    },
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const { data: recentAnnotations = [] } = useQuery({
    queryKey: ["recent-annotations", document.id],
    queryFn: async () => {
      const annotations = await base44.entities.DocumentAnnotation.filter({ 
        document_id: document.id 
      }, "-created_date", 10);
      return annotations;
    },
    refetchInterval: 5000
  });

  useEffect(() => {
    // Combine recent activity to detect active users (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const users = new Map();
    
    [...recentComments, ...recentAnnotations].forEach(item => {
      const createdDate = new Date(item.created_date);
      if (createdDate > fiveMinutesAgo && item.user_email) {
        if (!users.has(item.user_email)) {
          users.set(item.user_email, {
            email: item.user_email,
            name: item.user_name || item.user_email.split("@")[0],
            lastActivity: createdDate
          });
        } else {
          const existing = users.get(item.user_email);
          if (createdDate > existing.lastActivity) {
            existing.lastActivity = createdDate;
          }
        }
      }
    });

    setActiveUsers(Array.from(users.values()));
  }, [recentComments, recentAnnotations]);

  if (activeUsers.length === 0) {
    return null;
  }

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
            {activeUsers.length} Active Now
          </span>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">
          <Eye className="w-3 h-3 mr-1" />
          Live
        </Badge>
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <AnimatePresence>
          {activeUsers.map((user, index) => (
            <motion.div
              key={user.email}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
              className="group relative"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center ring-2 ring-emerald-400/30 hover:ring-emerald-400/60 transition-all cursor-pointer">
                <span className="text-white text-xs font-bold">
                  {user.name[0]?.toUpperCase()}
                </span>
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {user.name}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {currentUser && !activeUsers.find(u => u.email === currentUser.email) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center ring-2 ring-blue-400/30"
          >
            <span className="text-white text-xs font-bold">
              {currentUser.full_name?.[0]?.toUpperCase() || "Y"}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}