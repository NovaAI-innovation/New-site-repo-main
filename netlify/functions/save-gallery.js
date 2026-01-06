// Netlify Serverless Function for Saving Gallery Data
// This function saves the gallery-data.json file

const fs = require('fs').promises;
const path = require('path');

// Simple authentication check
function checkAuth(event) {
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return false;
    }
    // In production, use proper JWT or session validation
    return true;
}

exports.handler = async (event, context) => {
    // Handle CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }

    // Check authentication
    if (!checkAuth(event)) {
        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Unauthorized' }),
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const galleryData = JSON.parse(event.body);

        // Validate data structure
        if (!galleryData.gallery || !Array.isArray(galleryData.gallery)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid gallery data structure' }),
            };
        }

        // In a real implementation, you would:
        // 1. Save to GitHub via API (using GitHub Actions or Octokit)
        // 2. Or save to a database
        // 3. Or trigger a rebuild/deployment
        
        // For Netlify, you could use:
        // - GitHub API to commit the file
        // - Netlify API to trigger a build
        // - Or use a service like GitHub Actions
        
        // Example: Save to file system (only works in local development)
        // In production, use GitHub API or database
        const filePath = path.join(process.cwd(), 'gallery-data.json');
        
        try {
            await fs.writeFile(filePath, JSON.stringify(galleryData, null, 2), 'utf8');
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Gallery data saved successfully',
                    note: 'In production, this should commit to GitHub or save to database'
                }),
            };
        } catch (fileError) {
            // File system not available (expected in serverless environment)
            // Return success but note that manual commit is needed
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Gallery data received',
                    note: 'File system not available. Use GitHub API or database in production.',
                    data: galleryData // Return data for client to download
                }),
            };
        }
    } catch (error) {
        console.error('Save error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error', details: error.message }),
        };
    }
};

