
const btn = document.querySelector('.menu-btn');
const mobile = document.querySelector('.mobile-menu');
if (btn && mobile) {
  btn.addEventListener('click', () => mobile.classList.toggle('open'));
  mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobile.classList.remove('open')));
}

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




// modern dropdown behavior: hover on desktop, click on touch/mobile
document.querySelectorAll('.main-nav .dropdown').forEach((dd) => {
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
  const currentSklop = catalogRoot.querySelector('#catalogCurrentSklop');
  const currentPodsklop = catalogRoot.querySelector('#catalogCurrentPodsklop');
  const currentMeta = catalogRoot.querySelector('#catalogCurrentMeta');
  const periods = ['OBDP', 'OBD1', 'OBD2', 'OBD3'];

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const countGoals = (podsklop) => podsklop.skupine
    .reduce((total, skupina) => total + skupina.cilji.length, 0);

  const getPeriodFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const period = String(params.get('obd') || 'OBD3').toUpperCase();
    return periods.includes(period) && window.KATALOG_ZNANJA[period] ? period : 'OBD3';
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
            <p>${escapeHtml(cilj.razlaga || 'Razlaga ni dodana.')}</p>
          </div>
          <div class="goal-detail">
            <h4>Primeri</h4>
            <p>${escapeHtml(cilj.primer || 'Primeri niso dodani.')}</p>
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
    renderPeriodTabs();
    renderNav();
    renderGoals();
  });

  window.addEventListener('popstate', () => {
    activePeriod = getPeriodFromUrl();
    activeCatalog = window.KATALOG_ZNANJA[activePeriod];
    activePodsklopId = activeCatalog[0].podsklopi[0].id;
    renderPeriodTabs();
    renderNav();
    renderGoals();
  });

  renderPeriodTabs();
  renderNav();
  renderGoals();
}
