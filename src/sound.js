// 사운드 관련 전역 변수
let soundEnabled = true;
let musicEnabled = true;
let sounds = {
    bgm: new Audio('sounds/bgm.mp3'),
    enemy_death: new Audio('sounds/enemy_death.mp3'),
    game_over: new Audio('sounds/game_over.mp3'),
    game_start: new Audio('sounds/game_start.mp3'),
    tower_attack: new Audio('sounds/tower_attack.mp3'),
    tower_place: new Audio('sounds/tower_place.mp3'),
    ui_click: new Audio('sounds/ui_click.mp3')
};

// 사운드 설정 저장
function saveSoundSettings() {
    const soundSettings = {
        soundEnabled: soundEnabled,
        musicEnabled: musicEnabled
    };
    localStorage.setItem('towerDefenseSoundSettings', JSON.stringify(soundSettings));
}

// 사운드 설정 불러오기
function loadSoundSettings() {
    const savedSettings = localStorage.getItem('towerDefenseSoundSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        soundEnabled = settings.soundEnabled;
        musicEnabled = settings.musicEnabled;
        const soundBtn = document.getElementById('soundToggleBtn');
        const musicBtn = document.getElementById('musicToggleBtn');
        soundBtn.classList.toggle('muted', !soundEnabled);
        musicBtn.classList.toggle('muted', !musicEnabled);
        soundBtn.setAttribute('data-status', soundEnabled ? '켜짐' : '꺼짐');
        musicBtn.setAttribute('data-status', musicEnabled ? '켜짐' : '꺼짐');
        if (musicEnabled && gameState.isStarted) {
            sounds.bgm.loop = true;
            sounds.bgm.play().catch(error => console.log('BGM 재생 실패:', error));
        } else {
            sounds.bgm.pause();
        }
    }
}

function playSound(soundName) {
    if (!soundEnabled) return;
    const sound = sounds[soundName];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => console.log('사운드 재생 실패:', error));
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundBtn = document.getElementById('soundToggleBtn');
    soundBtn.classList.toggle('muted', !soundEnabled);
    soundBtn.setAttribute('data-status', soundEnabled ? '켜짐' : '꺼짐');
    saveSoundSettings(); // 설정 저장
}

function toggleMusic() {
    musicEnabled = !musicEnabled;
    const musicBtn = document.getElementById('musicToggleBtn');
    musicBtn.classList.toggle('muted', !musicEnabled);
    
    if (musicEnabled) {
        sounds.bgm.loop = true;
        sounds.bgm.play().catch(error => console.log('BGM 재생 실패:', error));
    } else {
        sounds.bgm.pause();
    }
    saveSoundSettings(); // 설정 저장
} 