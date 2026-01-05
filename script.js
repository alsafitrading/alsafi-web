// ============================================
// Performance Optimizations
// ============================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// Mobile Menu Toggle
// ============================================
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');

        // Animate hamburger icon
        const spans = mobileMenuToggle.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translateY(8px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            navMenu.classList.remove('active');
            const spans = mobileMenuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
});

// ============================================
// Navbar Scroll Effect
// ============================================
const navbar = document.getElementById('navbar');

const handleScroll = throttle(() => {
    const hero = document.getElementById('home');
    const heroSun = document.getElementById('heroSun');
    const scrollY = window.scrollY;
    
    // Navbar scroll effect
    if (scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Hero sunset effect
    if (hero && heroSun) {
        const maxScroll = 500;
        const scrollProgress = Math.min(scrollY / maxScroll, 1);
        
        if (scrollY > 50) {
            hero.classList.add('scrolled');
            // Gradually fade and move sun down
            const opacity = 1 - scrollProgress;
            const translateY = scrollProgress * 200;
            const scale = 1 - (scrollProgress * 0.5);
            const blur = 60 + (scrollProgress * 40);
            
            heroSun.style.opacity = opacity;
            heroSun.style.transform = `translateX(-50%) translateY(${translateY}px) scale(${scale})`;
            heroSun.style.filter = `blur(${blur}px)`;
        } else {
            hero.classList.remove('scrolled');
            heroSun.style.opacity = '1';
            heroSun.style.transform = 'translateX(-50%) translateY(0) scale(1)';
            heroSun.style.filter = 'blur(60px)';
        }
    }
}, 100);

window.addEventListener('scroll', handleScroll);

// ============================================
// Active Navigation Link
// ============================================
const sections = document.querySelectorAll('section[id]');

const setActiveLink = throttle(() => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = sectionId;
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}, 100);

window.addEventListener('scroll', setActiveLink);

// ============================================
// Smooth Scrolling for Anchor Links
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');

        if (targetId === '#') return;

        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// Lazy Loading Images
// ============================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px'
    });

    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
    });
} else {
    // Fallback for browsers without IntersectionObserver
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        img.classList.add('loaded');
    });
}

// ============================================
// Stats Counter Animation
// ============================================
const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);

    const updateCounter = () => {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };

    updateCounter();
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('.stat-number');
            const target = parseInt(statNumber.getAttribute('data-target'));

            if (!statNumber.classList.contains('animated')) {
                statNumber.classList.add('animated');
                animateCounter(statNumber, target);
            }

            statsObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.5
});

document.querySelectorAll('.stat-item').forEach(stat => {
    statsObserver.observe(stat);
});

// ============================================
// Contact Form Handling
// ============================================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        // Get button and disable it during submission
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        // Simulate form submission (replace with actual API call)
        try {
            // Here you would typically send data to your server
            // await fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) });

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Show success message
            showNotification('Thank you! Your message has been sent successfully.', 'success');
            contactForm.reset();
        } catch (error) {
            showNotification('Sorry, there was an error sending your message. Please try again.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

// ============================================
// Notification System
// ============================================
function showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// Product Card Hover Effects
// ============================================
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-8px)';
    });

    card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0)';
    });
});

// ============================================
// Performance: Preload Critical Resources
// ============================================
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
        // Preload images that are likely to be viewed
        const criticalImages = document.querySelectorAll('.product-image img');
        criticalImages.forEach(img => {
            if (img.src && !img.complete) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = img.src;
                document.head.appendChild(link);
            }
        });
    });
}

// ============================================
// Initialize on DOM Load
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Set initial active nav link
    setActiveLink();

    // Initialize lazy loading - ensure all images are visible
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(img => {
        // If image is already loaded, add loaded class immediately
        if (img.complete && img.naturalHeight !== 0) {
            img.classList.add('loaded');
        } else {
            // If not loaded yet, add loaded class when it loads
            img.addEventListener('load', function () {
                this.classList.add('loaded');
            });
            // Also add loaded class after a short delay to ensure visibility
            setTimeout(() => {
                img.classList.add('loaded');
            }, 100);
        }
    });

    console.log('AL SAFI Website initialized successfully');
});

// ============================================
// Error Handling for Images
// ============================================
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function () {
        // Replace broken image with placeholder
        this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage not available%3C/text%3E%3C/svg%3E';
        this.alt = 'Image not available';
    });
});

// ============================================
// Accessibility: Keyboard Navigation
// ============================================
document.addEventListener('keydown', (e) => {
    // Close mobile menu on Escape key
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        const spans = mobileMenuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// ============================================
// Clients Carousel Auto-Scroll
// ============================================
const clientsCarousel = document.getElementById('clientsCarousel');

if (clientsCarousel) {
    // Reset animation when it completes for seamless loop
    clientsCarousel.addEventListener('animationiteration', () => {
        // Animation will seamlessly loop due to duplicate items
    });

    // Pause on hover (already handled by CSS, but adding for better control)
    const carouselWrapper = clientsCarousel.closest('.clients-carousel-wrapper');
    if (carouselWrapper) {
        carouselWrapper.addEventListener('mouseenter', () => {
            clientsCarousel.style.animationPlayState = 'paused';
        });

        carouselWrapper.addEventListener('mouseleave', () => {
            clientsCarousel.style.animationPlayState = 'running';
        });
    }
}

// ============================================
// SEO: Structured Data (JSON-LD)
// ============================================
const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AL SAFI GENERAL TRADING LLC",
    "description": "Leading provider of weighing scales, POS solutions, automation systems, and packaging solutions in UAE and Oman",
    "url": window.location.origin,
    "logo": `${window.location.origin}/logo.png`,
    "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "areaServed": ["AE", "OM"],
        "availableLanguage": ["en", "ar"]
    },
    "sameAs": []
};

const script = document.createElement('script');
script.type = 'application/ld+json';
script.textContent = JSON.stringify(structuredData);
document.head.appendChild(script);

// ============================================
// Product Gallery Modal
// ============================================
const productImages = {
    1: ['images/p1.jpeg'], // Retail Weighing Scales
    2: ['images/p2.jpeg'], // POS Systems
    3: ['images/p3.png'], // Industrial Scales
    4: ['images/p4.png'], // Checkweighers
    5: ['images/p5.jpeg'], // Filling Systems
    6: ['images/p6.jpeg'], // Shrink Wrapping Machines
    7: ['images/p7.jpeg'], // Stretch Wrapping Machines
    8: ['images/p8.jpeg']  // Taping Machines
};

const galleryModal = document.getElementById('galleryModal');
const galleryClose = document.getElementById('galleryClose');
const galleryTitle = document.getElementById('galleryTitle');
const galleryContainer = document.getElementById('galleryContainer');
const galleryCounter = document.getElementById('galleryCounter');
let currentProductId = null;
let currentImageIndex = 0;

// Open gallery modal
document.querySelectorAll('.btn-show-more').forEach(button => {
    button.addEventListener('click', function() {
        const productId = parseInt(this.getAttribute('data-product'));
        const productTitle = this.getAttribute('data-title');
        openGallery(productId, productTitle);
    });
});

function openGallery(productId, title) {
    currentProductId = productId;
    currentImageIndex = 0;
    galleryTitle.textContent = title;
    galleryContainer.innerHTML = '';
    
    const images = productImages[productId] || [];
    
    if (images.length === 0) {
        galleryContainer.innerHTML = '<p style="color: white; text-align: center; padding: 2rem;">No images available for this product.</p>';
    } else {
        images.forEach((imageSrc, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `<img src="${imageSrc}" alt="${title} - Image ${index + 1}" loading="lazy">`;
            galleryItem.addEventListener('click', () => openLightbox(index));
            galleryContainer.appendChild(galleryItem);
        });
    }
    
    updateGalleryCounter();
    galleryModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function updateGalleryCounter() {
    const images = productImages[currentProductId] || [];
    galleryCounter.textContent = `${currentImageIndex + 1} / ${images.length}`;
}

// Close gallery modal
galleryClose.addEventListener('click', closeGallery);
galleryModal.addEventListener('click', function(e) {
    if (e.target === this || e.target.classList.contains('gallery-modal-overlay')) {
        closeGallery();
    }
});

function closeGallery() {
    galleryModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (galleryModal.classList.contains('active')) {
        if (e.key === 'Escape') {
            closeGallery();
        } else if (e.key === 'ArrowLeft') {
            navigateGallery(-1);
        } else if (e.key === 'ArrowRight') {
            navigateGallery(1);
        }
    }
});

function navigateGallery(direction) {
    const images = productImages[currentProductId] || [];
    if (images.length === 0) return;
    
    currentImageIndex += direction;
    if (currentImageIndex < 0) currentImageIndex = images.length - 1;
    if (currentImageIndex >= images.length) currentImageIndex = 0;
    
    updateGalleryCounter();
    // Scroll to current image
    const items = galleryContainer.querySelectorAll('.gallery-item');
    if (items[currentImageIndex]) {
        items[currentImageIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Gallery navigation buttons
const galleryPrev = document.getElementById('galleryPrev');
const galleryNext = document.getElementById('galleryNext');

if (galleryPrev) {
    galleryPrev.addEventListener('click', () => navigateGallery(-1));
}

if (galleryNext) {
    galleryNext.addEventListener('click', () => navigateGallery(1));
}

// Lightbox for full image view
function openLightbox(index) {
    const images = productImages[currentProductId] || [];
    if (images.length === 0) return;
    
    currentImageIndex = index;
    
    // Create lightbox if it doesn't exist
    let lightbox = document.getElementById('galleryLightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'galleryLightbox';
        lightbox.className = 'gallery-lightbox';
        lightbox.innerHTML = `
            <button class="gallery-lightbox-close" id="lightboxClose">&times;</button>
            <img id="lightboxImage" src="" alt="Product image">
        `;
        document.body.appendChild(lightbox);
        
        document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) closeLightbox();
        });
    }
    
    const lightboxImage = document.getElementById('lightboxImage');
    lightboxImage.src = images[index];
    lightboxImage.alt = `${galleryTitle.textContent} - Image ${index + 1}`;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('galleryLightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

