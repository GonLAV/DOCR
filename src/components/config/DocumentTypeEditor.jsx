import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function DocumentTypeEditor({ documentType, validationRules }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [newField, setNewField] = useState({
    field_name: "",
    data_type: "string",
    required: false,
    description: ""
  });

  const queryClient = useQueryClient();

  // Get unique fields from validation rules
  const fields = React.useMemo(() => {
    const fieldMap = new Map();
    validationRules.forEach(rule => {
      if (rule.field_name !== '_placeholder') {
        if (!fieldMap.has(rule.field_name)) {
          fieldMap.set(rule.field_name, {
            field_name: rule.field_name,
            rules: []
          });
        }
        fieldMap.get(rule.field_name).rules.push(rule);
      }
    });
    return Array.from(fieldMap.values());
  }, [validationRules]);

  const addFieldMutation = useMutation({
    mutationFn: async (fieldData) => {
      // Create a basic validation rule for the field
      const ruleLogic = {};
      
      if (fieldData.data_type === 'number') {
        ruleLogic.type = 'number';
      } else if (fieldData.data_type === 'date') {
        ruleLogic.pattern = '^\\d{4}-\\d{2}-\\d{2}$';
      } else if (fieldData.data_type === 'email') {
        ruleLogic.pattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
      }

      return await base44.entities.ValidationRule.create({
        rule_name: `${documentType}_${fieldData.field_name}_type`,
        document_type: documentType,
        field_name: fieldData.field_name,
        rule_type: fieldData.data_type === 'number' ? 'range' : 'format',
        rule_logic: ruleLogic,
        severity: fieldData.required ? 'error' : 'warning',
        confidence_penalty: fieldData.required ? 20 : 10,
        enabled: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['validation-rules']);
      toast.success("Field added successfully");
      setIsAdding(false);
      setNewField({ field_name: "", data_type: "string", required: false, description: "" });
    }
  });

  const deleteFieldMutation = useMutation({
    mutationFn: async (fieldName) => {
      // Delete all validation rules for this field
      const rulesToDelete = validationRules.filter(r => r.field_name === fieldName);
      for (const rule of rulesToDelete) {
        await base44.entities.ValidationRule.delete(rule.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['validation-rules']);
      toast.success("Field deleted");
    }
  });

  const handleAddField = () => {
    if (!newField.field_name.trim()) {
      toast.error("Field name is required");
      return;
    }
    addFieldMutation.mutate(newField);
  };

  const getDataTypeFromRules = (rules) => {
    if (rules.some(r => r.rule_type === 'range')) return 'number';
    if (rules.some(r => r.rule_logic?.pattern?.includes('\\d{4}-\\d{2}-\\d{2}'))) return 'date';
    if (rules.some(r => r.rule_logic?.pattern?.includes('@'))) return 'email';
    return 'string';
  };

  const isRequired = (rules) => {
    return rules.some(r => r.severity === 'error');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="capitalize">
            {documentType} - Extraction Fields
          </span>
          <Badge variant="outline">{fields.length} fields</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Define which fields should be extracted from {documentType} documents and their expected data types.
        </p>

        {/* Existing Fields */}
        <div className="space-y-2">
          {fields.map((field, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-semibold text-slate-900">{field.field_name}</h4>
                    <Badge variant="outline" className="text-xs capitalize">
                      {getDataTypeFromRules(field.rules)}
                    </Badge>
                    {isRequired(field.rules) && (
                      <Badge className="text-xs bg-red-100 text-red-700">Required</Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>{field.rules.length} validation rule{field.rules.length !== 1 ? 's' : ''} configured</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteFieldMutation.mutate(field.field_name)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {fields.length === 0 && !isAdding && (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
              <p className="text-sm">No fields defined yet</p>
              <p className="text-xs mt-1">Add your first extraction field below</p>
            </div>
          )}
        </div>

        {/* Add New Field */}
        {isAdding ? (
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">
                    Field Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., invoice_number, contract_date"
                    value={newField.field_name}
                    onChange={(e) => setNewField({ ...newField, field_name: e.target.value })}
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">
                    Data Type <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={newField.data_type}
                    onValueChange={(value) => setNewField({ ...newField, data_type: value })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">Text (String)</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="boolean">Boolean (Yes/No)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">
                  Description (Optional)
                </label>
                <Input
                  placeholder="Brief description of this field"
                  value={newField.description}
                  onChange={(e) => setNewField({ ...newField, description: e.target.value })}
                  className="text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={newField.required}
                  onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="required" className="text-sm text-slate-700 cursor-pointer">
                  This field is required
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleAddField}
                  disabled={!newField.field_name.trim()}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewField({ field_name: "", data_type: "string", required: false, description: "" });
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
            Add Extraction Field
          </Button>
        )}
      </CardContent>
    </Card>
  );
}