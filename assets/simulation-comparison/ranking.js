(() => {
  const root = document.querySelector('.sim-ranking');
  if (!root) return;
  const tabs = [...root.querySelectorAll('[data-rank-set]')];
  function select(tab) {
    for (const item of tabs) {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      root.querySelector(`#rank-panel-${item.dataset.rankSet}`).hidden = !active;
    }
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', e => {
      const next = {ArrowRight:(i+1)%tabs.length, ArrowLeft:(i+tabs.length-1)%tabs.length, Home:0, End:tabs.length-1}[e.key];
      if (next === undefined) return;
      e.preventDefault(); tabs[next].focus(); select(tabs[next]);
    });
  });
})();
