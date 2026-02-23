import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Play, Pause, RotateCcw, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function PipelineOrchestrator({ documentId, onComplete }) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const { data: document, refetch } = useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => {
      const docs = await base44.entities.Document.filter({ id: documentId });
      return docs[0];
    },
    refetchInterval: isRunning ? 2000 : false
  });

  useEffect(() => {
    if (document?.pipeline_stage) {
      setCurrentStage(document.pipeline_stage);
      
      const stageProgress = {
        'preservation': 15,
        'enhancement': 30,
        'layout': 45,
        'semantic': 60,
        'confidence': 80,
        'output': 95,
        'done': 100
      };
      
      setProgress(stageProgress[document.pipeline_stage] || 0);
      
      if (document.pipeline_stage === 'done' && isRunning) {
        setIsRunning(false);
        onComplete?.();
      }
    }
  }, [document?.pipeline_stage]);

  const runPipeline = async () => {
    setIsRunning(true);
    setError(null);
    setProgress(0);

    try {
      const result = await base44.functions.invoke('processDocumentPipeline', {
        document_id: documentId
      });

      if (!result.data?.success) {
        throw new Error(result.data?.error || 'Pipeline failed');
      }
    } catch (err) {
      setError(err.message);
      setIsRunning(false);
    }
  };

  const stages = [
    { key: 'preservation', label: 'Forensic Preservation', icon: '🔒' },
    { key: 'enhancement', label: 'AI Enhancement', icon: '✨' },
    { key: 'layout', label: 'Layout Analysis', icon: '📐' },
    { key: 'semantic', label: 'Semantic Extraction', icon: '🧠' },
    { key: 'confidence', label: 'Trust Calculation', icon: '🛡️' },
    { key: 'output', label: 'Output Generation', icon: '📦' },
    { key: 'done', label: 'Complete', icon: '✅' }
  ];

  const getStageStatus = (stageKey) => {
    if (!currentStage) return 'pending';
    
    const currentIndex = stages.findIndex(s => s.key === currentStage);
    const stageIndex = stages.findIndex(s => s.key === stageKey);
    
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            🔄 Pipeline Orchestrator
          </span>
          {document?.status === 'completed' && (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              Complete
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Overall Progress</span>
            <span className="text-sm font-bold text-indigo-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Pipeline Stages */}
        <div className="space-y-2">
          {stages.map((stage, idx) => {
            const status = getStageStatus(stage.key);
            return (
              <div
                key={stage.key}
                className={`p-3 rounded-lg border-2 transition-all ${
                  status === 'completed' ? 'bg-green-50 border-green-300' :
                  status === 'active' ? 'bg-indigo-100 border-indigo-400 shadow-md' :
                  'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{stage.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{stage.label}</p>
                      <p className="text-xs text-slate-600">Stage {idx + 1} of {stages.length}</p>
                    </div>
                  </div>
                  {status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {status === 'active' && <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">Pipeline Error</p>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {!isRunning && document?.status !== 'completed' && (
            <Button
              onClick={runPipeline}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Pipeline
            </Button>
          )}
          
          {isRunning && (
            <Button
              disabled
              className="flex-1"
            >
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </Button>
          )}

          {document?.status === 'completed' && (
            <Button
              onClick={runPipeline}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reprocess
            </Button>
          )}
        </div>

        {/* Info */}
        <p className="text-xs text-slate-500 text-center">
          {isRunning 
            ? 'Pipeline is processing your document through all stages...' 
            : document?.status === 'completed'
            ? 'Document has been fully processed. You can reprocess if needed.'
            : 'Click Start Pipeline to begin document processing.'}
        </p>
      </CardContent>
    </Card>
  );
}