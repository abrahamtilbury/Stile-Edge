document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-button');
    const menu = document.querySelector('.mobile-menu');
    if (!menuButton || !menu) return;
    function setMenuState(isOpen, returnFocus = false) {
        menu.classList.toggle('open', isOpen);
        menuButton.setAttribute(
            'aria-expanded',
            isOpen ? 'true' : 'false'
        );

        menuButton.setAttribute(
            'aria-label',
            isOpen ? 'Close navigation' : 'Open navigation'
        );

        if (!isOpen && returnFocus) {
            menuButton.focus();
        }
    }

    // Open / close from menu button
    menuButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen =
            menuButton.getAttribute('aria-expanded') === 'true';
        setMenuState(!isOpen);
    });

    // Close when a navigation link is selected
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            setMenuState(false);
        });
    });

    // Escape closes the menu and returns focus to the button
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        const isOpen =
            menuButton.getAttribute('aria-expanded') === 'true';
        if (!isOpen) return;
        e.preventDefault();
        setMenuState(false, true);
    });
});

/* ==========================
   Hero Slider
========================== */

(function () {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    if (slides.length < 2) return;

    let current = 0;
    let timer = null;
    let touchStartX = 0;
    let touchEndX = 0;

    const INTERVAL = 14000;
    const SWIPE_THRESHOLD = 50;

    function goTo(index) {
        slides[current].classList.remove('is-active');

        current = (index + slides.length) % slides.length;

        requestAnimationFrame(() => {
            slides[current].classList.add('is-active');
        });
    }

    function next() {
        goTo(current + 1);
    }

    function previous() {
        goTo(current - 1);
    }

    function startAutoplay() {
        stopAutoplay();
        timer = setInterval(next, INTERVAL);
    }

    function stopAutoplay() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;

        const distance = touchEndX - touchStartX;

        if (Math.abs(distance) < SWIPE_THRESHOLD) return;

        if (distance < 0) {
            next();
        } else {
            previous();
        }

        startAutoplay();
    }, { passive: true });

    startAutoplay();
})();

/* ==========================
   Project Cards Flip
========================== */
document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('.project-card').forEach(card => {

        const toggle =
            card.querySelector('.project-card-toggle');

        const setFlipped = (isFlipped) => {

            card.classList.toggle(
                'is-flipped',
                isFlipped
            );

            if (!toggle) return;

            toggle.setAttribute(
                'aria-expanded',
                String(isFlipped)
            );

            toggle.setAttribute(
                'aria-label',
                isFlipped
                    ? 'Show project photo'
                    : 'Show tile edge profile used in this project'
            );
        };

        card.addEventListener('click', event => {

            /* Protect any links we may add
               to the back of the card later. */
            if (event.target.closest('a')) {
                return;
            }

            setFlipped(
                !card.classList.contains('is-flipped')
            );
        });

    });

});

/* =========================================================
   20.10 - SHARED GALLERY SYSTEM
   Service images + client reviews
========================================================= */

(() => {

    const galleryCards =
        Array.from(
            document.querySelectorAll(
                "[data-service-gallery]"
            )
        );

    if (!galleryCards.length) {
        return;
    }

    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

    const galleries = [];

    galleryCards.forEach(card => {

        const track =
            card.querySelector(
                "[data-gallery-track]"
            );

        const slides =
            Array.from(
                card.querySelectorAll(
                    ".service-gallery-slide, .review-gallery-slide"
                )
            );

        card.classList.toggle(
            "has-single-gallery-image",
            slides.length === 1
        );

        /* =====================================
           DETAIL PAGE EXPAND / COLLAPSE BUTTON
        ===================================== */
        
        if (
            card.classList.contains("service-detail") &&
            !card.querySelector("[data-gallery-toggle]")
        ) {
        
            const galleryMedia =
                card.querySelector(
                    ".service-detail-image"
                );
        
            const heading =
                card.querySelector(
                    ".service-detail-main h2"
                );
        
            const serviceName =
                heading
                    ? heading.textContent
                        .replace(/\s+/g, " ")
                        .trim()
                        .replace(/^\d+\s*/, "")
                    : "service";
        
            if (
                galleryMedia &&
                track.id
            ) {
        
                const expandButton =
                    document.createElement("button");
        
                expandButton.type = "button";
        
                expandButton.className =
                    "service-gallery-expand";
        
                expandButton.setAttribute(
                    "data-gallery-toggle",
                    ""
                );
        
                expandButton.setAttribute(
                    "data-label-open",
                    `Expand ${serviceName}`
                );
        
                expandButton.setAttribute(
                    "data-label-close",
                    `Collapse ${serviceName}`
                );
        
                expandButton.setAttribute(
                    "aria-label",
                    `Expand ${serviceName}`
                );
        
                expandButton.setAttribute(
                    "aria-expanded",
                    "false"
                );
        
                expandButton.setAttribute(
                    "aria-controls",
                    track.id
                );
        
                expandButton.textContent = "+";
        
                galleryMedia.appendChild(
                    expandButton
                );
            }
        }

        const toggles =
            Array.from(
                card.querySelectorAll(
                    "[data-gallery-toggle]"
                )
            );
        
        const alwaysOpen =
            card.hasAttribute(
                "data-gallery-always-open"
            );

        const isReviewGallery =
            card.hasAttribute(
                "data-review-gallery"
            );

        const previousButton =
            card.querySelector(
                "[data-gallery-prev]"
            );

        const nextButton =
            card.querySelector(
                "[data-gallery-next]"
            );

        const currentCounter =
            card.querySelector(
                "[data-gallery-current]"
            );

        const totalCounter =
            card.querySelector(
                "[data-gallery-total]"
            );

        if (
            !track ||
            !slides.length ||
            (!alwaysOpen && !toggles.length) ||
            (!isReviewGallery && !previousButton) ||
            !nextButton ||
            !currentCounter ||
            !totalCounter
        ) {
            return;
        }

        let currentIndex = 0;

        let scrollFrame = null;

        /* =============================
            MOBILE REVIEW HEIGHT
        ============================= */

        const mobileReviewQuery =
            isReviewGallery
                ? window.matchMedia(
                    "(max-width: 700px)"
                )
                : null;

        const syncReviewTrackHeight = () => {

            if (!isReviewGallery) {
                return;
            }

            if (!mobileReviewQuery.matches) {

                track.style.height = "";

                return;
            }

            const activeSlide =
                slides[currentIndex];

            if (!activeSlide) {
                return;
            }

            requestAnimationFrame(() => {

                track.style.height =
                    `${activeSlide.scrollHeight}px`;
            });
        };

        const reviewHeightObserver =
            isReviewGallery &&
            "ResizeObserver" in window
                ? new ResizeObserver(
                    () => {
                        syncReviewTrackHeight();
                    }
                )
                : null;

        if (reviewHeightObserver) {

            slides.forEach(slide => {

                reviewHeightObserver.observe(
                    slide
                );
            });
        }

        /* =============================
            20.11 - LAZY GALLERY IMAGES
        ============================= */

        /*
        * Large service-gallery assets are only
        * requested once that service is expanded.
        *
        * Review galleries contain no gallery
        * images, so this safely does nothing there.
        */

        const loadGalleryImages = () => {

            const images =
                card.querySelectorAll(
                    "img[data-gallery-src]"
                );

            images.forEach(image => {

                const source =
                    image.dataset.gallerySrc;

                if (!source) {
                    return;
                }

                image.loading = "eager";
                image.src = source;
                image.removeAttribute(
                    "data-gallery-src"
                );
            });
        };
        
        /* ==========================
            20.12 - INTERFACE STATE
        ========================== */

        const updateInterface = () => {

            currentCounter.textContent =
                String(
                    currentIndex + 1
                );

            totalCounter.textContent =
                String(
                    slides.length
                );

            slides.forEach(
                (slide, index) => {

                    slide.setAttribute(
                        "aria-hidden",

                        index === currentIndex
                            ? "false"
                            : "true"
                    );
                    
                    if (
                        isReviewGallery &&
                        index !== currentIndex
                    ) {

                        slide
                            .querySelectorAll(
                                ".review-text-details[open]"
                            )
                            .forEach(details => {

                                details.removeAttribute(
                                    "open"
                                );
                            });

                        slide
                            .querySelectorAll(
                                "[data-review-photo-gallery].is-photo-open"
                            )
                            .forEach(photoGallery => {

                                photoGallery.dispatchEvent(
                                    new Event(
                                        "review-photo-close"
                                    )
                                );
                            });
                    }
                }
            );
            syncReviewTrackHeight();
        };

        /* ==========================
            20.13 - GALLERY STATE
        ========================== */

        const setExpanded =
            expanded => {

                card.classList.toggle(
                    "is-gallery-open",
                    expanded
                );

                toggles.forEach(toggle => {

                    toggle.setAttribute(
                        "aria-expanded",
                        String(expanded)
                    );

                    if (
                        toggle.tagName ===
                        "BUTTON"
                    ) {

                        const label =
                            expanded
                                ? toggle.dataset.labelClose
                                : toggle.dataset.labelOpen;

                        if (label) {

                            toggle.setAttribute(
                                "aria-label",
                                label
                            );
                        }
                    }
                });
            };

        const goToSlide = (
            index,
            behavior =
                reducedMotion.matches
                    ? "auto"
                    : "smooth"
        ) => {

            currentIndex =
                (
                    index +
                    slides.length
                ) %
                slides.length;
            track.scrollTo({
                left:
                    currentIndex *
                    track.clientWidth,
                behavior
            });
            updateInterface();
        };

        const closeGallery = () => {
            if (alwaysOpen) {
                return;
            }
            setExpanded(false);

            currentIndex = 0;

            track.scrollTo({
                left: 0,
                behavior: "auto"
            });

            updateInterface();

        };

        const openGallery = () => {

            /*
            * Preserve the clicked module's
            * position in the viewport.
            */

            const originalTop =
                card.getBoundingClientRect().top;

            /*
            * Only one expandable service gallery
            * is open at a time.
            *
            * Always-open galleries, such as
            * testimonials, are not added here.
            */

            galleries.forEach(gallery => {
                if (
                    gallery.card !== card
                ) {
                    gallery.close();
                }
            });

            loadGalleryImages();

            setExpanded(true);

            requestAnimationFrame(() => {

                goToSlide(
                    0,
                    "auto"
                );

                const newTop =
                    card.getBoundingClientRect().top;

                const movement =
                    newTop - originalTop;
                if (
                    Math.abs(movement) > 1
                ) {
                    window.scrollBy({
                        top: movement,
                        behavior: "auto"
                    });
                }
            });
        };

        /* ==========================
            20.14 - BUTTON CONTROLS
        ========================== */

        toggles.forEach(toggle => {

            toggle.addEventListener(
                "click",
                event => {
                    /*
                    * The Services-page href
                    * remains a valid no-JS
                    * fallback.
                    */
                    if (
                        toggle.tagName ===
                        "A"
                    ) {
                        event.preventDefault();

                    }
                    const isOpen =
                        card.classList.contains(
                            "is-gallery-open"
                        );
                    if (isOpen) {
                        closeGallery();
                    } else {
                        openGallery();
                    }
                }
            );
        });

        if (previousButton) {

            previousButton.addEventListener(
                "click",
                () => {
                    goToSlide(
                        currentIndex - 1
                    );
                }
            );
        }

        nextButton.addEventListener(
            "click",
            () => {
                goToSlide(
                    currentIndex + 1
                );
            }
        );

        /* ==========================
            20.15 - SWIPE / SCROLL
        ========================== */

        /*
        * Keep the counter and active slide
        * synchronized after manual swiping.
        */

        track.addEventListener(
            "scroll",
            () => {

                if (
                    !card.classList.contains(
                        "is-gallery-open"
                    )
                ) {
                    return;
                }

                if (scrollFrame) {

                    cancelAnimationFrame(
                        scrollFrame
                    );
                }

                scrollFrame =
                    requestAnimationFrame(
                        () => {

                            const width =
                                track.clientWidth;

                            if (!width) {
                                return;
                            }

                            currentIndex =
                                Math.max(
                                    0,
                                    Math.min(
                                        Math.round(
                                            track.scrollLeft /
                                            width
                                        ),
                                        slides.length - 1
                                    )
                                );
                            updateInterface();
                        }
                    );
            },
            {
                passive: true
            }
        );

        /* ==========================
            20.16 - KEYBOARD NAVIGATION
        ========================== */

        track.addEventListener(
            "keydown",
            event => {

                if (
                    !card.classList.contains(
                        "is-gallery-open"
                    )
                ) {
                    return;
                }

                if (
                    event.key ===
                    "ArrowLeft"
                ) {

                    event.preventDefault();

                    goToSlide(
                        currentIndex - 1
                    );
                }

                if (
                    event.key ===
                    "ArrowRight"
                ) {
                    event.preventDefault();

                    goToSlide(
                        currentIndex + 1
                    );
                }

                if (
                    event.key ===
                        "Escape" &&
                    !alwaysOpen
                ) {
                    event.preventDefault();
                    closeGallery();
                }
            }
        );

        /* ==========================
            20.17 - RESIZE HANDLING
        ========================== */

        /*
        * Realign the active slide after
        * orientation or viewport changes.
        */

        window.addEventListener(
            "resize",
            () => {
                if (
                    !card.classList.contains(
                        "is-gallery-open"
                    )
                ) {
                    return;
                }
                goToSlide(
                    currentIndex,
                    "auto"
                );
            }
        );

        /* ==========================
            20.18 - INITIALISATION
        ========================== */

        if (alwaysOpen) {
            card.classList.add(
                "is-gallery-open"
            );
        }

        updateInterface();

        if (!alwaysOpen) {
            galleries.push({
                card,
                open: openGallery,
                close: closeGallery
            });
        }
    });

    /* =====================================
       OPEN LINKED SERVICE AUTOMATICALLY
       e.g. profiles.html#half-bullnose
    ===================================== */
    
    const openLinkedGallery = () => {
    
        if (!window.location.hash) {
            return;
        }
    
        let targetId =
            window.location.hash.slice(1);
    
        try {
            targetId =
                decodeURIComponent(targetId);
        } catch {
            /* Keep raw hash if decoding fails */
        }
    
        const target =
            document.getElementById(
                targetId
            );
    
        if (!target) {
            return;
        }
    
        const card =
            target.matches(
                "[data-service-gallery]"
            )
                ? target
                : target.closest(
                    "[data-service-gallery]"
                );
    
        if (!card) {
            return;
        }
    
        const gallery =
            galleries.find(
                item =>
                    item.card === card
            );
    
        if (!gallery) {
            return;
        }
    
        gallery.open();
    
        /*
         * Wait for the card to finish
         * changing layout, then put its
         * top neatly into view.
         */
        requestAnimationFrame(() => {
    
            requestAnimationFrame(() => {
    
                card.scrollIntoView({
                    behavior: "auto",
                    block: "start"
                });
    
            });
    
        });
    };
    
    
    /* Initial page load with #profile */
    
    openLinkedGallery();
    
    
    /* Also support hash changes
       without a full reload */
    
    window.addEventListener(
        "hashchange",
        openLinkedGallery
    );
    
})();

/* ==========================
   Contact Form (Formspree)
========================== */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const started = document.getElementById('form-started');
    const status = document.getElementById('form-status');
    const submitBtn = form.querySelector('[type="submit"]');
    const submitLabel = submitBtn?.querySelector('.button-label');
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

        // Turnstile required
        const token = form.querySelector('[name="cf-turnstile-response"]')?.value;
        if (!token) {
            showStatus('Please complete the verification check.', false);
            return;
        }

        submitBtn.disabled = true;
        if (submitLabel) submitLabel.textContent = 'Sending…';

        try {
            const res = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            });

            if (res.ok) {
                form.reset();
                if (started) started.value = String(Date.now());
                if (window.turnstile) turnstile.reset();
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
            if (submitLabel) submitLabel.textContent = 'Send Enquiry';
        }
    });

    function showStatus(msg, ok) {
        status.hidden = false;
        status.textContent = msg;
        status.classList.toggle('is-success', ok);
        status.classList.toggle('is-error', !ok);
    }
});

/* ==========================
   MANUAL CUSTOMER REVIEWS
========================== */

(() => {
    const gallery = document.querySelector('[data-review-gallery]');

    if (!gallery) return;

    const track =
        gallery.querySelector('[data-review-track]');

    const slides =
        Array.from(
            gallery.querySelectorAll('.review-gallery-slide')
        );

    const nextButton =
        gallery.querySelector('[data-review-next]');

    if (!track || !slides.length || !nextButton) return;

    let currentIndex = 0;
    let scrollFrame = null;

    const reducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)');

    const mobileQuery =
        window.matchMedia('(max-width: 720px)');

    /* --------------------------
       Relative review dates
    -------------------------- */

    function getReviewDate(element) {
        const exactDate =
            element.dataset.reviewDate;

        if (exactDate) {
            return new Date(`${exactDate}T12:00:00`);
        }

        const captured =
            element.dataset.reviewCaptured;

        if (!captured) return null;

        const date =
            new Date(`${captured}T12:00:00`);

        const months =
            Number(element.dataset.reviewAgeMonths || 0);

        const years =
            Number(element.dataset.reviewAgeYears || 0);

        if (months) {
            date.setMonth(
                date.getMonth() - months
            );
        }

        if (years) {
            date.setFullYear(
                date.getFullYear() - years
            );
        }

        return date;
    }

    function getCalendarMonthsBetween(start, end) {
        let months =
            (
                end.getFullYear() -
                start.getFullYear()
            ) * 12;

        months +=
            end.getMonth() -
            start.getMonth();

        if (end.getDate() < start.getDate()) {
            months -= 1;
        }

        return Math.max(0, months);
    }

    function formatRelativeDate(date) {
        const now = new Date();

        const milliseconds =
            now.getTime() -
            date.getTime();

        const days =
            Math.max(
                0,
                Math.floor(
                    milliseconds /
                    86400000
                )
            );

        if (days < 1) {
            return 'today';
        }

        if (days < 7) {
            return `${days} ${days === 1 ? 'day' : 'days'} ago`;
        }

        const months =
            getCalendarMonthsBetween(
                date,
                now
            );

        if (months < 1) {
            const weeks =
                Math.max(
                    1,
                    Math.floor(days / 7)
                );

            return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
        }

        if (months < 12) {
            return `${months} ${months === 1 ? 'month' : 'months'} ago`;
        }

        const years =
            Math.floor(months / 12);

        return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }

    document
        .querySelectorAll('.review-relative-date')
        .forEach(element => {

            const reviewDate =
                getReviewDate(element);

            if (!reviewDate) return;

            element.dateTime =
                reviewDate
                    .toISOString()
                    .slice(0, 10);

            element.textContent =
                formatRelativeDate(
                    reviewDate
                );
        });

    /* --------------------------
       Gallery sizing
    -------------------------- */

    function syncTrackHeight() {
        if (!mobileQuery.matches) {
            track.style.height = '';
            return;
        }

        const activeSlide =
            slides[currentIndex];

        if (!activeSlide) return;

        requestAnimationFrame(() => {
            track.style.height =
                `${activeSlide.scrollHeight}px`;
        });
    }

    if ('ResizeObserver' in window) {
        const observer =
            new ResizeObserver(
                syncTrackHeight
            );

        slides.forEach(slide => {
            observer.observe(slide);
        });
    }

    /* --------------------------
       Gallery navigation
    -------------------------- */

    function goToSlide(index) {
        currentIndex =
            (
                index +
                slides.length
            ) %
            slides.length;

        track.scrollTo({
            left:
                currentIndex *
                track.clientWidth,

            behavior:
                reducedMotion.matches
                    ? 'auto'
                    : 'smooth'
        });

        syncTrackHeight();
    }

    nextButton.addEventListener(
        'click',
        () => {
            goToSlide(
                currentIndex + 1
            );
        }
    );

    track.addEventListener(
        'scroll',
        () => {
            if (scrollFrame) {
                cancelAnimationFrame(
                    scrollFrame
                );
            }

            scrollFrame =
                requestAnimationFrame(
                    () => {
                        const width =
                            track.clientWidth;

                        if (!width) return;

                        currentIndex =
                            Math.max(
                                0,
                                Math.min(
                                    Math.round(
                                        track.scrollLeft /
                                        width
                                    ),
                                    slides.length - 1
                                )
                            );

                        syncTrackHeight();
                    }
                );
        },
        { passive: true }
    );

    track.addEventListener(
        'keydown',
        event => {

            if (event.key === 'ArrowRight') {
                event.preventDefault();

                goToSlide(
                    currentIndex + 1
                );
            }

            if (event.key === 'ArrowLeft') {
                event.preventDefault();

                goToSlide(
                    currentIndex - 1
                );
            }
        }
    );

    mobileQuery.addEventListener?.(
        'change',
        syncTrackHeight
    );

    syncTrackHeight();
})();

/* ==========================
   GOOGLE REVIEWS
========================== */

(() => {
    const PLACE_ID = "ChIJETLjZBcCkWsRmZrwx7CfcYA";

    const FALLBACK_MAPS_URL =
        "https://maps.app.goo.gl/a8c4T1dNi5eyxDtG7";

    let reviewsLoaded = false;

    function createStars(rating) {
        const wrapper = document.createDocumentFragment();
        const roundedRating = Math.round(Number(rating) || 0);

        for (let i = 1; i <= 5; i += 1) {
            const star = document.createElement("span");

            star.className =
                i <= roundedRating
                    ? "google-rating-star"
                    : "google-rating-star google-rating-star--empty";

            star.textContent = "★";

            wrapper.appendChild(star);
        }

        return wrapper;
    }


    function getInitials(name) {
        if (!name) {
            return "G";
        }

        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("");
    }


    function createAuthorImage(author) {
        if (author?.photoURI) {
            const image = document.createElement("img");

            image.className = "google-review-author-image";
            image.src = author.photoURI;
            image.alt = "";
            image.loading = "lazy";
            image.referrerPolicy = "no-referrer";

            return image;
        }

        const placeholder = document.createElement("span");

        placeholder.className = "google-review-author-placeholder";
        placeholder.setAttribute("aria-hidden", "true");
        placeholder.textContent = getInitials(author?.displayName);

        return placeholder;
    }


    function createReviewCard(review) {
        const article = document.createElement("article");

        article.className = "google-review-card";


        /* Author */

        const header = document.createElement("div");

        header.className = "google-review-card-header";

        const author = review.authorAttribution;

        header.appendChild(createAuthorImage(author));

        const authorInfo = document.createElement("div");

        authorInfo.className = "google-review-author";

        if (author?.uri) {
            const authorLink = document.createElement("a");

            authorLink.href = author.uri;
            authorLink.target = "_blank";
            authorLink.rel = "noopener noreferrer";
            authorLink.textContent =
                author.displayName || "Google Maps reviewer";

            authorInfo.appendChild(authorLink);
        } else {
            const authorName = document.createElement("strong");

            authorName.textContent =
                author?.displayName || "Google Maps reviewer";

            authorInfo.appendChild(authorName);
        }


        /* Relative review date */

        if (review.relativePublishTimeDescription) {
            const date = document.createElement("span");

            date.className = "google-review-date";
            date.textContent = review.relativePublishTimeDescription;

            authorInfo.appendChild(date);
        }

        header.appendChild(authorInfo);
        article.appendChild(header);


        /* Stars */

        const stars = document.createElement("div");

        stars.className = "google-review-stars";
        stars.setAttribute(
            "aria-label",
            `${review.rating || 0} out of 5 stars`
        );

        stars.appendChild(createStars(review.rating));

        article.appendChild(stars);


        /* Review text */

        const reviewText = document.createElement("p");

        reviewText.className = "google-review-text";

        if (review.text?.trim()) {
            reviewText.textContent = review.text.trim();
        } else {
            reviewText.textContent =
                `Rated ${review.rating || 5} out of 5 stars.`;
        }

        article.appendChild(reviewText);


        /*
           Google recommends identifying translated reviews.
           If the API supplies different original and displayed
           text, show a translation notice.
        */

        if (
            review.originalText &&
            review.text &&
            review.originalText !== review.text
        ) {
            const translationNotice =
                document.createElement("span");

            translationNotice.className =
                "google-review-translation";

            translationNotice.textContent =
                "Translated review";

            article.appendChild(translationNotice);
        }


        /* Direct link to this review on Google Maps */

        if (review.googleMapsURI) {
            const source = document.createElement("div");

            source.className = "google-review-source";

            const sourceLink = document.createElement("a");

            sourceLink.href = review.googleMapsURI;
            sourceLink.target = "_blank";
            sourceLink.rel = "noopener noreferrer";
            sourceLink.textContent =
                "View this review on Google Maps ↗";

            source.appendChild(sourceLink);
            article.appendChild(source);
        }


        return article;
    }


    function showFallback() {
        const grid = document.getElementById(
            "google-reviews-grid"
        );

        const footer = document.getElementById(
            "google-reviews-footer"
        );

        if (!grid) {
            return;
        }

        grid.replaceChildren();

        const card = document.createElement("article");

        card.className =
            "google-review-card google-review-card--fallback";

        const heading = document.createElement("h3");

        heading.textContent =
            "See our customer reviews on Google Maps.";

        const link = document.createElement("a");

        link.className = "text-link";
        link.href = FALLBACK_MAPS_URL;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "View Google reviews ↗";

        card.append(heading, link);
        grid.appendChild(card);

        if (footer) {
            footer.hidden = true;
        }
    }


    async function loadGoogleReviews() {
        if (reviewsLoaded) {
            return;
        }

        reviewsLoaded = true;

        try {
            const { Place } =
                await google.maps.importLibrary("places");

            const place = new Place({
                id: PLACE_ID
            });

            await place.fetchFields({
                fields: [
                    "displayName",
                    "rating",
                    "userRatingCount",
                    "reviews",
                    "googleMapsURI",
                    "googleMapsLinks"
                ]
            });

            const attributionContainer =
                document.getElementById("google-place-attributions");
            
            if (attributionContainer) {
                attributionContainer.replaceChildren();
            
                (place.attributions || []).forEach((attribution) => {
                    if (!attribution.provider) return;
            
                    const element = attribution.providerURI
                        ? document.createElement("a")
                        : document.createElement("span");
            
                    element.textContent = attribution.provider;
            
                    if (attribution.providerURI) {
                        element.href = attribution.providerURI;
                        element.target = "_blank";
                        element.rel = "noopener noreferrer";
                    }
            
                    attributionContainer.appendChild(element);
                });
            }


            /* Overall rating */

            const ratingValue =
                document.getElementById(
                    "google-rating-value"
                );

            const ratingCount =
                document.getElementById(
                    "google-rating-count"
                );

            const ratingStars =
                document.getElementById(
                    "google-rating-stars"
                );

            if (ratingValue && place.rating != null) {
                ratingValue.textContent =
                    `${place.rating.toFixed(1)} / 5`;
            }

            if (
                ratingCount &&
                place.userRatingCount != null
            ) {
                const label =
                    place.userRatingCount === 1
                        ? "Google review"
                        : "Google reviews";

                ratingCount.textContent =
                    `${place.userRatingCount} ${label}`;
            }

            if (ratingStars) {
                ratingStars.replaceChildren();
                ratingStars.appendChild(
                    createStars(place.rating)
                );
            }


            /* Review cards */

            const grid =
                document.getElementById(
                    "google-reviews-grid"
                );

            if (!grid) {
                return;
            }

            grid.replaceChildren();

            const reviews =
                Array.isArray(place.reviews)
                    ? place.reviews
                    : [];

            /*
               Google returns a maximum of five reviews
               ordered by relevance.

               Three cards fits the existing homepage
               structure best, so display the first three
               exactly in Google's supplied order.
            */

            reviews
                .slice(0, 3)
                .forEach((review) => {
                    grid.appendChild(
                        createReviewCard(review)
                    );
                });


            if (!reviews.length) {
                showFallback();
                return;
            }


            /* Google Maps links */

            const readReviews =
                document.getElementById(
                    "google-read-reviews"
                );

            const writeReview =
                document.getElementById(
                    "google-write-review"
                );

            const reviewsURI =
                place.googleMapsLinks?.reviewsURI ||
                place.googleMapsURI ||
                FALLBACK_MAPS_URL;

            const writeAReviewURI =
                place.googleMapsLinks?.writeAReviewURI ||
                place.googleMapsURI ||
                FALLBACK_MAPS_URL;

            if (readReviews) {
                readReviews.href = reviewsURI;
            }

            if (writeReview) {
                writeReview.href = writeAReviewURI;
            }


            /* Show disclosure / attribution */

            const footer =
                document.getElementById(
                    "google-reviews-footer"
                );

            if (footer) {
                footer.hidden = false;
            }

        } catch (error) {
            console.error(
                "Unable to load Google reviews:",
                error
            );

            showFallback();
        }
    }


    /*
       Called by the Google Maps JavaScript API once
       the Places library becomes available.

       We then wait until the reviews section approaches
       the viewport before making the billable Place
       Details request.
    */

    window.initGoogleReviews = () => {
        const section =
            document.getElementById("google-reviews");

        if (!section) {
            return;
        }

        if (!("IntersectionObserver" in window)) {
            loadGoogleReviews();
            return;
        }

        const observer =
            new IntersectionObserver(
                (entries) => {
                    if (!entries[0].isIntersecting) {
                        return;
                    }

                    observer.disconnect();
                    loadGoogleReviews();
                },
                {
                    rootMargin: "400px 0px"
                }
            );

        observer.observe(section);
    };
})();
