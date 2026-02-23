import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Database, Globe, Shield, Activity, Pencil, Trash2, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const sourceIcons = {
  rest_api: Globe,
  database: Database,
  public_records: Shield,
  industry_database: Activity
};

export default function ExternalSourceCard({ source, onEdit, onDelete, onToggle }) {
  const Icon = sourceIcons[source.source_type] || Database;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="glass-strong hover-lift">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                source.enabled ? 'from-emerald-500 to-teal-500' : 'from-gray-500 to-slate-500'
              } flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">{source.name}</CardTitle>
                <CardDescription className="text-gray-400">{source.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={source.enabled}
                onCheckedChange={() => onToggle(source)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Source Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">Source Type</div>
                <Badge variant="outline" className="text-cyan-300 border-cyan-300/30">
                  {source.source_type.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Auth Method</div>
                <Badge variant="outline" className="text-purple-300 border-purple-300/30">
                  {source.auth_type.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Statistics */}
            <div className="glass rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <TrendingUp className="w-4 h-4" />
                  <span>Success Rate</span>
                </div>
                <span className="text-white font-semibold">
                  {source.success_rate ? `${source.success_rate.toFixed(1)}%` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Clock className="w-4 h-4" />
                  <span>Avg Response</span>
                </div>
                <span className="text-white font-semibold">
                  {source.average_response_time ? `${source.average_response_time.toFixed(0)}ms` : 'N/A'}
                </span>
              </div>
              {source.last_used && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-300">Last Used</div>
                  <span className="text-white text-sm">
                    {new Date(source.last_used).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Field Mappings */}
            {source.field_mappings && source.field_mappings.length > 0 && (
              <div>
                <div className="text-xs text-gray-400 mb-2">Field Mappings</div>
                <div className="flex flex-wrap gap-2">
                  {source.field_mappings.slice(0, 3).map((mapping, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs text-gray-300">
                      {mapping.document_field} → {mapping.external_field}
                    </Badge>
                  ))}
                  {source.field_mappings.length > 3 && (
                    <Badge variant="outline" className="text-xs text-gray-400">
                      +{source.field_mappings.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Verification Rules Count */}
            {source.verification_rules && source.verification_rules.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>{source.verification_rules.length} verification rules configured</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(source)}
                className="flex-1 glass hover:glass-strong"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(source)}
                className="glass hover:glass-strong text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}