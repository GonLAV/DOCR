import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Image } from "lucide-react";
import { motion } from "framer-motion";

export default function VisualComparisonPanel({ docA, docB }) {
  return (
    <Card className="glass-strong border border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-cyan-400" />
          Side-by-Side Visual Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Document A */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white">{docA.title}</span>
              <Badge className="bg-blue-500 text-white text-[10px]">Doc A</Badge>
            </div>
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/20 bg-black/20">
              {docA.original_file_url ? (
                <img 
                  src={docA.original_file_url} 
                  alt="Document A"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Image className="w-12 h-12 text-gray-500" />
                </div>
              )}
            </div>
          </div>

          {/* Document B */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white">{docB.title}</span>
              <Badge className="bg-purple-500 text-white text-[10px]">Doc B</Badge>
            </div>
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/20 bg-black/20">
              {docB.original_file_url ? (
                <img 
                  src={docB.original_file_url} 
                  alt="Document B"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Image className="w-12 h-12 text-gray-500" />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}