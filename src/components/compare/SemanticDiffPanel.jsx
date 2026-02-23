import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function SemanticDiffPanel({ semanticDifferences }) {
  if (!semanticDifferences || semanticDifferences.length === 0) {
    return (
      <Card className="glass-strong border border-white/20">
        <CardContent className="p-6 text-center">
          <Brain className="w-12 h-12 mx-auto mb-2 text-emerald-500 opacity-50" />
          <p className="text-sm text-gray-400">No semantic differences detected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-strong border border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Semantic Differences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {semanticDifferences.map((diff, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-4 border border-purple-500/20"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-bold text-white capitalize">{diff.category}</span>
              <Badge className={`text-[10px] ${
                diff.severity === "high" ? "bg-rose-500" :
                diff.severity === "medium" ? "bg-amber-500" :
                "bg-blue-500"
              } text-white`}>
                {diff.severity}
              </Badge>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{diff.description}</p>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}