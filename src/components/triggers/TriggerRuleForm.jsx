import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const DOCUMENT_CLASSES = ["", "contract", "invoice", "agreement", "letter", "report", "form"];
const TRIGGER_FIELDS = [
  { value: "renewal_date", label: "Renewal Date" },
  { value: "due_date", label: "Due Date" },
  { value: "expiration_date", label: "Expiration Date" },
  { value: "effective_date", label: "Effective Date" },
  { value: "payment_terms", label: "Payment Terms" },
  { value: "total_amount", label: "Total Amount" },
  { value: "key_personnel", label: "Key Personnel" },
  { value: "party_1", label: "Party 1" },
  { value: "party_2", label: "Party 2" },
  { value: "invoice_number", label: "Invoice Number" },
  { value: "vendor_name", label: "Vendor Name" },
  { value: "contract_value", label: "Contract Value" },
];
const TRIGGER_TYPES = [
  { value: "date_approaching", label: "Date is approaching" },
  { value: "date_passed", label: "Date has passed" },
  { value: "field_present", label: "Field is present" },
  { value: "field_missing", label: "Field is missing" },
  { value: "value_matches", label: "Value contains text" },
];
const ACTION_TYPES = [
  { value: "flag_for_review", label: "Flag for review (add 'needs-review' tag + note)" },
  { value: "send_email", label: "Send email notification" },
  { value: "add_tag", label: "Add a tag" },
];

const EMPTY = {
  name: "", description: "", document_class: "", trigger_field: "due_date",
  trigger_type: "date_approaching", days_threshold: 30, match_value: "",
  action_type: "flag_for_review", action_config: {}, enabled: true
};

export default function TriggerRuleForm({ rule, onSave, onCancel }) {
  const [form, setForm] = useState(rule ? { ...rule } : { ...EMPTY });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setAC = (key, val) => setForm(f => ({ ...f, action_config: { ...f.action_config, [key]: val } }));

  const needsDays = ["date_approaching", "date_passed"].includes(form.trigger_type);
  const needsMatch = form.trigger_type === "value_matches";

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="text-xs text-slate-500 mb-1 block">Rule Name *</Label>
          <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Flag invoice due in 7 days" />
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-slate-500 mb-1 block">Description</Label>
          <Textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="What does this rule do?" className="h-16 text-xs" />
        </div>

        {/* Condition */}
        <div>
          <Label className="text-xs text-slate-500 mb-1 block">Document Class (optional)</Label>
          <Select value={form.document_class || ""} onValueChange={v => set("document_class", v)}>
            <SelectTrigger><SelectValue placeholder="All classes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All classes</SelectItem>
              {DOCUMENT_CLASSES.filter(Boolean).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-slate-500 mb-1 block">Trigger Field *</Label>
          <Select value={form.trigger_field} onValueChange={v => set("trigger_field", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TRIGGER_FIELDS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-slate-500 mb-1 block">Trigger Type *</Label>
          <Select value={form.trigger_type} onValueChange={v => set("trigger_type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TRIGGER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {needsDays && (
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Days Threshold</Label>
            <Input type="number" value={form.days_threshold ?? 30} onChange={e => set("days_threshold", Number(e.target.value))} min={0} />
          </div>
        )}
        {needsMatch && (
          <div className="col-span-2">
            <Label className="text-xs text-slate-500 mb-1 block">Match Value (contains)</Label>
            <Input value={form.match_value || ""} onChange={e => set("match_value", e.target.value)} placeholder="e.g. Net 60" />
          </div>
        )}
      </div>

      {/* Action */}
      <div className="border-t border-slate-100 pt-3 space-y-3">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Action</p>
        <div>
          <Label className="text-xs text-slate-500 mb-1 block">Action Type *</Label>
          <Select value={form.action_type} onValueChange={v => set("action_type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ACTION_TYPES.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {form.action_type === "flag_for_review" && (
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Review Note (optional)</Label>
            <Input value={form.action_config?.review_note || ""} onChange={e => setAC("review_note", e.target.value)} placeholder="Note to add on the document" />
          </div>
        )}
        {form.action_type === "send_email" && (
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">Email Recipient</Label>
              <Input value={form.action_config?.email_recipient || ""} onChange={e => setAC("email_recipient", e.target.value)} placeholder="user@company.com (blank = document owner)" />
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1 block">Email Subject (optional)</Label>
              <Input value={form.action_config?.email_subject || ""} onChange={e => setAC("email_subject", e.target.value)} placeholder="[DocIntel] Action Required..." />
            </div>
          </div>
        )}
        {form.action_type === "add_tag" && (
          <div>
            <Label className="text-xs text-slate-500 mb-1 block">Tag to Add</Label>
            <Input value={form.action_config?.tag || ""} onChange={e => setAC("tag", e.target.value)} placeholder="e.g. renewal-pending" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Switch checked={form.enabled !== false} onCheckedChange={v => set("enabled", v)} />
          <Label className="text-xs text-slate-500">Enabled</Label>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" onClick={() => onSave(form)} disabled={!form.name || !form.trigger_field}>Save Rule</Button>
        </div>
      </div>
    </div>
  );
}