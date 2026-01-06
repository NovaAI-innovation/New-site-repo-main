# Gallery Management System - Setup Guide

This guide explains how to set up and use the gallery management system with serverless functions.

## Overview

The gallery management system allows you to:
- ✅ Upload new images via drag & drop
- ✅ Edit image metadata (alt text, icons, order)
- ✅ Reorder images
- ✅ Delete images
- ✅ Manage gallery remotely from desktop

## Architecture

- **Frontend**: Static HTML/CSS/JavaScript
- **Data Storage**: `gallery-data.json` file
- **Admin Interface**: `admin.html` (password protected)
- **Serverless Functions**: Netlify Functions or Vercel Functions

## Setup Instructions

### Option 1: Netlify Deployment

1. **Deploy to Netlify**:
   - Push your code to GitHub
   - Connect repository to Netlify
   - Netlify will automatically detect `netlify.toml`

2. **Configure Environment Variables** (optional):
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add `ADMIN_PASSWORD` (if you want to change the default)

3. **Update Admin Password**:
   - Edit `admin.html`
   - Change `const ADMIN_PASSWORD = 'admin123';` to your secure password

4. **Access Admin Panel**:
   - Visit `https://your-site.netlify.app/admin.html`
   - Login with your password

### Option 2: Vercel Deployment

1. **Deploy to Vercel**:
   - Push your code to GitHub
   - Import repository in Vercel
   - Vercel will automatically detect `vercel.json`

2. **Configure Environment Variables** (optional):
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add `ADMIN_PASSWORD` (if you want to change the default)

3. **Update Admin Password**:
   - Edit `admin.html`
   - Change `const ADMIN_PASSWORD = 'admin123';` to your secure password

4. **Access Admin Panel**:
   - Visit `https://your-site.vercel.app/admin.html`
   - Login with your password

## Serverless Functions Setup

### Current Implementation

The serverless functions are **skeleton implementations** that need to be completed based on your storage solution:

#### For Image Upload (`upload-image.js`)

You need to integrate with one of these services:

1. **Cloudinary** (Recommended - Free tier available)
   ```javascript
   const cloudinary = require('cloudinary').v2;
   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
   });
   
   const result = await cloudinary.uploader.upload(file, {
     folder: 'gallery',
     format: 'webp'
   });
   ```

2. **AWS S3**
   ```javascript
   const AWS = require('aws-sdk');
   const s3 = new AWS.S3();
   await s3.putObject({
     Bucket: process.env.S3_BUCKET,
     Key: `gallery/${filename}`,
     Body: fileBuffer
   }).promise();
   ```

3. **Vercel Blob** (if using Vercel)
   ```javascript
   const { put } = require('@vercel/blob');
   const blob = await put(filename, fileBuffer, {
     access: 'public',
   });
   ```

#### For Saving Gallery Data (`save-gallery.js`)

You need to integrate with one of these:

1. **GitHub API** (Recommended for static sites)
   ```javascript
   const { Octokit } = require('@octokit/rest');
   const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
   
   await octokit.repos.createOrUpdateFileContents({
     owner: 'your-username',
     repo: 'your-repo',
     path: 'gallery-data.json',
     message: 'Update gallery data',
     content: Buffer.from(JSON.stringify(galleryData, null, 2)).toString('base64'),
     sha: existingFileSha // Get from previous file read
   });
   ```

2. **Database** (MongoDB, PostgreSQL, etc.)
   ```javascript
   // Save to database instead of file
   await db.collection('gallery').updateOne(
     { _id: 'gallery-data' },
     { $set: { data: galleryData } },
     { upsert: true }
   );
   ```

## Installation Steps

### 1. Install Dependencies (if using GitHub API or Cloudinary)

For Netlify Functions:
```bash
cd netlify/functions
npm init -y
npm install @octokit/rest cloudinary
```

For Vercel Functions:
```bash
npm install @octokit/rest cloudinary
```

### 2. Set Environment Variables

**Netlify**:
- Go to Site Settings → Environment Variables
- Add:
  - `GITHUB_TOKEN` (if using GitHub API)
  - `CLOUDINARY_CLOUD_NAME` (if using Cloudinary)
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

**Vercel**:
- Go to Project Settings → Environment Variables
- Add the same variables as above

### 3. Update Function Code

Edit the serverless functions to integrate with your chosen storage solution (see examples above).

## Usage

### Admin Interface

1. Navigate to `/admin.html`
2. Enter your admin password
3. Upload images via drag & drop or file browser
4. Edit metadata:
   - Alt text
   - Icon (🔥, 💋, 💄, ⚡, 💎)
   - Display order
   - Active/Hidden status
5. Click "Save Changes" to update the gallery

### Gallery Display

The gallery automatically loads from `gallery-data.json` and displays:
- Images in the specified order
- Hotspots with custom content
- Icons on each image
- Carousel navigation

## Security Considerations

⚠️ **Important**: The current authentication is basic. For production:

1. **Use proper authentication**:
   - JWT tokens
   - OAuth 2.0
   - Session-based auth with secure cookies

2. **Add rate limiting** to prevent abuse

3. **Validate file uploads**:
   - Check file types
   - Limit file sizes
   - Scan for malware

4. **Use HTTPS** (automatically provided by Netlify/Vercel)

## Troubleshooting

### Images not uploading
- Check serverless function logs in Netlify/Vercel dashboard
- Verify environment variables are set
- Check file size limits (Netlify: 6MB, Vercel: 4.5MB)

### Gallery not saving
- Check browser console for errors
- Verify authentication token is being sent
- Check serverless function logs

### CORS errors
- Ensure CORS headers are set in serverless functions
- Check that API base URL matches your deployment

## Alternative: Manual Management

If serverless functions are not set up, you can:

1. Edit `gallery-data.json` manually
2. Upload images to `Pics for website/` folder
3. Commit changes to GitHub
4. Site will auto-deploy (if using Netlify/Vercel)

## Support

For issues or questions:
1. Check serverless function logs
2. Review browser console for errors
3. Verify all environment variables are set
4. Ensure file permissions are correct

## Next Steps

1. Choose your storage solution (Cloudinary, S3, etc.)
2. Complete the serverless function implementations
3. Set environment variables
4. Test the admin interface
5. Update admin password
6. Start managing your gallery!

