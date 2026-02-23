import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Image, 
  Sparkles, 
  FileText, 
  Database, 
  TrendingUp, 
  Shield,
  Download,
  Eye,
  EyeOff
} from "lucide-react";

export default function LayeredOutputViewer({ document }) {
  const [activeLayer, setActiveLayer] = useState("original");
  const [visibleLayers, setVisibleLayers] = useState({
    layer1: true,
    layer2: false,
    layer3: false,
    layer4: false,
    layer5: false,
    layer6: false
  });

  const layers = [
    {
      id: "layer1",
      name: "Layer 1: Original Scan",
      icon: Image,
      color: "blue",
      description: "Immutable forensic preservation of original document",
      available: !!document.original_file_url,
      content: document.original_file_url
    },
    {
      id: "layer2",
      name: "Layer 2: Enhanced Image",
      icon: Sparkles,
      color: "purple",
      description: "AI-enhanced version with restoration and super-resolution",
      available: !!document.enhanced_file_url,
      content: document.enhanced_file_url
    },
    {
      id: "layer3",
      name: "Layer 3: OCR Text",
      icon: FileText,
      color: "green",
      description: "Multi-model consensus extracted text with character-level confidence",
      available: !!document.extracted_text,
      content: document.extracted_text
    },
    {
      id: "layer4",
      name: "Layer 4: Structured JSON",
      icon: Database,
      color: "indigo",
      description: "Structured data with entities, relationships, and metadata",
      available: !!(document.extracted_entities?.length || document.structured_data),
      content: {
        entities: document.extracted_entities || [],
        layout: document.layout_analysis || {},
        metadata: document.scan_metadata || {},
        structured_data: document.structured_data || {}
      }
    },
    {
      id: "layer5",
      name: "Layer 5: AI Annotations",
      icon: TrendingUp,
      color: "amber",
      description: "Confidence heatmaps, reconstruction transparency, anomaly markers",
      available: true,
      content: {
        confidence_score: document.confidence_score,
        anomalies: document.anomalies || [],
        consensus_data: document.structured_data?.ocr_consensus || {},
        damage_assessment: document.damage_assessment
      }
    },
    {
      id: "layer6",
      name: "Layer 6: Trust Score",
      icon: Shield,
      color: "emerald",
      description: "Decision-grade trust metrics and certification status",
      available: true,
      content: {
        confidence: document.confidence_score,
        tampering_risk: document.tampering_risk,
        court_ready: document.confidence_score >= 95,
        bank_ready: document.confidence_score >= 98
      }
    }
  ];

  const toggleLayer = (layerId) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-700 border-blue-300",
      purple: "bg-purple-100 text-purple-700 border-purple-300",
      green: "bg-green-100 text-green-700 border-green-300",
      indigo: "bg-indigo-100 text-indigo-700 border-indigo-300",
      amber: "bg-amber-100 text-amber-700 border-amber-300",
      emerald: "bg-emerald-100 text-emerald-700 border-emerald-300"
    };
    return colors[color] || colors.blue;
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            6-Layer Output System
          </span>
          <Badge variant="outline" className="text-xs">
            {Object.values(visibleLayers).filter(Boolean).length}/6 Active
          </Badge>
        </CardTitle>
        <p className="text-xs text-slate-600 mt-1">
          Complete forensic-grade document package with full traceability
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Layer Control Panel */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {layers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => toggleLayer(layer.id)}
              disabled={!layer.available}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                visibleLayers[layer.id]
                  ? getColorClasses(layer.color)
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              } ${!layer.available ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <layer.icon className="w-4 h-4" />
                {visibleLayers[layer.id] ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <EyeOff className="w-3 h-3" />
                )}
              </div>
              <p className="text-xs font-semibold mb-0.5">
                {layer.name.split(':')[0]}
              </p>
              <p className="text-[10px] opacity-80 line-clamp-1">
                {layer.name.split(':')[1]}
              </p>
            </button>
          ))}
        </div>

        {/* Layer Content Viewer */}
        <Tabs value={activeLayer} onValueChange={setActiveLayer} className="w-full">
          <TabsList className="w-full grid grid-cols-6">
            {layers.map((layer, idx) => (
              <TabsTrigger
                key={layer.id}
                value={layer.id}
                disabled={!layer.available}
                className="text-xs"
              >
                L{idx + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          {layers.map((layer) => (
            <TabsContent key={layer.id} value={layer.id} className="space-y-3">
              <div className={`p-3 rounded-lg border-2 ${getColorClasses(layer.color)}`}>
                <div className="flex items-center gap-2 mb-2">
                  <layer.icon className="w-4 h-4" />
                  <h4 className="text-sm font-bold">{layer.name}</h4>
                </div>
                <p className="text-xs opacity-80">{layer.description}</p>
              </div>

              {!layer.available ? (
                <div className="p-6 text-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                  <p className="text-sm text-slate-500">This layer is not yet available</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border-2 border-slate-200 overflow-hidden">
                  {/* Layer 1 & 2: Images */}
                  {(layer.id === 'layer1' || layer.id === 'layer2') && (
                    <div className="p-4">
                      <img
                        src={layer.content}
                        alt={layer.name}
                        className="w-full rounded-lg border border-slate-200"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        asChild
                      >
                        <a href={layer.content} download target="_blank" rel="noopener noreferrer">
                          <Download className="w-3 h-3 mr-2" />
                          Download {layer.id === 'layer1' ? 'Original' : 'Enhanced'}
                        </a>
                      </Button>
                    </div>
                  )}

                  {/* Layer 3: Text */}
                  {layer.id === 'layer3' && (
                    <div className="p-4 max-h-96 overflow-y-auto">
                      <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                        {layer.content}
                      </pre>
                    </div>
                  )}

                  {/* Layer 4: JSON */}
                  {layer.id === 'layer4' && (
                    <div className="p-4 max-h-96 overflow-y-auto bg-slate-900">
                      <pre className="text-xs text-slate-100 font-mono">
                        {JSON.stringify(layer.content, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Layer 5: Annotations */}
                  {layer.id === 'layer5' && (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-slate-600 mb-1">Confidence</p>
                          <p className="text-xl font-bold text-blue-700">
                            {layer.content.confidence_score || 0}%
                          </p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-xs text-slate-600 mb-1">Anomalies</p>
                          <p className="text-xl font-bold text-red-700">
                            {layer.content.anomalies?.length || 0}
                          </p>
                        </div>
                      </div>
                      {layer.content.anomalies?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-slate-900">Detected Issues:</p>
                          {layer.content.anomalies.map((anomaly, idx) => (
                            <div key={idx} className="p-2 bg-amber-50 rounded border border-amber-200">
                              <p className="text-xs font-medium text-slate-900">{anomaly.type}</p>
                              <p className="text-xs text-slate-600">{anomaly.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Layer 6: Trust Score */}
                  {layer.id === 'layer6' && (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className={`p-4 rounded-lg ${
                          layer.content.court_ready
                            ? 'bg-green-50 border-2 border-green-500'
                            : 'bg-slate-50 border-2 border-slate-300'
                        }`}>
                          <Shield className={`w-6 h-6 mb-2 ${
                            layer.content.court_ready ? 'text-green-600' : 'text-slate-400'
                          }`} />
                          <p className="text-xs font-semibold text-slate-900 mb-1">Court Ready</p>
                          <p className={`text-sm font-bold ${
                            layer.content.court_ready ? 'text-green-700' : 'text-slate-500'
                          }`}>
                            {layer.content.court_ready ? 'Certified' : 'Not Ready'}
                          </p>
                        </div>
                        <div className={`p-4 rounded-lg ${
                          layer.content.bank_ready
                            ? 'bg-emerald-50 border-2 border-emerald-500'
                            : 'bg-slate-50 border-2 border-slate-300'
                        }`}>
                          <Shield className={`w-6 h-6 mb-2 ${
                            layer.content.bank_ready ? 'text-emerald-600' : 'text-slate-400'
                          }`} />
                          <p className="text-xs font-semibold text-slate-900 mb-1">Bank Grade</p>
                          <p className={`text-sm font-bold ${
                            layer.content.bank_ready ? 'text-emerald-700' : 'text-slate-500'
                          }`}>
                            {layer.content.bank_ready ? 'Certified' : 'Not Ready'}
                          </p>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-600 mb-1">Tampering Risk</p>
                        <Badge className={`${
                          layer.content.tampering_risk === 'none' ? 'bg-green-100 text-green-700' :
                          layer.content.tampering_risk === 'low' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {layer.content.tampering_risk || 'none'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}