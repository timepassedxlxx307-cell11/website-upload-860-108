var CinemaPlayer = (function () {
  function setup(options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var button = document.getElementById(options.buttonId);
    var source = options.source;
    var started = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (started) {
        return Promise.resolve();
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      video.setAttribute('controls', 'controls');
      return Promise.resolve();
    }

    function start() {
      attach().then(function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            if (overlay) {
              overlay.classList.remove('hidden');
            }
          });
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    if (button) {
      button.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!started || video.paused) {
        start();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  }

  return {
    setup: setup
  };
})();
