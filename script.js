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

        // Turnstile required
        const token = form.querySelector('[name="cf-turnstile-response"]')?.value;
        if (!token) {
            showStatus('Please complete the verification check.', false);
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
