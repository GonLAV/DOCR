import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function TextDiffPanel({ textDiff }) {
  if (!textDiff) return null;

  return (
    <Card className="glass-strong border border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          Text Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="glass rounded-xl p-4 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Text Similarity</span>
            <span className="text-2xl font-bold text-white">
              {textDiff.similarity_percentage}%
            </span>
          </div>
          <Progress value={textDiff.similarity_percentage} className="h-2 bg-white/10" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="glass rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">Added</div>
            <div className="text-xl font-bold text-emerald-400">
              +{textDiff.added_lines || 0}
            </div>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">Modified</div>
            <div className="text-xl font-bold text-amber-400">
              ~{textDiff.modified_lines || 0}
            </div>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">Removed</div>
            <div className="text-xl font-bold text-rose-400">
              -{textDiff.removed_lines || 0}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}