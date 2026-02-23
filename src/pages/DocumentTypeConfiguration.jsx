import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Plus, Trash2, Edit, Shield, FileType } from "lucide-react";
import { toast } from "sonner";
import DocumentTypeEditor from "@/components/config/DocumentTypeEditor";
import ValidationRulesManager from "@/components/config/ValidationRulesManager";

export default function DocumentTypeConfiguration() {
  const [user, setUser] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [isAddingType, setIsAddingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  const queryClient = useQueryClient();

  // Check if user is admin
  React.useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  // Get all document types (from existing documents and validation rules)
  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list()
  });

  const { data: validationRules = [] } = useQuery({
    queryKey: ['validation-rules'],
    queryFn: () => base44.entities.ValidationRule.list()
  });

  // Extract unique document types
  const documentTypes = React.useMemo(() => {
    const types = new Set();
    documents.forEach(doc => {
      if (doc.document_class) types.add(doc.document_class);
    });
    validationRules.forEach(rule => {
      if (rule.document_type) types.add(rule.document_type);
    });
    return Array.from(types).sort();
  }, [documents, validationRules]);

  const addDocumentTypeMutation = useMutation({
    mutationFn: async (typeName) => {
      // Create a placeholder validation rule to register the document type
      return await base44.entities.ValidationRule.create({
        rule_name: `${typeName}_placeholder`,
        document_type: typeName,
        field_name: "_placeholder",
        rule_type: "format",
        rule_logic: { description: "Placeholder rule for document type registration" },
        severity: "info",
        enabled: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['validation-rules']);
      toast.success("Document type added");
      setIsAddingType(false);
      setNewTypeName("");
    }
  });

  const handleAddType = () => {
    if (!newTypeName.trim()) return;
    addDocumentTypeMutation.mutate(newTypeName.trim().toLowerCase());
  };

  if (!user) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-slate-200">
          <Shield className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12 bg-red-50 rounded-xl border-2 border-red-200">
          <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Admin Access Required</h2>
          <p className="text-red-700">You must be an administrator to access document type configuration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            Document Type Configuration
          </h1>
          <p className="text-slate-600 mt-1">
            Define custom extraction fields and validation rules for each document type
          </p>
        </div>
        <Badge className="bg-blue-100 text-blue-700">
          <Shield className="w-3 h-3 mr-1" />
          Admin Only
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Document Types Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileType className="w-4 h-4" />
              Document Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {documentTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedDocType(type)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedDocType === type
                    ? 'bg-blue-100 text-blue-900 font-semibold border-2 border-blue-300'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="capitalize">{type}</span>
                  <Badge variant="outline" className="text-xs">
                    {validationRules.filter(r => r.document_type === type && r.field_name !== '_placeholder').length}
                  </Badge>
                </div>
              </button>
            ))}

            {/* Add New Type */}
            {isAddingType ? (
              <div className="space-y-2 p-2 bg-slate-50 rounded-lg border border-slate-300">
                <Input
                  placeholder="e.g., contract, invoice"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddType()}
                  className="text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddType}
                    disabled={!newTypeName.trim()}
                    className="flex-1 h-7"
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsAddingType(false);
                      setNewTypeName("");
                    }}
                    className="flex-1 h-7"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddingType(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Type
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Main Configuration Area */}
        <div className="lg:col-span-3">
          {!selectedDocType ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileType className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500">Select a document type to configure fields and validation rules</p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="fields" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="fields">Extraction Fields</TabsTrigger>
                <TabsTrigger value="rules">Validation Rules</TabsTrigger>
              </TabsList>

              <TabsContent value="fields">
                <DocumentTypeEditor 
                  documentType={selectedDocType}
                  validationRules={validationRules.filter(r => r.document_type === selectedDocType)}
                />
              </TabsContent>

              <TabsContent value="rules">
                <ValidationRulesManager 
                  documentType={selectedDocType}
                  validationRules={validationRules.filter(r => r.document_type === selectedDocType)}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}