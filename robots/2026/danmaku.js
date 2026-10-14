import { danmakuMessages } from './danmaku-messages.js';

const windowElement = document.querySelector('.danmaku-window');
const stage = windowElement.querySelector('.danmaku-stage');
const list = windowElement.querySelector('.danmaku-list');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const flights = new Set();
let visible = false;

danmakuMessages.forEach(message => {
    const item = document.createElement('li');
    item.textContent = message;
    list.append(item);
});

function updatePlayback() {
    const playing = visible && !document.hidden && !reducedMotion.matches;
    flights.forEach(animation => playing ? animation.play() : animation.pause());
}

function launch(lane, seed = false) {
    const item = document.createElement('span');
    item.className = 'danmaku-item';
    item.classList.toggle('is-accent', Math.random() < 0.2);
    item.textContent = danmakuMessages[Math.floor(Math.random() * danmakuMessages.length)];
    stage.append(item);

    const width = stage.clientWidth;
    const textWidth = item.offsetWidth;
    const laneHeight = stage.clientHeight / 4;
    item.style.top = `${lane * laneHeight + (laneHeight - item.offsetHeight) / 2}px`;
    const duration = (width + textWidth) / (80 + Math.random() * 40) * 1000;
    const animation = item.animate([
        { transform: `translateX(${width}px)` },
        { transform: `translateX(${-textWidth}px)` }
    ], { duration, easing: 'linear' });
    if (seed) animation.currentTime = duration * (0.15 + Math.random() * 0.65);
    flights.add(animation);
    animation.onfinish = () => {
        flights.delete(animation);
        item.remove();
        launch(lane);
    };
    updatePlayback();
}

function configure() {
    flights.forEach(animation => {
        animation.onfinish = null;
        animation.cancel();
    });
    flights.clear();
    stage.replaceChildren();
    windowElement.classList.toggle('is-animated', !reducedMotion.matches);
    if (reducedMotion.matches) return;
    for (let lane = 0; lane < 4; lane++) launch(lane, true);
}

new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updatePlayback();
}).observe(windowElement);
new ResizeObserver(configure).observe(stage);
reducedMotion.addEventListener('change', configure);
document.addEventListener('visibilitychange', updatePlayback);
configure();
