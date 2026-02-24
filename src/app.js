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

    function initShareCopy() {
        var url = 'https://chipgames.github.io/';
        var copyBtn = document.getElementById('shareCopyBtn');
        var copyUrlBtns = document.querySelectorAll('.share-copy-url');
        function doCopy(targetBtn, labelSpan) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(function() {
                    showCopied(targetBtn, labelSpan);
                }).catch(function() { fallbackCopy(url, targetBtn, labelSpan); });
            } else {
                fallbackCopy(url, targetBtn, labelSpan);
            }
        }
        function showCopied(btn, span) {
            var orig = span ? span.textContent : btn.textContent;
            var key = btn.getAttribute('data-copied-i18n');
            var copied = (window.t && key ? window.t(key) : null) || '복사됨';
            if (span) { span.textContent = copied; } else { btn.textContent = copied; }
            setTimeout(function() { (span || btn).textContent = orig; }, 1500);
        }
        function fallbackCopy(text, btn, span) {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                showCopied(btn, span);
            } catch (e) {}
            document.body.removeChild(ta);
        }
        if (copyBtn) {
            var span = copyBtn.querySelector('span');
            copyBtn.addEventListener('click', function() { doCopy(copyBtn, span); });
        }
        copyUrlBtns.forEach(function(btn) {
            var span = btn.querySelector('span');
            btn.addEventListener('click', function() { doCopy(btn, span); });
        });
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
        initShareCopy();
        initLangSelect();
        initServiceWorker();
    });
})();
