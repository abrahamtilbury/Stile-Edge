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
    if (!nextBtn) return;
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
    if (hero) {
        hero.addEventListener('mouseenter', stopAutoplay);
        hero.addEventListener('mouseleave', startAutoplay);
    }

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            next();
            startAutoplay();
        }
    });

    startAutoplay();
})();

/* ==========================
   Project Cards Flip
========================== */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('is-flipped');
        });
    });
});

/* ==========================
   Contact Form (Formspree)
========================== */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const started = document.getElementById('form-started');
    const status = document.getElementById('form-status');
    const submitBtn = form.querySelector('[type="submit"]');

    if (started) started.value = String(Date.now());

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const website = form.querySelector('[name="website"]');
        const gotcha = form.querySelector('[name="_gotcha"]');
        if ((website && website.value.trim() !== '') ||
            (gotcha && gotcha.value.trim() !== '')) {
            return;
        }

        const t0 = Number(started?.value || 0);
        if (t0 && Date.now() - t0 < 2500) {
            showStatus('Please take a moment and try again.', false);
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';

        try {
            const res = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            });

            if (res.ok) {
                form.reset();
                if (started) started.value = String(Date.now());
                showStatus('Message sent. We’ll get back to you shortly.', true);
            } else {
                const data = await res.json().catch(() => ({}));
                showStatus(
                    data.error || 'Something went wrong. Email sales@stileedge.com instead.',
                    false
                );
            }
        } catch {
            showStatus('Network error. Please email sales@stileedge.com.', false);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send message';
        }
    });

    function showStatus(msg, ok) {
        status.hidden = false;
        status.textContent = msg;
        status.classList.toggle('is-success', ok);
        status.classList.toggle('is-error', !ok);
    }
});
