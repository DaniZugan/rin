const initSiteHeader = () => {
  const btn = document.querySelector('.menu-btn');
  const mobile = document.querySelector('.mobile-menu');
  if (btn && mobile && !btn.dataset.ready) {
    btn.dataset.ready = 'true';
    btn.addEventListener('click', () => mobile.classList.toggle('open'));
    mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobile.classList.remove('open')));
  }

  document.querySelectorAll('.main-nav .dropdown').forEach((dd) => {
    if (dd.dataset.ready) return;
    dd.dataset.ready = 'true';
    const btn = dd.querySelector('.dropbtn');
    const isTouch = window.matchMedia('(hover: none)').matches;

    if (isTouch && btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.querySelectorAll('.main-nav .dropdown').forEach((other) => {
          if (other !== dd) other.classList.remove('open');
        });
        dd.classList.toggle('open');
      });
    }

    dd.addEventListener('mouseenter', () => {
      if (!isTouch) dd.classList.add('open');
    });
    dd.addEventListener('mouseleave', () => {
      if (!isTouch) dd.classList.remove('open');
    });
  });
};

initSiteHeader();
document.addEventListener('site:includes-loaded', initSiteHeader);

const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 24));
      const tick = () => {
        current += step;
        if (current >= target) {
          el.textContent = target;
        } else {
          el.textContent = current;
          requestAnimationFrame(tick);
        }
      };
      tick();
      io.unobserve(el);
    });
  }, { threshold: 0.45 });
  counters.forEach(c => io.observe(c));
}
document.addEventListener('click', () => {
  if (window.matchMedia('(hover: none)').matches) {
    document.querySelectorAll('.main-nav .dropdown').forEach((dd) => dd.classList.remove('open'));
  }
});

const catalogRoot = document.querySelector('[data-knowledge-catalog]');
if (catalogRoot && window.KATALOG_ZNANJA) {
  const nav = catalogRoot.querySelector('#catalogNav');
  const goals = catalogRoot.querySelector('#catalogGoals');
  const periodTabs = catalogRoot.querySelector('#catalogPeriodTabs');
  const pageTitle = catalogRoot.querySelector('#catalogPageTitle');
  const pageLogo = catalogRoot.querySelector('#catalogPageLogo');
  const currentSklop = catalogRoot.querySelector('#catalogCurrentSklop');
  const currentPodsklop = catalogRoot.querySelector('#catalogCurrentPodsklop');
  const currentMeta = catalogRoot.querySelector('#catalogCurrentMeta');
  const periods = ['OBDP', 'OBD1', 'OBD2', 'OBD3'];
  const periodMeta = {
    OBDP: {
      title: 'Predšolsko obdobje',
      logo: 'assets/Slike/logo-brin.png',
      logoAlt: 'Logotip projekta B-RIN',
    },
    OBD1: {
      title: 'Prvo vzgojno-izobraževalno obdobje osnovne šole (1. - 3. razred)',
      logo: 'assets/Slike/logo-brin.png',
      logoAlt: 'Logotip projekta B-RIN',
    },
    OBD2: {
      title: 'Drugo vzgojno-izobraževalno obdobje osnovne šole (4. - 6. razred)',
      logo: 'assets/Slike/logo-marinka.png',
      logoAlt: 'Logotip projekta MARiNKA',
    },
    OBD3: {
      title: 'Tretje vzgojno-izobraževalno obdobje osnovne šole (7. - 9. razred)',
      logo: 'assets/Slike/logo-marinka.png',
      logoAlt: 'Logotip projekta MARiNKA',
    },
  };

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const catalogMediaBase = 'assets/Katalog-slike/';
  const catalogMediaFiles = [
    'OBD2_Omrezja in internet_Omrezne komunikacije in organizacija_C5.png',
    'OBD2_Racunalniski sistemi_Strojna in programska oprema_C1.png',
    'OBD3_Omrezja_in_internet_Kibernetska_varnost_C2_primer_dejavnosti.docx',
    'OBD3_Omrezja_in_internet_Kibernetska_varnost_C2_primer_dejavnosti.pdf',
    'OBD3_Omrezja_in_internet_Omrezne_komunikacije_C3_primer_dejavnosti.docx',
    'OBD3_Omrezja_in_internet_Omrezne_komunikacije_C3_primer_dejavnosti.pdf',
    'OBD3_Podatki_in_analiza_Shranjevanje_C1_slika1.jpg',
    'OBD3_Podatki_in_analiza_Zbiranje_C2_slika1_page-0001.jpg',
    'OBD3_Podatki_in_analiza_Zbiranje_C2_slika2_page-0001.jpg',
    'OBD3_Podatki_in_analiza_Zbiranje_C2_slika3_page-0001.jpg',
  ];
  const catalogMediaPattern = new RegExp(
    catalogMediaFiles
      .map((fileName) => fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|'),
    'g'
  );
  const getCatalogMediaHref = (fileName) => catalogMediaBase + encodeURIComponent(fileName);
  const isCatalogImage = (fileName) => /\.(png|jpe?g|gif|webp|svg)$/i.test(fileName);

  const renderCatalogMedia = (fileName) => {
    const href = escapeHtml(getCatalogMediaHref(fileName));
    const label = escapeHtml(fileName);

    if (isCatalogImage(fileName)) {
      return `
        <figure class="catalog-media">
          <a href="${href}" target="_blank" rel="noopener">
            <img src="${href}" alt="${label}" loading="lazy">
          </a>
        </figure>
      `;
    }

    return `
      <a class="catalog-media-link" href="${href}" target="_blank" rel="noopener">
        Odpri gradivo
      </a>
    `;
  };

  const renderCatalogText = (value, fallback) => {
    const text = String(value || fallback || '');
    if (!text || !catalogMediaPattern.test(text)) {
      catalogMediaPattern.lastIndex = 0;
      return escapeHtml(text);
    }

    catalogMediaPattern.lastIndex = 0;
    let lastIndex = 0;
    const parts = [];

    text.replace(catalogMediaPattern, (fileName, offset) => {
      const beforeMedia = text
        .slice(lastIndex, offset)
        .replace(/Glej sliko:\s*$/i, '');

      parts.push(escapeHtml(beforeMedia));
      parts.push(renderCatalogMedia(fileName));
      lastIndex = offset + fileName.length;
      return fileName;
    });
    parts.push(escapeHtml(text.slice(lastIndex)));

    catalogMediaPattern.lastIndex = 0;
    return parts.join('');
  };

  const countGoals = (podsklop) => podsklop.skupine
    .reduce((total, skupina) => total + skupina.cilji.length, 0);

  const getPeriodFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const period = String(params.get('obd') || 'OBDP').toUpperCase();
    return periods.includes(period) && window.KATALOG_ZNANJA[period] ? period : 'OBDP';
  };

  let activePeriod = getPeriodFromUrl();
  let activeCatalog = window.KATALOG_ZNANJA[activePeriod];

  const findSelection = (podsklopId) => {
    for (const sklop of activeCatalog) {
      const podsklop = sklop.podsklopi.find((item) => item.id === podsklopId);
      if (podsklop) return { sklop, podsklop };
    }
    const sklop = activeCatalog[0];
    return { sklop, podsklop: sklop.podsklopi[0] };
  };

  let activePodsklopId = activeCatalog[0].podsklopi[0].id;

  const renderPeriodMeta = () => {
    const meta = periodMeta[activePeriod];
    catalogRoot.classList.remove('catalog-theme-obdp', 'catalog-theme-obd1', 'catalog-theme-obd2', 'catalog-theme-obd3');
    catalogRoot.classList.add(`catalog-theme-${activePeriod.toLowerCase()}`);
    pageTitle.textContent = meta.title;
    pageLogo.src = meta.logo;
    pageLogo.alt = meta.logoAlt;
    document.title = `${meta.title} – Računalništvo in informatika`;
  };

  const renderPeriodTabs = () => {
    periodTabs.innerHTML = periods.map((period) => `
      <a class="catalog-period-tab${period === activePeriod ? ' is-active' : ''}" href="katalog-znanja.html?obd=${period}" data-period="${period}" aria-current="${period === activePeriod ? 'page' : 'false'}">${period}</a>
    `).join('');
  };

  const renderNav = () => {
    nav.innerHTML = activeCatalog.map((sklop) => `
      <div class="catalog-nav-group">
        <h3 class="catalog-nav-title">${escapeHtml(sklop.title)}</h3>
        ${sklop.podsklopi.map((podsklop) => `
          <button class="catalog-subtopic-btn${podsklop.id === activePodsklopId ? ' is-active' : ''}" type="button" data-podsklop="${escapeHtml(podsklop.id)}" aria-pressed="${podsklop.id === activePodsklopId}">
            <span>${escapeHtml(podsklop.title)}</span>
            <span class="catalog-count">${countGoals(podsklop)}</span>
          </button>
        `).join('')}
      </div>
    `).join('');
  };

  const renderGoals = () => {
    const { sklop, podsklop } = findSelection(activePodsklopId);
    const contentText = podsklop.skupine
      .map((skupina) => skupina.vsebina)
      .filter(Boolean)
      .join('\n\n');
    currentSklop.textContent = `${activePeriod} / ${sklop.title}`;
    currentPodsklop.textContent = podsklop.title;
    currentMeta.textContent = contentText;
    currentMeta.hidden = !contentText;

    goals.innerHTML = podsklop.skupine.flatMap((skupina) => skupina.cilji).map((cilj) => `
      <details class="goal-card">
        <summary>${escapeHtml(cilj.cilj)}</summary>
        <div class="goal-detail-grid">
          <div class="goal-detail">
            <h4>Razlaga</h4>
            <div class="goal-rich-text">${renderCatalogText(cilj.razlaga, 'Razlaga ni dodana.')}</div>
          </div>
          <div class="goal-detail">
            <h4>Primeri</h4>
            <div class="goal-rich-text">${renderCatalogText(cilj.primer, 'Primeri niso dodani.')}</div>
          </div>
        </div>
      </details>
    `).join('');
  };

  nav.addEventListener('click', (event) => {
    const button = event.target.closest('[data-podsklop]');
    if (!button) return;
    activePodsklopId = button.dataset.podsklop;
    renderNav();
    renderGoals();
  });

  periodTabs.addEventListener('click', (event) => {
    const link = event.target.closest('[data-period]');
    if (!link) return;
    event.preventDefault();
    activePeriod = link.dataset.period;
    activeCatalog = window.KATALOG_ZNANJA[activePeriod];
    activePodsklopId = activeCatalog[0].podsklopi[0].id;
    window.history.pushState({}, '', `katalog-znanja.html?obd=${activePeriod}`);
    renderPeriodMeta();
    renderPeriodTabs();
    renderNav();
    renderGoals();
  });

  window.addEventListener('popstate', () => {
    activePeriod = getPeriodFromUrl();
    activeCatalog = window.KATALOG_ZNANJA[activePeriod];
    activePodsklopId = activeCatalog[0].podsklopi[0].id;
    renderPeriodMeta();
    renderPeriodTabs();
    renderNav();
    renderGoals();
  });

  renderPeriodMeta();
  renderPeriodTabs();
  renderNav();
  renderGoals();
}

const scenariosRoot = document.querySelector('[data-scenarios-page]');
if (scenariosRoot && Array.isArray(window.RACEK_SCENARIJI)) {
  const cards = scenariosRoot.querySelector('#scenarioCards');
  const count = scenariosRoot.querySelector('#scenarioCount');

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const pdfHref = (path) => encodeURI(path);
  const formatAuthors = (value) => String(value || '').split('\n').filter(Boolean).join(', ');

  count.textContent = `${window.RACEK_SCENARIJI.length} učnih scenarijev`;
  cards.innerHTML = window.RACEK_SCENARIJI.map((item) => `
    <article class="scenario-card">
      <div class="scenario-card-top">
        <p class="scenario-viz">${escapeHtml(item.viz)}</p>
        <h2>${escapeHtml(item.naslov)}</h2>
      </div>
      <p class="scenario-summary">${escapeHtml(item.povzetek)}</p>
      <dl class="scenario-meta">
        <div>
          <dt>Ključne besede</dt>
          <dd>${escapeHtml(item.kljucneBesede)}</dd>
        </div>
        <div>
          <dt>Avtorji</dt>
          <dd>${escapeHtml(formatAuthors(item.avtorji))}</dd>
        </div>
      </dl>
      <a class="btn scenario-download" href="${escapeHtml(pdfHref(item.pdf))}" target="_blank" rel="noopener">
        Odpri PDF
      </a>
    </article>
  `).join('');
}
