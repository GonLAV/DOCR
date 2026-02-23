import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { source_id, query_data } = await req.json();

        // Fetch external source configuration
        const sources = await base44.asServiceRole.entities.ExternalDataSource.filter({ id: source_id });
        
        if (sources.length === 0) {
            return Response.json({ error: 'External source not found' }, { status: 404 });
        }

        const source = sources[0];

        if (!source.enabled) {
            return Response.json({ error: 'External source is disabled' }, { status: 400 });
        }

        // Build request based on query template
        const requestOptions = {
            method: source.query_template?.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(source.query_template?.headers || {})
            }
        };

        // Add authentication
        if (source.auth_type === 'api_key' && source.auth_credentials?.api_key) {
            requestOptions.headers['X-API-Key'] = source.auth_credentials.api_key;
        } else if (source.auth_type === 'bearer_token' && source.auth_credentials?.token) {
            requestOptions.headers['Authorization'] = `Bearer ${source.auth_credentials.token}`;
        } else if (source.auth_type === 'basic_auth' && source.auth_credentials?.username) {
            const credentials = btoa(`${source.auth_credentials.username}:${source.auth_credentials.password || ''}`);
            requestOptions.headers['Authorization'] = `Basic ${credentials}`;
        }

        // Build URL with query parameters
        let url = source.endpoint_url;
        if (source.query_template?.query_params) {
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(source.query_template.query_params)) {
                // Replace template variables with actual query data
                const resolvedValue = query_data[value] || value;
                params.append(key, resolvedValue);
            }
            url += `?${params.toString()}`;
        }

        // Add body for POST/PUT requests
        if (requestOptions.method !== 'GET' && source.query_template?.body_template) {
            let body = source.query_template.body_template;
            // Replace template variables in body
            for (const [key, value] of Object.entries(query_data)) {
                body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
            }
            requestOptions.body = body;
        }

        // Make the external API call
        const startTime = Date.now();
        const response = await fetch(url, requestOptions);
        const responseTime = Date.now() - startTime;
        const responseData = await response.json();

        // Update source statistics
        await base44.asServiceRole.entities.ExternalDataSource.update(source_id, {
            last_used: new Date().toISOString(),
            average_response_time: source.average_response_time 
                ? (source.average_response_time + responseTime) / 2 
                : responseTime,
            success_rate: response.ok 
                ? Math.min(100, (source.success_rate || 0) + 1) 
                : Math.max(0, (source.success_rate || 100) - 5)
        });

        if (!response.ok) {
            return Response.json({
                success: false,
                error: 'External source query failed',
                status: response.status,
                response_time: responseTime
            }, { status: 200 });
        }

        // Apply verification rules
        const verificationResults = [];
        if (source.verification_rules) {
            for (const rule of source.verification_rules) {
                const documentValue = query_data[rule.field];
                const externalValue = responseData[rule.field];

                let match = false;
                let message = '';

                switch (rule.comparison) {
                    case 'exact_match':
                        match = documentValue === externalValue;
                        message = match ? 'Exact match confirmed' : `Mismatch: expected ${externalValue}, got ${documentValue}`;
                        break;
                    case 'fuzzy_match':
                        const similarity = calculateSimilarity(String(documentValue), String(externalValue));
                        match = similarity >= (rule.threshold || 0.8);
                        message = `Similarity: ${(similarity * 100).toFixed(1)}%`;
                        break;
                    case 'range':
                        match = documentValue >= externalValue.min && documentValue <= externalValue.max;
                        message = match ? 'Within expected range' : `Out of range: ${externalValue.min}-${externalValue.max}`;
                        break;
                    case 'exists':
                        match = externalValue !== null && externalValue !== undefined;
                        message = match ? 'Record found' : 'Record not found in external source';
                        break;
                    case 'not_exists':
                        match = externalValue === null || externalValue === undefined;
                        message = match ? 'Correctly not found' : 'Unexpected record found';
                        break;
                }

                verificationResults.push({
                    field: rule.field,
                    match,
                    severity: match ? 'info' : rule.severity,
                    message,
                    document_value: documentValue,
                    external_value: externalValue
                });
            }
        }

        return Response.json({
            success: true,
            source_name: source.name,
            data: responseData,
            verification_results: verificationResults,
            response_time: responseTime,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});

// Helper function to calculate string similarity (Levenshtein-based)
function calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}