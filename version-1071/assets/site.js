(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeIndex);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = Number(dot.getAttribute('data-hero-dot'));
      showSlide(index);
      window.clearInterval(timer);
      timer = null;
      startHero();
    });
  });

  showSlide(0);
  startHero();

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters(scope) {
    var input = scope.querySelector('[data-filter-input]');
    var selects = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-select]'));
    var grid = document.querySelector('.filter-grid');
    var emptyState = document.querySelector('[data-empty-state]');

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function run() {
      var query = normalize(input ? input.value : '');
      var activeFilters = {};

      selects.forEach(function (select) {
        activeFilters[select.getAttribute('data-filter-select')] = normalize(select.value);
      });

      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' '));

        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesSelects = Object.keys(activeFilters).every(function (key) {
          var filterValue = activeFilters[key];
          return !filterValue || normalize(card.getAttribute('data-' + key)) === filterValue;
        });

        var shouldShow = matchesQuery && matchesSelects;
        card.style.display = shouldShow ? '' : 'none';

        if (shouldShow) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.style.display = visible ? 'none' : 'block';
      }
    }

    if (input) {
      input.addEventListener('input', run);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', run);
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && input) {
      input.value = q;
    }

    run();
  }

  var filterScope = document.querySelector('[data-filter-scope]');

  if (filterScope) {
    applyFilters(filterScope);
  }
})();
