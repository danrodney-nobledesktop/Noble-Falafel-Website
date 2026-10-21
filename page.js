(function () {
  var DISHES = {
    pita: { name: 'Classic pita', price: 7, fact: 'Five falafel, fried when you order, so they reach you crackling.',
      layers: [['Pita', '#D9A55B', 1], ['Parsley', '#4F7A2E', .7], ['Tomato & cucumber', '#E8332A', 1], ['Five falafel', '#6B3A1A', 2.2], ['Pickled turnip', '#D9476B', .7], ['Tahini', '#EFE0C0', .9], ['Pita', '#D9A55B', 1]] },
    sabich: { name: 'Sabich pita', price: 8, fact: 'Fried eggplant and egg instead of falafel, with sour mango amba.',
      layers: [['Pita', '#D9A55B', 1], ['Amba', '#E9A21F', .7], ['Chopped salad', '#E8332A', 1], ['Fried eggplant', '#4B2A3A', 1.6], ['Egg', '#F6D25A', .9], ['Tahini', '#EFE0C0', .8], ['Pita', '#D9A55B', 1]] },
    platter: { name: 'Falafel platter', price: 11, fact: 'Six falafel over vermicelli rice, for when lunch needs a fork.',
      layers: [['Salad', '#8DB255', 1], ['Six falafel', '#6B3A1A', 2.2], ['Hummus', '#D9B77E', 1.2], ['Vermicelli rice', '#F4E8D2', 1.6], ['Pita on the side', '#D9A55B', 1]] },
    bowl: { name: 'Hummus bowl', price: 9, fact: 'Warm whole chickpeas on hummus. Gluten-free without the pita.',
      layers: [['Olive oil & sumac', '#C0232B', .6], ['Whole chickpeas', '#E3C27A', 1.2], ['Hummus', '#D9B77E', 2.6], ['Warm pita', '#D9A55B', 1]] },
    fries: { name: 'Fries & dip', price: 5, fact: 'Seasoned fries with garlic sauce or spicy sauce. Gluten-free.',
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

  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // the open dot goes green while the fryer is on
  [].forEach.call(document.querySelectorAll('.hero__status'), function (p) {
    p.classList.toggle('is-open', /^Open now/.test(p.textContent.trim()));
  });

  // the ringed circles open: the hero on load, the frame when it scrolls into view
  var rings = [].slice.call(document.querySelectorAll('[data-open]'));
  function open(el) { el.classList.add('is-open'); }
  rings.forEach(function (el) { if (el.getAttribute('data-open') === 'load') requestAnimationFrame(function () { open(el); }); });
  var later = rings.filter(function (el) { return el.getAttribute('data-open') === 'view'; });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { open(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.3 });
    later.forEach(function (el) { io.observe(el); });
  } else later.forEach(open);

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
    var video = frame.querySelector('video');
    if (still && video) { video.removeAttribute('autoplay'); video.pause(); }
  }

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
