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

    // Gather all trust factors
    const consensusData = document.structured_data?.ocr_consensus || {};
    const corrections = await base44.entities.Correction.filter({ document_id });
    
    // 1. Extraction Certainty (OCR confidence)
    const extractionCertainty = document.confidence_score || 0;

    // 2. Reconstruction Risk (% of AI-inferred content)
    const reconstructionRisk = consensusData.reconstruction_percentage || 0;

    // 3. Model Consensus Score
    const modelConsensusScore = consensusData.overall_consensus_score || 0;

    // 4. Pixel Quality Score (based on scan quality)
    const pixelQualityScore = document.scan_metadata?.estimated_dpi 
      ? Math.min((document.scan_metadata.estimated_dpi / 300) * 100, 100)
      : 70;

    // 5. Validation Pass Rate
    const validationResponse = await base44.functions.invoke('applyValidationRules', {
      document_id
    });
    const validationPassRate = validationResponse.data?.pass_rate || 100;

    // 6. Semantic Coherence (check for contradictions)
    const semanticCoherence = document.anomalies?.length 
      ? Math.max(0, 100 - (document.anomalies.length * 5))
      : 100;

    // 7. Human Correction Count
    const humanCorrectionCount = corrections.length;

    // 8. Cross-Document Verification (placeholder for future implementation)
    const crossDocumentVerification = 85; // Default when not implemented

    // Calculate weighted overall trust score
    const weights = {
      extraction: 0.25,
      reconstruction: 0.15,
      consensus: 0.20,
      quality: 0.10,
      validation: 0.15,
      semantic: 0.10,
      corrections: 0.05
    };

    const overallTrust = 
      (extractionCertainty * weights.extraction) +
      ((100 - reconstructionRisk) * weights.reconstruction) +
      (modelConsensusScore * weights.consensus) +
      (pixelQualityScore * weights.quality) +
      (validationPassRate * weights.validation) +
      (semanticCoherence * weights.semantic) +
      ((100 - Math.min(humanCorrectionCount * 5, 50)) * weights.corrections);

    // Determine readiness levels
    const courtReady = overallTrust >= 95 && reconstructionRisk < 10 && document.tampering_risk === 'none';
    const bankReady = overallTrust >= 98 && reconstructionRisk < 5 && document.tampering_risk === 'none';

    // Identify high-risk fields
    const highRiskFields = document.extracted_entities
      ?.filter(e => e.confidence < 80)
      .map(e => e.field) || [];

    // Recommended action
    let recommendedAction;
    if (overallTrust >= 95) {
      recommendedAction = 'approve';
    } else if (overallTrust >= 80) {
      recommendedAction = 'review_flagged_fields';
    } else if (overallTrust >= 60) {
      recommendedAction = 'manual_review';
    } else {
      recommendedAction = 'reject';
    }

    // Create or update TrustScore entity
    const existingScores = await base44.entities.TrustScore.filter({ document_id });
    
    const trustScoreData = {
      document_id,
      overall_trust: Math.round(overallTrust),
      extraction_certainty: Math.round(extractionCertainty),
      reconstruction_risk: Math.round(reconstructionRisk),
      validation_pass_rate: Math.round(validationPassRate),
      model_consensus_score: Math.round(modelConsensusScore),
      pixel_quality_score: Math.round(pixelQualityScore),
      semantic_coherence: Math.round(semanticCoherence),
      cross_document_verification: Math.round(crossDocumentVerification),
      human_correction_count: humanCorrectionCount,
      high_risk_fields: highRiskFields,
      court_ready: courtReady,
      bank_ready: bankReady,
      trust_factors: {
        weights,
        scores: {
          extraction: extractionCertainty,
          reconstruction: 100 - reconstructionRisk,
          consensus: modelConsensusScore,
          quality: pixelQualityScore,
          validation: validationPassRate,
          semantic: semanticCoherence
        }
      },
      recommended_action: recommendedAction
    };

    let trustScore;
    if (existingScores.length > 0) {
      trustScore = await base44.asServiceRole.entities.TrustScore.update(
        existingScores[0].id,
        trustScoreData
      );
    } else {
      trustScore = await base44.asServiceRole.entities.TrustScore.create(trustScoreData);
    }

    return Response.json({
      success: true,
      trust_score: trustScore
    });

  } catch (error) {
    console.error('Trust score calculation error:', error);
    return Response.json({ 
      error: 'Trust score calculation failed', 
      details: error.message 
    }, { status: 500 });
  }
});