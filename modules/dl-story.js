/*! dl-story kit v1.0.0 | Emerging Group | Digital Leaders 2026
 *
 * Principe : le HTML de l'article est complet et lisible SANS JavaScript.
 * Ce script ne fait que décorer ce HTML :
 *   - ul.dl-bars          -> ajoute les barres (et la ligne de moyenne si data-base)
 *   - ul.dl-stackbar      -> ajoute la barre empilée au-dessus de la liste
 *   - [data-viz="rows"]   -> dessine des barres segmentées à partir du tableau
 *   - section.dl-scrolly  -> construit la scène sticky (une figure.dl-scene par .dl-step)
 *   - [data-viz="map"]    -> dessine la carte du monde à partir des tableaux de données
 * D3 et TopoJSON ne sont chargés que si l'article contient une carte.
 * Fichier de topologie : countries-110m.json, dans data/ (ou data-topo="URL").
 * Chargement : <script type="module" src=".../modules/dl-story.js">. Le module charge
 * lui-même css/dl-story.css, et seulement si la page contient un bloc .dl-story.
 */
(function () {
  'use strict';
  if (window.DLStory) return;

  /* chemins relatifs à CE module (document.currentScript n'existe pas dans un module ES) */
  var CSS_URL = new URL('../css/dl-story.css', import.meta.url).href;
  var TOPO_FILE = new URL('../data/countries-110m.json', import.meta.url).href;
  var D3_URL = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
  var TOPO_URL = 'https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js';
  var mapCount = 0;

  /* ---------- utilitaires ---------- */
  function all(sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function num(v, fallback) { var n = parseFloat(v); return isNaN(n) ? fallback : n; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.async = true; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  var libs;
  function loadLibs() {
    if (window.d3 && window.topojson) return Promise.resolve();
    if (!libs) {
      libs = (window.d3 ? Promise.resolve() : loadScript(D3_URL)).then(function () {
        return window.topojson ? null : loadScript(TOPO_URL);
      });
    }
    return libs;
  }

  /* ---------- tableaux de données : conteneur défilant ---------- */
  function wrapTable(t) {
    if (t.parentNode.classList.contains('dl-tablewrap')) return;
    var w = el('div', 'dl-tablewrap');
    t.parentNode.insertBefore(w, t);
    w.appendChild(t);
  }

  /* ---------- ul.dl-bars ---------- */
  function initBars(ul) {
    if (ul.classList.contains('dl-built')) return;
    var min = num(ul.getAttribute('data-min'), 0);
    var max = num(ul.getAttribute('data-max'), 100);
    var minw = num(ul.getAttribute('data-minw'), 0);
    var span = (max - min) || 1;
    all(':scope > li', ul).forEach(function (li) {
      var valEl = li.querySelector('.dl-val');
      var v = num(li.getAttribute('data-v'), num(valEl && valEl.textContent, 0));
      var w = Math.max(minw, Math.min(100, (v - min) / span * 100));
      var track = el('span', 'dl-track');
      track.setAttribute('aria-hidden', 'true');
      var fill = el('i', 'dl-fill');
      fill.style.setProperty('--w', w.toFixed(1) + '%');
      track.appendChild(fill);
      li.insertBefore(track, valEl);
    });
    var base = ul.getAttribute('data-base');
    if (base !== null) {
      var p = Math.max(0, Math.min(100, (num(base, min) - min) / span * 100));
      var bl = el('span', 'dl-baseline');
      bl.setAttribute('aria-hidden', 'true');
      bl.style.setProperty('--p', p.toFixed(1) + '%');
      bl.appendChild(el('i'));
      var lbl = ul.getAttribute('data-base-label');
      if (lbl) bl.appendChild(el('small', '', lbl));
      ul.appendChild(bl);
    }
    ul.classList.add('dl-built');
  }

  /* ---------- ul.dl-stackbar ---------- */
  function initStack(ul) {
    var prev = ul.previousElementSibling;
    if (prev && prev.classList.contains('dl-stack')) return;
    var bar = el('div', 'dl-stack');
    bar.setAttribute('aria-hidden', 'true');
    all(':scope > li', ul).forEach(function (li) {
      var s = el('span');
      s.setAttribute('data-c', li.getAttribute('data-c') || 'navy');
      s.style.setProperty('--g', String(num(li.getAttribute('data-v'), 0)));
      bar.appendChild(s);
    });
    ul.parentNode.insertBefore(bar, ul);
  }

  /* ---------- [data-viz="rows"] : barres segmentées depuis un tableau ---------- */
  function initRows(box) {
    if (box.querySelector('.dl-ybars')) return;
    var table = box.querySelector('table');
    if (!table) return;
    var heads = all('thead th', table).slice(1);
    var labelMin = num(box.getAttribute('data-label-min'), NaN);
    var rows = el('div', 'dl-ybars');
    rows.setAttribute('aria-hidden', 'true');
    all('tbody tr', table).forEach(function (tr) {
      var row = el('div', 'dl-ybarrow');
      row.appendChild(el('div', 'dl-ylab', tr.querySelector('th').textContent.trim()));
      var bar = el('div', 'dl-ybar');
      all('td', tr).forEach(function (td, i) {
        var th = heads[i];
        var v = num(td.getAttribute('data-v'), num(td.textContent, 0));
        var seg = el('span', 'dl-seg');
        seg.setAttribute('data-c', (th && th.getAttribute('data-c')) || 'soft');
        seg.style.setProperty('--w', v + '%');
        seg.title = (th ? th.textContent.trim() + ': ' : '') + td.textContent.trim();
        if ((th && th.hasAttribute('data-label')) || (!isNaN(labelMin) && v >= labelMin)) {
          seg.textContent = td.textContent.trim();
        }
        bar.appendChild(seg);
      });
      row.appendChild(bar);
      rows.appendChild(row);
    });
    var legend = el('ul', 'dl-legend');
    heads.forEach(function (th) {
      var li = el('li', '', th.textContent.trim());
      li.setAttribute('data-c', th.getAttribute('data-c') || 'soft');
      legend.appendChild(li);
    });
    var anchor = box.querySelector('.dl-data');
    if (anchor && anchor.parentNode !== box) anchor = null;
    box.insertBefore(rows, anchor);
    box.insertBefore(legend, anchor);
  }

  /* ---------- section.dl-scrolly : scène sticky ---------- */
  function initScrolly(sec) {
    if (sec.classList.contains('dl-live')) return;
    if (!('IntersectionObserver' in window)) return; /* reste en lecture linéaire */
    var steps = all(':scope > .dl-step', sec);
    if (!steps.length) return;
    var graphic = el('div', 'dl-graphic');
    var stage = el('div', 'dl-stage');
    var wrap = el('div', 'dl-steps');
    stage.appendChild(el('div', 'dl-dots'));
    steps.forEach(function (step, i) {
      step.setAttribute('data-scene', String(i));
      var fig = step.querySelector(':scope > figure.dl-scene');
      if (fig) { fig.setAttribute('data-scene', String(i)); stage.appendChild(fig); }
      wrap.appendChild(step);
    });
    graphic.appendChild(stage);
    /* ordre du DOM : textes puis scène (lecture logique) ; l'ordre visuel est géré par la grille */
    sec.appendChild(wrap);
    sec.appendChild(graphic);
    sec.classList.add('dl-live');

    var scenes = all('.dl-scene', stage);
    function activate(i) {
      scenes.forEach(function (s) { s.classList.toggle('dl-active', +s.getAttribute('data-scene') === i); });
    }
    activate(0);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) activate(+e.target.getAttribute('data-scene'));
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    steps.forEach(function (s) { io.observe(s); });
  }

  /* ---------- [data-viz="map"] : carte du monde (D3) ---------- */
  function initMap(box) {
    if (box.getAttribute('data-ready')) return;
    box.setAttribute('data-ready', '1');
    var n = ++mapCount;
    var C = {}, REG = {}, ORD = [], nameIndex = {}, regionIndex = {};
    var re = /^(.*?)\s+([\d.]+)\s*×\s*$/;
    function parseTop(td) {
      var m = re.exec(td ? td.textContent.trim() : '');
      return m ? [m[1], parseFloat(m[2])] : null;
    }
    all('table.dl-mapdata tbody tr', box).forEach(function (tr) {
      var cells = tr.children, top = [];
      for (var i = 3; i < 6; i++) { var t = parseTop(cells[i]); if (t) top.push(t); }
      C[tr.getAttribute('data-id')] = {
        name: cells[0].textContent.trim(),
        region: cells[1].textContent.trim(),
        top: top
      };
    });
    all('table.dl-regdata tbody tr', box).forEach(function (tr) {
      var cells = tr.children, top = [], r = cells[0].textContent.trim();
      for (var i = 1; i < 4; i++) { var t = parseTop(cells[i]); if (t) top.push(t); }
      REG[r] = top; ORD.push(r);
    });
    if (!ORD.length) {
      Object.keys(C).forEach(function (id) { if (ORD.indexOf(C[id].region) < 0) ORD.push(C[id].region); });
    }
    Object.keys(C).forEach(function (id) { nameIndex[C[id].name.toLowerCase()] = id; });

    var listId = 'dl-maplist-' + n;
    var ui = el('div', 'dl-mapui');
    ui.innerHTML =
      '<div class="dl-controls">' +
        '<div class="dl-searchbox"><span class="dl-si" aria-hidden="true">⌕</span>' +
        '<input class="dl-mapsearch" list="' + listId + '" placeholder="Search for a country or region…" aria-label="Search for a country or region" autocomplete="off"></div>' +
        '<datalist id="' + listId + '"></datalist>' +
        '<span class="dl-maphint"><b>Interactive map</b> - click a country, filter by region, or search.</span>' +
      '</div>' +
      '<div class="dl-reglegend"></div>' +
      '<div class="dl-mapgrid">' +
        '<div class="dl-mapsvg" role="img" aria-label="' + esc(box.getAttribute('data-label') || 'World map coloured by region; hover a country for its top three job specialisations') + '"></div>' +
        '<aside class="dl-panel"><div class="dl-ph">Hover, tap or search a country to see its top&nbsp;3 specialisations.</div>' +
        '<div class="dl-pc" hidden></div><div class="dl-pr" hidden></div><div class="dl-t3"></div></aside>' +
      '</div>';
    var anchor = box.querySelector('.dl-data');
    if (anchor && anchor.parentNode !== box) anchor = null;
    box.insertBefore(ui, anchor);

    function q(s) { return ui.querySelector(s); }
    var search = q('.dl-mapsearch');
    var panel = { ph: q('.dl-ph'), pc: q('.dl-pc'), pr: q('.dl-pr'), t3: q('.dl-t3') };
    var activeRegion = null, selectedId = null, paths = null;

    function regColor(r) { return 'var(--dl-r-' + slug(r) + ')'; }
    function gloss(lq) { return lq >= 1 ? '+' + Math.round((lq - 1) * 100) + '%' : '−' + Math.round((1 - lq) * 100) + '%'; }
    function renderTop(title, region, top) {
      panel.ph.hidden = true; panel.pc.hidden = false; panel.pr.hidden = false;
      panel.pc.textContent = title;
      panel.pr.innerHTML = '<i style="background:' + regColor(region) + '"></i>' + esc(region);
      var mx = Math.max.apply(null, top.map(function (t) { return t[1]; }).concat([1.9]));
      panel.t3.innerHTML = top.map(function (t) {
        return '<div class="dl-t3row"><div class="dl-tf"><span>' + esc(t[0]) + '</span><span><b>' + t[1].toFixed(2) +
          '×</b><span class="dl-pg">' + gloss(t[1]) + '</span></span></div><div class="dl-t3bar"><i style="width:' +
          Math.min(100, t[1] / mx * 100).toFixed(0) + '%"></i></div></div>';
      }).join('');
    }
    function showRegion(r) { renderTop(r + ' - region', r, REG[r] || []); }
    function clearPanel() {
      panel.ph.hidden = false; panel.pc.hidden = true; panel.pr.hidden = true; panel.t3.innerHTML = '';
    }
    function restorePanel() {
      if (selectedId && C[selectedId]) { var c = C[selectedId]; renderTop(c.name, c.region, c.top); }
      else if (activeRegion) showRegion(activeRegion);
      else clearPanel();
    }
    function applyMap() {
      if (paths) {
        paths.attr('class', function (d) {
          var cls = 'dl-geo';
          if (selectedId) cls += d.id === selectedId ? ' dl-hi' : ' dl-dim';
          else if (activeRegion) { var c = C[d.id]; if (!c || c.region !== activeRegion) cls += ' dl-dim'; }
          return cls;
        });
      }
      all('.dl-rl', ui).forEach(function (e) {
        e.classList.toggle('dl-off', !!activeRegion && e.getAttribute('data-r') !== activeRegion);
      });
    }

    var rl = q('.dl-reglegend');
    ORD.forEach(function (r) {
      regionIndex[r.toLowerCase()] = r;
      var chip = el('div', 'dl-rl');
      chip.setAttribute('data-r', r);
      chip.setAttribute('role', 'button');
      chip.tabIndex = 0;
      chip.innerHTML = '<i style="background:' + regColor(r) + '"></i>' + esc(r);
      function toggle() {
        activeRegion = activeRegion === r ? null : r;
        selectedId = null; search.value = '';
        applyMap(); restorePanel();
      }
      chip.addEventListener('click', toggle);
      chip.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
      rl.appendChild(chip);
    });

    q('#' + listId).innerHTML = ORD.concat(Object.keys(C).map(function (id) { return C[id].name; }).sort())
      .map(function (o) { return '<option value="' + esc(o) + '"></option>'; }).join('');

    search.addEventListener('input', function () {
      var v = search.value.trim().toLowerCase();
      if (!v) { activeRegion = null; selectedId = null; applyMap(); clearPanel(); return; }
      if (regionIndex[v]) { activeRegion = regionIndex[v]; selectedId = null; applyMap(); showRegion(activeRegion); return; }
      if (nameIndex[v]) {
        selectedId = nameIndex[v]; activeRegion = null; applyMap();
        var c = C[selectedId]; renderTop(c.name, c.region, c.top);
      }
    });

    var topoUrl = box.getAttribute('data-topo') || TOPO_FILE;
    loadLibs().then(function () { return window.d3.json(topoUrl); }).then(function (world) {
      var d3 = window.d3, topojson = window.topojson;
      var feats = topojson.feature(world, world.objects.countries).features;
      var W = 900, H = 470;
      var proj = d3.geoNaturalEarth1().fitSize([W, H - 20], { type: 'FeatureCollection', features: feats });
      var path = d3.geoPath(proj);
      var svg = d3.select(q('.dl-mapsvg')).append('svg').attr('viewBox', '0 0 ' + W + ' ' + H);
      paths = svg.append('g').selectAll('path').data(feats).join('path').attr('d', path)
        .style('fill', function (d) { var c = C[d.id]; return c ? regColor(c.region) : 'var(--dl-nodata)'; })
        .attr('class', 'dl-geo')
        .on('mouseenter', function (e, d) {
          var c = C[d.id];
          d3.select(this).classed('dl-hi', true);
          if (c) renderTop(c.name, c.region, c.top);
        })
        .on('mouseleave', function (e, d) {
          d3.select(this).classed('dl-hi', d.id === selectedId);
          restorePanel();
        })
        .on('click', function (e, d) {
          var c = C[d.id];
          if (!c) return;
          selectedId = d.id; activeRegion = null; search.value = c.name;
          applyMap(); renderTop(c.name, c.region, c.top);
        });
      applyMap();
    }).catch(function () {
      q('.dl-mapsvg').innerHTML = '<p class="dl-maperr">The interactive map could not load. The country data is available in the table below.</p>';
    });
  }

  /* ---------- initialisation ---------- */
  function init(root) {
    root = root || document;
    all('.dl-story .dl-data table', root).forEach(wrapTable);
    all('.dl-story ul.dl-bars, .dl-story ol.dl-bars', root).forEach(initBars);
    all('.dl-story ul.dl-stackbar', root).forEach(initStack);
    all('.dl-story [data-viz="rows"]', root).forEach(initRows);
    all('.dl-story .dl-scrolly', root).forEach(initScrolly);
    all('.dl-story [data-viz="map"]', root).forEach(initMap);
  }
  /* ---------- déclencheur : rien ne se charge si la page n'a pas de bloc dl-story ---------- */
  function loadCss() {
    if (document.querySelector('link[data-dl-story-css]')) return;
    var link = el('link');
    link.rel = 'stylesheet';
    link.href = CSS_URL;
    link.setAttribute('data-dl-story-css', '');
    document.head.appendChild(link);
  }
  function start() {
    if (!document.querySelector('.dl-story')) return;
    loadCss();
    init();
  }
  window.DLStory = { init: init, version: '1.0.0' };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
