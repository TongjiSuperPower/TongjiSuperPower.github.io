(function () {
    const paths = {
        sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/>',
        moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>',
        up: '<path d="m18 15-6-6-6 6"/><path d="M12 9v11"/>',
        down: '<path d="m6 9 6 6 6-6"/><path d="M12 4v11"/>',
        book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2Z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z"/>',
        users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
        bot: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M12 3v4M8 12h.01M16 12h.01M8 16h8"/>',
        gamepad: '<path d="M6 12h4M8 10v4M15 13h.01M18 11h.01"/><path d="M17.32 5H6.68A4.68 4.68 0 0 0 2 9.68v6.64A2.68 2.68 0 0 0 4.68 19c1.2 0 1.91-.58 2.56-1.48L8.34 16h7.32l1.1 1.52c.65.9 1.36 1.48 2.56 1.48A2.68 2.68 0 0 0 22 16.32V9.68A4.68 4.68 0 0 0 17.32 5Z"/>',
        package: '<path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
        mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a2 2 0 0 1-2.06 0L2 7"/>',
        trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0Z"/><path d="M5 9H4a2 2 0 0 1-2-2V5h5M19 9h1a2 2 0 0 0 2-2V5h-5"/>',
        medal: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/>',
        file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5Z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h8M8 17h5"/>',
        sprout: '<path d="M7 20h8M10 20c5.5-2.5.8-6.4 3-10M9.5 9.4C7.1 7.9 5 8 3 8c.2 3.4 1.6 5.4 4.2 6.1M14.1 6c.2-2 1.2-3 3.9-4 .5 2.5-.2 4.1-2.4 5.2"/>',
        sparkles: '<path d="m12 3-1.2 3.1L8 7.5l2.8 1.4L12 12l1.2-3.1L16 7.5l-2.8-1.4Z"/><path d="m19 13-.8 2.2L16 16l2.2.8L19 19l.8-2.2L22 16l-2.2-.8ZM5 14l-1 2.5L2 18l2 1.5L5 22l1-2.5L8 18l-2-1.5Z"/>',
        flag: '<path d="M5 22V4M5 4h11l-1 4 1 4H5"/>',
        arm: '<path d="M8 14v-3a2 2 0 0 1 4 0v1M12 12V9a2 2 0 0 1 4 0v4M16 13v-2a2 2 0 0 1 4 0v5a6 6 0 0 1-6 6h-2a7 7 0 0 1-7-7v-4a2 2 0 0 1 4 0v3"/>',
        shield: '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3Z"/><path d="M9 12h6M12 9v6"/>',
        crosshair: '<circle cx="12" cy="12" r="7"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
        radar: '<path d="M12 12 19 5M3.05 11a9 9 0 0 1 9-8M3.05 15a9 9 0 0 0 14.9 3M7.05 11a5 5 0 0 1 5-4M7.05 15a5 5 0 0 0 6.95 1.83"/><circle cx="12" cy="12" r="1"/>',
        plane: '<path d="M22 2 9 15M22 2l-7 20-4-9-9-4Z"/>',
        star: '<polygon points="12 2 15.1 8.3 22 9.3 17 14.2 18.2 21 12 17.8 5.8 21 7 14.2 2 9.3 8.9 8.3 12 2"/>',
        megaphone: '<path d="m3 11 18-5v12L3 14Z"/><path d="M11.6 16.4 13 21H8l-1.2-6"/>',
        chevronLeft: '<path d="m15 18-6-6 6-6"/>',
        chevronRight: '<path d="m9 18 6-6-6-6"/>',
        github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.4 5.4 0 0 0 19.3 4 5 5 0 0 0 19.1.5S18 0 15 1.8a13.4 13.4 0 0 0-7 0C5 0 3.9.5 3.9.5A5 5 0 0 0 3.7 4a5.4 5.4 0 0 0-1.5 3.7c0 5.4 3.5 6.6 6.8 7A4.8 4.8 0 0 0 8 18v4"/><path d="M8 19c-3 .9-3-1.5-4-2"/>',
        external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'
    };

    function icon(name, className) {
        const path = paths[name] || paths.crosshair;
        return '<svg class="hud-icon ' + (className || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">' + path + '</svg>';
    }

    function setIcon(element, name) {
        if (!element) return;
        element.dataset.hudIcon = name;
        element.innerHTML = icon(name);
    }

    function decorate(root) {
        (root || document).querySelectorAll('[data-hud-icon]').forEach(function (element) {
            if (!element.querySelector('svg')) setIcon(element, element.dataset.hudIcon);
        });
    }

    function initHomeMotion() {
        const body = document.body;
        if (!body.classList.contains('home-page')) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const hero = document.querySelector('.hero');
        const cards = Array.from(document.querySelectorAll('.project-card'));
        body.classList.add('home-motion');

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) entry.target.classList.add('is-visible');
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -8% 0px'
        });

        cards.forEach(function (card) { observer.observe(card); });

        let framePending = false;
        function updateScrollMotion() {
            framePending = false;
            const viewportHeight = window.innerHeight;

            if (hero) {
                const heroRect = hero.getBoundingClientRect();
                const progress = Math.min(1, Math.max(0, -heroRect.top / Math.max(heroRect.height, 1)));
                hero.style.setProperty('--hero-shift', (progress * 54).toFixed(1) + 'px');
                hero.style.setProperty('--hero-logo-shift', (progress * -34).toFixed(1) + 'px');
                hero.style.setProperty('--hero-opacity', Math.max(0.25, 1 - progress * 0.9).toFixed(3));
            }

            cards.forEach(function (card) {
                const rect = card.getBoundingClientRect();
                if (rect.bottom < 0 || rect.top > viewportHeight) return;
                const centerOffset = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
                const shift = Math.max(-34, Math.min(34, centerOffset * -30));
                card.style.setProperty('--chapter-shift', shift.toFixed(1) + 'px');
            });
        }

        function requestScrollMotion() {
            if (framePending) return;
            framePending = true;
            requestAnimationFrame(updateScrollMotion);
        }

        window.addEventListener('scroll', requestScrollMotion, { passive: true });
        window.addEventListener('resize', requestScrollMotion);
        requestScrollMotion();
    }

    window.HUD = { icon: icon, setIcon: setIcon, decorate: decorate, initHomeMotion: initHomeMotion };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            decorate(document);
            initHomeMotion();
        });
    } else {
        decorate(document);
        initHomeMotion();
    }
})();
