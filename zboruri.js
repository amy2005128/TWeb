(function () {
  "use strict";

  /* ===== PARSE FLIGHTS ===== */
  const parseFlights = () => {
    const flights = [];
    document.querySelectorAll("h2").forEach(h2 => {
      const dest = h2.textContent.trim();
      let el = h2.nextElementSibling;
      while (el && el.tagName !== "H2") {
        if (el.tagName === "TABLE") {
          el.querySelectorAll("tr").forEach(tr => {
            const tds = tr.querySelectorAll("td");
            if (tds.length >= 5) {
              flights.push({
                tr, dest,
                table: el,
                h2el: h2,
                date:     tds[0].textContent.trim(),
                dep:      tds[1].textContent.trim(),
                arr:      tds[2].textContent.trim(),
                agency:   tds[3].textContent.trim(),
                price:    tds[4].textContent.trim(),
                priceNum: parseFloat(tds[4].textContent.replace(/[^0-9.]/g,"")) || 0,
                depHour:  parseInt((tds[1].textContent.match(/(\d{2}):\d{2}/)||["","0"])[1]) || 0,
              });
            }
          });
        }
        el = el.nextElementSibling;
      }
    });
    return flights;
  };

  /* ===== CSS ===== */
  const injectStyles = () => {
    const s = document.createElement("style");
    s.textContent = `
      #flx-search-widget {
        background:white; border-radius:24px;
        box-shadow:0 8px 40px rgba(0,0,0,.13);
        border:1px solid rgba(15,23,42,.08);
        padding:24px 24px 20px; margin-bottom:32px; font-family:inherit;
      }
      #flx-main-row {
        display:flex; align-items:stretch; background:white;
        border:1.5px solid #e2e8f0; border-radius:16px; overflow:hidden; margin-bottom:14px;
      }
      .flx-field {
        flex:1; display:flex; align-items:center; gap:10px;
        padding:14px 18px; cursor:pointer; transition:background .15s; position:relative;
      }
      .flx-field:not(:last-child) { border-right:1.5px solid #e2e8f0; }
      .flx-field:hover { background:#f8fafc; }
      .flx-field-inner { display:flex; flex-direction:column; gap:2px; min-width:0; }
      .flx-field-label { font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; }
      .flx-field-val { font-size:16px; font-weight:700; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .flx-field-val.placeholder { color:#cbd5e1; font-weight:500; }
      .flx-field select { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; }

      #flx-swap {
        width:36px; height:36px; border-radius:50%; background:white;
        border:1.5px solid #e2e8f0; display:grid; place-items:center; cursor:pointer;
        font-size:16px; flex-shrink:0; align-self:center; margin:0 -2px; z-index:1;
        position:relative; box-shadow:0 2px 8px rgba(0,0,0,.08); transition:all .2s;
      }
      #flx-swap:hover { background:#eff6ff; border-color:#2563eb; transform:rotate(180deg); }

      #flx-secondary-row { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
      .flx-sec-field {
        display:flex; align-items:center; gap:10px; padding:12px 16px;
        border:1.5px solid #e2e8f0; border-radius:14px; background:white;
        cursor:pointer; transition:border-color .15s,background .15s;
        position:relative; flex:1; min-width:140px;
      }
      .flx-sec-field:hover { border-color:#93c5fd; background:#f8fafc; }
      .flx-sec-inner { display:flex; flex-direction:column; gap:2px; }
      .flx-sec-label { font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; }
      .flx-sec-val { font-size:14px; font-weight:700; color:#0f172a; }
      .flx-sec-val.placeholder { color:#cbd5e1; font-weight:500; }

      #flx-search-btn {
        padding:13px 32px; border-radius:14px; border:none;
        background:linear-gradient(135deg,#2563eb,#1d4ed8);
        color:white; font-family:inherit; font-size:15px; font-weight:800;
        cursor:pointer; box-shadow:0 6px 20px rgba(37,99,235,.35);
        transition:all .2s; white-space:nowrap; flex-shrink:0;
        display:flex; align-items:center; gap:8px;
      }
      #flx-search-btn:hover { transform:translateY(-1px); box-shadow:0 10px 28px rgba(37,99,235,.45); }

      #flx-count-bar { display:none; font-size:13px; font-weight:700; color:#64748b; margin-bottom:8px; }
      #flx-count-bar span { color:#2563eb; }

      /* CALENDAR */
      #flx-cal-popup { display:none; position:absolute; top:calc(100% + 8px); left:0; z-index:9999; }
      #flx-cal-popup.open { display:block; }
      #flx-cal-inner {
        background:white; border-radius:20px; box-shadow:0 20px 60px rgba(0,0,0,.18);
        border:1px solid #e2e8f0; padding:20px; width:300px; font-family:inherit; user-select:none;
      }
      #flx-cal-nav { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
      #flx-cal-nav button {
        width:32px; height:32px; border-radius:50%; border:1.5px solid #e2e8f0;
        background:white; font-size:18px; cursor:pointer; display:grid; place-items:center;
        color:#475569; transition:all .15s; font-weight:700;
      }
      #flx-cal-nav button:hover { background:#eff6ff; border-color:#2563eb; color:#2563eb; }
      #flx-cal-title { font-size:15px; font-weight:800; color:#0f172a; }
      #flx-cal-days-hdr { display:grid; grid-template-columns:repeat(7,1fr); margin-bottom:6px; }
      #flx-cal-days-hdr div { text-align:center; font-size:11px; font-weight:800; color:#94a3b8; padding:4px 0; text-transform:uppercase; }
      #flx-cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
      .flx-cal-day {
        aspect-ratio:1; display:flex; align-items:center; justify-content:center;
        border-radius:50%; font-size:13px; font-weight:600; color:#0f172a;
        cursor:pointer; transition:all .15s; flex-direction:column; gap:1px;
      }
      .flx-cal-day:hover:not(.other) { background:#eff6ff; color:#2563eb; }
      .flx-cal-day.other { color:#cbd5e1; cursor:default; pointer-events:none; }
      .flx-cal-day.past { color:#94a3b8; }
      .flx-cal-day.selected { background:linear-gradient(135deg,#2563eb,#1d4ed8); color:white; font-weight:800; box-shadow:0 4px 12px rgba(37,99,235,.35); }
      .flx-dot { width:4px; height:4px; border-radius:50%; background:#2563eb; display:block; }
      .flx-cal-day.selected .flx-dot { background:white; }
      #flx-cal-footer { display:flex; justify-content:space-between; align-items:center; margin-top:14px; padding-top:12px; border-top:1px solid #f1f5f9; }
      #flx-cal-clear { background:none; border:none; font-family:inherit; font-size:12px; font-weight:700; color:#94a3b8; cursor:pointer; padding:0; }
      #flx-cal-clear:hover { color:#ef4444; }
      #flx-cal-close { padding:7px 16px; border-radius:10px; border:none; background:#0f172a; color:white; font-family:inherit; font-size:12px; font-weight:700; cursor:pointer; }
      #flx-cal-close:hover { background:#2563eb; }

      /* PAX */
      #flx-pax-popup {
        display:none; position:absolute; top:calc(100% + 8px); left:0;
        background:white; border-radius:16px; border:1.5px solid #e2e8f0;
        box-shadow:0 16px 48px rgba(0,0,0,.14); z-index:9999;
        padding:16px 20px; min-width:300px; font-family:inherit;
      }
      #flx-pax-popup.open { display:block; }
      .flx-pax-row { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; }
      .flx-pax-label { font-size:14px; font-weight:700; color:#0f172a; }
      .flx-pax-label span { display:block; font-size:11px; font-weight:500; color:#94a3b8; }
      .flx-pax-controls { display:flex; align-items:center; gap:10px; }
      .flx-pax-btn {
        width:32px; height:32px; border-radius:50%; border:1.5px solid #e2e8f0;
        background:white; font-size:18px; font-weight:700; cursor:pointer;
        display:grid; place-items:center; color:#2563eb; transition:all .15s; flex-shrink:0;
      }
      .flx-pax-btn:hover:not(:disabled) { background:#eff6ff; border-color:#2563eb; }
      .flx-pax-btn:disabled { color:#cbd5e1; border-color:#f1f5f9; cursor:default; }
      .flx-pax-num input {
        width:56px; text-align:center; font-size:16px; font-weight:800;
        color:#0f172a; border:1.5px solid #e2e8f0; border-radius:8px;
        padding:4px 0; font-family:inherit; outline:none;
      }
      .flx-pax-num input:focus { border-color:#2563eb; }
      .flx-pax-done {
        width:100%; padding:10px; border-radius:12px; border:none;
        background:linear-gradient(135deg,#2563eb,#1d4ed8); color:white;
        font-family:inherit; font-size:14px; font-weight:700; cursor:pointer; margin-top:4px;
      }

      /* CUSTOM SELECT */
      .flx-custom-select {
        position:relative; padding:13px 14px; border-radius:14px;
        border:1.5px solid #e2e8f0; font-family:inherit; font-size:14px;
        font-weight:600; color:#0f172a; background:white; cursor:pointer;
        display:flex; align-items:center; justify-content:space-between; gap:8px;
        transition:border-color .2s; user-select:none; width:100%; box-sizing:border-box;
      }
      .flx-custom-select:hover,.flx-custom-select.open { border-color:#2563eb; background:#eff6ff; }
      .flx-cs-arrow { font-size:11px; color:#94a3b8; transition:transform .2s; }
      .flx-custom-select.open .flx-cs-arrow { transform:rotate(180deg); }
      .flx-cs-popup {
        display:none; position:absolute; top:calc(100% + 6px); left:0; min-width:100%;
        background:white; border-radius:14px; border:1.5px solid #e2e8f0;
        box-shadow:0 16px 48px rgba(0,0,0,.14); z-index:9999; overflow:hidden; padding:6px;
      }
      .flx-cs-popup.open { display:block; }
      .flx-cs-opt {
        display:flex; align-items:center; gap:10px; padding:10px 12px;
        border-radius:10px; font-size:13px; font-weight:600; color:#0f172a;
        cursor:pointer; transition:background .12s; white-space:nowrap;
      }
      .flx-cs-opt:hover { background:#f1f5f9; }
      .flx-cs-opt.selected { background:#eff6ff; color:#2563eb; }
      .flx-cs-opt em { font-style:normal; font-weight:500; color:#94a3b8; font-size:12px; margin-left:auto; padding-left:8px; }
      .flx-cs-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
      .flx-cs-dot.morning   { background:linear-gradient(135deg,#fbbf24,#f59e0b); }
      .flx-cs-dot.afternoon { background:linear-gradient(135deg,#38bdf8,#0ea5e9); }
      .flx-cs-dot.evening   { background:linear-gradient(135deg,#818cf8,#6366f1); }
      .flx-cs-dot.night     { background:linear-gradient(135deg,#1e293b,#334155); }

      /* ── NAVBAR ORIZONTAL FIX ── */
      #flx-navbar {
        position:fixed; bottom:0; left:0; right:0; z-index:8000;
        height:64px;
        background:rgba(15,23,42,0.96);
        backdrop-filter:blur(16px) saturate(180%);
        -webkit-backdrop-filter:blur(16px) saturate(180%);
        border-top:1px solid rgba(255,255,255,.08);
        box-shadow:0 -8px 32px rgba(0,0,0,.35);
        display:flex; align-items:stretch;
        font-family:inherit;
      }
      /* space compensation so page content is not hidden behind navbar */
      body.has-navbar { padding-bottom:64px; }
      body.has-ticker.has-navbar { padding-top:36px; }

      .flx-nav-item {
        flex:1; display:flex; flex-direction:column;
        align-items:center; justify-content:center; gap:3px;
        cursor:pointer; border:none; background:transparent;
        color:rgba(255,255,255,.55); font-family:inherit;
        font-size:10px; font-weight:800; letter-spacing:.3px;
        text-transform:uppercase; transition:all .2s;
        position:relative; padding:0 4px;
        border-right:1px solid rgba(255,255,255,.05);
      }
      .flx-nav-item:last-child { border-right:none; }
      .flx-nav-item:hover { color:white; background:rgba(255,255,255,.06); }
      .flx-nav-item.active {
        color:#38bdf8;
        background:linear-gradient(180deg,transparent,rgba(37,99,235,.18));
      }
      .flx-nav-item.active::before {
        content:''; position:absolute; top:0; left:50%; transform:translateX(-50%);
        width:40px; height:3px; border-radius:0 0 4px 4px;
        background:linear-gradient(90deg,#2563eb,#38bdf8);
      }
      .flx-nav-icon {
        font-size:20px; line-height:1; transition:transform .2s;
        display:flex; align-items:center; justify-content:center;
      }
      .flx-nav-item:hover .flx-nav-icon { transform:translateY(-2px) scale(1.1); }
      .flx-nav-item.active .flx-nav-icon { transform:translateY(-2px) scale(1.12); }
      .flx-nav-label { font-size:9px; }

      /* badge pe iconuri */
      .flx-nav-badge {
        position:absolute; top:6px; right:calc(50% - 18px);
        min-width:18px; height:18px; border-radius:999px;
        background:linear-gradient(135deg,#ef4444,#dc2626);
        color:white; font-size:10px; font-weight:900;
        display:none; align-items:center; justify-content:center;
        border:2px solid rgba(15,23,42,.96); padding:0 4px; line-height:1;
        animation:flx-badge-in .3s ease;
      }
      .flx-nav-badge.show { display:flex; }

      /* separator decorativ mijloc (buton Cauta central) */
      #flx-nav-search-wrap {
        flex:1.4; position:relative; display:flex;
        align-items:center; justify-content:center;
      }
      #flx-nav-search-btn {
        width:54px; height:54px; border-radius:50%; border:none;
        background:linear-gradient(135deg,#2563eb,#1d4ed8);
        color:white; font-size:24px; cursor:pointer;
        box-shadow:0 0 0 4px rgba(15,23,42,.96), 0 8px 24px rgba(37,99,235,.55);
        display:grid; place-items:center;
        transition:all .25s cubic-bezier(.34,1.56,.64,1);
        margin-bottom:10px;
      }
      #flx-nav-search-btn:hover {
        transform:scale(1.12) translateY(-3px);
        box-shadow:0 0 0 4px rgba(15,23,42,.96), 0 14px 32px rgba(37,99,235,.65);
      }
      #flx-nav-search-label {
        position:absolute; bottom:6px;
        font-size:9px; font-weight:900; color:#38bdf8;
        text-transform:uppercase; letter-spacing:.5px;
      }

      /* ripple on click */
      .flx-nav-item::after {
        content:''; position:absolute; inset:0; border-radius:inherit;
        background:radial-gradient(circle,rgba(255,255,255,.15) 0%,transparent 70%);
        opacity:0; transition:opacity .3s;
      }
      .flx-nav-item:active::after { opacity:1; }

      /* AJAX - extra nav indicator */
      #flx-nav-live-dot {
        position:absolute; top:8px; right:calc(50% - 22px);
        width:8px; height:8px; border-radius:50%;
        background:#4ade80; border:2px solid rgba(15,23,42,.96);
        animation:flx-blink 2s ease-in-out infinite;
      }

      /* ── MINI STATS BAR (deasupra navbar-ului) ── */
      #flx-stats-bar {
        position:fixed; bottom:64px; left:0; right:0; z-index:7999;
        height:28px; display:flex; align-items:center;
        background:rgba(15,23,42,.85);
        backdrop-filter:blur(8px);
        border-top:1px solid rgba(255,255,255,.06);
        padding:0 16px; gap:20px; overflow:hidden;
        font-family:inherit;
        transform:translateY(100%);
        transition:transform .35s cubic-bezier(.4,0,.2,1);
      }
      #flx-stats-bar.visible { transform:translateY(0); }
      body.has-navbar { padding-bottom:64px; }
      .flx-stat-item {
        display:flex; align-items:center; gap:6px;
        font-size:11px; font-weight:700; color:rgba(255,255,255,.6);
        white-space:nowrap;
      }
      .flx-stat-item strong { color:white; }
      .flx-stat-sep { color:rgba(255,255,255,.15); }

      /* PANOU FILTRE */
      #flx-filter-panel {
        position:fixed; top:0; right:-420px; width:400px; height:100vh;
        z-index:9999; box-shadow:-8px 0 40px rgba(0,0,0,.15);
        transition:right .35s cubic-bezier(.4,0,.2,1);
        display:flex; flex-direction:column; font-family:inherit; background:white;
      }
      #flx-filter-panel.open { right:0; }
      #flx-filter-header {
        padding:20px 20px 16px; border-bottom:1px solid #f1f5f9;
        background:linear-gradient(135deg,#2563eb,#1d4ed8);
        display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
      }
      #flx-filter-header h3 { margin:0; font-size:18px; font-family:inherit; color:white; font-weight:900; }
      #flx-filter-close {
        background:rgba(255,255,255,0.2); border:none; font-size:18px; cursor:pointer;
        color:white; width:32px; height:32px; border-radius:50%;
        display:grid; place-items:center; transition:background .2s;
      }
      #flx-filter-close:hover { background:rgba(255,255,255,0.35); }
      #flx-filter-body { flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:16px; }

      /* PANOU FAVORITE */
      #flx-fav-panel {
        position:fixed; top:0; right:-420px; width:400px; height:100vh;
        background:#f8fafc; z-index:9999;
        box-shadow:-8px 0 40px rgba(0,0,0,.15);
        transition:right .35s cubic-bezier(.4,0,.2,1);
        display:flex; flex-direction:column; font-family:inherit;
      }
      #flx-fav-panel.open { right:0; }
      #flx-fav-header {
        padding:20px 20px 16px;
        background:linear-gradient(135deg,#2563eb,#1d4ed8);
        display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
      }
      #flx-fav-header h3 { margin:0; font-size:18px; font-family:inherit; color:white; font-weight:900; }
      #flx-fav-close {
        background:rgba(255,255,255,0.2); border:none; font-size:18px; cursor:pointer;
        color:white; width:32px; height:32px; border-radius:50%;
        display:grid; place-items:center; transition:background .2s;
      }
      #flx-fav-close:hover { background:rgba(255,255,255,0.35); }
      #flx-fav-body { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; }

      /* PANOU URMĂRITE */
      #flx-watch-panel {
        position:fixed; top:0; right:-420px; width:400px; height:100vh;
        background:#fefce8; z-index:9999;
        box-shadow:-8px 0 40px rgba(0,0,0,.15);
        transition:right .35s cubic-bezier(.4,0,.2,1);
        display:flex; flex-direction:column; font-family:inherit;
      }
      #flx-watch-panel.open { right:0; }
      #flx-watch-header {
        padding:20px 20px 16px;
        background:linear-gradient(135deg,#f59e0b,#d97706);
        display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
      }
      #flx-watch-header h3 { margin:0; font-size:18px; font-family:inherit; color:white; font-weight:900; }
      #flx-watch-close {
        background:rgba(255,255,255,0.2); border:none; font-size:18px; cursor:pointer;
        color:white; width:32px; height:32px; border-radius:50%;
        display:grid; place-items:center; transition:background .2s;
      }
      #flx-watch-close:hover { background:rgba(255,255,255,0.35); }
      #flx-watch-body { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; }

      /* PANOU BILETE */
      #flx-ticket-panel {
        position:fixed; top:0; right:-420px; width:400px; height:100vh;
        background:#ecfdf5; z-index:9999;
        box-shadow:-8px 0 40px rgba(0,0,0,.15);
        transition:right .35s cubic-bezier(.4,0,.2,1);
        display:flex; flex-direction:column; font-family:inherit;
      }
      #flx-ticket-panel.open { right:0; }
      #flx-ticket-header {
        padding:20px 20px 16px;
        background:linear-gradient(135deg,#059669,#047857);
        display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
      }
      #flx-ticket-header h3 { margin:0; font-size:18px; font-family:inherit; color:white; font-weight:900; }
      #flx-ticket-close {
        background:rgba(255,255,255,0.2); border:none; font-size:18px; cursor:pointer;
        color:white; width:32px; height:32px; border-radius:50%;
        display:grid; place-items:center; transition:background .2s;
      }
      #flx-ticket-close:hover { background:rgba(255,255,255,0.35); }
      #flx-ticket-body { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; }

      /* ACCORDION */
      .flx-acc-section {
        background:white; border-radius:16px; overflow:hidden;
        border:1px solid #e2e8f0; box-shadow:0 2px 8px rgba(0,0,0,.06);
      }
      .flx-acc-header {
        display:flex; align-items:center; justify-content:space-between;
        padding:14px 16px; cursor:pointer; user-select:none;
        transition:background .15s;
      }
      .flx-acc-header:hover { background:#f8fafc; }
      .flx-acc-header-left { display:flex; align-items:center; gap:10px; }
      .flx-acc-icon { font-size:18px; }
      .flx-acc-title { font-weight:800; font-size:14px; color:#0f172a; }
      .flx-acc-count {
        background:#dbeafe; color:#1d4ed8; font-size:11px; font-weight:900;
        padding:2px 8px; border-radius:999px;
      }
      .flx-acc-arrow { font-size:12px; color:#94a3b8; transition:transform .2s; }
      .flx-acc-section.open .flx-acc-arrow { transform:rotate(180deg); }
      .flx-acc-body { display:none; }
      .flx-acc-section.open .flx-acc-body { display:block; }
      .flx-acc-inner { padding:0 12px 12px; display:flex; flex-direction:column; gap:8px; }
      .flx-acc-empty {
        text-align:center; color:#94a3b8; padding:20px;
        font-size:13px; line-height:1.6;
      }
      .flx-fav-item {
        display:flex; align-items:center; justify-content:space-between; gap:10px;
        padding:10px 12px; border-radius:12px; background:#f8fafc;
        border:1px solid #e2e8f0; transition:background .15s;
      }
      .flx-fav-item:hover { background:#eff6ff; }
      .flx-fav-item-name { font-size:13px; font-weight:800; color:#0f172a; }
      .flx-fav-item-sub { font-size:11px; color:#64748b; margin-top:2px; }
      .flx-fav-remove {
        background:none; border:none; font-size:13px; cursor:pointer;
        color:#94a3b8; padding:2px 4px; border-radius:5px; flex-shrink:0;
        transition:color .15s, background .15s;
      }
      .flx-fav-remove:hover { color:#ef4444; background:#fee2e2; }

      .flx-watch-item {
        background:linear-gradient(135deg,#fefce8,#fef9c3);
        border:1px solid #fde047; border-radius:12px;
        padding:11px 13px; display:flex; align-items:flex-start; justify-content:space-between;
        font-family:inherit; cursor:pointer;
        transition:border-color .15s, transform .15s;
        margin-bottom: 10px;
      }
      .flx-watch-item:hover { border-color:#facc15; transform:translateX(-2px); }
      .flx-watch-item-name { font-weight:800; font-size:13px; color:#713f12; }
      .flx-watch-item-sub { font-size:11px; color:#92400e; font-weight:500; margin-top:2px; }
      .flx-watch-price { font-size:13px; font-weight:900; color:#15803d; white-space:nowrap; margin-left:6px; flex-shrink:0; }
      .flx-watch-remove {
        background:none; border:none; font-size:13px; cursor:pointer;
        color:#d97706; padding:2px 4px; border-radius:5px; flex-shrink:0;
        transition:color .15s, background .15s;
      }
      .flx-watch-remove:hover { color:#ef4444; background:#fee2e2; }

      .flx-ticket-item {
        background:linear-gradient(135deg,#ecfdf5,#d1fae5);
        border:1px solid #6ee7b7; border-radius:14px;
        padding:14px 16px; display:flex; align-items:flex-start; justify-content:space-between;
        font-family:inherit; margin-bottom: 10px;
      }
      .flx-ticket-item-name { font-weight:900; font-size:13px; color:#064e3b; }
      .flx-ticket-item-sub { font-size:11px; color:#065f46; font-weight:500; margin-top:3px; }
      .flx-ticket-nr {
        font-size:11px; font-weight:900; color:#059669;
        background:rgba(5,150,105,0.12); padding:3px 8px;
        border-radius:999px; border:1px solid rgba(5,150,105,0.3);
        white-space:nowrap; margin-top:6px; display:inline-block;
      }
      .flx-ticket-remove {
        background:none; border:none; font-size:13px; cursor:pointer;
        color:#6ee7b7; padding:2px 4px; border-radius:5px; flex-shrink:0;
        transition:color .15s, background .15s;
      }
      .flx-ticket-remove:hover { color:#ef4444; background:#fee2e2; }

      .flx-fav-star, .flx-watch-star {
        background:transparent; border:none; box-shadow:none; outline:none;
        appearance:none; -webkit-appearance:none;
        font-size:19px; cursor:pointer; padding:0 1px; line-height:1;
        transition:transform .2s; flex-shrink:0;
        display:inline-flex; align-items:center; justify-content:center; min-width:22px;
      }
      .flx-fav-star:hover, .flx-watch-star:hover { transform:scale(1.28); }

      /* TOASTS */
      #flx-toasts { position:fixed; bottom:90px; right:24px; z-index:99998; display:flex; flex-direction:column; gap:8px; pointer-events:none; }
      .flx-toast { padding:11px 18px; border-radius:12px; font-size:14px; font-weight:700; color:white; font-family:inherit; box-shadow:0 8px 25px rgba(0,0,0,.15); animation:flxIn .3s ease, flxOut .4s ease 2.3s forwards; }
      .flx-toast-success { background:linear-gradient(135deg,#059669,#047857); }
      .flx-toast-info    { background:linear-gradient(135deg,#2563eb,#1d4ed8); }
      @keyframes flxIn  { from{transform:translateX(120%);opacity:0} to{transform:translateX(0);opacity:1} }
      @keyframes flxOut { to{transform:translateX(120%);opacity:0} }

      /* MODAL PROCURARE BILET */
      #flx-purchase-overlay {
        position:fixed; inset:0; background:rgba(15,23,42,0.6); z-index:99999;
        display:grid; place-items:center; padding:20px;
        animation:flxFadeIn .2s ease;
      }
      #flx-purchase-modal {
        background:white; border-radius:24px; padding:28px 24px; max-width:480px; width:100%;
        box-shadow:0 30px 80px rgba(0,0,0,0.28); font-family:inherit;
        animation:flxSlideUp .25s ease; max-height:90vh; overflow-y:auto;
      }
      @keyframes flxFadeIn { from{opacity:0} to{opacity:1} }
      @keyframes flxSlideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
      #flx-purchase-modal h4 { margin:0 0 4px; font-size:20px; font-weight:900; color:#0f172a; }
      #flx-purchase-modal .flx-pm-sub { font-size:14px; color:#475569; margin-bottom:18px; }
      .flx-pm-card {
        background:#f1f5f9; border-radius:14px; padding:14px 16px; margin-bottom:20px;
        border:1px solid #e2e8f0;
      }
      .flx-pm-dest { font-size:16px; font-weight:900; color:#0f172a; margin-bottom:4px; }
      .flx-pm-info { font-size:13px; color:#64748b; line-height:1.7; }
      .flx-pm-price { font-size:22px; font-weight:900; color:#2563eb; margin-top:8px; }
      .flx-pm-price-total { font-size:18px; font-weight:900; color:#059669; }

      .flx-bagaj-options { display:flex; flex-direction:column; gap:10px; margin-bottom:20px; }
      .flx-bagaj-opt {
        display:flex; align-items:center; gap:14px; padding:14px 16px;
        border:2px solid #e2e8f0; border-radius:14px; cursor:pointer;
        transition:border-color .2s, background .2s; background:white;
      }
      .flx-bagaj-opt:hover { border-color:#93c5fd; background:#f0f9ff; }
      .flx-bagaj-opt.selected { border-color:#2563eb; background:#eff6ff; }
      .flx-bagaj-opt input[type=radio] { accent-color:#2563eb; width:18px; height:18px; flex-shrink:0; }
      .flx-bagaj-opt-info { flex:1; }
      .flx-bagaj-opt-label { font-size:14px; font-weight:800; color:#0f172a; }
      .flx-bagaj-opt-sub { font-size:12px; color:#64748b; margin-top:2px; }
      .flx-bagaj-extra { font-size:13px; font-weight:900; color:#2563eb; white-space:nowrap; }

      .flx-form-group { display:flex; flex-direction:column; gap:4px; margin-bottom:14px; }
      .flx-form-group label { font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; }
      .flx-form-group input, .flx-form-group select {
        padding:11px 14px; border:1.5px solid #e2e8f0; border-radius:12px;
        font-family:inherit; font-size:14px; font-weight:600; color:#0f172a;
        outline:none; transition:border-color .2s; background:white;
      }
      .flx-form-group input:focus, .flx-form-group select:focus { border-color:#2563eb; }
      .flx-form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
      .flx-form-error { font-size:11px; color:#ef4444; font-weight:700; display:none; margin-top:2px; }
      .flx-form-group.error input, .flx-form-group.error select { border-color:#ef4444; }
      .flx-form-group.error .flx-form-error { display:block; }

      .flx-pm-btns { display:flex; gap:10px; margin-top:4px; }
      .flx-pm-ok {
        flex:1; padding:13px; border-radius:14px; border:none;
        background:linear-gradient(135deg,#2563eb,#1d4ed8); color:white;
        font-family:inherit; font-size:15px; font-weight:800; cursor:pointer;
        transition:all .2s; box-shadow:0 6px 20px rgba(37,99,235,.30);
      }
      .flx-pm-ok:hover { transform:translateY(-1px); box-shadow:0 10px 28px rgba(37,99,235,.45); }
      .flx-pm-ok.green {
        background:linear-gradient(135deg,#059669,#047857);
        box-shadow:0 6px 20px rgba(5,150,105,.30);
      }
      .flx-pm-ok.green:hover { box-shadow:0 10px 28px rgba(5,150,105,.45); }
      .flx-pm-cancel {
        padding:13px 20px; border-radius:14px; border:1.5px solid #e2e8f0;
        background:white; font-family:inherit; font-size:15px; font-weight:700;
        cursor:pointer; color:#64748b; transition:all .2s;
      }
      .flx-pm-cancel:hover { border-color:#94a3b8; color:#0f172a; }

      /* SCHEMA AVION */
      .flx-plane-wrap { overflow-x:auto; padding-bottom:8px; }
      .flx-plane-body {
        display:inline-flex; flex-direction:column; gap:0;
        background:linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%);
        border:2px solid #e2e8f0; border-radius:24px; padding:18px 20px 22px;
        min-width:260px; position:relative;
      }
      .flx-plane-nose {
        width:80px; height:36px; background:linear-gradient(135deg,#1d4ed8,#2563eb);
        border-radius:50% 50% 0 0 / 100% 100% 0 0; margin:0 auto 10px; opacity:.85;
      }
      .flx-plane-section-label {
        text-align:center; font-size:10px; font-weight:900; letter-spacing:1px;
        text-transform:uppercase; padding:5px 10px; border-radius:20px; margin:6px 0 4px;
      }
      .flx-plane-section-label.business { background:#fef3c7; color:#92400e; border:1.5px solid #fde68a; }
      .flx-plane-section-label.econom   { background:#eff6ff; color:#1e40af; border:1.5px solid #bfdbfe; }
      .flx-seat-row { display:flex; align-items:center; gap:5px; margin-bottom:5px; }
      .flx-seat-row-num { font-size:11px; font-weight:800; color:#94a3b8; width:18px; text-align:center; flex-shrink:0; }
      .flx-seat-aisle { width:18px; flex-shrink:0; }
      .flx-seat {
        width:32px; height:32px; border-radius:8px 8px 5px 5px; border:2px solid transparent;
        cursor:pointer; display:grid; place-items:center; font-size:10px; font-weight:800;
        transition:all .15s; position:relative; flex-shrink:0;
      }
      .flx-seat.business-free  { background:#fef3c7; border-color:#fbbf24; color:#92400e; }
      .flx-seat.business-free:hover  { background:#fde68a; border-color:#f59e0b; transform:scale(1.12); }
      .flx-seat.econom-free    { background:#dbeafe; border-color:#93c5fd; color:#1e40af; }
      .flx-seat.econom-free:hover    { background:#bfdbfe; border-color:#60a5fa; transform:scale(1.12); }
      .flx-seat.occupied       { background:#f1f5f9; border-color:#e2e8f0; color:#cbd5e1; cursor:not-allowed; }
      .flx-seat.selected       { background:#2563eb !important; border-color:#1d4ed8 !important; color:white !important; transform:scale(1.15) !important; box-shadow:0 4px 12px rgba(37,99,235,.4); }
      .flx-seat-legend { display:flex; gap:12px; justify-content:center; margin-top:14px; flex-wrap:wrap; }
      .flx-seat-legend-item { display:flex; align-items:center; gap:5px; font-size:11px; font-weight:700; color:#64748b; }
      .flx-seat-legend-dot { width:16px; height:16px; border-radius:4px; border:2px solid; }
      .flx-selected-info {
        margin-top:14px; padding:12px 16px; border-radius:12px;
        background:#eff6ff; border:2px solid #93c5fd;
        font-size:13px; font-weight:800; color:#1e40af; text-align:center; display:none;
      }

      .flx-success-icon { font-size:48px; text-align:center; margin-bottom:12px; }
      .flx-success-nr {
        display:inline-block; font-size:20px; font-weight:900; color:#059669;
        background:#ecfdf5; border:2px solid #6ee7b7; border-radius:14px;
        padding:10px 20px; margin:12px 0 16px;
      }
      .flx-success-details {
        background:#f1f5f9; border-radius:12px; padding:14px 16px;
        border:1px solid #e2e8f0; font-size:13px; color:#475569; line-height:1.8;
      }
      .flx-success-details strong { color:#0f172a; font-weight:900; }
    `;
    document.head.appendChild(s);
  };

  /* ===== TOAST ===== */
  let toastWrap;
  const toast = (msg, type = "success") => {
    if (!toastWrap) {
      toastWrap = document.createElement("div");
      toastWrap.id = "flx-toasts";
      document.body.appendChild(toastWrap);
    }
    const el = document.createElement("div");
    el.className = `flx-toast flx-toast-${type}`;
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  };

  /* ===== HELPERS ===== */
  const cleanHref = (v) =>
    (!v || v === "undefined" || v === "null" || v.trim() === "" || v.trim() === "#") ? "" : v.trim();

  const esc = (str) => String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

  const safeRedirect = (href, fallbackMsg) => {
    if (!href || href === "undefined" || href === "null" || href.trim() === "" || href.trim() === "#") {
      toast(fallbackMsg || "Link indisponibil — pagina nu a putut fi găsită.", "info");
      return;
    }
    window.location.href = href;
  };

  const getPageCountry = () => {
    const el = document.querySelector("[data-tara]");
    if (el) return el.dataset.tara.trim();
    const meta = document.querySelector("meta[name='tara']");
    if (meta) return meta.content.trim();
    const h1 = document.querySelector("h1")?.textContent || "";
    return h1
      .replace(/\s*\(.*?\)\s*/g, "")
      .replace(/^zboruri\s+din\s+/i, "")
      .replace(/^zboruri\s+/i, "")
      .trim();
  };

  const IATA_TARA = {
    OTP:"Romania",CLJ:"Romania",TSR:"Romania",IAS:"Romania",SBZ:"Romania",SUJ:"Romania",BAY:"Romania",OMR:"Romania",
    CRL:"Romania",
    BCN:"Spania",MAD:"Spania",VLC:"Spania",AGP:"Spania",PMI:"Spania",SVQ:"Spania",IBZ:"Spania",GRX:"Spania",
    MAH:"Spania",ACE:"Spania",TFN:"Spania",TFS:"Spania",LPA:"Spania",FUE:"Spania",
    BGY:"Italia",FCO:"Italia",MXP:"Italia",VCE:"Italia",NAP:"Italia",CIA:"Italia",BLQ:"Italia",CTA:"Italia",PSA:"Italia",
    LHR:"Marea Britanie",LGW:"Marea Britanie",STN:"Marea Britanie",MAN:"Marea Britanie",BHX:"Marea Britanie",EDI:"Marea Britanie",
    CDG:"Franta",ORY:"Franta",LYS:"Franta",NCE:"Franta",MRS:"Franta",
    AMS:"Olanda",EIN:"Olanda",
    FRA:"Germania",MUC:"Germania",BER:"Germania",HAM:"Germania",DUS:"Germania",STR:"Germania",CGN:"Germania",
    VIE:"Austria",ZRH:"Elvetia",GVA:"Elvetia",BUD:"Ungaria",
    WAW:"Polonia",KRK:"Polonia",WMI:"Polonia",GDN:"Polonia",KTW:"Polonia",
    PRG:"Cehia",BTS:"Slovacia",LJU:"Slovenia",ZAG:"Croatia",SPU:"Croatia",DBV:"Croatia",
    ATH:"Grecia",SKG:"Grecia",HER:"Grecia",RHO:"Grecia",CFU:"Grecia",JMK:"Grecia",
    IST:"Turcia",SAW:"Turcia",AYT:"Turcia",DLM:"Turcia",ESB:"Turcia",
    DXB:"Emirate",AUH:"Emirate",DOH:"Qatar",
    JFK:"SUA",LAX:"SUA",ORD:"SUA",MIA:"SUA",
    TLL:"Estonia",RIX:"Letonia",VNO:"Lituania",
    KBP:"Ucraina",LWO:"Ucraina",
    SOF:"Bulgaria",TGD:"Muntenegru",TIV:"Muntenegru",BEG:"Serbia",SKP:"Macedonia de Nord",
    LCA:"Cipru",PFO:"Cipru",TLV:"Israel",CAI:"Egipt",HRG:"Egipt",SSH:"Egipt",
    KIV:"Moldova",
    CPH:"Danemarca",ARN:"Suedia",OSL:"Norvegia",HEL:"Finlanda",
    LIS:"Portugalia",OPO:"Portugalia",FAO:"Portugalia",
  };

  const extractIATA = (str) => {
    const m = (str || "").match(/\(([A-Z]{3})\)/);
    return m ? m[1] : null;
  };

  const getFlightRoute = (f) => {
    if (f.fromCountry && f.toCountry) return f.fromCountry + " → " + f.toCountry;
    const depIATA = extractIATA(f.dep);
    const fromByDepIATA = depIATA ? IATA_TARA[depIATA] : null;
    const raw = f.pageTitle || "";
    const titleIATA = extractIATA(raw);
    const fromByTitleIATA = titleIATA ? IATA_TARA[titleIATA] : null;
    const fromByTitle = raw
      .replace(/\s*\(.*?\)\s*/g, "")
      .replace(/^zboruri\s+din\s+/i, "")
      .replace(/^zboruri\s+/i, "")
      .replace(/^aeroportul\s+\S+\s*/i, "")
      .replace(/^aeroport\s+/i, "")
      .trim();
    const from = fromByTitleIATA || fromByDepIATA || fromByTitle || "";
    const arrIATA = extractIATA(f.arr);
    const toByArrIATA = arrIATA ? IATA_TARA[arrIATA] : null;
    const to = f.toCountry || toByArrIATA || f.dest || "";
    if (from && to) return from + " → " + to;
    return to || from || "Zbor necunoscut";
  };

  /* ===== STORE-URI (UNIFICATE) ===== */
  const FavStore = {
    get: ()    => JSON.parse(localStorage.getItem("flx_fav_zboruri") || "[]"),
    save: (a)  => localStorage.setItem("flx_fav_zboruri", JSON.stringify(a)),
    add(item)  { const f = this.get(); if (!f.find(x => x.id === item.id)) { f.push(item); this.save(f); return true; } return false; },
    remove(id) { this.save(this.get().filter(x => x.id !== id)); },
    has(id)    { return this.get().some(x => x.id === id); }
  };

  const WatchStore = {
    get: ()    => JSON.parse(localStorage.getItem("flx_watch_zboruri") || "[]"),
    save: (a)  => localStorage.setItem("flx_watch_zboruri", JSON.stringify(a)),
    add(item)  { const w = this.get(); if (!w.find(x => x.id === item.id)) { w.push(item); this.save(w); } },
    remove(id) { this.save(this.get().filter(x => x.id !== id)); },
    has(id)    { return this.get().some(x => x.id === id); }
  };

  const TicketStore = {
    get: ()          => JSON.parse(localStorage.getItem("flx_bilete_procurate") || "[]"),
    save: (a)        => localStorage.setItem("flx_bilete_procurate", JSON.stringify(a)),
    add(item)        { const t = this.get(); t.push(item); this.save(t); },
    remove(nr_bilet) { this.save(this.get().filter(x => x.nr_bilet !== nr_bilet)); }
  };

  const TariStore = {
    get: () => JSON.parse(localStorage.getItem("flx_favorites") || "[]"),
  };

  const AeroportStore = {
    get: () => JSON.parse(localStorage.getItem("flx_fav_aeroport") || "[]"),
  };

  /* ===== STATE ===== */
  let filterPanel, favPanel;
  let flxSelectedHour = "";
  let flxSelectedDate = null;
  let flxCalYear, flxCalMonth;
  let maxPriceGlobal = 0;
  let flightsGlobal  = [];
  let flxPendingHour = "";
  let flxPendingDate = null;

  /* ===== VISIBILITY ===== */
  const hideRow  = tr => tr.style.display = "none";
  const showRow  = tr => tr.style.display = "";
  const isHidden = tr => tr.style.display === "none";

  const syncSections = () => {
    document.querySelectorAll("h2").forEach(h2 => {
      let el = h2.nextElementSibling;
      const tables = [];
      while (el && el.tagName !== "H2") {
        if (el.tagName === "TABLE") tables.push(el);
        el = el.nextElementSibling;
      }
      let sectionVisible = false;
      tables.forEach(tbl => {
        let tblVisible = false;
        tbl.querySelectorAll("tr").forEach(tr => {
          if (tr.querySelector("td") && !isHidden(tr)) tblVisible = true;
        });
        tbl.style.display = tblVisible ? "" : "none";
        if (tblVisible) sectionVisible = true;
      });
      h2.style.display = sectionVisible ? "" : "none";
    });
  };

  /* ===== FILTRARE ===== */
  function applyFilters() {
    const dest     = document.getElementById("flx-fil-dest")?.value || "";
    const agencyTx = (document.getElementById("flx-agency-val")?.textContent || "").trim();
    const agency   = agencyTx === "Toate companiile" ? "" : agencyTx;
    const hour     = flxSelectedHour || "";
    const dateV    = flxSelectedDate || "";
    const maxP     = parseFloat(document.getElementById("flx-fil-price")?.value || maxPriceGlobal);

    let visible = 0;
    flightsGlobal.forEach(f => {
      let show = true;
      if (dest   && f.dest   !== dest)   show = false;
      if (agency && f.agency !== agency) show = false;
      if (f.priceNum > maxP)             show = false;
      if (hour) {
        const h = f.depHour;
        if (hour === "morning"   && !(h >= 6  && h < 12)) show = false;
        if (hour === "afternoon" && !(h >= 12 && h < 18)) show = false;
        if (hour === "evening"   && !(h >= 18))            show = false;
        if (hour === "night"     && !(h >= 0  && h < 6))  show = false;
      }
      if (dateV) {
        const [yr, mo, dy] = dateV.split("-");
        if (f.date !== `${dy}.${mo}.${yr}`) show = false;
      }
      if (show) { showRow(f.tr); visible++; }
      else        hideRow(f.tr);
    });

    syncSections();

    const countBar = document.getElementById("flx-count-bar");
    if (countBar) {
      const hasFilter = dest || agency || hour || dateV ||
        parseFloat(document.getElementById("flx-fil-price")?.value) < maxPriceGlobal;
      countBar.style.display = hasFilter ? "block" : "none";
      if (hasFilter) countBar.innerHTML = `<span>${visible}</span> din ${flightsGlobal.length} zboruri găsite`;
    }
  }

  /* ===== BADGE ===== */
  const updateBadges = () => {
    const favBadge = document.getElementById("flx-fav-badge");
    if (favBadge) {
      const n = TariStore.get().length + AeroportStore.get().length + FavStore.get().length;
      favBadge.textContent = n;
      favBadge.classList.toggle("show", n > 0);
    }
    const watchBadge = document.getElementById("flx-watch-badge");
    if (watchBadge) {
      const nw = WatchStore.get().length;
      watchBadge.textContent = nw;
      watchBadge.classList.toggle("show", nw > 0);
    }
    const ticketBadge = document.getElementById("flx-ticket-badge");
    if (ticketBadge) {
      const nt = TicketStore.get().length;
      ticketBadge.textContent = nt;
      ticketBadge.classList.toggle("show", nt > 0);
      // Live dot pe bilete când există bilete
      const liveDot = document.getElementById("flx-nav-live-dot");
      if (liveDot) liveDot.style.display = nt > 0 ? "block" : "none";
    }
    // Actualizăm stats bar
    updateStatsBar();
  };

  /* ===== WIDGET CĂUTARE ===== */
  const buildWidget = (flights, maxPrice) => {
    const dests   = [...new Set(flights.map(f => f.dest))].sort();
    const h1Text  = document.querySelector("h1")?.textContent || "";
    const airM    = h1Text.match(/\(([A-Z]{3})\)/);
    const airName = h1Text.replace(/\(.*\)/, "").trim();

    const widget = document.createElement("div");
    widget.id = "flx-search-widget";
    widget.innerHTML = `
      <div id="flx-main-row">
        <div class="flx-field">
          <span>🛫</span>
          <div class="flx-field-inner">
            <span class="flx-field-label">De la</span>
            <span class="flx-field-val" id="flx-from-val">${airName}${airM ? ` (${airM[1]})` : ""}</span>
          </div>
        </div>
        <button id="flx-swap">⇄</button>
        <div class="flx-field">
          <span>🛬</span>
          <div class="flx-field-inner">
            <span class="flx-field-label">Spre</span>
            <span class="flx-field-val placeholder" id="flx-to-val">Orice destinație</span>
          </div>
          <select id="flx-fil-dest">
            <option value="">Orice destinație</option>
            ${dests.map(d => `<option value="${d}">${d}</option>`).join("")}
          </select>
        </div>
      </div>
      <div id="flx-secondary-row">
        <div class="flx-sec-field" id="flx-date-trigger" style="cursor:pointer;position:relative;">
          <div class="flx-sec-inner">
            <span class="flx-sec-label">Dată plecare</span>
            <span class="flx-sec-val placeholder" id="flx-date-val">Orice dată</span>
          </div>
          <div id="flx-cal-popup"></div>
        </div>
        <div class="flx-sec-field" id="flx-pax-field" style="cursor:pointer;position:relative;">
          <div class="flx-sec-inner">
            <span class="flx-sec-label">Pasageri</span>
            <span class="flx-sec-val" id="flx-pax-val">1 pasager</span>
          </div>
          <div id="flx-pax-popup"></div>
        </div>
        <button id="flx-search-btn">🔍 Caută zboruri</button>
      </div>
    `;

    const firstH2 = document.querySelector("h2");
    if (firstH2) firstH2.before(widget);
    else document.body.prepend(widget);

    const countBar = document.createElement("div");
    countBar.id = "flx-count-bar";
    widget.after(countBar);
  };

  /* ===== CALENDAR ===== */
  const buildCalendar = (flights) => {
    const today = new Date();
    flxCalYear  = today.getFullYear();
    flxCalMonth = today.getMonth();
    const popup   = document.getElementById("flx-cal-popup");
    const trigger = document.getElementById("flx-date-trigger");

    const flightDates = new Set(flights.map(f => {
      const [d, m, y] = f.date.split(".");
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }));

    const render = () => {
      const MONTHS = ["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"];
      const DAYS   = ["Lu","Ma","Mi","Jo","Vi","Sâ","Du"];
      const firstDay = new Date(flxCalYear, flxCalMonth, 1).getDay();
      const offset   = firstDay === 0 ? 6 : firstDay - 1;
      const daysInM  = new Date(flxCalYear, flxCalMonth + 1, 0).getDate();
      const daysInP  = new Date(flxCalYear, flxCalMonth, 0).getDate();
      const todayMs  = new Date().setHours(0, 0, 0, 0);

      let cells = "";
      for (let i = offset - 1; i >= 0; i--) cells += `<div class="flx-cal-day other">${daysInP - i}</div>`;
      for (let d = 1; d <= daysInM; d++) {
        const dd = String(d).padStart(2, "0"), mm = String(flxCalMonth + 1).padStart(2, "0");
        const ds = `${flxCalYear}-${mm}-${dd}`;
        const isPast = new Date(flxCalYear, flxCalMonth, d) < todayMs;
        const hasFl  = flightDates.has(ds);
        cells += `<div class="flx-cal-day${flxSelectedDate === ds ? " selected" : ""}${hasFl ? " has-flight" : ""}${isPast ? " past" : ""}" data-date="${ds}">${d}${hasFl ? '<span class="flx-dot"></span>' : ""}</div>`;
      }
      for (let d = 1; d <= 42 - offset - daysInM; d++) cells += `<div class="flx-cal-day other">${d}</div>`;

      popup.innerHTML = `
        <div id="flx-cal-inner">
          <div id="flx-cal-nav">
            <button id="flx-cal-prev">‹</button>
            <span id="flx-cal-title">${MONTHS[flxCalMonth]} ${flxCalYear}</span>
            <button id="flx-cal-next">›</button>
          </div>
          <div id="flx-cal-days-hdr">${DAYS.map(d => `<div>${d}</div>`).join("")}</div>
          <div id="flx-cal-grid">${cells}</div>
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid #f1f5f9;">
            <input id="flx-cal-type" type="text" placeholder="Tastează data: ZZ.LL.AAAA"
              style="width:100%;box-sizing:border-box;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-family:inherit;font-size:13px;outline:none;"
              value="${flxSelectedDate ? (() => { const [y,m,d] = flxSelectedDate.split("-"); return `${d}.${m}.${y}`; })() : ""}">
          </div>
          <div id="flx-cal-footer">
            <div style="display:flex;justify-content:space-between;width:100%;">
              <button id="flx-cal-clear">✕ Șterge data</button>
              <button id="flx-cal-close">Închide</button>
            </div>
          </div>
        </div>`;

      document.getElementById("flx-cal-prev").onclick = e => {
        e.stopPropagation();
        flxCalMonth--;
        if (flxCalMonth < 0) { flxCalMonth = 11; flxCalYear--; }
        render();
      };
      document.getElementById("flx-cal-next").onclick = e => {
        e.stopPropagation();
        flxCalMonth++;
        if (flxCalMonth > 11) { flxCalMonth = 0; flxCalYear++; }
        render();
      };
      document.getElementById("flx-cal-clear").onclick = e => {
        e.stopPropagation();
        flxSelectedDate = null; flxPendingDate = null;
        document.getElementById("flx-date-val").textContent = "Orice dată";
        document.getElementById("flx-date-val").classList.add("placeholder");
        popup.classList.remove("open");
        applyFilters();
      };
      document.getElementById("flx-cal-close").onclick = e => { e.stopPropagation(); popup.classList.remove("open"); };

      const typeInp = document.getElementById("flx-cal-type");
      typeInp.addEventListener("click", e => e.stopPropagation());
      typeInp.addEventListener("input", e => {
        e.stopPropagation();
        const val = typeInp.value.trim();
        const m = val.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
        if (m) {
          const [, d, mo, y] = m;
          const ds = `${y}-${mo}-${d}`;
          const dt = new Date(parseInt(y), parseInt(mo) - 1, parseInt(d));
          if (!isNaN(dt.getTime())) {
            flxSelectedDate = ds; flxPendingDate = ds;
            flxCalYear = dt.getFullYear(); flxCalMonth = dt.getMonth();
            document.getElementById("flx-date-val").textContent = `${d}.${mo}.${y}`;
            document.getElementById("flx-date-val").classList.remove("placeholder");
            render();
          }
        }
        typeInp.style.borderColor = val.length === 0 || val.match(/^(\d{2})\.(\d{2})\.(\d{4})$/) ? "#e2e8f0" : "#ef4444";
      });

      popup.querySelectorAll(".flx-cal-day[data-date]").forEach(cell => {
        if (cell.classList.contains("other")) return;
        cell.onclick = e => {
          e.stopPropagation();
          flxSelectedDate = cell.dataset.date;
          flxPendingDate  = flxSelectedDate;
          const [y, m, d] = flxSelectedDate.split("-");
          document.getElementById("flx-date-val").textContent = `${d}.${m}.${y}`;
          document.getElementById("flx-date-val").classList.remove("placeholder");
          popup.classList.remove("open");
          applyFilters();
        };
      });
    };

    trigger.onclick = e => { e.stopPropagation(); popup.classList.toggle("open"); if (popup.classList.contains("open")) render(); };
    document.addEventListener("click", () => popup.classList.remove("open"));
    popup.addEventListener("click", e => e.stopPropagation());
  };

  /* ===== PAX PICKER ===== */
  const buildPaxPicker = () => {
    const trigger = document.getElementById("flx-pax-field");
    const popup   = document.getElementById("flx-pax-popup");
    const valEl   = document.getElementById("flx-pax-val");
    const cats = [
      { key:"adults",  label:"Adulți",      sub:"18+ ani",   min:1 },
      { key:"seniors", label:"Pensionari",  sub:"65+ ani",   min:0 },
      { key:"teens",   label:"Adolescenți", sub:"14–17 ani", min:0 },
      { key:"kids",    label:"Copii",       sub:"0–13 ani",  min:0 },
    ];
    let cnt = { adults:1, seniors:0, teens:0, kids:0 };

    const upLabel = () => {
      const t = Object.values(cnt).reduce((a, b) => a + b, 0);
      valEl.textContent = `${t} pasager${t !== 1 ? "i" : ""}`;
    };
    const renderP = () => {
      popup.innerHTML = cats.map(c => `
        <div class="flx-pax-row">
          <div class="flx-pax-label">${c.label}<span>${c.sub}</span></div>
          <div class="flx-pax-controls">
            <button class="flx-pax-btn" data-a="minus" data-k="${c.key}" ${cnt[c.key] <= c.min ? "disabled" : ""}>−</button>
            <div class="flx-pax-num"><input type="number" data-k="${c.key}" min="${c.min}" max="20" value="${cnt[c.key]}"></div>
            <button class="flx-pax-btn" data-a="plus" data-k="${c.key}" ${cnt[c.key] >= 20 ? "disabled" : ""}>+</button>
          </div>
        </div>`).join("") + `<button class="flx-pax-done" id="flx-pax-done">Confirmă</button>`;

      popup.querySelectorAll(".flx-pax-btn").forEach(b => {
        b.onclick = e => {
          e.stopPropagation();
          const k = b.dataset.k, c = cats.find(x => x.key === k);
          if (b.dataset.a === "minus" && cnt[k] > c.min) cnt[k]--;
          if (b.dataset.a === "plus"  && cnt[k] < 20)    cnt[k]++;
          renderP(); upLabel();
        };
      });
      popup.querySelectorAll("input").forEach(i => {
        i.oninput = e => {
          e.stopPropagation();
          const k = i.dataset.k, c = cats.find(x => x.key === k), v = parseInt(i.value);
          if (!isNaN(v) && v >= c.min && v <= 20) { cnt[k] = v; upLabel(); }
        };
        i.onclick = e => e.stopPropagation();
      });
      document.getElementById("flx-pax-done").onclick = e => { e.stopPropagation(); popup.classList.remove("open"); };
    };
    trigger.onclick = e => { e.stopPropagation(); popup.classList.toggle("open"); if (popup.classList.contains("open")) renderP(); };
    document.addEventListener("click", () => popup.classList.remove("open"));
    popup.addEventListener("click", e => e.stopPropagation());
  };

  /* ===== CUSTOM DROPDOWN ===== */
  const buildDropdown = (triggerId, popupId, valId, labels, onChange) => {
    const trigger = document.getElementById(triggerId);
    const popup   = document.getElementById(popupId);
    const valEl   = document.getElementById(valId);
    if (!trigger || !popup) return;
    trigger.onclick = e => { e.stopPropagation(); popup.classList.toggle("open"); trigger.classList.toggle("open"); };
    document.addEventListener("click", () => { popup.classList.remove("open"); trigger.classList.remove("open"); });
    popup.addEventListener("click", e => e.stopPropagation());
    popup.querySelectorAll(".flx-cs-opt").forEach(opt => {
      opt.onclick = () => {
        const val = opt.dataset.value;
        valEl.textContent = labels[val] !== undefined ? labels[val] : opt.textContent.trim();
        popup.querySelectorAll(".flx-cs-opt").forEach(o => o.classList.toggle("selected", o === opt));
        popup.classList.remove("open"); trigger.classList.remove("open");
        onChange(val);
      };
    });
  };

  /* ===== PANEL FILTRE ===== */
  const buildFilterPanel = (flights, maxPrice) => {
    const agencies = [...new Set(flights.map(f => f.agency))].sort();
    filterPanel = document.createElement("div");
    filterPanel.id = "flx-filter-panel";
    filterPanel.innerHTML = `
      <div id="flx-filter-header">
        <h3>⚙️ Filtre zboruri</h3>
        <button id="flx-filter-close">✕</button>
      </div>
      <div id="flx-filter-body">
        <div class="flx-filter-row">
          <label>🏢 Companie zbor</label>
          <div id="flx-agency-trigger" class="flx-custom-select">
            <span id="flx-agency-val">Toate companiile</span><span class="flx-cs-arrow">▾</span>
            <div id="flx-agency-popup" class="flx-cs-popup">
              <div class="flx-cs-opt selected" data-value="">Toate companiile</div>
              ${agencies.map(a => `<div class="flx-cs-opt" data-value="${a}">${a}</div>`).join("")}
            </div>
          </div>
        </div>
        <div class="flx-filter-row">
          <label>🕐 Ora decolării</label>
          <div id="flx-hour-trigger" class="flx-custom-select">
            <span id="flx-hour-val">Orice oră</span><span class="flx-cs-arrow">▾</span>
            <div id="flx-hour-popup" class="flx-cs-popup">
              <div class="flx-cs-opt selected" data-value="">Orice oră</div>
              <div class="flx-cs-opt" data-value="morning"><span class="flx-cs-dot morning"></span>Dimineață <em>06–12</em></div>
              <div class="flx-cs-opt" data-value="afternoon"><span class="flx-cs-dot afternoon"></span>Amiază <em>12–18</em></div>
              <div class="flx-cs-opt" data-value="evening"><span class="flx-cs-dot evening"></span>Seară <em>18–24</em></div>
              <div class="flx-cs-opt" data-value="night"><span class="flx-cs-dot night"></span>Noapte <em>00–06</em></div>
            </div>
          </div>
        </div>
        <div class="flx-filter-row">
          <label>💶 Preț maxim: <span id="flx-price-val">€${maxPrice}</span></label>
          <div class="flx-price-row">
            <input type="range" id="flx-fil-price" min="0" max="${maxPrice}" value="${maxPrice}" step="10">
          </div>
        </div>
        <button id="flx-reset-link">↺ Resetează filtrele</button>
      </div>
    `;
    document.body.appendChild(filterPanel);

    filterPanel.querySelector("#flx-filter-close").onclick = () => filterPanel.classList.remove("open");

    buildDropdown("flx-agency-trigger", "flx-agency-popup", "flx-agency-val", { "": "Toate companiile" }, () => applyFilters());
    buildDropdown("flx-hour-trigger", "flx-hour-popup", "flx-hour-val",
      { "": "Orice oră", morning: "Dimineață 06–12", afternoon: "Amiază 12–18", evening: "Seară 18–24", night: "Noapte 00–06" },
      val => { flxPendingHour = val; flxSelectedHour = val; applyFilters(); }
    );

    document.getElementById("flx-fil-price").addEventListener("input", function () {
      document.getElementById("flx-price-val").textContent = `€${this.value}`;
      applyFilters();
    });

    document.getElementById("flx-fil-dest").addEventListener("change", function () {
      const tv = document.getElementById("flx-to-val");
      if (this.value) { tv.textContent = this.value; tv.classList.remove("placeholder"); }
      else            { tv.textContent = "Orice destinație"; tv.classList.add("placeholder"); }
      applyFilters();
    });

    document.getElementById("flx-reset-link").onclick = () => {
      flxSelectedHour = ""; flxPendingHour = "";
      flxSelectedDate = null; flxPendingDate = null;
      document.getElementById("flx-hour-val").textContent = "Orice oră";
      document.getElementById("flx-agency-val").textContent = "Toate companiile";
      document.querySelectorAll("#flx-hour-popup .flx-cs-opt").forEach(o => o.classList.toggle("selected", o.dataset.value === ""));
      document.querySelectorAll("#flx-agency-popup .flx-cs-opt").forEach(o => o.classList.toggle("selected", o.dataset.value === ""));
      document.getElementById("flx-fil-price").value = maxPrice;
      document.getElementById("flx-price-val").textContent = `€${maxPrice}`;
      document.getElementById("flx-fil-dest").value = "";
      document.getElementById("flx-to-val").textContent = "Orice destinație";
      document.getElementById("flx-to-val").classList.add("placeholder");
      document.getElementById("flx-date-val").textContent = "Orice dată";
      document.getElementById("flx-date-val").classList.add("placeholder");
      applyFilters();
    };
  };

  /* ===== PANEL FAVORITE ===== */
  const buildFavPanel = () => {
    favPanel = document.createElement("div");
    favPanel.id = "flx-fav-panel";
    favPanel.innerHTML = `
      <div id="flx-fav-header">
        <h3>❤️ Favorite</h3>
        <button id="flx-fav-close">✕</button>
      </div>
      <div id="flx-fav-body"></div>
    `;
    document.body.appendChild(favPanel);
    favPanel.querySelector("#flx-fav-close").onclick = () => favPanel.classList.remove("open");
  };

  /* ===== ACCORDION ===== */
  const buildAccordionSection = (icon, title, key) => {
    const sec = document.createElement("div");
    sec.className = "flx-acc-section";
    sec.innerHTML = `
      <div class="flx-acc-header">
        <div class="flx-acc-header-left">
          <span class="flx-acc-icon">${icon}</span>
          <span class="flx-acc-title">${title}</span>
          <span class="flx-acc-count" id="flx-acc-cnt-${key}">0</span>
        </div>
        <span class="flx-acc-arrow">▼</span>
      </div>
      <div class="flx-acc-body">
        <div class="flx-acc-inner" id="flx-acc-inn-${key}"></div>
      </div>
    `;
    sec.querySelector(".flx-acc-header").addEventListener("click", () => sec.classList.toggle("open"));
    return sec;
  };

  /* ===== RENDER FAVORITE PANEL ===== */
  const renderFavPanel = () => {
    const body = document.getElementById("flx-fav-body");
    if (!body) return;
    body.innerHTML = "";

    // Țări
    const tariSec = buildAccordionSection("🌍", "Țări favorite", "tari");
    body.appendChild(tariSec);
    const tari = TariStore.get();
    tariSec.querySelector("#flx-acc-cnt-tari").textContent = tari.length;
    const tariInner = tariSec.querySelector("#flx-acc-inn-tari");
    if (!tari.length) {
      tariInner.innerHTML = `<div class="flx-acc-empty">🌍<br>Nicio țară salvată.</div>`;
    } else {
      tariInner.innerHTML = tari.map(f => `
        <div class="flx-fav-item" data-href="${cleanHref(f.href)}" style="cursor:pointer;">
          <div class="flx-fav-item-name" style="font-size:13px;">✈ ${f.name} <span style="font-size:10px;padding:2px 7px;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-weight:900;">${f.cod}</span></div>
          <span style="color:#94a3b8;font-size:12px;">→</span>
        </div>`).join("");
      tariInner.querySelectorAll(".flx-fav-item").forEach(item => {
        item.onclick = () => safeRedirect(item.dataset.href, "Pagina acestei țări nu a putut fi găsită.");
      });
    }

    // Aeroporturi
    const aeroSec = buildAccordionSection("🛬", "Aeroporturi favorite", "aero");
    body.appendChild(aeroSec);
    const aero = AeroportStore.get();
    aeroSec.querySelector("#flx-acc-cnt-aero").textContent = aero.length;
    const aeroInner = aeroSec.querySelector("#flx-acc-inn-aero");
    if (!aero.length) {
      aeroInner.innerHTML = `<div class="flx-acc-empty">🛬<br>Niciun aeroport salvat.</div>`;
    } else {
      aeroInner.innerHTML = aero.map(f => `
        <div class="flx-fav-item" data-href="${cleanHref(f.href)}" style="cursor:pointer;">
          <div class="flx-fav-item-name" style="font-size:13px;">✈ ${f.name} <span style="font-size:10px;padding:2px 7px;border-radius:999px;background:rgba(56,189,248,0.18);border:1px solid rgba(56,189,248,0.35);color:#0f172a;font-weight:900;">${f.cod}</span></div>
          <span style="color:#94a3b8;font-size:12px;">→</span>
        </div>`).join("");
      aeroInner.querySelectorAll(".flx-fav-item").forEach(item => {
        item.onclick = () => safeRedirect(item.dataset.href, "Pagina acestui aeroport nu a putut fi găsită.");
      });
    }

    // Zboruri
    const zborSec = buildAccordionSection("🎫", "Zboruri favorite", "zbr");
    body.appendChild(zborSec);
    zborSec.classList.add("open");
    const favs = FavStore.get();
    zborSec.querySelector("#flx-acc-cnt-zbr").textContent = favs.length;
    const zbrInner = zborSec.querySelector("#flx-acc-inn-zbr");
    if (!favs.length) {
      zbrInner.innerHTML = `<div class="flx-acc-empty">🎫<br>Niciun zbor salvat.<br>Apasă ♡ pe un rând.</div>`;
    } else {
      zbrInner.innerHTML = favs.map(f => {
        const route = getFlightRoute(f);
        return `
        <div class="flx-fav-item" data-id="${f.id}" style="cursor:pointer;">
          <div style="flex:1;min-width:0;">
            <div class="flx-fav-item-name">✈ ${route}</div>
            <div class="flx-fav-item-sub">${f.date} · ${f.dep} → ${f.arr}</div>
            <div class="flx-fav-item-sub">${f.agency} · <strong>${f.price}</strong></div>
          </div>
          <button class="flx-fav-remove" data-id="${f.id}" title="Șterge din favorite">✕</button>
        </div>`;
      }).join("");

      zbrInner.querySelectorAll(".flx-fav-item").forEach(item => {
        item.onclick = e => {
          if (e.target.closest(".flx-fav-remove")) return;
          const fid = item.dataset.id;
          const fav = FavStore.get().find(f => f.id === fid);
          if (!fav) return;
          const found = flightsGlobal.find(f => f.id === fid);
          if (found) {
            // Suntem deja pe pagina corectă — highlight direct
            highlightFlightById(fid, "din favorite");
            favPanel.classList.remove("open");
            toast(`Zbor spre ${fav.dest} afișat ✈`, "success");
          } else {
            // Navigăm la pagina aeroportului cu hash-ul salvat + marcăm zborul
            const targetHash = fav.pageHash || "";
            if (!targetHash) { toast("Pagina acestui zbor nu a putut fi găsită.", "info"); return; }
            favPanel.classList.remove("open");
            // Salvăm temporar id-ul de evidențiat în sessionStorage
            sessionStorage.setItem("flx_highlight_id", fid);
            sessionStorage.setItem("flx_highlight_type", "favorit");
            sessionStorage.setItem("flx_highlight_dest", fav.dest || "");
            // Schimbăm hash-ul fără a ieși din index.php
            window.location.href = location.pathname + (location.search || "") + (targetHash.startsWith("#") ? targetHash : "#" + targetHash);
          }
        };
      });
      zbrInner.querySelectorAll(".flx-fav-remove").forEach(btn => {
        btn.onclick = e => {
          e.stopPropagation();
          FavStore.remove(btn.dataset.id);
          const star = document.querySelector(`.flx-fav-star[data-id="${btn.dataset.id}"]`);
          if (star) star.textContent = "♡";
          renderFavPanel();
          updateBadges();
          toast("Eliminat din favorite", "info");
        };
      });
    }
    updateBadges();
  };

  /* ===== PANOURI LATERALE: URMĂRITE ȘI BILETE ===== */
  let watchPanel, ticketPanel;

  const buildWatchPanel = () => {
    watchPanel = document.createElement("div");
    watchPanel.id = "flx-watch-panel";
    watchPanel.innerHTML = `
      <div id="flx-watch-header">
        <h3>⭐ Zboruri urmărite</h3>
        <button id="flx-watch-close">✕</button>
      </div>
      <div id="flx-watch-body"></div>
    `;
    document.body.appendChild(watchPanel);
    watchPanel.querySelector("#flx-watch-close").onclick = () => watchPanel.classList.remove("open");
  };

  const renderWatchPanel = () => {
    const body = document.getElementById("flx-watch-body");
    if (!body) return;
    const watches = WatchStore.get();
    if (!watches.length) {
      body.innerHTML = '<div class="flx-acc-empty">⭐<br>Niciun zbor urmărit.<br>Apasă ☆ pe un rând.</div>';
      return;
    }
    body.innerHTML = watches.map(w => {
      const route = getFlightRoute(w);
      return '<div class="flx-watch-item" data-id="' + w.id + '" data-hash="' + (w.pageHash||"") + '" data-dest="' + esc(w.dest||"") + '">'
        + '<div style="flex:1;min-width:0;cursor:pointer;" class="flx-watch-goto">'
        + '<div class="flx-watch-item-name">🔔 ' + route + '</div>'
        + '<div class="flx-watch-item-sub">' + w.date + ' · ' + w.dep + ' → ' + w.arr + '</div>'
        + '<div class="flx-watch-item-sub">' + w.agency + '</div>'
        + '</div>'
        + '<div style="display:flex;align-items:center;gap:6px;">'
        + '<span class="flx-watch-price">' + w.price + '</span>'
        + '<button class="flx-watch-remove" data-id="' + w.id + '" title="Oprește urmărirea">✕</button>'
        + '</div></div>';
    }).join("");
    // Click pe conținut → navighează la zbor
    body.querySelectorAll(".flx-watch-goto").forEach(el => {
      el.onclick = () => {
        const item = el.closest(".flx-watch-item");
        const wid  = item.dataset.id;
        const whash = item.dataset.hash;
        const wdest = item.dataset.dest;
        const found = flightsGlobal.find(f => f.id === wid);
        if (found) {
          highlightFlightById(wid, "urmărit");
          watchPanel.classList.remove("open");
          toast("Zbor găsit ✈", "success");
        } else {
          if (!whash) { toast("Pagina acestui zbor nu a putut fi găsită.", "info"); return; }
          watchPanel.classList.remove("open");
          sessionStorage.setItem("flx_highlight_id", wid);
          sessionStorage.setItem("flx_highlight_type", "urmărit");
          sessionStorage.setItem("flx_highlight_dest", wdest);
          // Schimbăm hash-ul fără a ieși din index.php
          window.location.href = location.pathname + (location.search || "") + (whash.startsWith("#") ? whash : "#" + whash);
        }
      };
    });
    body.querySelectorAll(".flx-watch-remove").forEach(btn => {
      btn.onclick = e => {
        e.stopPropagation();
        WatchStore.remove(btn.dataset.id);
        const star = document.querySelector('.flx-watch-star[data-id="' + btn.dataset.id + '"]');
        if (star) star.textContent = "☆";
        updateBadges();
        renderWatchPanel();
        toast("Urmărire oprită", "info");
      };
    });
  };

  const buildTicketPanel = () => {
    ticketPanel = document.createElement("div");
    ticketPanel.id = "flx-ticket-panel";
    ticketPanel.innerHTML = `
      <div id="flx-ticket-header">
        <h3>🎫 Bilete procurate</h3>
        <button id="flx-ticket-close">✕</button>
      </div>
      <div id="flx-ticket-body"></div>
    `;
    document.body.appendChild(ticketPanel);
    ticketPanel.querySelector("#flx-ticket-close").onclick = () => ticketPanel.classList.remove("open");
  };

  const renderTicketPanel = () => {
    const body = document.getElementById("flx-ticket-body");
    if (!body) return;
    const tickets = TicketStore.get();
    if (!tickets.length) {
      body.innerHTML = '<div class="flx-acc-empty">🎫<br>Niciun bilet procurat.<br>Apasă pe un zbor pentru a procura.</div>';
      return;
    }
    body.innerHTML = tickets.map(t =>
      '<div class="flx-ticket-item" data-nr="' + t.nr_bilet + '">'
      + '<div style="flex:1;min-width:0;">'
      + '<div class="flx-ticket-item-name">✈ ' + (t.from_city || "") + ' → ' + t.dest + '</div>'
      + '<div class="flx-ticket-item-sub">' + t.date + ' · ' + t.dep + ' → ' + t.arr + '</div>'
      + '<div class="flx-ticket-item-sub">' + t.pasager_prenume + ' ' + t.pasager_nume + ' · ' + t.agency + '</div>'
      + '<div class="flx-ticket-item-sub">🧳 ' + t.bagaj_label + '</div>'
      + '<span class="flx-ticket-nr">Nr. ' + t.nr_bilet + '</span>'
      + '</div>'
      + '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;padding-left:8px;">'
      + '<span style="font-size:13px;font-weight:900;color:#059669;white-space:nowrap;">' + t.total_price + '</span>'
      + '<button class="flx-ticket-remove" data-nr="' + t.nr_bilet + '" title="Șterge bilet">✕</button>'
      + '</div></div>'
    ).join("");
    body.querySelectorAll(".flx-ticket-remove").forEach(btn => {
      btn.onclick = e => {
        e.stopPropagation();
        TicketStore.remove(btn.dataset.nr);
        updateBadges();
        renderTicketPanel();
        toast("Bilet eliminat", "info");
      };
    });
  };

  /* ===== RENDER COMPANIE REVIEWS (rămâne pe pagină) ===== */
  const renderCompanyReviews = async () => {
    const root = document.getElementById("reviews-root");
    if (!root || !flightsGlobal.length) return;

    const companies = [...new Set(
      flightsGlobal
        .map(f => String(f.agency || "").trim())
        .filter(v => v && v !== "")
    )].sort();
    if (!companies.length) {
      root.innerHTML = "";
      return;
    }

    root.innerHTML = `
      <section class="flx-reviews-box">
        <h2>Recenzii companii aeriene</h2>
        <p class="flx-reviews-sub">Vezi și adaugă păreri despre companiile afișate pe această pagină.</p>

        <div class="flx-review-top">
          <div class="flx-review-filter">
            <label for="flx-review-company">Companie</label>
            <select id="flx-review-company">
              ${companies.map(c => `<option value="${c}">${c}</option>`).join("")}
            </select>
          </div>
          <div id="flx-review-avg" class="flx-review-avg">Rating mediu: —</div>
        </div>

        <div id="flx-review-list" class="flx-review-list"></div>

        <form id="flx-review-form" class="flx-review-form">
          <h3>Adaugă recenzie</h3>

          <div class="flx-review-grid">
            <div>
              <label for="flx-r-name">Nume</label>
              <input type="text" id="flx-r-name" required placeholder="Ex. Amelia">
            </div>

            <div class="flx-stars-input" id="flx-r-stars">
              <span data-val="1">☆</span>
              <span data-val="2">☆</span>
              <span data-val="3">☆</span>
              <span data-val="4">☆</span>
              <span data-val="5">☆</span>
            </div>
            <input type="hidden" id="flx-r-rating" value="5">
          </div>

          <div>
            <label for="flx-r-comment">Comentariu</label>
            <textarea id="flx-r-comment" rows="4" required placeholder="Scrie pe scurt experiența ta cu această companie..."></textarea>
          </div>

          <button type="submit" class="flx-review-btn">Trimite recenzia</button>
        </form>
      </section>
    `;

    const starsBox = document.getElementById("flx-r-stars");
    const ratingInput = document.getElementById("flx-r-rating");

    let currentRating = 5;

    const paintStars = (n) => {
      [...starsBox.children].forEach((s, i) => {
        s.textContent = i < n ? "★" : "☆";
      });
    };

    paintStars(currentRating);

    starsBox.addEventListener("click", (e) => {
      if (!e.target.dataset.val) return;
      currentRating = Number(e.target.dataset.val);
      ratingInput.value = currentRating;
      paintStars(currentRating);
    });

    const companySelect = document.getElementById("flx-review-company");
    const list = document.getElementById("flx-review-list");
    const avgBox = document.getElementById("flx-review-avg");
    const form = document.getElementById("flx-review-form");

    const stars = n => "★".repeat(n) + "☆".repeat(5 - n);

    // Recenzii stocate local (fără PHP — nu dă erori)
    const REVIEWS_KEY = "flx_recenzii_v2";
    const getStoredReviews = () => {
      try { return JSON.parse(localStorage.getItem(REVIEWS_KEY) || "[]"); } catch(e) { return []; }
    };
    const saveStoredReviews = (arr) => {
      try { localStorage.setItem(REVIEWS_KEY, JSON.stringify(arr)); } catch(e) {}
    };
    // Încearcă și PHP dacă rulează pe server, altfel fallback la localStorage
    const tryFetchReviews = async (company) => {
      // Mereu luăm recenziile locale
      const allLocal = getStoredReviews();
      const localFiltered = company
        ? allLocal.filter(r => (r.company||"").toLowerCase() === company.toLowerCase())
        : allLocal;

      // Încercăm și PHP, combinăm rezultatele
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 2000);
        const res = await fetch(`php/recenzii.php?company=${encodeURIComponent(company)}`, { signal: ctrl.signal });
        clearTimeout(tid);
        if (!res.ok) throw new Error("no php");
        const data = await res.json();
        if (!data.success) throw new Error("no php");
        const phpReviews = data.reviews || [];
        // Combinăm: PHP + locale (evităm duplicate după id)
        const phpIds = new Set(phpReviews.map(r => r.id));
        const onlyLocal = localFiltered.filter(r => !phpIds.has(r.id));
        const merged = [...phpReviews, ...onlyLocal].sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        );
        return { source: "merged", reviews: merged };
      } catch(e) {
        return { source: "local", reviews: localFiltered.slice().reverse() };
      }
    };

    const loadReviews = async () => {
      const company = companySelect.value;
      list.innerHTML = `<div class="flx-review-empty">Se încarcă recenziile...</div>`;
      const { reviews } = await tryFetchReviews(company);

      if (!reviews.length) {
        avgBox.textContent = "Rating mediu: —";
        list.innerHTML = `<div class="flx-review-empty">Nu există încă recenzii pentru această companie.</div>`;
        return;
      }

      const avg = (reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length).toFixed(1);
      avgBox.textContent = `Rating mediu: ${avg} / 5 (${reviews.length} recenzii)`;

      list.innerHTML = reviews.slice().reverse().map(r => `
        <div class="flx-review-item">
          <div class="flx-review-item-top">
            <strong>${esc(r.name||"")}</strong>
            <span class="flx-review-stars">${stars(Number(r.rating || 0))}</span>
          </div>
          <div class="flx-review-item-company">${esc(r.company||"")}</div>
          <div class="flx-review-item-comment">${esc(r.comment||"")}</div>
          <div class="flx-review-item-date">${new Date(r.created_at).toLocaleString("ro-RO")}</div>
        </div>
      `).join("");
    };

    companySelect.addEventListener("change", loadReviews);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        id: "rev_" + Date.now() + "_" + Math.random().toString(36).slice(2,8),
        company: companySelect.value.trim(),
        name: document.getElementById("flx-r-name").value.trim(),
        rating: Number(document.getElementById("flx-r-rating").value),
        comment: document.getElementById("flx-r-comment").value.trim(),
        created_at: new Date().toISOString()
      };

      if (!payload.company || payload.company === "-") { alert("Selectează o companie."); return; }
      if (!payload.name || !payload.comment) { alert("Completează numele și comentariul."); return; }
      if (payload.rating < 1 || payload.rating > 5) { alert("Selectează un rating."); return; }

      // Încearcă PHP, dacă nu merge salvează local
      let saved = false;
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 2000);
        const res = await fetch("php/recenzii.php", {
          method: "POST", signal: ctrl.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        clearTimeout(tid);
        if (res.ok) { const d = await res.json(); if (d.success) saved = true; }
      } catch(e) {}
      
      if (!saved) {
        const all = getStoredReviews();
        all.push(payload);
        saveStoredReviews(all);
      }

      currentRating = 5;
      paintStars(5);
      document.getElementById("flx-r-rating").value = "5";
      form.reset();
      await loadReviews();
      toast("Recenzia a fost salvată! ⭐", "success");
    });

    await loadReviews();
  };

  /* ===== FLUX PROCURARE BILET (reordonat complet) ===== */
  const showPurchaseFlow = (f) => {
    const genNr = () => Math.floor(1000 + Math.random() * 8999);
    let selectedBagaj = "nk";
    let selectedSeats = []; // array of { label, row, col, cls, extra }
    let passengers    = []; // [{tip, varsta, main, prenume, nume, idnp, datan}]
    let checkinOnline = false;
    const seatExtraSum = () => selectedSeats.reduce((s, x) => s + (x?.extra || 0), 0);
    const seatLabelsStr = () => selectedSeats.length ? selectedSeats.map(s => s.label).join(", ") : "—";
    const seatClassesStr = () => {
      if (!selectedSeats.length) return "—";
      const hasB = selectedSeats.some(s => s.cls === "business");
      const hasE = selectedSeats.some(s => s.cls !== "business");
      return hasB && hasE ? "Business + Economic" : (hasB ? "Business" : "Economic");
    };
    const priceBase = f.priceNum || 0;
    const priceRaw  = String(f.price || "");
    const currency  = priceRaw.replace(/[\d.,\s]/g, "").trim() || "€";
    const fmtP      = (num) => `${currency}${Number.isInteger(num) ? num : num.toFixed(2)}`;

    const BAGAJ_OPTS = [
      { id:"nk",   label:"Doar ghiozdan (bagaj mic de mână)", sub:"~40×20×25 cm — inclus în preț", extra: 0  },
      { id:"mic",  label:"Bagaj mic 9 kg + ghiozdan",         sub:"~55×40×20 cm",                  extra: 25 },
      { id:"mare", label:"Bagaj mare 23 kg + ghiozdan",       sub:"Standard cală avion",            extra: 40 },
    ];
    const CHECKIN_PRICE = 8.99;

    const calcTotal = (nrPax) => {
      const bagExtra = BAGAJ_OPTS.find(o => o.id === selectedBagaj)?.extra || 0;
      const seatExtra = seatExtraSum();
      const checkinExtra = checkinOnline ? CHECKIN_PRICE * nrPax : 0;
      return priceBase * nrPax + bagExtra * nrPax + seatExtra + checkinExtra;
    };

    /* ---- PASUL 0: Info zbor ---- */
    const showStepInfo = () => {
      document.getElementById("flx-purchase-overlay")?.remove();
      const overlay = document.createElement("div");
      overlay.id = "flx-purchase-overlay";
      overlay.innerHTML = `
        <div id="flx-purchase-modal" style="max-width:520px;">
          <h4>✈️ Detalii zbor</h4>
          <p class="flx-pm-sub">Verificați informațiile înainte de rezervare</p>

          <div style="background:linear-gradient(135deg,#1d4ed8,#2563eb);border-radius:18px;padding:22px 24px;color:white;margin-bottom:20px;">
            <div style="font-size:13px;opacity:.8;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">
              ${esc(f.agency||"")}
            </div>
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:14px;">
              <div>
                <div style="font-size:36px;font-weight:900;line-height:1;">${esc(f.dep||"")}</div>
                <div style="font-size:12px;opacity:.75;margin-top:2px;">Decolare</div>
              </div>
              <div style="flex:1;text-align:center;font-size:22px;opacity:.6;">✈ ─────</div>
              <div style="text-align:right;">
                <div style="font-size:36px;font-weight:900;line-height:1;">${esc(f.arr||"")}</div>
                <div style="font-size:12px;opacity:.75;margin-top:2px;">Aterizare</div>
              </div>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <span style="background:rgba(255,255,255,.15);border-radius:8px;padding:5px 12px;font-size:12px;font-weight:700;">📅 ${esc(f.date||"")}</span>
              <span style="background:rgba(255,255,255,.15);border-radius:8px;padding:5px 12px;font-size:12px;font-weight:700;">🛬 ${esc(f.dest||"")}</span>
              <span style="background:rgba(255,255,255,.15);border-radius:8px;padding:5px 12px;font-size:12px;font-weight:700;">🧳 Bagaj de mână inclus</span>
            </div>
          </div>

          <div style="background:#f8fafc;border-radius:12px;padding:14px 16px;margin-bottom:20px;border:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:14px;color:#64748b;font-weight:600;">Preț per persoană:</span>
            <span style="font-size:28px;font-weight:900;color:#0f172a;">${f.price}</span>
          </div>

          <div class="flx-pm-btns">
            <button class="flx-pm-cancel" id="flx-pm-cancel0">Anulează</button>
            <button class="flx-pm-ok" id="flx-pm-next0">Continuă →</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      overlay.querySelector("#flx-pm-cancel0").onclick = () => overlay.remove();
      overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
      overlay.querySelector("#flx-pm-next0").onclick = () => showStepPassengers();
    };

    /* ---- PASUL 1: Nr pasageri + tip ---- */
    const showStepPassengers = () => {
      document.getElementById("flx-purchase-overlay")?.remove();
      const overlay = document.createElement("div");
      overlay.id = "flx-purchase-overlay";

      // Initialize passengers if empty
      if (!passengers.length) passengers = [{ tip: "adult", varsta: "", main: true }];

      const renderPassList = () => {
        return passengers.map((p, i) => `
          <div style="background:#f8fafc;border-radius:12px;padding:14px 16px;border:1px solid #e2e8f0;margin-bottom:8px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
              <strong style="font-size:13px;">${i === 0 ? "👤 Pasager principal" : `👤 Pasager ${i+1}`}</strong>
              ${i > 0 ? `<button class="flx-pax-remove-btn" data-idx="${i}" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:18px;padding:0;">✕</button>` : ""}
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <label style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;cursor:pointer;padding:7px 14px;border:2px solid ${p.tip==='adult'?'#2563eb':'#e2e8f0'};border-radius:10px;background:${p.tip==='adult'?'#eff6ff':'white'};">
                <input type="radio" name="tip_${i}" value="adult" ${p.tip==='adult'?'checked':''} style="accent-color:#2563eb;"> Adult
              </label>
              <label style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;cursor:pointer;padding:7px 14px;border:2px solid ${p.tip==='adolescent'?'#2563eb':'#e2e8f0'};border-radius:10px;background:${p.tip==='adolescent'?'#eff6ff':'white'};">
                <input type="radio" name="tip_${i}" value="adolescent" ${p.tip==='adolescent'?'checked':''} style="accent-color:#2563eb;"> Adolescent
              </label>
              <label style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;cursor:pointer;padding:7px 14px;border:2px solid ${p.tip==='copil'?'#2563eb':'#e2e8f0'};border-radius:10px;background:${p.tip==='copil'?'#eff6ff':'white'};">
                <input type="radio" name="tip_${i}" value="copil" ${p.tip==='copil'?'checked':''} style="accent-color:#2563eb;"> Copil
              </label>
            </div>
            ${(p.tip === 'adolescent' || p.tip === 'copil') ? `
            <div style="margin-top:10px;">
              <label style="font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px;">
                Vârsta (ani)
              </label>
              <input type="number" class="flx-pax-varsta" data-idx="${i}" min="0" max="${p.tip==='adolescent'?'17':'13'}" 
                value="${p.varsta}" placeholder="${p.tip==='adolescent'?'14–17':'0–13'}"
                style="width:120px;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-family:inherit;font-size:14px;font-weight:600;outline:none;">
            </div>` : ""}
          </div>
        `).join("");
      };

      const buildModal = () => {
        const modal = overlay.querySelector("#flx-purchase-modal");
        if (!modal) return;
        modal.innerHTML = `
          <h4>👥 Pasageri</h4>
          <p class="flx-pm-sub">Selectează numărul și tipul pasagerilor</p>
          <div id="flx-pax-list">${renderPassList()}</div>
          <button id="flx-add-pax" style="width:100%;padding:11px;border-radius:12px;border:2px dashed #93c5fd;background:#f0f9ff;color:#2563eb;font-family:inherit;font-size:13px;font-weight:800;cursor:pointer;margin:8px 0 16px;transition:all .2s;">
            + Adaugă pasager
          </button>
          <div style="background:#eff6ff;border-radius:12px;padding:12px 16px;margin-bottom:20px;border:1px solid #bfdbfe;display:flex;justify-content:space-between;">
            <span style="font-size:13px;color:#475569;">Total estimat (${passengers.length} pasager${passengers.length>1?'i':''}):</span>
            <span style="font-size:16px;font-weight:900;color:#059669;">${fmtP(calcTotal(passengers.length))}</span>
          </div>
          <div class="flx-pm-btns">
            <button class="flx-pm-cancel" id="flx-pm-back-pax">← Înapoi</button>
            <button class="flx-pm-ok" id="flx-pm-next-pax">Continuă →</button>
          </div>
        `;

        // Radio listeners
        modal.querySelectorAll("input[type=radio]").forEach(r => {
          r.onchange = () => {
            const idx = parseInt(r.name.split("_")[1]);
            passengers[idx].tip = r.value;
            if (r.value === 'adult') passengers[idx].varsta = "";
            buildModal();
          };
        });
        // Vârstă
        modal.querySelectorAll(".flx-pax-varsta").forEach(inp => {
          inp.oninput = () => { passengers[parseInt(inp.dataset.idx)].varsta = inp.value; };
        });
        // Șterge pasager
        modal.querySelectorAll(".flx-pax-remove-btn").forEach(btn => {
          btn.onclick = () => { passengers.splice(parseInt(btn.dataset.idx), 1); buildModal(); };
        });
        // Adaugă pasager
        modal.querySelector("#flx-add-pax").onclick = () => {
          passengers.push({ tip: "adult", varsta: "", main: false });
          buildModal();
        };

        modal.querySelector("#flx-pm-back-pax").onclick = () => showStepInfo();
        modal.querySelector("#flx-pm-next-pax").onclick = () => {
          // Validare vârste
          for (let p of passengers) {
            if ((p.tip === 'adolescent' || p.tip === 'copil') && !p.varsta) {
              toast("Introduceți vârsta pentru toți copiii/adolescenții.", "info");
              return;
            }
          }
          showStepBagaj();
        };
      };

      overlay.innerHTML = `<div id="flx-purchase-modal" style="max-width:520px;"></div>`;
      document.body.appendChild(overlay);
      overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
      buildModal();
    };

    /* ---- PASUL 2: Alegere bagaj ---- */
    const showStepBagaj = () => {
      document.getElementById("flx-purchase-overlay")?.remove();
      const overlay = document.createElement("div");
      overlay.id = "flx-purchase-overlay";
      const nrPax = passengers.length;

      overlay.innerHTML = `
        <div id="flx-purchase-modal">
          <h4>🧳 Bagaj</h4>
          <p class="flx-pm-sub">Alege opțiunea de bagaj (per pasager):</p>
          <div class="flx-pm-card">
            <div class="flx-pm-dest">${esc(f.dest || "")} · ${esc(f.agency || "")}</div>
            <div class="flx-pm-info">📅 ${esc(f.date)} &nbsp;|&nbsp; 🛫 ${esc(f.dep)} → 🛬 ${esc(f.arr)}</div>
            <div class="flx-pm-price">${f.price} <span style="font-size:14px;color:#64748b;font-weight:600;">× ${nrPax} pasager${nrPax>1?'i':''}</span></div>
          </div>
          <div class="flx-bagaj-options">
            ${BAGAJ_OPTS.map(opt => `
              <label class="flx-bagaj-opt${opt.id === selectedBagaj ? " selected" : ""}">
                <input type="radio" name="flx_bagaj" value="${opt.id}" ${opt.id === selectedBagaj ? "checked" : ""}>
                <div class="flx-bagaj-opt-info">
                  <div class="flx-bagaj-opt-label">${opt.label}</div>
                  <div class="flx-bagaj-opt-sub">${opt.sub}</div>
                </div>
                <span class="flx-bagaj-extra">${opt.extra === 0 ? "Inclus" : "+" + fmtP(opt.extra) + "/pers."}</span>
              </label>`).join("")}
          </div>
          <div style="background:#eff6ff;border-radius:12px;padding:12px 16px;margin-bottom:20px;border:1px solid #bfdbfe;">
            <span style="font-size:13px;color:#475569;">Total estimat: </span>
            <span class="flx-pm-price-total" id="flx-step2-total">${fmtP(calcTotal(nrPax))}</span>
          </div>
          <div class="flx-pm-btns">
            <button class="flx-pm-cancel" id="flx-pm-back2">← Înapoi</button>
            <button class="flx-pm-ok" id="flx-pm-next2">Continuă →</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      const updateTotal = () => {
        const extra = BAGAJ_OPTS.find(o => o.id === selectedBagaj)?.extra || 0;
        const seatEx = seatExtraSum();
        const t = priceBase * nrPax + extra * nrPax + seatEx;
        const totalEl = overlay.querySelector("#flx-step2-total");
        if (totalEl) totalEl.textContent = fmtP(t);
      };

      overlay.querySelectorAll(".flx-bagaj-opt").forEach(label => {
        label.onclick = () => {
          overlay.querySelectorAll(".flx-bagaj-opt").forEach(l => l.classList.remove("selected"));
          label.classList.add("selected");
          const radio = label.querySelector("input");
          radio.checked = true;
          selectedBagaj = radio.value;
          updateTotal();
        };
      });

      overlay.querySelector("#flx-pm-back2").onclick = () => showStepPassengers();
      overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
      overlay.querySelector("#flx-pm-next2").onclick = () => {
        const checked = overlay.querySelector("input[name=flx_bagaj]:checked");
        if (checked) selectedBagaj = checked.value;
        showStepSeat();
      };
    };

    /* ---- PASUL 3: Alegere loc (schema avion) ---- */
    const buildPlane = (flightId) => {
      let seed = 0;
      for (let i = 0; i < (flightId||"").length; i++) seed = (seed * 31 + flightId.charCodeAt(i)) >>> 0;
      const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
      const sections = [
        { name: "Business", cls: "business", rows: [1,2,3], cols: ["A","B","C","D"], extraPerSeat: 80, occupiedChance: 0.30 },
        { name: "Economic", cls: "econom",   rows: [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20], cols: ["A","B","C","D","E","F"], extraPerSeat: 0, occupiedChance: 0.55 },
      ];
      const occupied = new Set();
      sections.forEach(sec => {
        sec.rows.forEach(r => {
          sec.cols.forEach(c => {
            if (rnd() < sec.occupiedChance) occupied.add(`${r}${c}`);
          });
        });
      });
      return { sections, occupied };
    };

    const showStepSeat = () => {
      document.getElementById("flx-purchase-overlay")?.remove();
      const overlay = document.createElement("div");
      overlay.id = "flx-purchase-overlay";

      const { sections, occupied } = buildPlane(f.id || f.date);
      const nrPax = passengers.length;
      const bagExtra = BAGAJ_OPTS.find(o => o.id === selectedBagaj)?.extra || 0;
      const calcTot = () => priceBase * nrPax + bagExtra * nrPax + seatExtraSum();

      // Filter out any previously-selected seats that are now occupied or out-of-range
      selectedSeats = selectedSeats.slice(0, nrPax);

      const renderPlaneHTML = () => {
        let html = `<div class="flx-plane-wrap"><div class="flx-plane-body">`;
        html += `<div class="flx-plane-nose"></div>`;
        sections.forEach(sec => {
          const midCol = Math.floor(sec.cols.length / 2);
          html += `<div class="flx-plane-section-label ${sec.cls}">✈ ${sec.name}${sec.extraPerSeat > 0 ? ` (+${currency}${sec.extraPerSeat}/loc)` : ""}</div>`;
          sec.rows.forEach(r => {
            html += `<div class="flx-seat-row"><span class="flx-seat-row-num">${r}</span>`;
            sec.cols.forEach((c, ci) => {
              if (ci === midCol) html += `<span class="flx-seat-aisle"></span>`;
              const key = `${r}${c}`;
              const isOcc = occupied.has(key);
              const cls = isOcc ? "occupied" : `${sec.cls}-free`;
              const sel = selectedSeats.some(s => s.label === key) ? " selected" : "";
              html += `<button class="flx-seat ${cls}${sel}" data-key="${key}" data-row="${r}" data-col="${c}" data-class="${sec.cls}" data-extra="${sec.extraPerSeat}" ${isOcc ? "disabled" : ""}>${c}</button>`;
            });
            html += `</div>`;
          });
        });
        html += `</div></div>`;
        return html;
      };

      const seatInfoHTML = () => {
        if (!selectedSeats.length) return "";
        const parts = selectedSeats.map(s => `<strong>${s.label}</strong> (${s.cls === "business" ? "Business" : "Economic"}${s.extra > 0 ? ` +${fmtP(s.extra)}` : ""})`);
        return `💺 Locuri selectate (${selectedSeats.length}/${nrPax}): ${parts.join(", ")}`;
      };

      overlay.innerHTML = `
        <div id="flx-purchase-modal" style="max-width:520px;">
          <h4>💺 Alege ${nrPax > 1 ? `${nrPax} locuri` : "locul"}</h4>
          <p class="flx-pm-sub">${nrPax > 1 ? `Selectează ${nrPax} locuri disponibile (câte unul pentru fiecare pasager)` : "Selectează un loc disponibil în avion"}</p>
          <div class="flx-pm-card">
            <div class="flx-pm-dest">${esc(f.dest || "")} · ${esc(f.agency || "")}</div>
            <div class="flx-pm-info">📅 ${esc(f.date)} &nbsp;|&nbsp; 🛫 ${esc(f.dep)} → 🛬 ${esc(f.arr)}</div>
            <div class="flx-pm-price" id="flx-price-live">${fmtP(calcTot())}</div>
          </div>
          <p style="font-size:13px;font-weight:800;color:#0f172a;margin:0 0 8px;">💺 Plan avion <span id="flx-seat-counter" style="color:#2563eb;">(${selectedSeats.length}/${nrPax} selectate)</span>:</p>
          ${renderPlaneHTML()}
          <div class="flx-seat-legend">
            <div class="flx-seat-legend-item"><div class="flx-seat-legend-dot" style="background:#fef3c7;border-color:#fbbf24;"></div>Business</div>
            <div class="flx-seat-legend-item"><div class="flx-seat-legend-dot" style="background:#dbeafe;border-color:#93c5fd;"></div>Economic</div>
            <div class="flx-seat-legend-item"><div class="flx-seat-legend-dot" style="background:#2563eb;border-color:#1d4ed8;"></div>Selectat</div>
            <div class="flx-seat-legend-item"><div class="flx-seat-legend-dot" style="background:#f1f5f9;border-color:#e2e8f0;"></div>Ocupat</div>
          </div>
          <div class="flx-selected-info" id="flx-seat-info" style="${selectedSeats.length ? "display:block" : "display:none"}">
            ${seatInfoHTML()}
          </div>
          <div class="flx-pm-btns" style="margin-top:18px;">
            <button class="flx-pm-cancel" id="flx-pm-back3">← Înapoi</button>
            <button class="flx-pm-ok" id="flx-pm-next3" ${selectedSeats.length === nrPax ? "" : "disabled style='opacity:.5;cursor:not-allowed;'"}>Continuă →</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      const refreshSeatUI = () => {
        // Update visual selection
        overlay.querySelectorAll(".flx-seat").forEach(b => {
          b.classList.toggle("selected", selectedSeats.some(s => s.label === b.dataset.key));
        });
        const infoEl = overlay.querySelector("#flx-seat-info");
        if (infoEl) {
          if (selectedSeats.length) {
            infoEl.style.display = "block";
            infoEl.innerHTML = seatInfoHTML();
          } else {
            infoEl.style.display = "none";
            infoEl.innerHTML = "";
          }
        }
        const counter = overlay.querySelector("#flx-seat-counter");
        if (counter) counter.textContent = `(${selectedSeats.length}/${nrPax} selectate)`;
        const priceEl = overlay.querySelector("#flx-price-live");
        if (priceEl) priceEl.textContent = fmtP(calcTot());
        const nextBtn = overlay.querySelector("#flx-pm-next3");
        if (nextBtn) {
          if (selectedSeats.length === nrPax) {
            nextBtn.removeAttribute("disabled");
            nextBtn.style.opacity = "1"; nextBtn.style.cursor = "pointer";
          } else {
            nextBtn.setAttribute("disabled", "true");
            nextBtn.style.opacity = ".5"; nextBtn.style.cursor = "not-allowed";
          }
        }
      };

      overlay.querySelectorAll(".flx-seat:not(.occupied)").forEach(btn => {
        btn.addEventListener("click", () => {
          const key = btn.dataset.key;
          const idx = selectedSeats.findIndex(s => s.label === key);
          if (idx >= 0) {
            // Deselect
            selectedSeats.splice(idx, 1);
          } else {
            if (selectedSeats.length >= nrPax) {
              // Replace the first selected seat (FIFO) so user can keep clicking
              selectedSeats.shift();
            }
            selectedSeats.push({
              label: key,
              row: btn.dataset.row,
              col: btn.dataset.col,
              cls: btn.dataset.class,
              extra: parseInt(btn.dataset.extra) || 0
            });
          }
          refreshSeatUI();
        });
      });

      overlay.querySelector("#flx-pm-back3").onclick = () => showStepBagaj();
      overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
      overlay.querySelector("#flx-pm-next3").onclick = () => { if (selectedSeats.length === nrPax) showStepPersonal(); };
    };

    /* ---- PASUL 4: Date personale ---- */
    const showStepPersonal = () => {
      document.getElementById("flx-purchase-overlay")?.remove();
      const nrPax = passengers.length;
      const bagajInfo = BAGAJ_OPTS.find(o => o.id === selectedBagaj);
      const extraBag = bagajInfo?.extra || 0;
      const extraSeat = seatExtraSum();
      const total = priceBase * nrPax + extraBag * nrPax + extraSeat;

      const renderPaxForm = (idx) => {
        const p = passengers[idx];
        const isMain = idx === 0;
        return `
          <div style="background:#f8fafc;border-radius:14px;padding:16px;margin-bottom:12px;border:1px solid #e2e8f0;">
            <div style="font-size:13px;font-weight:900;color:#1e40af;margin-bottom:12px;">
              ${isMain ? "👤 Pasager principal" : `👤 Pasager ${idx+1}`}
              <span style="font-size:11px;color:#94a3b8;font-weight:600;margin-left:6px;">${p.tip}${p.varsta ? `, ${p.varsta} ani` : ""}</span>
            </div>
            <div class="flx-form-row">
              <div class="flx-form-group" id="fg-prenume-${idx}">
                <label>Prenume</label>
                <input type="text" id="flx-f-prenume-${idx}" placeholder="Ion" autocomplete="given-name" value="${esc(p.prenume||"")}">
                <span class="flx-form-error">Câmp obligatoriu</span>
              </div>
              <div class="flx-form-group" id="fg-nume-${idx}">
                <label>Nume</label>
                <input type="text" id="flx-f-nume-${idx}" placeholder="Popescu" autocomplete="family-name" value="${esc(p.nume||"")}">
                <span class="flx-form-error">Câmp obligatoriu</span>
              </div>
            </div>
            <div class="flx-form-group" id="fg-idnp-${idx}">
              <label>IDNP (13 cifre)</label>
              <input type="text" id="flx-f-idnp-${idx}" placeholder="2000000000000" maxlength="13" inputmode="numeric" value="${esc(p.idnp||"")}">
              <span class="flx-form-error" id="flx-err-idnp-${idx}">IDNP trebuie să conțină exact 13 cifre</span>
            </div>
            <div class="flx-form-row">
              <div class="flx-form-group" id="fg-datan-${idx}">
                <label>Data nașterii</label>
                <input type="date" id="flx-f-datan-${idx}" value="${esc(p.datan||"")}">
                <span class="flx-form-error">Câmp obligatoriu</span>
              </div>
              ${isMain ? `
              <div class="flx-form-group" id="fg-sex-${idx}">
                <label>Sex</label>
                <select id="flx-f-sex-${idx}">
                  <option value="">— Alegeți —</option>
                  <option value="M" ${p.sex==='M'?'selected':''}>Masculin</option>
                  <option value="F" ${p.sex==='F'?'selected':''}>Feminin</option>
                </select>
                <span class="flx-form-error">Selectați sexul</span>
              </div>` : `
              <div class="flx-form-group" id="fg-sex-${idx}">
                <label>Sex</label>
                <select id="flx-f-sex-${idx}">
                  <option value="">— Alegeți —</option>
                  <option value="M" ${p.sex==='M'?'selected':''}>Masculin</option>
                  <option value="F" ${p.sex==='F'?'selected':''}>Feminin</option>
                </select>
                <span class="flx-form-error">Selectați sexul</span>
              </div>`}
            </div>
            ${isMain ? `
            <div class="flx-form-group" id="fg-pasaport-${idx}">
              <label>Număr pașaport / buletin</label>
              <input type="text" id="flx-f-pasaport-${idx}" placeholder="AA000000" value="${esc(p.pasaport||"")}">
              <span class="flx-form-error">Câmp obligatoriu</span>
            </div>
            <div class="flx-form-group" id="fg-email-${idx}">
              <label>Email (confirmare bilet)</label>
              <input type="email" id="flx-f-email-${idx}" placeholder="ion@exemplu.com" autocomplete="email" value="${esc(p.email||"")}">
              <span class="flx-form-error">Adresă email invalidă</span>
            </div>
            <div class="flx-form-group" id="fg-tel-${idx}">
              <label>Telefon</label>
              <input type="tel" id="flx-f-tel-${idx}" placeholder="+373 xx xxx xxx" value="${esc(p.tel||"")}">
              <span class="flx-form-error">Câmp obligatoriu</span>
            </div>` : ""}
          </div>
        `;
      };

      const overlay = document.createElement("div");
      overlay.id = "flx-purchase-overlay";
      overlay.innerHTML = `
        <div id="flx-purchase-modal" style="max-width:540px;">
          <h4>👤 Date pasageri</h4>
          <p class="flx-pm-sub">Completați datele pentru emiterea biletelor</p>
          ${passengers.map((_, i) => renderPaxForm(i)).join("")}
          <div class="flx-pm-card" style="margin-bottom:16px;">
            <div class="flx-pm-info">
              🧳 ${bagajInfo?.label || ""}<br>
              💺 Locuri: ${seatLabelsStr()} — ${seatClassesStr()}<br>
              ✈ ${f.dest} · ${f.date} · ${f.dep} – ${f.arr} · ${nrPax} pasager${nrPax>1?'i':''}
            </div>
            <div class="flx-pm-price-total" style="margin-top:6px;">Total: ${fmtP(total)}</div>
          </div>
          <div class="flx-pm-btns">
            <button class="flx-pm-cancel" id="flx-pm-back4">← Înapoi</button>
            <button class="flx-pm-ok" id="flx-pm-next4">Continuă →</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
      overlay.querySelector("#flx-pm-back4").onclick = () => showStepSeat();

      overlay.querySelector("#flx-pm-next4").onclick = () => {
        let valid = true;

        for (let i = 0; i < passengers.length; i++) {
          const isMain = i === 0;
          const req = (id, fgId) => {
            const el = document.getElementById(id);
            const fg = document.getElementById(fgId);
            if (!el || !fg) return "";
            if (!el.value.trim()) { fg.classList.add("error"); valid = false; }
            else fg.classList.remove("error");
            return el.value.trim();
          };
          const prenume = req(`flx-f-prenume-${i}`, `fg-prenume-${i}`);
          const nume    = req(`flx-f-nume-${i}`,    `fg-nume-${i}`);
          const datan   = req(`flx-f-datan-${i}`,   `fg-datan-${i}`);
          req(`flx-f-sex-${i}`, `fg-sex-${i}`);

          const idnpEl = document.getElementById(`flx-f-idnp-${i}`);
          const fgIdnp = document.getElementById(`fg-idnp-${i}`);
          const idnp = idnpEl?.value.trim() || "";
          if (!/^\d{13}$/.test(idnp)) {
            fgIdnp?.classList.add("error"); valid = false;
          } else fgIdnp?.classList.remove("error");

          passengers[i].prenume = prenume;
          passengers[i].nume    = nume;
          passengers[i].datan   = datan;
          passengers[i].idnp    = idnp;
          passengers[i].sex     = document.getElementById(`flx-f-sex-${i}`)?.value || "";

          if (isMain) {
            req(`flx-f-pasaport-${i}`, `fg-pasaport-${i}`);
            passengers[i].pasaport = document.getElementById(`flx-f-pasaport-${i}`)?.value.trim() || "";
            passengers[i].tel      = document.getElementById(`flx-f-tel-${i}`)?.value.trim() || "";

            const emailEl = document.getElementById(`flx-f-email-${i}`);
            const fgEmail = document.getElementById(`fg-email-${i}`);
            const email = emailEl?.value.trim() || "";
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              fgEmail?.classList.add("error"); valid = false;
            } else { fgEmail?.classList.remove("error"); passengers[i].email = email; }
          }
        }

        if (!valid) return;
        showStepCheckin();
      };
    };

    /* ---- PASUL 5: Check-in online ---- */
    const showStepCheckin = () => {
      document.getElementById("flx-purchase-overlay")?.remove();
      const nrPax = passengers.length;
      const bagajInfo = BAGAJ_OPTS.find(o => o.id === selectedBagaj);
      const extraBag = bagajInfo?.extra || 0;
      const extraSeat = seatExtraSum();
      const baseTotal = priceBase * nrPax + extraBag * nrPax + extraSeat;

      const overlay = document.createElement("div");
      overlay.id = "flx-purchase-overlay";
      overlay.innerHTML = `
        <div id="flx-purchase-modal" style="max-width:480px;">
          <h4>🎫 Check-in online</h4>
          <p class="flx-pm-sub">Optați pentru check-in online și economisiți timp la aeroport</p>

          <div style="border:2px solid #e2e8f0;border-radius:16px;overflow:hidden;margin-bottom:20px;" id="flx-checkin-card">
            <div style="background:linear-gradient(135deg,#0ea5e9,#0284c7);padding:16px 20px;display:flex;align-items:center;gap:14px;">
              <span style="font-size:32px;">🎟️</span>
              <div>
                <div style="font-size:16px;font-weight:900;color:white;">Check-in Online</div>
                <div style="font-size:12px;color:rgba(255,255,255,.8);margin-top:2px;">Emitem cărțile de îmbarcare la timp</div>
              </div>
            </div>
            <div style="padding:16px 20px;background:white;">
              <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">
                <div style="display:flex;align-items:flex-start;gap:10px;font-size:13px;">
                  <span style="color:#0ea5e9;font-size:16px;margin-top:1px;">✓</span>
                  <span style="color:#475569;">Dacă <strong>nu achiziționezi</strong> acest serviciu, va fi necesar să efectuezi check-in-ul independent</span>
                </div>
                <div style="display:flex;align-items:flex-start;gap:10px;font-size:13px;">
                  <span style="color:#0ea5e9;font-size:16px;margin-top:1px;">✓</span>
                  <span style="color:#475569;"><strong>Economisești timp și bani:</strong> check-in-ul direct la aeroport poate genera cheltuieli suplimentare sau întârzieri</span>
                </div>
                <div style="display:flex;align-items:flex-start;gap:10px;font-size:13px;">
                  <span style="color:#0ea5e9;font-size:16px;margin-top:1px;">✓</span>
                  <span style="color:#475569;">Emitem cărțile de îmbarcare la timp direct pe email</span>
                </div>
              </div>

              <div style="display:flex;gap:12px;">
                <label id="flx-checkin-yes" style="flex:1;display:flex;align-items:center;gap:10px;padding:12px 16px;border:2px solid ${checkinOnline?'#0ea5e9':'#e2e8f0'};border-radius:12px;cursor:pointer;background:${checkinOnline?'#f0f9ff':'white'};transition:all .2s;">
                  <input type="radio" name="flx_checkin" value="yes" ${checkinOnline?"checked":""} style="accent-color:#0ea5e9;width:16px;height:16px;flex-shrink:0;">
                  <div>
                    <div style="font-size:13px;font-weight:800;color:#0f172a;">Adaugă</div>
                    <div style="font-size:12px;font-weight:900;color:#0ea5e9;">+${CHECKIN_PRICE.toFixed(2)} € / pers.</div>
                  </div>
                </label>
                <label id="flx-checkin-no" style="flex:1;display:flex;align-items:center;gap:10px;padding:12px 16px;border:2px solid ${!checkinOnline?'#64748b':'#e2e8f0'};border-radius:12px;cursor:pointer;background:${!checkinOnline?'#f8fafc':'white'};transition:all .2s;">
                  <input type="radio" name="flx_checkin" value="no" ${!checkinOnline?"checked":""} style="accent-color:#64748b;width:16px;height:16px;flex-shrink:0;">
                  <div>
                    <div style="font-size:13px;font-weight:800;color:#0f172a;">Nu adaug</div>
                    <div style="font-size:12px;color:#94a3b8;font-weight:600;">Check-in independent</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div style="background:#eff6ff;border-radius:12px;padding:14px 16px;margin-bottom:20px;border:1px solid #bfdbfe;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:13px;color:#475569;">Total final (${nrPax} pasager${nrPax>1?'i':''}):</span>
              <span style="font-size:20px;font-weight:900;color:#059669;" id="flx-checkin-total">${fmtP(baseTotal + (checkinOnline ? CHECKIN_PRICE * nrPax : 0))}</span>
            </div>
          </div>

          <div class="flx-pm-btns">
            <button class="flx-pm-cancel" id="flx-pm-back5">← Înapoi</button>
            <button class="flx-pm-ok green" id="flx-pm-confirm5">🎫 Finalizează rezervarea</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

      // Radio toggle styles
      overlay.querySelectorAll("input[name=flx_checkin]").forEach(r => {
        r.onchange = () => {
          checkinOnline = r.value === "yes";
          const yesLabel = overlay.querySelector("#flx-checkin-yes");
          const noLabel  = overlay.querySelector("#flx-checkin-no");
          if (checkinOnline) {
            yesLabel.style.borderColor = "#0ea5e9"; yesLabel.style.background = "#f0f9ff";
            noLabel.style.borderColor = "#e2e8f0"; noLabel.style.background = "white";
          } else {
            noLabel.style.borderColor = "#64748b"; noLabel.style.background = "#f8fafc";
            yesLabel.style.borderColor = "#e2e8f0"; yesLabel.style.background = "white";
          }
          const totalEl = overlay.querySelector("#flx-checkin-total");
          if (totalEl) totalEl.textContent = fmtP(baseTotal + (checkinOnline ? CHECKIN_PRICE * nrPax : 0));
        };
      });

      overlay.querySelector("#flx-pm-back5").onclick = () => showStepPersonal();
      overlay.querySelector("#flx-pm-confirm5").onclick = async () => {
        const nr = `BL${genNr()}${genNr()}`.slice(0, 10);
        const bagajInfo2 = BAGAJ_OPTS.find(o => o.id === selectedBagaj);
        const extraAmt = bagajInfo2?.extra || 0;
        const seatExAmt = seatExtraSum();
        const checkinAmt = checkinOnline ? CHECKIN_PRICE * nrPax : 0;
        const totalFinal = fmtP(priceBase * nrPax + extraAmt * nrPax + seatExAmt + checkinAmt);

        const mainPax = passengers[0];
        const payload = {
          flight_id: f.id || "",
          dest: f.dest, date: f.date, dep: f.dep, arr: f.arr, agency: f.agency,
          seat: seatLabelsStr(),
          seats: selectedSeats.map(s => ({ label: s.label, cls: s.cls, extra: s.extra })),
          seat_class: seatClassesStr(),
          bagaj: selectedBagaj, bagaj_label: bagajInfo2?.label || "",
          checkin_online: checkinOnline,
          passengers: passengers,
          prenume: mainPax.prenume, nume: mainPax.nume,
          idnp: mainPax.idnp, datan: mainPax.datan, sex: mainPax.sex,
          pasaport: mainPax.pasaport, email: mainPax.email, tel: mainPax.tel,
          from_city: getPageCountry(),
          base_price: priceBase, extra_bagaj: extraAmt,
          extra_seat: seatExAmt, checkin_price: checkinAmt,
          total_price: totalFinal
        };

        try {
          const ctrl = new AbortController();
          const tid = setTimeout(() => ctrl.abort(), 2000);
          const res = await fetch("php/cumpar.php", {
            method: "POST", signal: ctrl.signal,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({...payload, nr_bilet: nr})
          });
          clearTimeout(tid);
          const data = await res.json();
          if (!res.ok || !data.success) throw new Error(data.error || "");
          
          TicketStore.add({ nr_bilet: data.nr_bilet, ...payload, purchased_at: new Date().toISOString() });
          updateBadges(); renderTicketPanel();
          showStepSuccess({ nr: data.nr_bilet, bagajInfo: bagajInfo2, total: totalFinal });
        } catch (err) {
          // Fallback: save locally
          TicketStore.add({ nr_bilet: nr, ...payload, purchased_at: new Date().toISOString() });
          updateBadges(); renderTicketPanel();
          showStepSuccess({ nr, bagajInfo: bagajInfo2, total: totalFinal });
        }
      };
    };

    /* ---- PASUL 6: Succes ---- */
    const showStepSuccess = ({ nr, bagajInfo, total }) => {
      document.getElementById("flx-purchase-overlay")?.remove();
      const mainPax = passengers[0];
      const nrPax = passengers.length;
      const overlay = document.createElement("div");
      overlay.id = "flx-purchase-overlay";
      overlay.innerHTML = `
        <div id="flx-purchase-modal" style="text-align:center;">
          <div class="flx-success-icon">🎉</div>
          <h4 style="text-align:center;">Bilet procurat cu succes!</h4>
          <p class="flx-pm-sub" style="text-align:center;">Confirmarea va fi trimisă pe email: <strong>${esc(mainPax.email||"")}</strong></p>
          <div style="text-align:center;"><span class="flx-success-nr">Nr. ${nr}</span></div>
          <div class="flx-success-details" style="text-align:left;">
            <strong>Pasager principal:</strong> ${mainPax.prenume} ${mainPax.nume}<br>
            ${nrPax > 1 ? `<strong>Pasageri aditionali:</strong> ${nrPax - 1}<br>` : ""}
            <strong>Destinație:</strong> ${f.dest}<br>
            <strong>Data:</strong> ${f.date}<br>
            <strong>Decolare:</strong> ${f.dep} &nbsp;→&nbsp; <strong>Aterizare:</strong> ${f.arr}<br>
            <strong>Companie:</strong> ${f.agency}<br>
            <strong>Bagaj:</strong> ${bagajInfo?.label || "—"}<br>
            <strong>${selectedSeats.length > 1 ? "Locuri" : "Loc"}:</strong> ${seatLabelsStr()} — ${seatClassesStr()}<br>
            <strong>Check-in online:</strong> ${checkinOnline ? "Da ✓" : "Nu"}<br>
            <strong>Total achitat:</strong> <span style="color:#059669;font-weight:900;">${total}</span>
          </div>
          <div class="flx-pm-btns" style="margin-top:20px;">
            <button class="flx-pm-cancel" id="flx-pm-done6">✓ Închide</button>
            <button class="flx-pm-ok green" id="flx-pm-see6">🎫 Vezi biletele mele</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      overlay.querySelector("#flx-pm-done6").onclick = () => overlay.remove();
      overlay.querySelector("#flx-pm-see6").onclick = () => {
        overlay.remove();
        filterPanel?.classList.remove("open");
        favPanel?.classList.remove("open");
        watchPanel?.classList.remove("open");
        if (ticketPanel) { ticketPanel.classList.add("open"); renderTicketPanel(); }
      };
    };

    showStepInfo(); // start cu info zbor
  };

  /* ===== ICONURI ♡ ☆ PE RÂNDURI ===== */
  const addStarsToRows = (flights) => {
    flights.forEach((f, i) => {
      // ID unic bazat pe datele zborului, nu pe index — evită coliziuni între pagini
      const idRaw = `${f.date}_${f.dep}_${f.arr}_${f.agency}_${f.dest}`.replace(/[^a-zA-Z0-9_]/g, "_");
      const id = `zbor_${idRaw}`;
      f.id = id;

      const favBtn = document.createElement("button");
      favBtn.className  = "flx-fav-star";
      favBtn.dataset.id = id;
      favBtn.textContent = FavStore.has(id) ? "❤️" : "♡";
      favBtn.title = "Favorite";

      const watchBtn = document.createElement("button");
      watchBtn.className  = "flx-watch-star";
      watchBtn.dataset.id = id;
      watchBtn.textContent = WatchStore.has(id) ? "⭐" : "☆";
      watchBtn.title = "Urmărește zborul";

      const rezervaBtn = document.createElement("button");
      rezervaBtn.className = "flx-rezerva-btn";
      rezervaBtn.textContent = "Rezervează";
      rezervaBtn.title = "Rezervă zborul";

      const lastTd = f.tr.querySelector("td:last-child");
      if (lastTd) {
        // Wrap price text
        const priceText = lastTd.textContent.trim();
        lastTd.innerHTML = "";
        lastTd.style.cssText += "display:flex;align-items:center;justify-content:flex-end;gap:8px;";
        
        const priceWrap = document.createElement("div");
        priceWrap.style.cssText = "display:flex;flex-direction:column;align-items:flex-end;gap:0;";
        const priceEl = document.createElement("span");
        priceEl.className = "flx-price-text";
        priceEl.textContent = priceText;
        const priceLabel = document.createElement("span");
        priceLabel.className = "flx-price-label";
        priceLabel.textContent = "Tur";
        priceWrap.appendChild(priceEl);
        priceWrap.appendChild(priceLabel);
        
        lastTd.appendChild(favBtn);
        lastTd.appendChild(watchBtn);
        lastTd.appendChild(priceWrap);
        lastTd.appendChild(rezervaBtn);
      }
      
      rezervaBtn.onclick = e => {
        e.stopPropagation();
        showPurchaseFlow(f);
      };

      favBtn.onclick = e => {
        e.stopPropagation();
        if (FavStore.has(id)) {
          FavStore.remove(id);
          favBtn.textContent = "♡";
          toast("Eliminat din favorite", "info");
        } else {
          FavStore.add({
            id, dest: f.dest, date: f.date, dep: f.dep, arr: f.arr,
            agency: f.agency, price: f.price,
            fromCountry: getPageCountry(), toCountry: f.dest,
            pageUrl:   location.href,
            pageHash:  location.hash,
            pageTitle: document.querySelector("h1")?.textContent || document.title
          });
          favBtn.textContent = "❤️";
          toast(`Zbor spre ${f.dest} salvat! ❤️`, "success");
        }
        updateBadges();
        renderFavPanel();
      };

      watchBtn.onclick = e => {
        e.stopPropagation();
        if (WatchStore.has(id)) {
          WatchStore.remove(id);
          watchBtn.textContent = "☆";
          toast("Urmărire oprită", "info");
        } else {
          WatchStore.add({
            id, dest: f.dest, date: f.date, dep: f.dep, arr: f.arr,
            agency: f.agency, price: f.price, priceNum: f.priceNum,
            fromCountry: getPageCountry(), toCountry: f.dest,
            pageUrl:   location.href,
            pageHash:  location.hash,
            pageTitle: document.querySelector("h1")?.textContent || document.title
          });
          watchBtn.textContent = "⭐";
          toast(`Zbor spre ${f.dest} adăugat la urmărite 🔔`, "success");
        }
        updateBadges();
        renderWatchPanel();
      };

      f.tr.onclick = e => {
        if (e.target.closest(".flx-fav-star"))   return;
        if (e.target.closest(".flx-watch-star")) return;
        showPurchaseFlow(f);
      };
    });
  };

  /* ── STATS BAR ── */
  const updateStatsBar = () => {
    const bar = document.getElementById("flx-stats-bar");
    if (!bar) return;
    const total   = flightsGlobal.length;
    const visible = flightsGlobal.filter(f => f.tr.style.display !== "none").length;
    const minP    = total ? Math.min(...flightsGlobal.map(f => f.priceNum).filter(p => p > 0)) : 0;
    const tickets = TicketStore.get().length;
    const watched = WatchStore.get().length;
    if (!total) { bar.classList.remove("visible"); return; }
    bar.classList.add("visible");
    bar.innerHTML = `
      <div class="flx-stat-item">✈ <strong>${visible}</strong>/${total} zboruri</div>
      <span class="flx-stat-sep">|</span>
      <div class="flx-stat-item">💶 De la <strong>€${Math.round(minP)}</strong></div>
      <span class="flx-stat-sep">|</span>
      <div class="flx-stat-item">🎫 <strong>${tickets}</strong> bilet${tickets !== 1 ? "e" : ""}</div>
      <span class="flx-stat-sep">|</span>
      <div class="flx-stat-item">⭐ <strong>${watched}</strong> urmărit${watched !== 1 ? "e" : ""}</div>
    `;
  };

  /* ================================================================
     ███████╗  ██████╗ ██████╗ ██╗         █████╗      ██╗ █████╗ ██╗  ██╗
     ██╔══██╗ ██╔════╝██╔═══██╗╚═╝        ██╔══██╗     ██║██╔══██╗╚██╗██╔╝
     ███████║ ██║     ██║   ██║           ███████║     ██║███████║ ╚███╔╝
     ██╔══██║ ██║     ██║   ██║           ██╔══██║██   ██║██╔══██║ ██╔██╗
     ██║  ██║ ╚██████╗╚██████╔╝           ██║  ██║╚█████╔╝██║  ██║██╔╝ ██╗
     ╚═╝  ╚═╝  ╚═════╝ ╚═════╝            ╚═╝  ╚═╝ ╚════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
     ELEMENTE AJAX / LIVE — adăugate în zboruri.js
     ================================================================ */

  /* ───────────────────────────────────────────────────────────────
     STILURI AJAX (injectate o singură dată)
  ─────────────────────────────────────────────────────────────────*/
  const injectAjaxStyles = () => {
    if (document.getElementById("flx-ajax-styles")) return;
    const s = document.createElement("style");
    s.id = "flx-ajax-styles";
    s.textContent = `
      /* ── LIVE STATUS BADGE pe rânduri ── */
      .flx-status-badge {
        display:inline-flex; align-items:center; gap:5px;
        padding:3px 10px; border-radius:999px; font-size:11px; font-weight:900;
        letter-spacing:.3px; white-space:nowrap; flex-shrink:0;
        animation: flx-badge-in .4s ease;
      }
      @keyframes flx-badge-in { from{transform:scale(0.7);opacity:0} to{transform:scale(1);opacity:1} }
      .flx-status-ON_TIME { background:#dcfce7; color:#15803d; border:1.5px solid #86efac; }
      .flx-status-LA_TMP  { background:#fef9c3; color:#854d0e; border:1.5px solid #fde047; }
      .flx-status-ANULAT  { background:#fee2e2; color:#991b1b; border:1.5px solid #fca5a5; }
      .flx-status-DEVIAT  { background:#ede9fe; color:#5b21b6; border:1.5px solid #c4b5fd; }
      .flx-status-dot {
        width:7px; height:7px; border-radius:50%; flex-shrink:0;
        animation: flx-blink 1.6s ease-in-out infinite;
      }
      @keyframes flx-blink { 0%,100%{opacity:1} 50%{opacity:.3} }
      .flx-status-ON_TIME .flx-status-dot { background:#15803d; }
      .flx-status-LA_TMP  .flx-status-dot { background:#ca8a04; }
      .flx-status-ANULAT  .flx-status-dot { background:#dc2626; animation:none; }
      .flx-status-DEVIAT  .flx-status-dot { background:#7c3aed; }

      /* gate/terminal micro-info */
      .flx-gate-info {
        font-size:10px; color:#64748b; font-weight:700;
        background:#f1f5f9; border-radius:6px; padding:2px 7px;
        border:1px solid #e2e8f0; white-space:nowrap;
      }

      /* ── STATUS TD wrapper ── */
      .flx-status-cell {
        display:flex; flex-direction:column; gap:4px; align-items:flex-start;
      }

      /* ── PRICE TREND on rows ── */
      .flx-price-delta {
        font-size:10px; font-weight:900; padding:1px 6px;
        border-radius:999px; margin-left:4px; vertical-align:middle;
        animation: flx-badge-in .5s ease;
      }
      .flx-price-delta.up   { background:#fee2e2; color:#dc2626; }
      .flx-price-delta.down { background:#dcfce7; color:#15803d; }
      .flx-price-live-updated {
        animation: flx-price-flash .7s ease;
      }
      @keyframes flx-price-flash {
        0%   { background:rgba(37,99,235,0.18); }
        100% { background:transparent; }
      }

      /* ── SEATS LEFT badge ── */
      .flx-seats-left {
        font-size:10px; font-weight:900; color:#dc2626;
        background:#fee2e2; border:1.5px solid #fca5a5;
        border-radius:999px; padding:2px 8px;
        animation: flx-pulse-red 1.8s ease-in-out infinite;
      }
      .flx-seats-left.few { animation: flx-pulse-red 0.9s ease-in-out infinite; }
      @keyframes flx-pulse-red {
        0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.4)}
        50%{box-shadow:0 0 0 5px rgba(220,38,38,0)}
      }

      /* ── HOT badge ── */
      .flx-hot-badge {
        font-size:10px; font-weight:900; color:#ea580c;
        background:#ffedd5; border:1.5px solid #fed7aa;
        border-radius:999px; padding:2px 8px; margin-left:4px;
        animation: flx-badge-in .3s ease;
      }

      /* ── TICKER BAR ── */
      #flx-ticker-bar {
        position:fixed; top:0; left:0; right:0; z-index:8888;
        background:linear-gradient(90deg,#0f172a,#1e3a5f,#0f172a);
        height:36px; overflow:hidden; display:flex; align-items:center;
        border-bottom:2px solid #2563eb;
        box-shadow:0 2px 16px rgba(37,99,235,.35);
      }
      #flx-ticker-label {
        flex-shrink:0; font-size:10px; font-weight:900; color:#38bdf8;
        text-transform:uppercase; letter-spacing:1px;
        padding:0 14px; border-right:1px solid rgba(255,255,255,.15);
        height:100%; display:flex; align-items:center; gap:6px;
        background:rgba(37,99,235,.25);
      }
      #flx-ticker-track {
        flex:1; overflow:hidden; position:relative; height:100%;
      }
      #flx-ticker-inner {
        display:flex; gap:0; align-items:center; height:100%;
        white-space:nowrap;
        animation: flx-ticker-scroll 32s linear infinite;
      }
      #flx-ticker-inner:hover { animation-play-state:paused; }
      @keyframes flx-ticker-scroll {
        0%   { transform:translateX(0); }
        100% { transform:translateX(-50%); }
      }
      .flx-ticker-item {
        display:inline-flex; align-items:center; gap:8px;
        padding:0 20px; font-size:12px; font-weight:700; color:rgba(255,255,255,.85);
        border-right:1px solid rgba(255,255,255,.1); height:100%;
        cursor:pointer; transition:background .2s;
      }
      .flx-ticker-item:hover { background:rgba(37,99,235,.3); color:white; }
      .flx-ticker-item .flx-ti-dest { color:#38bdf8; font-weight:900; }
      .flx-ticker-item .flx-ti-price { color:#4ade80; font-weight:900; }
      .flx-ticker-item .flx-ti-sep { color:rgba(255,255,255,.3); }
      #flx-ticker-close {
        flex-shrink:0; background:none; border:none; color:rgba(255,255,255,.5);
        cursor:pointer; font-size:14px; padding:0 12px; height:100%;
        transition:color .2s;
      }
      #flx-ticker-close:hover { color:white; }
      body.has-ticker { padding-top:36px; }

      /* ── VREME PANEL ── */
      #flx-weather-panel {
        position:fixed; bottom:90px; left:24px; z-index:888;
        width:220px;
        background:linear-gradient(135deg,#0ea5e9,#0284c7);
        border-radius:20px; box-shadow:0 12px 40px rgba(14,165,233,.35);
        color:white; font-family:inherit; overflow:hidden;
        transform:translateY(110%); opacity:0;
        transition:transform .4s cubic-bezier(.34,1.56,.64,1), opacity .4s ease;
      }
      #flx-weather-panel.visible {
        transform:translateY(0); opacity:1;
      }
      #flx-weather-header {
        padding:12px 14px 8px;
        display:flex; align-items:center; justify-content:space-between;
        border-bottom:1px solid rgba(255,255,255,.15);
      }
      #flx-weather-header .flx-wh-title {
        font-size:11px; font-weight:900; text-transform:uppercase;
        letter-spacing:.5px; opacity:.8;
      }
      #flx-weather-close {
        background:none; border:none; color:rgba(255,255,255,.7);
        cursor:pointer; font-size:14px; padding:0; line-height:1;
        transition:color .2s;
      }
      #flx-weather-close:hover { color:white; }
      #flx-weather-body { padding:12px 14px 14px; }
      .flx-weather-city {
        font-size:13px; font-weight:900; margin-bottom:8px; opacity:.9;
        display:flex; align-items:center; gap:6px;
      }
      .flx-weather-main {
        display:flex; align-items:center; gap:12px; margin-bottom:10px;
      }
      .flx-weather-icon { font-size:36px; line-height:1; }
      .flx-weather-temp { font-size:32px; font-weight:900; line-height:1; }
      .flx-weather-cond { font-size:12px; opacity:.85; margin-top:2px; }
      .flx-weather-details {
        display:flex; gap:10px; flex-wrap:wrap;
      }
      .flx-weather-detail {
        display:flex; align-items:center; gap:4px;
        font-size:11px; opacity:.85; font-weight:700;
        background:rgba(255,255,255,.15); border-radius:8px; padding:3px 8px;
      }
      #flx-weather-updated {
        font-size:10px; opacity:.6; margin-top:8px;
        text-align:right;
      }
      #flx-weather-loading {
        text-align:center; padding:20px; font-size:13px; opacity:.8;
      }
      .flx-weather-skeleton {
        height:12px; background:rgba(255,255,255,.2); border-radius:6px;
        margin:6px 0; animation:flx-skeleton 1.2s ease infinite alternate;
      }
      @keyframes flx-skeleton { from{opacity:.4} to{opacity:.9} }

      /* ── CURSURI VALUTARE WIDGET ── */
      #flx-rates-widget {
        margin:0 0 20px;
        background:white; border-radius:20px;
        border:1px solid #e2e8f0;
        box-shadow:0 4px 20px rgba(0,0,0,.07);
        overflow:hidden; font-family:inherit;
      }
      #flx-rates-header {
        background:linear-gradient(135deg,#1e293b,#334155);
        padding:14px 18px; display:flex; align-items:center; justify-content:space-between;
      }
      #flx-rates-header h4 {
        margin:0; font-size:14px; font-weight:900; color:white;
        display:flex; align-items:center; gap:8px;
      }
      #flx-rates-updated {
        font-size:11px; color:rgba(255,255,255,.6); font-weight:600;
      }
      #flx-rates-body {
        display:flex; flex-wrap:wrap; gap:0;
        border-top:1px solid #f1f5f9;
      }
      .flx-rate-item {
        flex:1; min-width:90px; padding:10px 14px;
        display:flex; flex-direction:column; gap:2px;
        border-right:1px solid #f1f5f9; border-bottom:1px solid #f1f5f9;
        transition:background .2s;
      }
      .flx-rate-item:hover { background:#f8fafc; }
      .flx-rate-currency { font-size:11px; font-weight:900; color:#64748b; text-transform:uppercase; }
      .flx-rate-value    { font-size:16px; font-weight:900; color:#0f172a; }
      .flx-rate-flag     { font-size:14px; }
      .flx-rate-delta    { font-size:10px; font-weight:700; }
      .flx-rate-delta.up   { color:#dc2626; }
      .flx-rate-delta.down { color:#15803d; }
      .flx-rate-delta.same { color:#94a3b8; }
      #flx-rates-loading {
        padding:20px; text-align:center; color:#94a3b8; font-size:13px;
      }
      .flx-rate-item-mdl {
        background:linear-gradient(135deg,#fefce8,#fef9c3) !important;
        border-bottom:2px solid #fde047 !important;
        order:-1;
      }
      .flx-rate-item-mdl .flx-rate-currency { color:#92400e !important; }
      .flx-rate-item-mdl .flx-rate-value { color:#78350f !important; font-size:18px !important; }

      /* ── WEATHER TRIGGER (buton pe rânduri hover) ── */
      .flx-weather-trigger {
        background:linear-gradient(135deg,#0ea5e9,#0284c7);
        border:none; border-radius:8px; color:white;
        font-size:11px; font-weight:800; cursor:pointer;
        padding:3px 9px; transition:all .2s; flex-shrink:0;
        display:inline-flex; align-items:center; gap:4px;
      }
      .flx-weather-trigger:hover { transform:scale(1.08); box-shadow:0 4px 12px rgba(14,165,233,.4); }

      /* ── ANIMARE RÂND la update preț ── */
      @keyframes flx-row-update {
        0%   { box-shadow:inset 0 0 0 2px rgba(37,99,235,.6); }
        100% { box-shadow:inset 0 0 0 0px rgba(37,99,235,0); }
      }
      .flx-row-updated { animation: flx-row-update 1s ease; }

      /* ── NOTIFICARE preț scăzut ── */
      .flx-toast-price-drop {
        background:linear-gradient(135deg,#059669,#047857) !important;
        border-left:4px solid #4ade80 !important;
      }
      .flx-toast-price-up {
        background:linear-gradient(135deg,#dc2626,#b91c1c) !important;
        border-left:4px solid #fca5a5 !important;
      }

      /* ── SPINNER AJAX ── */
      .flx-ajax-spinner {
        width:14px; height:14px; border-radius:50%;
        border:2px solid rgba(37,99,235,.2);
        border-top-color:#2563eb;
        animation:flx-spin .7s linear infinite; flex-shrink:0;
      }
      @keyframes flx-spin { to{transform:rotate(360deg)} }

      /* ── LIVE INDICATOR ── */
      #flx-live-indicator {
        display:inline-flex; align-items:center; gap:6px;
        font-size:11px; font-weight:900; color:#dc2626;
        background:#fee2e2; border:1.5px solid #fca5a5;
        border-radius:999px; padding:3px 10px;
        margin-left:12px;
      }
      #flx-live-indicator .flx-live-dot {
        width:7px; height:7px; background:#dc2626; border-radius:50%;
        animation:flx-blink 1s ease-in-out infinite;
      }

      /* ── TOOLTIP VREme pe destinație ── */
      .flx-dest-weather {
        font-size:12px; font-weight:700; color:#0ea5e9;
        background:rgba(14,165,233,.1); border:1px solid rgba(14,165,233,.25);
        border-radius:8px; padding:2px 8px; cursor:pointer;
        transition:all .2s; display:inline-flex; align-items:center; gap:4px;
      }
      .flx-dest-weather:hover {
        background:rgba(14,165,233,.2); transform:scale(1.05);
      }
    `;
    document.head.appendChild(s);
  };

  /* ───────────────────────────────────────────────────────────────
     1. TICKER BAR — zborurile cele mai ieftine în timp real
  ─────────────────────────────────────────────────────────────────*/
  const buildTickerBar = (flights) => {
    if (document.getElementById("flx-ticker-bar")) return;

    // Sortăm după preț, luăm primele 10
    const top = [...flights]
      .filter(f => f.priceNum > 0)
      .sort((a, b) => a.priceNum - b.priceNum)
      .slice(0, 10);
    if (!top.length) return;

    const items = top.map(f =>
      `<div class="flx-ticker-item" data-id="${f.id}">
        <span>✈</span>
        <span class="flx-ti-dest">${esc(f.dest)}</span>
        <span class="flx-ti-sep">·</span>
        <span>${esc(f.date)}</span>
        <span class="flx-ti-sep">·</span>
        <span class="flx-ti-price">${esc(f.price)}</span>
        <span class="flx-ti-sep">·</span>
        <span style="opacity:.6;font-size:11px;">${esc(f.agency)}</span>
      </div>`
    ).join("");

    const bar = document.createElement("div");
    bar.id = "flx-ticker-bar";
    bar.innerHTML = `
      <div id="flx-ticker-label">
        <span style="font-size:14px;">✈</span> TOP PREȚURI
      </div>
      <div id="flx-ticker-track">
        <div id="flx-ticker-inner">${items}${items}</div>
      </div>
      <button id="flx-ticker-close" title="Închide ticker">✕</button>
    `;
    document.body.prepend(bar);
    document.body.classList.add("has-ticker");

    document.getElementById("flx-ticker-close").onclick = () => {
      bar.remove();
      document.body.classList.remove("has-ticker");
    };

    // Click pe item → scroll la zbor
    bar.querySelectorAll(".flx-ticker-item").forEach(item => {
      item.onclick = () => {
        const id = item.dataset.id;
        const f = flightsGlobal.find(x => x.id === id);
        if (f) {
          f.tr.scrollIntoView({ behavior: "smooth", block: "center" });
          f.tr.classList.add("flx-row-updated");
          setTimeout(() => f.tr.classList.remove("flx-row-updated"), 1000);
        }
      };
    });
  };

  /* ───────────────────────────────────────────────────────────────
     2. LIVE STATUS AJAX — poll la fiecare 30s
  ─────────────────────────────────────────────────────────────────*/
  const liveStatusMap  = {};
  let liveStatusTimer  = null;

  const fetchLiveStatuses = async (flights) => {
    if (!flights.length) return;
    const ids = flights.slice(0, 30).map(f => f.id); // max 30 odată

    try {
      const ctrl = new AbortController();
      const tid  = setTimeout(() => ctrl.abort(), 5000);
      const res  = await fetch(`php/get_live_status.php?flights=${encodeURIComponent(JSON.stringify(ids))}`, { signal: ctrl.signal });
      clearTimeout(tid);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success) return;

      Object.entries(data.statuses).forEach(([id, info]) => {
        liveStatusMap[id] = info;
        updateStatusBadge(id, info);
      });
    } catch (_) { /* silently fail */ }
  };

  const STATUS_ICON = { ON_TIME: "✓", LA_TMP: "⏱", ANULAT: "✕", DEVIAT: "⤵" };

  const updateStatusBadge = (id, info) => {
    const cell = document.querySelector(`.flx-status-cell[data-id="${id}"]`);
    if (!cell) return;

    const badge = cell.querySelector(".flx-status-badge");
    const gateEl = cell.querySelector(".flx-gate-info");

    const icon  = STATUS_ICON[info.status] || "·";
    const label = info.status === "LA_TMP" && info.delay > 0
      ? `${info.label} +${info.delay}min`
      : info.label;

    if (badge) {
      badge.className = `flx-status-badge flx-status-${info.status}`;
      badge.innerHTML = `<span class="flx-status-dot"></span>${icon} ${label}`;
    }
    if (gateEl) {
      gateEl.textContent = `${info.terminal} · ${info.gate}`;
    }
  };

  const injectStatusCells = (flights) => {
    flights.forEach(f => {
      // Găsim prima TD (data) — adăugăm status sub ea
      const firstTd = f.tr.querySelector("td:first-child");
      if (!firstTd || firstTd.querySelector(".flx-status-cell")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "flx-status-cell";
      wrapper.dataset.id = f.id;
      wrapper.innerHTML = `
        <div class="flx-status-badge flx-status-ON_TIME" style="opacity:.4;">
          <span class="flx-status-dot"></span>
          <span class="flx-ajax-spinner"></span>
        </div>
        <div class="flx-gate-info">—</div>
      `;

      const dateText = firstTd.textContent.trim();
      firstTd.innerHTML = "";
      const dateSpan = document.createElement("span");
      dateSpan.style.fontWeight = "700";
      dateSpan.textContent = dateText;
      firstTd.appendChild(dateSpan);
      firstTd.appendChild(wrapper);
    });
  };

  /* ───────────────────────────────────────────────────────────────
     3. FLUCTUAȚII PREȚ AJAX — poll la fiecare 60s
  ─────────────────────────────────────────────────────────────────*/
  let priceUpdateTimer = null;
  const prevPrices = {};

  const fetchPriceUpdates = async (flights) => {
    const payload = flights.slice(0, 40).map(f => ({ id: f.id, price: f.priceNum }));
    if (!payload.length) return;

    try {
      const ctrl = new AbortController();
      const tid  = setTimeout(() => ctrl.abort(), 5000);
      const res  = await fetch(`php/get_price_updates.php?flights=${encodeURIComponent(JSON.stringify(payload))}`, { signal: ctrl.signal });
      clearTimeout(tid);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success) return;

      Object.entries(data.updates).forEach(([id, upd]) => {
        const f = flightsGlobal.find(x => x.id === id);
        if (!f) return;

        const priceEl    = f.tr.querySelector(".flx-price-text");
        const seatsEl    = f.tr.querySelector(".flx-seats-left");
        const hotBadge   = f.tr.querySelector(".flx-hot-badge");

        // Actualizăm preț dacă s-a schimbat
        if (upd.trend !== "stable" && priceEl) {
          const oldPrice = f.priceNum;
          const newNum   = upd.new_price;
          const currency = String(f.price).replace(/[\d.,\s]/g, "").trim() || "€";
          const newPriceStr = `${currency}${Math.round(newNum)}`;

          // Eliminăm delta vechi (săgețile roșii/verzi sunt dezactivate)
          f.tr.querySelectorAll(".flx-price-delta").forEach(el => el.remove());

          priceEl.textContent = newPriceStr;
          priceEl.classList.add("flx-price-live-updated");
          f.tr.classList.add("flx-row-updated");
          setTimeout(() => {
            priceEl.classList.remove("flx-price-live-updated");
            f.tr.classList.remove("flx-row-updated");
          }, 800);

          // Notificare toast pentru variații mari
          if (Math.abs(upd.delta) >= 10) {
            const msg = upd.trend === "down"
              ? `✈ ${f.dest} — prețul a scăzut cu ${currency}${Math.abs(upd.delta)}! 🎉`
              : `✈ ${f.dest} — prețul a crescut cu ${currency}${upd.delta}`;
            const t = document.createElement("div");
            t.className = `flx-toast flx-toast-${upd.trend === "down" ? "success" : "info"} ${upd.trend === "down" ? "flx-toast-price-drop" : "flx-toast-price-up"}`;
            t.textContent = msg;
            toastWrap?.appendChild(t);
            setTimeout(() => t.remove(), 3500);
          }

          f.priceNum = newNum;
          f.price = newPriceStr;
        }

        // Locuri rămase
        if (seatsEl) {
          seatsEl.textContent = `🪑 ${upd.seats_left} loc${upd.seats_left === 1 ? "" : "uri"} ramas${upd.seats_left === 1 ? "" : "e"}`;
          seatsEl.className = `flx-seats-left${upd.seats_left <= 3 ? " few" : ""}`;
        }

        // HOT badge
        if (hotBadge) hotBadge.style.display = upd.hot ? "inline-flex" : "none";
      });
    } catch (_) { /* silently fail */ }
  };

  const injectPriceExtras = (flights) => {
    flights.forEach(f => {
      const lastTd = f.tr.querySelector("td:last-child");
      if (!lastTd || lastTd.querySelector(".flx-seats-left")) return;

      const seatsEl = document.createElement("span");
      seatsEl.className = "flx-seats-left";
      seatsEl.textContent = "🪑 …";

      const hotEl = document.createElement("span");
      hotEl.className = "flx-hot-badge";
      hotEl.textContent = "🔥 Popular";
      hotEl.style.display = "none";

      // Inserăm înainte de butonul Rezervează
      const rezervaBtn = lastTd.querySelector(".flx-rezerva-btn");
      if (rezervaBtn) {
        // Creăm un wrapper vertical pentru priceWrap
        const priceWrap = lastTd.querySelector(".flx-price-text")?.parentElement;
        if (priceWrap) {
          priceWrap.appendChild(seatsEl);
          priceWrap.appendChild(hotEl);
        }
      }
    });
  };

  /* ───────────────────────────────────────────────────────────────
     4. WIDGET VREME la destinație
  ─────────────────────────────────────────────────────────────────*/
  let weatherPanel = null;
  let weatherCache = {};
  let weatherLocked = false;

  const buildWeatherPanel = () => {
    if (document.getElementById("flx-weather-panel")) return;
    weatherPanel = document.createElement("div");
    weatherPanel.id = "flx-weather-panel";
    weatherPanel.innerHTML = `
      <div id="flx-weather-header">
        <span class="flx-wh-title">🌤 Vreme la destinație</span>
        <button id="flx-weather-close">✕</button>
      </div>
      <div id="flx-weather-body">
        <div id="flx-weather-loading">
          <div class="flx-weather-skeleton" style="width:60%;margin:0 auto;"></div>
          <div class="flx-weather-skeleton" style="width:80%;margin:8px auto 0;"></div>
        </div>
      </div>
    `;
    document.body.appendChild(weatherPanel);
    document.getElementById("flx-weather-close").onclick = () => {
      weatherPanel.classList.remove("visible");
      weatherLocked = false;
    };
  };

  const showWeather = async (city) => {
    if (!weatherPanel) buildWeatherPanel();
    weatherPanel.classList.add("visible");

    const body = document.getElementById("flx-weather-body");
    body.innerHTML = `<div id="flx-weather-loading">
      <div class="flx-weather-skeleton" style="width:60%;margin:0 auto;"></div>
      <div class="flx-weather-skeleton" style="width:80%;margin:8px auto 0;"></div>
    </div>`;

    // Cache
    if (weatherCache[city]) {
      renderWeather(weatherCache[city]);
      return;
    }

    try {
      const ctrl = new AbortController();
      const tid  = setTimeout(() => ctrl.abort(), 5000);
      const res  = await fetch(`php/get_weather.php?city=${encodeURIComponent(city)}`, { signal: ctrl.signal });
      clearTimeout(tid);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!data.success) throw new Error();
      weatherCache[city] = data;
      renderWeather(data);
    } catch (_) {
      body.innerHTML = `<div style="padding:16px;text-align:center;font-size:13px;opacity:.8;">
        ⚠️ Vremea nu a putut fi încărcată.
      </div>`;
    }
  };

  const renderWeather = (data) => {
    const body = document.getElementById("flx-weather-body");
    if (!body) return;
    body.innerHTML = `
      <div class="flx-weather-city">📍 ${esc(data.city)}</div>
      <div class="flx-weather-main">
        <div class="flx-weather-icon">${data.icon}</div>
        <div>
          <div class="flx-weather-temp">${data.temp}°C</div>
          <div class="flx-weather-cond">${esc(data.condition)}</div>
        </div>
      </div>
      <div class="flx-weather-details">
        <div class="flx-weather-detail">💧 ${data.humidity}%</div>
        <div class="flx-weather-detail">💨 ${data.wind} km/h</div>
      </div>
      <div id="flx-weather-updated">Actualizat: ${data.updated}</div>
    `;
  };

  const addWeatherTriggers = (flights) => {
    // Adăugăm trigger de vreme pe coloana destinație (a 3-a TD sau oriunde apare dest)
    flights.forEach(f => {
      const tds = f.tr.querySelectorAll("td");
      // Căutăm TD-ul care conține destinația
      let destTd = null;
      tds.forEach(td => {
        if (td.textContent.trim() === f.dest) destTd = td;
      });
      if (!destTd || destTd.querySelector(".flx-dest-weather")) return;

      const wBtn = document.createElement("span");
      wBtn.className = "flx-dest-weather";
      wBtn.innerHTML = `🌤 ${esc(f.dest)}`;
      wBtn.title = `Vezi vremea în ${f.dest}`;

      const origText = document.createElement("span");
      origText.style.display = "none";
      origText.textContent = f.dest;

      destTd.innerHTML = "";
      destTd.appendChild(wBtn);

      wBtn.onclick = (e) => {
        e.stopPropagation();
        weatherLocked = true;
        showWeather(f.dest);
      };

      // Hover automat (doar dacă nu e deja blocat)
      f.tr.addEventListener("mouseenter", () => {
        if (!weatherLocked) showWeather(f.dest);
      });
      f.tr.addEventListener("mouseleave", () => {
        if (!weatherLocked && weatherPanel) weatherPanel.classList.remove("visible");
      });
    });
  };

  /* ───────────────────────────────────────────────────────────────
     5. CURSURI VALUTARE WIDGET
  ─────────────────────────────────────────────────────────────────*/
  const RATE_FLAGS = {
    MDL:"🇲🇩", RON:"🇷🇴", USD:"🇺🇸", GBP:"🇬🇧",
    TRY:"🇹🇷", UAH:"🇺🇦", BGN:"🇧🇬", CHF:"🇨🇭",
    PLN:"🇵🇱", HUF:"🇭🇺", CZK:"🇨🇿", SEK:"🇸🇪",
    DKK:"🇩🇰", NOK:"🇳🇴",
  };
  const RATE_PREV = {};

  const buildRatesWidget = async () => {
    // Inserăm widgetul înainte de tabelele de zboruri
    const firstH2 = document.querySelector("h2");
    if (!firstH2 || document.getElementById("flx-rates-widget")) return;

    const widget = document.createElement("div");
    widget.id = "flx-rates-widget";
    widget.innerHTML = `
      <div id="flx-rates-header">
        <h4>💱 Cursuri valutare față de EUR <span id="flx-live-indicator"><span class="flx-live-dot"></span>LIVE</span></h4>
        <span id="flx-rates-updated">Se actualizează…</span>
      </div>
      <div id="flx-rates-body"><div id="flx-rates-loading">⏳ Se încarcă cursurile…</div></div>
    `;
    // Inserăm după widgetul de căutare
    const searchWidget = document.getElementById("flx-search-widget");
    const countBar = document.getElementById("flx-count-bar");
    const insertAfter = countBar || searchWidget;
    if (insertAfter) insertAfter.after(widget);
    else firstH2.before(widget);

    await refreshRates();
  };

  const refreshRates = async () => {
    try {
      const ctrl = new AbortController();
      const tid  = setTimeout(() => ctrl.abort(), 5000);
      const res  = await fetch("php/get_exchange_rates.php", { signal: ctrl.signal });
      clearTimeout(tid);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success) return;

      const body = document.getElementById("flx-rates-body");
      const updEl = document.getElementById("flx-rates-updated");
      if (!body) return;

      if (updEl) updEl.textContent = `${data.source === 'live' ? '🟢 Live' : '📌 Referință'} · ${data.updated}`;

      body.innerHTML = Object.entries(data.rates).map(([cur, val]) => {
        RATE_PREV[cur] = val;
        const flag = RATE_FLAGS[cur] || "🌍";
        const isMDL = cur === "MDL";
        return `
          <div class="flx-rate-item${isMDL ? " flx-rate-item-mdl" : ""}" title="1 EUR = ${val} ${cur}">
            <div style="display:flex;align-items:center;gap:5px;">
              <span class="flx-rate-flag">${flag}</span>
              <span class="flx-rate-currency">${cur}</span>
            </div>
            <div class="flx-rate-value">${val}</div>
          </div>
        `;
      }).join("");
    } catch (_) {
      const body = document.getElementById("flx-rates-body");
      if (body) body.innerHTML = `<div id="flx-rates-loading" style="color:#ef4444;">⚠️ Cursurile nu s-au putut încărca.</div>`;
    }
  };

  /* ───────────────────────────────────────────────────────────────
     6. INIT AJAX ORCHESTRATOR
  ─────────────────────────────────────────────────────────────────*/
  const initAjaxFeatures = async (flights) => {
    injectAjaxStyles();

    // Ticker zboruri ieftine
    buildTickerBar(flights);

    // Injectăm celulele de status în DOM (placeholder)
    injectStatusCells(flights);

    // Injectăm extras preț
    injectPriceExtras(flights);

    // Adăugăm trigger vreme pe destinații
    buildWeatherPanel();
    addWeatherTriggers(flights);

    // Widget cursuri valutare
    await buildRatesWidget();

    // Primul fetch live status
    await fetchLiveStatuses(flights);

    // Primul fetch prețuri
    await fetchPriceUpdates(flights);

    // Poll status la fiecare 30s
    liveStatusTimer = setInterval(() => fetchLiveStatuses(flights), 30_000);

    // Poll prețuri la fiecare 60s
    priceUpdateTimer = setInterval(() => fetchPriceUpdates(flights), 60_000);

    // Refresh cursuri la fiecare 5 min
    setInterval(refreshRates, 300_000);

    // ── ELEMENT NOU 1: Countdown timere pe zboruri de azi ──
    buildFlightCountdowns(flights);

    // ── ELEMENT NOU 2: Sugestii autocomplete destinație ──
    buildDestinationAutocomplete(flights);

    // ── ELEMENT NOU 3: Comparator rapid zbor (tooltip la hover) ──
    buildPriceComparator(flights);

    // ── ELEMENT NOU 4: Hartă mini-destinații ──
    buildMiniDestMap(flights);

    // ── ELEMENT NOU 5: Alerte de preț pe fiecare rând ──
    injectAlertButtons(flights);

    // ── ELEMENT NOU 6: Stats bar live enhanced ──
    updateStatsBarEnhanced();

    // ── ELEMENT NOU 7: Sparklines per destinație ──
    buildDestSparklines(flights);
  };

  /* ───────────────────────────────────────────────────────────────
     AJAX NOU 1 — COUNTDOWN TIMERE pe zborurile de azi
     Afișează "⏱ Decolează în 2h 34min" direct pe rând
  ─────────────────────────────────────────────────────────────────*/
  const buildFlightCountdowns = (flights) => {
    const todayStr = new Date().toLocaleDateString("ro-RO", {
      day:"2-digit", month:"2-digit", year:"numeric"
    }).replace(/\//g, ".");

    // Injectăm stilurile countdown
    const s = document.createElement("style");
    s.textContent = `
      .flx-countdown {
        font-size:10px; font-weight:900; padding:2px 8px;
        border-radius:999px; white-space:nowrap; display:inline-flex;
        align-items:center; gap:4px; margin-top:3px;
        animation:flx-badge-in .4s ease;
      }
      .flx-countdown.soon {
        background:linear-gradient(135deg,#fef9c3,#fef3c7);
        color:#92400e; border:1.5px solid #fbbf24;
        animation:flx-badge-in .4s ease, flx-pulse-amber 2s ease-in-out infinite;
      }
      .flx-countdown.later { background:#f1f5f9; color:#475569; border:1.5px solid #e2e8f0; }
      .flx-countdown.departed { background:#f1f5f9; color:#94a3b8; border:1.5px solid #e2e8f0; }
      @keyframes flx-pulse-amber {
        0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,.4)}
        50%{box-shadow:0 0 0 5px rgba(251,191,36,0)}
      }
    `;
    document.head.appendChild(s);

    const todayFlights = flights.filter(f => f.date === todayStr);
    if (!todayFlights.length) return;

    const tickCountdowns = () => {
      const now = new Date();
      todayFlights.forEach(f => {
        const cell = f.tr.querySelector(".flx-status-cell");
        if (!cell) return;

        let cdEl = cell.querySelector(".flx-countdown");
        if (!cdEl) {
          cdEl = document.createElement("div");
          cdEl.className = "flx-countdown later";
          cell.appendChild(cdEl);
        }

        // Parsăm ora decolării (ex: "10:30 OTP")
        const timeMatch = f.dep.match(/(\d{1,2}):(\d{2})/);
        if (!timeMatch) return;

        const depTime = new Date();
        depTime.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0, 0);
        const diffMs = depTime - now;
        const diffMin = Math.floor(diffMs / 60000);

        if (diffMs < 0) {
          cdEl.className = "flx-countdown departed";
          cdEl.textContent = "✓ Decolare trecută";
        } else if (diffMin < 60) {
          cdEl.className = "flx-countdown soon";
          cdEl.innerHTML = `⚡ Decolează în ${diffMin}min!`;
        } else {
          const h = Math.floor(diffMin / 60), m = diffMin % 60;
          cdEl.className = "flx-countdown later";
          cdEl.innerHTML = `⏱ ${h}h ${m}min`;
        }
      });
    };

    tickCountdowns();
    setInterval(tickCountdowns, 30000);
  };

  /* ───────────────────────────────────────────────────────────────
     AJAX NOU 2 — AUTOCOMPLETE destinații cu scoruri popularitate
     Apare sub câmpul "Spre" din widget
  ─────────────────────────────────────────────────────────────────*/
  const buildDestinationAutocomplete = (flights) => {
    const destCounts = {};
    const destMinPrice = {};
    flights.forEach(f => {
      destCounts[f.dest] = (destCounts[f.dest] || 0) + 1;
      if (!destMinPrice[f.dest] || f.priceNum < destMinPrice[f.dest])
        destMinPrice[f.dest] = f.priceNum;
    });

    const toField = document.querySelector(".flx-field:last-of-type");
    if (!toField) return;

    // Injectăm stilurile autocomplete
    const s = document.createElement("style");
    s.textContent = `
      #flx-ac-popup {
        position:absolute; top:calc(100% + 6px); left:-1px; right:-1px;
        background:white; border-radius:16px; border:1.5px solid #e2e8f0;
        box-shadow:0 20px 50px rgba(0,0,0,.15); z-index:9999;
        max-height:280px; overflow-y:auto; padding:6px;
        animation:flx-badge-in .2s ease;
        scrollbar-width:thin;
      }
      .flx-ac-item {
        display:flex; align-items:center; justify-content:space-between;
        padding:10px 12px; border-radius:10px; cursor:pointer;
        transition:background .12s; gap:10px;
      }
      .flx-ac-item:hover { background:#f1f5f9; }
      .flx-ac-item-left { display:flex; align-items:center; gap:10px; }
      .flx-ac-dest { font-size:14px; font-weight:800; color:#0f172a; }
      .flx-ac-count { font-size:11px; color:#94a3b8; font-weight:600; }
      .flx-ac-price { font-size:13px; font-weight:900; color:#059669; white-space:nowrap; }
      .flx-ac-pop-bar {
        height:3px; border-radius:2px;
        background:linear-gradient(90deg,#2563eb,#38bdf8);
        margin-top:3px; transition:width .3s;
      }
      #flx-ac-header {
        font-size:10px; font-weight:900; color:#94a3b8; text-transform:uppercase;
        letter-spacing:.5px; padding:6px 12px 4px;
      }
    `;
    document.head.appendChild(s);

    toField.style.position = "relative";
    const popup = document.createElement("div");
    popup.id = "flx-ac-popup";
    popup.style.display = "none";
    toField.appendChild(popup);

    const maxCount = Math.max(...Object.values(destCounts));

    const renderSuggestions = (query = "") => {
      const sorted = Object.entries(destCounts)
        .filter(([d]) => !query || d.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

      if (!sorted.length) { popup.style.display = "none"; return; }

      popup.style.display = "block";
      popup.innerHTML = `<div id="flx-ac-header">${query ? "Rezultate" : "✈ Destinații populare"}</div>` +
        sorted.map(([dest, cnt]) => {
          const pct = Math.round((cnt / maxCount) * 100);
          const price = destMinPrice[dest] ? `de la €${Math.round(destMinPrice[dest])}` : "";
          return `
            <div class="flx-ac-item" data-dest="${esc(dest)}">
              <div class="flx-ac-item-left">
                <span style="font-size:18px;">🌍</span>
                <div>
                  <div class="flx-ac-dest">${esc(dest)}</div>
                  <div class="flx-ac-pop-bar" style="width:${pct}%;"></div>
                  <div class="flx-ac-count">${cnt} zbor${cnt !== 1 ? "uri" : ""}</div>
                </div>
              </div>
              <div class="flx-ac-price">${price}</div>
            </div>
          `;
        }).join("");

      popup.querySelectorAll(".flx-ac-item").forEach(item => {
        item.onclick = (e) => {
          e.stopPropagation();
          const dest = item.dataset.dest;
          const sel = document.getElementById("flx-fil-dest");
          const tv  = document.getElementById("flx-to-val");
          if (sel) { sel.value = dest; sel.dispatchEvent(new Event("change")); }
          if (tv)  { tv.textContent = dest; tv.classList.remove("placeholder"); }
          popup.style.display = "none";
          applyFilters();
          toast(`✈ ${dest} selectat`, "success");
        };
      });
    };

    // Deschide la click pe câmpul To
    toField.addEventListener("click", (e) => {
      e.stopPropagation();
      renderSuggestions();
    });

    // Tastare în câmpul select ascuns
    const sel = document.getElementById("flx-fil-dest");
    if (sel) {
      sel.addEventListener("keyup", () => renderSuggestions(sel.options[sel.selectedIndex]?.text || ""));
    }

    document.addEventListener("click", () => { popup.style.display = "none"; });
    popup.addEventListener("click", e => e.stopPropagation());
  };

  /* ───────────────────────────────────────────────────────────────
     AJAX NOU 3 — COMPARATOR RAPID: tooltip cu comparație față de
     cel mai ieftin zbor spre aceeași destinație
  ─────────────────────────────────────────────────────────────────*/
  const buildPriceComparator = (flights) => {
    // Cel mai ieftin per destinație
    const cheapest = {};
    flights.forEach(f => {
      if (!cheapest[f.dest] || f.priceNum < cheapest[f.dest].priceNum)
        cheapest[f.dest] = f;
    });

    // Injectăm stiluri
    const s = document.createElement("style");
    s.textContent = `
      .flx-compare-tip {
        position:absolute; bottom:calc(100% + 8px); right:0;
        background:#0f172a; color:white; font-family:inherit;
        border-radius:14px; padding:10px 14px; z-index:9999;
        box-shadow:0 12px 40px rgba(0,0,0,.35); min-width:220px;
        font-size:12px; line-height:1.7; pointer-events:none;
        animation:flx-badge-in .2s ease;
      }
      .flx-compare-tip::after {
        content:''; position:absolute; bottom:-6px; right:20px;
        width:12px; height:12px; background:#0f172a;
        clip-path:polygon(50% 100%,0 0,100% 0);
      }
      .flx-compare-tip .flx-ct-title { font-size:11px; opacity:.6; font-weight:700; margin-bottom:4px; }
      .flx-compare-tip .flx-ct-cheap { color:#4ade80; font-weight:900; font-size:13px; }
      .flx-compare-tip .flx-ct-diff-up   { color:#f87171; }
      .flx-compare-tip .flx-ct-diff-down { color:#4ade80; }
      .flx-compare-tip .flx-ct-same { opacity:.7; }
      .flx-ct-bar { height:4px; border-radius:2px; background:rgba(255,255,255,.1); margin:6px 0 2px; overflow:hidden; }
      .flx-ct-bar-fill { height:100%; border-radius:2px; background:linear-gradient(90deg,#4ade80,#22d3ee); transition:width .5s; }
    `;
    document.head.appendChild(s);

    flights.forEach(f => {
      const priceWrap = f.tr.querySelector(".flx-price-text")?.parentElement;
      if (!priceWrap || priceWrap.dataset.compareReady) return;
      priceWrap.dataset.compareReady = "1";
      priceWrap.style.position = "relative";

      let tip = null;

      const showTip = () => {
        if (tip) return;
        const best = cheapest[f.dest];
        if (!best) return;
        const currency = String(f.price).replace(/[\d.,\s]/g, "").trim() || "€";
        const diff = f.priceNum - best.priceNum;
        const pct  = best.priceNum > 0 ? Math.round((best.priceNum / f.priceNum) * 100) : 100;

        let diffHtml;
        if (Math.abs(diff) < 1) {
          diffHtml = `<span class="flx-ct-same">★ Acesta e cel mai ieftin!</span>`;
        } else if (diff > 0) {
          diffHtml = `<span class="flx-ct-same">+${currency}${Math.round(diff)} față de cel mai ieftin</span>`;
        } else {
          diffHtml = `<span class="flx-ct-same">−${currency}${Math.round(Math.abs(diff))} sub media destinației</span>`;
        }

        tip = document.createElement("div");
        tip.className = "flx-compare-tip";
        tip.innerHTML = `
          <div class="flx-ct-title">📊 Comparație prețuri spre ${esc(f.dest)}</div>
          <div>Cel mai ieftin: <span class="flx-ct-cheap">${currency}${Math.round(best.priceNum)}</span> (${esc(best.agency)})</div>
          <div>${diffHtml}</div>
          <div class="flx-ct-bar"><div class="flx-ct-bar-fill" style="width:${pct}%;"></div></div>
          <div style="font-size:10px;opacity:.5;">Raport față de cel mai ieftin: ${pct}%</div>
        `;
        priceWrap.appendChild(tip);
      };

      const hideTip = () => { tip?.remove(); tip = null; };

      priceWrap.addEventListener("mouseenter", showTip);
      priceWrap.addEventListener("mouseleave", hideTip);
    });
  };

  /* ───────────────────────────────────────────────────────────────
     AJAX NOU 4 — HARTĂ MINI-DESTINAȚII (vizualizare rapidă)
     Apare ca panel slide-in cu iconuri de pin per țară unică
  ─────────────────────────────────────────────────────────────────*/
  const buildMiniDestMap = (flights) => {
    if (document.getElementById("flx-destmap-panel")) return;

    const COUNTRY_COORDS = {
      "Spania":{"x":12,"y":58},"Italia":{"x":28,"y":52},"Franta":{"x":16,"y":46},
      "Germania":{"x":26,"y":38},"Austria":{"x":30,"y":42},"Belgia":{"x":18,"y":36},
      "Olanda":{"x":20,"y":34},"Marea Britanie":{"x":12,"y":30},"Elvetia":{"x":24,"y":44},
      "Polonia":{"x":36,"y":32},"Cehia":{"x":32,"y":36},"Slovacia":{"x":36,"y":38},
      "Ungaria":{"x":36,"y":44},"Romania":{"x":44,"y":44},"Bulgaria":{"x":44,"y":52},
      "Grecia":{"x":40,"y":64},"Turcia":{"x":54,"y":60},"Cipru":{"x":56,"y":68},
      "Moldova":{"x":50,"y":40},"Ucraina":{"x":52,"y":34},"Croatia":{"x":32,"y":50},
      "Serbia":{"x":38,"y":50},"Slovenia":{"x":28,"y":46},"Macedonia de Nord":{"x":40,"y":54},
      "Muntenegru":{"x":36,"y":54},"Estonia":{"x":44,"y":22},"Letonia":{"x":44,"y":26},
      "Lituania":{"x":42,"y":28},"Danemarca":{"x":24,"y":28},"Suedia":{"x":28,"y":18},
      "Norvegia":{"x":22,"y":14},"Finlanda":{"x":36,"y":14},
      "Portugalia":{"x":6,"y":62},"Israel":{"x":60,"y":66},
      "Egipt":{"x":56,"y":78},"Emirate":{"x":80,"y":74},"Qatar":{"x":74,"y":72},
      "SUA":{"x":-40,"y":46},
    };

    const destData = {};
    flights.forEach(f => {
      if (!destData[f.dest]) destData[f.dest] = { dest: f.dest, count: 0, minPrice: Infinity, currency: "€" };
      destData[f.dest].count++;
      if (f.priceNum < destData[f.dest].minPrice) {
        destData[f.dest].minPrice = f.priceNum;
        destData[f.dest].currency = String(f.price).replace(/[\d.,\s]/g,"").trim()||"€";
      }
    });

    const panel = document.createElement("div");
    panel.id = "flx-destmap-panel";

    const pins = Object.values(destData).map(d => {
      const coord = COUNTRY_COORDS[d.dest];
      if (!coord) return "";
      const maxFlights = Math.max(...Object.values(destData).map(x => x.count));
      const size = 22 + Math.round((d.count / maxFlights) * 14);
      return `
        <button class="flx-map-pin" data-dest="${esc(d.dest)}"
          style="left:${coord.x}%;top:${coord.y}%;width:${size}px;height:${size}px;"
          title="${esc(d.dest)} — ${d.count} zboruri, de la ${d.currency}${Math.round(d.minPrice)}">
          <span class="flx-map-pin-dot"></span>
          <div class="flx-map-pin-tooltip">
            <strong>${esc(d.dest)}</strong><br>
            ${d.count} zbor${d.count!==1?"uri":""}<br>
            <span style="color:#4ade80;font-weight:900;">de la ${d.currency}${Math.round(d.minPrice)}</span>
          </div>
        </button>`;
    }).join("");

    panel.innerHTML = `
      <div id="flx-destmap-header">
        <span>🗺️ Hartă destinații</span>
        <button id="flx-destmap-close">✕</button>
      </div>
      <div id="flx-destmap-body">
        <div id="flx-destmap-legend">
          <span>● mic = puține zboruri</span><span>● mare = multe zboruri</span>
        </div>
        <div id="flx-destmap-europe">${pins}</div>
        <div id="flx-destmap-hint">👆 Click pe un pin pentru a filtra zborurile</div>
      </div>
    `;
    document.body.appendChild(panel);

    // Stiluri hartă
    const s = document.createElement("style");
    s.textContent = `
      #flx-destmap-panel {
        position:fixed; top:0; left:-380px; width:360px; height:100vh;
        background:white; z-index:9998;
        box-shadow:8px 0 40px rgba(0,0,0,.18);
        transition:left .35s cubic-bezier(.4,0,.2,1);
        display:flex; flex-direction:column; font-family:inherit;
      }
      #flx-destmap-panel.open { left:0; }
      #flx-destmap-header {
        padding:16px 18px; display:flex; align-items:center; justify-content:space-between;
        background:linear-gradient(135deg,#0f172a,#1e3a5f);
        color:white; font-size:15px; font-weight:900; flex-shrink:0;
      }
      #flx-destmap-close {
        background:rgba(255,255,255,.15); border:none; color:white; cursor:pointer;
        width:28px; height:28px; border-radius:50%; display:grid; place-items:center;
        font-size:14px; transition:background .2s;
      }
      #flx-destmap-close:hover { background:rgba(255,255,255,.3); }
      #flx-destmap-body { flex:1; overflow:hidden; display:flex; flex-direction:column; padding:12px; gap:8px; }
      #flx-destmap-legend {
        display:flex; gap:12px; font-size:10px; color:#94a3b8; font-weight:700; justify-content:center;
      }
      #flx-destmap-europe {
        flex:1; position:relative; background:linear-gradient(135deg,#dbeafe 0%,#bfdbfe 50%,#93c5fd 100%);
        border-radius:16px; border:2px solid #93c5fd; overflow:hidden;
      }
      #flx-destmap-hint {
        text-align:center; font-size:11px; color:#94a3b8; font-weight:700; padding:4px;
      }
      .flx-map-pin {
        position:absolute; transform:translate(-50%,-50%);
        border-radius:50%; border:2px solid white;
        background:linear-gradient(135deg,#2563eb,#1d4ed8);
        cursor:pointer; transition:all .2s;
        display:flex; align-items:center; justify-content:center;
        box-shadow:0 2px 8px rgba(37,99,235,.4);
        z-index:1;
      }
      .flx-map-pin:hover {
        transform:translate(-50%,-50%) scale(1.3);
        box-shadow:0 4px 16px rgba(37,99,235,.6); z-index:10;
      }
      .flx-map-pin-dot {
        width:40%; height:40%; background:white; border-radius:50%; opacity:.8;
      }
      .flx-map-pin-tooltip {
        display:none; position:absolute; bottom:calc(100% + 8px); left:50%;
        transform:translateX(-50%);
        background:#0f172a; color:white; border-radius:10px; padding:8px 12px;
        font-size:12px; line-height:1.5; white-space:nowrap; pointer-events:none;
        box-shadow:0 8px 24px rgba(0,0,0,.3);
      }
      .flx-map-pin:hover .flx-map-pin-tooltip { display:block; }
      .flx-map-pin.active-pin {
        background:linear-gradient(135deg,#059669,#047857);
        box-shadow:0 0 0 4px rgba(5,150,105,.3), 0 4px 16px rgba(5,150,105,.4);
      }
    `;
    document.head.appendChild(s);

    document.getElementById("flx-destmap-close").onclick = () => {
      panel.classList.remove("open");
      document.getElementById("flx-nav-map")?.classList.remove("active");
    };

    panel.querySelectorAll(".flx-map-pin").forEach(pin => {
      pin.onclick = () => {
        const dest = pin.dataset.dest;
        panel.querySelectorAll(".flx-map-pin").forEach(p => p.classList.remove("active-pin"));
        pin.classList.add("active-pin");
        const sel = document.getElementById("flx-fil-dest");
        const tv  = document.getElementById("flx-to-val");
        if (sel) { sel.value = dest; sel.dispatchEvent(new Event("change")); }
        if (tv)  { tv.textContent = dest; tv.classList.remove("placeholder"); }
        applyFilters();
        panel.classList.remove("open");
        document.getElementById("flx-nav-map")?.classList.remove("active");
        toast(`✈ Filtrare: ${dest}`, "success");
      };
    });

    return panel;
  };

  /* ───────────────────────────────────────────────────────────────
     AJAX NOU 5 — ALERTĂ PREȚ (price alert cu notificare vizuală)
     User setează un prag de preț, primește notificare când scade
  ─────────────────────────────────────────────────────────────────*/
  const ALERT_KEY = "flx_price_alerts";
  const getPriceAlerts = () => { try { return JSON.parse(localStorage.getItem(ALERT_KEY)||"[]"); } catch{return[];} };
  const savePriceAlerts = a => localStorage.setItem(ALERT_KEY, JSON.stringify(a));

  const buildPriceAlertButton = (f, container) => {
    if (container.querySelector(".flx-alert-btn")) return;
    const alerts = getPriceAlerts();
    const hasAlert = alerts.find(a => a.id === f.id);

    const btn = document.createElement("button");
    btn.className = "flx-alert-btn";
    btn.dataset.id = f.id;
    btn.innerHTML = hasAlert ? "🔔" : "🔕";
    btn.title = hasAlert ? `Alertă activă: sub €${hasAlert.threshold}` : "Setează alertă de preț";

    const s = document.createElement("style");
    s.textContent = `
      .flx-alert-btn {
        background:none; border:1.5px solid #e2e8f0; border-radius:8px;
        cursor:pointer; font-size:14px; padding:2px 6px; transition:all .2s;
        display:inline-flex; align-items:center; flex-shrink:0;
      }
      .flx-alert-btn:hover { border-color:#2563eb; background:#eff6ff; transform:scale(1.1); }
      .flx-alert-btn.active { border-color:#f59e0b; background:#fffbeb; }
      #flx-alert-modal-overlay {
        position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:99999;
        display:grid; place-items:center; animation:flxFadeIn .2s ease;
      }
      #flx-alert-modal {
        background:white; border-radius:20px; padding:24px; max-width:360px; width:90%;
        box-shadow:0 20px 60px rgba(0,0,0,.25); font-family:inherit;
        animation:flxSlideUp .25s ease;
      }
      #flx-alert-modal h4 { margin:0 0 8px; font-size:17px; font-weight:900; color:#0f172a; }
      .flx-alert-dest { color:#2563eb; font-weight:900; }
      .flx-alert-current { font-size:13px; color:#64748b; margin-bottom:16px; }
      .flx-alert-input-row {
        display:flex; gap:10px; align-items:center; margin-bottom:16px;
      }
      .flx-alert-input-row input {
        flex:1; padding:10px 14px; border:2px solid #e2e8f0; border-radius:12px;
        font-size:16px; font-weight:900; font-family:inherit; outline:none;
        color:#0f172a; transition:border-color .2s;
      }
      .flx-alert-input-row input:focus { border-color:#2563eb; }
      .flx-alert-currency { font-size:18px; font-weight:900; color:#64748b; }
      .flx-alert-btns { display:flex; gap:10px; }
      .flx-alert-ok {
        flex:1; padding:11px; border-radius:12px; border:none;
        background:linear-gradient(135deg,#f59e0b,#d97706); color:white;
        font-family:inherit; font-size:14px; font-weight:800; cursor:pointer;
      }
      .flx-alert-cancel {
        padding:11px 18px; border-radius:12px; border:1.5px solid #e2e8f0;
        background:white; font-family:inherit; font-size:14px; cursor:pointer; color:#64748b;
      }
      .flx-alert-active-list { font-size:12px; color:#64748b; margin-bottom:14px; }
      .flx-alert-remove { 
        display:inline-block; color:#ef4444; cursor:pointer; margin-left:6px;
        font-weight:900; font-size:13px;
      }
    `;
    if (!document.getElementById("flx-alert-styles")) { s.id="flx-alert-styles"; document.head.appendChild(s); }

    if (hasAlert) btn.classList.add("active");

    btn.onclick = (e) => {
      e.stopPropagation();
      document.getElementById("flx-alert-modal-overlay")?.remove();

      const currency = String(f.price).replace(/[\d.,\s]/g,"").trim()||"€";
      const currentAlerts = getPriceAlerts();
      const existing = currentAlerts.find(a => a.id === f.id);

      const overlay = document.createElement("div");
      overlay.id = "flx-alert-modal-overlay";
      overlay.innerHTML = `
        <div id="flx-alert-modal">
          <h4>🔔 Alertă de preț</h4>
          <div class="flx-alert-current">
            <span class="flx-alert-dest">✈ ${esc(f.dest)}</span> — preț curent: <strong>${f.price}</strong>
          </div>
          ${existing ? `<div class="flx-alert-active-list">
            ✅ Alertă activă: sub <strong>${currency}${existing.threshold}</strong>
            <span class="flx-alert-remove" id="flx-alert-del">✕ Șterge</span>
          </div>` : ""}
          <p style="font-size:13px;color:#475569;margin:0 0 12px;">Notifică-mă când prețul scade sub:</p>
          <div class="flx-alert-input-row">
            <span class="flx-alert-currency">${currency}</span>
            <input type="number" id="flx-alert-threshold" min="1" max="9999"
              value="${existing ? existing.threshold : Math.round(f.priceNum * 0.9)}"
              placeholder="${Math.round(f.priceNum * 0.9)}">
          </div>
          <div class="flx-alert-btns">
            <button class="flx-alert-cancel" id="flx-alert-cancel">Anulează</button>
            <button class="flx-alert-ok" id="flx-alert-save">🔔 Activează alerta</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      overlay.onclick = e => { if (e.target===overlay) overlay.remove(); };
      overlay.querySelector("#flx-alert-cancel").onclick = () => overlay.remove();
      overlay.querySelector("#flx-alert-del")?.addEventListener("click", () => {
        savePriceAlerts(getPriceAlerts().filter(a => a.id !== f.id));
        btn.innerHTML = "🔕"; btn.classList.remove("active");
        btn.title = "Setează alertă de preț";
        overlay.remove();
        toast("Alertă eliminată", "info");
      });
      overlay.querySelector("#flx-alert-save").onclick = () => {
        const val = parseInt(overlay.querySelector("#flx-alert-threshold").value);
        if (!val || val < 1) { toast("Introdu un preț valid!", "info"); return; }
        const all = getPriceAlerts().filter(a => a.id !== f.id);
        all.push({ id: f.id, dest: f.dest, threshold: val, currentPrice: f.priceNum, agency: f.agency, date: f.date });
        savePriceAlerts(all);
        btn.innerHTML = "🔔"; btn.classList.add("active");
        btn.title = `Alertă activă: sub ${currency}${val}`;
        overlay.remove();
        toast(`🔔 Alertă setată: ${f.dest} sub ${currency}${val}`, "success");
      };
    };

    container.appendChild(btn);
  };

  const checkPriceAlerts = () => {
    const alerts = getPriceAlerts();
    if (!alerts.length) return;
    alerts.forEach(alert => {
      const f = flightsGlobal.find(x => x.id === alert.id);
      if (!f) return;
      if (f.priceNum < alert.threshold) {
        const currency = String(f.price).replace(/[\d.,\s]/g,"").trim()||"€";
        const t = document.createElement("div");
        t.className = "flx-toast flx-toast-success flx-toast-price-drop";
        t.innerHTML = `🔔 ALERTĂ: ${f.dest} a scăzut la ${f.price} (sub ${currency}${alert.threshold})!`;
        toastWrap?.appendChild(t);
        setTimeout(() => t.remove(), 5000);
        // Marcăm ca notificat (resetăm threshold-ul la 0 temporar)
        const updated = getPriceAlerts().map(a => a.id === alert.id ? {...a, lastNotified: Date.now()} : a);
        savePriceAlerts(updated);
      }
    });
  };

  const injectAlertButtons = (flights) => {
    flights.forEach(f => {
      const lastTd = f.tr.querySelector("td:last-child");
      if (!lastTd) return;
      buildPriceAlertButton(f, lastTd);
    });
    setInterval(checkPriceAlerts, 90_000);
  };

  /* ───────────────────────────────────────────────────────────────
     AJAX NOU 6 — STATISTICI LIVE ENHANCED în Stats Bar
     Arată nr. zboruri vizibile, preț mediu, economie față de max
  ─────────────────────────────────────────────────────────────────*/
  const updateStatsBarEnhanced = () => {
    const bar = document.getElementById("flx-stats-bar");
    if (!bar) return;

    const visible = flightsGlobal.filter(f => f.tr.style.display !== "none");
    if (!visible.length) { bar.classList.remove("visible"); return; }

    const prices  = visible.map(f => f.priceNum).filter(p => p > 0);
    const avg     = prices.length ? Math.round(prices.reduce((a,b)=>a+b,0)/prices.length) : 0;
    const minP    = prices.length ? Math.min(...prices) : 0;
    const maxP    = prices.length ? Math.max(...prices) : 0;
    const saved   = maxP - minP;
    const dests   = new Set(visible.map(f => f.dest)).size;
    const favCount = FavStore.get().length;
    const currency = prices.length ? (String(flightsGlobal[0]?.price||"€").replace(/[\d.,\s]/g,"").trim()||"€") : "€";

    bar.innerHTML = `
      <div class="flx-stat-item">✈ <strong>${visible.length}</strong> zboruri</div>
      <div class="flx-stat-sep">·</div>
      <div class="flx-stat-item">🌍 <strong>${dests}</strong> destinații</div>
      <div class="flx-stat-sep">·</div>
      <div class="flx-stat-item">💶 Avg <strong>${currency}${avg}</strong></div>
      <div class="flx-stat-sep">·</div>
      <div class="flx-stat-item" style="color:#4ade80;">💰 Min <strong>${currency}${minP}</strong></div>
      ${saved > 0 ? `<div class="flx-stat-sep">·</div><div class="flx-stat-item" style="color:#fbbf24;">🎯 Economie max <strong>${currency}${saved}</strong></div>` : ""}
      ${favCount > 0 ? `<div class="flx-stat-sep">·</div><div class="flx-stat-item">❤️ <strong>${favCount}</strong> fav</div>` : ""}
    `;
    bar.classList.add("visible");
  };

  /* ───────────────────────────────────────────────────────────────
     AJAX NOU 7 — GRAFIC PREȚURI per destinație (sparkline SVG)
     Apare pe coloana de preț ca mini-grafic când ai mai multe date
  ─────────────────────────────────────────────────────────────────*/
  const buildDestSparklines = (flights) => {
    const s = document.createElement("style");
    s.textContent = `
      .flx-sparkline-wrap {
        display:flex; align-items:center; gap:6px; margin-top:3px;
      }
      .flx-sparkline-svg { display:block; }
      .flx-sparkline-label { font-size:9px; color:#94a3b8; font-weight:700; white-space:nowrap; }
    `;
    document.head.appendChild(s);

    // Grupăm prețurile per destinație
    const destPrices = {};
    flights.forEach(f => {
      if (!destPrices[f.dest]) destPrices[f.dest] = [];
      destPrices[f.dest].push(f.priceNum);
    });

    flights.forEach(f => {
      const prices = destPrices[f.dest];
      if (!prices || prices.length < 2) return;

      const priceWrap = f.tr.querySelector(".flx-price-text")?.parentElement;
      if (!priceWrap || priceWrap.querySelector(".flx-sparkline-wrap")) return;

      const minP = Math.min(...prices);
      const maxP = Math.max(...prices);
      const range = maxP - minP || 1;

      // Creem sparkline SVG 40×16
      const W = 40, H = 16;
      const pts = prices.slice(0, 8).map((p, i, arr) => {
        const x = (i / (arr.length - 1)) * W;
        const y = H - ((p - minP) / range) * (H - 2) - 1;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");

      // Culoare bazată pe poziția prețului curent
      const pct = range > 0 ? (f.priceNum - minP) / range : 0.5;
      const color = pct < 0.33 ? "#22c55e" : pct < 0.66 ? "#f59e0b" : "#ef4444";

      const wrap = document.createElement("div");
      wrap.className = "flx-sparkline-wrap";
      wrap.title = `Prețuri spre ${f.dest}: min €${Math.round(minP)} — max €${Math.round(maxP)}`;
      wrap.innerHTML = `
        <svg class="flx-sparkline-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
          <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      priceWrap.appendChild(wrap);
    });
  };

  /* ───────────────────────────────────────────────────────────────
     CLEANUP AJAX
  ─────────────────────────────────────────────────────────────────*/
  const cleanupAjax = () => {
    if (liveStatusTimer)  { clearInterval(liveStatusTimer);  liveStatusTimer  = null; }
    if (priceUpdateTimer) { clearInterval(priceUpdateTimer); priceUpdateTimer = null; }
    ["flx-ticker-bar","flx-weather-panel","flx-rates-widget","flx-ajax-styles"].forEach(id =>
      document.getElementById(id)?.remove()
    );
    document.body.classList.remove("has-ticker");
  };

  /* ================================================================
     SFÂRŞIT ELEMENTE AJAX
     ================================================================ */

  /* ===== INIT ===== */
  const init = () => {
    const flights = parseFlights();
    if (!flights.length) return;
    const maxPrice = Math.max(...flights.map(f => f.priceNum));
    maxPriceGlobal = maxPrice;
    flightsGlobal  = flights;

    injectStyles();
    buildWidget(flights, maxPrice);
    buildFilterPanel(flights, maxPrice);
    buildFavPanel();
    buildWatchPanel();
    buildTicketPanel();
    buildCalendar(flights);
    addStarsToRows(flights);
    buildPaxPicker();

    // Render inițial
    renderCompanyReviews();

    // Evenimente pentru widget
    document.getElementById("flx-fil-dest").addEventListener("change", function () {
      const v = document.getElementById("flx-to-val");
      v.textContent = this.value || "Orice destinație";
      v.classList.toggle("placeholder", !this.value);
    });

    document.getElementById("flx-swap").onclick = () => {
      const fv = document.getElementById("flx-from-val");
      const ts = document.getElementById("flx-fil-dest");
      const tv = document.getElementById("flx-to-val");
      if (ts.value) { const tmp = fv.textContent; fv.textContent = tv.textContent; tv.textContent = tmp; tv.classList.remove("placeholder"); }
    };

    document.getElementById("flx-search-btn").onclick = () => {
      flxSelectedHour = flxPendingHour;
      flxSelectedDate = flxPendingDate;
      applyFilters();
    };

    // ── NAVBAR ORIZONTAL ──
    const navbar = document.createElement("div");
    navbar.id = "flx-navbar";
    navbar.innerHTML = `
      <button class="flx-nav-item" id="flx-nav-filtre" title="Filtre avansate">
        <span class="flx-nav-icon">⚙️</span>
        <span class="flx-nav-label">Filtre</span>
      </button>
      <button class="flx-nav-item" id="flx-nav-fav" title="Zboruri favorite">
        <span class="flx-nav-icon">❤️</span>
        <span class="flx-nav-label">Favorite</span>
        <span class="flx-nav-badge" id="flx-fav-badge"></span>
      </button>
      <div id="flx-nav-search-wrap">
        <button id="flx-nav-search-btn" title="Caută zboruri">🔍</button>
        <span id="flx-nav-search-label">Caută</span>
      </div>
      <button class="flx-nav-item" id="flx-nav-watch" title="Zboruri urmărite">
        <span class="flx-nav-icon">⭐</span>
        <span class="flx-nav-label">Urmărite</span>
        <span class="flx-nav-badge" id="flx-watch-badge"></span>
      </button>
      <button class="flx-nav-item" id="flx-nav-bilete" title="Biletele mele">
        <span class="flx-nav-icon">🎫</span>
        <span class="flx-nav-label">Bilete</span>
        <span class="flx-nav-badge" id="flx-ticket-badge"></span>
        <span id="flx-nav-live-dot"></span>
      </button>
      <button class="flx-nav-item" id="flx-nav-map" title="Hartă destinații">
        <span class="flx-nav-icon">🗺️</span>
        <span class="flx-nav-label">Hartă</span>
      </button>
    `;
    document.body.appendChild(navbar);
    document.body.classList.add("has-navbar");

    // Stats bar deasupra navbarului
    const statsBar = document.createElement("div");
    statsBar.id = "flx-stats-bar";
    document.body.appendChild(statsBar);

    const closeAllPanels = () => {
      filterPanel?.classList.remove("open");
      favPanel?.classList.remove("open");
      watchPanel?.classList.remove("open");
      ticketPanel?.classList.remove("open");
      document.querySelectorAll(".flx-nav-item").forEach(b => b.classList.remove("active"));
    };

    const togglePanel = (panel, renderFn, btnId) => {
      const isOpen = panel?.classList.contains("open");
      closeAllPanels();
      if (!isOpen && panel) {
        panel.classList.add("open");
        renderFn?.();
        document.getElementById(btnId)?.classList.add("active");
      }
    };

    document.getElementById("flx-nav-filtre").onclick = () =>
      togglePanel(filterPanel, null, "flx-nav-filtre");

    document.getElementById("flx-nav-fav").onclick = () =>
      togglePanel(favPanel, renderFavPanel, "flx-nav-fav");

    document.getElementById("flx-nav-watch").onclick = () =>
      togglePanel(watchPanel, renderWatchPanel, "flx-nav-watch");

    document.getElementById("flx-nav-bilete").onclick = () =>
      togglePanel(ticketPanel, renderTicketPanel, "flx-nav-bilete");

    document.getElementById("flx-nav-map")?.addEventListener("click", () => {
      const mapPanel = document.getElementById("flx-destmap-panel");
      if (!mapPanel) return;
      const isOpen = mapPanel.classList.contains("open");
      closeAllPanels();
      if (!isOpen) {
        mapPanel.classList.add("open");
        document.getElementById("flx-nav-map").classList.add("active");
      }
    });

    document.getElementById("flx-nav-search-btn").onclick = () => {
      closeAllPanels();
      const widget = document.getElementById("flx-search-widget");
      if (widget) {
        widget.scrollIntoView({ behavior:"smooth", block:"start" });
        widget.style.transition = "box-shadow .3s";
        widget.style.boxShadow = "0 0 0 3px rgba(37,99,235,.55), 0 8px 40px rgba(37,99,235,.3)";
        setTimeout(() => { if(widget) widget.style.boxShadow = ""; }, 1200);
      }
      flxSelectedHour = flxPendingHour;
      flxSelectedDate = flxPendingDate;
      applyFilters();
    };

    // Hook stats bar la fiecare filtrare
    const _baseApply = applyFilters;
    applyFilters = function() { _baseApply(); updateStatsBarEnhanced(); };

    updateBadges();

    // ── AJAX features: live status, prețuri, vreme, cursuri ──
    initAjaxFeatures(flights).catch(() => {});

    // Evidențiere zbor din URL params
    const highlightFlightById = (id, label) => {
      setTimeout(() => {
        const target = flightsGlobal.find(f => f.id === id);
        if (target) {
          // Resetăm toate filtrele și afișăm toate zborurile
          flightsGlobal.forEach(f => showRow(f.tr));
          syncSections();
          // Scroll și highlight
          target.tr.scrollIntoView({ behavior:"smooth", block:"center" });
          target.tr.style.background = "rgba(37,99,235,0.12)";
          target.tr.style.boxShadow  = "0 0 0 3px rgba(37,99,235,0.35)";
          target.tr.style.borderRadius = "16px";
          setTimeout(() => {
            target.tr.style.background  = "";
            target.tr.style.boxShadow   = "";
          }, 2500);
          const cb = document.getElementById("flx-count-bar");
          if (cb) { cb.style.display = "none"; }
          return true;
        }
        return false;
      }, 300);
    };

    // Verificăm sessionStorage pentru highlight după navigare hash
    const hlId   = sessionStorage.getItem("flx_highlight_id");
    const hlType = sessionStorage.getItem("flx_highlight_type");
    const hlDest = sessionStorage.getItem("flx_highlight_dest");
    if (hlId) {
      sessionStorage.removeItem("flx_highlight_id");
      sessionStorage.removeItem("flx_highlight_type");
      sessionStorage.removeItem("flx_highlight_dest");
      highlightFlightById(hlId, hlType || "salvat");
      if (hlDest) toast(`Zbor spre ${hlDest} găsit ✈`, "success");
    }
  };

  /* ===== CLEANUP + BOOT ===== */
  const cleanup = () => {
    cleanupAjax();
    [
      "flx-search-widget", "flx-corner-btns",
      "flx-filter-panel",  "flx-fav-panel",
      "flx-watch-panel",   "flx-ticket-panel",
      "flx-purchase-overlay", "flx-toasts"
    ].forEach(id => document.getElementById(id)?.remove());
    toastWrap = null;
  };

  const boot = () => {
    if (document.body.dataset.page !== "zboruri") return;
    if (!document.querySelector("table")) return;
    cleanup();
    init();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("spa:render", boot);

})();