(() => {
    'use strict';

    // Temporary homepage announcement. Set enabled to false to retire it.
    // Replace url with the film's direct URL when it becomes available.
    const announcement = {
        enabled: true,
        startsAt: Date.parse('2026-01-01T00:00:00+08:00'),
        endsAt: Date.parse('2027-01-01T00:00:00+08:00'),
        sessionKey: 'superpower-documentary-2026-seen',
        url: 'https://www.bilibili.com/opus/1257824298446356484'
    };

    const now = Date.now();
    if (!announcement.enabled || now < announcement.startsAt || now >= announcement.endsAt ||
        typeof HTMLDialogElement === 'undefined' ||
        typeof HTMLDialogElement.prototype.showModal !== 'function') return;

    try {
        if (sessionStorage.getItem(announcement.sessionKey)) return;
    } catch {
        // The announcement still works when browser storage is unavailable.
    }

    const dialog = document.createElement('dialog');
    dialog.className = 'documentary-announcement';
    dialog.setAttribute('aria-labelledby', 'documentary-announcement-title');
    dialog.setAttribute('aria-describedby', 'documentary-announcement-description');
    dialog.innerHTML = `
        <div class="documentary-announcement__surface">
            <picture class="documentary-announcement__poster">
                <source media="(max-width: 600px)" srcset="/images/team/documentary/2026-documentary-portrait.jpg" width="1080" height="1440">
                <img src="/images/team/documentary/2026-documentary-landscape.jpg" width="1920" height="1080" alt="《少年无疆》纪录片海报：四位 SuperPower 队员并肩仰望" fetchpriority="high" decoding="async">
            </picture>
            <div class="documentary-announcement__content">
                <div class="documentary-announcement__copy">
                    <h2 id="documentary-announcement-title"><span>SuperPower2026赛季纪录片</span>正式发布！</h2>
                    <p id="documentary-announcement-description">《少年无疆：长路回响》</p>
                </div>
                <div class="documentary-announcement__actions">
                    <a class="documentary-announcement__link" href="${announcement.url}" target="_blank" rel="noopener noreferrer" aria-label="前往 B 站查看纪录片动态（新窗口打开）">
                        前往 B 站
                        <span data-hud-icon="external" aria-hidden="true"></span>
                    </a>
                    <button class="documentary-announcement__continue" type="button">继续浏览官网</button>
                </div>
            </div>
        </div>`;

    const previousFocus = document.activeElement;
    const close = () => dialog.close();
    let expirationTimer;
    function checkExpiration() {
        clearTimeout(expirationTimer);
        const remaining = announcement.endsAt - Date.now();
        if (remaining <= 0) {
            close();
        } else {
            // Long campaigns must not overflow the browser's signed 32-bit timer delay.
            expirationTimer = setTimeout(checkExpiration, Math.min(remaining, 2147483647));
        }
    }
    dialog.querySelector('.documentary-announcement__continue').addEventListener('click', close);
    dialog.querySelector('.documentary-announcement__link').addEventListener('click', close);

    dialog.addEventListener('keydown', (event) => {
        if (event.key !== 'Tab') return;
        const controls = [...dialog.querySelectorAll('button, a[href]')];
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });

    // Only dismiss a gesture that starts and ends on the backdrop, not a drag from the poster.
    let backdropPointerDown = false;
    dialog.addEventListener('pointerdown', (event) => {
        backdropPointerDown = event.target === dialog;
    });
    dialog.addEventListener('click', (event) => {
        if (backdropPointerDown && event.target === dialog) close();
        backdropPointerDown = false;
    });
    dialog.addEventListener('close', () => {
        clearTimeout(expirationTimer);
        document.removeEventListener('visibilitychange', checkExpiration);
        document.documentElement.classList.remove('documentary-announcement-open');
        const focusTarget = previousFocus instanceof HTMLElement && previousFocus !== document.body
            ? previousFocus : document.querySelector('.nav-logo');
        focusTarget?.focus({ preventScroll: true });
        dialog.remove();
    }, { once: true });

    document.body.append(dialog);
    window.HUD?.decorate(dialog);
    dialog.showModal();
    document.documentElement.classList.add('documentary-announcement-open');
    document.addEventListener('visibilitychange', checkExpiration);
    checkExpiration();
    try {
        sessionStorage.setItem(announcement.sessionKey, '1');
    } catch {
        // Closing must never depend on storage permissions.
    }
})();
