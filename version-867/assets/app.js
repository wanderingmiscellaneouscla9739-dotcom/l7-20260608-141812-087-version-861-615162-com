(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      setSlide(currentSlide + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var noResults = document.querySelector('[data-no-results]');
  var activeFilter = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyCardFilters() {
    if (!cards.length) {
      return;
    }

    var query = normalize(searchInput ? searchInput.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var category = card.getAttribute('data-category') || '';
      var queryMatch = !query || text.indexOf(query) !== -1;
      var filterMatch = activeFilter === 'all' || category === activeFilter;
      var show = queryMatch && filterMatch;

      card.style.display = show ? '' : 'none';

      if (show) {
        visible += 1;
      }
    });

    if (noResults) {
      noResults.classList.toggle('is-visible', visible === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyCardFilters);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter') || 'all';

      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });

      applyCardFilters();
    });
  });
})();

window.initMoviePlayer = function (videoId, buttonId, streamUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var hlsPlayer = null;
  var isReady = false;

  if (!video || !streamUrl) {
    return;
  }

  function startPlayback(event) {
    if (event) {
      event.preventDefault();
    }

    if (button) {
      button.classList.add('is-hidden');
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!isReady) {
        video.src = streamUrl;
        isReady = true;
      }

      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsPlayer) {
        hlsPlayer = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsPlayer.loadSource(streamUrl);
        hlsPlayer.attachMedia(video);
        hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        isReady = true;
      } else {
        video.play().catch(function () {});
      }
      return;
    }

    if (!isReady) {
      video.src = streamUrl;
      isReady = true;
    }

    video.play().catch(function () {});
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });
};
