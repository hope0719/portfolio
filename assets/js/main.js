/* 宋欣（刘同学）· 个人作品集 — 交互脚本 */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 1. 滚动进场动画 ---------- */
  var revealTargets = $$('.section, .hero, .stat, .about-grid, .work-card, .id-card, .skill-card, .tl-item, .cert-card, .photo-card');

  revealTargets.forEach(function (el, i) {
    if (!el.classList.contains('stat')) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 6) * 55 + 'ms';
    }
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach(function (el) { io.observe(el); });

    var skillsIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          skillsIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    var sg = $('.skills-grid');
    if (sg) skillsIO.observe(sg);
  } else {
    revealTargets.forEach(function (el) { el.classList.add('in-view'); });
    if ($('.skills-grid')) $('.skills-grid').classList.add('in-view');
  }

  /* ---------- 2. 数字滚动 ---------- */
  function animateCount(el) {
    var target  = parseFloat(el.getAttribute('data-count')) || 0;
    var prefix  = el.getAttribute('data-prefix') || '';
    var suffix  = el.getAttribute('data-suffix') || '';
    var dur     = 1400;
    var start   = null;

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = prefix + val.toLocaleString('zh-CN') + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = $$('#stats .stat strong');
  if ('IntersectionObserver' in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(function (c) {
      c.textContent = (c.getAttribute('data-prefix') || '') +
        (parseFloat(c.getAttribute('data-count')) || 0).toLocaleString('zh-CN') +
        (c.getAttribute('data-suffix') || '');
    });
  }

  /* ---------- 3. 导航高亮 ---------- */
  var navItems = $$('.nav-item');
  var sections = navItems
    .map(function (a) { return $(a.getAttribute('href')); })
    .filter(Boolean);

  function onScroll() {
    var y = window.scrollY + 140;
    var current = sections[0];
    sections.forEach(function (s) { if (s.offsetTop <= y) current = s; });
    navItems.forEach(function (a) {
      a.classList.toggle('active', current && a.getAttribute('href') === '#' + current.id);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 4. 作品筛选 ---------- */
  var filters = $$('.filter');
  var cards   = $$('#worksGrid .work-card');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filters.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      cards.forEach(function (c) {
        var show = (f === 'all') || (c.getAttribute('data-cat') === f);
        c.classList.toggle('hide', !show);
      });
    });
  });

  /* ---------- 5. 图片灯箱 ---------- */
  var lb     = $('#lightbox');
  var lbImg  = $('#lbImg');

  $$('[data-lightbox] img').forEach(function (img) {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', function () {
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLB() {
    lb.classList.remove('open');
    lbImg.src = '';
    document.body.style.overflow = '';
  }
  if (lb) {
    lb.addEventListener('click', closeLB);
    var closeBtn = $('#lbClose');
    if (closeBtn) closeBtn.addEventListener('click', closeLB);
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lb && lb.classList.contains('open')) closeLB();
  });

  /* ---------- 6. 导出 PDF ---------- */
  var printBtn = $('#printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', function () { window.print(); });
  }
})();
