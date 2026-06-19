(function () {
  function closest(root, selector) {
    if (!root) {
      return null;
    }
    return root.closest(selector);
  }

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var links = document.querySelector('.nav-links');
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener('click', function () {
      links.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('.hero');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      window.clearInterval(timer);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        stop();
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function collectValues(cards, key) {
    var values = [];
    var seen = {};
    cards.forEach(function (card) {
      var value = card.getAttribute(key) || '';
      if (value && !seen[value]) {
        seen[value] = true;
        values.push(value);
      }
    });
    return values.sort(function (a, b) {
      if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
        return Number(b) - Number(a);
      }
      return a.localeCompare(b, 'zh-Hans-CN');
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var containers = Array.prototype.slice.call(document.querySelectorAll('.filter-scope'));
    containers.forEach(function (container) {
      var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
      if (!cards.length) {
        return;
      }
      var search = container.querySelector('.movie-search');
      var year = container.querySelector('.year-filter');
      var type = container.querySelector('.type-filter');
      var empty = container.querySelector('.empty-state');
      fillSelect(year, collectValues(cards, 'data-year'));
      fillSelect(type, collectValues(cards, 'data-type'));

      function apply() {
        var query = search ? search.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var typeValue = type ? type.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year')
          ].join(' ').toLowerCase();
          var matched = true;
          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (yearValue && card.getAttribute('data-year') !== yearValue) {
            matched = false;
          }
          if (typeValue && card.getAttribute('data-type') !== typeValue) {
            matched = false;
          }
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        container.classList.toggle('no-results', visible === 0);
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (search) {
        search.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      if (type) {
        type.addEventListener('change', apply);
      }
      apply();
    });
  }

  function startPlayer(card) {
    if (!card) {
      return;
    }
    var video = card.querySelector('video');
    var stream = card.getAttribute('data-stream');
    if (!video || !stream) {
      return;
    }
    if (card.dataset.ready !== '1') {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        card.hls = hls;
      } else {
        video.src = stream;
      }
      card.dataset.ready = '1';
    }
    card.classList.add('is-playing');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.player-card'));
    players.forEach(function (card) {
      var cover = card.querySelector('.player-cover');
      var video = card.querySelector('video');
      if (cover) {
        cover.addEventListener('click', function () {
          startPlayer(card);
        });
      }
      if (video) {
        video.addEventListener('click', function () {
          if (card.dataset.ready !== '1') {
            startPlayer(card);
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
