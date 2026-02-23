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

        // STAGE 2: Damage Assessment
        await updateStage(base44, document_id, 'damage');
        stages.push({ stage: 'damage', status: 'completed' });

        await base44.functions.invoke('damageAnalyzer', {
            document_id: document_id
        });

        // STAGE 3: AI Enhancement
        await updateStage(base44, document_id, 'enhancement');
        stages.push({ stage: 'enhancement', status: 'completed' });

        await base44.functions.invoke('enhanceDocument', {
            document_id: document_id
        });

        // STAGE 4: Layout Analysis
        await updateStage(base44, document_id, 'layout');
        stages.push({ stage: 'layout', status: 'completed' });

        await base44.functions.invoke('layoutAnalysis', {
            document_id: document_id
        });

        // STAGE 5: Multi-Model OCR Consensus
        const updatedDocAfterLayout = (await base44.entities.Document.filter({ id: document_id }))[0];
        
        await base44.functions.invoke('multiModelConsensus', {
            document_id: document_id
        });

        // STAGE 6: Semantic Analysis & Entity Extraction
        await updateStage(base44, document_id, 'semantic');
        stages.push({ stage: 'semantic', status: 'completed' });

        await base44.functions.invoke('semanticExtraction', {
            document_id: document_id
        });

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

        // STAGE 7: Validation & Anomaly Detection
        await updateStage(base44, document_id, 'confidence');
        stages.push({ stage: 'validation', status: 'completed' });

        const validationResult = await base44.functions.invoke('applyValidationRules', {
            document_id: document_id
        });

        // STAGE 8: Trust Score Calculation
        stages.push({ stage: 'trust_score', status: 'completed' });

        await base44.functions.invoke('calculateTrustScore', {
            document_id: document_id
        });

        // STAGE 9: Handwriting Recognition (if handwriting detected)
        if (updatedDoc.layout_analysis?.handwriting_regions?.length > 0) {
            stages.push({ stage: 'handwriting_recognition', status: 'completed' });
            await base44.functions.invoke('recognizeHandwriting', {
                document_id: document_id
            });
        }

        // Cross-Document Verification and External Sources are available on-demand
        const relatedDocs = await base44.entities.Document.filter({
            document_class: updatedDoc.document_class,
            status: 'completed'
        });

        if (relatedDocs.length > 1) {
            stages.push({ stage: 'cross_verification', status: 'available' });
        }

        const externalSources = await base44.asServiceRole.entities.ExternalDataSource.filter({ enabled: true });
        
        if (externalSources.length > 0) {
            stages.push({ stage: 'external_verification', status: 'available' });
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