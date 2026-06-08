(function () {
  function initMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var button = document.getElementById(options.playButtonId);
    var status = document.getElementById(options.statusId);
    var started = false;
    var hls = null;

    if (!video || !options.source) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function loadSource() {
      if (started) {
        return Promise.resolve();
      }
      started = true;
      setStatus('正在加载...');

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(options.source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('');
          video.play().catch(function () {
            setStatus('点击播放器继续播放');
          });
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放加载失败，请稍后重试');
          }
        });
        return Promise.resolve();
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = options.source;
        return video.play().then(function () {
          setStatus('');
        }).catch(function () {
          setStatus('点击播放器继续播放');
        });
      }

      video.src = options.source;
      return video.play().then(function () {
        setStatus('');
      }).catch(function () {
        setStatus('播放加载失败，请稍后重试');
      });
    }

    function play() {
      hideOverlay();
      loadSource().then(function () {
        if (!video.paused) {
          return;
        }
        video.play().catch(function () {
          setStatus('点击播放器继续播放');
        });
      });
    }

    if (options.poster) {
      video.setAttribute('poster', options.poster);
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    if (button) {
      button.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', hideOverlay);
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
