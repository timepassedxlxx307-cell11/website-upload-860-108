import { H as Hls } from "./hls-vendor-dru42stk.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function initNavigation() {
  const toggle = $(".nav-toggle");
  const nav = $(".site-nav");

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

function initHero() {
  const hero = $("[data-hero]");

  if (!hero) {
    return;
  }

  const slides = $$("[data-hero-slide]", hero);
  const dots = $$("[data-hero-dot]", hero);
  let current = 0;
  let timer = null;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === current);
    });
  };

  const start = () => {
    timer = window.setInterval(() => show(current + 1), 5000);
  };

  const restart = () => {
    window.clearInterval(timer);
    start();
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      show(index);
      restart();
    });
  });

  if (slides.length > 1) {
    start();
  }
}

function initLocalFilters() {
  const panel = $("[data-filter-panel]");
  const list = $("[data-card-list]");

  if (!panel || !list) {
    return;
  }

  const input = $("[data-list-filter]", panel);
  const yearSelect = $("[data-year-filter]", panel);
  const typeSelect = $("[data-type-filter]", panel);
  const cards = $$("[data-card]", list);

  const apply = () => {
    const query = normalizeText(input ? input.value : "");
    const year = yearSelect ? yearSelect.value : "";
    const type = typeSelect ? typeSelect.value : "";

    cards.forEach((card) => {
      const text = normalizeText(`${card.dataset.title} ${card.dataset.text}`);
      const sameYear = !year || card.dataset.year === year;
      const sameType = !type || card.dataset.type === type;
      const sameQuery = !query || text.includes(query);
      card.hidden = !(sameYear && sameType && sameQuery);
    });
  };

  [input, yearSelect, typeSelect].forEach((element) => {
    if (element) {
      element.addEventListener("input", apply);
      element.addEventListener("change", apply);
    }
  });
}

function initSearchPage() {
  const results = $("[data-search-results]");

  if (!results || !window.__MOVIE_INDEX__) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const query = normalizeText(params.get("q"));
  const title = $("[data-search-title]");
  const input = $("[data-search-input]");

  if (input && query) {
    input.value = params.get("q");
  }

  if (!query) {
    return;
  }

  const matched = window.__MOVIE_INDEX__
    .filter((movie) => normalizeText(movie.searchText).includes(query))
    .slice(0, 160);

  if (title) {
    title.textContent = matched.length ? `搜索结果：${params.get("q")}` : `未找到：${params.get("q")}`;
  }

  if (!matched.length) {
    results.innerHTML = '<div class="search-empty">没有找到相关影片，可以更换关键词再试。</div>';
    return;
  }

  results.innerHTML = matched.map((movie) => `
    <article class="movie-card" data-card>
      <a class="poster-link" href="${escapeHtml(movie.url)}" aria-label="观看${escapeHtml(movie.title)}">
        <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="poster-badge">${escapeHtml(movie.category)}</span>
        <span class="poster-play">▶</span>
      </a>
      <div class="card-content">
        <div class="card-meta">
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.year)}</span>
          <span>${escapeHtml(movie.type)}</span>
        </div>
        <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.oneLine)}</p>
        <div class="tag-row">${movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
        <div class="card-foot">
          <span class="rating">★ ${escapeHtml(movie.rating)}</span>
          <span>${Number(movie.views).toLocaleString()}次观看</span>
        </div>
      </div>
    </article>
  `).join("");
}

function initPlayers() {
  $$(".video-player").forEach((panel) => {
    const video = $("video", panel);
    const button = $(".player-start", panel);
    const state = $(".player-state", panel);
    const src = panel.dataset.hls;
    let hlsInstance = null;
    let prepared = false;

    if (!video || !button || !src) {
      return;
    }

    const setState = (message) => {
      if (state) {
        state.textContent = message || "";
      }
    };

    const play = () => {
      const promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
          setState("请再次点击播放");
          panel.classList.remove("is-playing");
        });
      }
    };

    const prepare = () => {
      if (prepared) {
        play();
        return;
      }

      prepared = true;
      setState("正在加载影片...");

      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          setState("");
          play();
        });
        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
          if (data && data.fatal) {
            setState("播放暂时中断，请稍后重试");
          }
        });
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.addEventListener("loadedmetadata", () => {
          setState("");
          play();
        }, { once: true });
        return;
      }

      setState("当前环境暂不支持播放");
    };

    button.addEventListener("click", () => {
      panel.classList.add("is-playing");
      prepare();
    });

    video.addEventListener("play", () => panel.classList.add("is-playing"));
    video.addEventListener("pause", () => {
      if (!video.ended) {
        return;
      }
      panel.classList.remove("is-playing");
    });
    window.addEventListener("beforeunload", () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}

initNavigation();
initHero();
initLocalFilters();
initSearchPage();
initPlayers();
