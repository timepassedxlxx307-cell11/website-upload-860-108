(function () {
    function select(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupNavigation() {
        var toggle = select('.nav-toggle');
        var links = select('#navLinks');
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener('click', function () {
            var opened = links.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    function setupHero() {
        var hero = select('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        function activate(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                activate(index);
            });
        });
        window.setInterval(function () {
            activate(current + 1);
        }, 5200);
    }

    function setupFilters() {
        selectAll('[data-filter-panel]').forEach(function (panel) {
            var input = select('[data-filter-input]', panel);
            var region = select('[data-filter-region]', panel);
            var type = select('[data-filter-type]', panel);
            var cards = selectAll('[data-filter-card]');
            function apply() {
                var keyword = normalize(input && input.value);
                var regionValue = normalize(region && region.value);
                var typeValue = normalize(type && type.value);
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-genre'),
                        card.textContent
                    ].join(' '));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var matched = (!keyword || text.indexOf(keyword) !== -1) &&
                        (!regionValue || cardRegion === regionValue) &&
                        (!typeValue || cardType === typeValue);
                    card.style.display = matched ? '' : 'none';
                });
            }
            [input, region, type].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
        });
    }

    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function createResultCard(item) {
        var link = document.createElement('a');
        link.className = 'movie-card';
        link.href = item.url;

        var poster = document.createElement('div');
        poster.className = 'movie-poster';

        var image = document.createElement('img');
        image.src = item.cover;
        image.alt = item.title;
        image.loading = 'lazy';
        poster.appendChild(image);

        var region = document.createElement('span');
        region.className = 'movie-region';
        region.textContent = item.region;
        poster.appendChild(region);

        var year = document.createElement('span');
        year.className = 'movie-year';
        year.textContent = item.year;
        poster.appendChild(year);

        var play = document.createElement('span');
        play.className = 'movie-play';
        play.textContent = '▶';
        poster.appendChild(play);

        var body = document.createElement('div');
        body.className = 'movie-card-body';

        var title = document.createElement('h2');
        title.textContent = item.title;
        body.appendChild(title);

        var intro = document.createElement('p');
        intro.textContent = item.oneLine;
        body.appendChild(intro);

        var meta = document.createElement('div');
        meta.className = 'movie-meta';
        [item.type, item.genre].forEach(function (value) {
            var span = document.createElement('span');
            span.textContent = value;
            meta.appendChild(span);
        });
        body.appendChild(meta);

        var tags = document.createElement('div');
        tags.className = 'movie-tags';
        (item.tags || []).slice(0, 3).forEach(function (value) {
            var tag = document.createElement('span');
            tag.textContent = value;
            tags.appendChild(tag);
        });
        body.appendChild(tags);

        link.appendChild(poster);
        link.appendChild(body);
        return link;
    }

    function setupSearchPage() {
        var results = select('#searchResults');
        var input = select('#searchInput');
        var summary = select('#searchSummary');
        if (!results || !input || !summary || !window.SEARCH_INDEX) {
            return;
        }
        var initial = getQueryValue('q');
        input.value = initial;
        function render() {
            var keyword = normalize(input.value);
            results.innerHTML = '';
            if (!keyword) {
                summary.textContent = '请输入关键词开始搜索';
                return;
            }
            var matched = window.SEARCH_INDEX.filter(function (item) {
                var text = normalize([
                    item.title,
                    item.region,
                    item.type,
                    item.year,
                    item.genre,
                    item.oneLine,
                    (item.tags || []).join(' ')
                ].join(' '));
                return text.indexOf(keyword) !== -1;
            }).slice(0, 120);
            summary.textContent = matched.length ? '搜索结果' : '没有找到相关影视';
            matched.forEach(function (item) {
                results.appendChild(createResultCard(item));
            });
        }
        input.addEventListener('input', render);
        render();
    }

    function setupPlayer(source) {
        var video = select('#moviePlayer');
        var overlay = select('#playOverlay');
        var message = select('#playerMessage');
        if (!video || !source) {
            return;
        }
        function showMessage(text) {
            if (message) {
                message.textContent = text;
                message.hidden = false;
            }
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    showMessage('视频加载失败，请稍后重试');
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            showMessage('视频加载失败，请稍后重试');
        }
        function startPlayback() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }
        if (overlay) {
            overlay.addEventListener('click', startPlayback);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        video.addEventListener('ended', function () {
            if (overlay) {
                overlay.classList.remove('is-hidden');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupSearchPage();
    });

    window.Site = {
        setupPlayer: setupPlayer
    };
})();
