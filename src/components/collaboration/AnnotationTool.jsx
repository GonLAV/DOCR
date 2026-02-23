import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Highlighter, 
  Pen, 
  Square, 
  Type,
  Trash2,
  Users,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnnotationTool({ document, imageUrl }) {
  const queryClient = useQueryClient();
  const [activeTool, setActiveTool] = useState(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [selectedColor, setSelectedColor] = useState("#fbbf24");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const imageRef = useRef(null);

  const { data: annotations = [] } = useQuery({
    queryKey: ["annotations", document.id],
    queryFn: async () => {
      const allAnnotations = await base44.entities.DocumentAnnotation.filter({ 
        document_id: document.id 
      });
      return allAnnotations;
    }
  });

  // Real-time subscription for annotations
  React.useEffect(() => {
    const unsubscribe = base44.entities.DocumentAnnotation.subscribe((event) => {
      if (event.data?.document_id === document.id) {
        queryClient.invalidateQueries({ queryKey: ["annotations", document.id] });
      }
    });
    return unsubscribe;
  }, [document.id, queryClient]);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me()
  });

  const addAnnotationMutation = useMutation({
    mutationFn: async (annotationData) => {
      await base44.entities.DocumentAnnotation.create({
        document_id: document.id,
        user_email: currentUser?.email,
        ...annotationData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annotations", document.id] });
    }
  });

  const deleteAnnotationMutation = useMutation({
    mutationFn: async (annotationId) => {
      await base44.entities.DocumentAnnotation.delete(annotationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annotations", document.id] });
    }
  });

  const handleMouseDown = (e) => {
    if (!activeTool || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setIsDrawing(true);
    setStartPos({ x, y });
  };

  const handleMouseUp = (e) => {
    if (!isDrawing || !startPos || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const endX = ((e.clientX - rect.left) / rect.width) * 100;
    const endY = ((e.clientY - rect.top) / rect.height) * 100;
    
    const width = Math.abs(endX - startPos.x);
    const height = Math.abs(endY - startPos.y);
    
    if (width > 1 && height > 1) {
      addAnnotationMutation.mutate({
        annotation_type: activeTool,
        coordinates: {
          x: Math.min(startPos.x, endX),
          y: Math.min(startPos.y, endY),
          width,
          height
        },
        color: selectedColor
      });
    }
    
    setIsDrawing(false);
    setStartPos(null);
  };

  const tools = [
    { id: "highlight", icon: Highlighter, label: "Highlight", color: "#fbbf24" },
    { id: "box", icon: Square, label: "Box", color: "#ef4444" },
    { id: "note", icon: Type, label: "Note", color: "#3b82f6" }
  ];

  return (
    <Card className="glass-strong border border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pen className="w-5 h-5 text-amber-400" />
            Annotations
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500 text-white">
              {annotations.length}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAnnotations(!showAnnotations)}
              className="text-gray-300 hover:text-white"
            >
              {showAnnotations ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="glass rounded-xl p-3 border border-amber-500/20">
          <div className="flex items-center gap-2 flex-wrap">
            {tools.map((tool) => (
              <Button
                key={tool.id}
                size="sm"
                variant={activeTool === tool.id ? "default" : "outline"}
                onClick={() => {
                  setActiveTool(activeTool === tool.id ? null : tool.id);
                  setSelectedColor(tool.color);
                }}
                className={activeTool === tool.id 
                  ? "bg-amber-500 hover:bg-amber-600 text-white" 
                  : "glass text-gray-300 hover:glass-strong"}
              >
                <tool.icon className="w-4 h-4 mr-2" />
                {tool.label}
              </Button>
            ))}
          </div>
          {activeTool && (
            <p className="text-xs text-gray-400 mt-2">
              Click and drag on the document to create a {activeTool}
            </p>
          )}
        </div>

        {/* Document Preview with Annotations */}
        <div className="relative rounded-xl overflow-hidden border border-white/20 bg-black/20">
          {imageUrl && (
            <>
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Document"
                className="w-full h-auto cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
              />
              
              {/* Overlay Annotations */}
              {showAnnotations && annotations.map((annotation) => (
                <motion.div
                  key={annotation.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  className="absolute group"
                  style={{
                    left: `${annotation.coordinates.x}%`,
                    top: `${annotation.coordinates.y}%`,
                    width: `${annotation.coordinates.width}%`,
                    height: `${annotation.coordinates.height}%`,
                    backgroundColor: annotation.color,
                    border: `2px solid ${annotation.color}`,
                    cursor: "pointer"
                  }}
                >
                  {annotation.user_email === currentUser?.email && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteAnnotationMutation.mutate(annotation.id)}
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-rose-500 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </>
          )}
        </div>

        {/* Annotation List */}
        {annotations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Users className="w-4 h-4" />
              <span>Team Annotations</span>
            </div>
            <div className="space-y-1">
              {annotations.map((annotation) => (
                <div 
                  key={annotation.id}
                  className="glass rounded-lg p-2 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: annotation.color }}
                    />
                    <span className="text-gray-300 capitalize">{annotation.annotation_type}</span>
                    <span className="text-gray-500">by {annotation.user_email?.split("@")[0]}</span>
                  </div>
                  {annotation.user_email === currentUser?.email && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteAnnotationMutation.mutate(annotation.id)}
                      className="h-6 w-6 p-0 text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}