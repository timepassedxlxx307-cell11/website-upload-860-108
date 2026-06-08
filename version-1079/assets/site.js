(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.hasAttribute('hidden');
      if (open) {
        mobilePanel.removeAttribute('hidden');
      } else {
        mobilePanel.setAttribute('hidden', '');
      }
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  var hero = document.querySelector('.hero-carousel');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function nextSlide() {
      showSlide(current + 1);
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(nextSlide, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    var prevButton = hero.querySelector('.hero-prev');
    var nextButton = hero.querySelector('.hero-next');
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(current - 1);
        startHero();
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(current + 1);
        startHero();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startHero();
      });
    });
    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    startHero();
  }

  var sortableGrid = document.querySelector('.sortable-grid');
  var sortSelect = document.querySelector('.sort-select');
  if (sortableGrid && sortSelect) {
    var initialCards = Array.prototype.slice.call(sortableGrid.querySelectorAll('.movie-card'));
    sortSelect.addEventListener('change', function () {
      var cards = initialCards.slice();
      var value = sortSelect.value;
      cards.sort(function (a, b) {
        if (value === 'year-desc') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        if (value === 'year-asc') {
          return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
        }
        if (value === 'title-asc') {
          return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
        }
        return initialCards.indexOf(a) - initialCards.indexOf(b);
      });
      cards.forEach(function (card) {
        sortableGrid.appendChild(card);
      });
    });
  }

  var viewButtons = Array.prototype.slice.call(document.querySelectorAll('.view-toggle'));
  if (sortableGrid && viewButtons.length) {
    viewButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var view = button.getAttribute('data-view');
        sortableGrid.classList.toggle('list-view', view === 'list');
        viewButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
      });
    });
  }

  var searchResults = document.getElementById('searchResults');
  var searchTitle = document.getElementById('searchTitle');
  var searchHint = document.getElementById('searchHint');
  var searchInput = document.getElementById('searchInput');
  if (searchResults && window.SiteSearchData) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    if (searchInput) {
      searchInput.value = query;
    }
    if (query) {
      var words = query.toLowerCase().split(/\s+/).filter(Boolean);
      var matches = window.SiteSearchData.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.summary].join(' ').toLowerCase();
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 96);
      if (searchTitle) {
        searchTitle.textContent = '搜索结果：' + query;
      }
      if (searchHint) {
        searchHint.textContent = matches.length ? '已为你匹配相关影视内容。' : '暂未找到完全匹配的影片，可尝试更换关键词。';
      }
      searchResults.innerHTML = matches.map(renderSearchCard).join('');
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderSearchCard(movie) {
    var tags = String(movie.tags || '')
      .split(',')
      .filter(Boolean)
      .slice(0, 3)
      .map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      })
      .join('');
    return '' +
      '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '">' +
        '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
          '<img class="poster-image" src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<div class="poster-shade"><span class="play-dot">▶</span></div>' +
        '</a>' +
        '<div class="card-body">' +
          '<div class="meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
          '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p>' + escapeHtml(movie.summary) + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }
})();
