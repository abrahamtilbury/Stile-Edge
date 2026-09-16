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
   Contact Form
   Attachment validation
========================== */

document.addEventListener('DOMContentLoaded', () => {
    const form =
        document.getElementById('contact-form');

    if (!form) return;

    const status =
        document.getElementById('form-status');

    const fileInputs =
        Array.from(
            form.querySelectorAll(
                'input[type="file"]'
            )
        );

    const MAX_TOTAL_SIZE =
        10 * 1024 * 1024;

    form.addEventListener('submit', (event) => {
        const totalSize =
            fileInputs.reduce(
                (total, input) => {
                    const file =
                        input.files?.[0];

                    return total +
                        (file ? file.size : 0);
                },
                0
            );

        if (totalSize <= MAX_TOTAL_SIZE) {
            return;
        }

        event.preventDefault();

        if (status) {
            status.hidden = false;
            status.textContent =
                'Your photos must be 10 MB or less combined.';

            status.classList.remove(
                'is-success'
            );

            status.classList.add(
                'is-error'
            );
        }

        fileInputs[0]?.focus();
    });
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
