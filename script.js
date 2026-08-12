const menuButton = document.querySelector('.menu-button');
const menu = document.querySelector('.mobile-menu');

if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('open');
        menuButton.setAttribute('aria-expanded', isOpen);
    });
}