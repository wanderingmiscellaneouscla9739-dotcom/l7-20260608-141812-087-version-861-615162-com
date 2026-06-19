(function () {
  function attach(options) {
    var video = document.getElementById(options.videoId);
    var cover = document.getElementById(options.coverId);
    var stream = options.stream;
    var hls = null;
    var ready = false;

    if (!video || !cover || !stream) {
      return;
    }

    function loadStream() {
      if (ready) {
        return;
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        cover.classList.add('is-hidden');
        video.setAttribute('title', '播放暂时不可用');
      }
    }

    function play() {
      loadStream();
      cover.classList.add('is-hidden');
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          cover.classList.remove('is-hidden');
        });
      }
    }

    cover.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      cover.classList.add('is-hidden');
    });
    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  window.SitePlayer = {
    attach: attach
  };
})();
