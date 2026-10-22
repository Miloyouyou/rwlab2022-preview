/* Small progressive enhancement; the navigation remains usable without JS. */
(function () {
    'use strict';
    var button = document.querySelector('.menu-toggle');
    var nav = document.getElementById('primary-navigation');
    if (!button || !nav) return;
    var narrow = window.matchMedia('(max-width: 1050px)');
    document.documentElement.classList.add('navigation-ready');
    function toggle(open, restoreFocus) {
        button.setAttribute('aria-expanded', String(open));
        nav.classList.toggle('is-open', open);
        if (restoreFocus) button.focus();
    }
    button.addEventListener('click', function () { toggle(button.getAttribute('aria-expanded') !== 'true', false); });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') toggle(false, true);
    });
    function reset() { toggle(false, false); }
    if (narrow.addEventListener) narrow.addEventListener('change', reset);
    else narrow.addListener(reset);
    function route(url) {
        var p = url.pathname.toLowerCase().replace(/\/$/, '').replace(/\/index$/, '');
        var article = p.match(/^\/article(?:\/index)?\/(\d+)$/);
        if (article) return '/article:' + article[1];
        if (p === '/home' || p === '') p = '/';
        return p + (p === '/news' ? ':' + (url.searchParams.get('owen1') || (url.searchParams.get('userLang') === '_en' ? 'News' : '最新动态')) : '')
            + (p === '/article' ? ':' + (url.searchParams.get('ID') || url.searchParams.get('id') || '') : '');
    }
    var current = route(new URL(window.location.href));
    var section = document.querySelector('[data-section]');
    var sectionKey = section && section.getAttribute('data-section');
    sectionKey = { education: 'people', collaboration: 'news', facilities: 'research' }[sectionKey] || sectionKey;
    nav.querySelectorAll('a').forEach(function (a) {
        if (section ? a.getAttribute('data-nav') === sectionKey : route(new URL(a.href)) === current) a.setAttribute('aria-current', 'page');
        a.addEventListener('click', function () { toggle(false, false); });
    });
})();

/* Progressive, manual-only image gallery: native touch scrolling, buttons and keys. */
(function () {
    'use strict';
    document.querySelectorAll('[data-carousel]').forEach(function (root) {
        var track = root.querySelector('[data-carousel-track]');
        var slides = Array.from(root.querySelectorAll('[data-slide]'));
        var dots = Array.from(root.querySelectorAll('[data-carousel-dot]'));
        if (!track || slides.length < 2) return;
        var active = 0, frame = 0, pointerX = null;
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        function announce(index) {
            active = index;
            root.dataset.activeIndex = String(index);
            root.querySelector('[data-carousel-caption]').textContent = slides[index].dataset.caption;
            root.querySelector('[data-carousel-counter]').textContent = (index + 1) + ' / ' + slides.length;
            slides.forEach(function (slide, i) {
                slide.setAttribute('aria-hidden', String(i !== index));
                slide.querySelector('a').tabIndex = i === index ? 0 : -1;
            });
            dots.forEach(function (dot, i) {
                if (i === index) dot.setAttribute('aria-current', 'true');
                else dot.removeAttribute('aria-current');
            });
        }
        function go(index, animate) {
            index = (index + slides.length) % slides.length;
            track.scrollTo({ left: index * track.clientWidth, behavior: animate && !reduced.matches ? 'smooth' : 'auto' });
            announce(index);
        }
        root.querySelector('[data-carousel-prev]').addEventListener('click', function () { go(active - 1, true); });
        root.querySelector('[data-carousel-next]').addEventListener('click', function () { go(active + 1, true); });
        dots.forEach(function (dot, index) { dot.addEventListener('click', function () { go(index, true); }); });
        track.addEventListener('keydown', function (event) {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            event.preventDefault(); go(active + (event.key === 'ArrowRight' ? 1 : -1), true);
        });
        track.addEventListener('scroll', function () {
            if (frame) cancelAnimationFrame(frame);
            frame = requestAnimationFrame(function () {
                var index = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
                if (index !== active) announce(index);
                frame = 0;
            });
        }, { passive: true });
        track.addEventListener('pointerdown', function (event) { pointerX = event.clientX; }, { passive: true });
        track.addEventListener('click', function (event) {
            if (pointerX !== null && Math.abs(event.clientX - pointerX) > 8) event.preventDefault();
            pointerX = null;
        }, true);
        if (window.ResizeObserver) new ResizeObserver(function () { go(active, false); }).observe(track);
        root.classList.add('carousel-ready');
        announce(0);
    });
    document.querySelectorAll('[data-publication-library]').forEach(function (root) {
        var papers = Array.from(root.querySelectorAll('[data-paper-group]'));
        var controls = Array.from(root.querySelectorAll('[data-paper-filter]'));
        if (!papers.length || !controls.length) return;
        controls.forEach(function (button) {
            button.addEventListener('click', function () {
                var group = button.dataset.paperFilter, count = 0;
                papers.forEach(function (paper) { paper.hidden = group !== 'all' && paper.dataset.paperGroup !== group; if (!paper.hidden) count++; });
                controls.forEach(function (other) { other.setAttribute('aria-pressed', String(other === button)); });
                root.querySelector('[data-paper-count]').textContent = count + ' / ' + papers.length;
            });
        });
        root.classList.add('papers-ready');
    });
})();
