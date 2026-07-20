/* ============================================================
   SPECTRA LEAF — GSAP ScrollTrigger Animations
   Loaded after gsap core + ScrollTrigger CDN scripts.
   No ES modules — globals only.
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------
   Helper: Split element text into per-word <span>s
   ---------------------------------------------------------- */
function splitWords(element) {
  var text = element.textContent;
  var words = text.split(/\s+/).filter(Boolean);
  element.innerHTML = words
    .map(function (w) {
      return '<span class="word" style="display:inline-block">' + w + '&nbsp;</span>';
    })
    .join('');
  return element.querySelectorAll('.word');
}

/* ----------------------------------------------------------
   Boot everything after the DOM is ready
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {

  /* ========================================================
     1. NAVIGATION — scroll class & active-section tracking
     ======================================================== */
  var nav = document.querySelector('.nav');

  // Add / remove scrolled class
  if (nav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }
    });
  }

  // Active-section tracking via ScrollTrigger
  var sections = gsap.utils.toArray('section[id]');
  sections.forEach(function (section) {
    var id = section.getAttribute('id');
    var link = document.querySelector('a[href="#' + id + '"]');
    if (!link) return;

    ScrollTrigger.create({
      trigger: section,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: function () { link.classList.add('nav__link--active'); },
      onLeave: function () { link.classList.remove('nav__link--active'); },
      onEnterBack: function () { link.classList.add('nav__link--active'); },
      onLeaveBack: function () { link.classList.remove('nav__link--active'); }
    });
  });

  /* ========================================================
     2. MOBILE MENU — hamburger toggle
     ======================================================== */
  var toggle = document.querySelector('.nav__mobile-toggle');
  var mobileLinks = document.querySelector('.nav__links');
  var overlay = document.querySelector('.nav__overlay');

  function closeMobileMenu() {
    if (mobileLinks) mobileLinks.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-open');
    if (toggle) toggle.classList.remove('is-open');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var opening = !mobileLinks.classList.contains('is-open');
      if (opening) {
        mobileLinks.classList.add('is-open');
        if (overlay) overlay.classList.add('is-open');
        toggle.classList.add('is-open');
      } else {
        closeMobileMenu();
      }
    });
  }

  // Close on link click
  if (mobileLinks) {
    mobileLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMobileMenu);
    });
  }

  // Close on overlay click
  if (overlay) {
    overlay.addEventListener('click', closeMobileMenu);
  }

  /* ========================================================
     3. SMOOTH SCROLL — anchor links
     ======================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;

      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      var navHeight = nav ? nav.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ========================================================
     4. HERO LOAD ANIMATION
     ======================================================== */
  var heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    splitWords(heroTitle);
  }

  var heroTl = gsap.timeline({ delay: 0.3 });

  var heroBadge = document.querySelector('.hero__badge');
  if (heroBadge) {
    heroTl.from('.hero__badge', {
      y: 30, opacity: 0, duration: 0.8, ease: 'power3.out'
    });
  }

  var heroWords = gsap.utils.toArray('.hero__title .word');
  if (heroWords.length) {
    heroTl.from('.hero__title .word', {
      y: 40, opacity: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out'
    });
  }

  var heroTagline = document.querySelector('.hero__tagline');
  if (heroTagline) {
    heroTl.from('.hero__tagline', {
      y: 20, opacity: 0, duration: 0.8, ease: 'power3.out'
    }, '<-0.4');
  }

  var heroBtns = gsap.utils.toArray('.hero__cta-group .btn');
  if (heroBtns.length) {
    heroTl.from('.hero__cta-group .btn', {
      y: 20, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out'
    }, '<-0.3');
  }

  var statChips = gsap.utils.toArray('.stat-chip');
  if (statChips.length) {
    heroTl.from('.stat-chip', {
      y: 20, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out'
    }, '<-0.2');
  }

  /* ========================================================
     5. SECTION NUMBER PARALLAX
     ======================================================== */
  gsap.utils.toArray('.section__number').forEach(function (el) {
    gsap.to(el, {
      yPercent: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  });

  /* ========================================================
     6. GENERIC REVEAL ANIMATION (.reveal)
     ======================================================== */
  gsap.utils.toArray('.reveal').forEach(function (el) {
    var delay = parseFloat(el.dataset.delay) || 0;

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: function () {
        gsap.from(el, {
          y: 40, opacity: 0, duration: 0.8,
          delay: delay,
          ease: 'power3.out'
        });
      }
    });
  });

  /* ========================================================
     7. CARD BATCH ANIMATION
     ======================================================== */
  var cards = gsap.utils.toArray('.card, .team-card, .objective-card');
  if (cards.length) {
    ScrollTrigger.batch(cards, {
      start: 'top 85%',
      once: true,
      onEnter: function (batch) {
        gsap.from(batch, {
          y: 40, opacity: 0, duration: 0.6,
          stagger: 0.08, ease: 'power3.out'
        });
      }
    });
  }

  /* ========================================================
     8. COUNTER ANIMATION
     ======================================================== */
  gsap.utils.toArray('.counter-value').forEach(function (el) {
    var target = parseFloat(el.dataset.target) || 0;
    var suffix = el.dataset.suffix || '';

    ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      once: true,
      onEnter: function () {
        var proxy = { val: 0 };
        gsap.to(proxy, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          snap: { val: 1 },
          onUpdate: function () {
            el.textContent = Math.round(proxy.val) + suffix;
          }
        });
      }
    });
  });

  /* ========================================================
     9. ARCHITECTURE LAYER REVEAL
     ======================================================== */
  var archLayers = gsap.utils.toArray('.arch-layer');
  if (archLayers.length) {
    gsap.from(archLayers, {
      x: -40, opacity: 0,
      stagger: 0.15, duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: archLayers[0],
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  }

  /* ========================================================
     10. PIPELINE ANIMATION
     ======================================================== */
  var pipelineNodes = gsap.utils.toArray('.pipeline__node');
  var pipelineConnectors = gsap.utils.toArray('.pipeline__connector');

  if (pipelineNodes.length) {
    var pipeTl = gsap.timeline({
      scrollTrigger: {
        trigger: pipelineNodes[0],
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });

    pipeTl.from(pipelineNodes, {
      x: -30, opacity: 0,
      stagger: 0.12, duration: 0.6,
      ease: 'power3.out'
    });

    if (pipelineConnectors.length) {
      pipeTl.from(pipelineConnectors, {
        scaleX: 0,
        transformOrigin: 'left center',
        stagger: 0.15, duration: 0.6,
        ease: 'power3.out'
      }, '-=0.3');
    }
  }

  /* ========================================================
     11. TABLE ROW REVEAL
     ======================================================== */
  var tableRows = gsap.utils.toArray('.arch-table tbody tr');
  if (tableRows.length) {
    gsap.from(tableRows, {
      y: 20, opacity: 0,
      stagger: 0.05, duration: 0.5,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.arch-table',
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  }

  /* ========================================================
     12. IMAGE PARALLAX
     ======================================================== */
  gsap.utils.toArray('.parallax-img').forEach(function (img) {
    gsap.to(img, {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: img,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  });

  /* ========================================================
     13. WORD REVEAL (.word-reveal section titles)
     ======================================================== */
  gsap.utils.toArray('.word-reveal').forEach(function (el) {
    var words = splitWords(el);

    gsap.from(words, {
      opacity: 0, y: 15,
      stagger: 0.03, duration: 0.5,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });

}); // end DOMContentLoaded
