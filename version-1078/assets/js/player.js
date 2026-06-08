(function () {
  function attachStream(video, sourceUrl) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      video.load();
      return null;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      return hls;
    }

    video.src = sourceUrl;
    video.load();
    return null;
  }

  window.createMoviePlayer = function (options) {
    const video = document.getElementById(options.videoId);
    const overlay = document.getElementById(options.overlayId);

    if (!video || !overlay || !options.sourceUrl) {
      return;
    }

    let attached = false;
    let hlsInstance = null;

    const play = function () {
      if (!attached) {
        hlsInstance = attachStream(video, options.sourceUrl);
        attached = true;
      }

      const promise = video.play();

      if (promise && typeof promise.then === "function") {
        promise.then(function () {
          overlay.classList.add("is-hidden");
        }).catch(function () {
          overlay.classList.remove("is-hidden");
        });
      } else {
        overlay.classList.add("is-hidden");
      }
    };

    overlay.addEventListener("click", play);

    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        overlay.classList.remove("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      overlay.classList.remove("is-hidden");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  };
})();
