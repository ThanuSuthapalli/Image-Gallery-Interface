// ==========================================================================
// Image Manipulation Interface - Focused Functionality
// Clean, modern interface without website overhead
// ==========================================================================

'use strict';

/**
 * Image Interface Application
 * Handles slideshow and gallery functionality in a clean interface
 */
class ImageInterface {
    constructor() {
        // State management
        this.currentSlide = 0;
        this.totalSlides = 0;
        this.currentImageIndex = 0;
        this.totalImages = 0;
        this.autoplayInterval = null;
        this.autoplaySpeed = 5000;
        this.isAutoplayEnabled = true;
        this.currentView = 'slideshow';
        this.zoomLevel = 1;

        // DOM elements
        this.slides = [];
        this.indicators = [];
        this.thumbnails = [];
        this.images = [];

        // Touch handling
        this.touchStartX = 0;
        this.touchEndX = 0;

        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupInterface();
            });
        } else {
            this.setupInterface();
        }
    }

    setupInterface() {
        this.setupViewToggle();
        this.setupSlideshow();
        this.setupGallery();
        this.setupSettings();
        this.setupKeyboardControls();
        this.setupTouchControls();
        this.setupFullscreen();

        console.log('🎨 Image Interface initialized');
        console.log('🖼️ Slideshow and gallery functionality active');
    }

    // ==========================================================================
    // VIEW TOGGLE FUNCTIONALITY
    // ==========================================================================

    setupViewToggle() {
        const toggleButtons = document.querySelectorAll('.toggle-btn');

        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const view = button.dataset.view;
                this.switchView(view);
                this.updateToggleButtons(button);
            });
        });
    }

    switchView(view) {
        // Hide all views
        document.querySelectorAll('.view-container').forEach(container => {
            container.classList.remove('active');
        });

        // Show selected view
        const viewContainer = document.getElementById(`${view}-view`);
        if (viewContainer) {
            viewContainer.classList.add('active');
            this.currentView = view;

            // Initialize view-specific functionality
            if (view === 'slideshow' && this.isAutoplayEnabled) {
                this.startAutoplay();
            } else {
                this.stopAutoplay();
            }
        }
    }

    updateToggleButtons(activeButton) {
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeButton.classList.add('active');
    }

    // ==========================================================================
    // SLIDESHOW FUNCTIONALITY
    // ==========================================================================

    setupSlideshow() {
        this.slides = document.querySelectorAll('.slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.totalSlides = this.slides.length;

        if (this.totalSlides === 0) return;

        // Initialize first slide
        this.showSlide(0);

        // Start autoplay if enabled
        if (this.isAutoplayEnabled && this.currentView === 'slideshow') {
            this.startAutoplay();
        }

        console.log(`✅ Slideshow initialized with ${this.totalSlides} slides`);
    }

    showSlide(index) {
        // Validate index
        if (index >= this.totalSlides) {
            this.currentSlide = 0;
        } else if (index < 0) {
            this.currentSlide = this.totalSlides - 1;
        } else {
            this.currentSlide = index;
        }

        // Update slides
        this.slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === this.currentSlide);
        });

        // Update indicators
        this.indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === this.currentSlide);
        });
    }

    nextSlide() {
        this.showSlide(this.currentSlide + 1);
    }

    prevSlide() {
        this.showSlide(this.currentSlide - 1);
    }

    startAutoplay() {
        this.stopAutoplay(); // Clear any existing interval

        if (this.isAutoplayEnabled && this.totalSlides > 1) {
            this.autoplayInterval = setInterval(() => {
                this.nextSlide();
            }, this.autoplaySpeed);
        }
    }

    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    // ==========================================================================
    // GALLERY FUNCTIONALITY
    // ==========================================================================

    setupGallery() {
        this.thumbnails = document.querySelectorAll('.thumbnail');
        this.totalImages = this.thumbnails.length;

        // Store image data
        this.images = Array.from(this.thumbnails).map((thumb, index) => {
            const img = thumb.querySelector('img');
            return {
                index,
                src: thumb.onclick.toString().match(/https:\/\/[^']+/)?.[0] || img.src,
                title: thumb.onclick.toString().match(/'([^']+)'/g)?.[2]?.replace(/'/g, '') || 'Image',
                description: thumb.onclick.toString().match(/'([^']+)'/g)?.[3]?.replace(/'/g, '') || 'Description',
                category: thumb.onclick.toString().match(/'([^']+)'/g)?.[4]?.replace(/'/g, '') || 'Category',
                date: thumb.onclick.toString().match(/'([^']+)'/g)?.[5]?.replace(/'/g, '') || '2025'
            };
        });

        // Set initial active thumbnail
        if (this.thumbnails.length > 0) {
            this.currentImageIndex = 0;
            this.updateActiveThumbnail();
        }

        console.log(`✅ Gallery initialized with ${this.totalImages} images`);
    }

    selectImage(element, src, title, description, category, date) {
        const mainImage = document.getElementById('mainImage');
        const imageTitle = document.getElementById('imageTitle');
        const imageDesc = document.getElementById('imageDesc');
        const imageCategory = document.getElementById('imageCategory');
        const imageDate = document.getElementById('imageDate');

        if (!mainImage) return;

        // Show loading
        this.showLoading();

        // Add transition effect
        mainImage.style.opacity = '0.5';
        mainImage.style.transform = 'scale(0.98)';

        // Load new image
        const img = new Image();
        img.onload = () => {
            // Update image and info
            mainImage.src = src;
            mainImage.alt = title;

            if (imageTitle) imageTitle.textContent = title;
            if (imageDesc) imageDesc.textContent = description;
            if (imageCategory) imageCategory.textContent = category;
            if (imageDate) imageDate.textContent = date;

            // Animate in
            setTimeout(() => {
                mainImage.style.opacity = '1';
                mainImage.style.transform = 'scale(1)';
            }, 100);

            // Update active state
            this.thumbnails.forEach(thumb => thumb.classList.remove('active'));
            element.classList.add('active');

            // Update current index
            this.currentImageIndex = Array.from(this.thumbnails).indexOf(element);

            this.hideLoading();
        };

        img.onerror = () => {
            console.error('Failed to load image:', src);
            mainImage.style.opacity = '1';
            mainImage.style.transform = 'scale(1)';
            this.hideLoading();
        };

        img.src = src;
    }

    updateActiveThumbnail() {
        this.thumbnails.forEach((thumb, index) => {
            thumb.classList.toggle('active', index === this.currentImageIndex);
        });
    }

    nextImage() {
        if (this.currentImageIndex < this.totalImages - 1) {
            this.currentImageIndex++;
        } else {
            this.currentImageIndex = 0;
        }
        this.selectImageByIndex(this.currentImageIndex);
    }

    previousImage() {
        if (this.currentImageIndex > 0) {
            this.currentImageIndex--;
        } else {
            this.currentImageIndex = this.totalImages - 1;
        }
        this.selectImageByIndex(this.currentImageIndex);
    }

    selectImageByIndex(index) {
        if (index >= 0 && index < this.totalImages && this.thumbnails[index]) {
            this.thumbnails[index].click();
        }
    }

    // ==========================================================================
    // ZOOM FUNCTIONALITY
    // ==========================================================================

    zoomIn() {
        this.zoomLevel = Math.min(this.zoomLevel * 1.2, 3);
        this.applyZoom();
    }

    zoomOut() {
        this.zoomLevel = Math.max(this.zoomLevel / 1.2, 0.5);
        this.applyZoom();
    }

    resetZoom() {
        this.zoomLevel = 1;
        this.applyZoom();
    }

    applyZoom() {
        const mainImage = document.getElementById('mainImage');
        if (mainImage) {
            mainImage.style.transform = `scale(${this.zoomLevel})`;
            mainImage.style.cursor = this.zoomLevel > 1 ? 'zoom-out' : 'zoom-in';
        }
    }

    // ==========================================================================
    // SETTINGS PANEL
    // ==========================================================================

    setupSettings() {
        // Autoplay toggle
        const autoplayToggle = document.getElementById('autoplay');
        if (autoplayToggle) {
            autoplayToggle.addEventListener('change', (e) => {
                this.isAutoplayEnabled = e.target.checked;
                if (this.isAutoplayEnabled && this.currentView === 'slideshow') {
                    this.startAutoplay();
                } else {
                    this.stopAutoplay();
                }
            });
        }

        // Speed control
        const speedButtons = document.querySelectorAll('.speed-btn');
        speedButtons.forEach(button => {
            button.addEventListener('click', () => {
                const speed = parseInt(button.dataset.speed);
                this.autoplaySpeed = speed;

                // Update active button
                speedButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Restart autoplay with new speed
                if (this.isAutoplayEnabled && this.currentView === 'slideshow') {
                    this.startAutoplay();
                }
            });
        });

        // Effect selector
        const effectSelector = document.querySelector('.effect-selector');
        if (effectSelector) {
            effectSelector.addEventListener('change', (e) => {
                const effect = e.target.value;
                this.applyTransitionEffect(effect);
            });
        }
    }

    applyTransitionEffect(effect) {
        const slides = document.querySelectorAll('.slide');
        slides.forEach(slide => {
            slide.classList.remove('fade-effect', 'slide-effect', 'zoom-effect');
            slide.classList.add(`${effect}-effect`);
        });
    }

    // ==========================================================================
    // FULLSCREEN FUNCTIONALITY
    // ==========================================================================

    setupFullscreen() {
        const modal = document.getElementById('fullscreenModal');

        // Close on background click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeFullscreen();
                }
            });
        }
    }

    toggleFullscreen() {
        const modal = document.getElementById('fullscreenModal');
        const isActive = modal.classList.contains('active');

        if (isActive) {
            this.closeFullscreen();
        } else {
            this.openFullscreen();
        }
    }

    openFullscreen() {
        const modal = document.getElementById('fullscreenModal');
        const fullscreenImage = document.getElementById('fullscreenImage');
        const fullscreenTitle = document.getElementById('fullscreenTitle');
        const fullscreenDesc = document.getElementById('fullscreenDesc');
        const mainImage = document.getElementById('mainImage');
        const imageTitle = document.getElementById('imageTitle');
        const imageDesc = document.getElementById('imageDesc');

        if (!modal || !fullscreenImage) return;

        // Copy current image data
        fullscreenImage.src = mainImage.src;
        fullscreenImage.alt = mainImage.alt;

        if (fullscreenTitle && imageTitle) {
            fullscreenTitle.textContent = imageTitle.textContent;
        }
        if (fullscreenDesc && imageDesc) {
            fullscreenDesc.textContent = imageDesc.textContent;
        }

        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus for accessibility
        modal.focus();
    }

    closeFullscreen() {
        const modal = document.getElementById('fullscreenModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    fullscreenNext() {
        this.nextImage();
        // Update fullscreen content
        setTimeout(() => this.updateFullscreenContent(), 200);
    }

    fullscreenPrev() {
        this.previousImage();
        // Update fullscreen content
        setTimeout(() => this.updateFullscreenContent(), 200);
    }

    updateFullscreenContent() {
        const fullscreenImage = document.getElementById('fullscreenImage');
        const fullscreenTitle = document.getElementById('fullscreenTitle');
        const fullscreenDesc = document.getElementById('fullscreenDesc');
        const mainImage = document.getElementById('mainImage');
        const imageTitle = document.getElementById('imageTitle');
        const imageDesc = document.getElementById('imageDesc');

        if (fullscreenImage && mainImage) {
            fullscreenImage.src = mainImage.src;
            fullscreenImage.alt = mainImage.alt;
        }

        if (fullscreenTitle && imageTitle) {
            fullscreenTitle.textContent = imageTitle.textContent;
        }

        if (fullscreenDesc && imageDesc) {
            fullscreenDesc.textContent = imageDesc.textContent;
        }
    }

    // ==========================================================================
    // KEYBOARD CONTROLS
    // ==========================================================================

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('fullscreenModal');
            const isFullscreen = modal && modal.classList.contains('active');

            if (isFullscreen) {
                // Fullscreen controls
                switch (e.key) {
                    case 'Escape':
                        this.closeFullscreen();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.fullscreenPrev();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.fullscreenNext();
                        break;
                }
            } else {
                // Main interface controls
                switch (e.key) {
                    case 'ArrowLeft':
                        if (this.currentView === 'slideshow') {
                            e.preventDefault();
                            this.prevSlide();
                        } else if (this.currentView === 'gallery') {
                            e.preventDefault();
                            this.previousImage();
                        }
                        break;
                    case 'ArrowRight':
                        if (this.currentView === 'slideshow') {
                            e.preventDefault();
                            this.nextSlide();
                        } else if (this.currentView === 'gallery') {
                            e.preventDefault();
                            this.nextImage();
                        }
                        break;
                    case ' ':
                        if (this.currentView === 'slideshow') {
                            e.preventDefault();
                            this.toggleAutoplay();
                        }
                        break;
                    case '1':
                        e.preventDefault();
                        this.switchView('slideshow');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchView('gallery');
                        break;
                    case 'f':
                        if (this.currentView === 'gallery') {
                            e.preventDefault();
                            this.toggleFullscreen();
                        }
                        break;
                }
            }
        });
    }

    toggleAutoplay() {
        const autoplayToggle = document.getElementById('autoplay');
        if (autoplayToggle) {
            autoplayToggle.checked = !autoplayToggle.checked;
            autoplayToggle.dispatchEvent(new Event('change'));
        }
    }

    // ==========================================================================
    // TOUCH CONTROLS
    // ==========================================================================

    setupTouchControls() {
        const slideshowDisplay = document.querySelector('.slideshow-display');
        const mainDisplay = document.querySelector('.main-display');

        // Slideshow touch controls
        if (slideshowDisplay) {
            slideshowDisplay.addEventListener('touchstart', (e) => {
                this.touchStartX = e.touches[0].clientX;
            }, { passive: true });

            slideshowDisplay.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].clientX;
                this.handleSlideshowSwipe();
            }, { passive: true });
        }

        // Gallery touch controls
        if (mainDisplay) {
            mainDisplay.addEventListener('touchstart', (e) => {
                this.touchStartX = e.touches[0].clientX;
            }, { passive: true });

            mainDisplay.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].clientX;
                this.handleGallerySwipe();
            }, { passive: true });
        }

        // Fullscreen touch controls
        const modal = document.getElementById('fullscreenModal');
        if (modal) {
            modal.addEventListener('touchstart', (e) => {
                this.touchStartX = e.touches[0].clientX;
            }, { passive: true });

            modal.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].clientX;
                this.handleFullscreenSwipe();
            }, { passive: true });
        }
    }

    handleSlideshowSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = this.touchStartX - this.touchEndX;

        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                // Swipe left - next slide
                this.nextSlide();
            } else {
                // Swipe right - previous slide
                this.prevSlide();
            }
        }
    }

    handleGallerySwipe() {
        const swipeThreshold = 50;
        const swipeDistance = this.touchStartX - this.touchEndX;

        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                // Swipe left - next image
                this.nextImage();
            } else {
                // Swipe right - previous image
                this.previousImage();
            }
        }
    }

    handleFullscreenSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = this.touchStartX - this.touchEndX;

        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                // Swipe left - next image
                this.fullscreenNext();
            } else {
                // Swipe right - previous image
                this.fullscreenPrev();
            }
        }
    }

    // ==========================================================================
    // UTILITY FUNCTIONS
    // ==========================================================================

    showLoading() {
        const loader = document.getElementById('loadingIndicator');
        if (loader) {
            loader.classList.add('active');
        }
    }

    hideLoading() {
        const loader = document.getElementById('loadingIndicator');
        if (loader) {
            loader.classList.remove('active');
        }
    }

    // ==========================================================================
    // PUBLIC API METHODS
    // ==========================================================================

    goToSlide(index) {
        this.showSlide(index);
    }

    changeSlide(direction) {
        if (direction > 0) {
            this.nextSlide();
        } else {
            this.prevSlide();
        }
    }

    getCurrentView() {
        return this.currentView;
    }

    getCurrentSlide() {
        return this.currentSlide;
    }

    getCurrentImage() {
        return this.currentImageIndex;
    }
}

// ==========================================================================
// INITIALIZE APPLICATION
// ==========================================================================

let imageInterface;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    imageInterface = new ImageInterface();

    // Make interface available globally for HTML onclick handlers
    window.imageInterface = imageInterface;

    console.log('🎨 Image Interface loaded successfully!');
});

// ==========================================================================
// GLOBAL FUNCTIONS FOR HTML ONCLICK HANDLERS
// ==========================================================================

function changeSlide(direction) {
    if (imageInterface) {
        imageInterface.changeSlide(direction);
    }
}

function goToSlide(index) {
    if (imageInterface) {
        imageInterface.goToSlide(index);
    }
}

function selectImage(element, src, title, description, category, date) {
    if (imageInterface) {
        imageInterface.selectImage(element, src, title, description, category, date);
    }
}

function nextImage() {
    if (imageInterface) {
        imageInterface.nextImage();
    }
}

function previousImage() {
    if (imageInterface) {
        imageInterface.previousImage();
    }
}

function zoomIn() {
    if (imageInterface) {
        imageInterface.zoomIn();
    }
}

function zoomOut() {
    if (imageInterface) {
        imageInterface.zoomOut();
    }
}

function resetZoom() {
    if (imageInterface) {
        imageInterface.resetZoom();
    }
}

function toggleFullscreen() {
    if (imageInterface) {
        imageInterface.toggleFullscreen();
    }
}

function fullscreenNext() {
    if (imageInterface) {
        imageInterface.fullscreenNext();
    }
}

function fullscreenPrev() {
    if (imageInterface) {
        imageInterface.fullscreenPrev();
    }
}

// ==========================================================================
// PERFORMANCE MONITORING
// ==========================================================================

// Monitor interface performance
window.addEventListener('load', () => {
    if ('performance' in window) {
        setTimeout(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            const loadTime = navigation.loadEventEnd - navigation.fetchStart;

            console.log('⚡ Interface Performance:');
            console.log(`📊 Load Time: ${Math.round(loadTime)}ms`);

            if (loadTime < 1000) {
                console.log('🚀 Excellent interface performance!');
            }
        }, 1000);
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageInterface;
}

console.log('🖼️ Image Interface JavaScript loaded successfully!');
console.log('🎮 Interactive controls and touch gestures ready');