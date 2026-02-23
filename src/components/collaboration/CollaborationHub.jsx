import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Pen, History, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import CommentThread from "./CommentThread";
import AnnotationTool from "./AnnotationTool";
import VersionHistory from "./VersionHistory";

export default function CollaborationHub({ document }) {
  const { data: comments = [] } = useQuery({
    queryKey: ["comments", document.id],
    queryFn: async () => {
      const allComments = await base44.entities.DocumentComment.filter({ 
        document_id: document.id 
      });
      return allComments;
    }
  });

  const { data: annotations = [] } = useQuery({
    queryKey: ["annotations", document.id],
    queryFn: async () => {
      const allAnnotations = await base44.entities.DocumentAnnotation.filter({ 
        document_id: document.id 
      });
      return allAnnotations;
    }
  });

  const { data: versions = [] } = useQuery({
    queryKey: ["versions", document.id],
    queryFn: async () => {
      const allVersions = await base44.entities.DocumentVersion.filter({ 
        document_id: document.id 
      });
      return allVersions;
    }
  });

  const openComments = comments.filter(c => c.status === "open").length;

  return (
    <Card className="glass-strong border-slate-700/30">
      <CardHeader>
        <CardTitle className="text-gray-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          Team Collaboration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="comments" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-slate-800/50 mb-4">
            <TabsTrigger value="comments" className="text-xs">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              Comments
              {openComments > 0 && (
                <Badge className="ml-1.5 bg-blue-600 text-white text-[10px] h-4 px-1.5">
                  {openComments}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="annotations" className="text-xs">
              <Pen className="w-3.5 h-3.5 mr-1.5" />
              Annotations
              {annotations.length > 0 && (
                <Badge className="ml-1.5 bg-amber-600 text-white text-[10px] h-4 px-1.5">
                  {annotations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <History className="w-3.5 h-3.5 mr-1.5" />
              History
              {versions.length > 0 && (
                <Badge className="ml-1.5 bg-cyan-600 text-white text-[10px] h-4 px-1.5">
                  {versions.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comments">
            <CommentThread document={document} />
          </TabsContent>

          <TabsContent value="annotations">
            <AnnotationTool 
              document={document} 
              imageUrl={document.original_file_url} 
            />
          </TabsContent>

          <TabsContent value="history">
            <VersionHistory document={document} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}