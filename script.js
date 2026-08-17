document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-button');
    const menu = document.querySelector('.mobile-menu');

    if (!menuButton || !menu) return;

    menuButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isOpen = menu.classList.toggle('open');
        menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close menu when a link is tapped
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
            menuButton.setAttribute('aria-expanded', 'false');
        });
    });
});

/* ==========================
   Hero Slider
========================== */
(function () {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const nextBtn = document.querySelector('.hero-arrow-next');
    if (!nextBtn) {
        console.log('next button not found');
        return;
    }
    const dotsContainer = document.querySelector('.hero-dots');
    if (!dotsContainer) return;

    let current = 0;
    let timer = null;
    const INTERVAL = 9000;

    // Build dots
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'hero-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.querySelectorAll('.hero-dot'));

    function goTo(index) {
        const prev = current;
        current = (index + slides.length) % slides.length;

        slides[prev].classList.remove('is-active');
        dots[prev].classList.remove('is-active');

        requestAnimationFrame(() => {
            slides[current].classList.add('is-active');
            dots[current].classList.add('is-active');
        });
    }

    function next() {
        goTo(current + 1);
    }

    function startAutoplay() {
        stopAutoplay();
        timer = setInterval(next, INTERVAL);
    }

    function stopAutoplay() {
        if (timer) clearInterval(timer);
    }

    nextBtn.addEventListener('click', () => {
        next();
        startAutoplay();
    });

    // Pause on hover
    const hero = document.querySelector('.hero');
    hero.addEventListener('mouseenter', stopAutoplay);
    hero.addEventListener('mouseleave', startAutoplay);

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            next();
            startAutoplay();
        }
    });

    document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('is-flipped');
  });
});

    startAutoplay();
})();
