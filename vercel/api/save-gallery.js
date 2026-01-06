// Vercel Serverless Function for Saving Gallery Data

export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Check authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const galleryData = req.body;

        // Validate data structure
        if (!galleryData.gallery || !Array.isArray(galleryData.gallery)) {
            return res.status(400).json({ error: 'Invalid gallery data structure' });
        }

        // In a real implementation, you would:
        // 1. Save to GitHub via API (using Octokit)
        // 2. Or save to a database (Vercel Postgres, etc.)
        // 3. Or trigger a rebuild
        
        // Example: Use GitHub API to commit the file
        // const { Octokit } = require('@octokit/rest');
        // const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
        // await octokit.repos.createOrUpdateFileContents({...});
        
        return res.status(200).json({
            success: true,
            message: 'Gallery data received',
            note: 'Integrate with GitHub API or database in production',
            data: galleryData
        });
    } catch (error) {
        console.error('Save error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}

