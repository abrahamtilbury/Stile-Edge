const menuButton = document.querySelector('.menu-button');
const menu = document.querySelector('.mobile-menu');

menuButton.addEventListener('click', () => {
    menu.classList.toggle('open');
});

const heroImage = document.querySelector('.hero-image');
const previousButton = document.querySelector('.hero-arrow-left');
const nextButton = document.querySelector('.hero-arrow-right');
const heroDots = document.querySelectorAll('.hero-dots button');
const heroImages = [
    'images/hero-1.jpg',
    'images/hero-2.jpg',
    'images/hero-3.jpg'
];

let currentSlide = 0;


function showSlide(index) {
    heroImage.style.opacity = '0';
    setTimeout(() => {
        currentSlide = index;
        heroImage.src = heroImages[currentSlide];
        heroDots.forEach((dot, index) => {
            dot.classList.toggle(
                'active',
                index === currentSlide
            );
        });

        heroImage.style.opacity = '1';

    }, 500);
}


function nextSlide() {
    currentSlide++;
    if (currentSlide >= heroImages.length) {
        currentSlide = 0;
    }

    showSlide(currentSlide);
}


function previousSlide() {

    currentSlide--;

    if (currentSlide < 0) {
        currentSlide = heroImages.length - 1;
    }

    showSlide(currentSlide);
}


nextButton.addEventListener('click', nextSlide);

previousButton.addEventListener('click', previousSlide);


heroDots.forEach((dot, index) => {

    dot.addEventListener('click', () => {
        showSlide(index);
    });

});