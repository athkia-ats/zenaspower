(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var $ = function(s,r){return (r||document).querySelector(s)}, $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var clamp = function(v,a,b){return Math.min(b,Math.max(a,v))};

  /* Header state + scroll progress */
  var header = $('.site-header'), bar = $('.progress');
  function onScroll(){
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('scrolled', y > 20);
    bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
  }
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  /* Mega menus */
  var items = $$('.nav-item'), closeT;
  var desktop = function(){return innerWidth > 1060};
  function setOpen(it, on){ it.classList.toggle('open', on); $('.nav-link', it).setAttribute('aria-expanded', on); }
  function closeAll(except){ items.forEach(function(it){ if(it!==except) setOpen(it,false) }); }
  items.forEach(function(it){
    var btn = $('.nav-link', it);
    it.addEventListener('mouseenter', function(){ if(!desktop()) return; clearTimeout(closeT); closeAll(it); setOpen(it,true); header.classList.add('menu-hover'); });
    it.addEventListener('mouseleave', function(){ if(!desktop()) return; closeT = setTimeout(function(){ setOpen(it,false) }, 160); });
    btn.addEventListener('click', function(){ var on = !it.classList.contains('open'); closeAll(it); setOpen(it,on); });
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ closeAll(); } });
  document.addEventListener('click', function(e){ if(desktop() && !e.target.closest('.nav-item')) closeAll(); });
  var toggle = $('.nav-toggle');
  toggle.addEventListener('click', function(){
    var on = !header.classList.contains('menu-open');
    header.classList.toggle('menu-open', on); toggle.setAttribute('aria-expanded', on); toggle.setAttribute('aria-label', on ? 'Close menu' : 'Open menu');
    document.body.style.overflow = on ? 'hidden' : '';
  });
  $$('.nav a').forEach(function(a){ a.addEventListener('click', function(){ header.classList.remove('menu-open'); toggle.setAttribute('aria-expanded','false'); document.body.style.overflow=''; closeAll(); }); });

  /* Custom cursor */
  if (fine && !reduce) {
    var dot = $('.cursor-dot'), ring = $('.cursor-ring'), label = $('span', ring);
    var mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my, shown = false;
    addEventListener('mousemove', function(e){ mx = e.clientX; my = e.clientY; if(!shown){ document.body.classList.add('has-cursor'); shown = true; rx = mx; ry = my; } dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)'; });
    document.addEventListener('mouseleave', function(){ document.body.classList.remove('has-cursor'); shown = false; });
    addEventListener('mousedown', function(){ ring.classList.add('down') }); addEventListener('mouseup', function(){ ring.classList.remove('down') });
    (function loop(){ rx += (mx - rx) * .18; ry += (my - ry) * .18; ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)' + (ring.classList.contains('down') ? ' scale(.85)' : ''); requestAnimationFrame(loop); })();
    document.addEventListener('mouseover', function(e){
      var lab = e.target.closest('[data-cursor]'), node = e.target.closest('.sld .node'), act = e.target.closest('a,button,[role="tab"]');
      ring.classList.remove('hover','label'); label.textContent = '';
      if (lab) { ring.classList.add('label'); label.textContent = lab.getAttribute('data-cursor'); }
      else if (node) { ring.classList.add('label'); label.textContent = 'Open'; }
      else if (act) { ring.classList.add('hover'); }
    });
    /* Magnetic buttons */
    $$('.mag').forEach(function(b){
      b.addEventListener('mousemove', function(e){ var r = b.getBoundingClientRect(); b.style.setProperty('--mx', ((e.clientX - r.left - r.width/2) * .25) + 'px'); b.style.setProperty('--my', ((e.clientY - r.top - r.height/2) * .35) + 'px'); });
      b.addEventListener('mouseleave', function(){ b.style.setProperty('--mx','0px'); b.style.setProperty('--my','0px'); });
    });
    /* Hero spotlight */
    var hero = $('.hero'), spot = $('.spot');
    if (hero && spot) hero.addEventListener('mousemove', function(e){ var r = hero.getBoundingClientRect(); spot.style.setProperty('--sx', (e.clientX - r.left) + 'px'); spot.style.setProperty('--sy', (e.clientY - r.top) + 'px'); });
  }

  /* Card spotlight */
  $$('.pf').forEach(function(c){ c.addEventListener('mousemove', function(e){ var r = c.getBoundingClientRect(); c.style.setProperty('--x', (e.clientX - r.left) + 'px'); c.style.setProperty('--y', (e.clientY - r.top) + 'px'); }); });

  /* Reveal on scroll */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } }); }, {threshold:.12, rootMargin:'0px 0px -5% 0px'}) : null;
  function watch(el){ io ? io.observe(el) : el.classList.add('in'); }
  $$('.reveal').forEach(function(el){ if(!el.closest('[hidden]')) watch(el); });

  /* Services: animated card deck */
  var tabs = $$('.sv-tab'), grid = $('.sv-grid'), deck = $('#sv-deck'), svInd = $('.sv-ind'), N = tabs.length, cur = 0, cycleT = null, CYCLE = 5000, svcInView = false, hovering = false;
  var panels = tabs.map(function(t){ return document.getElementById(t.getAttribute('aria-controls')) });
  if (tabs.length) {
  panels.forEach(function(p, i){ p.hidden = false; var m = $('.sv-media', p); var big = document.createElement('span'); big.className = 'sv-big'; big.setAttribute('aria-hidden','true'); big.textContent = String(i + 1).padStart(2, '0'); m.appendChild(big); });
  var dots = $('#sv-dots'); tabs.forEach(function(t, i){ var d = document.createElement('button'); d.type = 'button'; d.tabIndex = -1; d.addEventListener('click', function(){ show(i, false, i > cur ? 1 : -1) }); dots.appendChild(d); });
  function moveInd(){ var t = tabs[cur], g = $('.sv-groups'); if (!t || innerWidth <= 760) return; var gr = g.getBoundingClientRect(), r = t.getBoundingClientRect(); svInd.style.height = r.height + 'px'; svInd.style.transform = 'translateY(' + (r.top - gr.top) + 'px)'; }
  function sizeDeck(){ var p = panels[cur]; if (p) deck.style.setProperty('--h', p.offsetHeight + 'px'); }
  function show(i, focus, dir){
    var prev = cur; cur = (i + N) % N; dir = dir || (cur >= prev ? 1 : -1);
    panels.forEach(function(p, k){
      var off = (k - cur + N) % N, pos = off < 3 ? String(off) : 'hide';
      if (k === prev && k !== cur) pos = dir > 0 ? 'out' : 'outr';
      p.dataset.pos = pos; p.setAttribute('aria-hidden', k !== cur); if ('inert' in p) p.inert = k !== cur;
      if (k === cur) { var im = $('img', p); im.style.animation = 'none'; void im.offsetWidth; im.style.animation = ''; }
    });
    if (prev !== cur) setTimeout(function(){ var p = panels[prev]; if (p && p.dataset.pos.indexOf('out') === 0) { var off = (prev - cur + N) % N; p.dataset.pos = off < 3 ? String(off) : 'hide'; } }, 650);
    tabs.forEach(function(t, k){ t.setAttribute('aria-selected', k === cur); t.tabIndex = k === cur ? 0 : -1; });
    Array.prototype.forEach.call(dots.children, function(d, k){ d.classList.toggle('on', k === cur) });
    var c = $('#sv-cur'); c.textContent = String(cur + 1).padStart(2, '0'); c.style.animation = 'none'; void c.offsetWidth; c.style.animation = '';
    if (focus) tabs[cur].focus();
    moveInd(); sizeDeck(); restartCycle();
  }
  function restartCycle(){
    clearTimeout(cycleT); grid.classList.remove('sv-auto'); void svInd.offsetWidth;
    if (reduce || !svcInView || hovering) return;
    grid.classList.add('sv-auto'); grid.style.setProperty('--cycle', CYCLE + 'ms');
    cycleT = setTimeout(function(){ show(cur + 1, false, 1) }, CYCLE);
  }
  function stopAuto(){}
  grid.addEventListener('mouseenter', function(){ if (!fine) return; hovering = true; clearTimeout(cycleT); grid.classList.add('sv-paused'); });
  grid.addEventListener('mouseleave', function(){ hovering = false; grid.classList.remove('sv-paused'); restartCycle(); });
  tabs.forEach(function(t, k){
    t.addEventListener('click', function(){ if (k !== cur) show(k); });
    t.addEventListener('mouseenter', function(){ if (fine && k !== cur) show(k); });
    t.addEventListener('keydown', function(e){
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1, true, 1); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1, true, -1); }
    });
  });
  $('#sv-prev').addEventListener('click', function(){ show(cur - 1, false, -1) });
  $('#sv-next').addEventListener('click', function(){ show(cur + 1, false, 1) });
  /* swipe on touch */
  var sx = null, sy = null;
  deck.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, {passive:true});
  deck.addEventListener('touchend', function(e){ if (sx === null) return; var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(cur + (dx < 0 ? 1 : -1), false, dx < 0 ? 1 : -1); sx = null; }, {passive:true});
  /* 3D tilt + image parallax on the front card */
  if (fine && !reduce) {
    deck.addEventListener('mousemove', function(e){ var p = panels[cur], r = p.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      p.style.setProperty('--ry', (x * 7) + 'deg'); p.style.setProperty('--rx', (-y * 6) + 'deg'); p.style.transition = 'transform .15s ease-out, opacity .55s'; var im = $('img', p); im.style.setProperty('--px', (-x * 14) + 'px'); im.style.setProperty('--py', (-y * 10) + 'px'); });
    deck.addEventListener('mouseleave', function(){ var p = panels[cur]; p.style.setProperty('--ry','0deg'); p.style.setProperty('--rx','0deg'); p.style.transition = ''; var im = $('img', p); im.style.setProperty('--px','0px'); im.style.setProperty('--py','0px'); });
  }
  addEventListener('resize', function(){ moveInd(); sizeDeck(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ moveInd(); sizeDeck(); });
  Array.prototype.forEach.call(deck.querySelectorAll('img'), function(im){ im.addEventListener('load', sizeDeck) });
  if ('IntersectionObserver' in window) new IntersectionObserver(function(es){ svcInView = es[0].isIntersecting; restartCycle(); }, {threshold:.35}).observe($('#services'));
  show(0); setTimeout(function(){ moveInd(); sizeDeck(); }, 300);
  }
  function pickService(slug, scroll){
    if (!tabs.length) return false;
    var k = tabs.findIndex(function(t){ return t.dataset.svc === slug });
    if (k < 0) return; show(k);
    if (scroll) { var target = innerWidth <= 900 ? $('.sv-stage') : $('#services'); target.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'start'}); }
  }
  $$('a[href*="#svc-"]').forEach(function(a){ a.addEventListener('click', function(e){ if (!tabs.length) return; var slug = a.getAttribute('href').split('#svc-')[1]; e.preventDefault(); pickService(slug, true); history.replaceState(null, '', '#svc-' + slug); }); });
  if (tabs.length && /^#svc-/.test(location.hash)) pickService(location.hash.slice(5), true);
  if (tabs.length) restartCycle();

  /* Point of view: words light up with scroll */
  var pov = null;
  if (pov) {
    var words = [];
    (function split(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(n){
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function(part){
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span'); s.className = 'wd' + (node.classList && node.classList.contains('hl') ? ' hl' : ''); s.textContent = part; frag.appendChild(s); words.push(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) { split(n); }
      });
    })(pov);
    $$('.hl', pov).forEach(function(h){ if(h.classList.contains('wd')) return; h.classList.remove('hl'); });
    var lightWords = function(){
      if (reduce) { words.forEach(function(w){ w.classList.add('lit') }); return; }
      var r = pov.getBoundingClientRect(), vh = innerHeight;
      var p = clamp((vh * .85 - r.top) / (r.height + vh * .35), 0, 1);
      var n = Math.round(p * words.length);
      words.forEach(function(w, i){ w.classList.toggle('lit', i < n) });
    };
    addEventListener('scroll', lightWords, {passive:true}); addEventListener('resize', lightWords); lightWords();
    var tone = 0;
    pov.addEventListener('click', function(){
      tone = (tone + 1) % 3; pov.dataset.tone = tone;
      words.forEach(function(w, i){ w.classList.add('lit'); w.style.setProperty('--w', i); w.classList.remove('wave'); void w.offsetWidth; w.classList.add('wave'); });
    });
  }

  /* Process line fills with scroll */
  var stepsEl = $('.steps'), stepEls = $$('.step');
  function fillSteps(){
    if (!stepsEl) return;
    var r = stepsEl.getBoundingClientRect(), vh = innerHeight;
    var p = reduce ? 1 : clamp((vh * .8 - r.top) / Math.max(vh * .55, r.height * .9), 0, 1);
    stepsEl.style.setProperty('--fill', p);
    stepEls.forEach(function(s, i){ s.classList.toggle('on', p >= (i / (stepEls.length - 1)) - .02 && p > 0) });
  }
  addEventListener('scroll', fillSteps, {passive:true}); addEventListener('resize', fillSteps); fillSteps();

  /* Client tabs with sliding indicator */
  var ctabs = $$('.ctab'), ind = $('.ctab-ind');
  function placeInd(){ var on = $('.ctab[aria-selected="true"]'); if (!ind || !on) return; ind.style.left = on.offsetLeft + 'px'; ind.style.width = on.offsetWidth + 'px'; }
  ctabs.forEach(function(t){ t.addEventListener('click', function(){
    ctabs.forEach(function(o){ var on = o === t, pane = document.getElementById(o.getAttribute('aria-controls')); o.setAttribute('aria-selected', on); pane.hidden = !on;
      if (on) $$('.reveal', pane).forEach(function(el){ el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); }); });
    placeInd();
  }); });
  addEventListener('resize', placeInd); placeInd(); setTimeout(placeInd, 400);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeInd);

  /* 10-second tour */
  var film = $('#film');
  if (film) {
  var svg = $('.sld', film), tl = $$('.tl', svg), flows = [$$('.f1', svg), $$('.f2', svg), $$('.f3', svg), $$('.f4', svg)];
  var flowStart = [3.2, 4.8, 5.7, 6.7], shield = $('.shield', svg), loads = $$('.node', svg);
  var chaps = $$('.chap', film), playBtn = $('.play', film), tc = $('.tc', film), capK = $('#cap-k'), capT = $('#cap-t'), tip = $('.film-tip', film);
  var CAPS = [['Generate','Grid, solar and generator supply, sized to your load.'],['Convert','Substations, inverters and changeover panels condition the power.'],['Distribute','One busbar feeds lifts, lighting, CCTV, fire alarm, smart home and automation.'],['Protect','Lightning protection and earthing keep people and equipment safe.']];
  var D = 10, t = 0, playing = !reduce, inView = true, last = null, hold = 0, capIdx = -1;
  var ease = function(x){ return 1 - Math.pow(1 - x, 3) };
  function render(time){
    tl.forEach(function(el){
      var a = +el.dataset.a, d = +el.dataset.d, p = clamp((time - a) / d, 0, 1), k = el.dataset.k, e = ease(p);
      if (k === 'draw') el.style.strokeDashoffset = 1 - e;
      else if (k === 'pop') { el.style.opacity = e; el.style.transform = 'scale(' + (.7 + .3 * e) + ')'; }
      else el.style.opacity = e;
      if (el.classList.contains('node') && !el.classList.contains('earth')) el.classList.toggle('lit', time >= a + d + (el.classList.contains('load') ? .05 : 2));
    });
    flows.forEach(function(group, i){ var on = time >= flowStart[i]; group.forEach(function(f){ f.style.opacity = on ? 1 : 0; f.style.strokeDashoffset = -(time * 38) }); });
    var sp = clamp((time - 8.9) / 1.1, 0, 1); shield.style.opacity = sp > 0 && sp < 1 ? (1 - sp) * .9 : (sp >= 1 ? .25 : 0);
    var ci = time < 2.5 ? 0 : time < 5 ? 1 : time < 7.5 ? 2 : 3;
    chaps.forEach(function(c, i){ var s = i * 2.5; c.style.setProperty('--p', clamp((time - s) / 2.5, 0, 1)); c.classList.toggle('on', i === ci); });
    if (ci !== capIdx) { capIdx = ci; capK.textContent = CAPS[ci][0]; capT.textContent = CAPS[ci][1]; capT.style.animation = 'none'; void capT.offsetWidth; capT.style.animation = ''; }
    tc.textContent = '0:' + String(Math.min(10, Math.floor(time))).padStart(2, '0') + ' / 0:10';
  }
  function setPlaying(on){
    playing = on; film.classList.toggle('paused', !on);
    playBtn.setAttribute('aria-label', on ? 'Pause tour' : 'Play tour'); playBtn.dataset.cursor = on ? 'Pause' : 'Play';
    $('.ic', playBtn).setAttribute('d', on ? 'M4 2h3v12H4zM9 2h3v12H9z' : 'M4 2l10 6-10 6z');
    last = null;
  }
  function frame(now){
    if (last === null) last = now;
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    if (playing && inView) {
      if (t >= D) { hold += dt; if (hold > 1.6) { hold = 0; t = 0; } }
      else t = Math.min(D, t + dt);
      render(t);
    }
    requestAnimationFrame(frame);
  }
  playBtn.addEventListener('click', function(){ if (!playing && t >= D) t = 0; setPlaying(!playing); render(t); });
  chaps.forEach(function(c){ c.addEventListener('click', function(){ t = +c.dataset.t; hold = 0; render(t); if (!reduce) setPlaying(true); }); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function(es){ inView = es[0].isIntersecting; last = null; }, {threshold:.2}).observe(film);
  var stage = $('.film-stage', film);
  function showTip(node){ var r = node.getBoundingClientRect(), s = stage.getBoundingClientRect(); tip.textContent = node.dataset.name + ' →'; tip.style.left = (r.left + r.width/2 - s.left) + 'px'; tip.style.top = (r.top - s.top) + 'px'; tip.classList.add('on'); }
  loads.forEach(function(n){
    n.addEventListener('mouseenter', function(){ showTip(n) }); n.addEventListener('focus', function(){ showTip(n) });
    n.addEventListener('mouseleave', function(){ tip.classList.remove('on') }); n.addEventListener('blur', function(){ tip.classList.remove('on') });
    var go = function(){ pickService(n.dataset.svc, true) };
    n.addEventListener('click', go); n.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
  if (reduce) { t = D; setPlaying(false); }
  render(t); requestAnimationFrame(frame);
  }

  /* Numbers: count up, replay on each view */
  var sts = $$('.st');
  function runStat(st){
    var v = $('.v', st), end = +v.dataset.count, t0 = null, dur = 1900 + (+st.style.getPropertyValue('--i')) * 150;
    st.classList.remove('done'); st.classList.add('go');
    if (reduce) { v.textContent = end; st.classList.add('done'); return; }
    v.textContent = '0';
    requestAnimationFrame(function step(now){
      if (!st.classList.contains('go')) return;
      if (t0 === null) t0 = now;
      var p = clamp((now - t0) / dur, 0, 1);
      v.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(step); else st.classList.add('done');
    });
  }
  if ('IntersectionObserver' in window) {
    var seen = new WeakSet();
    var cio = new IntersectionObserver(function(es){ es.forEach(function(en){
      if (en.isIntersecting) { seen.add(en.target); runStat(en.target); }
      else if (seen.has(en.target)) en.target.classList.remove('go','done');
    }); }, {threshold:.5});
    sts.forEach(function(st){ cio.observe(st) });
  } else sts.forEach(runStat);

  /* Trading card modes */
  var MODES = [['Sourced at the source','We source equipment directly from trusted international manufacturers and check quality before it reaches Bangladesh.'],['Shipped with care','We supply products and materials to buyers outside Bangladesh, with reliable documentation and delivery.'],['Priced for volume','Bulk supply for contractors, dealers, retailers, developers and project procurement, at competitive prices.']];
  var modeBtns = $$('.cs-mode'), csT = $('#cs-t'), csD = $('#cs-d'), mIdx = 0, mTimer = null, mUser = false;
  function setMode(i){ mIdx = i; modeBtns.forEach(function(b,k){ b.setAttribute('aria-pressed', k === i) }); csT.textContent = MODES[i][0]; csD.textContent = MODES[i][1]; csD.style.animation = 'none'; void csD.offsetWidth; csD.style.animation = ''; }
  modeBtns.forEach(function(b,k){ b.addEventListener('click', function(){ mUser = true; clearInterval(mTimer); setMode(k); }); });
  if (!reduce && modeBtns.length) mTimer = setInterval(function(){ if (!mUser) setMode((mIdx + 1) % 3) }, 4200);

  /* Sections pop in as they scroll into view */
  var popTargets = $$('.sec-head, .sv-grid, .steps-wrap, .brand-frame, .ctabs, .st-grid, .pov-text, .pov-foot, .cs, .end, .strip .wrap, .pop');
  popTargets.forEach(function(el){ el.classList.add('popsec'); el.addEventListener('animationend', function(e){ if (e.animationName === 'secPop' && e.target === el) el.classList.remove('popsec','in'); }); });
  if ('IntersectionObserver' in window && !reduce) {
    var pio = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting) { en.target.classList.add('in'); pio.unobserve(en.target); } }); }, {threshold:.15});
    popTargets.forEach(function(el){ pio.observe(el) });
  } else popTargets.forEach(function(el){ el.classList.add('in') });
  /* Touch / click pop on the big cards */
  $$('.cs, .end').forEach(function(c){
    c.addEventListener('pointerdown', function(){ c.classList.remove('bump'); c.classList.add('press'); });
    var up = function(){ if (!c.classList.contains('press')) return; c.classList.remove('press'); void c.offsetWidth; c.classList.add('bump'); };
    c.addEventListener('pointerup', up); c.addEventListener('pointerleave', function(){ c.classList.remove('press') });
    c.addEventListener('animationend', function(e){ if (e.animationName === 'bump') c.classList.remove('bump') });
  });

  /* Mobile tab bar state */
  var tabs2 = $$('.tab[data-tab]'), secs = { top: $('#top'), services: $('#services') };
  function tabState(){
    if (!secs.services || !secs.top) { var pg = document.body.dataset.page || ''; tabs2.forEach(function(t){ t.classList.toggle('on', t.dataset.tab === pg) }); $$('.tab[data-page]').forEach(function(t){ t.classList.toggle('on', t.dataset.page === pg) }); return; }
    var on = (secs.services.getBoundingClientRect().top < innerHeight * .4 && secs.services.getBoundingClientRect().bottom > 120) ? 'services' : 'top';
    tabs2.forEach(function(t){ t.classList.toggle('on', t.dataset.tab === on) });
  }
  addEventListener('scroll', tabState, {passive:true}); tabState();

  /* ===== Quick chat ===== */
  (function(){
    var FORM = 'https://formspree.io/f/mgavbjpl', PHONE = '01753-395353', TEL = 'tel:+8801753395353';
    var SERVICES = ['Solar power systems','Substation solutions','Generator solutions','Solar street lighting','Street lighting','Lightning protection (LPS)','Fire safety systems','CCTV, intercom and networking','Elevators and lifts','Automation systems','Electrical house wiring','Smart home solutions','Equipment supply or wholesale'];
    var FAQ = [
      ['Do you offer a free site survey?', 'Yes. Every project starts with a free consultation and site survey. We visit, take measurements, study your load and then send a clear, itemised quotation.', /survey|visit|free|consult/],
      ['Which areas do you serve?', 'We are based in Chattogram and work on projects across Bangladesh, for government bodies, developers, businesses and homeowners.', /area|where|district|location|dhaka|chattogram|ctg|serve/],
      ['Which brands do you supply?', 'We supply genuine products from leading manufacturers, including Jinko Solar, LONGi, Trina Solar, JA Solar, Huawei, Solis, Growatt, GoodWe and Sungrow.', /brand|jinko|longi|huawei|trina|growatt|panel|inverter|battery/],
      ['Do you do maintenance?', 'Yes. Every system we install comes with support after handover: scheduled maintenance contracts, fast response to breakdowns, and upgrades as your needs grow.', /mainten|repair|service after|breakdown|support|amc/],
      ['Can I buy wholesale?', 'Yes. We offer bulk supply for contractors, dealers, retailers, developers and project procurement at competitive prices, and we also import and export equipment.', /wholesale|bulk|dealer|import|export|price|rate|cost/],
      ['Where is your office?', 'Our office is at Shamshu Mansion (1st Floor), Solokbahar, Panchlaish, Chattogram. You can also call us on ' + PHONE + '.', /office|address|map|find you/]
    ];
    var root = $('#chat'), log = $('#chat-log'), quick = $('#chat-quick'), form = $('#chat-form'), input = $('#chat-text');
    var lead = {}, expect = null, started = false;
    function esc(t){ var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
    function scroll(){ log.scrollTop = log.scrollHeight; }
    function add(html, who){ var m = document.createElement('div'); m.className = 'msg ' + (who || 'bot'); m.innerHTML = html; log.appendChild(m); scroll(); return m; }
    function say(html, then, delay){
      var t = document.createElement('div'); t.className = 'typing'; t.innerHTML = '<i></i><i></i><i></i>'; log.appendChild(t); scroll();
      setTimeout(function(){ t.remove(); add(html); if (then) then(); }, reduce ? 0 : (delay || 650));
    }
    function chips(list){ quick.innerHTML = ''; list.forEach(function(c, i){ var b = document.createElement('button'); b.type = 'button'; b.className = 'qr' + (c.gold ? ' gold' : ''); b.textContent = c.t; b.style.animationDelay = (i * 40) + 'ms'; b.addEventListener('click', function(){ quick.innerHTML = ''; add(esc(c.t), 'me'); c.go(); }); quick.appendChild(b); }); }
    function ask(placeholder, key, type){ expect = key; input.placeholder = placeholder; input.type = type || 'text'; input.focus({preventScroll:true}); }
    function mainMenu(){ expect = null; input.placeholder = 'Type a message…'; chips([{t:'Get a free quote', gold:true, go:startQuote},{t:'Ask a question', go:faqMenu},{t:'Request a callback', go:startCallback},{t:'Call ' + PHONE, go:callNow}]); }
    function welcome(){ say('Hi! 👋 I’m the ZenAS Power assistant.', function(){ say('I can get you a free quote, answer common questions or arrange a callback. What would you like to do?', mainMenu, 500); }, 400); }
    function faqMenu(){ say('Sure, pick a question:', function(){ chips(FAQ.map(function(f){ return {t:f[0], go:function(){ answer(f) }} }).concat([{t:'Back', go:back}])); }); }
    function answer(f){ say(esc(f[1]), function(){ chips([{t:'Get a free quote', gold:true, go:startQuote},{t:'Another question', go:faqMenu},{t:'Request a callback', go:startCallback}]); }, 800); }
    function back(){ say('What would you like to do?', mainMenu, 300); }
    function callNow(){ say('You can call us on <a href="' + TEL + '">' + PHONE + '</a>. If you prefer, leave your number and we’ll call you back.', function(){ chips([{t:'Request a callback', gold:true, go:startCallback},{t:'Back', go:back}]); }); }
    function startQuote(){ lead = {type:'Quote request'}; say('Great. Which service do you need?', function(){ chips(SERVICES.map(function(sv){ return {t:sv, go:function(){ lead.service = sv; workType(); }} })); }); }
    function workType(){ say('Got it, ' + esc(lead.service) + '. What kind of work is it?', function(){ chips(['Supply and installation','Supply only','Maintenance or repair'].map(function(w){ return {t:w, go:function(){ lead.work = w; askLoc(); }} })); }); }
    function askLoc(){ say('Where is the project? (area or district)', function(){ chips([{t:'Chattogram', go:function(){ got('location','Chattogram') }},{t:'Dhaka', go:function(){ got('location','Dhaka') }}]); ask('e.g. Panchlaish, Chattogram', 'location'); }); }
    function askName(){ say('Thanks. What’s your name?', function(){ ask('Your name', 'name'); }); }
    function askPhone(){ say('And the best phone or WhatsApp number to reach you?', function(){ ask('01XXXXXXXXX', 'phone', 'tel'); }); }
    function askDetails(){ say('Anything else we should know? Building type, size, quantities or timeline. You can skip this.', function(){ chips([{t:'Skip', go:function(){ lead.details = ''; review(); }}]); ask('Add details (optional)', 'details'); }); }
    function startCallback(){ lead = {type:'Callback request'}; askName(); }
    function got(key, val){
      expect = null; input.placeholder = 'Type a message…'; input.type = 'text'; quick.innerHTML = '';
      if (key === 'location') { lead.location = val; askName(); }
      else if (key === 'name') { lead.name = val; askPhone(); }
      else if (key === 'phone') {
        var digits = val.replace(/[^\d+]/g, '');
        if (!/^(\+?880|0)?1[3-9]\d{8}$/.test(digits)) { say('That number doesn’t look right. Please enter a Bangladeshi mobile number, like 01712345678.', function(){ ask('01XXXXXXXXX', 'phone', 'tel'); }); return; }
        lead.phone = val; lead.type === 'Quote request' ? askDetails() : review();
      }
      else if (key === 'details') { lead.details = val; review(); }
    }
    function review(){
      var rows = [['Request', lead.type], ['Service', lead.service], ['Work', lead.work], ['Location', lead.location], ['Name', lead.name], ['Phone', lead.phone], ['Details', lead.details]].filter(function(r){ return r[1] });
      say('Here’s what I’ll send to our team:', function(){
        add('<b>' + esc(lead.type) + '</b><dl>' + rows.slice(1).map(function(r){ return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>' }).join('') + '</dl>').classList.add('card');
        chips([{t:'Send', gold:true, go:send},{t:'Start over', go:reset}]);
      });
    }
    function send(){
      var fd = new FormData();
      fd.append('_subject', 'New ' + lead.type.toLowerCase() + ' from the zenaspower.com chat');
      fd.append('source', 'Website quick chat');
      fd.append('request', lead.type); fd.append('name', lead.name || ''); fd.append('phone', lead.phone || '');
      if (lead.service) fd.append('service', lead.service);
      if (lead.work) fd.append('work-type', lead.work);
      if (lead.location) fd.append('location', lead.location);
      if (lead.details) fd.append('message', lead.details);
      var t = document.createElement('div'); t.className = 'typing'; t.innerHTML = '<i></i><i></i><i></i>'; log.appendChild(t); scroll();
      fetch(FORM, {method:'POST', body:fd, headers:{Accept:'application/json'}}).then(function(r){ if (!r.ok) throw 0; t.remove();
        say('✅ Sent! Thank you, ' + esc(lead.name || '') + '. Our team will call you on ' + esc(lead.phone || '') + ' shortly.', function(){ chips([{t:'Ask a question', go:faqMenu},{t:'Done', go:closeChat}]); }, 300);
      }).catch(function(){ t.remove();
        say('Sorry, I couldn’t send that just now. Please call us on <a href="' + TEL + '">' + PHONE + '</a> or use the <a href="contact.html">contact form</a>.', function(){ chips([{t:'Try again', gold:true, go:send},{t:'Back', go:back}]); }, 300);
      });
    }
    function freeText(txt){
      var hit = FAQ.filter(function(f){ return f[2].test(txt.toLowerCase()) })[0];
      if (hit) return answer(hit);
      if (/quote|need|install|price|cost|solar|lift|generator|cctv|fire|wiring|substation/i.test(txt)) return say('I can help with that. Let’s get you a free quote.', startQuote, 500);
      if (/call|phone|talk|person|human|agent/i.test(txt)) return say('Of course. Leave your number and our team will call you.', startCallback, 500);
      say('Thanks for your message. I can get you a quote, answer a question, or have our team call you back.', mainMenu);
    }
    form.addEventListener('submit', function(e){
      e.preventDefault(); var txt = input.value.trim(); if (!txt && expect !== 'details') return;
      input.value = ''; if (txt) add(esc(txt), 'me');
      if (expect) { if (!txt) return; got(expect, txt); } else { quick.innerHTML = ''; freeText(txt); }
    });
    function reset(){ log.innerHTML = ''; quick.innerHTML = ''; lead = {}; expect = null; welcome(); }
    function openChat(){ root.hidden = false; document.body.classList.add('chat-open'); if (!started) { started = true; welcome(); } setTimeout(function(){ if (innerWidth > 760) input.focus({preventScroll:true}); }, 350); }
    function closeChat(){ root.hidden = true; document.body.classList.remove('chat-open'); $('#chat-open').focus({preventScroll:true}); }
    $('#chat-open').addEventListener('click', openChat);
    $$('[data-chat-open]').forEach(function(b){ b.addEventListener('click', openChat) });
    $('#chat-close').addEventListener('click', closeChat);
    $('#chat-reset').addEventListener('click', reset);
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !root.hidden) closeChat(); });
    if (location.hash === '#chat') openChat();
  })();

  /* Typing headings */
  var heads = $$('#hero-h, #pov-t, #svc-h, #proc-h, #br-h, #cl-h, #tr-h, #cta-h, #st-h, .type-h');
  heads.forEach(function(h){
    h.setAttribute('aria-label', (h.innerText || h.textContent).replace(/\s+/g,' ').trim());
    (function walk(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(n){
        if (n.nodeType === 3) {
          var f = document.createDocumentFragment();
          Array.from(n.textContent).forEach(function(c){ var sp = document.createElement('span'); sp.className = 'ch'; sp.textContent = c; f.appendChild(sp); });
          n.parentNode.replaceChild(f, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(h);
    h.classList.add('ah');
  });
  function typeHead(h){
    var chars = Array.prototype.slice.call(h.querySelectorAll('.ch')), caret = document.createElement('span'), i = 0;
    caret.className = 'caret'; caret.setAttribute('aria-hidden','true');
    (function next(){
      if (i >= chars.length) { h.classList.add('done'); return; }
      var c = chars[i++]; c.classList.add('t'); c.parentNode.insertBefore(caret, c.nextSibling);
      caret.classList.toggle('g', !!c.closest('.gold-text'));
      setTimeout(next, c.textContent === ' ' ? 20 : 28 + Math.random() * 40);
    })();
  }
  if ('IntersectionObserver' in window && !reduce) {
    var hio = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting) { typeHead(en.target); hio.unobserve(en.target); } }); }, {threshold:.5});
    heads.forEach(function(h){ hio.observe(h) });
  } else heads.forEach(function(h){ $$('.ch', h).forEach(function(c){ c.classList.add('t') }) });

  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
