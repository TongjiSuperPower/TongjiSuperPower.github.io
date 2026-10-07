(() => {
    'use strict';

    const body = document.body;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hero = document.querySelector('.hero-section');
    const reveals = [...document.querySelectorAll('.reveal')];
    let revealObserver;
    let motionFrame = 0;

    function updateScrollMotion() {
        motionFrame = 0;
        body.classList.toggle('has-scrolled', window.scrollY > 16);
        if (motionPreference.matches) return;
        const heroRect = hero.getBoundingClientRect();
        if (heroRect.bottom > 0) {
            hero.style.setProperty('--hero-shift', `${Math.min(window.scrollY * .12, 90)}px`);
        }
    }

    function requestScrollMotion() {
        if (!motionFrame) motionFrame = requestAnimationFrame(updateScrollMotion);
    }

    function configureMotion() {
        revealObserver?.disconnect();
        if (motionPreference.matches || !('IntersectionObserver' in window)) {
            body.classList.remove('motion-ready');
            reveals.forEach((node) => node.classList.add('is-visible'));
            return;
        }
        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: .08, rootMargin: '0px 0px -24px 0px' });
        reveals.forEach((node) => revealObserver.observe(node));
        body.classList.add('motion-ready');
        requestScrollMotion();
    }

    // Keep a single accessible title; its glyphs lift together instead of typing copy.
    const title = document.querySelector('.hero-copy h1');
    if (!motionPreference.matches) {
        const text = title.textContent;
        title.setAttribute('aria-label', text);
        const glyphs = [...text].map((character, index) => {
            const glyph = document.createElement('span');
            glyph.className = 'hero-glyph';
            glyph.setAttribute('aria-hidden', 'true');
            glyph.style.setProperty('--char-index', index);
            glyph.textContent = character;
            return glyph;
        });
        title.replaceChildren(...glyphs);
    }

    // Fit actual glyph metrics to the footer without stretching or clipping the type.
    const wordmark = document.querySelector('.footer-wordmark');
    function fitWordmark() {
        const range = document.createRange();
        range.selectNodeContents(wordmark);
        const textWidth = range.getBoundingClientRect().width;
        if (!textWidth) return;
        const size = parseFloat(getComputedStyle(wordmark).fontSize);
        wordmark.style.fontSize = `${size * wordmark.clientWidth / textWidth}px`;
    }
    fitWordmark();
    document.fonts.ready.then(fitWordmark);
    window.addEventListener('resize', fitWordmark);

    configureMotion();
    motionPreference.addEventListener('change', configureMotion);
    window.addEventListener('scroll', requestScrollMotion, { passive: true });
    window.addEventListener('resize', requestScrollMotion);

    document.querySelectorAll('.nav-chip').forEach((link) => {
        link.addEventListener('click', (event) => {
            const target = document.querySelector(link.hash);
            if (!target) return;
            event.preventDefault();
            history.pushState(null, '', link.hash);
            target.scrollIntoView({ behavior: motionPreference.matches ? 'instant' : 'smooth', block: 'start' });
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
        });
    });
    document.querySelector('[data-back-to-top]').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: motionPreference.matches ? 'instant' : 'smooth' });
        hero.setAttribute('tabindex', '-1');
        hero.focus({ preventScroll: true });
    });

    // Manual galleries don't move away while someone reads. Keyboard, dots and swipe
    // share one state; inactive photos are excluded from the accessibility tree.
    document.querySelectorAll('[data-carousel]').forEach((carousel) => {
        const slides = [...carousel.querySelectorAll('.slide')];
        const dotsContainer = carousel.querySelector('.carousel-dots');
        const previous = carousel.querySelector('.prev');
        const next = carousel.querySelector('.next');
        let current = 0;
        carousel.setAttribute('role', 'region');
        carousel.setAttribute('aria-roledescription', '轮播图');
        carousel.setAttribute('aria-label', slides[0].querySelector('img').alt);
        const dots = slides.map((slide, index) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'dot';
            dot.setAttribute('aria-label', `显示第 ${index + 1} 张图片`);
            dot.addEventListener('click', () => showSlide(index));
            dotsContainer.append(dot);
            const image = slide.querySelector('img');
            image.decoding = 'async';
            const fitPhoto = () => image.classList.toggle('portrait-image', image.naturalHeight > image.naturalWidth);
            if (image.complete) fitPhoto();
            else image.addEventListener('load', fitPhoto, { once: true });
            return dot;
        });
        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === current);
                slide.setAttribute('aria-hidden', String(i !== current));
                dots[i].classList.toggle('active', i === current);
                dots[i].setAttribute('aria-pressed', String(i === current));
            });
        }
        showSlide(0);
        if (slides.length === 1) {
            carousel.classList.add('single-photo');
            previous.hidden = next.hidden = dotsContainer.hidden = true;
            return;
        }
        previous.addEventListener('click', () => showSlide(current - 1));
        next.addEventListener('click', () => showSlide(current + 1));
        carousel.addEventListener('keydown', (event) => {
            if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
            event.preventDefault();
            showSlide(current + (event.key === 'ArrowRight' ? 1 : -1));
        });
        let touchStart;
        carousel.addEventListener('touchstart', (event) => {
            if (event.touches.length !== 1) { touchStart = null; return; }
            touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        }, { passive: true });
        carousel.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
        carousel.addEventListener('touchend', (event) => {
            if (!touchStart) return;
            const dx = event.changedTouches[0].clientX - touchStart.x;
            const dy = event.changedTouches[0].clientY - touchStart.y;
            if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) showSlide(current + (dx < 0 ? 1 : -1));
            touchStart = null;
        }, { passive: true });
    });
})();
