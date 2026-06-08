(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        var navSearch = document.querySelector(".nav-search");

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
                if (navSearch) {
                    navSearch.classList.toggle("is-open");
                }
            });
        }

        document.querySelectorAll(".poster-img, .category-card img, .hero-slide img, .detail-poster img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.style.opacity = "0";
            }, { once: true });
        });

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var prev = hero.querySelector(".hero-prev");
            var next = hero.querySelector(".hero-next");
            var current = 0;
            var timer = null;

            function activate(index) {
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
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    activate(current + 1);
                }, 5000);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    activate(current - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    activate(current + 1);
                    restart();
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    activate(index);
                    restart();
                });
            });

            restart();
        }

        document.querySelectorAll(".movie-filter").forEach(function (input) {
            var section = input.closest(".content-section");
            var list = null;
            if (section) {
                var next = section.nextElementSibling;
                if (next) {
                    list = next.querySelector("[data-card-list]");
                }
            }
            if (!list) {
                list = document.querySelector("[data-card-list]");
            }
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
            input.addEventListener("input", function () {
                var query = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var haystack = [
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(" ").toLowerCase();
                    card.classList.toggle("hidden-card", query && haystack.indexOf(query) === -1);
                });
            });
        });
    });
})();
