# Cloudinary Video Integration Setup Guide

This guide will help you set up Cloudinary for video uploads and hosting in your gallery.

## Overview

Cloudinary provides:
- ✅ Video hosting and CDN
- ✅ Automatic video optimization
- ✅ Thumbnail generation
- ✅ Video transformations (resize, crop, quality)
- ✅ Free tier: 25GB storage, 25GB bandwidth/month

---

## Step 1: Create Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email address
4. You'll be taken to your dashboard

---

## Step 2: Get Your Cloudinary Credentials

1. In your Cloudinary dashboard, go to **Settings** → **Security**
2. Copy these values:
   - **Cloud Name** (e.g., `your-cloud-name`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

⚠️ **Keep your API Secret secure!** Never commit it to version control.

---

## Step 3: Set Environment Variables

### For Netlify:

1. Go to your Netlify site dashboard
2. Navigate to **Site Settings** → **Environment Variables**
3. Add these variables:
   ```
   CLOUDINARY_CLOUD_NAME = your-cloud-name
   CLOUDINARY_API_KEY = your-api-key
   CLOUDINARY_API_SECRET = your-api-secret
   ```
4. Click **Save**

### For Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the same three variables as above
4. Click **Save**

---

## Step 4: Install Dependencies

### For Netlify Functions:

```bash
cd netlify/functions
npm init -y
npm install cloudinary busboy
```

### For Vercel Functions:

```bash
npm install cloudinary busboy
```

---

## Step 5: Complete Serverless Function Implementation

The `upload-video.js` function has placeholder code. You need to:

1. **Install busboy** (for parsing multipart form data):
   ```bash
   npm install busboy
   ```

2. **Uncomment and complete the upload code** in `netlify/functions/upload-video.js`

3. **Alternative: Use Cloudinary Unsigned Upload** (recommended for large videos)

---

## Step 6: Cloudinary Unsigned Upload (Recommended)

For videos larger than 6MB (Netlify's limit), use Cloudinary's unsigned upload directly from the browser.

### Setup Unsigned Upload Preset:

1. In Cloudinary dashboard, go to **Settings** → **Upload**
2. Scroll to **Upload presets**
3. Click **Add upload preset**
4. Configure:
   - **Preset name**: `gallery-videos` (or your choice)
   - **Signing mode**: **Unsigned**
   - **Folder**: `gallery/videos`
   - **Resource type**: **Video**
   - **Format**: `mp4`
   - **Transformation**: 
     ```
     q_auto,f_auto
     ```
5. Click **Save**

### Update Admin Interface:

Add this to `admin.html` for direct browser upload:

```javascript
// Direct Cloudinary upload (bypasses serverless function)
async function uploadVideoToCloudinary(file) {
    const CLOUDINARY_UPLOAD_PRESET = 'gallery-videos'; // Your preset name
    const CLOUDINARY_CLOUD_NAME = 'your-cloud-name'; // Your cloud name
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'gallery/videos');
    formData.append('resource_type', 'video');
    
    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
            {
                method: 'POST',
                body: formData
            }
        );
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const data = await response.json();
        
        // Generate thumbnail URL
        const thumbnailUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/w_1280,h_720,c_fill,q_auto/${data.public_id}.jpg`;
        
        return {
            videoUrl: data.secure_url,
            publicId: data.public_id,
            thumbnail: thumbnailUrl,
            poster: thumbnailUrl,
            width: data.width,
            height: data.height,
            duration: data.duration,
            format: data.format,
            bytes: data.bytes
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
}
```

---

## Step 7: Video Transformations

Cloudinary supports powerful video transformations. Examples:

### Quality Optimization:
```
https://res.cloudinary.com/your-cloud/video/upload/q_auto,f_auto/video.mp4
```

### Resize Video:
```
https://res.cloudinary.com/your-cloud/video/upload/w_1280,h_720,c_fill,q_auto/video.mp4
```

### Generate Thumbnail:
```
https://res.cloudinary.com/your-cloud/video/upload/w_1280,h_720,c_fill,q_auto/video.jpg
```

### Multiple Formats:
```
https://res.cloudinary.com/your-cloud/video/upload/q_auto,f_auto/video.mp4
https://res.cloudinary.com/your-cloud/video/upload/q_auto,f_webm/video.webm
```

---

## Step 8: Update Admin Interface

The admin interface has been updated to support video uploads. Make sure:

1. **Media type selector** works (Image/Video toggle)
2. **Video upload area** is visible when "Video" is selected
3. **Video files** are accepted (MP4, WebM, MOV)
4. **Upload progress** is shown
5. **Video preview** appears after upload

---

## Step 9: Test the Integration

1. **Upload a test video**:
   - Go to `/admin.html`
   - Select "Video" media type
   - Upload a small test video (MP4)
   - Check that it appears in the gallery

2. **Verify video playback**:
   - Go to `/gallery.html`
   - Navigate to the video slide
   - Verify video plays correctly
   - Check thumbnail/poster displays

3. **Test on mobile**:
   - Verify videos play on mobile devices
   - Check responsive sizing

---

## Troubleshooting

### Issue: "Cloudinary not configured"
**Solution**: Set environment variables in Netlify/Vercel dashboard

### Issue: "Upload failed" for large videos
**Solution**: Use Cloudinary unsigned upload (direct browser upload)

### Issue: Videos not displaying
**Solution**: 
- Check video URL in JSON
- Verify Cloudinary video is public
- Check browser console for errors

### Issue: Thumbnails not showing
**Solution**: 
- Verify thumbnail URL format
- Check Cloudinary transformation syntax
- Ensure video has been processed

### Issue: CORS errors
**Solution**: 
- Cloudinary allows CORS by default
- Check that video URL uses `secure_url`
- Verify API calls use correct endpoints

---

## Security Best Practices

1. **Use unsigned upload presets** for public uploads
2. **Set upload limits** in Cloudinary settings:
   - Max file size
   - Allowed formats
   - Allowed dimensions
3. **Use signed uploads** for authenticated users
4. **Set up upload restrictions**:
   - Folder structure
   - Naming conventions
   - Expiration policies

---

## Cloudinary Pricing

### Free Tier:
- 25GB storage
- 25GB bandwidth/month
- Basic transformations
- Good for small to medium sites

### Paid Plans:
- More storage and bandwidth
- Advanced transformations
- Priority support
- Analytics

---

## Next Steps

1. ✅ Set up Cloudinary account
2. ✅ Configure environment variables
3. ✅ Install dependencies
4. ✅ Complete serverless function OR use unsigned upload
5. ✅ Test video upload
6. ✅ Test video playback
7. ✅ Deploy to production

---

## Additional Resources

- [Cloudinary Video Documentation](https://cloudinary.com/documentation/video_manipulation_and_delivery)
- [Cloudinary Upload API](https://cloudinary.com/documentation/upload_images)
- [Cloudinary Transformations](https://cloudinary.com/documentation/transformation_reference)
- [Cloudinary JavaScript SDK](https://cloudinary.com/documentation/cloudinary_js)

---

## Support

If you encounter issues:
1. Check Cloudinary dashboard for upload logs
2. Review serverless function logs (Netlify/Vercel)
3. Check browser console for errors
4. Verify environment variables are set correctly

Need help? Let me know and I can assist with the implementation!

