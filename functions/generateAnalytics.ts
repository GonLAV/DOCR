import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { start_date, end_date, document_type } = await req.json();

        // Fetch documents in date range
        const allDocuments = await base44.entities.Document.list();
        let documents = allDocuments.filter(doc => {
            const docDate = new Date(doc.created_date);
            const start = start_date ? new Date(start_date) : new Date(0);
            const end = end_date ? new Date(end_date) : new Date();
            return docDate >= start && docDate <= end;
        });

        if (document_type && document_type !== 'all') {
            documents = documents.filter(d => d.document_class === document_type);
        }

        // Fetch corrections in date range
        const allCorrections = await base44.asServiceRole.entities.Correction.list();
        const corrections = allCorrections.filter(c => {
            const corrDate = new Date(c.created_date);
            const start = start_date ? new Date(start_date) : new Date(0);
            const end = end_date ? new Date(end_date) : new Date();
            return corrDate >= start && corrDate <= end;
        });

        // Calculate processing speed metrics
        const processingTimes = documents
            .filter(d => d.processing_time_ms)
            .map(d => d.processing_time_ms);
        
        const avgProcessingTime = processingTimes.length > 0
            ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
            : 0;

        const minProcessingTime = processingTimes.length > 0 ? Math.min(...processingTimes) : 0;
        const maxProcessingTime = processingTimes.length > 0 ? Math.max(...processingTimes) : 0;

        // Throughput by document type
        const throughputByType = {};
        documents.forEach(doc => {
            const type = doc.document_class || 'unknown';
            if (!throughputByType[type]) {
                throughputByType[type] = { count: 0, totalTime: 0 };
            }
            throughputByType[type].count++;
            throughputByType[type].totalTime += doc.processing_time_ms || 0;
        });

        // Calculate accuracy trends
        const confidenceScores = documents
            .filter(d => d.confidence_score != null)
            .map(d => d.confidence_score);
        
        const avgConfidence = confidenceScores.length > 0
            ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
            : 0;

        // Entity extraction metrics
        const totalEntities = documents.reduce((sum, d) => 
            sum + (d.extracted_entities?.length || 0), 0);
        
        const highConfidenceEntities = documents.reduce((sum, d) => 
            sum + (d.extracted_entities?.filter(e => e.confidence >= 80).length || 0), 0);

        const entityPrecision = totalEntities > 0 
            ? (highConfidenceEntities / totalEntities) * 100 
            : 0;

        // Accuracy by document type
        const accuracyByType = {};
        documents.forEach(doc => {
            const type = doc.document_class || 'unknown';
            if (!accuracyByType[type]) {
                accuracyByType[type] = { scores: [], count: 0 };
            }
            if (doc.confidence_score != null) {
                accuracyByType[type].scores.push(doc.confidence_score);
                accuracyByType[type].count++;
            }
        });

        Object.keys(accuracyByType).forEach(type => {
            const scores = accuracyByType[type].scores;
            accuracyByType[type].average = scores.length > 0
                ? scores.reduce((a, b) => a + b, 0) / scores.length
                : 0;
        });

        // Error rates
        const validationFailures = documents.reduce((sum, d) => 
            sum + (d.anomalies?.length || 0), 0);

        const errorBreakdown = { error: 0, warning: 0, info: 0 };
        documents.forEach(doc => {
            doc.anomalies?.forEach(anomaly => {
                if (errorBreakdown[anomaly.severity] !== undefined) {
                    errorBreakdown[anomaly.severity]++;
                }
            });
        });

        // Field-level accuracy
        const fieldAccuracy = {};
        documents.forEach(doc => {
            doc.extracted_entities?.forEach(entity => {
                if (!fieldAccuracy[entity.field]) {
                    fieldAccuracy[entity.field] = { total: 0, highConfidence: 0 };
                }
                fieldAccuracy[entity.field].total++;
                if (entity.confidence >= 80) {
                    fieldAccuracy[entity.field].highConfidence++;
                }
            });
        });

        Object.keys(fieldAccuracy).forEach(field => {
            const data = fieldAccuracy[field];
            fieldAccuracy[field].accuracy = data.total > 0
                ? (data.highConfidence / data.total) * 100
                : 0;
        });

        // Human intervention metrics
        const totalCorrections = corrections.length;
        const correctionsByDocument = {};
        corrections.forEach(c => {
            correctionsByDocument[c.document_id] = (correctionsByDocument[c.document_id] || 0) + 1;
        });

        const avgCorrectionsPerDoc = documents.length > 0
            ? totalCorrections / documents.length
            : 0;

        // Corrections by field
        const correctionsByField = {};
        corrections.forEach(c => {
            const field = c.field_path || 'unknown';
            correctionsByField[field] = (correctionsByField[field] || 0) + 1;
        });

        // Model learning impact (simplified metric)
        const verifiedCorrections = corrections.filter(c => c.verified).length;
        const learningImpact = totalCorrections > 0
            ? (verifiedCorrections / totalCorrections) * 100
            : 0;

        // Cost analysis (simplified estimation)
        // Assume: OCR $0.001/page, Entity extraction $0.002/doc, Enhancement $0.003/doc
        const estimatedCostPerDoc = 0.006; // $0.006 per document
        const totalCost = documents.length * estimatedCostPerDoc;

        // Time series data for charts
        const dailyMetrics = {};
        documents.forEach(doc => {
            const date = new Date(doc.created_date).toISOString().split('T')[0];
            if (!dailyMetrics[date]) {
                dailyMetrics[date] = {
                    count: 0,
                    totalTime: 0,
                    confidenceScores: [],
                    errors: 0,
                    corrections: 0
                };
            }
            dailyMetrics[date].count++;
            dailyMetrics[date].totalTime += doc.processing_time_ms || 0;
            if (doc.confidence_score != null) {
                dailyMetrics[date].confidenceScores.push(doc.confidence_score);
            }
            dailyMetrics[date].errors += doc.anomalies?.length || 0;
        });

        corrections.forEach(c => {
            const date = new Date(c.created_date).toISOString().split('T')[0];
            if (dailyMetrics[date]) {
                dailyMetrics[date].corrections++;
            }
        });

        const timeSeriesData = Object.keys(dailyMetrics).sort().map(date => ({
            date,
            documents: dailyMetrics[date].count,
            avgTime: dailyMetrics[date].totalTime / dailyMetrics[date].count,
            avgConfidence: dailyMetrics[date].confidenceScores.length > 0
                ? dailyMetrics[date].confidenceScores.reduce((a, b) => a + b, 0) / dailyMetrics[date].confidenceScores.length
                : 0,
            errors: dailyMetrics[date].errors,
            corrections: dailyMetrics[date].corrections
        }));

        return Response.json({
            success: true,
            period: {
                start: start_date || 'all',
                end: end_date || 'all',
                document_type: document_type || 'all'
            },
            summary: {
                total_documents: documents.length,
                avg_processing_time_ms: Math.round(avgProcessingTime),
                min_processing_time_ms: Math.round(minProcessingTime),
                max_processing_time_ms: Math.round(maxProcessingTime),
                avg_confidence_score: Math.round(avgConfidence * 10) / 10,
                entity_precision: Math.round(entityPrecision * 10) / 10,
                total_entities: totalEntities,
                validation_failures: validationFailures,
                error_breakdown: errorBreakdown,
                total_corrections: totalCorrections,
                avg_corrections_per_doc: Math.round(avgCorrectionsPerDoc * 10) / 10,
                learning_impact: Math.round(learningImpact * 10) / 10,
                estimated_total_cost: Math.round(totalCost * 100) / 100,
                cost_per_document: estimatedCostPerDoc
            },
            throughput_by_type: throughputByType,
            accuracy_by_type: accuracyByType,
            field_accuracy: fieldAccuracy,
            corrections_by_field: correctionsByField,
            time_series: timeSeriesData
        });

    } catch (error) {
        console.error('Analytics generation error:', error);
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});