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

function t(key, params) {
    let str = TRANSLATIONS && TRANSLATIONS[key] ? TRANSLATIONS[key] : key;
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            str = str.replace(new RegExp(`{${k}}`, 'g'), v);
        }
    }
    return str;
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
    // ���� ���� ����ȭ
    window.currentLanguage = lang;

    // ��� ��ũ��Ʈ �ε�
    loadLanguage(lang, function () {
        updatePageLanguage();

        // ��Ӵٿ� ����ȭ
        const languageSelect = document.getElementById('languageSelect');
        const footerLanguageSelect = document.getElementById('footerLanguageSelect');
        if (languageSelect) languageSelect.value = lang;
        if (footerLanguageSelect) footerLanguageSelect.value = lang;
    });

    // ��� ���� �� ��Ӵٿ� �� ����ȭ
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
