document.addEventListener("DOMContentLoaded", function() {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function() {
            mobileNav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener("click", function() {
                show(dotIndex);
                schedule();
            });
        });
        if (prev) {
            prev.addEventListener("click", function() {
                show(index - 1);
                schedule();
            });
        }
        if (next) {
            next.addEventListener("click", function() {
                show(index + 1);
                schedule();
            });
        }
        schedule();
    }

    var filterForm = document.querySelector("[data-filter-form]");
    if (filterForm) {
        var searchInput = filterForm.querySelector("[data-filter-search]");
        var typeSelect = filterForm.querySelector("[data-filter-type]");
        var yearSelect = filterForm.querySelector("[data-filter-year]");
        var grid = document.querySelector("[data-filter-grid]");
        var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card")) : [];
        function applyFilters() {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var typeValue = typeSelect ? typeSelect.value : "";
            var yearValue = yearSelect ? yearSelect.value : "";
            cards.forEach(function(card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" ").toLowerCase();
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesType = !typeValue || card.getAttribute("data-type") === typeValue;
                var matchesYear = !yearValue || card.getAttribute("data-year").indexOf(yearValue) !== -1;
                card.classList.toggle("is-filter-hidden", !(matchesKeyword && matchesType && matchesYear));
            });
        }
        [searchInput, typeSelect, yearSelect].forEach(function(control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    }

    var searchForm = document.getElementById("globalSearchForm");
    var searchInput = document.getElementById("globalSearchInput");
    var searchResults = document.getElementById("globalSearchResults");
    var searchTitle = document.getElementById("searchResultTitle");
    if (searchForm && searchInput && searchResults && Array.isArray(window.SITE_MOVIES)) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        searchInput.value = initialQuery;
        function safeText(value) {
            return String(value || "").replace(/[&<>'"]/g, function(match) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    "'": "&#39;",
                    "\"": "&quot;"
                }[match];
            });
        }
        function renderCard(movie) {
            return "<a class=\"movie-card\" href=\"" + safeText(movie.file) + "\">" +
                "<span class=\"poster-wrap\"><img src=\"" + safeText(movie.cover) + "\" alt=\"" + safeText(movie.title) + "\" loading=\"lazy\"><span class=\"poster-gradient\"></span><span class=\"corner-ribbon\">" + safeText(movie.type) + "</span><span class=\"play-mark\">▶</span></span>" +
                "<span class=\"card-body\"><span class=\"card-title\">" + safeText(movie.title) + "</span><span class=\"card-desc\">" + safeText(movie.one_line) + "</span><span class=\"card-meta\"><span>" + safeText(movie.year) + "</span><span>" + safeText(movie.region) + "</span></span><span class=\"card-genre\">" + safeText(movie.genre) + "</span></span>" +
                "</a>";
        }
        function performSearch(query) {
            var normalized = query.trim().toLowerCase();
            if (!normalized) {
                searchTitle.textContent = "推荐影片";
                searchResults.innerHTML = window.SITE_MOVIES.slice(0, 36).map(renderCard).join("");
                return;
            }
            var terms = normalized.split(/\s+/).filter(Boolean);
            var matches = window.SITE_MOVIES.filter(function(movie) {
                var haystack = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags,
                    movie.one_line
                ].join(" ").toLowerCase();
                return terms.every(function(term) {
                    return haystack.indexOf(term) !== -1;
                });
            }).slice(0, 96);
            searchTitle.textContent = matches.length ? "搜索结果" : "没有找到匹配影片";
            searchResults.innerHTML = matches.map(renderCard).join("");
        }
        searchForm.addEventListener("submit", function(event) {
            event.preventDefault();
            var query = searchInput.value.trim();
            var nextUrl = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
            window.history.replaceState(null, "", nextUrl);
            performSearch(query);
        });
        performSearch(initialQuery);
    }
});
