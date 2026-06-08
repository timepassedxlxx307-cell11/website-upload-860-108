(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".player-cover");
      var message = player.querySelector(".player-message");
      var source = player.getAttribute("data-video-src");
      var started = false;
      var hls = null;

      function showMessage(text) {
        if (message) {
          message.textContent = text;
          message.classList.add("show");
        }
      }

      function playVideo() {
        if (cover) {
          cover.classList.add("is-hidden");
        }

        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            showMessage("点击视频区域即可继续播放");
          });
        }
      }

      function start() {
        if (!video || !source) {
          showMessage("视频加载失败，请稍后重试");
          return;
        }

        if (started) {
          playVideo();
          return;
        }

        started = true;

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage("视频加载失败，请稍后重试");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", playVideo, { once: true });
          video.load();
        } else {
          showMessage("当前浏览器不支持该视频格式");
        }
      }

      if (cover) {
        cover.addEventListener("click", start);
      }

      video.addEventListener("click", function () {
        if (!started) {
          start();
        } else if (video.paused) {
          playVideo();
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
