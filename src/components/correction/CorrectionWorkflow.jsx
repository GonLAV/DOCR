import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit3, Save, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function CorrectionWorkflow({ document, trustScore }) {
  const queryClient = useQueryClient();
  const [editingField, setEditingField] = useState(null);
  const [correctionData, setCorrectionData] = useState({});

  const createCorrectionMutation = useMutation({
    mutationFn: async (data) => {
      const correction = await base44.entities.Correction.create(data);
      
      // Update document with corrected value
      const fieldPath = data.field_path.split(".");
      const entityIndex = parseInt(fieldPath[1].match(/\d+/)[0]);
      const fieldName = fieldPath[2];
      
      const updatedEntities = [...document.extracted_entities];
      updatedEntities[entityIndex][fieldName] = data.corrected_value;
      
      await base44.entities.Document.update(document.id, {
        extracted_entities: updatedEntities
      });

      return correction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["document", document.id]);
      toast.success("Correction saved and learning applied");
      setEditingField(null);
      setCorrectionData({});
    }
  });

  const handleStartCorrection = (entity, index) => {
    setEditingField(`entities[${index}]`);
    setCorrectionData({
      document_id: document.id,
      field_path: `entities[${index}].value`,
      original_value: entity.value,
      corrected_value: entity.value,
      confidence_before: entity.confidence || 0,
      correction_reason: "misread_character"
    });
  };

  const handleSaveCorrection = () => {
    createCorrectionMutation.mutate(correctionData);
  };

  const highRiskEntities = document.extracted_entities?.filter(e => 
    (e.confidence || 100) < 80 || e.inferred
  ) || [];

  return (
    <Card className="border-amber-200/60 bg-amber-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Human Review Required ({highRiskEntities.length} fields)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {highRiskEntities.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">
            No fields require correction
          </p>
        ) : (
          highRiskEntities.map((entity, i) => {
            const fullIndex = document.extracted_entities.indexOf(entity);
            const isEditing = editingField === `entities[${fullIndex}]`;

            return (
              <div key={i} className="p-3 bg-white rounded-lg border border-amber-200 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                        {entity.field}
                      </span>
                      {entity.inferred && (
                        <Badge variant="outline" className="text-[9px] h-4 text-amber-600 border-amber-200">
                          AI Inferred
                        </Badge>
                      )}
                      <Badge className={`text-[9px] h-4 ${
                        entity.confidence >= 80 ? "bg-emerald-100 text-emerald-700" :
                        entity.confidence >= 50 ? "bg-amber-100 text-amber-700" :
                        "bg-rose-100 text-rose-700"
                      }`}>
                        {entity.confidence?.toFixed(0)}% confident
                      </Badge>
                    </div>
                    
                    {!isEditing ? (
                      <p className="text-sm font-medium text-slate-800">{entity.value}</p>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          value={correctionData.corrected_value}
                          onChange={(e) => setCorrectionData({
                            ...correctionData,
                            corrected_value: e.target.value
                          })}
                          placeholder="Corrected value"
                          className="text-sm"
                        />
                        <Select
                          value={correctionData.correction_reason}
                          onValueChange={(value) => setCorrectionData({
                            ...correctionData,
                            correction_reason: value
                          })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Correction reason" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="misread_character">Misread Character</SelectItem>
                            <SelectItem value="hallucination">AI Hallucination</SelectItem>
                            <SelectItem value="missing_content">Missing Content</SelectItem>
                            <SelectItem value="wrong_context">Wrong Context</SelectItem>
                            <SelectItem value="degradation">Image Degradation</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <Textarea
                          value={correctionData.correction_notes || ""}
                          onChange={(e) => setCorrectionData({
                            ...correctionData,
                            correction_notes: e.target.value
                          })}
                          placeholder="Optional notes about this correction..."
                          className="text-xs h-16"
                        />
                      </div>
                    )}
                  </div>
                  
                  {!isEditing ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartCorrection(entity, fullIndex)}
                      className="h-7 text-xs gap-1.5 shrink-0"
                    >
                      <Edit3 className="w-3 h-3" /> Correct
                    </Button>
                  ) : (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingField(null);
                          setCorrectionData({});
                        }}
                        className="h-7 w-7 p-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveCorrection}
                        disabled={createCorrectionMutation.isPending}
                        className="h-7 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Save className="w-3 h-3" /> Save
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        <div className="pt-3 border-t border-amber-200">
          <p className="text-[10px] text-slate-500 leading-relaxed">
            <strong>Learning Loop:</strong> Your corrections train the system to improve accuracy on similar documents.
            All corrections are verified and used to refine extraction models and validation rules.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}