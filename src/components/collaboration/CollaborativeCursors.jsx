import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

export default function CollaborativeCursors({ documentId, containerRef }) {
  const queryClient = useQueryClient();
  const [presenceId, setPresenceId] = useState(null);
  const throttleRef = useRef(null);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me()
  });

  const { data: allPresence = [] } = useQuery({
    queryKey: ["presence", documentId],
    queryFn: async () => {
      const cutoff = new Date(Date.now() - 15000).toISOString(); // 15s timeout
      const all = await base44.entities.DocumentPresence.filter({ document_id: documentId });
      return all.filter(p => p.last_seen > cutoff && p.is_active);
    },
    refetchInterval: 5000
  });

  // Subscribe to real-time presence updates
  useEffect(() => {
    const unsub = base44.entities.DocumentPresence.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ["presence", documentId] });
    });
    return unsub;
  }, [documentId, queryClient]);

  // Register or refresh presence
  useEffect(() => {
    if (!currentUser) return;

    const color = getColorForUser(currentUser.email);

    const register = async () => {
      // Check if presence record exists
      const existing = await base44.entities.DocumentPresence.filter({
        document_id: documentId,
        user_email: currentUser.email
      });

      if (existing.length > 0) {
        setPresenceId(existing[0].id);
        await base44.entities.DocumentPresence.update(existing[0].id, {
          last_seen: new Date().toISOString(),
          is_active: true,
          color
        });
      } else {
        const created = await base44.entities.DocumentPresence.create({
          document_id: documentId,
          user_email: currentUser.email,
          user_name: currentUser.full_name || currentUser.email.split("@")[0],
          color,
          cursor_x: 50,
          cursor_y: 50,
          last_seen: new Date().toISOString(),
          is_active: true
        });
        setPresenceId(created.id);
      }
    };
    register();

    // Heartbeat every 10s
    const heartbeat = setInterval(async () => {
      if (presenceId) {
        await base44.entities.DocumentPresence.update(presenceId, {
          last_seen: new Date().toISOString()
        });
      }
    }, 10000);

    // Cleanup on unmount
    return () => {
      clearInterval(heartbeat);
      if (presenceId) {
        base44.entities.DocumentPresence.update(presenceId, { is_active: false });
      }
    };
  }, [currentUser, documentId]);

  // Track mouse movement over the container
  const handleMouseMove = useCallback((e) => {
    if (!presenceId || !containerRef?.current) return;
    if (throttleRef.current) return;

    throttleRef.current = setTimeout(() => {
      throttleRef.current = null;
    }, 80); // throttle to ~12fps

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (x < 0 || x > 100 || y < 0 || y > 100) return;

    base44.entities.DocumentPresence.update(presenceId, {
      cursor_x: Math.round(x * 10) / 10,
      cursor_y: Math.round(y * 10) / 10,
      last_seen: new Date().toISOString()
    });
  }, [presenceId, containerRef]);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMouseMove);
    return () => el.removeEventListener("mousemove", handleMouseMove);
  }, [containerRef, handleMouseMove]);

  // Render other users' cursors (not current user)
  const otherUsers = allPresence.filter(p => p.user_email !== currentUser?.email);

  return (
    <AnimatePresence>
      {otherUsers.map((presence) => (
        <motion.div
          key={presence.user_email}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute pointer-events-none z-50"
          style={{
            left: `${presence.cursor_x ?? 50}%`,
            top: `${presence.cursor_y ?? 50}%`,
            transform: "translate(-4px, -4px)"
          }}
        >
          {/* Cursor SVG */}
          <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
            <path
              d="M2 2L18 10L10 12L8 20L2 2Z"
              fill={presence.color || "#3b82f6"}
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>
          {/* Name tag */}
          <div
            className="absolute top-5 left-3 px-2 py-0.5 rounded-md text-white text-[11px] font-semibold whitespace-nowrap shadow-lg"
            style={{ backgroundColor: presence.color || "#3b82f6" }}
          >
            {presence.user_name || presence.user_email.split("@")[0]}
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}