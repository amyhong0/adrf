class PresentationController {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 12;
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.currentSlideElement = document.getElementById('current-slide');
        this.totalSlidesElement = document.getElementById('total-slides');
        this.progressFill = document.getElementById('progress-fill');
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        // Set initial state
        this.updateSlideCounter();
        this.updateProgressBar();
        this.updateButtonStates();
        
        // Add event listeners
        this.prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.previousSlide();
        });
        
        this.nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.nextSlide();
        });
        
        // Enhanced keyboard navigation with proper event handling
        document.addEventListener('keydown', (e) => {
            // Prevent default behavior for navigation keys
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Home', 'End'].includes(e.key)) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            // Don't process if we're currently transitioning
            if (this.isTransitioning) {
                return;
            }
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ': // Spacebar
                    this.nextSlide();
                    break;
                case 'Home':
                    this.goToSlide(1);
                    break;
                case 'End':
                    this.goToSlide(this.totalSlides);
                    break;
                case 'f':
                case 'F':
                    this.toggleFullscreen();
                    break;
                case '?':
                    if (e.shiftKey) {
                        showKeyboardShortcuts();
                    }
                    break;
            }
        }, { capture: true });
        
        // Touch/swipe support for mobile
        this.initTouchNavigation();
        
        // Add click navigation on slide numbers
        this.currentSlideElement.addEventListener('click', () => {
            this.showSlideSelector();
        });
        
        // Handle image loading for dashboard slides
        this.initImageLoading();
        
        // Prevent context menu on slides
        document.querySelector('.slide-container').addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    nextSlide() {
        if (this.isTransitioning || this.currentSlide >= this.totalSlides) {
            return;
        }
        this.goToSlide(this.currentSlide + 1);
    }
    
    previousSlide() {
        if (this.isTransitioning || this.currentSlide <= 1) {
            return;
        }
        this.goToSlide(this.currentSlide - 1);
    }
    
    goToSlide(slideNumber) {
        if (slideNumber < 1 || slideNumber > this.totalSlides || slideNumber === this.currentSlide || this.isTransitioning) {
            return;
        }
        
        this.isTransitioning = true;
        
        // Remove active class from current slide
        const currentSlideElement = this.slides[this.currentSlide - 1];
        const nextSlideElement = this.slides[slideNumber - 1];
        
        // Add transition direction class for animation
        if (slideNumber > this.currentSlide) {
            nextSlideElement.style.transform = 'translateX(100px)';
        } else {
            nextSlideElement.style.transform = 'translateX(-100px)';
        }
        
        // Force reflow
        nextSlideElement.offsetHeight;
        
        // Start transition
        currentSlideElement.classList.remove('active');
        nextSlideElement.classList.add('active');
        
        // Update current slide number
        this.currentSlide = slideNumber;
        
        // Update UI elements
        this.updateSlideCounter();
        this.updateProgressBar();
        this.updateButtonStates();
        
        // Handle transition end
        setTimeout(() => {
            this.isTransitioning = false;
            nextSlideElement.style.transform = '';
            this.announceSlideChange();
        }, 500);
    }
    
    updateSlideCounter() {
        this.currentSlideElement.textContent = this.currentSlide;
        this.totalSlidesElement.textContent = this.totalSlides;
    }
    
    updateProgressBar() {
        const progress = (this.currentSlide / this.totalSlides) * 100;
        this.progressFill.style.width = `${progress}%`;
    }
    
    updateButtonStates() {
        // Disable/enable previous button
        this.prevBtn.disabled = this.currentSlide === 1;
        
        // Disable/enable next button
        this.nextBtn.disabled = this.currentSlide === this.totalSlides;
        
        // Update button appearance
        if (this.currentSlide === 1) {
            this.prevBtn.style.opacity = '0.5';
        } else {
            this.prevBtn.style.opacity = '1';
        }
        
        if (this.currentSlide === this.totalSlides) {
            this.nextBtn.style.opacity = '0.5';
        } else {
            this.nextBtn.style.opacity = '1';
        }
    }
    
    announceSlideChange() {
        // Create an announcement for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `슬라이드 ${this.currentSlide} / ${this.totalSlides}`;
        
        document.body.appendChild(announcement);
        
        // Remove the announcement after a short delay
        setTimeout(() => {
            if (document.body.contains(announcement)) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    }
    
    initTouchNavigation() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        const slideContainer = document.querySelector('.slide-container');
        
        slideContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        slideContainer.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const minSwipeDistance = 50;
            
            // Check if it's a horizontal swipe and not transitioning
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance && !this.isTransitioning) {
                if (deltaX > 0) {
                    // Swipe right - go to previous slide
                    this.previousSlide();
                } else {
                    // Swipe left - go to next slide
                    this.nextSlide();
                }
            }
        }, { passive: true });
    }
    
    initImageLoading() {
        // Enhance image loading for dashboard images
        const dashboardImages = document.querySelectorAll('.dashboard-image img');
        
        dashboardImages.forEach((img, index) => {
            // Add loading indicator
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'image-loading';
            loadingDiv.innerHTML = '이미지 로딩 중...';
            loadingDiv.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(59, 130, 246, 0.1);
                padding: 1rem;
                border-radius: 8px;
                color: #3b82f6;
                font-size: 0.9rem;
            `;
            
            img.parentElement.style.position = 'relative';
            img.parentElement.appendChild(loadingDiv);
            
            img.addEventListener('load', () => {
                if (loadingDiv && loadingDiv.parentElement) {
                    loadingDiv.parentElement.removeChild(loadingDiv);
                }
                img.style.opacity = '1';
            });
            
            img.addEventListener('error', () => {
                if (loadingDiv) {
                    loadingDiv.innerHTML = 'Zabbix 대시보드 예시 이미지';
                    loadingDiv.style.background = 'rgba(107, 114, 128, 0.1)';
                    loadingDiv.style.color = '#6b7280';
                }
                
                // Create fallback content
                const fallback = document.createElement('div');
                fallback.style.cssText = `
                    width: 100%;
                    height: 250px;
                    background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
                    border: 2px dashed #d1d5db;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    color: #6b7280;
                    font-size: 0.9rem;
                    border-radius: 8px;
                `;
                fallback.innerHTML = `
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
                    <div>Zabbix Dashboard Example</div>
                    <div style="font-size: 0.8rem; margin-top: 0.25rem;">모니터링 대시보드 화면</div>
                `;
                
                img.style.display = 'none';
                img.parentElement.appendChild(fallback);
            });
            
            // Set initial opacity
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
        });
    }
    
    showSlideSelector() {
        // Simple slide selector modal
        const modal = document.createElement('div');
        modal.className = 'slide-selector-modal';
        modal.innerHTML = `
            <div class="slide-selector-content">
                <h3>슬라이드로 이동</h3>
                <div class="slide-selector-grid">
                    ${Array.from({length: this.totalSlides}, (_, i) => 
                        `<button class="slide-selector-btn ${i + 1 === this.currentSlide ? 'active' : ''}" 
                                data-slide="${i + 1}">${i + 1}</button>`
                    ).join('')}
                </div>
                <button class="close-selector">닫기</button>
            </div>
        `;
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .slide-selector-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .slide-selector-content {
                background: white;
                padding: 2rem;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                text-align: center;
                max-width: 400px;
                width: 90%;
            }
            .slide-selector-grid {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                gap: 8px;
                margin: 1rem 0;
            }
            .slide-selector-btn {
                padding: 12px;
                border: 2px solid #e2e8f0;
                background: white;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                font-weight: 500;
            }
            .slide-selector-btn:hover {
                background: #f1f5f9;
                border-color: #3b82f6;
            }
            .slide-selector-btn.active {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            .close-selector {
                margin-top: 1rem;
                padding: 8px 24px;
                background: #6b7280;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('close-selector')) {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            } else if (e.target.classList.contains('slide-selector-btn')) {
                const slideNumber = parseInt(e.target.dataset.slide);
                this.goToSlide(slideNumber);
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }
        });
        
        // Close on Escape key
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.head.removeChild(style);
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);
    }
    
    // Presentation mode toggle
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
}

// Utility functions for enhanced presentation features
class PresentationUtils {
    static enablePrintMode() {
        // Add print-friendly view
        const printBtn = document.createElement('button');
        printBtn.textContent = '인쇄';
        printBtn.className = 'nav-btn';
        printBtn.style.fontSize = '14px';
        printBtn.addEventListener('click', () => {
            window.print();
        });
        
        document.querySelector('.navigation-controls').appendChild(printBtn);
    }
}

// Initialize presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create presentation controller instance
    const presentation = new PresentationController();
    
    // Add enhanced features
    PresentationUtils.enablePrintMode();
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Refresh current slide positioning if needed
            const activeSlide = document.querySelector('.slide.active');
            if (activeSlide) {
                activeSlide.style.transform = 'translateX(0)';
            }
        }, 100);
    });
    
    // Add loading state management
    window.addEventListener('load', () => {
        document.body.classList.add('presentation-loaded');
    });
    
    // Global keyboard shortcut help
    document.addEventListener('keydown', (e) => {
        if ((e.key === '?' && e.shiftKey) || e.key === 'F1') {
            e.preventDefault();
            showKeyboardShortcuts();
        }
    });
});

function showKeyboardShortcuts() {
    const modal = document.createElement('div');
    modal.className = 'shortcuts-modal';
    modal.innerHTML = `
        <div class="shortcuts-content">
            <h3>키보드 단축키</h3>
            <div class="shortcuts-list">
                <div class="shortcut-item">
                    <div><kbd>←</kbd><kbd>↑</kbd></div>
                    <span>이전 슬라이드</span>
                </div>
                <div class="shortcut-item">
                    <div><kbd>→</kbd><kbd>↓</kbd><kbd>Space</kbd></div>
                    <span>다음 슬라이드</span>
                </div>
                <div class="shortcut-item">
                    <div><kbd>Home</kbd></div>
                    <span>첫 번째 슬라이드</span>
                </div>
                <div class="shortcut-item">
                    <div><kbd>End</kbd></div>
                    <span>마지막 슬라이드</span>
                </div>
                <div class="shortcut-item">
                    <div><kbd>F</kbd></div>
                    <span>전체화면 토글</span>
                </div>
                <div class="shortcut-item">
                    <div><kbd>Shift</kbd> + <kbd>?</kbd></div>
                    <span>단축키 도움말</span>
                </div>
                <div class="shortcut-item">
                    <div><kbd>Esc</kbd></div>
                    <span>모달 닫기</span>
                </div>
            </div>
            <button class="close-shortcuts">닫기</button>
        </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .shortcuts-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .shortcuts-content {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            max-width: 500px;
            width: 90%;
        }
        .shortcuts-content h3 {
            margin-top: 0;
            color: #1e3a8a;
            text-align: center;
        }
        .shortcuts-list {
            margin: 1.5rem 0;
        }
        .shortcut-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.75rem 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .shortcut-item:last-child {
            border-bottom: none;
        }
        .shortcut-item div {
            display: flex;
            gap: 4px;
        }
        kbd {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 4px 8px;
            font-family: monospace;
            font-size: 0.85em;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .close-shortcuts {
            width: 100%;
            padding: 12px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
        }
        .close-shortcuts:hover {
            background: #2563eb;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('close-shortcuts')) {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        }
    });
    
    // Close on Escape key
    const closeOnEscape = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.head.removeChild(style);
            document.removeEventListener('keydown', closeOnEscape);
        }
    };
    document.addEventListener('keydown', closeOnEscape);
}

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PresentationController, PresentationUtils };
}