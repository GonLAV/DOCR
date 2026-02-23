import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Code, Database, Cpu, GitMerge, Users, TrendingUp, Layers } from "lucide-react";

export default function Implementation() {
  const [activeTab, setActiveTab] = useState("enhancement");

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Code className="w-10 h-10 text-indigo-600" />
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Implementation Guide
          </h1>
        </div>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Backend code examples, fusion algorithms, and practical implementation details for the Document Transformation Engine
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 h-auto">
          <TabsTrigger value="enhancement" className="flex flex-col items-center gap-1 py-3">
            <Cpu className="w-4 h-4" />
            <span className="text-xs">Enhancement</span>
          </TabsTrigger>
          <TabsTrigger value="ocr-fusion" className="flex flex-col items-center gap-1 py-3">
            <GitMerge className="w-4 h-4" />
            <span className="text-xs">OCR Fusion</span>
          </TabsTrigger>
          <parameter name="value">confidence