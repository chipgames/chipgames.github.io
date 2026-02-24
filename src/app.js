/* ChipGames 게임 목록 - 테마, AdSense */

(function() {
    const THEME_KEY = 'chipgamesTheme';

    function getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function applyTheme(theme) {
        if (theme === 'dark' || (theme === 'auto' && getSystemTheme() === 'dark')) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0f172a');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f8fafc');
        }
    }

    function initTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        const theme = saved || (getSystemTheme() === 'dark' ? 'dark' : 'light');
        applyTheme(theme);
        const btn = document.getElementById('themeToggle');
        if (btn) {
            btn.addEventListener('click', function() {
                const current = document.documentElement.getAttribute('data-theme') || (getSystemTheme() === 'dark' ? 'dark' : 'light');
                const next = current === 'dark' ? 'light' : 'dark';
                localStorage.setItem(THEME_KEY, next);
                applyTheme(next);
            });
        }
        if (!saved && window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
                if (!localStorage.getItem(THEME_KEY)) applyTheme(getSystemTheme() === 'dark' ? 'dark' : 'light');
            });
        }
    }

    function initGameMenu() {
        var btn = document.getElementById('gameMenuBtn');
        var menu = document.querySelector('.nav-menu');
        if (btn && menu) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                menu.classList.toggle('open');
                btn.setAttribute('aria-expanded', menu.classList.contains('open'));
            });
            document.addEventListener('click', function() {
                menu.classList.remove('open');
                btn.setAttribute('aria-expanded', 'false');
            });
        }
    }

    function initLangSelect() {
        const sel = document.getElementById('langSelect');
        if (sel) {
            sel.addEventListener('change', function() {
                if (window.changeLanguage) window.changeLanguage(this.value);
            });
        }
    }

    function initServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(function() {});
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        initTheme();
        initGameMenu();
        initLangSelect();
        initServiceWorker();
    });
})();
