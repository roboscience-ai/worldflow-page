(() => {
  const root = document.querySelector('#simulation');
  const cases = JSON.parse(root.querySelector('#simulation-videos-data').textContent);
  const tabs = [...root.querySelectorAll('[data-video-set]')];
  const stage = root.querySelector('#sim-video-stage');
  const video = root.querySelector('#sim-execution-video');
  const thumbs = root.querySelector('#sim-video-thumbnails');
  const pairs = root.querySelector('#sim-flow-pairs');
  let currentSet = 'specific';
  let index = 0;
  let videoVisible = false;

  function showFlows(flows) {
    const steps = flows.map((flow, stepIndex) => {
      const step = document.createElement('section');
      step.className = 'rebuttal-step';
      if (flows.length > 1) {
        const title = document.createElement('h6');
        title.textContent = `Step ${stepIndex + 1}`;
        step.append(title);
      }
      const grid = document.createElement('div');
      grid.className = 'rebuttal-flow-grid';
      for (const [model, label] of [['worldflow', 'WorldFlow'], ['mu0', 'μ₀']]) {
        const figure = document.createElement('figure');
        const caption = document.createElement('figcaption');
        caption.textContent = label;
        const link = document.createElement('a');
        link.className = 'image-link';
        link.href = flow[model];
        link.target = '_blank';
        link.rel = 'noopener';
        const image = document.createElement('img');
        image.src = flow[model];
        image.alt = `${label} predicted trajectories`;
        image.width = flow.width;
        image.height = flow.height;
        link.append(image);
        figure.append(caption, link);
        grid.append(figure);
      }
      step.append(grid);
      return step;
    });
    pairs.replaceChildren(...steps);
  }

  function loadVideo() {
    if (!video.getAttribute('src')) {
      video.src = video.dataset.src;
      video.load();
    }
  }

  function showCase() {
    const examples = cases[currentSet];
    const example = examples[index];
    const setLabel = currentSet[0].toUpperCase() + currentSet.slice(1);
    video.pause();
    video.removeAttribute('src');
    video.dataset.src = example.video;
    video.poster = example.poster;
    video.load();
    root.querySelector('#sim-example-count').textContent = `Case ${index + 1} / ${examples.length} · ${setLabel}`;
    root.querySelector('#sim-video-title').textContent = example.title;
    root.querySelector('#sim-video-instruction').textContent = example.instruction;
    [...thumbs.children].forEach((button, i) => button.setAttribute('aria-pressed', i === index));
    showFlows(example.flows);
    if (videoVisible) loadVideo();
  }

  function selectSet(name) {
    currentSet = name;
    index = 0;
    for (const tab of tabs) {
      const active = tab.dataset.videoSet === name;
      tab.setAttribute('aria-selected', active);
      tab.tabIndex = active ? 0 : -1;
    }
    stage.setAttribute('aria-labelledby', `sim-video-tab-${name}`);
    thumbs.replaceChildren(...cases[name].map((example, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `Case ${i + 1}: ${example.title}`);
      const image = document.createElement('img');
      image.src = example.poster;
      image.alt = '';
      image.loading = 'lazy';
      image.width = 240;
      image.height = 135;
      const label = document.createElement('span');
      label.textContent = `${i + 1}. ${example.title}`;
      button.append(image, label);
      button.addEventListener('click', () => {
        index = i;
        showCase();
      });
      return button;
    }));
    showCase();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectSet(tab.dataset.videoSet));
    tab.addEventListener('keydown', event => {
      const destinations = {
        ArrowRight: (i + 1) % tabs.length,
        ArrowLeft: (i + tabs.length - 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      };
      const next = destinations[event.key];
      if (next === undefined) return;
      event.preventDefault();
      tabs[next].focus();
      selectSet(tabs[next].dataset.videoSet);
    });
  });
  for (const [direction, delta] of [['prev', -1], ['next', 1]]) {
    root.querySelector(`#sim-video-${direction}`).addEventListener('click', () => {
      const length = cases[currentSet].length;
      index = (index + delta + length) % length;
      showCase();
    });
  }
  video.addEventListener('pointerdown', loadVideo);
  video.addEventListener('focus', loadVideo);
  new IntersectionObserver(([entry]) => {
    videoVisible = entry.isIntersecting;
    if (videoVisible) loadVideo();
    else video.pause();
  }, {threshold: 0.15}).observe(video);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
  });
  selectSet(currentSet);
})();
