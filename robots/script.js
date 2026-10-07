(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const scenes = [...document.querySelectorAll(".hero-section")];
  const activeScenes = new Set();
  const revealedScenes = new Set();
  const animations = new Set();
  let observer;
  let frame = 0;

  function animateText(scene) {
    scene.classList.remove("scene-pending");
    scene.classList.add("scene-revealed");
    if (reducedMotion.matches || revealedScenes.has(scene)) return;
    revealedScenes.add(scene);

    scene.querySelectorAll(".hero-section-p > *").forEach((element, index) => {
      const animation = element.animate([
        { opacity: 0, transform: "translate3d(0, 28px, 0)" },
        { opacity: 1, transform: "translate3d(0, 0, 0)" }
      ], {
        duration: 1000,
        delay: 100 + index * 130,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "backwards"
      });
      animations.add(animation);
      animation.onfinish = animation.oncancel = () => animations.delete(animation);
    });
  }

  function renderDepth() {
    frame = 0;
    if (reducedMotion.matches || document.hidden) return;
    const height = window.innerHeight;
    const travel = window.innerWidth <= 700 ? 8 : 22;
    // Read every active scene before writing transforms to avoid layout thrashing.
    const positions = [...activeScenes].map(scene => {
      const rect = scene.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (height - rect.top) / (height + rect.height)));
      return { scene, progress };
    });
    positions.forEach(({ scene, progress }) => {
      scene.style.setProperty("--scene-y", `${((progress - 0.5) * travel).toFixed(2)}px`);
      scene.style.setProperty("--scene-scale", (1.06 - progress * 0.025).toFixed(4));
    });
  }

  function scheduleDepth() {
    if (!frame && !reducedMotion.matches && !document.hidden) {
      frame = requestAnimationFrame(renderDepth);
    }
  }

  function configureScenes() {
    observer?.disconnect();
    cancelAnimationFrame(frame);
    frame = 0;
    activeScenes.clear();
    animations.forEach(animation => animation.cancel());
    scenes.forEach(scene => {
      scene.classList.remove("scene-motion", "scene-pending", "scene-active", "scene-revealed");
      scene.style.removeProperty("--scene-y");
      scene.style.removeProperty("--scene-scale");
    });
    // Default HTML stays visible when motion is disabled or browser APIs are absent.
    if (reducedMotion.matches || !window.IntersectionObserver || !Element.prototype.animate) return;

    observer = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        target.classList.toggle("scene-active", isIntersecting);
        if (isIntersecting) {
          activeScenes.add(target);
          animateText(target);
        } else {
          activeScenes.delete(target);
        }
      });
      scheduleDepth();
    }, { threshold: 0.06 });

    scenes.forEach(scene => {
      scene.classList.add("scene-motion");
      if (!revealedScenes.has(scene)) scene.classList.add("scene-pending");
      observer.observe(scene);
    });
  }

  configureScenes();
  window.addEventListener("scroll", scheduleDepth, { passive: true });
  window.addEventListener("resize", scheduleDepth, { passive: true });
  reducedMotion.addEventListener("change", configureScenes);
  document.addEventListener("visibilitychange", scheduleDepth);

  // Preserve the gallery and its controls; slow its easing and pause off screen.
  if (typeof Swiper !== "function") return;
  const gallery = document.querySelector(".mySwiper");
  const swiper = new Swiper(gallery, {
    slidesPerView: 1.2,
    centeredSlides: true,
    spaceBetween: 10,
    speed: reducedMotion.matches ? 0 : 850,
    navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
    autoplay: { delay: 4800, disableOnInteraction: true, pauseOnMouseEnter: true },
    pagination: { el: ".swiper-pagination", clickable: true },
    keyboard: { enabled: true, onlyInViewport: true },
    loop: true
  });
  let galleryVisible = false;
  let interacted = false;
  let hovered = false;

  function updateAutoplay() {
    swiper.params.speed = reducedMotion.matches ? 0 : 850;
    const paused = reducedMotion.matches || document.hidden || !galleryVisible ||
      interacted || hovered || gallery.contains(document.activeElement);
    if (paused) swiper.autoplay.stop();
    else if (!swiper.autoplay.running) swiper.autoplay.start();
    if (reducedMotion.matches) {
      swiper.setTransition(0);
      swiper.slideTo(swiper.activeIndex, 0);
    }
  }

  // Native hover/focus events also handle reduced-motion changes at runtime.
  gallery.addEventListener("pointerenter", event => {
    if (event.pointerType !== "mouse") return;
    hovered = true;
    updateAutoplay();
  });
  gallery.addEventListener("pointerleave", () => { hovered = false; updateAutoplay(); });
  gallery.addEventListener("focusin", updateAutoplay);
  gallery.addEventListener("focusout", () => queueMicrotask(updateAutoplay));
  function stopAfterInteraction() { interacted = true; updateAutoplay(); }
  swiper.on("sliderFirstMove", stopAfterInteraction);
  gallery.addEventListener("click", event => {
    if (event.target.closest(".swiper-button-next, .swiper-button-prev, .swiper-pagination-bullet")) {
      stopAfterInteraction();
    }
  });
  gallery.addEventListener("keydown", event => {
    if (["ArrowLeft", "ArrowRight", "Enter", " "].includes(event.key)) stopAfterInteraction();
  });
  if (window.IntersectionObserver) {
    new IntersectionObserver(([entry]) => {
      galleryVisible = entry.isIntersecting;
      updateAutoplay();
    }, { threshold: 0.2 }).observe(gallery);
  }
  reducedMotion.addEventListener("change", updateAutoplay);
  document.addEventListener("visibilitychange", updateAutoplay);
  updateAutoplay();
})();
