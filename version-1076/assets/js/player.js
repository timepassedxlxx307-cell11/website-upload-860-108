document.addEventListener("DOMContentLoaded", function () {
    var Hls = window.Hls;
    document.querySelectorAll("[data-player]").forEach(function (player) {
        var video = player.querySelector("video");
        var button = player.querySelector("[data-play]");
        if (!video) {
            return;
        }

        var source = video.dataset.hls || "";
        var attached = false;
        var pending = false;
        var hls = null;

        function markPlaying() {
            player.classList.add("is-playing");
        }

        function markPaused() {
            if (video.paused) {
                player.classList.remove("is-playing");
            }
        }

        function requestPlay() {
            if (!pending) {
                return;
            }
            markPlaying();
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    player.classList.remove("is-playing");
                });
            }
        }

        function attach() {
            if (attached || !source) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", requestPlay, { once: true });
            } else if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, requestPlay);
            } else {
                video.src = source;
                video.addEventListener("loadedmetadata", requestPlay, { once: true });
            }
        }

        function start() {
            pending = true;
            attach();
            requestPlay();
        }

        if (button) {
            button.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", markPlaying);
        video.addEventListener("pause", markPaused);
        video.addEventListener("ended", markPaused);
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
});
