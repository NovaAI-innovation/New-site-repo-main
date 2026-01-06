// Netlify Serverless Function for Video Upload to Cloudinary
// This function handles video uploads to Cloudinary

const cloudinary = require('cloudinary').v2;
const { v2: cloudinaryV2 } = require('cloudinary');

// Simple authentication check
function checkAuth(event) {
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return false;
    }
    // In production, use proper JWT or session validation
    return true;
}

// Initialize Cloudinary (will use environment variables)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
        // Check if Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME || 
            !process.env.CLOUDINARY_API_KEY || 
            !process.env.CLOUDINARY_API_SECRET) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Cloudinary not configured',
                    message: 'Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables'
                }),
            };
        }

        // Parse multipart form data
        // Note: Netlify Functions have a 6MB payload limit
        // For larger videos, use Cloudinary's unsigned upload or direct browser upload
        
        // For videos larger than 6MB, you should use Cloudinary's unsigned upload
        // This function handles the server-side upload for smaller videos
        
        const contentType = event.headers['content-type'] || '';
        
        if (!contentType.includes('multipart/form-data')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid content type. Expected multipart/form-data' }),
            };
        }

        // Parse the multipart form data
        // In a real implementation, you would use a library like 'busboy' or 'formidable'
        // For now, this is a placeholder that shows the structure
        
        // Example using busboy (you'll need to install: npm install busboy)
        /*
        const Busboy = require('busboy');
        const busboy = Busboy({ headers: event.headers });
        
        return new Promise((resolve, reject) => {
            const uploads = {};
            
            busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
                if (fieldname === 'file' && mimetype.startsWith('video/')) {
                    const chunks = [];
                    
                    file.on('data', (data) => {
                        chunks.push(data);
                    });
                    
                    file.on('end', async () => {
                        const buffer = Buffer.concat(chunks);
                        
                        // Upload to Cloudinary
                        try {
                            const result = await new Promise((resolve, reject) => {
                                cloudinary.uploader.upload_stream(
                                    {
                                        resource_type: 'video',
                                        folder: 'gallery/videos',
                                        format: 'mp4',
                                        transformation: [
                                            { quality: 'auto' },
                                            { fetch_format: 'auto' }
                                        ]
                                    },
                                    (error, result) => {
                                        if (error) reject(error);
                                        else resolve(result);
                                    }
                                ).end(buffer);
                            });
                            
                            // Generate thumbnail
                            const thumbnailUrl = cloudinary.url(result.public_id, {
                                resource_type: 'video',
                                format: 'jpg',
                                transformation: [
                                    { width: 1280, height: 720, crop: 'fill' },
                                    { quality: 'auto' }
                                ]
                            });
                            
                            resolve({
                                statusCode: 200,
                                headers,
                                body: JSON.stringify({
                                    success: true,
                                    videoUrl: result.secure_url,
                                    publicId: result.public_id,
                                    thumbnail: thumbnailUrl,
                                    poster: thumbnailUrl,
                                    width: result.width,
                                    height: result.height,
                                    duration: result.duration,
                                    format: result.format,
                                    bytes: result.bytes
                                }),
                            });
                        } catch (uploadError) {
                            reject({
                                statusCode: 500,
                                headers,
                                body: JSON.stringify({ 
                                    error: 'Upload failed',
                                    details: uploadError.message 
                                }),
                            });
                        }
                    });
                }
            });
            
            busboy.on('finish', () => {
                // Form parsing complete
            });
            
            // Pipe the event body to busboy
            busboy.write(event.body, event.isBase64Encoded ? 'base64' : 'binary');
            busboy.end();
        });
        */
        
        // For now, return instructions
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Video upload endpoint ready',
                note: 'Install busboy: npm install busboy',
                instructions: [
                    '1. Install busboy: npm install busboy',
                    '2. Uncomment the busboy code above',
                    '3. Set Cloudinary environment variables',
                    '4. For videos >6MB, use Cloudinary unsigned upload (see documentation)'
                ],
                // Alternative: Use Cloudinary's unsigned upload for direct browser uploads
                // This bypasses the 6MB Netlify limit
                alternative: 'For larger videos, implement Cloudinary unsigned upload in the browser'
            }),
        };
    } catch (error) {
        console.error('Upload error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                details: error.message 
            }),
        };
    }
};

