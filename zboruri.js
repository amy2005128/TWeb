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

      /* BUTOANE FLOTANTE */
      #flx-corner-btns {
        position:fixed; bottom:24px; right:24px; z-index:888;
        display:flex; gap:10px; align-items:center;
      }
      #flx-side-btn, #flx-fav-btn, #flx-watch-btn, #flx-ticket-btn {
        width:56px; height:56px; border-radius:999px; border:none;
        background:linear-gradient(135deg,#2563eb,#1d4ed8); color:white;
        font-size:22px; cursor:pointer; box-shadow:0 8px 25px rgba(37,99,235,.40);
        display:grid; place-items:center; transition:transform .2s,box-shadow .2s; position:relative;
      }
      #flx-side-btn:hover, #flx-fav-btn:hover, #flx-watch-btn:hover, #flx-ticket-btn:hover {
        transform:scale(1.1); box-shadow:0 12px 32px rgba(37,99,235,.50);
      }
      #flx-fav-badge, #flx-watch-badge, #flx-ticket-badge {
        position:absolute; top:-4px; right:-4px;
        width:20px; height:20px; border-radius:999px;
        background:white; color:#2563eb; font-size:11px; font-weight:900;
        display:none; place-items:center; border:2px solid #2563eb;
      }

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
      favBadge.style.display = n > 0 ? "grid" : "none";
    }
    const watchBadge = document.getElementById("flx-watch-badge");
    if (watchBadge) {
      const nw = WatchStore.get().length;
      watchBadge.textContent = nw;
      watchBadge.style.display = nw > 0 ? "grid" : "none";
    }
    const ticketBadge = document.getElementById("flx-ticket-badge");
    if (ticketBadge) {
      const nt = TicketStore.get().length;
      ticketBadge.textContent = nt;
      ticketBadge.style.display = nt > 0 ? "grid" : "none";
    }
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
    let selectedSeat  = null;
    let passengers    = []; // [{tip, varsta, main, prenume, nume, idnp, datan}]
    let checkinOnline = false;
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
      const seatExtra = selectedSeat?.extra || 0;
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
        const seatEx = selectedSeat?.extra || 0;
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
      const calcTot = () => priceBase * nrPax + bagExtra * nrPax + (selectedSeat?.extra || 0);

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
              const sel = selectedSeat?.label === key ? " selected" : "";
              html += `<button class="flx-seat ${cls}${sel}" data-key="${key}" data-row="${r}" data-col="${c}" data-class="${sec.cls}" data-extra="${sec.extraPerSeat}" ${isOcc ? "disabled" : ""}>${c}</button>`;
            });
            html += `</div>`;
          });
        });
        html += `</div></div>`;
        return html;
      };

      overlay.innerHTML = `
        <div id="flx-purchase-modal" style="max-width:520px;">
          <h4>💺 Alege locul</h4>
          <p class="flx-pm-sub">Selectează un loc disponibil în avion</p>
          <div class="flx-pm-card">
            <div class="flx-pm-dest">${esc(f.dest || "")} · ${esc(f.agency || "")}</div>
            <div class="flx-pm-info">📅 ${esc(f.date)} &nbsp;|&nbsp; 🛫 ${esc(f.dep)} → 🛬 ${esc(f.arr)}</div>
            <div class="flx-pm-price" id="flx-price-live">${fmtP(calcTot())}</div>
          </div>
          <p style="font-size:13px;font-weight:800;color:#0f172a;margin:0 0 8px;">💺 Plan avion:</p>
          ${renderPlaneHTML()}
          <div class="flx-seat-legend">
            <div class="flx-seat-legend-item"><div class="flx-seat-legend-dot" style="background:#fef3c7;border-color:#fbbf24;"></div>Business</div>
            <div class="flx-seat-legend-item"><div class="flx-seat-legend-dot" style="background:#dbeafe;border-color:#93c5fd;"></div>Economic</div>
            <div class="flx-seat-legend-item"><div class="flx-seat-legend-dot" style="background:#2563eb;border-color:#1d4ed8;"></div>Selectat</div>
            <div class="flx-seat-legend-item"><div class="flx-seat-legend-dot" style="background:#f1f5f9;border-color:#e2e8f0;"></div>Ocupat</div>
          </div>
          <div class="flx-selected-info" id="flx-seat-info" style="${selectedSeat ? "display:block" : "display:none"}">
            ${selectedSeat ? `💺 Loc selectat: <strong>${selectedSeat.label}</strong> — ${selectedSeat.cls === "business" ? "Business" : "Economic"}${selectedSeat.extra > 0 ? ` (+${fmtP(selectedSeat.extra)})` : ""}` : ""}
          </div>
          <div class="flx-pm-btns" style="margin-top:18px;">
            <button class="flx-pm-cancel" id="flx-pm-back3">← Înapoi</button>
            <button class="flx-pm-ok" id="flx-pm-next3" ${selectedSeat ? "" : "disabled style='opacity:.5;cursor:not-allowed;'"}>Continuă →</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.querySelectorAll(".flx-seat:not(.occupied)").forEach(btn => {
        btn.addEventListener("click", () => {
          selectedSeat = { label: btn.dataset.key, row: btn.dataset.row, col: btn.dataset.col, cls: btn.dataset.class, extra: parseInt(btn.dataset.extra) || 0 };
          overlay.querySelectorAll(".flx-seat").forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");
          const infoEl = overlay.querySelector("#flx-seat-info");
          if (infoEl) {
            infoEl.style.display = "block";
            infoEl.innerHTML = `💺 Loc selectat: <strong>${selectedSeat.label}</strong> — ${selectedSeat.cls === "business" ? "Business" : "Economic"}${selectedSeat.extra > 0 ? ` (+${fmtP(selectedSeat.extra)})` : ""}`;
          }
          const priceEl = overlay.querySelector("#flx-price-live");
          if (priceEl) priceEl.textContent = fmtP(calcTot());
          const nextBtn = overlay.querySelector("#flx-pm-next3");
          if (nextBtn) { nextBtn.removeAttribute("disabled"); nextBtn.style.opacity = "1"; nextBtn.style.cursor = "pointer"; }
        });
      });

      overlay.querySelector("#flx-pm-back3").onclick = () => showStepBagaj();
      overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
      overlay.querySelector("#flx-pm-next3").onclick = () => { if (selectedSeat) showStepPersonal(); };
    };

    /* ---- PASUL 4: Date personale ---- */
    const showStepPersonal = () => {
      document.getElementById("flx-purchase-overlay")?.remove();
      const nrPax = passengers.length;
      const bagajInfo = BAGAJ_OPTS.find(o => o.id === selectedBagaj);
      const extraBag = bagajInfo?.extra || 0;
      const extraSeat = selectedSeat?.extra || 0;
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
              💺 Loc: ${selectedSeat?.label || "—"} — ${selectedSeat?.cls === "business" ? "Business" : "Economic"}<br>
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
      const extraSeat = selectedSeat?.extra || 0;
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
        const seatExAmt = selectedSeat?.extra || 0;
        const checkinAmt = checkinOnline ? CHECKIN_PRICE * nrPax : 0;
        const totalFinal = fmtP(priceBase * nrPax + extraAmt * nrPax + seatExAmt + checkinAmt);

        const mainPax = passengers[0];
        const payload = {
          flight_id: f.id || "",
          dest: f.dest, date: f.date, dep: f.dep, arr: f.arr, agency: f.agency,
          seat: selectedSeat?.label || "—",
          seat_class: selectedSeat?.cls === "business" ? "Business" : "Economic",
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
            <strong>Loc:</strong> ${selectedSeat?.label || "—"} — ${selectedSeat?.cls === "business" ? "Business" : "Economic"}<br>
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

    // Butoane flotante
    const corner = document.createElement("div");
    corner.id = "flx-corner-btns";
    corner.innerHTML = `
      <button id="flx-side-btn"   title="Filtre">☰</button>
      <button id="flx-fav-btn"    title="Favorite">❤️ <span id="flx-fav-badge"></span></button>
      <button id="flx-watch-btn"  title="Zboruri urmărite">⭐ <span id="flx-watch-badge"></span></button>
      <button id="flx-ticket-btn" title="Bilete procurate">🎫 <span id="flx-ticket-badge"></span></button>
    `;
    document.body.appendChild(corner);

    document.getElementById("flx-side-btn").onclick = () => {
      const isOpen = filterPanel.classList.contains("open");
      favPanel?.classList.remove("open");
      filterPanel.classList.toggle("open", !isOpen);
    };

    document.getElementById("flx-fav-btn").onclick = () => {
      const isOpen = favPanel.classList.contains("open");
      filterPanel.classList.remove("open");
      if (!isOpen) { favPanel.classList.add("open"); renderFavPanel(); }
      else           favPanel.classList.remove("open");
    };

    document.getElementById("flx-watch-btn").onclick = () => {
      const isOpen = watchPanel.classList.contains("open");
      filterPanel.classList.remove("open");
      favPanel?.classList.remove("open");
      ticketPanel?.classList.remove("open");
      if (!isOpen) { watchPanel.classList.add("open"); renderWatchPanel(); }
      else           watchPanel.classList.remove("open");
    };

    document.getElementById("flx-ticket-btn").onclick = () => {
      const isOpen = ticketPanel.classList.contains("open");
      filterPanel.classList.remove("open");
      favPanel?.classList.remove("open");
      watchPanel?.classList.remove("open");
      if (!isOpen) { ticketPanel.classList.add("open"); renderTicketPanel(); }
      else           ticketPanel.classList.remove("open");
    };

    updateBadges();

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