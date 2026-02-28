import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Domain-specific extraction schemas per document class
const DOMAIN_SCHEMAS = {
  contract: {
    label: "Contract",
    fields: [
      { field_name: "contract_title", data_type: "text", description: "Full title or name of the contract" },
      { field_name: "effective_date", data_type: "date", description: "Date the contract takes effect" },
      { field_name: "expiration_date", data_type: "date", description: "Date the contract expires" },
      { field_name: "renewal_date", data_type: "date", description: "Auto-renewal date or deadline to exercise renewal option", business_critical: true },
      { field_name: "renewal_terms", data_type: "text", description: "Terms and conditions for contract renewal (auto-renew, notice period, etc.)", business_critical: true },
      { field_name: "party_1", data_type: "text", description: "First party / client name", business_critical: true },
      { field_name: "party_2", data_type: "text", description: "Second party / vendor or service provider name", business_critical: true },
      { field_name: "key_personnel", data_type: "text", description: "Named individuals responsible for the agreement (signatories, account managers, legal contacts)", business_critical: true },
      { field_name: "contract_value", data_type: "currency", description: "Total contract value or annual contract value" },
      { field_name: "payment_schedule", data_type: "text", description: "When and how payments are made" },
      { field_name: "governing_law", data_type: "text", description: "Jurisdiction and governing law" },
      { field_name: "termination_clause", data_type: "text", description: "Conditions under which the contract can be terminated" },
      { field_name: "liability_cap", data_type: "currency", description: "Maximum liability amount stated in the contract" }
    ]
  },
  invoice: {
    label: "Invoice",
    fields: [
      { field_name: "invoice_number", data_type: "text", description: "Unique invoice identifier", business_critical: true },
      { field_name: "invoice_date", data_type: "date", description: "Date the invoice was issued" },
      { field_name: "due_date", data_type: "date", description: "Payment due date", business_critical: true },
      { field_name: "payment_terms", data_type: "text", description: "Payment terms (e.g. Net 30, Net 60, 2/10 Net 30)", business_critical: true },
      { field_name: "total_amount", data_type: "currency", description: "Total amount due including taxes", business_critical: true },
      { field_name: "subtotal", data_type: "currency", description: "Amount before taxes and fees" },
      { field_name: "tax_amount", data_type: "currency", description: "Tax charged" },
      { field_name: "vendor_name", data_type: "text", description: "Name of the company issuing the invoice" },
      { field_name: "vendor_address", data_type: "text", description: "Vendor's billing address" },
      { field_name: "customer_name", data_type: "text", description: "Name of the bill-to company or person" },
      { field_name: "purchase_order", data_type: "text", description: "Associated PO number if referenced" },
      { field_name: "line_items", data_type: "text", description: "Summary of goods or services billed" },
      { field_name: "bank_details", data_type: "text", description: "Payment account / bank details" }
    ]
  },
  agreement: {
    label: "Agreement",
    fields: [
      { field_name: "agreement_title", data_type: "text", description: "Title of the agreement" },
      { field_name: "effective_date", data_type: "date", description: "Date agreement becomes effective" },
      { field_name: "expiration_date", data_type: "date", description: "Expiration date of the agreement" },
      { field_name: "parties_involved", data_type: "text", description: "All parties named in the agreement", business_critical: true },
      { field_name: "key_personnel", data_type: "text", description: "Key individuals (signatories, representatives, witnesses)", business_critical: true },
      { field_name: "obligations", data_type: "text", description: "Core obligations of each party" },
      { field_name: "compensation", data_type: "currency", description: "Any compensation or fees mentioned" },
      { field_name: "confidentiality", data_type: "text", description: "Confidentiality and NDA terms" }
    ]
  },
  letter: {
    label: "Letter",
    fields: [
      { field_name: "sender", data_type: "text", description: "Sender name and organization" },
      { field_name: "recipient", data_type: "text", description: "Recipient name and organization", business_critical: true },
      { field_name: "date", data_type: "date", description: "Date of the letter" },
      { field_name: "subject", data_type: "text", description: "Subject line or purpose of the letter" },
      { field_name: "action_required", data_type: "text", description: "Any action or response requested from the recipient", business_critical: true },
      { field_name: "deadline", data_type: "date", description: "Any deadline mentioned in the letter" },
      { field_name: "reference_number", data_type: "text", description: "Reference or case number if mentioned" }
    ]
  },
  report: {
    label: "Report",
    fields: [
      { field_name: "report_title", data_type: "text", description: "Title of the report" },
      { field_name: "report_date", data_type: "date", description: "Date the report was produced" },
      { field_name: "author", data_type: "text", description: "Author(s) or organization that produced the report" },
      { field_name: "period_covered", data_type: "text", description: "Time period the report covers" },
      { field_name: "key_findings", data_type: "text", description: "Main findings or conclusions", business_critical: true },
      { field_name: "financial_highlights", data_type: "currency", description: "Key financial figures mentioned" },
      { field_name: "recommendations", data_type: "text", description: "Recommendations or next steps" }
    ]
  }
};

function getSchemaForClass(documentClass) {
  if (!documentClass) return null;
  const key = documentClass.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '');
  // Try exact match first, then substring match
  if (DOMAIN_SCHEMAS[key]) return DOMAIN_SCHEMAS[key];
  for (const [k, v] of Object.entries(DOMAIN_SCHEMAS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { document_id } = await req.json();
    if (!document_id) {
      return Response.json({ error: 'Missing document_id' }, { status: 400 });
    }

    const documents = await base44.entities.Document.list();
    const document = documents.find(d => d.id === document_id);
    if (!document) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    // Determine extraction schema: prefer domain-specific, fall back to template
    let fields = null;
    let instructions = '';
    const domainSchema = getSchemaForClass(document.document_class);

    if (domainSchema) {
      fields = domainSchema.fields;
      instructions = `Extract data specific to a ${domainSchema.label} document. Pay particular attention to dates, monetary amounts, and named individuals.`;
    } else {
      // Fall back to EntityExtractionTemplate
      const templates = await base44.entities.EntityExtractionTemplate.list();
      const template = templates.find(t => t.document_type === document.document_class);
      if (!template) {
        return Response.json({ error: `No extraction schema for document type: ${document.document_class}` }, { status: 400 });
      }
      fields = template.fields;
      instructions = template.instructions || '';
    }

    const fieldDescriptions = fields.map(f => {
      const crit = f.business_critical ? " [CRITICAL]" : "";
      return `- ${f.field_name} (${f.data_type})${crit}: ${f.description}`;
    }).join('\n');

    const extraction = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert document data extraction specialist. Extract the following fields from the document content below.
${instructions}

Document Class: ${document.document_class || 'Unknown'}
Document Content (first 3000 chars):
${document.extracted_text?.substring(0, 3000) || "(no text available)"}

Fields to Extract:
${fieldDescriptions}

For each field:
- Provide the exact extracted value as it appears in the document.
- Assign a confidence score 0-100.
- Note the approximate location in the document (e.g. "header", "section 3", "signature block").
- If the field is not found, set value to null and confidence to 0.
- For dates, standardize to ISO format (YYYY-MM-DD) when possible.
- For currencies, include the currency symbol/code and the numeric value.`,
      response_json_schema: {
        type: "object",
        properties: {
          entities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                value: { type: "string" },
                confidence: { type: "number" },
                source_region: { type: "string" },
                data_type: { type: "string" },
                business_critical: { type: "boolean" }
              }
            }
          },
          critical_fields_status: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                found: { type: "boolean" },
                confidence: { type: "number" }
              }
            }
          },
          extraction_notes: {
            type: "string",
            description: "Any general notes about the extraction quality or document legibility"
          }
        }
      }
    });

    const enrichedEntities = (extraction.entities || [])
      .filter(e => e.value && e.value !== 'null' && e.value !== '')
      .map(entity => ({
        ...entity,
        business_critical: fields.find(f => f.field_name === entity.field)?.business_critical || false,
        inferred: entity.confidence < 70
      }));

    await base44.asServiceRole.entities.Document.update(document_id, {
      extracted_entities: enrichedEntities
    });

    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: "document",
      entity_id: document_id,
      action: "update",
      user_email: user.email,
      timestamp: new Date().toISOString(),
      changes: {
        entities_extracted: enrichedEntities.length,
        critical_fields: extraction.critical_fields_status,
        schema_used: domainSchema?.label || 'template'
      }
    });

    return Response.json({
      success: true,
      extracted_entities: enrichedEntities,
      critical_fields_status: extraction.critical_fields_status,
      extraction_notes: extraction.extraction_notes
    });

  } catch (error) {
    console.error('Entity extraction error:', error);
    return Response.json({ error: 'Entity extraction failed', details: error.message }, { status: 500 });
  }
});