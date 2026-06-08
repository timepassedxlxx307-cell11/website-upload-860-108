import { H as Hls } from './hls-vendor.js';

export function initMoviePlayer(options) {
    var video = document.getElementById(options.elementId);
    var shell = document.getElementById(options.shellId);
    var overlay = document.getElementById(options.overlayId);
    var button = document.getElementById(options.buttonId);
    var message = document.getElementById(options.messageId);
    var loaded = false;
    var hls = null;

    if (!video || !shell) {
        return;
    }

    function setMessage(text) {
        if (!message) {
            return;
        }
        message.textContent = text;
        message.hidden = !text;
    }

    function loadMedia() {
        if (loaded) {
            return Promise.resolve();
        }

        loaded = true;
        var source = options.src;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }

        return new Promise(function (resolve) {
            if (video.readyState > 0) {
                resolve();
                return;
            }
            video.addEventListener('loadedmetadata', resolve, { once: true });
            window.setTimeout(resolve, 700);
        });
    }

    function start(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        shell.classList.add('is-loading');
        shell.classList.add('is-playing');
        video.controls = true;
        setMessage('');
        loadMedia();

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise
                .catch(function () {
                    shell.classList.remove('is-playing');
                    setMessage('播放暂时不可用，请稍后重试');
                })
                .finally(function () {
                    shell.classList.remove('is-loading');
                });
        } else {
            shell.classList.remove('is-loading');
        }
    }

    if (overlay) {
        overlay.addEventListener('click', start);
    }

    if (button) {
        button.addEventListener('click', start);
    }

    video.addEventListener('play', function () {
        shell.classList.add('is-playing');
        setMessage('');
    });

    video.addEventListener('error', function () {
        shell.classList.remove('is-playing');
        setMessage('播放暂时不可用，请稍后重试');
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
