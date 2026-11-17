/* Shane Rainey, DO — progressive enhancement only.
   The site is fully readable and navigable without this file.
   Motion uses transform/opacity only and is skipped entirely for
   visitors who prefer reduced motion. */
(function () {
  "use strict";
  var root = document.documentElement;
  window.__siteReady = true;
  root.classList.remove("reveal-fallback");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  /* ---------- Preview bar offset for the fixed home header ---------- */
  var bar = document.querySelector(".preview-bar");
  var setBar = function () { root.style.setProperty("--bar-h", bar ? bar.offsetHeight + "px" : "0px"); };
  setBar();

  /* ---------- Header: solid after scroll, tucks away when scrolling down ---------- */
  var header = document.querySelector("[data-header]");
  var lastY = window.scrollY;
  var onHeaderScroll = function () {
    if (!header) return;
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 24);
    var navOpen = root.classList.contains("nav-open");
    if (!navOpen && y > 420 && y > lastY + 4) header.classList.add("is-hidden");
    else if (y < lastY - 4 || y < 420) header.classList.remove("is-hidden");
    lastY = y;
  };
  // Keep the header visible whenever keyboard focus is inside it.
  if (header) header.addEventListener("focusin", function () { header.classList.remove("is-hidden"); });

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var label = toggle.querySelector(".nav-toggle__label");
    var desktop = window.matchMedia("(min-width: 1080px)");
    var isOpen = false;
    toggle.hidden = false;

    var setOpen = function (open, restoreFocus) {
      isOpen = open;
      toggle.setAttribute("aria-expanded", String(open));
      if (label) label.textContent = open ? "Close" : "Menu";
      root.classList.toggle("nav-open", open);
      document.body.classList.toggle("nav-locked", open);
      if (open) {
        header.classList.remove("is-hidden");
        var first = nav.querySelector("a");
        if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 60);
      } else if (restoreFocus) {
        toggle.focus();
      }
    };

    toggle.addEventListener("click", function () { setOpen(!isOpen, true); });
    document.addEventListener("keydown", function (e) {
      if (!isOpen) return;
      if (e.key === "Escape") { setOpen(false, true); return; }
      if (e.key === "Tab") {
        var items = [toggle].concat(Array.prototype.slice.call(nav.querySelectorAll("a")));
        var firstEl = items[0], lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
      }
    });
    nav.addEventListener("click", function (e) { if (isOpen && e.target.closest("a")) setOpen(false, false); });
    var onChange = function (e) { if (e.matches && isOpen) setOpen(false, false); };
    if (desktop.addEventListener) desktop.addEventListener("change", onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  /* ---------- Staggered groups: give each child its index ---------- */
  each(document.querySelectorAll("[data-stagger]"), function (group) {
    each(group.children, function (child, i) { child.style.setProperty("--i", i); });
  });

  /* ---------- Scroll reveals ---------- */
  var targets = document.querySelectorAll("[data-reveal], .section-mark, .steps");
  var showAll = function () {
    each(targets, function (el) { el.classList.add("is-visible", "is-drawn"); });
  };
  if (reduce.matches || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          if (entry.target.classList.contains("steps")) entry.target.classList.add("is-drawn");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    each(targets, function (el) { io.observe(el); });
    // Anything already above the fold (e.g. after a reload mid-page) appears immediately.
    window.addEventListener("pageshow", function (e) { if (e.persisted) showAll(); });
  }

  /* ---------- Parallax (transform only, rAF-throttled, in-view only) ---------- */
  var layers = [];
  each(document.querySelectorAll("[data-parallax]"), function (el) {
    layers.push({ el: el, speed: parseFloat(el.getAttribute("data-parallax")) || 0, box: el.closest("section") || el.parentElement });
  });
  each(document.querySelectorAll("[data-parallax-media]"), function (fig) {
    var img = fig.querySelector("img");
    if (img) layers.push({ el: img, speed: parseFloat(fig.getAttribute("data-parallax-media")) || 0, box: fig, centered: true });
  });

  var vh = window.innerHeight;
  var ticking = false;
  var renderParallax = function () {
    ticking = false;
    if (reduce.matches) return;
    for (var i = 0; i < layers.length; i++) {
      var L = layers[i];
      var r = L.box.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      var offset = L.centered ? (r.top + r.height / 2 - vh / 2) : -r.top;
      var y = offset * L.speed * (L.centered ? -1 : 1);
      L.el.style.transform = "translate3d(0," + y.toFixed(1) + "px,0)";
    }
  };
  var onScroll = function () {
    onHeaderScroll();
    if (!ticking && layers.length) { ticking = true; window.requestAnimationFrame(renderParallax); }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { vh = window.innerHeight; setBar(); onScroll(); }, { passive: true });
  var onMotionChange = function () {
    if (reduce.matches) { layers.forEach(function (L) { L.el.style.transform = ""; }); showAll(); }
    else onScroll();
  };
  if (reduce.addEventListener) reduce.addEventListener("change", onMotionChange);
  onScroll();

  /* ---------- Images fade in once decoded ---------- */
  each(document.querySelectorAll(".media img"), function (img) {
    if (img.complete) return;
    img.style.opacity = "0";
    img.style.transition = "opacity .8s ease, transform 1.8s cubic-bezier(.16,1,.3,1)";
    img.addEventListener("load", function () { img.style.opacity = "1"; }, { once: true });
  });
})();
