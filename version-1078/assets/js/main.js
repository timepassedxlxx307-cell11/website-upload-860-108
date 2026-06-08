(function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  const backTop = document.querySelector("[data-back-top]");

  if (backTop) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 360) {
        backTop.classList.add("is-visible");
      } else {
        backTop.classList.remove("is-visible");
      }
    });

    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    const prev = carousel.querySelector("[data-hero-prev]");
    const next = carousel.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    const activate = function (index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };

    const start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5000);
    };

    if (prev) {
      prev.addEventListener("click", function () {
        activate(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        activate(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
        start();
      });
    });

    start();
  }

  const searchInput = document.querySelector("#search-input");
  const resultCards = Array.from(document.querySelectorAll(".search-card"));
  const emptyState = document.querySelector("[data-empty-state]");
  const filterButtons = Array.from(document.querySelectorAll("[data-filter-value]"));

  if (searchInput && resultCards.length) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";
    searchInput.value = initialQuery;

    const normalize = function (value) {
      return String(value || "").trim().toLowerCase();
    };

    const getCardText = function (card) {
      return normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags,
        card.textContent
      ].join(" "));
    };

    const applyFilter = function (value) {
      const query = normalize(value);
      let visible = 0;

      resultCards.forEach(function (card) {
        const matched = !query || getCardText(card).includes(query);
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    };

    searchInput.addEventListener("input", function () {
      applyFilter(searchInput.value);
    });

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const value = button.dataset.filterValue || "";
        searchInput.value = value;
        filterButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilter(value);
      });
    });

    applyFilter(initialQuery);
  }
})();
