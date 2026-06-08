(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
      menuButton.textContent = mobilePanel.classList.contains('is-open') ? '×' : '☰';
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5000);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        startTimer();
      });
    }

    startTimer();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterList = document.querySelector('[data-filter-list]');

  if (filterInput && filterList) {
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));

    filterInput.addEventListener('input', function () {
      var query = filterInput.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase() + ' ' + Array.prototype.map.call(card.attributes, function (attr) {
          return attr.value;
        }).join(' ').toLowerCase();
        card.classList.toggle('is-hidden-by-filter', query && text.indexOf(query) === -1);
      });
    });
  }

  var searchInput = document.getElementById('searchPageInput');
  var searchResults = document.getElementById('searchResults');
  var searchStatus = document.getElementById('searchStatus');

  if (searchInput && searchResults && searchStatus && window.MOVIE_SEARCH_DATA) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function renderResults(query) {
      var q = query.trim().toLowerCase();
      searchResults.innerHTML = '';

      if (!q) {
        searchStatus.textContent = '请输入关键词进行搜索。';
        return;
      }

      var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        return movie.searchText.indexOf(q) !== -1;
      }).slice(0, 120);

      searchStatus.textContent = '找到 ' + matched.length + ' 条相关结果' + (matched.length === 120 ? '（最多显示前 120 条）' : '') + '。';

      searchResults.innerHTML = matched.map(function (movie) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-wrap" href="' + escapeHtml(movie.url) + '">',
          '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy" onerror="this.closest(\'.poster-wrap\').classList.add(\'poster-missing\'); this.remove();">',
          '    <span class="poster-badge">HD</span>',
          '    <span class="poster-play">▶</span>',
          '  </a>',
          '  <div class="card-body">',
          '    <div class="card-meta-line"><span class="card-category">' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
          '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
          '    <p>' + escapeHtml(movie.description) + '</p>',
          '    <div class="card-foot"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.score) + ' 分</span></div>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');
    }

    renderResults(initialQuery);

    searchInput.addEventListener('input', function () {
      renderResults(searchInput.value);
    });
  }
}());
