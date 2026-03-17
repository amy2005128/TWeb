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
      #flx-tabs { display:flex; margin-bottom:20px; border-bottom:2px solid #f1f5f9; }
      .flx-tab {
        padding:10px 22px; font-family:inherit; font-size:15px; font-weight:700;
        color:#94a3b8; background:none; border:none; cursor:pointer;
        border-bottom:2px solid transparent; margin-bottom:-2px; transition:color .2s,border-color .2s;
      }
      .flx-tab.active { color:#0f172a; border-bottom-color:#0f172a; }

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

      /* SIDE PANEL — filtre separate de favorite */
      #flx-corner-btns {
        position:fixed; bottom:24px; right:24px; z-index:888;
        display:flex; gap:10px; align-items:center;
      }
      #flx-side-btn, #flx-fav-btn, #flx-watch-btn {
        width:56px; height:56px; border-radius:999px; border:none;
        background:linear-gradient(135deg,#2563eb,#1d4ed8); color:white;
        font-size:22px; cursor:pointer; box-shadow:0 8px 25px rgba(37,99,235,.40);
        display:grid; place-items:center; transition:transform .2s,box-shadow .2s; position:relative;
      }
      #flx-side-btn:hover, #flx-fav-btn:hover, #flx-watch-btn:hover { transform:scale(1.1); box-shadow:0 12px 32px rgba(37,99,235,.50); }
      #flx-fav-badge, #flx-watch-badge {
        position:absolute; top:-4px; right:-4px; width:20px; height:20px;
        border-radius:999px; background:white; color:#2563eb; font-size:11px;
        font-weight:900; display:none; place-items:center; border:2px solid #2563eb;
      }
      #flx-watch-badge { color:#2563eb; border-color:#2563eb; }

      /* Panel filtre */
      #flx-filter-panel {
        position:fixed; top:0; right:-420px; width:400px; height:100vh;
        background:white; z-index:9999; box-shadow:-8px 0 40px rgba(0,0,0,.15);
        transition:right .35s cubic-bezier(.4,0,.2,1);
        display:flex; flex-direction:column; font-family:inherit;
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

      /* Panel favorite */
      #flx-fav-panel {
        position:fixed; top:0; right:-420px; width:400px; height:100vh;
        background:#f8fafc; z-index:9999; box-shadow:-8px 0 40px rgba(0,0,0,.15);
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

      /* Panou urmărite */
      #flx-watch-panel {
        position:fixed; top:0; right:-420px; width:400px; height:100vh;
        background:#f8fafc; z-index:9999; box-shadow:-8px 0 40px rgba(0,0,0,.15);
        transition:right .35s cubic-bezier(.4,0,.2,1);
        display:flex; flex-direction:column; font-family:inherit;
      }
      #flx-watch-panel.open { right:0; }
      #flx-watch-panel-header {
        padding:20px 20px 16px;
        background:linear-gradient(135deg,#2563eb,#1d4ed8);
        display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
      }
      #flx-watch-panel-header h3 { margin:0; font-size:18px; font-family:inherit; color:white; font-weight:900; }
      #flx-watch-panel-close {
        background:rgba(255,255,255,0.2); border:none; font-size:18px; cursor:pointer;
        color:white; width:32px; height:32px; border-radius:50%;
        display:grid; place-items:center; transition:background .2s;
      }
      #flx-watch-panel-close:hover { background:rgba(255,255,255,0.35); }
      #flx-watch-panel-body { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; }

      .flx-filter-row { display:flex; flex-direction:column; gap:5px; }
      .flx-filter-row label { font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:.5px; }
      .flx-price-row { display:flex; align-items:center; gap:8px; }
      .flx-price-row input[type=range] { flex:1; accent-color:#2563eb; }
      #flx-price-val { font-size:13px; font-weight:800; color:#2563eb; min-width:52px; text-align:right; }
      #flx-reset-link {
        background:none; border:none; font-family:inherit;
        font-size:13px; font-weight:700; color:#94a3b8; cursor:pointer; padding:8px 0;
        transition:color .15s; text-align:center; width:100%;
      }
      #flx-reset-link:hover { color:#ef4444; }

      /* ACCORDION */
      .flx-acc-section {
        background: white; border-radius: 14px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        overflow: hidden; margin-bottom: 8px;
      }
      .flx-acc-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 13px 15px; cursor: pointer;
        transition: background .15s; user-select: none;
      }
      .flx-acc-header:hover { background: #f1f5f9; }
      .flx-acc-header-left { display: flex; align-items: center; gap: 9px; }
      .flx-acc-icon { font-size: 16px; }
      .flx-acc-title { font-size: 14px; font-weight: 800; color: #0f172a; }
      .flx-acc-count {
        font-size: 11px; font-weight: 900; padding: 2px 8px; border-radius: 999px;
        background: #dbeafe; color: #2563eb; border: 1px solid #bfdbfe;
      }
      .flx-acc-arrow {
        font-size: 12px; color: #94a3b8; transition: transform .3s ease; display: inline-block;
      }
      .flx-acc-section.open .flx-acc-arrow { transform: rotate(180deg); }
      .flx-acc-body {
        max-height: 0; overflow: hidden;
        transition: max-height .35s cubic-bezier(.4,0,.2,1);
      }
      .flx-acc-section.open .flx-acc-body {
        max-height: 500px; border-top: 1px solid #f1f5f9;
      }
      .flx-acc-inner { padding: 8px; display: flex; flex-direction: column; gap: 7px; }
      .flx-acc-empty { text-align:center; color:#94a3b8; padding:16px; font-size:12px; line-height:1.8; }

      /* CARD ITEM */
      .flx-fav-item {
        background:#f8fafc; border:1px solid #e2e8f0; border-radius:14px;
        padding:14px 16px; display:flex; align-items:center; justify-content:space-between;
        cursor:pointer; transition:background .15s,border-color .15s; margin-bottom:0;
      }
      .flx-fav-item:hover { background:#eff6ff; border-color:#93c5fd; transform:translateX(-2px); }
      .flx-fav-item-name { font-weight:800; font-size:14px; color:#0f172a; }
      .flx-fav-item-sub { font-size:12px; color:#94a3b8; font-weight:500; margin-top:2px; }
      .flx-fav-remove { background:none; border:none; font-size:16px; cursor:pointer; color:#94a3b8; flex-shrink:0; padding:4px; }
      .flx-fav-remove:hover { color:#ef4444; }

      /* URMĂRITE */
      .flx-watch-item {
        background: linear-gradient(135deg,#fefce8,#fef9c3);
        border: 1px solid #fde047; border-radius: 12px;
        padding: 11px 13px; display: flex; align-items: flex-start; justify-content: space-between;
        font-family: inherit; cursor: pointer;
        transition: border-color .15s, transform .15s;
      }
      .flx-watch-item:hover { border-color: #facc15; transform: translateX(-2px); }
      .flx-watch-item-name { font-weight: 800; font-size: 13px; color: #713f12; }
      .flx-watch-item-sub { font-size: 11px; color: #92400e; font-weight: 500; margin-top: 2px; }
      .flx-watch-price { font-size: 13px; font-weight: 900; color: #15803d; white-space: nowrap; margin-left: 6px; flex-shrink: 0; }
      .flx-watch-remove {
        background: none; border: none; font-size: 13px; cursor: pointer;
        color: #d97706; padding: 2px 4px; border-radius: 5px; flex-shrink: 0;
        transition: color .15s, background .15s;
      }
      .flx-watch-remove:hover { color: #ef4444; background: #fee2e2; }

      /* STAR */
      .flx-fav-star {
        background:none; border:none; font-size:18px; cursor:pointer;
        padding:0 4px; line-height:1; transition:transform .2s; flex-shrink:0;
      }
      .flx-fav-star:hover { transform:scale(1.3); }

      /* TOASTS */
      #flx-toasts { position:fixed; bottom:90px; right:24px; z-index:99998; display:flex; flex-direction:column; gap:8px; pointer-events:none; }
      .flx-toast { padding:11px 18px; border-radius:12px; font-size:14px; font-weight:700; color:white; font-family:inherit; box-shadow:0 8px 25px rgba(0,0,0,.15); animation:flxIn .3s ease, flxOut .4s ease 2.3s forwards; }
      .flx-toast-success { background:linear-gradient(135deg,#059669,#047857); }
      .flx-toast-info    { background:linear-gradient(135deg,#2563eb,#1d4ed8); }
      @keyframes flxIn  { from{transform:translateX(120%);opacity:0} to{transform:translateX(0);opacity:1} }
      @keyframes flxOut { to{transform:translateX(120%);opacity:0} }
    `;
    document.head.appendChild(s);
  };

  /* ===== TOAST ===== */
  let toastWrap;
  const toast = (msg, type="success") => {
    if (!toastWrap) { toastWrap = document.createElement("div"); toastWrap.id="flx-toasts"; document.body.appendChild(toastWrap); }
    const el = document.createElement("div");
    el.className = `flx-toast flx-toast-${type}`;
    el.textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  };

  /* ===== HELPER: redirect sigur — validează href înainte ===== */
  const cleanHref = (v) => (!v || v === "undefined" || v === "null" || v.trim() === "" || v.trim() === "#") ? "" : v.trim();

  const safeRedirect = (href, fallbackMsg) => {
    if (!href || href === "undefined" || href === "null" || href.trim() === "" || href.trim() === "#") {
      toast(fallbackMsg || "Link indisponibil — pagina nu a putut fi găsită.", "info");
      return;
    }
    window.location.href = href;
  };

  /* ===== HELPER: țara sursă a paginii curente ===== */
  const getPageCountry = () => {
    // 1. Element explicit cu data-tara
    const el = document.querySelector("[data-tara]");
    if (el) return el.dataset.tara.trim();
    // 2. Meta tag <meta name="tara" content="...">
    const meta = document.querySelector("meta[name='tara']");
    if (meta) return meta.content.trim();
    // 3. Extrage din H1 — elimină codul aeroport "(OTP)" și "Zboruri din "
    const h1 = document.querySelector("h1")?.textContent || "";
    return h1
      .replace(/\s*\(.*?\)\s*/g, "")   // scoate (OTP), (CLJ) etc.
      .replace(/^zboruri\s+din\s+/i, "") // scoate "Zboruri din "
      .replace(/^zboruri\s+/i, "")       // scoate "Zboruri "
      .trim();
  };

  /* ===== HELPER: afișează ruta "Țara sursă → Țara destinație" ===== */
  /* Map coduri aeroport IATA -> tara (fallback zboruri vechi) */
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
    const m = (str||"").match(/\(([A-Z]{3})\)/);
    return m ? m[1] : null;
  };

  const getFlightRoute = (f) => {
    if (f.fromCountry && f.toCountry) return f.fromCountry + " \u2192 " + f.toCountry;
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
    if (from && to) return from + " \u2192 " + to;
    return to || from || "Zbor necunoscut";
  };


  /* ===== FAVORITE STORE ===== */
  const FavStore = {
    get: ()    => JSON.parse(localStorage.getItem("flx_fav_zboruri")||"[]"),
    save: (a)  => localStorage.setItem("flx_fav_zboruri", JSON.stringify(a)),
    add(item)  { const f=this.get(); if(!f.find(x=>x.id===item.id)){f.push(item);this.save(f);return true;} return false; },
    remove(id) { this.save(this.get().filter(x=>x.id!==id)); },
    has(id)    { return this.get().some(x=>x.id===id); }
  };
  const WatchStore = {
    get: ()    => JSON.parse(localStorage.getItem("flx_watch_zboruri") || "[]"),
    save: (a)  => localStorage.setItem("flx_watch_zboruri", JSON.stringify(a)),
    add(item)  {
      const w = this.get();
      if(!w.find(x => x.id === item.id)){
        w.push(item);
        this.save(w);
        return true;
      }
      return false;
    },
    has(id) { return this.get().some(x => x.id === id); },
    remove(id) { this.save(this.get().filter(x => x.id !== id)); }
  };

  const TariStore = {
    get: () => JSON.parse(localStorage.getItem("flx_favorites") || "[]"),
  };

  const AeroportStore = {
    get: () => JSON.parse(localStorage.getItem("flx_fav_aeroport") || "[]"),
  };

  /* ===== STATE ===== */
  let filterPanel, favPanel, watchPanelEl;
  let flxSelectedHour = "";
  let flxSelectedDate = null;
  let flxCalYear, flxCalMonth;
  let maxPriceGlobal = 0;
  let flightsGlobal  = [];
  let flxPendingHour = "";
  let flxPendingDate = null;

  /* ===== VISIBILITY HELPERS ===== */
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
    const agencyTx = (document.getElementById("flx-agency-val")?.textContent||"").trim();
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
        if (hour==="morning"   && !(h>=6  && h<12)) show=false;
        if (hour==="afternoon" && !(h>=12 && h<18)) show=false;
        if (hour==="evening"   && !(h>=18))          show=false;
        if (hour==="night"     && !(h>=0  && h<6))  show=false;
      }
      if (dateV) {
        const [yr,mo,dy] = dateV.split("-");
        if (f.date !== `${dy}.${mo}.${yr}`) show = false;
      }
      if (show) { showRow(f.tr); visible++; }
      else        hideRow(f.tr);
    });

    syncSections();

    const countBar = document.getElementById("flx-count-bar");
    if (countBar) {
      const hasFilter = dest || agency || hour || dateV || parseFloat(document.getElementById("flx-fil-price")?.value) < maxPriceGlobal;
      countBar.style.display = hasFilter ? "block" : "none";
      if (hasFilter) countBar.innerHTML = `<span>${visible}</span> din ${flightsGlobal.length} zboruri găsite`;
    }
  }

  /* ===== WIDGET SEARCH ===== */
  const buildWidget = (flights, maxPrice) => {
    const dests = [...new Set(flights.map(f=>f.dest))].sort();
    const h1Text = document.querySelector("h1")?.textContent||"";
    const airM = h1Text.match(/\(([A-Z]{3})\)/);
    const airName = h1Text.replace(/\(.*\)/,"").trim();

    const widget = document.createElement("div");
    widget.id = "flx-search-widget";
    widget.innerHTML = `
      <div id="flx-main-row">
        <div class="flx-field">
          <span>🛫</span>
          <div class="flx-field-inner">
            <span class="flx-field-label">De la</span>
            <span class="flx-field-val" id="flx-from-val">${airName}${airM?` (${airM[1]})`:""}</span>
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
            ${dests.map(d=>`<option value="${d}">${d}</option>`).join("")}
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
      const [d,m,y] = f.date.split(".");
      return `${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;
    }));

    const render = () => {
      const MONTHS=["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"];
      const DAYS=["Lu","Ma","Mi","Jo","Vi","Sâ","Du"];
      const firstDay = new Date(flxCalYear,flxCalMonth,1).getDay();
      const offset   = firstDay===0 ? 6 : firstDay-1;
      const daysInM  = new Date(flxCalYear,flxCalMonth+1,0).getDate();
      const daysInP  = new Date(flxCalYear,flxCalMonth,0).getDate();
      const todayMs  = new Date().setHours(0,0,0,0);

      let cells="";
      for(let i=offset-1;i>=0;i--) cells+=`<div class="flx-cal-day other">${daysInP-i}</div>`;
      for(let d=1;d<=daysInM;d++){
        const dd=String(d).padStart(2,"0"), mm=String(flxCalMonth+1).padStart(2,"0");
        const ds=`${flxCalYear}-${mm}-${dd}`;
        const isPast = new Date(flxCalYear,flxCalMonth,d)<todayMs;
        const hasFl  = flightDates.has(ds);
        cells+=`<div class="flx-cal-day${flxSelectedDate===ds?" selected":""}${hasFl?" has-flight":""}${isPast?" past":""}" data-date="${ds}">${d}${hasFl?'<span class="flx-dot"></span>':""}</div>`;
      }
      for(let d=1;d<=42-offset-daysInM;d++) cells+=`<div class="flx-cal-day other">${d}</div>`;

      popup.innerHTML=`
        <div id="flx-cal-inner">
          <div id="flx-cal-nav">
            <button id="flx-cal-prev">‹</button>
            <span id="flx-cal-title">${MONTHS[flxCalMonth]} ${flxCalYear}</span>
            <button id="flx-cal-next">›</button>
          </div>
          <div id="flx-cal-days-hdr">${DAYS.map(d=>`<div>${d}</div>`).join("")}</div>
          <div id="flx-cal-grid">${cells}</div>
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid #f1f5f9;">
            <input id="flx-cal-type" type="text" placeholder="Tastează data: ZZ.LL.AAAA"
              style="width:100%;box-sizing:border-box;padding:9px 12px;border:1.5px solid #e2e8f0;
              border-radius:10px;font-family:inherit;font-size:13px;outline:none;"
              value="${flxSelectedDate ? (()=>{const[y,m,d]=flxSelectedDate.split('-');return `${d}.${m}.${y}`;})() : ''}">
          </div>
          <div id="flx-cal-footer" style="flex-direction:row;justify-content:space-between;">
            <div style="display:flex;justify-content:space-between;width:100%;">
              <button id="flx-cal-clear">✕ Șterge data</button>
              <button id="flx-cal-close">Închide</button>
            </div>
          </div>
        </div>`;

      document.getElementById("flx-cal-prev").onclick=e=>{e.stopPropagation();flxCalMonth--;if(flxCalMonth<0){flxCalMonth=11;flxCalYear--;}render();};
      document.getElementById("flx-cal-next").onclick=e=>{e.stopPropagation();flxCalMonth++;if(flxCalMonth>11){flxCalMonth=0;flxCalYear++;}render();};
      document.getElementById("flx-cal-clear").onclick=e=>{
        e.stopPropagation(); flxSelectedDate=null;
        document.getElementById("flx-date-val").textContent="Orice dată";
        document.getElementById("flx-date-val").classList.add("placeholder");
        flxPendingDate=null;
        popup.classList.remove("open");
      };
      document.getElementById("flx-cal-close").onclick=e=>{e.stopPropagation();popup.classList.remove("open");};

      const typeInp = document.getElementById("flx-cal-type");
      typeInp.addEventListener("click", e=>e.stopPropagation());
      typeInp.addEventListener("input", e=>{
        e.stopPropagation();
        const val = typeInp.value.trim();
        const m = val.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
        if(m){
          const [,d,mo,y]=m;
          const ds=`${y}-${mo}-${d}`;
          const dt=new Date(parseInt(y),parseInt(mo)-1,parseInt(d));
          if(!isNaN(dt.getTime())){
            flxSelectedDate=ds;
            flxPendingDate=ds;
            flxCalYear=dt.getFullYear();
            flxCalMonth=dt.getMonth();
            document.getElementById("flx-date-val").textContent=`${d}.${mo}.${y}`;
            document.getElementById("flx-date-val").classList.remove("placeholder");
            render();
          }
        }
        typeInp.style.borderColor = val.length===0||val.match(/^(\d{2})\.(\d{2})\.(\d{4})$/) ? "#e2e8f0" : "#ef4444";
      });
      popup.querySelectorAll(".flx-cal-day[data-date]").forEach(cell=>{
        if(cell.classList.contains("other")) return;
        cell.onclick=e=>{
          e.stopPropagation();
          flxSelectedDate=cell.dataset.date;
          const [y,m,d]=flxSelectedDate.split("-");
          document.getElementById("flx-date-val").textContent=`${d}.${m}.${y}`;
          document.getElementById("flx-date-val").classList.remove("placeholder");
          flxPendingDate=flxSelectedDate;
          popup.classList.remove("open");
        };
      });
    };

    trigger.onclick=e=>{e.stopPropagation();popup.classList.toggle("open");if(popup.classList.contains("open"))render();};
    document.addEventListener("click",()=>popup.classList.remove("open"));
    popup.addEventListener("click",e=>e.stopPropagation());
  };

  /* ===== PAX PICKER ===== */
  const buildPaxPicker = () => {
    const trigger = document.getElementById("flx-pax-field");
    const popup   = document.getElementById("flx-pax-popup");
    const valEl   = document.getElementById("flx-pax-val");
    const cats=[
      {key:"adults", label:"Adulți",     sub:"18+ ani",   min:1},
      {key:"seniors",label:"Pensionari", sub:"65+ ani",   min:0},
      {key:"teens",  label:"Adolescenți",sub:"14–17 ani", min:0},
      {key:"kids",   label:"Copii",      sub:"0–13 ani",  min:0},
    ];
    let cnt={adults:1,seniors:0,teens:0,kids:0};

    const upLabel=()=>{
      const t=Object.values(cnt).reduce((a,b)=>a+b,0);
      valEl.textContent=`${t} pasager${t!==1?"i":""}`;
    };
    const renderP=()=>{
      popup.innerHTML=cats.map(c=>`
        <div class="flx-pax-row">
          <div class="flx-pax-label">${c.label}<span>${c.sub}</span></div>
          <div class="flx-pax-controls">
            <button class="flx-pax-btn" data-a="minus" data-k="${c.key}" ${cnt[c.key]<=c.min?"disabled":""}>−</button>
            <div class="flx-pax-num"><input type="number" data-k="${c.key}" min="${c.min}" max="20" value="${cnt[c.key]}"></div>
            <button class="flx-pax-btn" data-a="plus" data-k="${c.key}" ${cnt[c.key]>=20?"disabled":""}>+</button>
          </div>
        </div>`).join("")+`<button class="flx-pax-done" id="flx-pax-done">Confirmă</button>`;
      popup.querySelectorAll(".flx-pax-btn").forEach(b=>{
        b.onclick=e=>{e.stopPropagation();const k=b.dataset.k,c=cats.find(x=>x.key===k);if(b.dataset.a==="minus"&&cnt[k]>c.min)cnt[k]--;if(b.dataset.a==="plus"&&cnt[k]<20)cnt[k]++;renderP();upLabel();};
      });
      popup.querySelectorAll("input").forEach(i=>{
        i.oninput=e=>{e.stopPropagation();const k=i.dataset.k,c=cats.find(x=>x.key===k),v=parseInt(i.value);if(!isNaN(v)&&v>=c.min&&v<=20){cnt[k]=v;upLabel();}};
        i.onclick=e=>e.stopPropagation();
      });
      document.getElementById("flx-pax-done").onclick=e=>{e.stopPropagation();popup.classList.remove("open");};
    };
    trigger.onclick=e=>{e.stopPropagation();popup.classList.toggle("open");if(popup.classList.contains("open"))renderP();};
    document.addEventListener("click",()=>popup.classList.remove("open"));
    popup.addEventListener("click",e=>e.stopPropagation());
  };

  /* ===== CUSTOM DROPDOWN ===== */
  const buildDropdown=(triggerId,popupId,valId,labels,onChange)=>{
    const trigger=document.getElementById(triggerId);
    const popup=document.getElementById(popupId);
    const valEl=document.getElementById(valId);
    if(!trigger||!popup)return;
    trigger.onclick=e=>{e.stopPropagation();popup.classList.toggle("open");trigger.classList.toggle("open");};
    document.addEventListener("click",()=>{popup.classList.remove("open");trigger.classList.remove("open");});
    popup.addEventListener("click",e=>e.stopPropagation());
    popup.querySelectorAll(".flx-cs-opt").forEach(opt=>{
      opt.onclick=()=>{
        const val=opt.dataset.value;
        valEl.textContent=labels[val]!==undefined?labels[val]:opt.textContent.trim();
        popup.querySelectorAll(".flx-cs-opt").forEach(o=>o.classList.toggle("selected",o===opt));
        popup.classList.remove("open");trigger.classList.remove("open");
        onChange(val);
      };
    });
  };

  /* ===== BADGE ===== */
  const updateFavBadge=()=>{
    const b=document.getElementById("flx-fav-badge");
    if(b){
      const n = TariStore.get().length + AeroportStore.get().length + FavStore.get().length;
      b.textContent=n; b.style.display=n>0?"grid":"none";
    }
    const wb=document.getElementById("flx-watch-badge");
    if(wb){
      const nw=WatchStore.get().length;
      wb.textContent=nw; wb.style.display=nw>0?"grid":"none";
    }
  };

  /* ===== PANOU FAVORITE (separat de filtre) ===== */
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

  const renderFavPanel = () => {
    const body = document.getElementById("flx-fav-body");
    if (!body) return;
    body.innerHTML = "";

    // ── Țări ──
    const tariSec = buildAccordionSection("🌍", "Țări favorite", "tari");
    body.appendChild(tariSec);
    const tari = TariStore.get();
    const tariCount = tariSec.querySelector("#flx-acc-cnt-tari");
    const tariInner = tariSec.querySelector("#flx-acc-inn-tari");
    tariCount.textContent = tari.length;
    if (!tari.length) {
      tariInner.innerHTML = `<div class="flx-acc-empty">🌍<br>Nicio țară salvată.</div>`;
    } else {
      tariInner.innerHTML = tari.map(f => `
        <div class="flx-fav-item" data-href="${cleanHref(f.href)}" style="cursor:pointer;">
          <div class="flx-fav-item-name" style="font-size:13px;">✈ ${f.name} <span style="font-size:10px;padding:2px 7px;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-weight:900;">${f.cod}</span></div>
          <span style="color:#94a3b8;font-size:12px;">→</span>
        </div>`).join("");
      tariInner.querySelectorAll(".flx-fav-item").forEach(item => {
        item.onclick = () => { safeRedirect(item.dataset.href, "Pagina acestei țări nu a putut fi găsită."); };
      });
    }

    const aeroSec = buildAccordionSection("🛬", "Aeroporturi favorite", "aero");
    body.appendChild(aeroSec);
    const aero = AeroportStore.get();
    const aeroCount = aeroSec.querySelector("#flx-acc-cnt-aero");
    const aeroInner = aeroSec.querySelector("#flx-acc-inn-aero");
    aeroCount.textContent = aero.length;
    if (!aero.length) {
      aeroInner.innerHTML = `<div class="flx-acc-empty">🛬<br>Niciun aeroport salvat.</div>`;
    } else {
      aeroInner.innerHTML = aero.map(f => `
        <div class="flx-fav-item" data-href="${cleanHref(f.href)}" style="cursor:pointer;">
          <div class="flx-fav-item-name" style="font-size:13px;">✈ ${f.name} <span style="font-size:10px;padding:2px 7px;border-radius:999px;background:rgba(56,189,248,0.18);border:1px solid rgba(56,189,248,0.35);color:#0f172a;font-weight:900;">${f.cod}</span></div>
          <span style="color:#94a3b8;font-size:12px;">→</span>
        </div>`).join("");
      aeroInner.querySelectorAll(".flx-fav-item").forEach(item => {
        item.onclick = () => { safeRedirect(item.dataset.href, "Pagina acestui aeroport nu a putut fi găsită."); };
      });
    }

    // ── Zboruri ──
    const zborSec = buildAccordionSection("🎫", "Zboruri favorite", "zbr");
    body.appendChild(zborSec);
    zborSec.classList.add("open");
    const favs = FavStore.get();
    const zbrCount = zborSec.querySelector("#flx-acc-cnt-zbr");
    const zbrInner = zborSec.querySelector("#flx-acc-inn-zbr");
    zbrCount.textContent = favs.length;
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
          // Caută zborul în pagina curentă
          const found = flightsGlobal.find(f => f.id === fid);
          if (!found) {
            // Nu suntem pe pagina cu acest zbor → redirect cu ID zbor
            safeRedirect(fav.pageUrl + "?flx_fav=" + encodeURIComponent(fid), "Pagina acestui zbor nu a putut fi găsită.");
            return;
          }
          // Suntem pe pagina corectă → afișează direct
          flxSelectedHour = ""; flxSelectedDate = null;
          const dv = document.getElementById("flx-date-val");
          const av = document.getElementById("flx-agency-val");
          const pr = document.getElementById("flx-fil-price");
          const pv = document.getElementById("flx-price-val");
          const ds = document.getElementById("flx-fil-dest");
          const tv = document.getElementById("flx-to-val");
          if (dv) { dv.textContent = "Orice dată"; dv.classList.add("placeholder"); }
          if (av) av.textContent = "Toate companiile";
          if (pr && pv) { pr.value = maxPriceGlobal; pv.textContent = `€${maxPriceGlobal}`; }
          if (ds && tv) { ds.value = ""; tv.textContent = "Orice destinație"; tv.classList.add("placeholder"); }
          document.querySelectorAll(".flx-cs-opt").forEach(o => o.classList.toggle("selected", o.dataset.value === ""));
          flightsGlobal.forEach(f => { if (f.id === fid) showRow(f.tr); else hideRow(f.tr); });
          syncSections();
          const cb = document.getElementById("flx-count-bar");
          if (cb) { cb.style.display = "block"; cb.innerHTML = `<span>1</span> zbor găsit (din favorite)`; }
          favPanel.classList.remove("open");
          toast(`Zbor spre ${fav.dest} afișat ✈`, "success");
        };
      });
      zbrInner.querySelectorAll(".flx-fav-remove").forEach(btn => {
        btn.onclick = e => {
          e.stopPropagation();
          FavStore.remove(btn.dataset.id);
          const star = document.querySelector(`.flx-fav-star[data-id="${btn.dataset.id}"]`);
          if (star) star.textContent = "♡";
          renderFavPanel();
          updateFavBadge();
          toast("Eliminat din favorite", "info");
        };
      });
    }

    updateFavBadge();
  };

  /* ===== PANOU URMĂRITE ===== */
  const renderWatchPanel = () => {
    const body = document.getElementById("flx-watch-panel-body");
    if (!body) return;
    const watches = WatchStore.get();

    if (!watches.length) {
      body.innerHTML = `<div style="text-align:center;color:#94a3b8;padding:60px 20px;font-size:15px;line-height:1.8;">⭐<br><br>Niciun zbor urmărit.<br>Apasă pe un rând din tabel.</div>`;
      return;
    }

    body.innerHTML = watches.map(w => {
      const route = getFlightRoute(w);
      return `
      <div class="flx-watch-item" data-id="${w.id}" data-href="${cleanHref(w.pageUrl)}">
        <div style="flex:1;min-width:0;">
          <div class="flx-watch-item-name">🔔 ${route}</div>
          <div class="flx-watch-item-sub">${w.date} · ${w.dep} → ${w.arr}</div>
          <div class="flx-watch-item-sub">${w.agency}</div>
        </div>
        <div style="display:flex;align-items:center;gap:5px;">
          <span class="flx-watch-price">${w.price}</span>
          <button class="flx-watch-remove" data-id="${w.id}" title="Oprește urmărirea">✕</button>
        </div>
      </div>`;
    }).join("");

    body.querySelectorAll(".flx-watch-item").forEach(item => {
      item.onclick = e => {
        if (e.target.closest(".flx-watch-remove")) return;
        const wid = item.dataset.id;
        const found = flightsGlobal.find(f => f.id === wid);
        if (found) {
          // Pe pagina curentă → afișează zborul direct
          flightsGlobal.forEach(f => { if(f.id===wid) showRow(f.tr); else hideRow(f.tr); });
          syncSections();
          watchPanelEl.classList.remove("open");
          found.tr.scrollIntoView({behavior:"smooth",block:"center"});
          found.tr.style.background = "rgba(250,204,21,0.15)";
          setTimeout(() => { found.tr.style.background=""; }, 3000);
          toast(`Zbor spre ${found.dest} afișat 🔔`,"success");
        } else if (item.dataset.href) {
          // Alt aeroport → redirect
          safeRedirect(item.dataset.href, "Pagina acestui zbor nu a putut fi găsită.");
        }
      };
    });
    body.querySelectorAll(".flx-watch-remove").forEach(btn => {
      btn.onclick = e => {
        e.stopPropagation();
        WatchStore.remove(btn.dataset.id);
        updateFavBadge();
        renderWatchPanel();
        toast("Urmărire oprită","info");
      };
    });
  };

  /* ===== PANEL FILTRE (doar filtre) ===== */
  const buildFilterPanel = (flights, maxPrice) => {
    const agencies = [...new Set(flights.map(f=>f.agency))].sort();
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
              ${agencies.map(a=>`<div class="flx-cs-opt" data-value="${a}">${a}</div>`).join("")}
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

    buildDropdown("flx-agency-trigger","flx-agency-popup","flx-agency-val",{"":"Toate companiile"},()=>{});
    buildDropdown("flx-hour-trigger","flx-hour-popup","flx-hour-val",
      {"":"Orice oră",morning:"Dimineață 06–12",afternoon:"Amiază 12–18",evening:"Seară 18–24",night:"Noapte 00–06"},
      val=>{flxPendingHour=val;});

    document.getElementById("flx-fil-price").addEventListener("input",function(){
      document.getElementById("flx-price-val").textContent=`€${this.value}`;
      applyFilters();
    });

    document.getElementById("flx-reset-link").onclick=()=>{
      flxSelectedHour=""; flxSelectedDate=null;
      document.getElementById("flx-hour-val").textContent="Orice oră";
      document.getElementById("flx-agency-val").textContent="Toate companiile";
      document.querySelectorAll("#flx-hour-popup .flx-cs-opt").forEach(o=>o.classList.toggle("selected",o.dataset.value===""));
      document.querySelectorAll("#flx-agency-popup .flx-cs-opt").forEach(o=>o.classList.toggle("selected",o.dataset.value===""));
      document.getElementById("flx-fil-price").value=maxPrice;
      document.getElementById("flx-price-val").textContent=`€${maxPrice}`;
      document.getElementById("flx-fil-dest").value="";
      document.getElementById("flx-to-val").textContent="Orice destinație";
      document.getElementById("flx-to-val").classList.add("placeholder");
      document.getElementById("flx-date-val").textContent="Orice dată";
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

  /* ===== PANEL URMĂRITE ===== */
  const buildWatchPanel = () => {
    watchPanelEl = document.createElement("div");
    watchPanelEl.id = "flx-watch-panel";
    watchPanelEl.innerHTML = `
      <div id="flx-watch-panel-header">
        <h3>⭐ Zboruri Urmărite</h3>
        <button id="flx-watch-panel-close">✕</button>
      </div>
      <div id="flx-watch-panel-body"></div>
    `;
    document.body.appendChild(watchPanelEl);
    watchPanelEl.querySelector("#flx-watch-panel-close").onclick = () => watchPanelEl.classList.remove("open");
  };

  /* ===== STARS PE RÂNDURI ===== */
  const addStarsToRows = flights => {
    flights.forEach((f,i) => {
      const id = `zbor-${i}`;
      f.id = id;
      const star = document.createElement("button");
      star.className = "flx-fav-star";
      star.dataset.id = id;
      star.textContent = FavStore.has(id) ? "❤️" : "♡";
      const lastTd = f.tr.querySelector("td:last-child");
      if(lastTd){
        lastTd.style.cssText += "display:flex;align-items:center;justify-content:space-between;gap:8px;";
        lastTd.appendChild(star);
      }
      star.onclick = e => {
        e.stopPropagation();
        if(FavStore.has(id)){
          FavStore.remove(id); star.textContent="♡"; toast("Eliminat din favorite","info");
        } else {
          FavStore.add({
            id, dest:f.dest, date:f.date, dep:f.dep, arr:f.arr,
            agency:f.agency, price:f.price,
            fromCountry: getPageCountry(),
            toCountry: f.dest,
            pageUrl: location.href,
            pageTitle: document.querySelector("h1")?.textContent || document.title
          });
          star.textContent="❤️";
          toast(`Zbor spre ${f.dest} salvat! ❤️`,"success");
        }
        updateFavBadge();
      };

      f.tr.style.cursor = "pointer";
      f.tr.onclick = e => {
        if (e.target.closest(".flx-fav-star")) return;
        if (WatchStore.has(id)) {
          toast("Acest zbor este deja urmărit 🔔", "info");
          return;
        }
        showWatchConfirm(f, id);
      };
    });
  };

  /* ===== MODAL CONFIRMARE URMĂRIRE ===== */
  const showWatchConfirm = (f, id) => {
    if (!document.getElementById("flx-modal-style")) {
      const ms = document.createElement("style");
      ms.id = "flx-modal-style";
      ms.textContent = `
        #flx-watch-modal-overlay {
          position:fixed; inset:0; background:rgba(15,23,42,0.55); z-index:99999;
          display:grid; place-items:center; padding:20px;
          animation: flxFadeIn .2s ease;
        }
        @keyframes flxFadeIn { from{opacity:0} to{opacity:1} }
        #flx-watch-modal {
          background:white; border-radius:20px; padding:28px 24px; max-width:380px; width:100%;
          box-shadow:0 30px 80px rgba(0,0,0,0.25); font-family:inherit;
          animation: flxSlideUp .25s ease;
        }
        @keyframes flxSlideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        #flx-watch-modal h4 { margin:0 0 6px; font-size:18px; font-weight:900; color:#0f172a; }
        #flx-watch-modal .flx-wm-sub { font-size:14px; color:#475569; margin-bottom:18px; }
        #flx-watch-modal .flx-wm-card {
          background:#f1f5f9; border-radius:12px; padding:14px 16px; margin-bottom:20px;
          border:1px solid #e2e8f0;
        }
        #flx-watch-modal .flx-wm-dest { font-size:16px; font-weight:900; color:#0f172a; margin-bottom:4px; }
        #flx-watch-modal .flx-wm-info { font-size:13px; color:#64748b; }
        #flx-watch-modal .flx-wm-price { font-size:20px; font-weight:900; color:#2563eb; margin-top:6px; }
        #flx-watch-modal .flx-wm-btns { display:flex; gap:10px; }
        #flx-watch-modal .flx-wm-ok {
          flex:1; padding:12px; border-radius:13px; border:none;
          background:linear-gradient(135deg,#2563eb,#1d4ed8); color:white;
          font-family:inherit; font-size:15px; font-weight:800; cursor:pointer;
          transition:all .2s;
        }
        #flx-watch-modal .flx-wm-ok:hover { transform:translateY(-1px); box-shadow:0 8px 20px rgba(37,99,235,.35); }
        #flx-watch-modal .flx-wm-cancel {
          padding:12px 18px; border-radius:13px; border:1.5px solid #e2e8f0;
          background:white; font-family:inherit; font-size:15px; font-weight:700;
          cursor:pointer; color:#64748b; transition:all .2s;
        }
        #flx-watch-modal .flx-wm-cancel:hover { border-color:#94a3b8; color:#0f172a; }
      `;
      document.head.appendChild(ms);
    }

    const overlay = document.createElement("div");
    overlay.id = "flx-watch-modal-overlay";
    overlay.innerHTML = `
      <div id="flx-watch-modal">
        <h4>🔔 Urmărește zborul</h4>
        <p class="flx-wm-sub">Vrei să urmărești prețul pentru acest zbor?</p>
        <div class="flx-wm-card">
          <div class="flx-wm-dest">✈ ${f.dest}</div>
          <div class="flx-wm-info">${f.date} · ${f.dep} → ${f.arr}</div>
          <div class="flx-wm-info">${f.agency}</div>
          <div class="flx-wm-price">${f.price}</div>
        </div>
        <div class="flx-wm-btns">
          <button class="flx-wm-cancel">Nu, renunț</button>
          <button class="flx-wm-ok">🔔 Da, urmăresc!</button>
        </div>
      </div>
    `;

    overlay.querySelector(".flx-wm-cancel").onclick = () => overlay.remove();
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
    overlay.querySelector(".flx-wm-ok").onclick = () => {
      WatchStore.add({
        id, dest: f.dest, date: f.date, dep: f.dep, arr: f.arr,
        agency: f.agency, price: f.price, priceNum: f.priceNum,
        fromCountry: getPageCountry(),
        toCountry: f.dest,
        pageUrl: location.href,
        pageTitle: document.querySelector("h1")?.textContent || document.title
      });
      overlay.remove();
      toast(`Urmărire activată pentru ${f.dest} 🔔`, "success");
      updateFavBadge();
    };
    document.body.appendChild(overlay);
  };

  /* ===== INIT ===== */
  const init = () => {
    const flights = parseFlights();
    if(!flights.length) return;
    const maxPrice = Math.max(...flights.map(f=>f.priceNum));
    maxPriceGlobal = maxPrice;
    flightsGlobal  = flights;

    injectStyles();
    buildWidget(flights, maxPrice);
    buildFilterPanel(flights, maxPrice);
    buildFavPanel();
    buildWatchPanel();
    buildCalendar(flights);
    addStarsToRows(flights);
    buildPaxPicker();

    document.querySelectorAll(".flx-tab").forEach(tab=>{
      tab.onclick=()=>{document.querySelectorAll(".flx-tab").forEach(t=>t.classList.remove("active"));tab.classList.add("active");};
    });

    document.getElementById("flx-fil-dest").addEventListener("change",function(){
      const v=document.getElementById("flx-to-val");
      v.textContent=this.value||"Orice destinație";
      v.classList.toggle("placeholder",!this.value);
    });

    document.getElementById("flx-swap").onclick=()=>{
      const fv=document.getElementById("flx-from-val");
      const ts=document.getElementById("flx-fil-dest");
      const tv=document.getElementById("flx-to-val");
      if(ts.value){const tmp=fv.textContent;fv.textContent=tv.textContent;tv.textContent=tmp;tv.classList.remove("placeholder");}
    };

    document.getElementById("flx-search-btn").onclick=()=>{
      flxSelectedHour = flxPendingHour;
      flxSelectedDate = flxPendingDate;
      applyFilters();
    };

    // ── BUTOANE FLOTANTE ──
    const corner = document.createElement("div");
    corner.id = "flx-corner-btns";

    // Buton Filtre
    const menuBtn = document.createElement("button");
    menuBtn.id = "flx-side-btn";
    menuBtn.title = "Filtre";
    menuBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="5" width="18" height="2.5" rx="1.25" fill="white"/><rect x="2" y="10" width="18" height="2.5" rx="1.25" fill="white"/><rect x="2" y="15" width="18" height="2.5" rx="1.25" fill="white"/></svg>`;
    menuBtn.onclick = () => {
      filterPanel.classList.add("open");
      favPanel.classList.remove("open");
      watchPanelEl.classList.remove("open");
    };

    // Buton Favorite
    const favBtn = document.createElement("button");
    favBtn.id = "flx-fav-btn";
    favBtn.title = "Favorite";
    favBtn.innerHTML = `❤️<span id="flx-fav-badge"></span>`;
    favBtn.onclick = () => {
      renderFavPanel();
      favPanel.classList.add("open");
      filterPanel.classList.remove("open");
      watchPanelEl.classList.remove("open");
    };

    // Buton Urmărite
    const watchBtn = document.createElement("button");
    watchBtn.id = "flx-watch-btn";
    watchBtn.title = "Zboruri urmărite";
    watchBtn.innerHTML = `⭐<span id="flx-watch-badge"></span>`;
    watchBtn.onclick = () => {
      renderWatchPanel();
      watchPanelEl.classList.add("open");
      filterPanel.classList.remove("open");
      favPanel.classList.remove("open");
    };

    corner.appendChild(menuBtn);
    corner.appendChild(favBtn);
    corner.appendChild(watchBtn);
    document.body.appendChild(corner);
    updateFavBadge();

    // Dacă am navigat de la favorite, evidențiază zborul
    const urlParams = new URLSearchParams(location.search);
    const favParam   = urlParams.get("flx_fav");
    const watchParam = urlParams.get("flx_watch");

    const highlightFlight = (id, label) => {
      setTimeout(() => {
        const target = flightsGlobal.find(f => f.id === id);
        if (target) {
          flightsGlobal.forEach(f => {
            if (f.id === id) showRow(f.tr);
            else hideRow(f.tr);
          });
          syncSections();
          target.tr.scrollIntoView({ behavior: "smooth", block: "center" });
          target.tr.style.background = "rgba(37,99,235,0.08)";
          setTimeout(() => { target.tr.style.background = ""; }, 2000);
          const cb = document.getElementById("flx-count-bar");
          if (cb) { cb.style.display = "block"; cb.innerHTML = `<span>1</span> zbor găsit (${label})`; }
        }
      }, 200);
    };

    if (favParam)   highlightFlight(favParam,   "din favorite");
    if (watchParam) highlightFlight(watchParam, "din urmărite");
  };

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
  else init();
})();