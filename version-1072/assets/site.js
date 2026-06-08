(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');

        if (toggle && menu) {
            toggle.addEventListener('click', function () {
                menu.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var value = input ? input.value.trim() : '';
                var action = form.getAttribute('action') || './search.html';
                var target = value ? action + '?q=' + encodeURIComponent(value) : action;
                window.location.href = target;
            });
        });

        initHero();
        initFilterList();
    });

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        if (!slides.length) {
            return;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot, current) {
            dot.addEventListener('click', function () {
                show(current);
                if (timer) {
                    window.clearInterval(timer);
                    start();
                }
            });
        });

        show(0);
        start();
    }

    function initFilterList() {
        var list = document.querySelector('[data-filter-list]');
        var input = document.querySelector('[data-filter-input]');
        var sort = document.querySelector('[data-sort-select]');
        var count = document.querySelector('[data-visible-count]');

        if (!list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        if (input && query) {
            input.value = query;
        }

        function compare(a, b, mode) {
            if (mode === 'latest') {
                return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            }
            if (mode === 'popular') {
                return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
            }
            if (mode === 'rating') {
                return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
            }
            if (mode === 'title') {
                return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-CN');
            }
            return 0;
        }

        function update() {
            var term = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;
            var mode = sort ? sort.value : 'default';
            var ordered = cards.slice().sort(function (a, b) {
                return compare(a, b, mode);
            });

            ordered.forEach(function (card) {
                var text = card.dataset.search || '';
                var matched = !term || text.indexOf(term) !== -1;
                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
                list.appendChild(card);
            });

            if (count) {
                count.textContent = String(visible);
            }
        }

        if (input) {
            input.addEventListener('input', update);
        }
        if (sort) {
            sort.addEventListener('change', update);
        }

        update();
    }
})();
