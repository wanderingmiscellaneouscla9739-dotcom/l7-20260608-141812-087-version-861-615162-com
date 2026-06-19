(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initCarousel() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function filterItems(input, list, category) {
    var items = Array.prototype.slice.call(list.querySelectorAll("[data-search-item]"));
    var empty = document.querySelector("[data-empty-state]");
    var keyword = (input || "").trim().toLowerCase();
    var visible = 0;

    items.forEach(function (item) {
      var haystack = (item.getAttribute("data-title") || "").toLowerCase();
      var itemCategory = item.getAttribute("data-category") || "";
      var matchText = !keyword || haystack.indexOf(keyword) !== -1;
      var matchCategory = !category || category === "all" || itemCategory === category;
      var shouldShow = matchText && matchCategory;
      item.classList.toggle("is-hidden", !shouldShow);
      if (shouldShow) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  function initLocalFilter() {
    var form = document.querySelector("[data-local-filter]");
    var list = document.querySelector("[data-filter-list]");
    if (!form || !list) {
      return;
    }

    var input = form.querySelector("[data-filter-input]");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      filterItems(input.value, list, "all");
    });
    input.addEventListener("input", function () {
      filterItems(input.value, list, "all");
    });
  }

  function initSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var list = document.querySelector("[data-filter-list]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-category-chip]"));
    if (!form || !list) {
      return;
    }

    var input = form.querySelector("[data-search-input]");
    var params = new URLSearchParams(window.location.search);
    var currentCategory = "all";
    if (params.get("q")) {
      input.value = params.get("q");
    }

    function apply() {
      filterItems(input.value, list, currentCategory);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      apply();
    });

    input.addEventListener("input", apply);

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        currentCategory = chip.getAttribute("data-category-chip") || "all";
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        apply();
      });
    });

    apply();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      if (!video) {
        return;
      }

      function load() {
        if (video.getAttribute("data-ready") === "true") {
          return;
        }

        var source = video.getAttribute("data-video-url");
        if (!source) {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          video.hlsInstance = hls;
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        }

        video.setAttribute("data-ready", "true");
      }

      function play() {
        load();
        if (button) {
          button.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initCarousel();
    initLocalFilter();
    initSearchPage();
    initPlayers();
  });
})();
