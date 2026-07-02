/* Jesse Karanga — portfolio interactions */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme (light default, persisted) ---------- */
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem("jk-theme"); } catch (e) {}
  if (stored === "dark") root.setAttribute("data-theme", "dark");

  document.getElementById("themeToggle").addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("jk-theme", next); } catch (e) {}
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Nav scrolled state ---------- */
  var nav = document.getElementById("nav");
  var onScroll = function () { nav.classList.toggle("is-scrolled", window.scrollY > 24); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById("navBurger");
  var menu = document.getElementById("mobileMenu");
  var setMenu = function (open) {
    burger.classList.toggle("is-open", open);
    menu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", function () { setMenu(!menu.classList.contains("is-open")); });
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });

  /* ---------- Works filter ---------- */
  var chips = document.querySelectorAll("#worksFilter .chip");
  var works = document.querySelectorAll("#worksGrid .work");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      var f = chip.getAttribute("data-filter");
      works.forEach(function (w) {
        var show = f === "all" || w.getAttribute("data-cat") === f;
        w.classList.toggle("is-hidden", !show);
      });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });

  /* ---------- GSAP setup ---------- */
  if (!window.gsap) { finishPreloader(true); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* Lenis smooth scroll (desktop feel, native on touch) */
  if (!reduceMotion && window.Lenis) {
    var lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length > 1 && document.querySelector(id)) {
          e.preventDefault();
          lenis.scrollTo(id, { offset: -70 });
        }
      });
    });
  }

  /* ---------- Split section titles into words ---------- */
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map(function (w) { return '<span class="word"><i>' + w + "</i></span>"; })
      .join(" ");
  });

  /* ---------- Preloader + hero intro ---------- */
  function heroIntro() {
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".hero-title .line > span", { yPercent: 110, duration: 0.9, stagger: 0.12 })
      .from(".hero-eyebrow", { y: 16, autoAlpha: 0, duration: 0.5 }, "-=0.6")
      .from(".hero-sub", { y: 22, autoAlpha: 0, duration: 0.6 }, "-=0.35")
      .from(".hero-actions", { y: 22, autoAlpha: 0, duration: 0.6 }, "-=0.4")
      .from(".hero-stats li", { y: 24, autoAlpha: 0, duration: 0.55, stagger: 0.08 }, "-=0.4")
      .from(".hero-portrait img", { scale: 1.12, autoAlpha: 0, duration: 1.1, ease: "power2.out" }, 0.15)
      .from(".hero-frame", { scale: 0.94, autoAlpha: 0, duration: 0.9 }, "-=0.7")
      .from(".hero-card", { y: 26, autoAlpha: 0, duration: 0.6 }, "-=0.5");
    countUp();
  }

  function finishPreloader(skipAnim) {
    var pre = document.getElementById("preloader");
    if (skipAnim || reduceMotion) {
      pre.remove();
      if (!reduceMotion && window.gsap) heroIntro(); else countUp();
      return;
    }
    var tl = gsap.timeline();
    tl.to(".preloader-fill", { scaleX: 1, duration: 0.7, ease: "power2.inOut" })
      .to(pre, {
        yPercent: -100, duration: 0.7, ease: "power3.inOut",
        onComplete: function () { pre.remove(); }
      }, "+=0.1")
      .add(heroIntro, "-=0.35");
  }
  window.addEventListener("load", function () { finishPreloader(false); });
  /* Safety: never trap the page behind the preloader */
  setTimeout(function () {
    if (document.getElementById("preloader")) finishPreloader(true);
  }, 4000);

  /* ---------- Stat counters ---------- */
  var counted = false;
  function countUp() {
    if (counted) return; counted = true;
    document.querySelectorAll(".hero-stats [data-count]").forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      var obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.6, ease: "power2.out", delay: 0.4,
        onUpdate: function () { el.textContent = Math.round(obj.v); }
      });
    });
  }

  if (reduceMotion) return; /* content stays visible, no scroll animations */

  /* ---------- Section title word reveals ---------- */
  document.querySelectorAll("[data-split]").forEach(function (el) {
    gsap.from(el.querySelectorAll(".word > i"), {
      yPercent: 110, duration: 0.75, stagger: 0.06, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%" }
    });
  });

  /* ---------- Generic reveals ---------- */
  gsap.utils.toArray(".section .reveal").forEach(function (el) {
    gsap.from(el, {
      y: 34, autoAlpha: 0, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" }
    });
  });

  /* ---------- About photo parallax ---------- */
  gsap.to(".about-photo img", {
    yPercent: -8, ease: "none",
    scrollTrigger: { trigger: ".about-photo", start: "top bottom", end: "bottom top", scrub: true }
  });

  /* ---------- Timeline ---------- */
  gsap.to(".timeline-progress", {
    scaleY: 1, ease: "none",
    scrollTrigger: { trigger: ".timeline", start: "top 75%", end: "bottom 60%", scrub: 0.4 }
  });
  gsap.utils.toArray(".tl-item").forEach(function (item) {
    gsap.from(item, {
      y: 44, autoAlpha: 0, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: item, start: "top 84%" }
    });
  });

  /* ---------- Cards (per-element reveals; robust in multi-column grids) ---------- */
  gsap.utils.toArray(".works-grid .work").forEach(function (card, i) {
    gsap.from(card, {
      y: 40, autoAlpha: 0, duration: 0.7, ease: "power3.out",
      delay: (i % 3) * 0.08,
      scrollTrigger: { trigger: card, start: "top 94%", once: true }
    });
  });
  gsap.utils.toArray(".service").forEach(function (el) {
    gsap.from(el, {
      x: -36, autoAlpha: 0, duration: 0.65, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 92%", once: true }
    });
  });
  gsap.utils.toArray(".cred, .edu").forEach(function (el) {
    gsap.from(el, {
      y: 36, autoAlpha: 0, duration: 0.65, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 94%", once: true }
    });
  });

  /* Safety: rescue any card that is inside the viewport but still hidden
     (never touches below-the-fold cards that are legitimately waiting to reveal) */
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  function rescueVisibleCards() {
    document.querySelectorAll(".works-grid .work, .service, .cred, .edu").forEach(function (el) {
      var r = el.getBoundingClientRect();
      var inView = r.top < window.innerHeight * 0.95 && r.bottom > 0;
      if (inView && parseFloat(getComputedStyle(el).opacity) < 0.05) {
        gsap.to(el, { autoAlpha: 1, y: 0, x: 0, duration: 0.4, overwrite: true });
      }
    });
  }
  window.addEventListener("scroll", function () {
    if (rescueVisibleCards._t) return;
    rescueVisibleCards._t = setTimeout(function () { rescueVisibleCards._t = null; rescueVisibleCards(); }, 250);
  }, { passive: true });

  /* ---------- Parallax band ---------- */
  gsap.to(".band img", {
    yPercent: -18, ease: "none",
    scrollTrigger: { trigger: ".band", start: "top bottom", end: "bottom top", scrub: true }
  });

  /* ---------- Contact card ---------- */
  gsap.from(".contact-card", {
    y: 60, autoAlpha: 0, scale: 0.98, duration: 0.9, ease: "power3.out",
    scrollTrigger: { trigger: ".contact-card", start: "top 85%" }
  });

  /* ---------- Marquee drift ---------- */
  gsap.to("#marqueeTrack", {
    xPercent: -50, ease: "none", duration: 26, repeat: -1
  });

  /* ---------- Background blobs drift ---------- */
  gsap.to(".bg-blob-1", { yPercent: 26, ease: "none", scrollTrigger: { trigger: "body", start: "top top", end: "max", scrub: 1.2 } });
  gsap.to(".bg-blob-2", { yPercent: -20, ease: "none", scrollTrigger: { trigger: "body", start: "top top", end: "max", scrub: 1.4 } });
  gsap.to(".bg-blob-3", { yPercent: -30, ease: "none", scrollTrigger: { trigger: "body", start: "top top", end: "max", scrub: 1 } });
})();
