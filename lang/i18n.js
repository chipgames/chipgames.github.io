let TRANSLATIONS = {};
let currentLanguage = 'ko';

function detectLanguage() {
    const savedLang = localStorage.getItem('towerDefenseLanguage');
    if (savedLang) return savedLang;
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0].toLowerCase();
    if (['ko', 'en', 'zh', 'ja'].includes(langCode)) return langCode;
    return 'en';
}

function t(key) {
    if (TRANSLATIONS && TRANSLATIONS[key]) {
        return TRANSLATIONS[key];
    }
    return key;
}

function updatePageLanguage() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key) {
            element.textContent = t(key);
        }
    });
    // placeholder
    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (key) {
            element.placeholder = t(key);
        }
    });
    // title
    const titles = document.querySelectorAll('[data-i18n-title]');
    titles.forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        if (key) {
            element.title = t(key);
        }
    });
}

function loadLanguage(langCode, callback) {
    const scriptId = 'lang-script';
    const oldScript = document.getElementById(scriptId);
    if (oldScript) {
        oldScript.remove();
    }
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `lang/translations.${langCode}.js`;
    script.onload = function() {
        currentLanguage = langCode;
        localStorage.setItem('towerDefenseLanguage', langCode);
        if (typeof callback === 'function') callback();
    };
    document.head.appendChild(script);
}

function changeLanguage(langCode) {
    loadLanguage(langCode, updatePageLanguage);
}

document.addEventListener('DOMContentLoaded', function() {
    const lang = detectLanguage();
    loadLanguage(lang, updatePageLanguage);
}); 


document.addEventListener('DOMContentLoaded', function () {
    const lang = detectLanguage();
    // 전역 변수 동기화
    window.currentLanguage = lang;

    // 언어 스크립트 로드
    loadLanguage(lang, function () {
        updatePageLanguage();

        // 드롭다운 동기화
        const languageSelect = document.getElementById('languageSelect');
        const footerLanguageSelect = document.getElementById('footerLanguageSelect');
        if (languageSelect) languageSelect.value = lang;
        if (footerLanguageSelect) footerLanguageSelect.value = lang;
    });

    // 언어 변경 시 드롭다운 값 동기화
    const originalChangeLanguage = window.changeLanguage;
    window.changeLanguage = function (langCode) {
        originalChangeLanguage(langCode);
        if (languageSelect) languageSelect.value = langCode;
        if (footerLanguageSelect) footerLanguageSelect.value = langCode;
    };
});


window.t = t;
window.changeLanguage = changeLanguage;
window.updatePageLanguage = updatePageLanguage;
window.currentLanguage = currentLanguage;
window.loadLanguage = loadLanguage;
window.detectLanguage = detectLanguage;
