const loadInclude = async (selector, file) => {
  const target = document.querySelector(selector);
  if (!target) return;

  try {
    const response = await fetch(file, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`${file}: ${response.status}`);
    target.innerHTML = await response.text();
  } catch (error) {
    console.error('Include load failed:', error);
  }
};

Promise.all([
  loadInclude('#site-header', 'header.html'),
  loadInclude('#site-footer', 'footer.html'),
]).then(() => {
  document.dispatchEvent(new CustomEvent('site:includes-loaded'));
});
