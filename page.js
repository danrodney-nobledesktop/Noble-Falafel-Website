(function () {
  var root = document.documentElement;
  var motionPref = window.matchMedia('(prefers-reduced-motion: reduce)');
  var still = motionPref.matches;

  // open or closed, in New York time
  function statusText() {
    var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    var get = function (t) { return (parts.find(function (p) { return p.type === t; }) || {}).value; };
    var day = get('weekday'), mins = (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10);
    if (day === 'Mon') return 'Closed today: we’re out buying chickpeas. Back Tuesday at 10am.';
    if (mins >= 600 && mins < 1260) {
      var left = 1260 - mins, hh = Math.floor(left / 60), mm = left % 60;
      return 'Open now, frying until 9pm (' + (hh ? hh + 'h ' : '') + mm + 'm left).';
    }
    if (mins < 600) return 'Closed now. The fryer goes on at 10am today.';
    return day === 'Sun' ? 'Closed now. Back Tuesday at 10am.' : 'Closed now. Back tomorrow at 10am.';
  }
  var statusLines = document.querySelectorAll('[data-status]');
  var heroStatus = document.querySelector('.hero__status');
  function tick() {
    var text = statusText();
    [].forEach.call(statusLines, function (el) { el.textContent = text; });
    // a dot while the fryer is on, an X while it is off, re-checked with the text every minute
    if (heroStatus) {
      var frying = /^Open now/.test(text);
      heroStatus.classList.toggle('is-open', frying);
      heroStatus.classList.toggle('is-closed', !frying);
    }
  }
  if (statusLines.length) { tick(); setInterval(tick, 60000); }

  // one frame, the contents change: every 3.2s while it is on screen, or on tap.
  // The video only plays while it is the picture showing, the frame is on screen and motion is welcome.
  var stopSlides = function () {};
  var frame = document.querySelector('[data-frame]');
  if (frame) {
    var slides = frame.querySelectorAll('.slide'), cap = frame.querySelector('[data-frame-cap]');
    var video = frame.querySelector('video'), current = 0, timer = null, seen = false;
    var syncVideo = function () {
      if (!video) return;
      if (!still && seen && !document.hidden && slides[current] === video) {
        var playing = video.play();
        if (playing && playing.catch) playing.catch(function () {});
      } else video.pause();
    };
    var show = function (n) {
      slides[current].classList.remove('is-on');
      current = (n + slides.length) % slides.length;
      slides[current].classList.add('is-on');
      cap.textContent = slides[current].getAttribute('data-caption');
      syncVideo();
    };
    var stop = function () { clearInterval(timer); timer = null; };
    var run = function () { stop(); if (!still && seen && !document.hidden) timer = setInterval(function () { show(current + 1); }, 3200); };
    frame.querySelector('.frame__win').addEventListener('click', function () { show(current + 1); run(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else run(); syncVideo(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { seen = entries[0].isIntersecting; if (seen) run(); else stop(); syncVideo(); }).observe(frame);
    }
    stopSlides = function () { stop(); if (video) video.pause(); };
  }

  // the sequences, in GSAP: the hero opens on load, the circles, coupon and footer when they scroll in,
  // everything else as it arrives. Without GSAP or with reduced motion everything simply sits at rest.
  if (window.gsap && !still) {
    var hasScroll = !!window.ScrollTrigger;
    if (hasScroll) gsap.registerPlugin(ScrollTrigger);
    var open = { clipPath: 'circle(50% at 50% 50%)', duration: 1, ease: 'power3.inOut', stagger: 0.12 };
    var shut = { clipPath: 'circle(0% at 50% 50%)' };

    // plays a paused timeline each time `trigger` scrolls in, and rewinds it once fully off screen, so it is
    // ready to play again on the way back. A jump across the whole page fires both callbacks in one step, so
    // replay only plays when the element really is on screen.
    var onScreen = function (el) { var r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight; };
    var playOnReturn = function (trigger, tl, start, beforePlay) {
      var el = document.querySelector(trigger);
      var replay = function () { if (tl.progress() === 0 && onScreen(el)) { if (beforePlay) beforePlay(); tl.play(); } };
      var reset = function () { tl.pause(0); };
      ScrollTrigger.create({ trigger: trigger, start: start, end: 'bottom 15%', onEnter: replay, onEnterBack: replay });
      ScrollTrigger.create({ trigger: trigger, start: 'top bottom', end: 'bottom top', onLeave: reset, onLeaveBack: reset });
    };

    gsap.timeline({ defaults: { ease: 'power3.out' }, onStart: function () { root.classList.remove('motion'); } })
      .from('.hero__copy > *', { autoAlpha: 0, y: 26, duration: 0.8, stagger: 0.08 }, 0)
      .from('.hero__title span', { y: 26, duration: 0.8, stagger: 0.08 }, 0);

    // the circle and its stripes open once they are on screen: at once on a wide screen, where they sit beside
    // the headline, but only when scrolled to on a phone, where they sit below it
    gsap.timeline({ defaults: { ease: 'power3.out' },
      scrollTrigger: hasScroll ? { trigger: '.hero__disc', start: 'top 85%', once: true } : undefined })
      .from('.hero__stripes', { autoAlpha: 0, duration: 0.01 }, 0)
      .from('.hero__stripes span', { scaleX: 0.15, transformOrigin: 'left center', duration: 1, stagger: 0.07 }, 0)
      // clearProps: a transform left behind would outlive a resize into the stacked layout
      .from('.hero__disc', { autoAlpha: 0, rotation: -10, scale: 0.92, duration: 1.6, clearProps: 'transform' }, 0)
      .fromTo('.hero__disc .ring, .hero__disc .core', shut, open, 0)
      .from('.hero__disc .core img', { scale: 1.16, duration: 1.8 }, 0.5);

    if (hasScroll) {
      // the ringed circles further down open, ring by ring, each time they come back
      [['.frame__disc', '.core'], ['.find__rings', '.find__map-win'], ['.panel__rings', '.panel__win']].forEach(function (circle) {
        playOnReturn(circle[0], gsap.timeline({ paused: true }).fromTo(circle[0] + ' .ring, ' + circle[0] + ' ' + circle[1], shut, open), 'top 75%');
      });

      // the catering coupon arrives behind the page's stripes: they sweep across one after another, the coupon
      // appears underneath, and they carry on off the far side. It waits hidden until it scrolls in.
      gsap.set('.coupon', { autoAlpha: 0 });
      playOnReturn('.coupon-wrap', gsap.timeline({ paused: true })
        .set('.coupon-wipe', { autoAlpha: 1 }, 0.01) // after time 0, so a rewound wipe is switched off
        .fromTo('.coupon-wipe span', { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 0.45, ease: 'power2.in', stagger: 0.08, immediateRender: false })
        .set('.coupon', { autoAlpha: 1 })
        .set('.coupon-wipe span', { transformOrigin: 'right center' })
        .to('.coupon-wipe span', { scaleX: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08 })
        .set('.coupon-wipe', { autoAlpha: 0 }), 'top 85%');

      // each heading, paragraph and picture rises in as it reaches the screen, not when its section does; on a
      // phone a section is several screens tall, so this keeps the motion where the reader is looking
      gsap.set('.r1, .r2, .r3', { autoAlpha: 0, y: 24 });
      ScrollTrigger.batch('.r1, .r2, .r3', { start: 'top 92%', once: true,
        onEnter: function (els) { gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, overwrite: true }); } });

      // the band below the menu starts once well into view and is done by the middle of the screen
      gsap.from('.groove span', { scaleX: 0.15, transformOrigin: 'left center', ease: 'none', stagger: 0.08,
        scrollTrigger: { trigger: '.groove', start: 'top 85%', end: 'top 45%', scrub: 0.6 } });

      // the name's bars: only the colour moves. Each starts just tall enough to sit behind its letter, then its
      // top shoots up past its height, drops back below it, and bounces to a stop
      var barsUp = gsap.timeline({ paused: true })
        .fromTo('.blocks span i', { scaleY: function (i, el) { var bar = el.parentNode; return Math.min(1, parseFloat(getComputedStyle(bar).fontSize) * 1.3 / bar.offsetHeight); } },
          { keyframes: [
              { scaleY: 1.2, duration: 0.45, ease: 'power2.out' },
              { scaleY: 0.86, duration: 0.3, ease: 'power2.inOut' },
              { scaleY: 1, duration: 0.65, ease: 'bounce.out' }
            ], stagger: 0.07 });
      // re-measure the starting heights each time, in case the window was resized since
      playOnReturn('.blocks', barsUp, 'top 90%', function () { barsUp.invalidate(); });
    }
  } else root.classList.remove('motion');

  // turning reduced motion on while the page is open settles everything where it would end and stops the rest
  var calm = function () {
    if (!motionPref.matches) return;
    still = true;
    root.classList.remove('motion');
    if (window.ScrollTrigger) {
      // jump every scroll-driven tween to its end before its trigger goes, or it would stay at its hidden start
      ScrollTrigger.getAll().forEach(function (t) { if (t.animation) t.animation.progress(1); t.kill(); });
    }
    if (window.gsap) {
      gsap.globalTimeline.getChildren(true, true, true).forEach(function (t) { t.progress(1).kill(); });
      // anything still waiting to be revealed is shown outright
      gsap.set('.r1, .r2, .r3, .coupon', { autoAlpha: 1, y: 0 });
      gsap.set('.coupon-wipe', { autoAlpha: 0 });
    }
    stopSlides();
  };
  if (motionPref.addEventListener) motionPref.addEventListener('change', calm);
  else if (motionPref.addListener) motionPref.addListener(calm);

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

  // the bar: a dropdown on narrow screens that closes on a link, on Escape, or on a tap outside it
  var toggle = document.querySelector('[data-nav-toggle]'), nav = document.getElementById('nav-list');
  if (toggle && nav) {
    var isOpen = function () { return toggle.getAttribute('aria-expanded') === 'true'; };
    var setNav = function (on) { toggle.setAttribute('aria-expanded', on ? 'true' : 'false'); nav.classList.toggle('is-open', on); };
    toggle.addEventListener('click', function () { setNav(!isOpen()); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
    document.addEventListener('click', function (e) { if (isOpen() && !nav.contains(e.target) && !toggle.contains(e.target)) setNav(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !isOpen()) return;
      var focusWasInside = nav.contains(document.activeElement);
      setNav(false);
      if (focusWasInside) toggle.focus();
    });
  }

  // the bar's link for the section in the middle of the screen is marked as current
  var links = [].slice.call(document.querySelectorAll('.nav__list a'));
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var section = document.querySelector(a.getAttribute('href')); if (section) spy.observe(section); });
  }

  // forms open an email with the visitor's details written in (there is no form backend yet)
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
