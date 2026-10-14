(() => {
    const indexLinks = document.querySelectorAll('.robot-index a');
    function updateRobotIndex() {
        const hash = window.location.hash || '#hero';
        indexLinks.forEach(link => {
            if (link.hash === hash) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    }
    updateRobotIndex();
    window.addEventListener('hashchange', updateRobotIndex);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const panels = document.querySelectorAll('.robot-panel');
    const animations = new Set();
    const observer = new IntersectionObserver(entries => {
        entries.forEach(({ target, isIntersecting }) => {
            if (!isIntersecting) return;
            observer.unobserve(target);
            if (reducedMotion.matches) return;
            target.querySelectorAll('.robot-copy > *, .robot-photo').forEach((element, index) => {
                const animation = element.animate([
                    { opacity: 0, transform: 'translateY(22px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ], {
                    duration: 900,
                    delay: index * 100,
                    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                    fill: 'backwards'
                });
                animations.add(animation);
                animation.onfinish = animation.oncancel = () => animations.delete(animation);
            });
        });
    }, { threshold: 0.12 });

    panels.forEach(panel => observer.observe(panel));
    reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches) animations.forEach(animation => animation.cancel());
    });
})();
