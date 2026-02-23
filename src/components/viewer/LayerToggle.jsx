import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Image, Sparkles, Type, Braces, MessageSquare, BarChart3 } from "lucide-react";

const layers = [
  { key: "original", label: "Original", icon: Image },
  { key: "enhanced", label: "Enhanced", icon: Sparkles },
  { key: "ocr", label: "OCR Text", icon: Type },
  { key: "structured", label: "Structured", icon: Braces },
  { key: "annotations", label: "Annotations", icon: MessageSquare },
  { key: "confidence", label: "Confidence", icon: BarChart3 },
];

export default function LayerToggle({ activeLayers, onToggle }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {layers.map(layer => {
        const isActive = activeLayers.includes(layer.key);
        return (
          <Button
            key={layer.key}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onToggle(layer.key)}
            className={`text-xs gap-1.5 h-8 ${
              isActive
                ? "bg-slate-800 hover:bg-slate-700 text-white"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <layer.icon className="w-3 h-3" />
            <span className="hidden sm:inline">{layer.label}</span>
          </Button>
        );
      })}
    </div>
  );
}