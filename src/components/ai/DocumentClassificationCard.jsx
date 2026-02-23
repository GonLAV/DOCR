import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function DocumentClassificationCard({ document }) {
  const queryClient = useQueryClient();

  const classifyMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke("classifyDocument", {
        document_id: document.id
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", document.id] });
      toast.success("Document classified successfully");
    },
    onError: () => {
      toast.error("Failed to classify document");
    }
  });

  if (!document.document_class) {
    return (
      <Card className="glass-strong border border-white/20">
        <CardContent className="p-4">
          <div className="text-center mb-4">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50 text-gray-400" />
            <p className="text-xs text-gray-400">Document not classified</p>
          </div>
          <Button
            onClick={() => classifyMutation.mutate()}
            disabled={classifyMutation.isPending}
            className="w-full gap-2 h-8 text-xs"
          >
            {classifyMutation.isPending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Classifying...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Classify Document
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-strong border border-blue-500/30">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">Classification</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => classifyMutation.mutate()}
            disabled={classifyMutation.isPending}
            className="h-6 w-6 p-0 text-blue-400 hover:text-blue-300"
          >
            <RefreshCw className={`w-3 h-3 ${classifyMutation.isPending ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="glass rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-white capitalize">
              {document.document_class}
            </span>
            <Badge className="bg-blue-500/20 text-blue-300">
              {document.classification_confidence || 0}%
            </Badge>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-1.5">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
              style={{ width: `${document.classification_confidence || 0}%` }}
            />
          </div>
        </div>

        {document.classification_indicators && document.classification_indicators.length > 0 && (
          <div>
            <span className="text-xs text-gray-400 mb-1.5 block">Key Indicators</span>
            <div className="flex flex-wrap gap-1.5">
              {document.classification_indicators.slice(0, 3).map((indicator, i) => (
                <Badge key={i} className="bg-slate-700/50 text-gray-300 text-[10px]">
                  {indicator}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {document.alternative_classifications && document.alternative_classifications.length > 0 && (
          <div>
            <span className="text-xs text-gray-400 mb-1.5 block">Alternatives</span>
            <div className="space-y-1">
              {document.alternative_classifications.slice(0, 2).map((alt, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">{alt.category}</span>
                  <span className="text-gray-500">{alt.confidence}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}