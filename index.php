<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zboruri</title>

  <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/tari.css">
  <link rel="stylesheet" href="css/aeroporturi.css">
  <link rel="stylesheet" href="css/zboruri.css">

  <style>
  #back-home,
  #back-to-airports,
  .btn-back,
  .btn-link {
    position: static !important;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
  }

  .back-actions {
    display: flex;
    justify-content: flex-start;   /* butoanele în stânga */
    gap: 20px;
    flex-wrap: wrap;
    margin: 40px 0 10px;
  }
  </style>
</head>

<body data-page="">
  <div id="app"></div>
  <section id="reviews-root"></section>
  <section id="watch-root"></section>
  <section id="ticket-root"></section>

  <script src="js/tari.js"></script>
  <script src="js/aeroporturi.js"></script>
  <script src="js/zboruri.js"></script>
  <script src="https://unpkg.com/image-map-resizer@1.0.10/js/imageMapResizer.min.js"></script>

  <script>
    let SITE = null;

    function parseHash() {
      const hash = window.location.hash.replace(/^#/, "");
      const params = new URLSearchParams(hash);

      return {
        tara: params.get("tara") || "",
        aeroport: params.get("aeroport") || ""
      };
    }

    function getCountry(id) {
      return (SITE.countries || []).find(country => country.id === id) || null;
    }

    function getAirport(country, id) {
      return (country.airports || []).find(airport => airport.id === id) || null;
    }

    function esc(text) {
      return String(text || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    }

    function oldHrefToHash(href) {
      if (!href) return "";
      if (href.startsWith("#")) return href;

      const clean = href
        .replace(/^https?:\/\/[^/]+/i, "")
        .replace(/^\//, "")
        .replace(/^\.\//, "")
        .trim();

      if (clean === "" || clean === "index.html") {
        return "#";
      }

      for (const country of (SITE.countries || [])) {
        const countryHref = String(country.href || "")
          .replace(/^\//, "")
          .replace(/^\.\//, "")
          .trim();

        if (countryHref && clean === countryHref) {
          return `#tara=${encodeURIComponent(country.id)}`;
        }

        for (const airport of (country.airports || [])) {
          const airportHref = String(airport.href || "")
            .replace(/^\//, "")
            .replace(/^\.\//, "")
            .trim();

          if (airportHref && clean === airportHref) {
            return `#tara=${encodeURIComponent(country.id)}&aeroport=${encodeURIComponent(airport.id)}`;
          }
        }
      }

      return href;
    }

    function normalizeStoredLinks() {
      const keys = [
        "flx_favorites",
        "flx_fav_aeroport",
        "flx_fav_zboruri",
        "flx_watch_zboruri"
      ];

      keys.forEach((key) => {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) return;

          const arr = JSON.parse(raw);
          if (!Array.isArray(arr)) return;

          let changed = false;

          const fixed = arr.map((item) => {
            if (!item || typeof item !== "object") return item;

            const copy = { ...item };

            if (copy.href) {
              const nextHref = oldHrefToHash(copy.href);
              if (nextHref !== copy.href) {
                copy.href = nextHref;
                changed = true;
              }
            }

            if (copy.pageHref) {
              const nextPageHref = oldHrefToHash(copy.pageHref);
              if (nextPageHref !== copy.pageHref) {
                copy.pageHref = nextPageHref;
                changed = true;
              }
            }

            return copy;
          });

          if (changed) {
            localStorage.setItem(key, JSON.stringify(fixed));
          }
        } catch (error) {
          console.error("Eroare la normalizarea linkurilor:", key, error);
        }
      });
    }

    document.addEventListener("click", function (event) {
      const link = event.target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      const converted = oldHrefToHash(href);

      if (converted !== href && converted.startsWith("#")) {
        event.preventDefault();
        window.location.hash = converted;
      }
    });

    function renderHome() {
      document.body.dataset.page = "tari";

      const mapAreas = (SITE.countries || []).map(country => {
        if (!country.map || !country.map.coords) return "";

        return `
          <area
            alt="${esc(country.name)}"
            href="#tara=${encodeURIComponent(country.id)}"
            coords="${esc(country.map.coords)}"
            shape="${esc(country.map.shape || "poly")}">
        `;
      }).join("");

      document.getElementById("app").innerHTML = `
        <h1>Zboruri ✈️</h1>

        <div class="layout">
          <ul class="lista">
            ${(SITE.countries || []).map(country => `
              <li>
                <a href="#tara=${encodeURIComponent(country.id)}">
                  <span class="nume">
                    <span class="icon">✈</span> ${esc(country.name)}
                  </span>
                  <span class="cod">${esc(country.code || "")}</span>
                </a>
              </li>
            `).join("")}
          </ul>

          <div class="card-map">
            <img
              src="${esc(SITE.index_image || "images/image_harta.png")}"
              class="harta"
              usemap="#image-map"
              alt="Harta Europei">
          </div>
        </div>

        <map name="image-map" id="image-map">
          ${mapAreas}
        </map>
      `;

      // Curăţă secţiunile auxiliare (nu sunt necesare pe pagina de ţări)
      document.getElementById("reviews-root").innerHTML = "";
      document.getElementById("watch-root").innerHTML = "";
      document.getElementById("ticket-root").innerHTML = "";
    }

    function renderCountry(country) {
      document.body.dataset.page = "aeroporturi";

      const mapName = `map-${country.id}`;

      const mapAreas = (country.airports || []).map(airport => {
        if (!airport.map || !airport.map.coords) return "";

        return `
          <area
            href="#tara=${encodeURIComponent(country.id)}&aeroport=${encodeURIComponent(airport.id)}"
            coords="${esc(airport.map.coords)}"
            shape="${esc(airport.map.shape || "circle")}"
            alt="${esc(airport.name)}">
        `;
      }).join("");

      document.getElementById("app").innerHTML = `
        <h1>${esc(country.page_title || (country.name + " — Aeroporturi"))}</h1>

        <div class="row">
          <ul class="lista">
            ${(country.airports || []).map(airport => `
              <li>
                <a href="#tara=${encodeURIComponent(country.id)}&aeroport=${encodeURIComponent(airport.id)}">
                  <span class="nume">
                    <span class="icon">✈</span> ${esc(airport.name)}
                  </span>
                  <span class="cod">${esc(airport.code || "")}</span>
                </a>
              </li>
            `).join("")}
          </ul>

          <img
            src="${esc(String(country.image || "").replace(/^\.\.\//, ""))}"
            class="harta"
            usemap="#${mapName}"
            alt="${esc(country.name)}">
        </div>

        <map name="${mapName}">
          ${mapAreas}
        </map>

        <div class="back-actions">
          <a href="#" class="btn-back" id="back-home">Înapoi la țări</a>
        </div>
      `;

      const back = document.getElementById("back-home");
      if (back) {
        back.addEventListener("click", function (event) {
          event.preventDefault();
          window.location.hash = "";
        });
      }

      // Curăţă secţiunile auxiliare (nu sunt necesare pe pagina de aeroporturi)
      document.getElementById("reviews-root").innerHTML = "";
      document.getElementById("watch-root").innerHTML = "";
      document.getElementById("ticket-root").innerHTML = "";
    }

    function renderAirport(country, airport) {
      document.body.dataset.page = "zboruri";

      const groups = {};

      (airport.flights || []).forEach(flight => {
        const key = flight.destination_country || "Altele";
        if (!groups[key]) groups[key] = [];
        groups[key].push(flight);
      });

      const content = (airport.flights || []).length
        ? Object.entries(groups).map(([destination, flights]) => `
            <h2>${esc(destination)}</h2>
            <table border="1" cellpadding="10" width="100%">
               <thead>
                <th>Data</th>
                <th>Decolare</th>
                <th>Aterizare</th>
                <th>Agenția</th>
                <th>Preț</th>
               </thead>
              ${flights.map(flight => `
                  <tr>
                   <td>${esc(flight.date)}</td>
                   <td>${esc(flight.departure)}</td>
                   <td>${esc(flight.arrival)}</td>
                   <td>${esc(flight.agency)}</td>
                   <td>${esc(flight.price)}</td>
                  </tr>
              `).join("")}
             </table>
            <br>
          `).join("")
        : `
            <div class="card">
              <h1>${esc(SITE.unavailable_page?.heading || "✈️ Momentan nu există zboruri")}</h1>
              <p>${esc(SITE.unavailable_page?.message || "Nu avem încă rute disponibile pentru această țară.")}</p>
            </div>
          `;

      document.getElementById("app").innerHTML = `
        <h1>${esc(airport.page_title || airport.name)}</h1>
        ${content}

        <div class="back-actions">
          <a href="#tara=${encodeURIComponent(country.id)}" class="btn-back" id="back-to-airports">
            Înapoi la aeroporturi
          </a>

          <a href="#" class="btn-back" id="back-home">
            Înapoi la țări
          </a>
        </div>
      `;

      const backHome = document.getElementById("back-home");
      if (backHome) {
        backHome.addEventListener("click", function (event) {
          event.preventDefault();
          window.location.hash = "";
        });
      }

      // Curăţă secţiunile auxiliare; ele vor fi completate de zboruri.js
      document.getElementById("reviews-root").innerHTML = "";
      document.getElementById("watch-root").innerHTML = "";
      document.getElementById("ticket-root").innerHTML = "";
    }

    function dispatchSpaRender() {
      if (typeof imageMapResize === "function") {
        setTimeout(() => {
          try {
            imageMapResize();
          } catch (error) {
            console.error(error);
          }
        }, 0);
      }

      document.dispatchEvent(new CustomEvent("spa:render", {
        detail: { page: document.body.dataset.page }
      }));
    }

    function renderRoute() {
      const { tara, aeroport } = parseHash();

      if (!tara) {
        renderHome();
        dispatchSpaRender();
        return;
      }

      const country = getCountry(tara);
      if (!country) {
        renderHome();
        dispatchSpaRender();
        return;
      }

      if (!aeroport) {
        renderCountry(country);
        dispatchSpaRender();
        return;
      }

      const airport = getAirport(country, aeroport);
      if (!airport) {
        renderCountry(country);
        dispatchSpaRender();
        return;
      }

      renderAirport(country, airport);
      dispatchSpaRender();
    }

  async function initApp() {
    const app = document.getElementById("app");

    try {
      const response = await fetch("./site.json");

      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }

      const text = await response.text();
      SITE = JSON.parse(text);

      normalizeStoredLinks();
      renderRoute();
      window.addEventListener("hashchange", renderRoute);

    } catch (error) {
      console.error("EROARE REALĂ:", error);
      app.innerHTML = `
        <h1>Zboruri ✈️</h1>
        <p style="font-weight:800;color:#b91c1c;">${String(error.message)}</p>
      `;
    }
  }

  initApp();
</script>

</body>
</html>