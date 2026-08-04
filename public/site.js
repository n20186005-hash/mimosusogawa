(() => {
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const mobileTools = document.querySelector('.mobile-tools');
  const backgroundRegions = [
    document.querySelector('main'),
    document.querySelector('.site-footer'),
    mobileTools
  ].filter(Boolean);

  const setMenuOpen = (open, returnFocus = false) => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    mobileMenu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    backgroundRegions.forEach((region) => {
      const shouldBeInert = open || (region === mobileTools && !mobileTools.classList.contains('is-visible'));
      region.toggleAttribute('inert', shouldBeInert);
      if (region === mobileTools) region.setAttribute('aria-hidden', String(shouldBeInert));
    });

    if (open) {
      requestAnimationFrame(() => mobileMenu.querySelector('a')?.focus());
    } else if (returnFocus) {
      menuToggle.focus();
    }
  };

  const closeMenu = (returnFocus = false) => setMenuOpen(false, returnFocus);

  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen, isOpen);
  });

  document.addEventListener('keydown', (event) => {
    if (!menuToggle || !mobileMenu || menuToggle.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(true);
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = [
      menuToggle,
      ...mobileMenu.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeMenu();
  });

  const updateScrollState = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
    if (mobileTools) {
      const toolsVisible = window.innerWidth <= 720 && window.scrollY > Math.min(520, window.innerHeight * 0.55);
      const toolsInteractive = toolsVisible && !document.body.classList.contains('menu-open');
      mobileTools.classList.toggle('is-visible', toolsVisible);
      mobileTools.toggleAttribute('inert', !toolsInteractive);
      mobileTools.setAttribute('aria-hidden', String(!toolsInteractive));
    }
  };

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();

  const pathname = window.location.pathname;
  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href !== '/' && pathname.startsWith(href)) {
      link.setAttribute('aria-current', 'page');
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      closeMenu();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const planner = document.querySelector('[data-planner]');
  if (planner) {
    const buttons = planner.querySelectorAll('[data-plan-button]');
    const title = planner.querySelector('[data-plan-title]');
    const time = planner.querySelector('[data-plan-time]');
    const description = planner.querySelector('[data-plan-description]');
    const stops = planner.querySelector('[data-plan-stops]');
    const distance = planner.querySelector('[data-plan-distance]');
    const plans = {
      short: {
        title: '公園の核心をめぐる', time: '30分',
        description: '像、古戦場碑、長州砲、関門橋。短い時間でも「二つの戦い」が一本につながります。',
        stops: ['御裳川バス停', '義経・知盛像', '古戦場碑', '長州砲', '関門橋'],
        distance: '園内をゆっくり約600m'
      },
      standard: {
        title: '海底県境まで歩く', time: '90分',
        description: '公園の歴史を見たあと、人道へ。山口県と福岡県の県境を海の下でまたぎ、同じ道を戻ります。',
        stops: ['みもすそ川公園', '関門プラザ', '人道入口', '海底県境', '下関側へ戻る'],
        distance: '往復の歩行 約2.2km'
      },
      long: {
        title: '本州から九州へ', time: '3時間',
        description: '人道を渡り切り、和布刈神社と門司側の海辺へ。二つの岸から関門橋を眺めます。',
        stops: ['みもすそ川公園', '関門トンネル人道', '門司側出口', '和布刈神社', '海峡散歩'],
        distance: '片道を含む歩行 約4km'
      },
      halfday: {
        title: '壇ノ浦の物語をたどる', time: '半日',
        description: '唐戸のにぎわいから、安徳天皇を祀る赤間神宮、決戦の海、そして海底へ。物語でつながる半日です。',
        stops: ['唐戸市場', '赤間神宮', 'みもすそ川公園', '関門トンネル人道', '門司側'],
        distance: 'バスと徒歩を組み合わせる旅'
      }
    };

    const showPlan = (key) => {
      const plan = plans[key];
      if (!plan || !title || !time || !description || !stops || !distance) return;
      title.textContent = plan.title;
      time.textContent = plan.time;
      description.textContent = plan.description;
      distance.textContent = plan.distance;
      stops.innerHTML = plan.stops.map((stop, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span>${stop}</li>`).join('');
      buttons.forEach((button) => {
        const active = button.getAttribute('data-plan-button') === key;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    };

    buttons.forEach((button) => button.addEventListener('click', () => showPlan(button.getAttribute('data-plan-button'))));
  }

  const map = document.querySelector('[data-park-map]');
  if (map) {
    const markers = map.querySelectorAll('[data-map-marker]');
    const number = map.querySelector('[data-map-number]');
    const title = map.querySelector('[data-map-title]');
    const description = map.querySelector('[data-map-description]');
    const items = {
      statues: ['01', '源義経・平知盛像', '八艘飛びの義経と、碇を背負う知盛。海峡を背に向き合う、公園の象徴です。'],
      monument: ['02', '壇ノ浦古戦場碑', '目の前の海が決戦の舞台だったことを、現在の景色に重ねる場所です。'],
      cannons: ['03', '長州砲', '幕末、海峡に据えられた砲台を原寸大のレプリカで伝えます。'],
      promenade: ['04', '海峡プロムナード', '潮の筋と行き交う船を最も近くに感じられる散歩道です。'],
      tunnel: ['05', '関門トンネル人道', '公園から歩いてすぐ。本州と九州を結ぶ780mの海底の道へ。']
    };
    markers.forEach((marker) => marker.addEventListener('click', () => {
      const item = items[marker.getAttribute('data-map-marker')];
      if (!item || !number || !title || !description) return;
      number.textContent = item[0];
      title.textContent = item[1];
      description.textContent = item[2];
      markers.forEach((button) => {
        const active = button === marker;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    }));
  }

  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    try {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealItems.forEach((item) => observer.observe(item));
      document.documentElement.classList.add('reveal-ready');
    } catch {
      document.documentElement.classList.remove('reveal-ready');
    }
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }
})();
