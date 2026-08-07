// ==========================================================================
// PORTFOLIO AGUSTIN POLLAN — MAIN JAVASCRIPT
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {

    // Lucide Icons Initialization
    if (window.lucide) {
        lucide.createIcons();
    }

    // Navbar Scroll Shadow
    const header = document.querySelector('.main-header-light');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
            });
        });
    }

    // Smooth Scroll for Nav Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================================================
    // CAROUSEL SLIDER LOGIC (100% FLAWLESS FILTERING)
    // ==========================================================================
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('carouselPrevBtn');
    const nextBtn = document.getElementById('carouselNextBtn');
    const dotsContainer = document.getElementById('carouselDots');
    
    if (track && prevBtn && nextBtn && dotsContainer) {
        let allSlides = Array.from(track.children);
        let visibleSlides = allSlides;
        let currentVisibleIndex = 0;

        function updateDots() {
            dotsContainer.innerHTML = '';
            visibleSlides.forEach((slide, idx) => {
                const dot = document.createElement('button');
                dot.classList.add('dot-btn');
                if (idx === currentVisibleIndex) dot.classList.add('active');
                dot.addEventListener('click', () => goToVisibleSlide(idx));
                dotsContainer.appendChild(dot);
            });
        }

        function goToVisibleSlide(index) {
            if (visibleSlides.length === 0) return;
            if (index < 0) index = visibleSlides.length - 1;
            if (index >= visibleSlides.length) index = 0;
            currentVisibleIndex = index;

            // Shift track to visible slide index
            track.style.transform = `translateX(-${currentVisibleIndex * 100}%)`;
            updateDots();
        }

        prevBtn.addEventListener('click', () => goToVisibleSlide(currentVisibleIndex - 1));
        nextBtn.addEventListener('click', () => goToVisibleSlide(currentVisibleIndex + 1));

        // Category Filter Buttons Handler
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter slides visibility
                allSlides.forEach(slide => {
                    const cat = slide.getAttribute('data-category') || '';
                    if (filter === 'all' || cat.includes(filter)) {
                        slide.style.display = 'block';
                    } else {
                        slide.style.display = 'none';
                    }
                });

                visibleSlides = allSlides.filter(s => s.style.display !== 'none');
                goToVisibleSlide(0);
            });
        });

        // Initialize Carousel at slide 0
        goToVisibleSlide(0);
    }

    // ==========================================================================
    // FORMULARIO DE CONTACTO INTERACTIVO
    // ==========================================================================
    const contactForm = document.getElementById('contactForm');
    const contactSuccess = document.getElementById('contactFormSuccess');
    if (contactForm && contactSuccess) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            contactSuccess.style.display = 'block';
            contactForm.reset();
            setTimeout(() => {
                contactSuccess.style.display = 'none';
            }, 5000);
        });
    }

});
