(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
      toggle.textContent = mobileNav.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
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
        var nextIndex = Number(dot.getAttribute("data-slide-to") || "0");
        show(nextIndex);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initHeroSearch() {
    var form = document.querySelector("[data-hero-search]");
    if (!form) {
      return;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var value = input ? input.value.trim() : "";
      var url = "./all.html";
      if (value) {
        url += "?q=" + encodeURIComponent(value);
      }
      window.location.href = url;
    });
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var targetSelector = panel.getAttribute("data-target");
      var target = targetSelector ? document.querySelector(targetSelector) : null;
      if (!target) {
        return;
      }
      var searchInput = panel.querySelector("[data-search-input]");
      var typeFilter = panel.querySelector("[data-type-filter]");
      var yearFilter = panel.querySelector("[data-year-filter]");
      var categoryFilter = panel.querySelector("[data-category-filter]");
      var cards = Array.prototype.slice.call(target.querySelectorAll("[data-movie-card]"));
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");

      if (query && searchInput) {
        searchInput.value = query;
      }

      function apply() {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var typeValue = typeFilter ? typeFilter.value : "";
        var yearValue = yearFilter ? yearFilter.value : "";
        var categoryValue = categoryFilter ? categoryFilter.value : "";

        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var cardType = card.getAttribute("data-type") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var cardCategory = card.getAttribute("data-category") || "";
          var typeMatched = !typeValue || cardType.indexOf(typeValue) !== -1;
          var yearMatched = !yearValue || cardYear === yearValue;
          var categoryMatched = !categoryValue || cardCategory === categoryValue;
          var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
          card.hidden = !(typeMatched && yearMatched && categoryMatched && keywordMatched);
        });
      }

      [searchInput, typeFilter, yearFilter, categoryFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      panel.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });

      apply();
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initHeroSearch();
    initFilters();
  });
})();
