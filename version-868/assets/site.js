(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = qs('[data-menu-button]');
    var mobileNav = qs('[data-mobile-nav]');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    var heroIndex = 0;
    var heroTimer = null;

    function activateHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === heroIndex);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === heroIndex);
        });
    }

    function startHero() {
        if (slides.length <= 1) {
            return;
        }
        heroTimer = window.setInterval(function () {
            activateHero(heroIndex + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            activateHero(index);
            if (heroTimer) {
                window.clearInterval(heroTimer);
                startHero();
            }
        });
    });
    activateHero(0);
    startHero();

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterItems(panel) {
        var scopeSelector = panel.getAttribute('data-filter-scope');
        var scope = scopeSelector ? qs(scopeSelector) : document;
        var items = qsa('[data-title]', scope || document);
        var keyword = normalize(qs('[data-filter-keyword]', panel) && qs('[data-filter-keyword]', panel).value);
        var year = normalize(qs('[data-filter-year]', panel) && qs('[data-filter-year]', panel).value);
        var type = normalize(qs('[data-filter-type]', panel) && qs('[data-filter-type]', panel).value);
        var visible = 0;

        items.forEach(function (item) {
            var text = normalize([
                item.getAttribute('data-title'),
                item.getAttribute('data-region'),
                item.getAttribute('data-type'),
                item.getAttribute('data-year'),
                item.getAttribute('data-tags')
            ].join(' '));
            var ok = true;
            if (keyword && text.indexOf(keyword) === -1) {
                ok = false;
            }
            if (year && normalize(item.getAttribute('data-year')) !== year) {
                ok = false;
            }
            if (type && normalize(item.getAttribute('data-type')) !== type) {
                ok = false;
            }
            item.classList.toggle('is-hidden', !ok);
            if (ok) {
                visible += 1;
            }
        });

        var empty = qs('[data-empty-state]', scope || document);
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    qsa('[data-filter-panel]').forEach(function (panel) {
        qsa('input, select', panel).forEach(function (control) {
            control.addEventListener('input', function () {
                filterItems(panel);
            });
            control.addEventListener('change', function () {
                filterItems(panel);
            });
        });
    });
}());

function initializeMoviePlayer(videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var playerReady = false;
    var hlsInstance = null;

    if (!video || !button || !streamUrl) {
        return;
    }

    function attachStream() {
        if (playerReady) {
            return Promise.resolve();
        }
        playerReady = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 60
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            return new Promise(function (resolve) {
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                window.setTimeout(resolve, 1600);
            });
        }

        video.src = streamUrl;
        return Promise.resolve();
    }

    function playMovie() {
        button.classList.add('is-hidden');
        attachStream().then(function () {
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        });
    }

    button.addEventListener('click', playMovie);
    video.addEventListener('play', function () {
        button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
            button.classList.remove('is-hidden');
        }
    });
    video.addEventListener('ended', function () {
        button.classList.remove('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
