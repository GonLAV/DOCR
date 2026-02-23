import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Eye, EyeOff } from "lucide-react";

/**
 * Pixel-level confidence visualization
 * Shows color-coded overlay on document indicating confidence per region
 */
export default function ConfidenceHeatmap({ document, consensusData }) {
  const [showHeatmap, setShowHeatmap] = useState(true);

  if (!consensusData?.character_confidence_map) {
    return null;
  }

  // Calculate region-level confidence from character map
  const regions = groupIntoRegions(consensusData.character_confidence_map);

  return (
    <Card className="border-slate-200/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Pixel-Level Confidence Map
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="h-7 text-xs gap-1.5"
          >
            {showHeatmap ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showHeatmap ? "Hide" : "Show"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Legend */}
        <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span className="text-[10px] text-slate-600">High (95-100%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-blue-500" />
            <span className="text-[10px] text-slate-600">Good (80-94%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-500" />
            <span className="text-[10px] text-slate-600">Medium (60-79%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-rose-500" />
            <span className="text-[10px] text-slate-600">Low (&lt;60%)</span>
          </div>
        </div>

        {showHeatmap && (
          <div className="space-y-2">
            <p className="text-xs text-slate-600 font-medium">Character-Level Analysis:</p>
            <div className="p-3 bg-slate-50 rounded-lg max-h-60 overflow-y-auto font-mono text-xs leading-relaxed">
              {consensusData.character_confidence_map.map((char, i) => (
                <span
                  key={i}
                  className={`inline-block px-0.5 rounded ${getConfidenceColor(char.confidence)}`}
                  title={`${char.char}: ${char.confidence}% confident (${char.status})`}
                >
                  {char.char}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reconstruction transparency */}
        {consensusData.reconstruction_transparency && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-800 mb-2">Reconstruction Breakdown:</p>
            <div className="grid grid-cols-2 gap-2">
              <StatBox 
                label="Clearly Visible"
                value={consensusData.reconstruction_transparency.clearly_visible}
                total={consensusData.reconstruction_transparency.total_characters}
                color="emerald"
              />
              <StatBox 
                label="Degraded"
                value={consensusData.reconstruction_transparency.partially_degraded}
                total={consensusData.reconstruction_transparency.total_characters}
                color="amber"
              />
              <StatBox 
                label="AI Inferred"
                value={consensusData.reconstruction_transparency.inferred}
                total={consensusData.reconstruction_transparency.total_characters}
                color="violet"
              />
              <StatBox 
                label="Uncertain"
                value={consensusData.reconstruction_transparency.uncertain}
                total={consensusData.reconstruction_transparency.total_characters}
                color="rose"
              />
            </div>
          </div>
        )}

        {/* Disagreement regions */}
        {consensusData.disagreement_regions && consensusData.disagreement_regions.length > 0 && (
          <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
            <p className="text-xs font-semibold text-rose-800 mb-2">
              Model Disagreements ({consensusData.disagreement_regions.length}):
            </p>
            <div className="space-y-2">
              {consensusData.disagreement_regions.map((region, i) => (
                <div key={i} className="p-2 bg-white rounded-md text-xs">
                  <p className="font-medium text-slate-700 mb-1">Position: {region.position}</p>
                  <div className="flex gap-2 text-[10px] text-slate-600">
                    {Object.entries(region.models || {}).map(([model, value]) => (
                      <div key={model}>
                        <span className="font-medium">{model}:</span> "{value}"
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-amber-600 mt-1">→ {region.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getConfidenceColor(confidence) {
  if (confidence >= 95) return "bg-emerald-200/60";
  if (confidence >= 80) return "bg-blue-200/60";
  if (confidence >= 60) return "bg-amber-200/60";
  return "bg-rose-200/60";
}

function StatBox({ label, value, total, color }) {
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  const colorMap = {
    emerald: "text-emerald-700 bg-emerald-100",
    amber: "text-amber-700 bg-amber-100",
    violet: "text-violet-700 bg-violet-100",
    rose: "text-rose-700 bg-rose-100"
  };

  return (
    <div className={`p-2 rounded-md ${colorMap[color]}`}>
      <p className="text-[10px] font-medium opacity-80">{label}</p>
      <p className="text-lg font-bold mt-0.5">{value}</p>
      <p className="text-[10px] opacity-70">{percentage}%</p>
    </div>
  );
}

function groupIntoRegions(charMap) {
  // Group characters into regions for visualization
  // This is a simplified version - real implementation would use actual coordinates
  return charMap;
}