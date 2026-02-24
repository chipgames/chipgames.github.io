/* ChipGames 게임 목록 페이지 - 다국어 */
let TRANSLATIONS = {};
let currentLanguage = 'ko';

function detectLanguage() {
    const saved = localStorage.getItem('chipgamesLanguage');
    if (saved) return saved;
    const browser = (navigator.language || navigator.userLanguage || '').split('-')[0].toLowerCase();
    if (['ko','en','zh','ja'].includes(browser)) return browser;
    return 'ko';
}

function t(key, params) {
    let str = (TRANSLATIONS && TRANSLATIONS[key]) ? TRANSLATIONS[key] : key;
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), v);
        }
    }
    return str;
}

function updatePageLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var key = el.getAttribute('data-i18n');
        if (key) el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
        var key = el.getAttribute('data-i18n-placeholder');
        if (key) el.placeholder = t(key);
    });
    var titleEl = document.querySelector('title[data-i18n]');
    if (titleEl) document.title = t(titleEl.getAttribute('data-i18n'));
    var langSel = document.getElementById('langSelect');
    if (langSel) langSel.value = currentLanguage;
    document.documentElement.setAttribute('lang', currentLanguage === 'zh' ? 'zh-CN' : currentLanguage);
}

function loadLanguage(langCode, callback) {
    const old = document.getElementById('lang-script');
    if (old) old.remove();
    const script = document.createElement('script');
    script.id = 'lang-script';
    script.src = 'lang/translations.' + langCode + '.js';
    script.onload = function() {
        currentLanguage = langCode;
        localStorage.setItem('chipgamesLanguage', langCode);
        if (typeof callback === 'function') callback();
    };
    document.head.appendChild(script);
}

function changeLanguage(langCode) {
    loadLanguage(langCode, updatePageLanguage);
}

document.addEventListener('DOMContentLoaded', function() {
    loadLanguage(detectLanguage(), updatePageLanguage);
});

window.t = t;
window.changeLanguage = changeLanguage;
window.currentLanguage = currentLanguage;
