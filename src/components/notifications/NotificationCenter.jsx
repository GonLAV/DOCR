import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, X, FileText, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

export default function NotificationCenter() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const { data: documents = [] } = useQuery({
    queryKey: ["documents"],
    queryFn: () => base44.entities.Document.list(),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["all-comments"],
    queryFn: () => base44.entities.DocumentComment.list("-created_date", 20),
  });

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me()
  });

  // Subscribe to document changes
  useEffect(() => {
    const unsubscribe = base44.entities.Document.subscribe((event) => {
      if (event.type === "update" && event.data?.status === "completed") {
        toast.success("Document Processing Complete", {
          description: `${event.data.title} is ready for review`,
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />
        });
        
        setNotifications(prev => [{
          id: Date.now(),
          type: "document_completed",
          title: "Document Ready",
          message: `${event.data.title} has been processed`,
          timestamp: new Date(),
          read: false,
          data: event.data
        }, ...prev]);
      } else if (event.type === "update" && event.data?.status === "failed") {
        toast.error("Document Processing Failed", {
          description: `${event.data.title} encountered an error`,
          icon: <AlertCircle className="w-5 h-5 text-rose-500" />
        });
      }
    });

    return unsubscribe;
  }, []);

  // Subscribe to new comments
  useEffect(() => {
    const unsubscribe = base44.entities.DocumentComment.subscribe((event) => {
      if (event.type === "create" && event.data?.user_email !== currentUser?.email) {
        toast.info("New Comment", {
          description: `${event.data.user_name} commented on a document`,
          icon: <MessageSquare className="w-5 h-5 text-blue-500" />
        });

        setNotifications(prev => [{
          id: Date.now(),
          type: "new_comment",
          title: "New Comment",
          message: `${event.data.user_name}: ${event.data.comment_text?.substring(0, 50)}...`,
          timestamp: new Date(),
          read: false,
          data: event.data
        }, ...prev]);
      }
    });

    return unsubscribe;
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "document_completed":
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case "new_comment":
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-100 hover:bg-slate-700/50"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-rose-500 to-red-600 rounded-full flex items-center justify-center"
          >
            <span className="text-white text-[10px] font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </motion.div>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-96 max-h-[500px] overflow-hidden glass-ultra rounded-2xl border border-slate-700/30 shadow-2xl z-50"
            >
              <div className="p-4 border-b border-slate-700/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-100">Notifications</h3>
                  <p className="text-xs text-gray-400">{unreadCount} unread</p>
                </div>
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={markAllAsRead}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Mark all read
                  </Button>
                )}
              </div>

              <div className="overflow-y-auto max-h-[400px]">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-slate-700/30">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-slate-700/30 transition-colors ${
                          !notification.read ? "bg-blue-500/5" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-semibold text-gray-100">
                                {notification.title}
                              </h4>
                              <button
                                onClick={() => clearNotification(notification.id)}
                                className="text-gray-500 hover:text-gray-300 shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {format(notification.timestamp, "MMM d, h:mm a")}
                              </span>
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs text-blue-400 hover:text-blue-300"
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 mx-auto mb-2 text-gray-500 opacity-50" />
                    <p className="text-sm text-gray-400">No notifications yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}