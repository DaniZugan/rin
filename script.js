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
      const duration = 2200;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
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

const recommendationsTabs = document.querySelector('[data-recommendations-tabs]');
if (recommendationsTabs) {
  const tabs = recommendationsTabs.querySelectorAll('[data-recommendation-tab]');
  const panels = recommendationsTabs.querySelectorAll('.recommendation-content');
  const guidelinesLink = recommendationsTabs.querySelector('#recommendationsGuidelinesLink');
  const goalsLink = recommendationsTabs.querySelector('#recommendationsGoalsLink');
  const tabPeriodMap = {
    po: 'OBDP',
    vio1: 'OBD1',
    vio23: 'OBD2',
  };

  const updateRecommendationLinks = (targetId) => {
    const period = tabPeriodMap[targetId] || 'OBDP';
    if (guidelinesLink) {
      guidelinesLink.href = `smernice-ucnih-aktivnosti.html?obd=${encodeURIComponent(period)}`;
    }
    if (goalsLink) {
      goalsLink.href = `katalog-znanja.html?obd=${encodeURIComponent(period)}`;
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.recommendationTab;

      tabs.forEach((item) => {
        const isActive = item === tab;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-selected', String(isActive));
      });

      panels.forEach((panel) => {
        panel.hidden = panel.id !== targetId;
      });

      updateRecommendationLinks(targetId);
    });
  });

  const activeTab = recommendationsTabs.querySelector('[data-recommendation-tab].is-active');
  updateRecommendationLinks(activeTab?.dataset.recommendationTab || 'po');
}

const guidelinesRoot = document.querySelector('[data-guidelines-page]');
if (guidelinesRoot && window.SMER_NACRTOVANJA_RIN) {
  const data = window.SMER_NACRTOVANJA_RIN;
  const periodButtons = guidelinesRoot.querySelectorAll('[data-guidelines-period]');
  const sklopButtons = guidelinesRoot.querySelectorAll('[data-guidelines-sklop]');
  const body = guidelinesRoot.querySelector('#guidelineBody');
  const goalsLink = guidelinesRoot.querySelector('#guidelineGoalsLink');
  const periodIds = new Set(data.periods.map((period) => period.id));
  const getPeriodFromUrl = () => {
    const period = new URLSearchParams(window.location.search).get('obd');
    return periodIds.has(period) ? period : 'OBDP';
  };
  let activePeriod = getPeriodFromUrl();
  let activeSklop = 'racunalniski-sistemi';

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const findById = (items, id) => items.find((item) => item.id === id);

  const renderGuideline = () => {
    const text = data.guidelines?.[activePeriod]?.[activeSklop] || '';
    body.innerHTML = text
      ? text.split(/\n{2,}/).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')
      : '<p>Smernica za izbrano kombinacijo še ni dodana.</p>';
    if (goalsLink) {
      goalsLink.href = `katalog-znanja.html?obd=${encodeURIComponent(activePeriod)}`;
    }
  };

  const setActiveButton = (buttons, attr, value) => {
    buttons.forEach((button) => {
      const isActive = button.dataset[attr] === value;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  };

  periodButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activePeriod = button.dataset.guidelinesPeriod;
      setActiveButton(periodButtons, 'guidelinesPeriod', activePeriod);
      window.history.replaceState({}, '', `smernice-ucnih-aktivnosti.html?obd=${encodeURIComponent(activePeriod)}`);
      renderGuideline();
    });
  });

  sklopButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeSklop = button.dataset.guidelinesSklop;
      setActiveButton(sklopButtons, 'guidelinesSklop', activeSklop);
      renderGuideline();
    });
  });

  setActiveButton(periodButtons, 'guidelinesPeriod', activePeriod);
  renderGuideline();
}

const progressRoot = document.querySelector('[data-progress-page]');
if (progressRoot && window.IZHODISCA_SPREMLJANJA_RIN) {
  const data = window.IZHODISCA_SPREMLJANJA_RIN;
  const periodButtons = progressRoot.querySelectorAll('[data-progress-period]');
  const sklopButtons = progressRoot.querySelectorAll('[data-progress-sklop]');
  const body = progressRoot.querySelector('#progressBody');
  const goalsLink = progressRoot.querySelector('#progressGoalsLink');
  let activePeriod = 'OBDP';
  let activeSklop = 'racunalniski-sistemi';

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const findById = (items, id) => items.find((item) => item.id === id);

  const renderProgress = () => {
    const entry = data.entries?.[activePeriod]?.[activeSklop] || {};
    const paragraphs = entry.paragraphs || [];
    const points = entry.points || [];
    const paragraphHtml = paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
    const pointsHtml = points.length
      ? `<h3>Izhodiščne postavke za oblikovanje kriterijev uspešnosti</h3><ul>${points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}</ul>`
      : '';

    body.innerHTML = (paragraphHtml || pointsHtml)
      ? `${paragraphHtml}${pointsHtml}`
      : '<p>Izhodišča za izbrano kombinacijo še niso dodana.</p>';
    goalsLink.href = `katalog-znanja.html?obd=${encodeURIComponent(activePeriod)}`;
  };

  const setActiveButton = (buttons, attr, value) => {
    buttons.forEach((button) => {
      const isActive = button.dataset[attr] === value;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  };

  periodButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activePeriod = button.dataset.progressPeriod;
      setActiveButton(periodButtons, 'progressPeriod', activePeriod);
      renderProgress();
    });
  });

  sklopButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeSklop = button.dataset.progressSklop;
      setActiveButton(sklopButtons, 'progressSklop', activeSklop);
      renderProgress();
    });
  });

  renderProgress();
}

const catalogRoot = document.querySelector('[data-knowledge-catalog]');
if (catalogRoot && window.KATALOG_ZNANJA) {
  const nav = catalogRoot.querySelector('#catalogNav');
  const goals = catalogRoot.querySelector('#catalogGoals');
  const periodTabs = catalogRoot.querySelector('#catalogPeriodTabs');
  const pageTitle = catalogRoot.querySelector('#catalogPageTitle');
  const pageLogo = catalogRoot.querySelector('#catalogPageLogo');
  const pageLogoLink = catalogRoot.querySelector('#catalogPageLogoLink');
  const currentSklop = catalogRoot.querySelector('#catalogCurrentSklop');
  const currentPodsklop = catalogRoot.querySelector('#catalogCurrentPodsklop');
  const currentMeta = catalogRoot.querySelector('#catalogCurrentMeta');
  const periods = ['OBDP', 'OBD1', 'OBD2', 'OBD3'];
  const periodMeta = {
    OBDP: {
      label: 'PO',
      title: 'predšolsko obdobje',
      logo: 'assets/Slike/logo-brin.png',
      logoAlt: 'Logotip projekta B-RIN',
      projectUrl: 'brin.html',
      projectLabel: 'Več o projektu B-RIN',
    },
    OBD1: {
      label: '1. VIO',
      title: 'prvo vzgojno-izobraževalno obdobje osnovne šole (1. - 3. razred)',
      logo: 'assets/Slike/logo-brin.png',
      logoAlt: 'Logotip projekta B-RIN',
      projectUrl: 'brin.html',
      projectLabel: 'Več o projektu B-RIN',
    },
    OBD2: {
      label: '2. VIO',
      title: 'drugo vzgojno-izobraževalno obdobje osnovne šole (4. - 6. razred)',
      logo: 'assets/Slike/logo-marinka.png',
      logoAlt: 'Logotip projekta MARiNKA',
      projectUrl: 'marinka.html',
      projectLabel: 'Več o projektu MARiNKA',
    },
    OBD3: {
      label: '3. VIO',
      title: 'tretje vzgojno-izobraževalno obdobje osnovne šole (7. - 9. razred)',
      logo: 'assets/Slike/logo-marinka.png',
      logoAlt: 'Logotip projekta MARiNKA',
      projectUrl: 'marinka.html',
      projectLabel: 'Več o projektu MARiNKA',
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
    'OBD3_Algoritmi_in_programiranje_Algoritmi_C2_slika1.jpg',
    'OBD3_Omrezja_in_internet_Omrezne_komunikacije_C2_slika1.jpg',
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

  const renderCatalogMedia = (fileName, isSummaryMedia = false) => {
    const href = escapeHtml(getCatalogMediaHref(fileName));
    const label = escapeHtml(fileName);
    const mediaClass = `catalog-media${isSummaryMedia ? ' catalog-media-summary' : ''}`;
    const mediaTag = isSummaryMedia ? 'span' : 'figure';

    if (isCatalogImage(fileName)) {
      return `
        <${mediaTag} class="${mediaClass}">
          <a href="${href}" target="_blank" rel="noopener">
            <img src="${href}" alt="${label}" loading="lazy">
          </a>
        </${mediaTag}>
      `;
    }

    return `
      <a class="catalog-media-link" href="${href}" target="_blank" rel="noopener">
        Odpri gradivo
      </a>
    `;
  };

  const renderCatalogText = (value, fallback, options = {}) => {
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
      parts.push(renderCatalogMedia(fileName, options.summaryMedia));
      lastIndex = offset + fileName.length;
      return fileName;
    });
    parts.push(escapeHtml(text.slice(lastIndex)));

    catalogMediaPattern.lastIndex = 0;
    return parts.join('');
  };

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
    if (pageLogoLink) {
      pageLogoLink.href = meta.projectUrl;
      pageLogoLink.setAttribute('aria-label', meta.projectLabel);
    }
    document.title = `${meta.title} – Računalništvo in informatika`;
  };

  const renderPeriodTabs = () => {
    periodTabs.innerHTML = periods.map((period) => `
      <a class="catalog-period-tab${period === activePeriod ? ' is-active' : ''}" href="katalog-znanja.html?obd=${period}" data-period="${period}" aria-current="${period === activePeriod ? 'page' : 'false'}">${periodMeta[period].label}</a>
    `).join('');
  };

  const renderNav = () => {
    nav.innerHTML = activeCatalog.map((sklop) => `
      <div class="catalog-nav-group">
        <h3 class="catalog-nav-title">${escapeHtml(sklop.title)}</h3>
        ${sklop.podsklopi.map((podsklop) => `
          <button class="catalog-subtopic-btn${podsklop.id === activePodsklopId ? ' is-active' : ''}" type="button" data-podsklop="${escapeHtml(podsklop.id)}" aria-pressed="${podsklop.id === activePodsklopId}">
            <span>${escapeHtml(podsklop.title)}</span>
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
    currentSklop.textContent = `${periodMeta[activePeriod].label} / ${sklop.title}`;
    currentPodsklop.textContent = podsklop.title;
    currentMeta.textContent = contentText;
    currentMeta.hidden = !contentText;

    goals.innerHTML = podsklop.skupine.flatMap((skupina) => skupina.cilji).map((cilj) => `
      <details class="goal-card">
        <summary>
          <span class="goal-summary-content">
            <span class="goal-card-eyebrow">Učni cilj</span>
            <span class="goal-title">${renderCatalogText(cilj.cilj, '', { summaryMedia: true })}</span>
          </span>
        </summary>
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

const rinScenariosRoot = document.querySelector('[data-rin-scenarios-page]');
if (rinScenariosRoot && Array.isArray(window.RIN_SCENARIJI)) {
  const cards = rinScenariosRoot.querySelector('#rinScenarioCards');
  const count = rinScenariosRoot.querySelector('#rinScenarioCount');
  const filterButtons = rinScenariosRoot.querySelectorAll('[data-rin-scenario-filter]');
  let activeFilter = 'vsi';

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const assetHref = (path) => encodeURI(path);
  const formatList = (values) => Array.isArray(values) && values.length ? values.join(', ') : 'Ni navedeno';
  const formatPartner = (value) => {
    const partner = String(value || '')
      .replace(/^KP\s*\d{2}[ _]+/i, '')
      .replaceAll('_', ' ')
      .trim();
    const schoolNames = {
      Bled: 'OŠ Bled',
      Trzin: 'OŠ Trzin',
      'Voranca LJ': 'OŠ Voranca LJ',
    };
    return schoolNames[partner] || partner;
  };

  const renderRinScenarios = () => {
    const filteredScenarios = activeFilter === 'vsi'
      ? window.RIN_SCENARIJI
      : window.RIN_SCENARIJI.filter((item) => Array.isArray(item.sklopi) && item.sklopi.includes(activeFilter));

    count.textContent = `${filteredScenarios.length} učnih scenarijev`;
    cards.innerHTML = filteredScenarios.map((item) => `
      <article class="scenario-card">
        <div class="scenario-card-top">
          <p class="scenario-viz">${escapeHtml(item.obdobje || 'Temeljne vsebine RIN')}</p>
          <h2>${escapeHtml(item.naslov)}</h2>
          <p class="rin-grade-badge">Razred: ${escapeHtml(item.razred || 'Ni navedeno')}</p>
        </div>
        <dl class="scenario-meta">
          <div>
            <dt>Vključeni sklopi</dt>
            <dd>${escapeHtml(formatList(item.sklopi))}</dd>
          </div>
          <div>
            <dt>Konzorcijski partner</dt>
            <dd>${escapeHtml(formatPartner(item.partner))}</dd>
          </div>
        </dl>
        <div class="rin-scenario-actions">
          <a class="btn scenario-download" href="${escapeHtml(assetHref(item.download))}" download>
            Prenesi ${escapeHtml(item.downloadType || 'gradivo')}
          </a>
          ${item.video ? `
            <a class="btn secondary rin-video-link" href="${escapeHtml(item.video)}" target="_blank" rel="noopener">
              Odpri video
            </a>
          ` : ''}
        </div>
      </article>
    `).join('');
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.rinScenarioFilter;
      filterButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
      renderRinScenarios();
    });
  });

  renderRinScenarios();
}
