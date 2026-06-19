(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var previous = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function restartHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }

    startHero();
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      restartHero();
    });
  });

  if (previous) {
    previous.addEventListener('click', function () {
      showSlide(current - 1);
      restartHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      restartHero();
    });
  }

  startHero();

  Array.prototype.slice.call(document.querySelectorAll('[data-quick-search]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';

      if (!value) {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  });

  var librarySearch = document.getElementById('library-search');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-library-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.library-card'));
  var activeFilter = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyLibraryFilter() {
    var keyword = librarySearch ? normalize(librarySearch.value) : '';

    cards.forEach(function (card) {
      var matchesFilter = activeFilter === 'all' || card.getAttribute('data-category') === activeFilter;
      var keywords = normalize(card.getAttribute('data-keywords'));
      var matchesKeyword = !keyword || keywords.indexOf(keyword) !== -1;
      card.classList.toggle('is-hidden', !(matchesFilter && matchesKeyword));
    });
  }

  if (librarySearch) {
    librarySearch.addEventListener('input', applyLibraryFilter);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-library-filter') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyLibraryFilter();
    });
  });

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage && window.MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var form = searchPage.querySelector('[data-search-form]');
    var input = form ? form.querySelector('input[name="q"]') : null;
    var title = searchPage.querySelector('[data-search-title]');
    var results = searchPage.querySelector('[data-search-results]');

    if (input) {
      input.value = query;
    }

    function movieHtml(movie) {
      var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('') : '';

      return '<article class="movie-card">' +
        '<a href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
        '<div class="poster-wrap">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async" class="poster-image">' +
        '<div class="poster-fade"></div>' +
        '<span class="poster-badge">' + escapeHtml(movie.category) + '</span>' +
        '<span class="poster-time">' + escapeHtml(movie.duration) + '</span>' +
        '<span class="poster-play">▶</span>' +
        '</div>' +
        '<div class="card-body">' +
        '<h3>' + escapeHtml(movie.title) + '</h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.rating) + ' 分</span></div>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</a>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (character) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[character];
      });
    }

    function renderSearch(value) {
      var term = normalize(value);
      var matched = window.MOVIES.filter(function (movie) {
        if (!term) {
          return true;
        }

        var pool = [
          movie.title,
          movie.category,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          Array.isArray(movie.tags) ? movie.tags.join(' ') : ''
        ].join(' ');

        return normalize(pool).indexOf(term) !== -1;
      }).slice(0, 96);

      if (title) {
        title.textContent = term ? '与“' + value + '”相关的影片' : '精选推荐';
      }

      if (results) {
        results.innerHTML = matched.map(movieHtml).join('');
      }
    }

    renderSearch(query);

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = input ? input.value.trim() : '';
        var nextUrl = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
        window.history.replaceState(null, '', nextUrl);
        renderSearch(value);
      });
    }
  }
})();
