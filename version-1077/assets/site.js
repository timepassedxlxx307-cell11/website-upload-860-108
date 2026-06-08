(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        var opened = mobilePanel.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
      });
    }

    var backTop = document.querySelector(".back-top");
    if (backTop) {
      backTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    var hero = document.querySelector("[data-hero-slider]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var activeIndex = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, currentIndex) {
          slide.classList.toggle("active", currentIndex === activeIndex);
        });

        dots.forEach(function (dot, currentIndex) {
          dot.classList.toggle("active", currentIndex === activeIndex);
        });
      }

      function startSlider() {
        timer = window.setInterval(function () {
          showSlide(activeIndex + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          window.clearInterval(timer);
          showSlide(Number(dot.getAttribute("data-slide")) || 0);
          startSlider();
        });
      });

      startSlider();
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    var filterInput = document.querySelector("[data-filter-input]");
    var filterYear = document.querySelector("[data-filter-year]");
    var searchableCards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
    var noResults = document.querySelector("[data-no-results]");

    function applyFilter() {
      if (!searchableCards.length) {
        return;
      }

      var keyword = normalize(filterInput ? filterInput.value : "");
      var yearValue = filterYear ? filterYear.value : "";
      var visibleCount = 0;

      searchableCards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var year = card.getAttribute("data-year") || "";
        var keywordOk = !keyword || text.indexOf(keyword) !== -1;
        var yearOk = true;

        if (yearValue === "classic") {
          var parsedYear = parseInt(year, 10);
          yearOk = parsedYear && parsedYear < 2000;
        } else if (yearValue) {
          yearOk = year === yearValue;
        }

        var visible = keywordOk && yearOk;
        card.style.display = visible ? "" : "none";

        if (visible) {
          visibleCount += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle("show", visibleCount === 0);
      }
    }

    if (filterInput && query) {
      filterInput.value = query;
    }

    if (filterInput) {
      filterInput.addEventListener("input", applyFilter);
    }

    if (filterYear) {
      filterYear.addEventListener("change", applyFilter);
    }

    applyFilter();
  });
})();
