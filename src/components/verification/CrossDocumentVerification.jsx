import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { GitCompare, CheckCircle2, AlertTriangle, Database, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function CrossDocumentVerification({ document }) {
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const { data: relatedDocs } = useQuery({
    queryKey: ['related-docs', document.document_class],
    queryFn: async () => {
      const docs = await base44.entities.Document.list();
      return docs.filter(d => 
        d.id !== document.id && 
        d.document_class === document.document_class &&
        d.status === 'completed'
      ).slice(0, 5);
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      setIsVerifying(true);
      
      // Cross-document verification
      const relatedData = relatedDocs?.map(d => ({
        id: d.id,
        title: d.title,
        entities: d.extracted_entities
      })) || [];

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Perform cross-document verification and anomaly detection:

Current Document:
- Type: ${document.document_class}
- Title: ${document.title}
- Entities: ${JSON.stringify(document.extracted_entities, null, 2)}

Related Documents (same type):
${relatedData.map((d, i) => `
Document ${i + 1}: ${d.title}
Entities: ${JSON.stringify(d.entities, null, 2)}
`).join('\n')}

Tasks:
1. Compare field values across documents for consistency
2. Identify outliers or unusual patterns
3. Detect potential data entry errors
4. Flag values that deviate from norms
5. Suggest external verification sources
6. Calculate consistency score

Provide detailed verification analysis.`,
        response_json_schema: {
          type: "object",
          properties: {
            consistency_score: {
              type: "number",
              description: "0-100 score of how consistent this document is with others"
            },
            verified_fields: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  status: { type: "string", enum: ["verified", "outlier", "suspicious", "inconsistent"] },
                  reference_range: { type: "string" },
                  deviation: { type: "string" }
                }
              }
            },
            anomalies_detected: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  issue: { type: "string" },
                  severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                  explanation: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            },
            external_verification_needed: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  source: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            cross_reference_opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  database: { type: "string" },
                  fields_to_check: { type: "array", items: { type: "string" } },
                  expected_match_rate: { type: "number" }
                }
              }
            }
          }
        },
        add_context_from_internet: true
      });

      setIsVerifying(false);
      return response;
    },
    onSuccess: (data) => {
      setVerificationResult(data);
      toast.success("Cross-document verification completed");
    },
    onError: () => {
      setIsVerifying(false);
      toast.error("Verification failed");
    }
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'suspicious': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'inconsistent': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  return (
    <Card className="border-purple-200 bg-purple-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <GitCompare className="w-5 h-5" />
          Cross-Document Verification
        </CardTitle>
        <p className="text-xs text-slate-600 mt-1">
          {relatedDocs?.length || 0} similar document{relatedDocs?.length !== 1 ? 's' : ''} available for comparison
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!verificationResult ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Compare this document against similar documents and external databases to detect anomalies and verify accuracy.
            </p>
            <Button
              onClick={() => verifyMutation.mutate()}
              disabled={isVerifying || !relatedDocs?.length}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <GitCompare className="w-4 h-4 mr-2" />
                  Run Verification
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Consistency Score */}
            <div className="p-4 bg-white rounded-lg border-2 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-900">Consistency Score</span>
                <Badge className={`text-sm ${
                  verificationResult.consistency_score >= 90 ? 'bg-green-100 text-green-700' :
                  verificationResult.consistency_score >= 70 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {verificationResult.consistency_score}%
                </Badge>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    verificationResult.consistency_score >= 90 ? 'bg-green-600' :
                    verificationResult.consistency_score >= 70 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${verificationResult.consistency_score}%` }}
                />
              </div>
            </div>

            {/* Verified Fields */}
            {verificationResult.verified_fields?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Field Verification Status</h4>
                <div className="space-y-2">
                  {verificationResult.verified_fields.map((field, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 flex-1">
                          {getStatusIcon(field.status)}
                          <div>
                            <p className="text-sm font-medium text-slate-900">{field.field}</p>
                            {field.reference_range && (
                              <p className="text-xs text-slate-600 mt-0.5">Range: {field.reference_range}</p>
                            )}
                            {field.deviation && (
                              <p className="text-xs text-orange-600 mt-0.5">⚠ {field.deviation}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">{field.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Anomalies */}
            {verificationResult.anomalies_detected?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Anomalies Detected
                </h4>
                <div className="space-y-2">
                  {verificationResult.anomalies_detected.map((anomaly, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${getSeverityColor(anomaly.severity)}`}>
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-semibold">{anomaly.field}</p>
                        <Badge className="text-xs capitalize">{anomaly.severity}</Badge>
                      </div>
                      <p className="text-xs mb-2">{anomaly.issue}</p>
                      <p className="text-xs opacity-80">{anomaly.explanation}</p>
                      {anomaly.recommendation && (
                        <p className="text-xs font-medium mt-2 pt-2 border-t border-current/20">
                          → {anomaly.recommendation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* External Verification */}
            {verificationResult.external_verification_needed?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  External Verification Needed
                </h4>
                <div className="space-y-2">
                  {verificationResult.external_verification_needed.map((item, idx) => (
                    <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-900">{item.field}</p>
                          <p className="text-xs text-slate-600 mt-1">Source: {item.source}</p>
                          <p className="text-xs text-slate-600">{item.reason}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cross Reference Opportunities */}
            {verificationResult.cross_reference_opportunities?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Cross-Reference Opportunities</h4>
                <div className="space-y-2">
                  {verificationResult.cross_reference_opportunities.map((opp, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm font-semibold text-slate-900">{opp.database}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        Check: {opp.fields_to_check.join(', ')}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Expected match rate: {opp.expected_match_rate}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => setVerificationResult(null)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Run New Verification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}