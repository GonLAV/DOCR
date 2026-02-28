import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Zap, Trash2, Edit2, Calendar, AlertTriangle, Mail, Tag, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import TriggerRuleForm from "@/components/triggers/TriggerRuleForm";

const ACTION_ICONS = { flag_for_review: AlertTriangle, send_email: Mail, add_tag: Tag, set_status: CheckCircle2 };
const ACTION_COLORS = { flag_for_review: "amber", send_email: "blue", add_tag: "violet", set_status: "emerald" };
const TRIGGER_LABELS = {
  date_approaching: "Date approaching",
  date_passed: "Date passed",
  field_present: "Field present",
  field_missing: "Field missing",
  value_matches: "Value matches"
};

const DEFAULT_RULES = [
  {
    name: "Flag invoices due in 7 days",
    description: "Flag any invoice whose due date is within 7 days for urgent review.",
    document_class: "invoice",
    trigger_field: "due_date",
    trigger_type: "date_approaching",
    days_threshold: 7,
    action_type: "flag_for_review",
    action_config: { review_note: "Invoice payment due within 7 days — action required." },
    enabled: true
  },
  {
    name: "Flag overdue invoices",
    description: "Flag invoices whose due date has already passed.",
    document_class: "invoice",
    trigger_field: "due_date",
    trigger_type: "date_passed",
    days_threshold: 0,
    action_type: "flag_for_review",
    action_config: { review_note: "Invoice is overdue — escalate to accounts payable." },
    enabled: true
  },
  {
    name: "Contract renewal approaching (30 days)",
    description: "Tag contracts whose renewal date is within 30 days.",
    document_class: "contract",
    trigger_field: "renewal_date",
    trigger_type: "date_approaching",
    days_threshold: 30,
    action_type: "add_tag",
    action_config: { tag: "renewal-pending" },
    enabled: true
  },
  {
    name: "Email on contract expiry (60 days)",
    description: "Send an email notification 60 days before a contract expires.",
    document_class: "contract",
    trigger_field: "expiration_date",
    trigger_type: "date_approaching",
    days_threshold: 60,
    action_type: "send_email",
    action_config: { email_subject: "[DocIntel] Contract expiring in 60 days" },
    enabled: true
  }
];

export default function TriggerRules() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null); // null | "new" | rule object

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["trigger-rules"],
    queryFn: () => base44.entities.DocumentTriggerRule.list("-created_date", 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DocumentTriggerRule.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["trigger-rules"] }); setEditing(null); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DocumentTriggerRule.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["trigger-rules"] }); setEditing(null); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DocumentTriggerRule.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trigger-rules"] })
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }) => base44.entities.DocumentTriggerRule.update(id, { enabled }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trigger-rules"] })
  });

  const handleSave = (form) => {
    if (editing === "new") createMutation.mutate(form);
    else updateMutation.mutate({ id: editing.id, data: form });
  };

  const handleSeedDefaults = async () => {
    for (const r of DEFAULT_RULES) {
      await base44.entities.DocumentTriggerRule.create(r);
    }
    qc.invalidateQueries({ queryKey: ["trigger-rules"] });
  };

  if (editing) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-100">{editing === "new" ? "New Trigger Rule" : `Edit: ${editing.name}`}</h1>
            <p className="text-sm text-gray-400">Configure when and how to automatically act on documents</p>
          </div>
        </div>
        <Card className="glass border-slate-700/30">
          <TriggerRuleForm rule={editing === "new" ? null : editing} onSave={handleSave} onCancel={() => setEditing(null)} />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-100">Trigger Rules</h1>
            <p className="text-sm text-gray-400">Auto-actions based on extracted document data</p>
          </div>
        </div>
        <div className="flex gap-2">
          {rules.length === 0 && (
            <Button variant="outline" size="sm" onClick={handleSeedDefaults}>Seed defaults</Button>
          )}
          <Button size="sm" onClick={() => setEditing("new")}>
            <Plus className="w-4 h-4 mr-1" /> New Rule
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Rules", value: rules.length, color: "blue" },
          { label: "Active", value: rules.filter(r => r.enabled !== false).length, color: "emerald" },
          { label: "Total Triggers Fired", value: rules.reduce((s, r) => s + (r.times_fired || 0), 0), color: "amber" }
        ].map(s => (
          <Card key={s.label} className="glass border-slate-700/30 p-4">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className={`text-2xl font-bold text-${s.color}-400 mt-1`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Rules list */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading rules…</div>
      ) : rules.length === 0 ? (
        <Card className="glass border-slate-700/30 p-12 text-center">
          <Zap className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <p className="text-gray-300 font-semibold mb-1">No trigger rules yet</p>
          <p className="text-sm text-gray-500 mb-4">Create rules to automatically flag documents, send emails, or add tags based on extracted data like renewal dates or payment terms.</p>
          <Button onClick={handleSeedDefaults} variant="outline">Load example rules</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules.map(rule => {
            const ActionIcon = ACTION_ICONS[rule.action_type] || Zap;
            const color = ACTION_COLORS[rule.action_type] || "slate";
            return (
              <Card key={rule.id} className={`glass border-slate-700/30 transition-all ${rule.enabled === false ? "opacity-50" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-8 h-8 rounded-lg bg-${color}-500/20 flex items-center justify-center shrink-0`}>
                      <ActionIcon className={`w-4 h-4 text-${color}-400`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-100">{rule.name}</p>
                        {rule.document_class && (
                          <Badge className="text-[10px] bg-slate-700 text-slate-300 border-slate-600">{rule.document_class}</Badge>
                        )}
                        <Badge className={`text-[10px] bg-${color}-500/20 text-${color}-300 border-${color}-500/30`}>
                          {rule.action_type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      {rule.description && <p className="text-xs text-gray-400 mt-0.5">{rule.description}</p>}
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {rule.trigger_field?.replace(/_/g, ' ')} — {TRIGGER_LABELS[rule.trigger_type] || rule.trigger_type}
                          {rule.days_threshold != null && ["date_approaching","date_passed"].includes(rule.trigger_type) && ` (${rule.days_threshold}d)`}
                        </span>
                        {rule.times_fired > 0 && (
                          <span className="flex items-center gap-1 text-amber-400">
                            <Zap className="w-3 h-3" /> Fired {rule.times_fired}×
                          </span>
                        )}
                        {rule.last_fired_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Last: {format(new Date(rule.last_fired_at), "MMM d, HH:mm")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        checked={rule.enabled !== false}
                        onCheckedChange={v => toggleMutation.mutate({ id: rule.id, enabled: v })}
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(rule)}>
                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteMutation.mutate(rule.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}