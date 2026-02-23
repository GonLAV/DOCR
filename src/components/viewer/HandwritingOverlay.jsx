import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PenTool, Eye, EyeOff, Type } from "lucide-react";

export default function HandwritingOverlay({ regions, imageWidth, imageHeight }) {
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [showLabels, setShowLabels] = useState(true);

  if (!regions || regions.length === 0) return null;

  const getStyleColor = (style) => {
    const colors = {
      cursive: "from-purple-500 to-pink-500",
      block: "from-blue-500 to-cyan-500",
      mixed: "from-orange-500 to-red-500",
      signature: "from-emerald-500 to-teal-500"
    };
    return colors[style] || "from-gray-500 to-slate-500";
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return "border-emerald-400 bg-emerald-500/10";
    if (confidence >= 50) return "border-amber-400 bg-amber-500/10";
    return "border-rose-400 bg-rose-500/10";
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowLabels(!showLabels)}
        className="absolute top-4 left-4 glass-strong rounded-xl px-3 py-2 flex items-center gap-2 pointer-events-auto hover:glass transition-all z-50"
      >
        {showLabels ? <Eye className="w-4 h-4 text-purple-400" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
        <span className="text-xs font-semibold text-white">
          {showLabels ? "Hide" : "Show"} Handwriting
        </span>
      </motion.button>

      {/* Region overlays */}
      <AnimatePresence>
        {showLabels && regions.map((region) => {
          const left = `${region.coordinates.x}%`;
          const top = `${region.coordinates.y}%`;
          const width = `${region.coordinates.width}%`;
          const height = `${region.coordinates.height}%`;
          const isHovered = hoveredRegion === region.id;

          return (
            <motion.div
              key={region.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ left, top, width, height }}
              className="absolute pointer-events-auto"
              onMouseEnter={() => setHoveredRegion(region.id)}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              {/* Bounding box */}
              <div className={`
                absolute inset-0 border-2 rounded-lg transition-all duration-300
                ${getConfidenceColor(region.confidence)}
                ${isHovered ? 'border-4 shadow-2xl' : 'shadow-lg'}
              `}>
                {/* Corner markers */}
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full border-2 border-purple-500" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-purple-500" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-full border-2 border-purple-500" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-purple-500" />

                {/* Style indicator */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className={`px-2 py-1 rounded-full bg-gradient-to-r ${getStyleColor(region.style)} text-white text-[10px] font-bold shadow-lg flex items-center gap-1`}>
                    <PenTool className="w-2.5 h-2.5" />
                    {region.style}
                  </div>
                </div>

                {/* Confidence badge */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg ${
                    region.confidence >= 80 ? 'bg-emerald-500 text-white' :
                    region.confidence >= 50 ? 'bg-amber-500 text-white' :
                    'bg-rose-500 text-white'
                  }`}>
                    {region.confidence}%
                  </div>
                </div>

                {/* Annotation flag */}
                {region.is_annotation && (
                  <div className="absolute -right-2 top-0">
                    <div className="px-1.5 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded shadow-lg">
                      NOTE
                    </div>
                  </div>
                )}
              </div>

              {/* Hover popup */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50"
                    style={{ minWidth: '280px' }}
                  >
                    <Card className="glass-strong border border-white/20 shadow-2xl">
                      <CardContent className="p-4 space-y-3">
                        {/* Recognized text */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Type className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs font-bold text-white">Recognized Text</span>
                          </div>
                          <p className="text-sm text-gray-200 italic bg-white/5 rounded p-2 border border-white/10">
                            "{region.recognized_text}"
                          </p>
                        </div>

                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="glass rounded p-2">
                            <div className="text-gray-400 mb-1">Style</div>
                            <div className="text-white font-semibold capitalize">{region.style}</div>
                          </div>
                          <div className="glass rounded p-2">
                            <div className="text-gray-400 mb-1">Confidence</div>
                            <div className={`font-bold ${
                              region.confidence >= 80 ? 'text-emerald-400' :
                              region.confidence >= 50 ? 'text-amber-400' :
                              'text-rose-400'
                            }`}>
                              {region.confidence}%
                            </div>
                          </div>
                          <div className="glass rounded p-2">
                            <div className="text-gray-400 mb-1">Ink Color</div>
                            <div className="text-white font-semibold capitalize">{region.ink_color || 'N/A'}</div>
                          </div>
                          <div className="glass rounded p-2">
                            <div className="text-gray-400 mb-1">Type</div>
                            <div className="text-white font-semibold">
                              {region.is_annotation ? 'Annotation' : 'Main Text'}
                            </div>
                          </div>
                        </div>

                        {/* Pressure visualization */}
                        {region.pressure_map && (
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Stroke Pressure</div>
                            <div className="flex gap-0.5 h-6 items-end">
                              {region.pressure_map.slice(0, 20).map((pressure, i) => (
                                <div
                                  key={i}
                                  className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t"
                                  style={{ height: `${pressure * 100}%` }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Legend */}
      {showLabels && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute bottom-4 left-4 glass-strong rounded-xl p-3 pointer-events-auto z-50"
        >
          <div className="text-xs font-bold text-white mb-2">Handwriting Styles</div>
          <div className="space-y-1.5">
            {['cursive', 'block', 'mixed', 'signature'].map(style => (
              <div key={style} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded bg-gradient-to-r ${getStyleColor(style)}`} />
                <span className="text-xs text-gray-300 capitalize">{style}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}