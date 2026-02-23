import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitCompare, CheckCircle2, AlertTriangle, Loader2, ArrowRight } from "lucide-react";

export default function Compare() {
  const queryClient = useQueryClient();
  const [docA, setDocA] = useState("");
  const [docB, setDocB] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState(null);

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

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Compare these two documents and find:
1. Matching fields and values
2. Discrepancies and contradictions
3. Missing information in either document
4. Overall verification score

Document A: "${a.title}"
Extracted data: ${JSON.stringify(a.structured_data)}

Document B: "${b.title}"
Extracted data: ${JSON.stringify(b.structured_data)}

Provide a detailed cross-document analysis.`,
      response_json_schema: {
        type: "object",
        properties: {
          matches: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                value_a: { type: "string" },
                value_b: { type: "string" },
                match_type: { type: "string" },
                confidence: { type: "number" }
              }
            }
          },
          discrepancies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                value_a: { type: "string" },
                value_b: { type: "string" },
                severity: { type: "string" },
                explanation: { type: "string" }
              }
            }
          },
          summary: { type: "string" },
          verification_score: { type: "number" }
        }
      }
    });

    const comparison = await base44.entities.DocumentComparison.create({
      title: `${a.title} vs ${b.title}`,
      document_ids: [docA, docB],
      status: "completed",
      matches: analysis.matches?.map(m => ({
        field: m.field,
        values: [m.value_a, m.value_b],
        match_type: m.match_type,
        confidence: m.confidence
      })),
      discrepancies: analysis.discrepancies?.map(d => ({
        field: d.field,
        values: [d.value_a, d.value_b],
        severity: d.severity,
        explanation: d.explanation
      })),
      summary: analysis.summary,
      verification_score: analysis.verification_score,
    });

    setResult({ ...comparison, ...analysis });
    setIsComparing(false);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1000px] mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cross-Document Verification</h1>
        <p className="text-sm text-slate-500 mt-1">Compare and verify data across multiple documents</p>
      </div>

      {/* Selection */}
      <Card className="border-slate-200/60">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Document A</label>
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
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Document B</label>
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
          <Card className="border-slate-200/60">
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
                  <p className="text-sm font-semibold text-slate-900">Verification Score</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-md">{result.summary}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matches */}
          {result.matches && result.matches.length > 0 && (
            <Card className="border-slate-200/60">
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

          {/* Discrepancies */}
          {result.discrepancies && result.discrepancies.length > 0 && (
            <Card className="border-rose-200/60">
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