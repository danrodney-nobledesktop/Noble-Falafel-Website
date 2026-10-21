(function () {
  var DISHES = {
    pita: { name: 'Classic Pita', price: 7, fact: 'Five falafel, fried when you order, so they reach you crackling.',
      layers: [['Pita', '#D9A55B', 1], ['Parsley', '#4F7A2E', .7], ['Tomato & cucumber', '#E8332A', 1], ['Five falafel', '#6B3A1A', 2.2], ['Pickled turnip', '#D9476B', .7], ['Tahini', '#EFE0C0', .9], ['Pita', '#D9A55B', 1]] },
    sabich: { name: 'Sabich Pita', price: 8, fact: 'Fried eggplant and egg instead of falafel, with sour mango amba.',
      layers: [['Pita', '#D9A55B', 1], ['Amba', '#E9A21F', .7], ['Chopped salad', '#E8332A', 1], ['Fried eggplant', '#4B2A3A', 1.6], ['Egg', '#F6D25A', .9], ['Tahini', '#EFE0C0', .8], ['Pita', '#D9A55B', 1]] },
    platter: { name: 'Falafel Platter', price: 11, fact: 'Six falafel over vermicelli rice, for when lunch needs a fork.',
      layers: [['Salad', '#8DB255', 1], ['Six falafel', '#6B3A1A', 2.2], ['Hummus', '#D9B77E', 1.2], ['Vermicelli rice', '#F4E8D2', 1.6], ['Pita on the side', '#D9A55B', 1]] },
    bowl: { name: 'Hummus Bowl', price: 9, fact: 'Warm whole chickpeas on hummus. Gluten-free without the pita.',
      layers: [['Olive oil & sumac', '#C0232B', .6], ['Whole chickpeas', '#E3C27A', 1.2], ['Hummus', '#D9B77E', 2.6], ['Warm pita', '#D9A55B', 1]] },
    fries: { name: 'Fries & Dip', price: 5, fact: 'Seasoned fries with garlic sauce or spicy sauce. Gluten-free.',
      layers: [['Spicy sauce', '#EE6B24', .8], ['Seasoned fries', '#F2B024', 3], ['Garlic sauce', '#F4E8D2', .9]] }
  };
  var EXTRAS = {
    hot: ['Hot sauce', '#EE6B24', .55, 0],
    amba: ['Amba', '#E9A21F', .55, .5],
    more: ['Two more falafel', '#82481F', .9, 1.5]
  };

  function lum(hex) {
    var c = [1, 3, 5].map(function (i) { var v = parseInt(hex.substr(i, 2), 16) / 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
  }
  function inkFor(hex) { var L = lum(hex); return (L + .05) / .067 >= (.84) / (L + .05) ? '#2E1A10' : '#F1E5CF'; }
  function money(n) { return '$' + n.toFixed(2); }

  var disc = document.querySelector('[data-disc]');
  if (disc) {
    var chosen = 'pita', extras = {};
    var nameEl = document.querySelector('[data-name]'), priceEl = document.querySelector('[data-price]'), factEl = document.querySelector('[data-fact]');
    var buttons = [].slice.call(document.querySelectorAll('[data-dish]'));

    function layersFor(id) {
      var d = DISHES[id], out = d.layers.slice(), add = [];
      Object.keys(extras).forEach(function (k) { if (extras[k]) add.push(EXTRAS[k]); });
      out.splice(1, 0, ...add);
      return out;
    }
    function priceFor(id) {
      var p = DISHES[id].price;
      Object.keys(extras).forEach(function (k) { if (extras[k]) p += EXTRAS[k][3]; });
      return p;
    }
    function paint(id) {
      disc.innerHTML = layersFor(id).map(function (l) {
        return '<div class="disc__layer" style="flex-grow:' + l[2] + ';background:' + l[1] + ';color:' + inkFor(l[1]) + '"><span>' + l[0].replace('&', '&amp;') + '</span></div>';
      }).join('');
      nameEl.textContent = DISHES[id].name;
      priceEl.textContent = money(priceFor(id));
      factEl.textContent = DISHES[id].fact;
    }
    var swapTimer;
    function show(id) {
      clearTimeout(swapTimer);
      if (still) { paint(id); return; }
      disc.classList.add('is-swapping');
      swapTimer = setTimeout(function () { paint(id); disc.classList.remove('is-swapping'); }, 160);
    }
    buttons.forEach(function (b) {
      var id = b.getAttribute('data-dish');
      b.addEventListener('click', function () {
        chosen = id;
        buttons.forEach(function (o) { var on = o === b; o.classList.toggle('is-on', on); o.setAttribute('aria-pressed', on); });
        show(id);
      });
      if (window.matchMedia('(hover: hover)').matches) {
        b.addEventListener('mouseenter', function () { if (id !== chosen) show(id); });
        b.addEventListener('mouseleave', function () { if (id !== chosen) show(chosen); });
      }
    });
    [].forEach.call(document.querySelectorAll('[data-extra]'), function (i) {
      i.addEventListener('change', function () { extras[i.getAttribute('data-extra')] = i.checked; show(chosen); });
    });
  }

  // open or closed, in New York time
  function statusText() {
    var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    var get = function (t) { return (parts.find(function (p) { return p.type === t; }) || {}).value; };
    var day = get('weekday'), h = parseInt(get('hour'), 10) % 24, m = parseInt(get('minute'), 10);
    var mins = h * 60 + m;
    if (day === 'Mon') return 'Closed today: we’re out buying chickpeas. Back Tuesday at 10am.';
    if (mins >= 600 && mins < 1260) {
      var left = 1260 - mins, hh = Math.floor(left / 60), mm = left % 60;
      return 'Open now, frying until 9pm (' + (hh ? hh + 'h ' : '') + mm + 'm left).';
    }
    if (mins < 600) return 'Closed now. The fryer goes on at 10am today.';
    return day === 'Sun' ? 'Closed now. Back Tuesday at 10am.' : 'Closed now. Back tomorrow at 10am.';
  }
  var st = document.querySelectorAll('[data-status]');
  function tick() { var t = statusText(); [].forEach.call(st, function (e) { e.textContent = t; }); }
  if (st.length) { tick(); setInterval(tick, 60000); }

  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches, stopSlides = function () {};

  // the open dot goes green while the fryer is on
  [].forEach.call(document.querySelectorAll('.hero__status'), function (p) {
    p.classList.toggle('is-open', /^Open now/.test(p.textContent.trim()));
  });

  // the sequences, in GSAP: the hero opens on load, the frame when it scrolls in, the sections as they arrive.
  // Without GSAP or with reduced motion everything simply sits at rest.
  var root = document.documentElement;
  if (window.gsap && !still) {
    var open = { clipPath: 'circle(50% at 50% 50%)', duration: 1, ease: 'power3.inOut', stagger: 0.12 };
    var shut = { clipPath: 'circle(0% at 50% 50%)' };

    gsap.timeline({ defaults: { ease: 'power3.out' }, onStart: function () { root.classList.remove('motion'); } })
      .from('.hero__copy > *', { autoAlpha: 0, y: 26, duration: 0.8, stagger: 0.08 }, 0)
      .from('.hero__title span', { y: 26, duration: 0.8, stagger: 0.08 }, 0)
      .from('.hero__stripes', { autoAlpha: 0, duration: 0.01 }, 0)
      .from('.hero__stripes span', { scaleX: 0.15, transformOrigin: 'left center', duration: 1, stagger: 0.07 }, 0)
      .from('.hero__disc', { autoAlpha: 0, rotation: -10, scale: 0.92, duration: 1.6 }, 0)
      .fromTo('.hero__disc .ring, .hero__disc .core', shut, open, 0)
      .from('.hero__disc .core img', { scale: 1.16, duration: 1.8 }, 0.5);

    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      // the ringed circles further down (the fried frame, the map) open each time they come back:
      // they shut once fully off screen, and play again on the way back in
      var ringsOpenOnReturn = function (circle, parts) {
        var opening = gsap.timeline({ paused: true }).fromTo(parts, shut, open);
        var replay = function () { if (opening.progress() === 0) opening.play(); };
        var reset = function () { opening.pause(0); };
        ScrollTrigger.create({ trigger: circle, start: 'top 75%', end: 'bottom 25%', onEnter: replay, onEnterBack: replay });
        ScrollTrigger.create({ trigger: circle, start: 'top bottom', end: 'bottom top', onLeave: reset, onLeaveBack: reset });
      };
      ringsOpenOnReturn('.frame__disc', '.frame__disc .ring, .frame__disc .core');
      ringsOpenOnReturn('.find__rings', '.find__rings .ring, .find__rings .find__map-win');

      // headings, then their text, then the picture, a section at a time
      gsap.utils.toArray('section, .foot').forEach(function (sec) {
        var parts = gsap.utils.toArray(sec.querySelectorAll('.r1, .r2, .r3')).sort(function (x, y) {
          return x.className.match(/r(\d)/)[1] - y.className.match(/r(\d)/)[1];
        });
        if (parts.length) gsap.from(parts, { autoAlpha: 0, y: 24, duration: 0.7, ease: 'power3.out', stagger: 0.08,
          scrollTrigger: { trigger: sec, start: 'top 80%', once: true } });
      });

      // starts once the band is well into view and is done by the middle of the screen
      gsap.from('.groove span', { scaleX: 0.15, transformOrigin: 'left center', ease: 'none', stagger: 0.08,
        scrollTrigger: { trigger: '.groove', start: 'top 85%', end: 'top 45%', scrub: 0.6 } });
      gsap.from('.visit__word', { yPercent: 18, ease: 'none',
        scrollTrigger: { trigger: '.visit', start: 'top 90%', end: 'top 40%', scrub: true } });
      gsap.from('.blocks span', { scaleY: 0.35, transformOrigin: 'bottom center', ease: 'none', stagger: 0.03,
        scrollTrigger: { trigger: '.blocks', start: 'top bottom', end: 'bottom 85%', scrub: true } });
    }
  } else root.classList.remove('motion');

  // one frame, the contents change: every 3.2s while it is on screen, or on tap
  var frame = document.querySelector('[data-frame]');
  if (frame) {
    var slides = frame.querySelectorAll('.slide'), cap = frame.querySelector('[data-frame-cap]'), i = 0, timer = null, seen = false;
    function go(n) {
      slides[i].classList.remove('is-on');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('is-on');
      cap.textContent = slides[i].getAttribute('data-caption');
    }
    function stop() { clearInterval(timer); timer = null; }
    function run() { stop(); if (!still && seen && !document.hidden) timer = setInterval(function () { go(i + 1); }, 3200); }
    frame.querySelector('.frame__win').addEventListener('click', function () { go(i + 1); run(); });
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : run(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { seen = en[0].isIntersecting; seen ? run() : stop(); }).observe(frame);
    // the video only plays when motion is welcome; otherwise its poster frame stands still
    var video = frame.querySelector('video');
    if (video && !still) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
    stopSlides = function () { stop(); if (video) video.pause(); };
  }

  // turning reduced motion on while the page is open settles everything where it would end and stops the rest
  var motionPref = window.matchMedia('(prefers-reduced-motion: reduce)');
  var calm = function () {
    if (!motionPref.matches) return;
    still = true;
    root.classList.remove('motion');
    // jump every scroll-driven tween to its end before its trigger goes, or it would stay at its hidden start
    if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(function (t) { if (t.animation) t.animation.progress(1); t.kill(); });
    if (window.gsap) gsap.globalTimeline.getChildren(true, true, true).forEach(function (t) { t.progress(1).kill(); });
    stopSlides();
  };
  if (motionPref.addEventListener) motionPref.addEventListener('change', calm); else if (motionPref.addListener) motionPref.addListener(calm);

  // in-page links scroll to their section without adding #section to the address bar
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var target = document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
    // keyboard and screen reader users land in the section they picked
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  // the bar: a dropdown on narrow screens, and the link for the section you are in
  var toggle = document.querySelector('[data-nav-toggle]'), nav = document.getElementById('nav-list');
  if (toggle && nav) {
    function setNav(on) { toggle.setAttribute('aria-expanded', on); nav.classList.toggle('is-open', on); }
    toggle.addEventListener('click', function () { setNav(toggle.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });
  }
  var links = [].slice.call(document.querySelectorAll('.nav__list a'));
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id); if (a.hasAttribute('aria-current')) a.setAttribute('aria-current', 'true'); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) spy.observe(s); });
  }

  // forms open an email with the visitor's details written in
  var coupon = document.querySelector('[data-coupon]');
  if (coupon) coupon.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = coupon.elements;
    var body = 'Hi Noble Falafel,\n\nWe’d like catering.\n\nName: ' + f.name.value + '\nEmail: ' + f.email.value + '\nDate: ' + f.date.value + '\nPeople: ' + f.people.value + '\n';
    location.href = 'mailto:catering@noblefalafel.com?subject=' + encodeURIComponent('Catering request' + (f.date.value ? ' for ' + f.date.value : '')) + '&body=' + encodeURIComponent(body);
  });
  var dispatch = document.querySelector('[data-dispatch]');
  if (dispatch) dispatch.addEventListener('submit', function (e) {
    e.preventDefault();
    location.href = 'mailto:dispatch@noblefalafel.com?subject=' + encodeURIComponent('Sign me up for the Falafel Dispatch') + '&body=' + encodeURIComponent('Please add ' + dispatch.elements.email.value + ' to the list.');
  });
})();
