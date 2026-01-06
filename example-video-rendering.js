// Example: Updated renderGallery function to support videos
// This shows how to modify script.js to handle both images and videos

function renderGallery() {
    if (!gallerySlidesContainer || !galleryData) return;
    
    // Filter active items and sort by order
    const activeItems = galleryData.gallery
        .filter(item => item.active !== false)
        .sort((a, b) => a.order - b.order);
    
    gallerySlidesContainer.innerHTML = activeItems.map((item, index) => {
        // Determine media type (default to 'image' for backward compatibility)
        const mediaType = item.type || 'image';
        
        if (mediaType === 'video') {
            return renderVideoSlide(item, index);
        } else {
            return renderImageSlide(item, index);
        }
    }).join('');
    
    // Update carousel slides reference
    carouselSlides = document.querySelectorAll('.gallery-slide');
}

// Render image slide (existing functionality)
function renderImageSlide(item, index) {
    const hotspots = item.hotspots.map(hotspot => 
        `<div class="hotspot" data-content="${hotspot.content}" style="left: ${hotspot.x}%; top: ${hotspot.y}%;"></div>`
    ).join('');
    
    return `
        <div class="gallery-slide ${index === 0 ? 'active' : ''}" data-id="${item.id}" data-type="image">
            <img src="${item.image}" alt="${item.alt}" loading="lazy">
            ${hotspots}
            <div class="gallery-overlay">
                <span class="gallery-icon">${item.icon}</span>
            </div>
        </div>
    `;
}

// Render video slide (new functionality)
function renderVideoSlide(item, index) {
    const isActive = index === 0 ? 'active' : '';
    const videoId = item.videoId || extractVideoId(item.videoUrl, item.platform);
    const thumbnail = item.thumbnail || getDefaultThumbnail(item.platform, videoId);
    
    let videoElement = '';
    
    if (item.platform === 'youtube') {
        // YouTube embed
        videoElement = `
            <div class="video-container">
                <iframe 
                    class="video-player"
                    src="https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    loading="lazy"
                ></iframe>
            </div>
        `;
    } else if (item.platform === 'vimeo') {
        // Vimeo embed
        videoElement = `
            <div class="video-container">
                <iframe 
                    class="video-player"
                    src="https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0"
                    frameborder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowfullscreen
                    loading="lazy"
                ></iframe>
            </div>
        `;
    } else if (item.platform === 'cloudinary' || item.platform === 'self-hosted') {
        // HTML5 video player
        videoElement = `
            <div class="video-container">
                <video 
                    class="video-player"
                    poster="${item.poster || thumbnail}"
                    controls
                    preload="metadata"
                    ${item.autoplay ? 'autoplay' : ''}
                    ${item.loop ? 'loop' : ''}
                    ${item.muted ? 'muted' : ''}
                >
                    <source src="${item.videoUrl}" type="video/mp4">
                    <source src="${item.videoUrl.replace('.mp4', '.webm')}" type="video/webm">
                    Your browser does not support the video tag.
                </video>
            </div>
        `;
    }
    
    return `
        <div class="gallery-slide ${isActive}" data-id="${item.id}" data-type="video">
            ${videoElement}
            <div class="gallery-overlay">
                <span class="gallery-icon">${item.icon}</span>
            </div>
        </div>
    `;
}

// Helper function to extract video ID from URL
function extractVideoId(url, platform) {
    if (!url) return '';
    
    if (platform === 'youtube') {
        // Handle various YouTube URL formats
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&\n?#]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
    } else if (platform === 'vimeo') {
        // Handle Vimeo URL formats
        const patterns = [
            /vimeo\.com\/(\d+)/,
            /vimeo\.com\/video\/(\d+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
    }
    
    return '';
}

// Helper function to get default thumbnail
function getDefaultThumbnail(platform, videoId) {
    if (platform === 'youtube') {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    } else if (platform === 'vimeo') {
        return `https://vumbnail.com/${videoId}.jpg`;
    }
    return '';
}

// Optional: Pause videos when switching slides
function updateCarousel() {
    // Remove active class from all slides
    carouselSlides.forEach(slide => {
        slide.classList.remove('active');
        
        // Pause any videos in inactive slides
        const video = slide.querySelector('video');
        if (video) {
            video.pause();
        }
        
        // Pause YouTube/Vimeo iframes (requires iframe API)
        const iframe = slide.querySelector('iframe');
        if (iframe && iframe.src.includes('youtube.com')) {
            // YouTube iframe API would be needed for this
            // For now, just remove autoplay parameter
            iframe.src = iframe.src.replace('autoplay=1', 'autoplay=0');
        }
    });
    
    // Add active class to current slide
    if (carouselSlides[currentSlideIndex]) {
        carouselSlides[currentSlideIndex].classList.add('active');
    }
    
    // Update indicators
    const indicators = document.querySelectorAll('.carousel-indicator');
    indicators.forEach((indicator, index) => {
        if (index === currentSlideIndex) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

