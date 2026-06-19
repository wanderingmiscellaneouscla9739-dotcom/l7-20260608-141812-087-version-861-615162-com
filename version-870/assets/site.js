(function () {
    var body = document.body;
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
            body.classList.toggle('is-menu-open');
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        if (!slides.length) {
            return;
        }

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
                slide.setAttribute('aria-hidden', i === current ? 'false' : 'true');
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            play();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        show(0);
        play();
    }

    function yearMatch(cardYear, filterValue) {
        if (!filterValue) {
            return true;
        }
        var year = parseInt(cardYear, 10);
        if (!year) {
            return false;
        }
        if (filterValue === '2024') {
            return year >= 2024;
        }
        if (filterValue === '2020') {
            return year >= 2020 && year <= 2023;
        }
        if (filterValue === '2010') {
            return year >= 2010 && year <= 2019;
        }
        if (filterValue === '2000') {
            return year >= 2000 && year <= 2009;
        }
        if (filterValue === '1990') {
            return year < 2000;
        }
        return true;
    }

    function initFilters() {
        var input = document.querySelector('[data-search-input]');
        var typeSelect = document.querySelector('[data-filter-type]');
        var regionSelect = document.querySelector('[data-filter-region]');
        var yearSelect = document.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var empty = document.querySelector('[data-empty-state]');

        if (!cards.length) {
            return;
        }

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var typeValue = typeSelect ? typeSelect.value : '';
            var regionValue = regionSelect ? regionSelect.value : '';
            var yearValue = yearSelect ? yearSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var searchText = (card.getAttribute('data-search') || '').toLowerCase();
                var cardType = card.getAttribute('data-type') || '';
                var cardRegion = card.getAttribute('data-region') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var ok = true;

                if (keyword && searchText.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (typeValue && cardType.indexOf(typeValue) === -1) {
                    ok = false;
                }
                if (regionValue && cardRegion.indexOf(regionValue) === -1) {
                    ok = false;
                }
                if (!yearMatch(cardYear, yearValue)) {
                    ok = false;
                }

                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, typeSelect, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initHero();
        initFilters();
    });
})();
