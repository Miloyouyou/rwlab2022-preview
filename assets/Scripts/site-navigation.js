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
