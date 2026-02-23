import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

export default function InteractiveCorrectionPanel({ document }) {
  const [selectedField, setSelectedField] = useState(null);
  const [correctedValue, setCorrectedValue] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [expandedField, setExpandedField] = useState(null);
  
  const queryClient = useQueryClient();

  // Get low-confidence fields
  const lowConfidenceFields = document.extracted_entities?.filter(
    entity => entity.confidence < 80 || entity.inferred
  ) || [];

  const generateSuggestionsMutation = useMutation({
    mutationFn: async (field) => {
      setLoadingSuggestions(true);
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this field extraction from a document and provide correction suggestions:

Document Type: ${document.document_class || 'Unknown'}
Field Name: ${field.field}
Current Value: ${field.value}
Confidence: ${field.confidence}%
Inferred: ${field.inferred ? 'Yes' : 'No'}
Source Region: ${field.source_region || 'N/A'}

Context: ${document.extracted_text?.substring(0, 500) || 'Limited context'}

Provide:
1. Alternative interpretations (at least 3 if possible)
2. Most likely correct value with reasoning
3. Common OCR misreads for similar patterns
4. Validation checks to apply

Be specific and actionable.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggested_value: {
              type: "string",
              description: "Most likely correct value"
            },
            confidence_in_suggestion: {
              type: "number",
              description: "0-100 confidence in the suggestion"
            },
            reasoning: {
              type: "string",
              description: "Why this is the likely correct value"
            },
            alternatives: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  value: { type: "string" },
                  probability: { type: "number" },
                  reason: { type: "string" }
                }
              },
              description: "Other possible interpretations"
            },
            common_misreads: {
              type: "array",
              items: { type: "string" },
              description: "Common OCR errors for this pattern"
            },
            validation_notes: {
              type: "string",
              description: "What to check when validating"
            }
          }
        },
        add_context_from_internet: false
      });
      setLoadingSuggestions(false);
      return response;
    },
    onSuccess: (data) => {
      setAiSuggestions(data);
      toast.success("AI suggestions generated");
    }
  });

  const saveCorrectionMutation = useMutation({
    mutationFn: async () => {
      // Create correction record
      const correction = await base44.entities.Correction.create({
        document_id: document.id,
        field_path: `entities[${document.extracted_entities?.indexOf(selectedField)}].value`,
        original_value: selectedField.value,
        corrected_value: correctedValue,
        confidence_before: selectedField.confidence,
        correction_reason: correctionReason,
        region_coordinates: selectedField.coordinates || {},
        correction_notes: notes,
        impact_score: selectedField.confidence < 50 ? 0.9 : 0.5
      });

      // Update document entity
      const updatedEntities = document.extracted_entities.map(e =>
        e.field === selectedField.field ? { ...e, value: correctedValue, confidence: 100 } : e
      );

      await base44.entities.Document.update(document.id, {
        extracted_entities: updatedEntities
      });

      return correction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['document']);
      toast.success("Correction saved and model will learn from this");
      setSelectedField(null);
      setCorrectedValue("");
      setNotes("");
      setAiSuggestions(null);
    }
  });

  const handleStartCorrection = (field) => {
    setSelectedField(field);
    setCorrectedValue(field.value);
    setAiSuggestions(null);
  };

  const handleApplySuggestion = (suggestion) => {
    setCorrectedValue(suggestion);
    toast.info("Suggestion applied - review and confirm");
  };

  return (
    <Card className="border-orange-200 bg-orange-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <AlertCircle className="w-5 h-5" />
          Human-in-the-Loop Corrections
        </CardTitle>
        <p className="text-xs text-slate-600 mt-1">
          {lowConfidenceFields.length} field{lowConfidenceFields.length !== 1 ? 's' : ''} requiring review
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {lowConfidenceFields.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">All fields have high confidence!</p>
          </div>
        ) : (
          <>
            {/* Field List */}
            <div className="space-y-2">
              {lowConfidenceFields.map((field, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedField(expandedField === idx ? null : idx)}
                    className="w-full p-3 bg-white hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-slate-900">{field.field}</span>
                          <Badge variant="outline" className={`text-xs ${
                            field.confidence < 50 ? 'bg-red-50 text-red-700 border-red-200' :
                            field.confidence < 70 ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {field.confidence}% confidence
                          </Badge>
                          {field.inferred && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                              AI Inferred
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 font-mono">{field.value}</p>
                      </div>
                      {expandedField === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {expandedField === idx && (
                    <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                      {selectedField?.field !== field.field ? (
                        <>
                          <Button
                            onClick={() => handleStartCorrection(field)}
                            size="sm"
                            className="w-full"
                          >
                            Start Correction
                          </Button>
                          <Button
                            onClick={() => generateSuggestionsMutation.mutate(field)}
                            size="sm"
                            variant="outline"
                            className="w-full gap-2"
                            disabled={loadingSuggestions}
                          >
                            {loadingSuggestions ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                            Get AI Suggestions
                          </Button>
                        </>
                      ) : (
                        <div className="space-y-3">
                          {/* AI Suggestions */}
                          {aiSuggestions && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-semibold text-blue-900">AI Assistant</span>
                              </div>
                              
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-blue-800">Recommended Value:</span>
                                  <Badge className="text-xs bg-blue-100 text-blue-700">
                                    {aiSuggestions.confidence_in_suggestion}% confident
                                  </Badge>
                                </div>
                                <button
                                  onClick={() => handleApplySuggestion(aiSuggestions.suggested_value)}
                                  className="w-full p-2 text-left bg-white border border-blue-200 rounded text-sm font-mono hover:bg-blue-50 transition-colors"
                                >
                                  {aiSuggestions.suggested_value}
                                </button>
                                <p className="text-xs text-slate-600 mt-1">{aiSuggestions.reasoning}</p>
                              </div>

                              {aiSuggestions.alternatives?.length > 0 && (
                                <div>
                                  <span className="text-xs font-medium text-slate-700">Alternatives:</span>
                                  <div className="space-y-1 mt-1">
                                    {aiSuggestions.alternatives.map((alt, i) => (
                                      <button
                                        key={i}
                                        onClick={() => handleApplySuggestion(alt.value)}
                                        className="w-full p-2 text-left bg-white border border-slate-200 rounded text-xs hover:bg-slate-50 transition-colors"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-mono">{alt.value}</span>
                                          <span className="text-slate-500">{alt.probability}%</span>
                                        </div>
                                        <p className="text-slate-500 text-[10px] mt-0.5">{alt.reason}</p>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {aiSuggestions.validation_notes && (
                                <p className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-200">
                                  <strong>Validation:</strong> {aiSuggestions.validation_notes}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Correction Form */}
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs font-medium text-slate-700 mb-1 block">Corrected Value</label>
                              <Input
                                value={correctedValue}
                                onChange={(e) => setCorrectedValue(e.target.value)}
                                className="font-mono text-sm"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-medium text-slate-700 mb-1 block">Reason</label>
                              <Select value={correctionReason} onValueChange={setCorrectionReason}>
                                <SelectTrigger className="text-xs">
                                  <SelectValue placeholder="Select reason" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="misread_character">Misread Character</SelectItem>
                                  <SelectItem value="hallucination">AI Hallucination</SelectItem>
                                  <SelectItem value="missing_content">Missing Content</SelectItem>
                                  <SelectItem value="wrong_context">Wrong Context</SelectItem>
                                  <SelectItem value="degradation">Degradation Issue</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-xs font-medium text-slate-700 mb-1 block">Notes (Optional)</label>
                              <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="text-xs h-16"
                                placeholder="Additional context for this correction..."
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => saveCorrectionMutation.mutate()}
                                disabled={!correctedValue || !correctionReason}
                                size="sm"
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Save Correction
                              </Button>
                              <Button
                                onClick={() => {
                                  setSelectedField(null);
                                  setAiSuggestions(null);
                                }}
                                size="sm"
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}