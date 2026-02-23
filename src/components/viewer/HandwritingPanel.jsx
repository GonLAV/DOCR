import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PenTool, Type, TrendingUp, Droplet } from "lucide-react";
import { motion } from "framer-motion";

export default function HandwritingPanel({ regions }) {
  if (!regions || regions.length === 0) {
    return (
      <Card className="glass-strong border border-white/20">
        <CardContent className="p-6 text-center">
          <PenTool className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-50" />
          <p className="text-sm text-gray-400">No handwriting detected</p>
        </CardContent>
      </Card>
    );
  }

  const styleStats = regions.reduce((acc, r) => {
    acc[r.style] = (acc[r.style] || 0) + 1;
    return acc;
  }, {});

  const avgConfidence = Math.round(
    regions.reduce((sum, r) => sum + r.confidence, 0) / regions.length
  );

  const annotations = regions.filter(r => r.is_annotation);

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <Card className="glass-strong border border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <PenTool className="w-5 h-5 text-purple-400" />
            Handwriting Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-1">Total Regions</div>
              <div className="text-2xl font-bold text-white">{regions.length}</div>
            </div>
            <div className="glass rounded-xl p-3">
              <div className="text-xs text-gray-400 mb-1">Avg Confidence</div>
              <div className={`text-2xl font-bold ${
                avgConfidence >= 80 ? 'text-emerald-400' :
                avgConfidence >= 50 ? 'text-amber-400' :
                'text-rose-400'
              }`}>
                {avgConfidence}%
              </div>
            </div>
          </div>

          {/* Style distribution */}
          <div>
            <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
              <Type className="w-3.5 h-3.5" />
              Style Distribution
            </div>
            <div className="space-y-2">
              {Object.entries(styleStats).map(([style, count]) => (
                <div key={style} className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white capitalize">{style}</span>
                      <span className="text-xs text-gray-400">{count}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / regions.length) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={`h-full bg-gradient-to-r ${
                          style === 'cursive' ? 'from-purple-500 to-pink-500' :
                          style === 'block' ? 'from-blue-500 to-cyan-500' :
                          style === 'mixed' ? 'from-orange-500 to-red-500' :
                          'from-emerald-500 to-teal-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Annotations count */}
          {annotations.length > 0 && (
            <div className="glass rounded-xl p-3 border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">Annotations/Notes</div>
                <Badge className="bg-blue-500 text-white">{annotations.length}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual regions */}
      <div className="space-y-3">
        {regions.map((region, index) => (
          <motion.div
            key={region.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="glass-strong border border-white/20 hover:border-purple-500/50 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                      region.style === 'cursive' ? 'from-purple-500 to-pink-500' :
                      region.style === 'block' ? 'from-blue-500 to-cyan-500' :
                      region.style === 'mixed' ? 'from-orange-500 to-red-500' :
                      'from-emerald-500 to-teal-500'
                    } flex items-center justify-center`}>
                      <PenTool className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white capitalize">{region.style}</div>
                      <div className="text-[10px] text-gray-400">
                        Region {index + 1}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={`text-[10px] ${
                      region.confidence >= 80 ? 'bg-emerald-500' :
                      region.confidence >= 50 ? 'bg-amber-500' :
                      'bg-rose-500'
                    } text-white`}>
                      {region.confidence}%
                    </Badge>
                    {region.is_annotation && (
                      <Badge variant="outline" className="text-[9px] border-blue-400 text-blue-400">
                        Note
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Recognized text */}
                <div className="glass rounded-lg p-2 mb-2">
                  <div className="text-[10px] text-gray-400 mb-1">Recognized Text</div>
                  <p className="text-xs text-white italic">
                    "{region.recognized_text}"
                  </p>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-3 text-[10px]">
                  {region.ink_color && (
                    <div className="flex items-center gap-1 text-gray-400">
                      <Droplet className="w-3 h-3" />
                      <span className="capitalize">{region.ink_color}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-gray-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>Pressure: {region.pressure_map ? 'Analyzed' : 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}