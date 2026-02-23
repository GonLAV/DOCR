import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { batch_job_id } = await req.json();

    if (!batch_job_id) {
      return Response.json({ error: 'Missing batch_job_id' }, { status: 400 });
    }

    // Fetch batch job
    const batchJobs = await base44.entities.BatchJob.list();
    const batchJob = batchJobs.find(j => j.id === batch_job_id);

    if (!batchJob) {
      return Response.json({ error: 'Batch job not found' }, { status: 404 });
    }

    // Update status to processing
    await base44.asServiceRole.entities.BatchJob.update(batch_job_id, {
      status: 'processing',
      started_at: new Date().toISOString(),
      progress: {
        total: batchJob.document_ids.length,
        completed: 0,
        failed: 0
      }
    });

    const results = [];

    // Process each document
    for (let i = 0; i < batchJob.document_ids.length; i++) {
      const docId = batchJob.document_ids[i];
      
      try {
        // Execute action based on type
        let result = { document_id: docId, status: 'success', message: '' };

        switch (batchJob.action_type) {
          case 'reprocess':
            await base44.asServiceRole.entities.Document.update(docId, {
              status: 'processing',
              pipeline_stage: 'preservation'
            });
            result.message = 'Reprocessing initiated';
            break;

          case 'revalidate':
            // Simulate validation
            await base44.asServiceRole.entities.Document.update(docId, {
              status: 'analyzing'
            });
            result.message = 'Revalidation initiated';
            break;

          case 'generate_summary':
            // Call summary generation function
            const summaryRes = await base44.functions.invoke('generateDocumentSummary', {
              document_id: docId
            });
            result.message = summaryRes.data?.success ? 'Summary generated' : 'Summary generation failed';
            break;

          case 'archive':
            await base44.asServiceRole.entities.Document.update(docId, {
              tags: [...(batchJob.document_ids[i].tags || []), 'archived']
            });
            result.message = 'Archived';
            break;

          default:
            result.message = 'Action completed';
        }

        results.push(result);

        // Update progress
        await base44.asServiceRole.entities.BatchJob.update(batch_job_id, {
          progress: {
            total: batchJob.document_ids.length,
            completed: i + 1,
            failed: results.filter(r => r.status === 'failed').length
          },
          results: results
        });

      } catch (error) {
        console.error(`Error processing document ${docId}:`, error);
        results.push({
          document_id: docId,
          status: 'failed',
          message: error.message
        });

        await base44.asServiceRole.entities.BatchJob.update(batch_job_id, {
          progress: {
            total: batchJob.document_ids.length,
            completed: i + 1,
            failed: results.filter(r => r.status === 'failed').length
          },
          results: results
        });
      }
    }

    // Mark as completed
    const finalStatus = results.every(r => r.status === 'success') ? 'completed' : 
                       results.every(r => r.status === 'failed') ? 'failed' : 'completed';

    await base44.asServiceRole.entities.BatchJob.update(batch_job_id, {
      status: finalStatus,
      completed_at: new Date().toISOString(),
      results: results
    });

    return Response.json({
      success: true,
      batch_job_id,
      status: finalStatus,
      results
    });

  } catch (error) {
    console.error('Batch processing error:', error);
    return Response.json({ 
      error: 'Batch processing failed', 
      details: error.message 
    }, { status: 500 });
  }
});