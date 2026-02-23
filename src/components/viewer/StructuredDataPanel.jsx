import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, LayoutGrid, Table, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function StructuredDataPanel({ document }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(document.structured_data, null, 2));
    setCopied(true);
    toast.success("JSON copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Layout Analysis */}
      {document.layout_analysis && (
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-indigo-600" />
              Layout Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {document.layout_analysis.has_tables != null && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <Table className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-600">Tables</span>
                  <Badge className={`ml-auto text-[10px] ${document.layout_analysis.has_tables ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {document.layout_analysis.has_tables ? "Yes" : "No"}
                  </Badge>
                </div>
              )}
              {document.layout_analysis.has_handwriting != null && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-600">Handwriting</span>
                  <Badge className={`ml-auto text-[10px] ${document.layout_analysis.has_handwriting ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                    {document.layout_analysis.has_handwriting ? "Yes" : "No"}
                  </Badge>
                </div>
              )}
              {document.layout_analysis.has_signatures != null && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <span className="text-xs text-slate-600">Signatures</span>
                  <Badge className={`ml-auto text-[10px] ${document.layout_analysis.has_signatures ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500"}`}>
                    {document.layout_analysis.has_signatures ? "Yes" : "No"}
                  </Badge>
                </div>
              )}
              {document.layout_analysis.has_stamps != null && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <span className="text-xs text-slate-600">Stamps</span>
                  <Badge className={`ml-auto text-[10px] ${document.layout_analysis.has_stamps ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                    {document.layout_analysis.has_stamps ? "Yes" : "No"}
                  </Badge>
                </div>
              )}
              {document.layout_analysis.columns != null && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <span className="text-xs text-slate-600">Columns</span>
                  <span className="ml-auto text-xs font-medium text-slate-700">{document.layout_analysis.columns}</span>
                </div>
              )}
              {document.layout_analysis.paragraph_count != null && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <span className="text-xs text-slate-600">Paragraphs</span>
                  <span className="ml-auto text-xs font-medium text-slate-700">{document.layout_analysis.paragraph_count}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extracted Text */}
      {document.extracted_text && (
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900">Extracted Text</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-slate-50 rounded-lg max-h-60 overflow-y-auto">
              <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">
                {document.extracted_text}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* JSON Data */}
      {document.structured_data && (
        <Card className="border-slate-200/60">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-900">Structured JSON</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 text-xs gap-1.5">
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[11px] overflow-x-auto max-h-80 leading-relaxed">
              {JSON.stringify(document.structured_data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}