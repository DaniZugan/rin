
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
