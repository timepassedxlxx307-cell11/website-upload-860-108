var Hls = window.Hls;

function setMessage(card, message) {
  var messageBox = card.querySelector('[data-player-message]');

  if (messageBox) {
    messageBox.textContent = message || '';
  }
}

function initPlayer(card) {
  var video = card.querySelector('.js-hls-player');
  var overlay = card.querySelector('[data-player-overlay]');

  if (!video) {
    return;
  }

  var source = video.dataset.src;
  var hls = null;
  var initialized = false;

  function attachSource() {
    if (initialized) {
      return;
    }

    initialized = true;

    if (!source) {
      setMessage(card, '未找到播放源。');
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        card.classList.add('is-ready');
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setMessage(card, '视频加载失败，请稍后重试。');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      card.classList.add('is-ready');
    } else {
      setMessage(card, '当前浏览器不支持 HLS 播放。');
    }
  }

  function playVideo() {
    attachSource();

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setMessage(card, '浏览器阻止了自动播放，请再点击一次播放器。');
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', function () {
      overlay.classList.add('is-hidden');
      playVideo();
    });
  }

  video.addEventListener('play', function () {
    card.classList.add('is-playing');
    setMessage(card, '');
  });

  video.addEventListener('pause', function () {
    card.classList.remove('is-playing');
  });

  video.addEventListener('click', function () {
    attachSource();
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.querySelectorAll('[data-player-card]').forEach(initPlayer);
