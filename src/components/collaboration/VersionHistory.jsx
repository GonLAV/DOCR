import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, GitBranch, User, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function VersionHistory({ document }) {
  const queryClient = useQueryClient();
  const { data: versions = [] } = useQuery({
    queryKey: ["versions", document.id],
    queryFn: async () => {
      const allVersions = await base44.entities.DocumentVersion.filter({ 
        document_id: document.id 
      }, "-created_date");
      return allVersions;
    }
  });

  // Real-time subscription for version history
  React.useEffect(() => {
    const unsubscribe = base44.entities.DocumentVersion.subscribe((event) => {
      if (event.data?.document_id === document.id) {
        queryClient.invalidateQueries({ queryKey: ["versions", document.id] });
      }
    });
    return unsubscribe;
  }, [document.id, queryClient]);

  const changeTypeColors = {
    created: "bg-blue-500",
    metadata_updated: "bg-purple-500",
    reprocessed: "bg-amber-500",
    corrected: "bg-emerald-500",
    annotated: "bg-pink-500",
    reviewed: "bg-cyan-500"
  };

  const changeTypeIcons = {
    created: "🆕",
    metadata_updated: "📝",
    reprocessed: "🔄",
    corrected: "✏️",
    annotated: "🎨",
    reviewed: "👁️"
  };

  return (
    <Card className="glass-strong border border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-400" />
          Version History
          <Badge className="bg-cyan-500 text-white ml-auto">
            {versions.length} versions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {versions.length > 0 ? (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-transparent" />
            
            <div className="space-y-4">
              {versions.map((version, index) => (
                <motion.div
                  key={version.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-14"
                >
                  {/* Timeline Node */}
                  <div className="absolute left-4 top-4 w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 border-2 border-white/20 flex items-center justify-center">
                    <span className="text-[10px]">
                      {changeTypeIcons[version.change_type] || "📄"}
                    </span>
                  </div>

                  <div className="glass rounded-xl p-4 border border-white/20">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${changeTypeColors[version.change_type] || "bg-gray-500"} text-white text-[10px]`}>
                            v{version.version_number}
                          </Badge>
                          <span className="text-sm font-bold text-white capitalize">
                            {version.change_type.replace("_", " ")}
                          </span>
                        </div>
                        {version.change_description && (
                          <p className="text-xs text-gray-300 leading-relaxed">
                            {version.change_description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{version.changed_by?.split("@")[0] || "System"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(version.created_date), "MMM d, h:mm a")}</span>
                      </div>
                    </div>

                    {/* Diff Summary */}
                    {version.diff_summary && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="flex flex-wrap gap-2 text-xs">
                          {version.diff_summary.fields_changed?.length > 0 && (
                            <Badge className="bg-purple-500/20 text-purple-300">
                              {version.diff_summary.fields_changed.length} fields changed
                            </Badge>
                          )}
                          {version.diff_summary.annotations_added > 0 && (
                            <Badge className="bg-pink-500/20 text-pink-300">
                              {version.diff_summary.annotations_added} annotations
                            </Badge>
                          )}
                          {version.diff_summary.comments_added > 0 && (
                            <Badge className="bg-blue-500/20 text-blue-300">
                              {version.diff_summary.comments_added} comments
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <GitBranch className="w-12 h-12 mx-auto mb-2 text-gray-500 opacity-50" />
            <p className="text-sm text-gray-400">No version history yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}