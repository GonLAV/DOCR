import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Tag, 
  Sparkles, 
  Plus, 
  X, 
  Check, 
  Loader2,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function TagManager({ document }) {
  const queryClient = useQueryClient();
  const [customTag, setCustomTag] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const confirmedTags = document.tags || [];
  const suggestedTags = document.suggested_tags || [];

  const generateTagsMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const response = await base44.functions.invoke('generateAutoTags', {
        document_id: document.id
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", document.id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("AI tags generated successfully");
      setIsGenerating(false);
    },
    onError: () => {
      toast.error("Failed to generate tags");
      setIsGenerating(false);
    }
  });

  const acceptTagMutation = useMutation({
    mutationFn: async (tagObj) => {
      const newTags = [...confirmedTags, tagObj.tag];
      const remainingSuggested = suggestedTags.filter(t => t.tag !== tagObj.tag);
      
      await base44.entities.Document.update(document.id, {
        tags: newTags,
        suggested_tags: remainingSuggested
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", document.id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    }
  });

  const rejectTagMutation = useMutation({
    mutationFn: async (tagObj) => {
      const remainingSuggested = suggestedTags.filter(t => t.tag !== tagObj.tag);
      await base44.entities.Document.update(document.id, {
        suggested_tags: remainingSuggested
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", document.id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    }
  });

  const addCustomTagMutation = useMutation({
    mutationFn: async (tag) => {
      const newTags = [...confirmedTags, tag];
      await base44.entities.Document.update(document.id, {
        tags: newTags
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", document.id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setCustomTag("");
    }
  });

  const removeTagMutation = useMutation({
    mutationFn: async (tag) => {
      const newTags = confirmedTags.filter(t => t !== tag);
      await base44.entities.Document.update(document.id, {
        tags: newTags
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", document.id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    }
  });

  const handleAddCustomTag = () => {
    if (customTag.trim() && !confirmedTags.includes(customTag.trim())) {
      addCustomTagMutation.mutate(customTag.trim().toLowerCase());
    }
  };

  return (
    <Card className="glass-strong border border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-purple-400" />
            Tags
          </div>
          <Button
            size="sm"
            onClick={() => generateTagsMutation.mutate()}
            disabled={isGenerating || document.status !== "completed"}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Generate
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Suggested Tags */}
        {suggestedTags.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-white">AI Suggestions</span>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {suggestedTags.map((tagObj, i) => (
                  <motion.div
                    key={tagObj.tag}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass rounded-xl p-3 border border-cyan-500/20"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-cyan-500 text-white text-xs">
                            {tagObj.tag}
                          </Badge>
                          <span className="text-[10px] text-gray-400">
                            {tagObj.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {tagObj.reason}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => acceptTagMutation.mutate(tagObj)}
                          className="h-7 w-7 p-0 hover:bg-emerald-500/20"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => rejectTagMutation.mutate(tagObj)}
                          className="h-7 w-7 p-0 hover:bg-rose-500/20"
                        >
                          <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Confirmed Tags */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">Active Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {confirmedTags.map((tag) => (
                <motion.div
                  key={tag}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white pl-3 pr-1 py-1.5 gap-2">
                    {tag}
                    <button
                      onClick={() => removeTagMutation.mutate(tag)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
            {confirmedTags.length === 0 && (
              <p className="text-xs text-gray-500 italic">No tags yet</p>
            )}
          </div>
        </div>

        {/* Add Custom Tag */}
        <div>
          <div className="text-xs text-gray-400 mb-2">Add Custom Tag</div>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., urgent, q1-2024..."
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag()}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
            <Button
              onClick={handleAddCustomTag}
              disabled={!customTag.trim()}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}