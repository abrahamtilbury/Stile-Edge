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