import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Check, User, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function CommentThread({ document }) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", document.id],
    queryFn: async () => {
      const allComments = await base44.entities.DocumentComment.filter({ 
        document_id: document.id 
      }, "-created_date");
      return allComments;
    }
  });

  // Real-time subscription for comments
  React.useEffect(() => {
    const unsubscribe = base44.entities.DocumentComment.subscribe((event) => {
      if (event.data?.document_id === document.id) {
        queryClient.invalidateQueries({ queryKey: ["comments", document.id] });
      }
    });
    return unsubscribe;
  }, [document.id, queryClient]);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me()
  });

  const addCommentMutation = useMutation({
    mutationFn: async (commentData) => {
      await base44.entities.DocumentComment.create({
        document_id: document.id,
        user_email: currentUser?.email,
        user_name: currentUser?.full_name || "Anonymous",
        ...commentData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", document.id] });
      setNewComment("");
      setReplyTo(null);
    }
  });

  const resolveCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      await base44.entities.DocumentComment.update(commentId, {
        status: "resolved",
        resolved_by: currentUser?.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", document.id] });
    }
  });

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    
    addCommentMutation.mutate({
      comment_text: newComment,
      parent_comment_id: replyTo?.id || null,
      status: "open"
    });
  };

  const topLevelComments = comments.filter(c => !c.parent_comment_id);
  const getReplies = (commentId) => comments.filter(c => c.parent_comment_id === commentId);

  return (
    <Card className="glass-strong border border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          Comments & Discussion
          <Badge className="bg-blue-500 text-white ml-auto">
            {comments.filter(c => c.status === "open").length} Open
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment Input */}
        <div className="glass rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              {replyTo && (
                <div className="text-xs text-gray-400 mb-2">
                  Replying to <span className="text-white">{replyTo.user_name}</span>
                  <button 
                    onClick={() => setReplyTo(null)}
                    className="ml-2 text-blue-400 hover:text-blue-300"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <Textarea
                placeholder="Add a comment or question..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[80px]"
              />
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Comment List */}
        <div className="space-y-3">
          <AnimatePresence>
            {topLevelComments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className={`glass rounded-xl p-4 border ${
                  comment.status === "resolved" 
                    ? "border-emerald-500/20 opacity-60" 
                    : "border-white/20"
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">
                        {comment.user_name?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white">
                          {comment.user_name || "Anonymous"}
                        </span>
                        <span className="text-xs text-gray-400">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {format(new Date(comment.created_date), "MMM d, h:mm a")}
                        </span>
                        {comment.status === "resolved" && (
                          <Badge className="bg-emerald-500 text-white text-[10px]">
                            <Check className="w-3 h-3 mr-1" />
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed mb-2">
                        {comment.comment_text}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setReplyTo(comment)}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Reply
                        </button>
                        {comment.status === "open" && comment.user_email === currentUser?.email && (
                          <button
                            onClick={() => resolveCommentMutation.mutate(comment.id)}
                            className="text-xs text-emerald-400 hover:text-emerald-300"
                          >
                            Resolve
                          </button>
                        )}
                      </div>

                      {/* Replies */}
                      {getReplies(comment.id).length > 0 && (
                        <div className="mt-3 ml-4 pl-4 border-l border-white/10 space-y-2">
                          {getReplies(comment.id).map((reply) => (
                            <div key={reply.id} className="glass rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-white">
                                  {reply.user_name}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {format(new Date(reply.created_date), "MMM d, h:mm a")}
                                </span>
                              </div>
                              <p className="text-xs text-gray-300">{reply.comment_text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {comments.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-500 opacity-50" />
              <p className="text-sm text-gray-400">No comments yet. Start the discussion!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}