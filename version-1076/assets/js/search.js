(function () {
    function getParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[character];
        });
    }

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card card-compact\" data-title=\"" + escapeHtml(movie.title) + "\" data-region=\"" + escapeHtml(movie.region) + "\" data-type=\"" + escapeHtml(movie.type) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-genre=\"" + escapeHtml(movie.genre) + "\" data-tags=\"" + escapeHtml((movie.tags || []).join(",")) + "\">" +
            "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + " 在线观看\">" +
            "<img class=\"poster-img\" src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-shade\"></span><span class=\"poster-chip\">" + escapeHtml(movie.category) + "</span><span class=\"poster-type\">" + escapeHtml(movie.type) + "</span></a>" +
            "<div class=\"card-body\"><h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p><div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div><div class=\"tag-row\">" + tags + "</div></div></article>";
    }

    function render(movies) {
        var target = document.querySelector("[data-search-results]");
        if (!target) {
            return;
        }
        target.innerHTML = movies.slice(0, 120).map(card).join("");
        target.querySelectorAll(".poster-img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.style.opacity = "0";
            }, { once: true });
        });
    }

    function run() {
        var form = document.querySelector("[data-search-form]");
        var source = Array.isArray(window.MOVIES) ? window.MOVIES : [];
        if (!form || !source.length) {
            return;
        }
        var qInput = form.querySelector("[name='q']");
        var cInput = form.querySelector("[name='category']");
        var yInput = form.querySelector("[name='year']");
        qInput.value = getParam("q");

        function collect(event) {
            if (event) {
                event.preventDefault();
            }
            var query = qInput.value.trim().toLowerCase();
            var category = cInput.value;
            var year = yInput.value;
            var results = source.filter(function (movie) {
                var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.oneLine].join(" ").toLowerCase();
                var okQuery = !query || haystack.indexOf(query) !== -1;
                var okCategory = !category || movie.category === category;
                var okYear = !year || String(movie.year) === String(year);
                return okQuery && okCategory && okYear;
            });
            render(results.length ? results : source.slice(0, 60));
        }

        form.addEventListener("submit", collect);
        qInput.addEventListener("input", collect);
        cInput.addEventListener("change", collect);
        yInput.addEventListener("change", collect);
        collect();
    }

    if (document.readyState !== "loading") {
        run();
    } else {
        document.addEventListener("DOMContentLoaded", run);
    }
})();
