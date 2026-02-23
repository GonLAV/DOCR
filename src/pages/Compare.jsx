import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitCompare, CheckCircle2, AlertTriangle, Loader2, ArrowRight, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VisualComparisonPanel from "@/components/compare/VisualComparisonPanel";
import TextDiffPanel from "@/components/compare/TextDiffPanel";
import SemanticDiffPanel from "@/components/compare/SemanticDiffPanel";
import ForensicPanel from "@/components/compare/ForensicPanel";

export default function Compare() {
  const queryClient = useQueryClient();
  const [docA, setDocA] = useState("");
  const [docB, setDocB] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState(null);
  const [comparisonMode, setComparisonMode] = useState("standard"); // "standard" or "forensic"
  const [activeTab, setActiveTab] = useState("visual");

  const { data: documents = [] } = useQuery({
    queryKey: ["documents"],
    queryFn: () => base44.entities.Document.list("-created_date", 100),
  });

  const completedDocs = documents.filter(d => d.status === "completed");

  const handleCompare = async () => {
    if (!docA || !docB) return;
    setIsComparing(true);

    const a = documents.find(d => d.id === docA);
    const b = documents.find(d => d.id === docB);

    // Call enhanced comparison function
    const response = await base44.functions.invoke('compareDocuments', {
      document_a_id: docA,
      document_b_id: docB,
      comparison_mode: comparisonMode
    });

    const comparisonData = response.data.comparison;

    // Create comparison record
    const comparison = await base44.entities.DocumentComparison.create({
      title: `${a.title} vs ${b.title}`,
      document_ids: [docA, docB],
      status: "completed",
      matches: comparisonData.entity_comparison?.filter(e => e.match).map(e => ({
        field: e.field,
        values: [e.value_a, e.value_b],
        match_type: "exact",
        confidence: e.confidence
      })) || [],
      discrepancies: comparisonData.entity_comparison?.filter(e => !e.match).map(e => ({
        field: e.field,
        values: [e.value_a, e.value_b],
        severity: "medium",
        explanation: "Value mismatch detected"
      })) || [],
      summary: comparisonData.summary,
      verification_score: comparisonData.verification_score,
    });

    setResult({ 
      ...comparison, 
      ...comparisonData,
      docA: a,
      docB: b
    });
    setIsComparing(false);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1000px] mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cross-Document Verification</h1>
        <p className="text-sm text-slate-500 mt-1">Compare and verify data across multiple documents</p>
      </div>

      {/* Selection */}
      <Card className="glass-strong border border-white/20">
        <CardContent className="p-6 space-y-4">
          {/* Comparison Mode Toggle */}
          <div>
            <label className="text-xs font-medium text-gray-400 mb-2 block">Comparison Mode</label>
            <div className="flex gap-2">
              <Button
                variant={comparisonMode === "standard" ? "default" : "outline"}
                onClick={() => setComparisonMode("standard")}
                className={comparisonMode === "standard" 
                  ? "bg-blue-500 hover:bg-blue-600 text-white" 
                  : "glass text-gray-300 hover:glass-strong"}
              >
                Standard Comparison
              </Button>
              <Button
                variant={comparisonMode === "forensic" ? "default" : "outline"}
                onClick={() => setComparisonMode("forensic")}
                className={comparisonMode === "forensic" 
                  ? "bg-cyan-500 hover:bg-cyan-600 text-white" 
                  : "glass text-gray-300 hover:glass-strong"}
              >
                <Shield className="w-4 h-4 mr-2" />
                Forensic Mode
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Document A</label>
              <Select value={docA} onValueChange={setDocA}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document..." />
                </SelectTrigger>
                <SelectContent>
                  {completedDocs.map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>{doc.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <GitCompare className="w-5 h-5 text-slate-300 mt-5 shrink-0" />
            <div className="flex-1 w-full">
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Document B</label>
              <Select value={docB} onValueChange={setDocB}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document..." />
                </SelectTrigger>
                <SelectContent>
                  {completedDocs.filter(d => d.id !== docA).map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>{doc.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-5">
              <Button
                onClick={handleCompare}
                disabled={!docA || !docB || isComparing}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                {isComparing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Compare
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Score */}
          <Card className="glass-strong border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  result.verification_score >= 80 ? "bg-emerald-100" :
                  result.verification_score >= 50 ? "bg-amber-100" : "bg-rose-100"
                }`}>
                  <span className={`text-2xl font-bold ${
                    result.verification_score >= 80 ? "text-emerald-700" :
                    result.verification_score >= 50 ? "text-amber-700" : "text-rose-700"
                  }`}>
                    {result.verification_score}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Verification Score</p>
                  <p className="text-xs text-gray-300 mt-1 max-w-md">{result.summary}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Comparison Views */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-white/10 mb-4">
              <TabsTrigger value="visual" className="flex-1 text-xs">Visual</TabsTrigger>
              <TabsTrigger value="text" className="flex-1 text-xs">Text</TabsTrigger>
              <TabsTrigger value="entities" className="flex-1 text-xs">Entities</TabsTrigger>
              <TabsTrigger value="semantic" className="flex-1 text-xs">Semantic</TabsTrigger>
              {comparisonMode === "forensic" && (
                <TabsTrigger value="forensic" className="flex-1 text-xs">Forensic</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="visual">
              <VisualComparisonPanel docA={result.docA} docB={result.docB} />
            </TabsContent>

            <TabsContent value="text">
              <TextDiffPanel textDiff={result.text_diff} />
            </TabsContent>

            <TabsContent value="entities" className="space-y-4">
              {/* Entity Comparison with Semantic Similarity */}
              {result.entity_comparison && result.entity_comparison.length > 0 && (
                <Card className="glass-strong border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Entity Comparison with AI Semantic Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.entity_comparison.map((entity, i) => (
                      <div key={i} className={`p-3 rounded-xl ${
                        entity.match ? 'glass border border-emerald-500/20' : 'glass border border-amber-500/20'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-bold text-white">{entity.field}</span>
                          <div className="flex gap-2">
                            {entity.semantic_similarity != null && (
                              <Badge className={`text-[10px] ${
                                entity.semantic_similarity >= 80 ? 'bg-purple-500' :
                                entity.semantic_similarity >= 50 ? 'bg-blue-500' :
                                'bg-gray-500'
                              } text-white`}>
                                Semantic: {entity.semantic_similarity}%
                              </Badge>
                            )}
                            <Badge className={`text-[10px] ${
                              entity.match ? 'bg-emerald-500' : 'bg-amber-500'
                            } text-white`}>
                              {entity.match ? 'Match' : 'Different'} ({entity.confidence}%)
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div className="text-xs">
                            <div className="text-gray-400 mb-1">Doc A</div>
                            <div className="text-white">{entity.value_a}</div>
                          </div>
                          <div className="text-xs">
                            <div className="text-gray-400 mb-1">Doc B</div>
                            <div className="text-white">{entity.value_b}</div>
                          </div>
                        </div>
                        {entity.semantic_explanation && (
                          <div className="pt-2 border-t border-white/10">
                            <p className="text-xs text-purple-300 italic">{entity.semantic_explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="semantic">
              <SemanticDiffPanel 
                semanticDifferences={result.semantic_differences}
                textSnippetsSimilarity={result.text_snippets_similarity}
                externalVerification={result.external_verification}
              />
            </TabsContent>

            {comparisonMode === "forensic" && (
              <TabsContent value="forensic">
                <ForensicPanel forensicAnalysis={result.forensic_analysis} />
              </TabsContent>
            )}
          </Tabs>

          {/* Legacy Matches (Hidden by default, kept for compatibility) */}
          {false && result.matches && result.matches.length > 0 && (
            <Card className="glass-strong border border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Matching Fields ({result.matches.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.matches.map((match, i) => (
                  <div key={i} className="p-3 bg-emerald-50/50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-600">{match.field}</p>
                      <p className="text-sm text-slate-800 mt-0.5">{match.value_a || match.values?.[0]}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                      {Math.round(match.confidence)}% match
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Legacy Discrepancies (Hidden by default, kept for compatibility) */}
          {false && result.discrepancies && result.discrepancies.length > 0 && (
            <Card className="glass-strong border border-rose-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Discrepancies ({result.discrepancies.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.discrepancies.map((disc, i) => (
                  <div key={i} className="p-3 bg-rose-50/50 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-600">{disc.field}</span>
                      <Badge className={`text-[10px] ${
                        disc.severity === "high" ? "bg-rose-100 text-rose-700" :
                        disc.severity === "medium" ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {disc.severity}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 bg-white rounded-md">
                        <p className="text-[10px] text-slate-400">Doc A</p>
                        <p className="text-xs text-slate-700">{disc.value_a || disc.values?.[0]}</p>
                      </div>
                      <div className="p-2 bg-white rounded-md">
                        <p className="text-[10px] text-slate-400">Doc B</p>
                        <p className="text-xs text-slate-700">{disc.value_b || disc.values?.[1]}</p>
                      </div>
                    </div>
                    {disc.explanation && (
                      <p className="text-[11px] text-slate-500">{disc.explanation}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}