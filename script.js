// ===========================
// Age Verification
// ===========================

const ageModal = document.getElementById('age-modal');
const ageConfirm = document.getElementById('age-confirm');
const ageDecline = document.getElementById('age-decline');

if (ageModal && ageConfirm && ageDecline) {
    // Check if user has already verified age
    const hasVerifiedAge = localStorage.getItem('ageVerified');

    if (hasVerifiedAge === 'true') {
        ageModal.classList.add('hidden');
    } else {
        ageModal.classList.remove('hidden');
    }

    ageConfirm.addEventListener('click', () => {
        localStorage.setItem('ageVerified', 'true');
        ageModal.classList.add('hidden');
    });

    ageDecline.addEventListener('click', () => {
        window.location.href = 'https://www.google.com';
    });
}

// ===========================
// Navigation
// ===========================

const nav = document.getElementById('nav');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Sticky navigation on scroll
if (nav) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

// Mobile menu toggle
if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// ===========================
// Scroll Reveal Animation
// ===========================

const revealElements = document.querySelectorAll('.reveal, .reveal-delay, .reveal-delay-2');

const revealOnScroll = () => {
    const triggerBottom = window.innerHeight * 0.85;
    
    revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        
        if (elementTop < triggerBottom) {
            element.classList.add('active');
        }
    });
};

// Initial check on page load
revealOnScroll();

// Check on scroll
window.addEventListener('scroll', revealOnScroll);

// ===========================
// Gallery Carousel (Dynamic JSON Loading)
// ===========================

let galleryData = null;
let currentSlideIndex = 0;
let carouselSlides = [];
const carouselPrevBtn = document.getElementById('carousel-prev');
const carouselNextBtn = document.getElementById('carousel-next');
const carouselIndicatorsContainer = document.getElementById('carousel-indicators');
const gallerySlidesContainer = document.getElementById('gallery-slides');

// Load gallery data from JSON
async function loadGalleryData() {
    try {
        const response = await fetch('gallery-data.json');
        if (!response.ok) {
            throw new Error('Failed to load gallery data');
        }
        galleryData = await response.json();
        renderGallery();
        initializeCarousel();
    } catch (error) {
        console.error('Error loading gallery:', error);
        if (gallerySlidesContainer) {
            gallerySlidesContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: rgba(244, 229, 212, 0.8);">
                    <p>Error loading gallery. Please try again later.</p>
                </div>
            `;
        }
    }
}

// Render gallery slides from JSON data
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
    const hotspots = item.hotspots ? item.hotspots.map(hotspot => 
        `<div class="hotspot" data-content="${hotspot.content}" style="left: ${hotspot.x}%; top: ${hotspot.y}%;"></div>`
    ).join('') : '';
    
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

// Render video slide (Cloudinary videos)
function renderVideoSlide(item, index) {
    const isActive = index === 0 ? 'active' : '';
    const videoUrl = item.videoUrl;
    const poster = item.poster || item.thumbnail || '';
    const autoplay = item.autoplay ? 'autoplay' : '';
    const loop = item.loop ? 'loop' : '';
    const muted = item.muted !== false ? 'muted' : ''; // Default to muted for autoplay compatibility
    
    // Cloudinary video URL - can add transformations
    // Example: https://res.cloudinary.com/your-cloud/video/upload/v1234567/video.mp4
    // With transformations: https://res.cloudinary.com/your-cloud/video/upload/q_auto,f_auto/v1234567/video.mp4
    
    return `
        <div class="gallery-slide ${isActive}" data-id="${item.id}" data-type="video">
            <div class="video-container">
                <video 
                    class="video-player"
                    poster="${poster}"
                    controls
                    preload="metadata"
                    ${autoplay}
                    ${loop}
                    ${muted}
                    playsinline
                >
                    <source src="${videoUrl}" type="video/mp4">
                    <source src="${videoUrl.replace(/\.mp4$/i, '.webm')}" type="video/webm">
                    Your browser does not support the video tag.
                </video>
            </div>
            <div class="gallery-overlay">
                <span class="gallery-icon">${item.icon || '🎥'}</span>
            </div>
        </div>
    `;
}

// Initialize carousel functionality
function initializeCarousel() {
    if (!carouselIndicatorsContainer || carouselSlides.length === 0) return;
    
    const totalSlides = carouselSlides.length;
    currentSlideIndex = 0;

    // Create carousel indicators
    function createIndicators() {
        carouselIndicatorsContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.classList.add('carousel-indicator');
            if (i === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => goToSlide(i));
            carouselIndicatorsContainer.appendChild(indicator);
        }
    }

    // Update carousel display
    function updateCarousel() {
        // Remove active class from all slides
        carouselSlides.forEach(slide => {
            slide.classList.remove('active');
            
            // Pause any videos in inactive slides
            const video = slide.querySelector('video');
            if (video) {
                video.pause();
                video.currentTime = 0; // Reset to beginning
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

    // Go to specific slide
    function goToSlide(index) {
        if (index >= 0 && index < totalSlides) {
            currentSlideIndex = index;
            updateCarousel();
        }
    }

    // Navigate to previous slide
    function prevSlide() {
        currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
        updateCarousel();
    }

    // Navigate to next slide
    function nextSlide() {
        currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
        updateCarousel();
    }

    // Event listeners for carousel buttons
    if (carouselPrevBtn) {
        carouselPrevBtn.addEventListener('click', prevSlide);
    }

    if (carouselNextBtn) {
        carouselNextBtn.addEventListener('click', nextSlide);
    }

    // Keyboard navigation for carousel
    document.addEventListener('keydown', (e) => {
        // Only navigate if we're in the gallery section
        const gallerySection = document.getElementById('gallery');
        if (!gallerySection) return;
        
        const rect = gallerySection.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isInView) {
            if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            }
        }
    });

    // Initialize carousel
    createIndicators();
    updateCarousel();

    // Touch/Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    if (gallerySlidesContainer) {
        gallerySlidesContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        gallerySlidesContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                nextSlide();
            } else {
                // Swipe right - previous slide
                prevSlide();
            }
        }
    }
}

// Load gallery on page load (only if gallery page)
if (gallerySlidesContainer) {
    loadGalleryData();
}

// ===========================
// EmailJS Configuration
// ===========================

// Initialize EmailJS with your public key
// IMPORTANT: Replace 'YOUR_PUBLIC_KEY' with your actual EmailJS public key
// Get it from: https://dashboard.emailjs.com/admin/account
const EMAILJS_PUBLIC_KEY = 'tB3W_IO_tAM6wSXw-';
const EMAILJS_SERVICE_ID = 'service_42we7vj';
const EMAILJS_TEMPLATE_ID = 'template_kgkgtf8';

// Initialize EmailJS
if (typeof emailjs !== 'undefined') {
    (function() {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    })();
}

// ===========================
// Booking Form Handler
// ===========================

const bookingForm = document.getElementById('booking-form');

// Format datetime for display
const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Show loading state
        const submitButton = bookingForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        try {
            // Collect all form data
            const formData = new FormData(bookingForm);
            const bookingData = {};
            
            formData.forEach((value, key) => {
                bookingData[key] = value;
            });

            // Format the email parameters
            const emailParams = {
                to_email: 'casperigram@gmail.com',
                from_name: bookingData.name,
                from_email: bookingData.email,
                reply_to: bookingData.email,
                subject: `New Booking Request from ${bookingData.name}`,
                
                // Personal Information
                client_name: bookingData.name,
                client_email: bookingData.email,
                client_phone: bookingData.phone,
                client_pronouns: bookingData.pronouns,
                preferred_contact: bookingData.contact_method,
                
                // Booking Details
                desired_city: bookingData.city,
                date_length: bookingData.date_length.replace(/_/g, ' '),
                preferred_datetime: formatDateTime(bookingData.preferred_datetime),
                location_type: bookingData.location_preference.charAt(0).toUpperCase() + bookingData.location_preference.slice(1),
                additional_info: bookingData.additional_info || 'None provided',
                
                // Formatted message body
                message: `
═══════════════════════════════════════
         NEW BOOKING REQUEST
═══════════════════════════════════════

CLIENT INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${bookingData.name}
Email: ${bookingData.email}
Phone: ${bookingData.phone}
Pronouns: ${bookingData.pronouns}
Preferred Contact: ${bookingData.contact_method}

BOOKING DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Desired City: ${bookingData.city}
Date Length: ${bookingData.date_length.replace(/_/g, ' ')}
Preferred Date/Time: ${formatDateTime(bookingData.preferred_datetime)}
Location Preference: ${bookingData.location_preference.charAt(0).toUpperCase() + bookingData.location_preference.slice(1)}

ADDITIONAL INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${bookingData.additional_info || 'None provided'}

═══════════════════════════════════════
Submitted: ${new Date().toLocaleString('en-US')}
═══════════════════════════════════════
                `
            };

            // Send email via EmailJS
            const response = await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                emailParams
            );

            if (response.status === 200) {
                alert('✅ Thank you for your booking request!\n\nYour information has been received. You will receive a response within 24 hours via your preferred contact method.');
                bookingForm.reset();
            }

        } catch (error) {
            console.error('EmailJS Error:', error);
            
            // User-friendly error messages
            let errorMessage = '❌ Booking Submission Failed\n\n';
            
            if (error.text && error.text.includes('Invalid')) {
                errorMessage += 'EmailJS configuration error. Please contact the site administrator.\n\n';
                errorMessage += 'Alternative: Email your booking to casperigram@gmail.com';
            } else if (!navigator.onLine) {
                errorMessage += 'No internet connection detected.\n\n';
                errorMessage += 'Please check your connection and try again.';
            } else {
                errorMessage += 'Network or service error.\n\n';
                errorMessage += 'Please try again, or email directly to:\ncasperigram@gmail.com';
            }
            
            alert(errorMessage);
        } finally {
            // Restore button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
}

// ===========================
// Intersection Observer for Performance
// ===========================

// Lazy load images
const images = document.querySelectorAll('img[src]');

const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.classList.add('loaded');
            observer.unobserve(img);
        }
    });
}, {
    rootMargin: '50px'
});

images.forEach(img => imageObserver.observe(img));

// ===========================
// Parallax Effect on Hero
// ===========================

const hero = document.querySelector('.hero');

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxSpeed = 0.5;
    
    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    }
});

// ===========================
// Smooth Scroll to Top
// ===========================

// Add a scroll to top button
const createScrollTopButton = () => {
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'scroll-top-btn';
    button.setAttribute('aria-label', 'Scroll to top');
    
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: var(--text-light);
        font-size: 1.5rem;
        border: none;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: 0 4px 15px rgba(45, 27, 61, 0.3);
    `;
    
    document.body.appendChild(button);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            button.style.opacity = '1';
            button.style.visibility = 'visible';
        } else {
            button.style.opacity = '0';
            button.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top on click
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
};

createScrollTopButton();

// ===========================
// Loading Animation
// ===========================

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// ===========================
// Datetime Input Optimization
// ===========================

// Set minimum date to today for datetime-local inputs
const datetimeInput = document.getElementById('preferred_datetime');
if (datetimeInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    datetimeInput.min = minDateTime;
}

// ===========================
// Console Message
// ===========================

console.log('%c Makayla Moon Inc. ', 'background: #2d1b3d; color: #d4af37; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%c Website designed with ❤️ ', 'background: #f4e5d4; color: #2d1b3d; font-size: 14px; padding: 5px;');
console.log('%c Booking powered by JotForm ', 'background: #d4af37; color: #2d1b3d; font-size: 12px; padding: 5px;');
