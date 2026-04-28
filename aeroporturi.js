/**
 * aeroporturi.js — pentru paginile cu liste de aeroporturi
 * Funcții: Căutare aeroporturi, Favorite (accordion: Țări / Aeroporturi / Zboruri), Zboruri Urmărite
 */

(function () {
  "use strict";

  /* ══════════════════════════════
     STORE-URI
  ══════════════════════════════ */
  const TariStore = {
    get: () => JSON.parse(localStorage.getItem("flx_favorites") || "[]"),
  };

  const AeroportStore = {
    getFavorites: () => JSON.parse(localStorage.getItem("flx_fav_aeroport") || "[]"),
    saveFavorites: (arr) => localStorage.setItem("flx_fav_aeroport", JSON.stringify(arr)),
    addFavorite(item) {
      const favs = this.getFavorites();
      if (!favs.find(f => f.id === item.id)) { favs.push(item); this.saveFavorites(favs); }
    },
    removeFavorite(id) { this.saveFavorites(this.getFavorites().filter(f => f.id !== id)); },
    isFavorite(id) { return this.getFavorites().some(f => f.id === id); }
  };

  const ZboruriStore = {
    get: () => JSON.parse(localStorage.getItem("flx_fav_zboruri") || "[]"),
  };

  const WatchStore = {
    get: () => JSON.parse(localStorage.getItem("flx_watch_zboruri") || "[]"),
    save: (a) => localStorage.setItem("flx_watch_zboruri", JSON.stringify(a)),
    remove(id) { this.save(this.get().filter(x => x.id !== id)); },
  };

  /* ══════════════════════════════
     HELPER: redirect sigur — validează href înainte
  ══════════════════════════════ */
  const cleanHref = (v) => (!v || v === "undefined" || v === "null" || v.trim() === "" || v.trim() === "#") ? "" : v.trim();

  const safeRedirect = (href, fallbackMsg) => {
    if (!href || href === "undefined" || href === "null" || href.trim() === "" || href.trim() === "#") {
      toast(fallbackMsg || "Link indisponibil — pagina nu a putut fi găsită.", "info");
      return;
    }
    window.location.href = href;
  };

  /* ══════════════════════════════
     HELPER: afișează ruta "Țara sursă → Țara destinație"
  ══════════════════════════════ */
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


  /* ══════════════════════════════
     STILURI
  ══════════════════════════════ */
  const injectStyles = () => {
    const s = document.createElement("style");
    s.textContent = `
      #flx-search-wrapper { margin: 0 0 22px; max-width: 480px; }
      #flx-search {
        width: 100%; padding: 12px 18px 12px 46px; border-radius: 14px;
        border: 1.5px solid #dbeafe; font-family: inherit; font-size: 16px;
        font-weight: 600; color: #0f172a;
        background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2.5'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E") no-repeat 14px center;
        box-shadow: 0 4px 16px rgba(0,0,0,0.07); outline: none;
        box-sizing: border-box; transition: border-color .2s, box-shadow .2s;
      }
      #flx-search:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
      #flx-no-results { display: none; color: #94a3b8; font-size: 15px; font-weight: 600; padding: 12px 4px; }

      .flx-fav-star {
        background: none; border: none; font-size: 18px; cursor: pointer;
        padding: 0 0 0 6px; line-height: 1; transition: transform .2s; flex-shrink: 0;
        margin-left: 0 !important;
      }
      .flx-fav-star:hover { transform: scale(1.3); }
      .lista a { display: flex; align-items: center; }
      .lista a .cod { margin-left: auto; }

      /* ── BUTOANE FLOTANTE ── */
      #flx-corner-btns {
        position: fixed; bottom: 24px; right: 24px; z-index: 888;
        display: flex; flex-direction: row; gap: 12px; align-items: center;
      }
      #flx-fav-btn, #flx-watch-btn {
        width: 56px; height: 56px; border-radius: 999px; border: none;
        color: white; font-size: 24px; cursor: pointer;
        display: grid; place-items: center;
        transition: transform .2s, box-shadow .2s;
        position: relative; overflow: visible; flex-shrink: 0;
      }
      #flx-fav-btn {
        background: linear-gradient(135deg,#2563eb,#1d4ed8);
        box-shadow: 0 8px 25px rgba(37,99,235,0.40);
      }
      #flx-fav-btn:hover { transform: scale(1.1); box-shadow: 0 12px 32px rgba(37,99,235,0.50); }
      #flx-watch-btn {
        background: linear-gradient(135deg,#2563eb,#1d4ed8);
        box-shadow: 0 8px 25px rgba(37,99,235,0.40);
      }
      #flx-watch-btn:hover { transform: scale(1.1); box-shadow: 0 12px 32px rgba(37,99,235,0.50); }
      #flx-fav-badge, #flx-watch-badge {
        position: absolute; top: -5px; right: -5px;
        width: 20px; height: 20px; border-radius: 999px;
        background: white; font-size: 11px; font-weight: 900;
        display: none; align-items: center; justify-content: center;
      }
      #flx-fav-badge { color: #2563eb; border: 2px solid #2563eb; }
      #flx-watch-badge { color: #2563eb; border: 2px solid #2563eb; }

      /* ── PANOURI LATERALE ── */
      #flx-fav-panel, #flx-watch-panel {
        position: fixed; top: 0; right: -440px; width: 420px; height: 100vh;
        background: #f8fafc; z-index: 9999;
        box-shadow: -8px 0 40px rgba(0,0,0,0.15);
        transition: right .35s cubic-bezier(.4,0,.2,1);
        display: flex; flex-direction: column; font-family: inherit;
      }
      #flx-fav-panel.open, #flx-watch-panel.open { right: 0; }

      #flx-fav-header, #flx-watch-header {
        padding: 20px 20px 16px;
        background: linear-gradient(135deg,#2563eb,#1d4ed8);
        display: flex; align-items: center; justify-content: space-between;
        flex-shrink: 0;
      }
      #flx-fav-header h3, #flx-watch-header h3 { margin: 0; font-size: 18px; font-family: inherit; color: white; font-weight: 900; }
      #flx-fav-close, #flx-watch-close {
        background: rgba(255,255,255,0.2); border: none; font-size: 18px; cursor: pointer;
        color: white; width: 32px; height: 32px; border-radius: 50%;
        display: grid; place-items: center; transition: background .2s;
      }
      #flx-fav-close:hover, #flx-watch-close:hover { background: rgba(255,255,255,0.35); }
      #flx-fav-body, #flx-watch-body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }

      /* ── ACCORDION ── */
      .flx-acc-section {
        background: white; border-radius: 16px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        overflow: hidden;
      }
      .flx-acc-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 14px 16px; cursor: pointer;
        transition: background .15s;
        user-select: none;
      }
      .flx-acc-header:hover { background: #f1f5f9; }
      .flx-acc-header-left { display: flex; align-items: center; gap: 10px; }
      .flx-acc-icon { font-size: 18px; }
      .flx-acc-title { font-size: 15px; font-weight: 800; color: #0f172a; }
      .flx-acc-count {
        font-size: 11px; font-weight: 900; padding: 3px 9px; border-radius: 999px;
        background: #dbeafe; color: #2563eb; border: 1px solid #bfdbfe;
      }
      .flx-acc-arrow {
        font-size: 13px; color: #94a3b8; transition: transform .3s ease;
        display: inline-block;
      }
      .flx-acc-section.open .flx-acc-arrow { transform: rotate(180deg); }
      .flx-acc-body {
        max-height: 0; overflow: hidden;
        transition: max-height .35s cubic-bezier(.4,0,.2,1);
      }
      .flx-acc-section.open .flx-acc-body {
        max-height: 600px;
        border-top: 1px solid #f1f5f9;
      }
      .flx-acc-inner { padding: 10px; display: flex; flex-direction: column; gap: 8px; }

      /* ── CARD ITEM ── */
      .flx-fav-item {
        background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;
        padding: 12px 14px; display: flex; align-items: center; justify-content: space-between;
        font-family: inherit; cursor: pointer;
        transition: background .15s, border-color .15s, transform .15s;
      }
      .flx-fav-item:hover { background: #eff6ff; border-color: #93c5fd; transform: translateX(-2px); }
      .flx-fav-item-name {
        font-weight: 800; font-size: 15px; color: #0f172a;
        display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      }
      .flx-fav-item-sub { font-size: 12px; color: #64748b; font-weight: 500; margin-top: 3px; }
      .flx-fav-item-cod {
        font-size: 11px; font-weight: 900; padding: 3px 9px; border-radius: 999px;
        background: rgba(56,189,248,0.18); border: 1px solid rgba(56,189,248,0.35); color: #0f172a;
      }
      .flx-fav-remove {
        background: none; border: none; font-size: 15px; cursor: pointer;
        color: #cbd5e1; flex-shrink: 0; padding: 4px; border-radius: 6px;
        transition: color .15s, background .15s;
      }
      .flx-fav-remove:hover { color: #ef4444; background: #fee2e2; }
      .flx-acc-empty { text-align: center; color: #94a3b8; padding: 20px; font-size: 13px; line-height: 1.8; }

      /* ── URMĂRITE ── */
      .flx-watch-item {
        background: linear-gradient(135deg, #fefce8, #fef9c3);
        border: 1px solid #fde047; border-radius: 12px;
        padding: 12px 14px; display: flex; align-items: flex-start; justify-content: space-between;
        font-family: inherit; cursor: pointer;
        transition: border-color .15s, transform .15s;
      }
      .flx-watch-item:hover { border-color: #facc15; transform: translateX(-2px); }
      .flx-watch-item-name { font-weight: 800; font-size: 14px; color: #713f12; }
      .flx-watch-item-sub { font-size: 12px; color: #92400e; font-weight: 500; margin-top: 3px; }
      .flx-watch-price {
        font-size: 13px; font-weight: 900; color: #15803d;
        white-space: nowrap; margin-left: 8px; flex-shrink: 0;
      }
      .flx-watch-remove {
        background: none; border: none; font-size: 14px; cursor: pointer;
        color: #d97706; padding: 2px 5px; border-radius: 6px; flex-shrink: 0;
        transition: color .15s, background .15s;
      }
      .flx-watch-remove:hover { color: #ef4444; background: #fee2e2; }

      /* ── TOAST ── */
      #flx-toasts {
        position: fixed; bottom: 90px; right: 24px; z-index: 99998;
        display: flex; flex-direction: column; gap: 8px; pointer-events: none;
      }
      .flx-toast {
        padding: 11px 18px; border-radius: 12px; font-size: 14px; font-weight: 700;
        color: white; font-family: inherit; box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        animation: flxIn .3s ease, flxOut .4s ease 2.3s forwards; pointer-events: auto;
      }
      .flx-toast-success { background: linear-gradient(135deg,#059669,#047857); }
      .flx-toast-info    { background: linear-gradient(135deg,#2563eb,#1d4ed8); }
      @keyframes flxIn  { from { transform: translateX(120%); opacity:0; } to { transform: translateX(0); opacity:1; } }
      @keyframes flxOut { to   { transform: translateX(120%); opacity:0; } }
    `;
    document.head.appendChild(s);
  };

  /* ══════════════════════════════
     TOAST
  ══════════════════════════════ */
  let toastContainer;
  const toast = (msg, type = "success") => {
    if (!toastContainer) { toastContainer = document.createElement("div"); toastContainer.id = "flx-toasts"; document.body.appendChild(toastContainer); }
    const el = document.createElement("div");
    el.className = `flx-toast flx-toast-${type}`;
    el.textContent = msg;
    toastContainer.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  };

  /* ══════════════════════════════
     RANDARE SECȚIUNI
  ══════════════════════════════ */
  const renderTariSection = (inner, countEl) => {
    const favs = TariStore.get();
    countEl.textContent = favs.length;
    if (!favs.length) {
      inner.innerHTML = `<div class="flx-acc-empty">🌍<br>Nicio țară salvată.<br>Mergi la pagina principală.</div>`;
      return;
    }
    inner.innerHTML = favs.map(f => `
      <div class="flx-fav-item" data-href="${cleanHref(f.href)}">
        <div class="flx-fav-item-name">✈ ${f.name} <span class="flx-fav-item-cod">${f.cod}</span></div>
        <span style="color:#94a3b8;font-size:13px;">→</span>
      </div>
    `).join("");
    inner.querySelectorAll(".flx-fav-item").forEach(item => {
      item.onclick = () => { safeRedirect(item.dataset.href, "Pagina acestei țări nu a putut fi găsită."); };
    });
  };

  const renderAeroportSection = (inner, countEl) => {
    const favs = AeroportStore.getFavorites();
    countEl.textContent = favs.length;
    if (!favs.length) {
      inner.innerHTML = `<div class="flx-acc-empty">🛬<br>Niciun aeroport salvat.<br>Apasă ♡ lângă un aeroport.</div>`;
      return;
    }
    inner.innerHTML = favs.map(f => `
      <div class="flx-fav-item" data-href="${cleanHref(f.href)}">
        <div>
          <div class="flx-fav-item-name">✈ ${f.name} <span class="flx-fav-item-cod">${f.cod}</span></div>
        </div>
        <button class="flx-fav-remove" data-id="${f.id}" title="Elimină">✕</button>
      </div>
    `).join("");
    inner.querySelectorAll(".flx-fav-item").forEach(item => {
      item.onclick = e => {
        if (e.target.closest(".flx-fav-remove")) return;
        safeRedirect(item.dataset.href, "Pagina acestui aeroport nu a putut fi găsită.");
      };
    });
    inner.querySelectorAll(".flx-fav-remove").forEach(btn => {
      btn.onclick = e => {
        e.stopPropagation();
        AeroportStore.removeFavorite(btn.dataset.id);
        const star = document.querySelector(`.flx-fav-star[data-id="${btn.dataset.id}"]`);
        if (star) star.textContent = "♡";
        refreshPanel();
        toast("Eliminat din favorite", "info");
      };
    });
  };

  /* FIX: zboruri favorite în aeroporturi.js — afișează ruta "Din → Spre" */
  const renderZboruriSection = (inner, countEl) => {
    const favs = ZboruriStore.get();
    countEl.textContent = favs.length;
    if (!favs.length) {
      inner.innerHTML = `<div class="flx-acc-empty">🎫<br>Niciun zbor salvat.</div>`;
      return;
    }
    inner.innerHTML = favs.map(f => {
      const route = getFlightRoute(f);
      return `
      <div class="flx-fav-item" data-href="${cleanHref(f.pageUrl)}" data-id="${f.id}">
        <div>
          <div class="flx-fav-item-name">✈ ${route}</div>
          <div class="flx-fav-item-sub">${f.date} · ${f.dep} → ${f.arr}</div>
          <div class="flx-fav-item-sub">${f.agency} · <strong>${f.price}</strong></div>
        </div>
        <span style="color:#94a3b8;font-size:13px;">→</span>
      </div>`;
    }).join("");
    inner.querySelectorAll(".flx-fav-item").forEach(item => {
      item.onclick = () => {
        const href = item.dataset.href;
        const id = item.dataset.id;
        const dest = href + (id ? "?flx_fav=" + encodeURIComponent(id) : "");
        safeRedirect(dest, "Pagina acestui zbor nu a putut fi găsită.");
      };
    });
  };

  /* FIX: zboruri urmărite în aeroporturi.js — afișează ruta + redirect corect */
  const renderWatchSection = () => {
    const body = document.getElementById("flx-watch-body");
    if (!body) return;
    const watches = WatchStore.get();
    if (!watches.length) {
      body.innerHTML = `<div class="flx-acc-empty" style="text-align:center;color:#94a3b8;padding:40px 20px;font-size:14px;line-height:1.8;">🔔<br><br>Niciun zbor urmărit.<br>Apasă pe un rând de zbor.</div>`;
      return;
    }
    body.innerHTML = watches.map(w => {
      const route = getFlightRoute(w);
      return `
      <div class="flx-watch-item" data-href="${cleanHref(w.pageUrl)}" data-id="${w.id}">
        <div style="flex:1;min-width:0;">
          <div class="flx-watch-item-name">🔔 ${route}</div>
          <div class="flx-watch-item-sub">${w.date} · ${w.dep} → ${w.arr}</div>
          <div class="flx-watch-item-sub">${w.agency}</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="flx-watch-price">${w.price}</span>
          <button class="flx-watch-remove" data-id="${w.id}" title="Oprește urmărirea">✕</button>
        </div>
      </div>`;
    }).join("");
    body.querySelectorAll(".flx-watch-item").forEach(item => {
      item.onclick = e => {
        if (e.target.closest(".flx-watch-remove")) return;
        const wid = item.dataset.id;
        const href = item.dataset.href;
        const dest = href ? href + "?flx_watch=" + encodeURIComponent(wid) : "";
        safeRedirect(dest, "Pagina acestui zbor urmărit nu a putut fi găsită.");
      };
    });
    body.querySelectorAll(".flx-watch-remove").forEach(btn => {
      btn.onclick = e => {
        e.stopPropagation();
        WatchStore.remove(btn.dataset.id);
        updateBadge();
        renderWatchSection();
        toast("Urmărire oprită", "info");
      };
    });
  };

  /* ══════════════════════════════
     PANOU FAVORIT
  ══════════════════════════════ */
  let favPanel, favBadge;
  let accSections = {};

  const buildAccordionSection = (icon, title, key) => {
    const sec = document.createElement("div");
    sec.className = "flx-acc-section";
    sec.id = `flx-acc-${key}`;
    sec.innerHTML = `
      <div class="flx-acc-header">
        <div class="flx-acc-header-left">
          <span class="flx-acc-icon">${icon}</span>
          <span class="flx-acc-title">${title}</span>
          <span class="flx-acc-count" id="flx-acc-count-${key}">0</span>
        </div>
        <span class="flx-acc-arrow">▼</span>
      </div>
      <div class="flx-acc-body">
        <div class="flx-acc-inner" id="flx-acc-inner-${key}"></div>
      </div>
    `;
    sec.querySelector(".flx-acc-header").addEventListener("click", () => {
      sec.classList.toggle("open");
    });
    return sec;
  };

  const buildPanels = () => {
    // ── PANOU FAVORITE — doar favorite, fără filtre ──
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
    const favBody = favPanel.querySelector("#flx-fav-body");
    favPanel.querySelector("#flx-fav-close").onclick = () => favPanel.classList.remove("open");

    [
      { key: "tari",        icon: "🌍", title: "Țări favorite" },
      { key: "aeroporturi", icon: "🛬", title: "Aeroporturi favorite" },
      { key: "zboruri",     icon: "🎫", title: "Zboruri favorite" },
    ].forEach(({ key, icon, title }) => {
      const sec = buildAccordionSection(icon, title, `fav-${key}`);
      favBody.appendChild(sec);
      accSections[key] = {
        section: sec,
        inner: sec.querySelector(`#flx-acc-inner-fav-${key}`),
        count: sec.querySelector(`#flx-acc-count-fav-${key}`),
      };
    });
    accSections.aeroporturi.section.classList.add("open");

    // ── PANOU URMĂRITE ──
    watchPanel = document.createElement("div");
    watchPanel.id = "flx-watch-panel";
    watchPanel.innerHTML = `
      <div id="flx-watch-header">
        <h3>⭐ Zboruri Urmărite</h3>
        <button id="flx-watch-close">✕</button>
      </div>
      <div id="flx-watch-body"></div>
    `;
    document.body.appendChild(watchPanel);
    watchPanel.querySelector("#flx-watch-close").onclick = () => watchPanel.classList.remove("open");
  };

  let watchPanel, watchBadge;

  const refreshFav = () => {
    updateBadge();
    if (accSections.tari)        renderTariSection(accSections.tari.inner, accSections.tari.count);
    if (accSections.aeroporturi) renderAeroportSection(accSections.aeroporturi.inner, accSections.aeroporturi.count);
    if (accSections.zboruri)     renderZboruriSection(accSections.zboruri.inner, accSections.zboruri.count);
  };

  const refreshWatch = () => {
    updateBadge();
    renderWatchSection();
  };

  const refreshPanel = () => { refreshFav(); refreshWatch(); };

  const updateBadge = () => {
    if (favBadge) {
      const n = TariStore.get().length + AeroportStore.getFavorites().length + ZboruriStore.get().length;
      favBadge.textContent = n;
      favBadge.style.display = n > 0 ? "grid" : "none";
    }
    if (watchBadge) {
      const nw = WatchStore.get().length;
      watchBadge.textContent = nw;
      watchBadge.style.display = nw > 0 ? "grid" : "none";
    }
  };

  const buildFloatBtn = () => {
    const corner = document.createElement("div");
    corner.id = "flx-corner-btns";

    const favBtn = document.createElement("button");
    favBtn.id = "flx-fav-btn";
    favBtn.title = "Favorite";
    favBtn.innerHTML = `❤️<span id="flx-fav-badge"></span>`;
    favBtn.onclick = () => { refreshFav(); favPanel.classList.add("open"); watchPanel.classList.remove("open"); };

    const watchBtn = document.createElement("button");
    watchBtn.id = "flx-watch-btn";
    watchBtn.title = "Zboruri urmărite";
    watchBtn.innerHTML = `⭐<span id="flx-watch-badge"></span>`;
    watchBtn.onclick = () => { refreshWatch(); watchPanel.classList.add("open"); favPanel.classList.remove("open"); };

    corner.appendChild(favBtn);
    corner.appendChild(watchBtn);
    document.body.appendChild(corner);
    favBadge = favBtn.querySelector("#flx-fav-badge");
    watchBadge = watchBtn.querySelector("#flx-watch-badge");
    updateBadge();
  };

  /* ══════════════════════════════
     CĂUTARE + STELE ♡
  ══════════════════════════════ */
  const buildSearch = () => {
    const lista = document.querySelector(".lista");
    if (!lista) return;

    const wrapper = document.createElement("div");
    wrapper.id = "flx-search-wrapper";
    wrapper.innerHTML = `
      <input id="flx-search" type="text" placeholder="Caută aeroport…" autocomplete="off">
      <div id="flx-no-results">Niciun aeroport găsit.</div>
    `;
    const anchor = document.querySelector(".row") || lista;
    anchor.before(wrapper);

    document.getElementById("flx-search").addEventListener("input", function () {
      const q = this.value.toLowerCase().trim();
      let visible = 0;
      lista.querySelectorAll("li").forEach(li => {
        const match = li.textContent.toLowerCase().includes(q);
        li.style.display = match ? "" : "none";
        if (match) visible++;
      });
      document.getElementById("flx-no-results").style.display = visible === 0 ? "block" : "none";
    });

    lista.querySelectorAll("li").forEach(li => {
      const link = li.querySelector("a");
      if (!link) return;
      const nameEl = link.querySelector(".nume");
      const codEl  = link.querySelector(".cod");
      const name   = nameEl ? nameEl.textContent.replace("✈", "").trim() : li.textContent.trim();
      const cod    = codEl  ? codEl.textContent.trim() : "";
      const id     = "aeroport-" + cod;
      const hrefRaw = link.getAttribute("href") || "";
      const href = hrefRaw ? new URL(hrefRaw, location.href).href : "";

      const star = document.createElement("button");
      star.className = "flx-fav-star";
      star.dataset.id = id;
      star.title = "Adaugă la favorite";
      star.textContent = AeroportStore.isFavorite(id) ? "❤️" : "♡";

      star.onclick = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (AeroportStore.isFavorite(id)) {
          AeroportStore.removeFavorite(id); star.textContent = "♡";
          toast("Eliminat din favorite", "info");
        } else {
          AeroportStore.addFavorite({ id, name, cod, href });
          star.textContent = "❤️";
          toast(`${name} adăugat la favorite! ❤️`, "success");
        }
        updateBadge();
        if (favPanel && favPanel.classList.contains("open")) refreshPanel();
      };

      const codEl2 = link.querySelector(".cod");
      if (codEl2) codEl2.after(star);
      else link.appendChild(star);
    });
  };

  /* ══════════════════════════════
     INIT
  ══════════════════════════════ */
  const cleanup = () => {
  [
    "flx-search-wrapper",
    "flx-no-results",
    "flx-corner-btns",
    "flx-fav-panel",
    "flx-watch-panel",
    "flx-toasts"
  ].forEach(id => document.getElementById(id)?.remove());
};

const boot = () => {
  if (document.body.dataset.page !== "aeroporturi") return;
  if (!document.querySelector(".row .lista")) return;

  cleanup();
  injectStyles();
  buildPanels();
  buildFloatBtn();
  buildSearch();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

document.addEventListener("spa:render", boot);

})();