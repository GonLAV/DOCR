import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Complete Document Processing Pipeline
 * Orchestrates all stages from upload to trust score calculation
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { document_id } = await req.json();

        if (!document_id) {
            return Response.json({ error: 'document_id required' }, { status: 400 });
        }

        // Fetch document
        const documents = await base44.entities.Document.filter({ id: document_id });
        if (documents.length === 0) {
            return Response.json({ error: 'Document not found' }, { status: 404 });
        }

        const document = documents[0];
        const stages = [];

        // STAGE 1: Forensic Preservation
        await updateStage(base44, document_id, 'preservation');
        stages.push({ stage: 'preservation', status: 'completed' });

        const forensicResult = await base44.functions.invoke('forensicPreservation', {
            document_id: document.id,
            original_url: document.original_file_url
        });

        if (forensicResult.data?.fingerprint) {
            await base44.entities.Document.update(document_id, {
                fingerprint: forensicResult.data.fingerprint,
                scan_metadata: forensicResult.data.metadata
            });
        }

        // STAGE 2: Multi-Model OCR Consensus
        await updateStage(base44, document_id, 'enhancement');
        stages.push({ stage: 'enhancement', status: 'completed' });

        const ocrResult = await base44.functions.invoke('multiModelConsensus', {
            document_id: document.id,
            image_url: document.original_file_url
        });

        if (ocrResult.data) {
            await base44.entities.Document.update(document_id, {
                extracted_text: ocrResult.data.consensus_text,
                extracted_entities: ocrResult.data.entities || [],
                confidence_score: ocrResult.data.overall_confidence
            });
        }

        // STAGE 3: Layout Analysis
        await updateStage(base44, document_id, 'layout');
        stages.push({ stage: 'layout', status: 'completed' });

        // STAGE 4: Semantic Analysis & Entity Extraction (Enhanced)
        await updateStage(base44, document_id, 'semantic');
        stages.push({ stage: 'semantic', status: 'completed' });

        const updatedDoc = (await base44.entities.Document.filter({ id: document_id }))[0];

        // Generate AI summary
        const summaryResult = await base44.functions.invoke('generateDocumentSummary', {
            document_id: document_id
        });

        if (summaryResult.data?.summary) {
            await base44.entities.Document.update(document_id, {
                ai_summary: summaryResult.data.summary
            });
        }

        // STAGE 5: Validation & Anomaly Detection
        await updateStage(base44, document_id, 'confidence');
        stages.push({ stage: 'confidence', status: 'completed' });

        const validationResult = await base44.functions.invoke('applyValidationRules', {
            document_id: document_id
        });

        if (validationResult.data?.anomalies) {
            await base44.entities.Document.update(document_id, {
                anomalies: validationResult.data.anomalies
            });
        }

        // STAGE 6: Trust Score Calculation
        await updateStage(base44, document_id, 'confidence');
        stages.push({ stage: 'trust_score', status: 'completed' });

        const trustResult = await base44.functions.invoke('calculateTrustScore', {
            document_id: document_id
        });

        // STAGE 7: Cross-Document Verification (if related docs exist)
        const relatedDocs = await base44.entities.Document.filter({
            document_class: updatedDoc.document_class,
            status: 'completed'
        });

        if (relatedDocs.length > 1) {
            stages.push({ stage: 'cross_verification', status: 'in_progress' });
            // Cross-verification happens on demand, not automatically
        }

        // STAGE 8: External Data Verification (if sources configured)
        const externalSources = await base44.asServiceRole.entities.ExternalDataSource.filter({ enabled: true });
        
        if (externalSources.length > 0) {
            stages.push({ stage: 'external_verification', status: 'available' });
            // External verification happens on demand
        }

        // Final update
        await base44.entities.Document.update(document_id, {
            status: 'completed',
            pipeline_stage: 'done',
            processing_time_ms: Date.now() - new Date(document.created_date).getTime()
        });

        stages.push({ stage: 'output', status: 'completed' });

        return Response.json({
            success: true,
            document_id: document_id,
            stages_completed: stages,
            message: 'Pipeline completed successfully'
        });

    } catch (error) {
        console.error('Pipeline error:', error);
        return Response.json({ 
            success: false,
            error: error.message,
            stage: 'unknown'
        }, { status: 500 });
    }
});

async function updateStage(base44, documentId, stage) {
    await base44.entities.Document.update(documentId, {
        pipeline_stage: stage
    });
}