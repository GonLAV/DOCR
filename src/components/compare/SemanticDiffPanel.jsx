import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function SemanticDiffPanel({ semanticDifferences, textSnippetsSimilarity, externalVerification }) {
  const hasSemanticDiffs = semanticDifferences && semanticDifferences.length > 0;
  const hasSnippets = textSnippetsSimilarity && textSnippetsSimilarity.length > 0;
  const hasExternal = externalVerification && externalVerification.verifications && externalVerification.verifications.length > 0;

  if (!hasSemanticDiffs && !hasSnippets && !hasExternal) {
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
    <div className="space-y-4">
      {/* External Data Verification Results */}
      {hasExternal && (
        <Card className="glass-strong border border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              External Data Verification
              <Badge className="ml-2 bg-cyan-500 text-white">
                {externalVerification.overall_match_rate}% Match
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {externalVerification.verifications.map((verification, idx) => (
              <div key={idx} className="glass rounded-xl p-4 border border-cyan-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-cyan-300">{verification.source_name}</span>
                  <Badge variant="outline" className="text-xs text-gray-400">
                    {verification.response_time}ms
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {verification.verification_results?.map((result, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-3 rounded-lg ${
                        result.match 
                          ? 'bg-emerald-500/10 border border-emerald-500/30' 
                          : 'bg-amber-500/10 border border-amber-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-semibold text-white">{result.field}</span>
                        <Badge className={`text-[10px] ${
                          result.match ? 'bg-emerald-500' : 'bg-amber-500'
                        } text-white`}>
                          {result.severity}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <div className="text-[10px] text-gray-400 mb-1">Document Value</div>
                          <div className={`text-xs font-medium ${result.match ? 'text-emerald-300' : 'text-amber-300'}`}>
                            {result.document_value}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-400 mb-1">External Source</div>
                          <div className={`text-xs font-medium ${result.match ? 'text-emerald-300' : 'text-amber-300'}`}>
                            {result.external_value || 'N/A'}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-300 italic">{result.message}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Text Snippets Semantic Similarity */}
      {hasSnippets && (
        <Card className="glass-strong border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Text Snippet Semantic Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {textSnippetsSimilarity.map((snippet, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-4 border border-purple-500/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-purple-300">Similarity Score</span>
                  <Badge className={`${
                    snippet.similarity_score >= 80 ? 'bg-emerald-500' :
                    snippet.similarity_score >= 50 ? 'bg-amber-500' :
                    'bg-rose-500'
                  } text-white`}>
                    {snippet.similarity_score}%
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <div className="text-[10px] text-gray-400 mb-1">Document A</div>
                    <p className="text-xs text-gray-300 italic">"{snippet.snippet_a}"</p>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg">
                    <div className="text-[10px] text-gray-400 mb-1">Document B</div>
                    <p className="text-xs text-gray-300 italic">"{snippet.snippet_b}"</p>
                  </div>
                </div>
                
                <p className="text-xs text-purple-300 font-medium">
                  Relationship: {snippet.semantic_relationship}
                </p>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Semantic Differences */}
      {hasSemanticDiffs && (
        <Card className="glass-strong border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
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
                className="glass rounded-xl p-4 border border-amber-500/20"
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
      )}
    </div>
  );
}