(function () {
    function showError(element, message) {
        if (element) {
            element.textContent = message;
            element.classList.add('is-visible');
        }
    }

    window.initMoviePlayer = function (config) {
        var video = document.querySelector(config.video);
        var cover = document.querySelector(config.cover);
        var errorBox = document.querySelector(config.error);
        var source = config.source;
        var hls = null;
        var ready = false;

        if (!video || !source) {
            return;
        }

        function startPlayback() {
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    showError(errorBox, '播放启动失败，请再次点击播放。');
                });
            }
        }

        function bindStart(element) {
            if (element) {
                element.addEventListener('click', function (event) {
                    event.preventDefault();
                    startPlayback();
                });
            }
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            ready = true;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                ready = true;
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        showError(errorBox, '播放暂时不可用，请稍后再试。');
                        hls.destroy();
                    }
                }
            });
        } else {
            video.src = source;
            ready = true;
        }

        bindStart(cover);
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });
        video.addEventListener('error', function () {
            if (!ready) {
                showError(errorBox, '播放暂时不可用，请稍后再试。');
            }
        });
    };
})();
