import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, X, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function ExternalSourceForm({ source, onSave, onCancel }) {
  const [formData, setFormData] = useState(source || {
    name: "",
    description: "",
    source_type: "rest_api",
    endpoint_url: "",
    auth_type: "none",
    auth_credentials: {},
    query_template: {
      method: "GET",
      headers: {},
      query_params: {}
    },
    field_mappings: [],
    verification_rules: [],
    rate_limit: {},
    enabled: true
  });

  const [newFieldMapping, setNewFieldMapping] = useState({ document_field: "", external_field: "", required: false });
  const [newRule, setNewRule] = useState({ field: "", comparison: "exact_match", severity: "warning" });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const addFieldMapping = () => {
    if (newFieldMapping.document_field && newFieldMapping.external_field) {
      setFormData({
        ...formData,
        field_mappings: [...(formData.field_mappings || []), { ...newFieldMapping }]
      });
      setNewFieldMapping({ document_field: "", external_field: "", required: false });
    }
  };

  const removeFieldMapping = (index) => {
    setFormData({
      ...formData,
      field_mappings: formData.field_mappings.filter((_, i) => i !== index)
    });
  };

  const addVerificationRule = () => {
    if (newRule.field) {
      setFormData({
        ...formData,
        verification_rules: [...(formData.verification_rules || []), { ...newRule }]
      });
      setNewRule({ field: "", comparison: "exact_match", severity: "warning" });
    }
  };

  const removeVerificationRule = (index) => {
    setFormData({
      ...formData,
      verification_rules: formData.verification_rules.filter((_, i) => i !== index)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="glass-strong">
          <CardHeader>
            <CardTitle className="text-white">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300">Source Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Public Company Registry"
                required
                className="glass"
              />
            </div>

            <div>
              <Label className="text-gray-300">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What data does this source provide?"
                className="glass"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Source Type *</Label>
                <Select value={formData.source_type} onValueChange={(value) => setFormData({ ...formData, source_type: value })}>
                  <SelectTrigger className="glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rest_api">REST API</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="public_records">Public Records</SelectItem>
                    <SelectItem value="industry_database">Industry Database</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Authentication *</Label>
                <Select value={formData.auth_type} onValueChange={(value) => setFormData({ ...formData, auth_type: value })}>
                  <SelectTrigger className="glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="api_key">API Key</SelectItem>
                    <SelectItem value="bearer_token">Bearer Token</SelectItem>
                    <SelectItem value="basic_auth">Basic Auth</SelectItem>
                    <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Endpoint URL *</Label>
              <Input
                value={formData.endpoint_url}
                onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
                placeholder="https://api.example.com/v1/verify"
                required
                className="glass"
              />
            </div>

            {/* Auth Credentials */}
            {formData.auth_type !== "none" && (
              <div className="glass rounded-xl p-4 space-y-3">
                <Label className="text-gray-300">Authentication Credentials</Label>
                {formData.auth_type === "api_key" && (
                  <Input
                    type="password"
                    placeholder="API Key"
                    value={formData.auth_credentials?.api_key || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      auth_credentials: { ...formData.auth_credentials, api_key: e.target.value }
                    })}
                    className="glass"
                  />
                )}
                {formData.auth_type === "bearer_token" && (
                  <Input
                    type="password"
                    placeholder="Bearer Token"
                    value={formData.auth_credentials?.token || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      auth_credentials: { ...formData.auth_credentials, token: e.target.value }
                    })}
                    className="glass"
                  />
                )}
                {formData.auth_type === "basic_auth" && (
                  <>
                    <Input
                      placeholder="Username"
                      value={formData.auth_credentials?.username || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        auth_credentials: { ...formData.auth_credentials, username: e.target.value }
                      })}
                      className="glass"
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={formData.auth_credentials?.password || ""}
                      onChange={(e) => setFormData({
                        ...formData,
                        auth_credentials: { ...formData.auth_credentials, password: e.target.value }
                      })}
                      className="glass"
                    />
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Field Mappings */}
        <Card className="glass-strong">
          <CardHeader>
            <CardTitle className="text-white">Field Mappings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Document Field"
                value={newFieldMapping.document_field}
                onChange={(e) => setNewFieldMapping({ ...newFieldMapping, document_field: e.target.value })}
                className="glass"
              />
              <Input
                placeholder="External Field"
                value={newFieldMapping.external_field}
                onChange={(e) => setNewFieldMapping({ ...newFieldMapping, external_field: e.target.value })}
                className="glass"
              />
            </div>
            <Button type="button" onClick={addFieldMapping} variant="outline" className="w-full glass">
              <Plus className="w-4 h-4 mr-2" />
              Add Mapping
            </Button>

            {formData.field_mappings && formData.field_mappings.length > 0 && (
              <div className="space-y-2">
                {formData.field_mappings.map((mapping, idx) => (
                  <div key={idx} className="flex items-center justify-between glass rounded-xl p-3">
                    <span className="text-sm text-gray-300">
                      {mapping.document_field} → {mapping.external_field}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFieldMapping(idx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Rules */}
        <Card className="glass-strong">
          <CardHeader>
            <CardTitle className="text-white">Verification Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Input
                placeholder="Field Name"
                value={newRule.field}
                onChange={(e) => setNewRule({ ...newRule, field: e.target.value })}
                className="glass"
              />
              <Select value={newRule.comparison} onValueChange={(value) => setNewRule({ ...newRule, comparison: value })}>
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exact_match">Exact Match</SelectItem>
                  <SelectItem value="fuzzy_match">Fuzzy Match</SelectItem>
                  <SelectItem value="range">Range</SelectItem>
                  <SelectItem value="exists">Exists</SelectItem>
                  <SelectItem value="not_exists">Not Exists</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newRule.severity} onValueChange={(value) => setNewRule({ ...newRule, severity: value })}>
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="button" onClick={addVerificationRule} variant="outline" className="w-full glass">
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>

            {formData.verification_rules && formData.verification_rules.length > 0 && (
              <div className="space-y-2">
                {formData.verification_rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center justify-between glass rounded-xl p-3">
                    <span className="text-sm text-gray-300">
                      {rule.field}: {rule.comparison} ({rule.severity})
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVerificationRule(idx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} className="glass">
            Cancel
          </Button>
          <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
            <Save className="w-4 h-4 mr-2" />
            Save Source
          </Button>
        </div>
      </form>
    </motion.div>
  );
}