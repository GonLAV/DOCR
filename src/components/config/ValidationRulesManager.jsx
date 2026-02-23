import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tantml:react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Shield, Check, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function ValidationRulesManager({ documentType, validationRules }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [newRule, setNewRule] = useState({
    field_name: "",
    rule_type: "format",
    severity: "warning",
    rule_logic: {}
  });

  const queryClient = useQueryClient();

  const activeRules = validationRules.filter(r => r.field_name !== '_placeholder');

  const addRuleMutation = useMutation({
    mutationFn: async (ruleData) => {
      return await base44.entities.ValidationRule.create({
        rule_name: `${documentType}_${ruleData.field_name}_${ruleData.rule_type}_${Date.now()}`,
        document_type: documentType,
        field_name: ruleData.field_name,
        rule_type: ruleData.rule_type,
        rule_logic: ruleData.rule_logic,
        severity: ruleData.severity,
        confidence_penalty: ruleData.severity === 'error' ? 20 : 10,
        enabled: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['validation-rules']);
      toast.success("Validation rule added");
      setIsAdding(false);
      resetNewRule();
    }
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.ValidationRule.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['validation-rules']);
      toast.success("Rule updated");
      setEditingRule(null);
    }
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId) => {
      return await base44.entities.ValidationRule.delete(ruleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['validation-rules']);
      toast.success("Rule deleted");
    }
  });

  const toggleRuleMutation = useMutation({
    mutationFn: async ({ id, enabled }) => {
      return await base44.entities.ValidationRule.update(id, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['validation-rules']);
    }
  });

  const resetNewRule = () => {
    setNewRule({
      field_name: "",
      rule_type: "format",
      severity: "warning",
      rule_logic: {}
    });
  };

  const handleAddRule = () => {
    if (!newRule.field_name.trim()) {
      toast.error("Field name is required");
      return;
    }
    addRuleMutation.mutate(newRule);
  };

  const getRuleTypeIcon = (type) => {
    switch (type) {
      case 'format': return '📝';
      case 'range': return '📊';
      case 'cross_field': return '🔗';
      case 'semantic': return '🧠';
      case 'external_lookup': return '🌐';
      default: return '📋';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'bg-red-100 text-red-700 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="capitalize flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {documentType} - Validation Rules
          </span>
          <Badge variant="outline">{activeRules.length} rules</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Define validation rules to ensure data quality and catch errors during extraction.
        </p>

        {/* Existing Rules */}
        <div className="space-y-3">
          {activeRules.map((rule) => (
            <div
              key={rule.id}
              className={`p-4 rounded-lg border ${
                rule.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getRuleTypeIcon(rule.rule_type)}</span>
                    <h4 className="text-sm font-semibold text-slate-900">{rule.field_name}</h4>
                    <Badge variant="outline" className="text-xs capitalize">{rule.rule_type}</Badge>
                    <Badge className={`text-xs ${getSeverityColor(rule.severity)}`}>
                      {rule.severity}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1 ml-7">
                    {rule.rule_type === 'format' && rule.rule_logic?.pattern && (
                      <p>Pattern: <code className="bg-slate-100 px-1 rounded">{rule.rule_logic.pattern}</code></p>
                    )}
                    {rule.rule_type === 'range' && (
                      <p>
                        Range: {rule.rule_logic?.min ?? '-∞'} to {rule.rule_logic?.max ?? '∞'}
                      </p>
                    )}
                    {rule.rule_type === 'cross_field' && rule.rule_logic?.related_field && (
                      <p>Related to: {rule.rule_logic.related_field}</p>
                    )}
                    <p className="text-slate-500">Confidence penalty: -{rule.confidence_penalty}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleRuleMutation.mutate({ id: rule.id, enabled: !rule.enabled })}
                    className={rule.enabled ? 'text-green-600' : 'text-slate-400'}
                  >
                    {rule.enabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteRuleMutation.mutate(rule.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {activeRules.length === 0 && !isAdding && (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="text-sm">No validation rules defined</p>
              <p className="text-xs mt-1">Add rules to ensure data quality</p>
            </div>
          )}
        </div>

        {/* Add New Rule */}
        {isAdding ? (
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">
                    Field Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., invoice_total"
                    value={newRule.field_name}
                    onChange={(e) => setNewRule({ ...newRule, field_name: e.target.value })}
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">
                    Rule Type <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={newRule.rule_type}
                    onValueChange={(value) => setNewRule({ ...newRule, rule_type: value, rule_logic: {} })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="format">Format (Regex Pattern)</SelectItem>
                      <SelectItem value="range">Range (Min/Max)</SelectItem>
                      <SelectItem value="cross_field">Cross-Field Validation</SelectItem>
                      <SelectItem value="semantic">Semantic (AI-based)</SelectItem>
                      <SelectItem value="external_lookup">External Lookup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Rule-specific inputs */}
              {newRule.rule_type === 'format' && (
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">
                    Regex Pattern <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., ^[A-Z]{2}\d{6}$"
                    value={newRule.rule_logic.pattern || ''}
                    onChange={(e) => setNewRule({ 
                      ...newRule, 
                      rule_logic: { ...newRule.rule_logic, pattern: e.target.value }
                    })}
                    className="text-sm font-mono"
                  />
                  <p className="text-xs text-slate-500 mt-1">JavaScript regex pattern</p>
                </div>
              )}

              {newRule.rule_type === 'range' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Min Value</label>
                    <Input
                      type="number"
                      placeholder="Optional"
                      value={newRule.rule_logic.min || ''}
                      onChange={(e) => setNewRule({ 
                        ...newRule, 
                        rule_logic: { ...newRule.rule_logic, min: parseFloat(e.target.value) }
                      })}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Max Value</label>
                    <Input
                      type="number"
                      placeholder="Optional"
                      value={newRule.rule_logic.max || ''}
                      onChange={(e) => setNewRule({ 
                        ...newRule, 
                        rule_logic: { ...newRule.rule_logic, max: parseFloat(e.target.value) }
                      })}
                      className="text-sm"
                    />
                  </div>
                </div>
              )}

              {newRule.rule_type === 'cross_field' && (
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">
                    Related Field <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., start_date"
                    value={newRule.rule_logic.related_field || ''}
                    onChange={(e) => setNewRule({ 
                      ...newRule, 
                      rule_logic: { ...newRule.rule_logic, related_field: e.target.value }
                    })}
                    className="text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">Field to validate against</p>
                </div>
              )}

              {newRule.rule_type === 'semantic' && (
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">
                    Validation Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Describe what should be validated semantically"
                    value={newRule.rule_logic.description || ''}
                    onChange={(e) => setNewRule({ 
                      ...newRule, 
                      rule_logic: { ...newRule.rule_logic, description: e.target.value }
                    })}
                    className="text-sm h-20"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">
                  Severity <span className="text-red-500">*</span>
                </label>
                <Select
                  value={newRule.severity}
                  onValueChange={(value) => setNewRule({ ...newRule, severity: value })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="error">Error (Blocks approval)</SelectItem>
                    <SelectItem value="warning">Warning (Reduces confidence)</SelectItem>
                    <SelectItem value="info">Info (For reference)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleAddRule}
                  disabled={!newRule.field_name.trim()}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    resetNewRule();
                  }}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            onClick={() => setIsAdding(true)}
            variant="outline"
            className="w-full border-dashed border-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Validation Rule
          </Button>
        )}
      </CardContent>
    </Card>
  );
}