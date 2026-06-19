(function () {
  function initVideo(video) {
    var source = video.getAttribute("data-video");
    var shell = video.closest(".video-shell");
    var trigger = shell ? shell.querySelector("[data-player-trigger]") : null;
    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (attached || !source) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      attach();
      if (trigger) {
        trigger.classList.add("is-hidden");
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      if (trigger) {
        trigger.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".video-player"));
    players.forEach(initVideo);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPlayers);
  } else {
    initPlayers();
  }
})();
