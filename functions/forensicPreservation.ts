import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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

    if (!document.original_file_url) {
      return Response.json({ error: 'No file URL available' }, { status: 400 });
    }

    // Fetch the original file
    const fileResponse = await fetch(document.original_file_url);
    const fileBlob = await fileResponse.blob();
    const arrayBuffer = await fileBlob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Generate SHA-256 fingerprint
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha256Hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Simulate perceptual hash (pHash) - simplified version
    // In production, use a proper image hashing library
    const pHash = `pHash_${sha256Hash.substring(0, 16)}`;

    // Analyze metadata and tampering indicators using Vision AI
    const forensicAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Perform forensic analysis on this document image for legal preservation:

Analyze:
1. Visual tampering indicators (inconsistent lighting, editing artifacts, clone stamps)
2. Scan quality metrics (DPI estimation, compression artifacts, noise patterns)
3. Document authenticity markers (watermarks, seals, stamps integrity)
4. Degradation assessment (age estimation, damage patterns)
5. Metadata integrity (if visible EXIF data)

Provide forensic-grade analysis suitable for legal proceedings.`,
      response_json_schema: {
        type: "object",
        properties: {
          tampering_risk: {
            type: "string",
            enum: ["none", "low", "medium", "high"],
            description: "Overall tampering risk assessment"
          },
          tampering_indicators: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                location: { type: "string" },
                confidence: { type: "number" },
                description: { type: "string" }
              }
            }
          },
          scan_metadata: {
            type: "object",
            properties: {
              estimated_dpi: { type: "number" },
              color_space: { type: "string" },
              compression_quality: { type: "string" },
              scanner_type: { type: "string" }
            }
          },
          authenticity_markers: {
            type: "object",
            properties: {
              has_watermark: { type: "boolean" },
              has_seal: { type: "boolean" },
              seal_integrity: { type: "string" }
            }
          },
          degradation_assessment: {
            type: "object",
            properties: {
              estimated_age_years: { type: "number" },
              condition: { type: "string" },
              damage_types: {
                type: "array",
                items: { type: "string" }
              }
            }
          },
          forensic_integrity_score: {
            type: "number",
            description: "0-100 score for legal admissibility"
          }
        }
      },
      file_urls: document.original_file_url
    });

    // Update document with forensic data
    await base44.asServiceRole.entities.Document.update(document_id, {
      fingerprint: `SHA256:${sha256Hash}|pHash:${pHash}`,
      tampering_risk: forensicAnalysis.tampering_risk,
      scan_metadata: forensicAnalysis.scan_metadata,
      damage_assessment: {
        overall_condition: forensicAnalysis.degradation_assessment.condition,
        detected_issues: forensicAnalysis.degradation_assessment.damage_types || [],
        severity: forensicAnalysis.degradation_assessment.condition === 'poor' ? 'high' : 'low'
      },
      degradation_estimate: {
        estimated_age: forensicAnalysis.degradation_assessment.estimated_age_years,
        causes: forensicAnalysis.degradation_assessment.damage_types || [],
        severity: forensicAnalysis.degradation_assessment.condition
      }
    });

    // Create version record
    await base44.functions.invoke('createDocumentVersion', {
      document_id,
      change_type: 'created',
      change_description: 'Forensic preservation completed'
    });

    return Response.json({
      success: true,
      forensic_data: {
        sha256_fingerprint: sha256Hash,
        perceptual_hash: pHash,
        tampering_risk: forensicAnalysis.tampering_risk,
        forensic_integrity_score: forensicAnalysis.forensic_integrity_score,
        analysis: forensicAnalysis
      }
    });

  } catch (error) {
    console.error('Forensic preservation error:', error);
    return Response.json({ 
      error: 'Forensic preservation failed', 
      details: error.message 
    }, { status: 500 });
  }
});