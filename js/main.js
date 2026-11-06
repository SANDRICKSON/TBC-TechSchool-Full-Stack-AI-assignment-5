/**
 * main.js - საერთო სკრიპტი ყველა გვერდისთვის
 * Mobile Burger Menu-ს ფუნქციონალი
 */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
});

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');

    if (!mobileMenuBtn || !mobileMenu || !menuIcon) {
        return;
    }

    // მენიუს გახსნის/დახურვის ფუნქციები
    function openMenu() {
        mobileMenu.classList.remove('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        menuIcon.classList.remove('fa-bars');
        menuIcon.classList.add('fa-xmark');
    }

    function closeMenu() {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        menuIcon.classList.remove('fa-xmark');
        menuIcon.classList.add('fa-bars');
    }

    function toggleMenu() {
        const isClosed = mobileMenu.classList.contains('hidden');
        if (isClosed) {
            openMenu();
        } else {
            closeMenu();
        }
    }

    // ბურგერ ღილაკზე დაჭერა
    mobileMenuBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleMenu();
    });

    // მენიუ დაიხუროს რომელიმე ბმულზე დაჭერის შემდეგაც
    const menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach((link) => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Escape კლავიშზე დაჭერისას დახურვა
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
            closeMenu();
        }
    });

    // ეკრანის გარეთ დაწკაპუნებისას დახურვა
    document.addEventListener('click', (event) => {
        if (!mobileMenu.classList.contains('hidden')) {
            const isClickInsideMenu = mobileMenu.contains(event.target);
            const isClickOnButton = mobileMenuBtn.contains(event.target);
            if (!isClickInsideMenu && !isClickOnButton) {
                closeMenu();
            }
        }
    });

    // Desktop ზომაზე გადასვლისას ავტომატურად დახურვა
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768 && !mobileMenu.classList.contains('hidden')) {
            closeMenu();
        }
    });
}

