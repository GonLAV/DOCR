import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain,
  TrendingUp,
  AlertCircle,
  Users,
  Loader2,
  CheckCircle,
  XCircle,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AILearningPanel({ workflowId }) {
  const [activeTab, setActiveTab] = useState("routing");
  const queryClient = useQueryClient();

  // Fetch learned patterns
  const { data: learnings = [] } = useQuery({
    queryKey: ["workflowLearnings", workflowId],
    queryFn: () => base44.entities.WorkflowLearning.filter({ workflow_id: workflowId }, "-created_date")
  });

  const routingLearning = learnings.find(l => l.learning_type === "routing_pattern");
  const failureLearning = learnings.find(l => l.learning_type === "failure_pattern");
  const resourceLearning = learnings.find(l => l.learning_type === "resource_prediction");

  // Learn routing patterns
  const learnRoutingMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke("learnRoutingPatterns", {
        workflow_id: workflowId
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflowLearnings", workflowId] });
      toast.success("Routing patterns learned successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to learn routing patterns");
    }
  });

  // Analyze failures
  const analyzeFailuresMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke("analyzeWorkflowFailures", {
        workflow_id: workflowId
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflowLearnings", workflowId] });
      toast.success("Failure analysis completed");
    },
    onError: () => {
      toast.error("Failed to analyze failures");
    }
  });

  // Predict resources
  const predictResourcesMutation = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke("predictResourceNeeds", {
        workflow_id: workflowId,
        forecast_days: 7
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflowLearnings", workflowId] });
      toast.success("Resource prediction completed");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to predict resources");
    }
  });

  return (
    <Card className="glass-strong border border-white/20">
      <CardHeader>
        <CardTitle className="text-gray-100 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          AI Learning & Adaptation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="routing">Adaptive Routing</TabsTrigger>
            <TabsTrigger value="failures">Failure Analysis</TabsTrigger>
            <TabsTrigger value="resources">Resource Prediction</TabsTrigger>
          </TabsList>

          {/* Adaptive Routing */}
          <TabsContent value="routing" className="space-y-3">
            {!routingLearning ? (
              <div className="text-center py-8">
                <TrendingUp className="w-10 h-10 mx-auto mb-3 text-blue-400 opacity-60" />
                <p className="text-sm text-gray-400 mb-4">
                  Learn optimal routing patterns from successful executions
                </p>
                <Button
                  onClick={() => learnRoutingMutation.mutate()}
                  disabled={learnRoutingMutation.isPending}
                  className="gap-2"
                >
                  {learnRoutingMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Learning...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      Learn Routing Patterns
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-300">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active Learning
                    </Badge>
                    <span className="text-xs text-gray-400">
                      Confidence: {routingLearning.confidence_score?.toFixed(0)}%
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => learnRoutingMutation.mutate()}
                    disabled={learnRoutingMutation.isPending}
                    className="gap-1.5 h-7 text-xs"
                  >
                    <Zap className="w-3 h-3" />
                    Re-learn
                  </Button>
                </div>

                {routingLearning.pattern_data.routing_rules?.map((rule, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-100">Rule {index + 1}</span>
                      <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                        {rule.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-300 mb-1"><strong>Condition:</strong> {rule.condition}</p>
                    <p className="text-xs text-gray-300 mb-1"><strong>Assign to:</strong> {rule.recommended_assignee}</p>
                    <p className="text-xs text-gray-400">{rule.reasoning}</p>
                  </motion.div>
                ))}

                {routingLearning.pattern_data.performance_insights?.length > 0 && (
                  <div className="glass rounded-lg p-3 mt-3">
                    <div className="text-xs font-semibold text-gray-100 mb-2">Performance Insights</div>
                    <ul className="space-y-1">
                      {routingLearning.pattern_data.performance_insights.map((insight, i) => (
                        <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Failure Analysis */}
          <TabsContent value="failures" className="space-y-3">
            {!failureLearning ? (
              <div className="text-center py-8">
                <AlertCircle className="w-10 h-10 mx-auto mb-3 text-rose-400 opacity-60" />
                <p className="text-sm text-gray-400 mb-4">
                  Analyze workflow failures to identify root causes
                </p>
                <Button
                  onClick={() => analyzeFailuresMutation.mutate()}
                  disabled={analyzeFailuresMutation.isPending}
                  className="gap-2"
                >
                  {analyzeFailuresMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Analyze Failures
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400">
                    Analyzed {failureLearning.pattern_data.analyzed_failures} failures
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => analyzeFailuresMutation.mutate()}
                    disabled={analyzeFailuresMutation.isPending}
                    className="gap-1.5 h-7 text-xs"
                  >
                    <Zap className="w-3 h-3" />
                    Re-analyze
                  </Button>
                </div>

                {/* Root Causes */}
                {failureLearning.pattern_data.root_causes?.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-100 mb-2">Root Causes</div>
                    {failureLearning.pattern_data.root_causes.map((cause, index) => (
                      <div key={index} className="glass rounded-lg p-3 mb-2">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-100">{cause.cause}</span>
                          <Badge className={`text-xs ${
                            cause.severity === 'critical' ? 'bg-rose-500/20 text-rose-300' :
                            cause.severity === 'high' ? 'bg-orange-500/20 text-orange-300' :
                            'bg-amber-500/20 text-amber-300'
                          }`}>
                            {cause.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mb-1">Step: {cause.affected_step}</p>
                        <p className="text-xs text-gray-300">{cause.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Remediation Steps */}
                {failureLearning.pattern_data.remediation_steps?.length > 0 && (
                  <div className="glass rounded-lg p-3">
                    <div className="text-xs font-semibold text-gray-100 mb-2">Remediation Steps</div>
                    <ul className="space-y-2">
                      {failureLearning.pattern_data.remediation_steps.map((step, i) => (
                        <li key={i} className="text-xs">
                          <div className="flex items-start gap-2">
                            <Badge className={`text-xs shrink-0 ${
                              step.priority === 'critical' ? 'bg-rose-500/20 text-rose-300' :
                              step.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>
                              {step.priority}
                            </Badge>
                            <div>
                              <div className="text-gray-100 mb-0.5">{step.action}</div>
                              <div className="text-gray-400">{step.expected_impact}</div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Resource Prediction */}
          <TabsContent value="resources" className="space-y-3">
            {!resourceLearning ? (
              <div className="text-center py-8">
                <Users className="w-10 h-10 mx-auto mb-3 text-cyan-400 opacity-60" />
                <p className="text-sm text-gray-400 mb-4">
                  Predict resource needs for upcoming workflow executions
                </p>
                <Button
                  onClick={() => predictResourcesMutation.mutate()}
                  disabled={predictResourcesMutation.isPending}
                  className="gap-2"
                >
                  {predictResourcesMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Predicting...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      Predict Resources
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400">
                    Forecast: Next {resourceLearning.pattern_data.forecast_days} days
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => predictResourcesMutation.mutate()}
                    disabled={predictResourcesMutation.isPending}
                    className="gap-1.5 h-7 text-xs"
                  >
                    <Zap className="w-3 h-3" />
                    Update
                  </Button>
                </div>

                {/* Predictions */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="glass rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Expected Executions</div>
                    <div className="text-xl font-bold text-gray-100">
                      {resourceLearning.pattern_data.prediction.predicted_executions}
                    </div>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Required Users</div>
                    <div className="text-xl font-bold text-gray-100">
                      {resourceLearning.pattern_data.prediction.resource_requirements.required_users}
                    </div>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Person-Hours</div>
                    <div className="text-xl font-bold text-gray-100">
                      {resourceLearning.pattern_data.prediction.resource_requirements.person_hours_needed.toFixed(0)}
                    </div>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Peak Concurrent</div>
                    <div className="text-xl font-bold text-gray-100">
                      {resourceLearning.pattern_data.prediction.resource_requirements.peak_concurrent_workflows}
                    </div>
                  </div>
                </div>

                {/* Capacity Warnings */}
                {resourceLearning.pattern_data.prediction.capacity_warnings?.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-100 mb-2">Capacity Warnings</div>
                    {resourceLearning.pattern_data.prediction.capacity_warnings.map((warning, i) => (
                      <div key={i} className="glass rounded-lg p-3 mb-2 border border-amber-500/20">
                        <div className="flex items-start gap-2 mb-1">
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-xs text-gray-100 mb-0.5">{warning.warning}</div>
                            <div className="text-xs text-gray-400">{warning.recommendation}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Scaling Recommendations */}
                {resourceLearning.pattern_data.prediction.scaling_recommendations?.length > 0 && (
                  <div className="glass rounded-lg p-3">
                    <div className="text-xs font-semibold text-gray-100 mb-2">Scaling Recommendations</div>
                    <ul className="space-y-1">
                      {resourceLearning.pattern_data.prediction.scaling_recommendations.map((rec, i) => (
                        <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}