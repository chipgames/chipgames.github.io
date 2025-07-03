/**
 * 게임 사운드 관리 파일
 * 게임의 모든 사운드 효과와 배경 음악을 관리
 */

// 사운드 관련 전역 변수
// 사운드 활성화 상태와 음악 활성화 상태를 저장
let soundEnabled = true;
let musicEnabled = true;

// 사운드 객체
// 게임에서 사용되는 모든 사운드 파일을 로드
let sounds = {
    bgm: new Audio('sounds/bgm.mp3'),
    enemy_death: new Audio('sounds/enemy_death.mp3'),
    game_over: new Audio('sounds/game_over.mp3'),
    game_start: new Audio('sounds/game_start.mp3'),
    tower_attack: new Audio('sounds/tower_attack.mp3'),
    tower_critical: new Audio('sounds/tower_critical.mp3'),
    tower_place: new Audio('sounds/tower_place.mp3'),
    ui_click: new Audio('sounds/ui_click.mp3')
};

// 사운드 설정 저장
// 현재 사운드 설정을 로컬 스토리지에 저장
function saveSoundSettings() {
    const soundSettings = {
        soundEnabled: soundEnabled,
        musicEnabled: musicEnabled
    };
    localStorage.setItem('towerDefenseSoundSettings', JSON.stringify(soundSettings));
}

// 사운드 설정 불러오기
// 저장된 사운드 설정을 로컬 스토리지에서 불러옴
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
        soundBtn.setAttribute('data-status', soundEnabled ? t('on') : t('off'));
        musicBtn.setAttribute('data-status', musicEnabled ? t('on') : t('off'));
        if (musicEnabled && gameState.isStarted) {
            sounds.bgm.loop = true;
            sounds.bgm.play().catch(error => console.log(t('bgmPlayFailed') + ':', error));
        } else {
            sounds.bgm.pause();
        }
    }
}

// 사운드 재생
// 지정된 이름의 사운드를 재생
function playSound(soundName) {
    if (!soundEnabled) return;
    const sound = sounds[soundName];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => console.log(t('soundPlayFailed') + ':', error));
    }
}

// 사운드 토글
// 사운드 효과의 활성화/비활성화를 전환
function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundBtn = document.getElementById('soundToggleBtn');
    soundBtn.classList.toggle('muted', !soundEnabled);
    soundBtn.setAttribute('data-status', soundEnabled ? t('on') : t('off'));
    saveSoundSettings(); // 설정 저장
}

// 음악 토글
// 배경 음악의 활성화/비활성화를 전환
function toggleMusic() {
    musicEnabled = !musicEnabled;
    const musicBtn = document.getElementById('musicToggleBtn');
    musicBtn.classList.toggle('muted', !musicEnabled);
    
    if (musicEnabled) {
        sounds.bgm.loop = true;
        sounds.bgm.play().catch(error => console.log(t('bgmPlayFailed') + ':', error));
    } else {
        sounds.bgm.pause();
    }
    saveSoundSettings(); // 설정 저장
} 