// 게임 상태
const gameState = {
    gold: 200, // EASY 난이도 초기 골드
    lives: 25, // EASY 난이도 초기 생명력
    wave: 1,
    isGameOver: false,
    waveInProgress: false,
    enemiesRemaining: 0,
    isPaused: false,
    isStarted: false,
    score: 0,
    difficulty: 'EASY', // EASY, NORMAL, HARD
    bossWave: 5, // 5웨이브마다 보스 등장
    bossKilled: false,
    goldMultiplier: 1,
    maxTowers: 12, // EASY 난이도 최대 타워 수
    towerCount: 0, // 현재 설치된 타워 수
    experience: 0,
    level: 1,
    experienceToNextLevel: 100,
    currentMap: 'STRAIGHT', // 현재 맵 정보 추가
    currentWaveMessage: null, // 웨이브 메시지 관련 변수 추가
    waveMessageStartTime: 0,   // 웨이브 메시지 시작 시간
    lastSpawnTime: 0,
    totalEnemies: 0,
    currentGroup: 1,
    totalGroups: 1,
    groupSize: 1,
    enemiesInCurrentGroup: 0
};

// 게임 통계
const gameStats = {
    enemiesKilled: 0,
    bossesKilled: 0,
    totalGold: 0,
    highestWave: 0,
    eventsTriggered: [],
    playTime: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0
};

// 게임 초기화
function initializeGame() {
    // 게임 상태 초기화
    const wasStarted = gameState.isStarted; // 현재 시작 상태 저장
    Object.assign(gameState, {
        gold: DIFFICULTY_SETTINGS[gameState.difficulty].initialGold,
        lives: DIFFICULTY_SETTINGS[gameState.difficulty].initialLives,
        wave: 1,
        isGameOver: false,
        waveInProgress: false,
        enemiesRemaining: 0,
        isPaused: false,
        isStarted: wasStarted, // 이전 시작 상태 유지
        score: 0,
        bossKilled: false,
        goldMultiplier: 1,
        maxTowers: 12, // EASY 난이도 최대 타워 수
        towerCount: 0, // 현재 설치된 타워 수
        experience: 0,
        level: 1,
        experienceToNextLevel: 100,
        currentWaveMessage: null, // 웨이브 메시지 관련 변수 추가
        waveMessageStartTime: 0,   // 웨이브 메시지 시작 시간
        lastSpawnTime: 0,
        totalEnemies: 0,
        currentGroup: 1,
        totalGroups: 1,
        groupSize: 1,
        enemiesInCurrentGroup: 0
    });

    // 이펙트 풀 초기화
    initializeEffects();
    
    // 맵 선택 드롭다운 초기화
    const mapSelect = document.getElementById('mapSelect');
    if (mapSelect) {
        mapSelect.value = gameState.currentMap;
    }

    // 기본 맵 미리보기 표시
    const defaultMap = MAPS[gameState.currentMap];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 배경 그리기
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 그리드 그리기
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // 경로 그리기
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = TILE_SIZE;
    ctx.beginPath();
    ctx.moveTo(defaultMap.path[0].x * TILE_SIZE + TILE_SIZE/2, defaultMap.path[0].y * TILE_SIZE + TILE_SIZE/2);
    for (let i = 1; i < defaultMap.path.length; i++) {
        ctx.lineTo(defaultMap.path[i].x * TILE_SIZE + TILE_SIZE/2, defaultMap.path[i].y * TILE_SIZE + TILE_SIZE/2);
    }
    ctx.stroke();
    
    // 시작점과 끝점 표시
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(defaultMap.path[0].x * TILE_SIZE + TILE_SIZE/2, defaultMap.path[0].y * TILE_SIZE + TILE_SIZE/2, TILE_SIZE/4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(defaultMap.path[defaultMap.path.length-1].x * TILE_SIZE + TILE_SIZE/2, defaultMap.path[defaultMap.path.length-1].y * TILE_SIZE + TILE_SIZE/2, TILE_SIZE/4, 0, Math.PI * 2);
    ctx.fill();
    
    // 맵 이름 표시
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(defaultMap.name, canvas.width/2, 10);

    // 미니맵 초기화
    drawMinimap();
}

// 정보 바 업데이트
function updateInfoBar() {
    const elements = {
        'infoGold': `골드: ${gameState.gold}`,
        'infoLives': `생명: ${gameState.lives}`,
        'infoWave': `웨이브: ${gameState.wave}`,
        'infoScore': `점수: ${gameState.score}`
    };

    for (const [id, text] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }
}

// 게임 통계 업데이트
function updateStats() {
    // 통계 요소 업데이트
    document.getElementById('enemiesKilled').textContent = `처치한 적: ${gameStats.enemiesKilled}`;
    document.getElementById('bossesKilled').textContent = `처치한 보스: ${gameStats.bossesKilled}`;
    document.getElementById('totalGold').textContent = `총 획득 골드: ${gameStats.totalGold}`;
    document.getElementById('highestWave').textContent = `최고 웨이브: ${gameStats.highestWave}`;

    // 업적 업데이트
    Object.entries(ACHIEVEMENTS).forEach(([key, achievement]) => {
        const achievementElement = document.getElementById(`achievement-${key}`);
        if (achievementElement) {
            achievementElement.className = achievement.unlocked ? 'achievement unlocked' : 'achievement';
        }
    });

    // 이벤트 트리거 업데이트
    const eventsList = document.getElementById('eventsList');
    if (eventsList) {
        eventsList.innerHTML = gameStats.eventsTriggered
            .map(event => `<li>${SPECIAL_EVENTS[event].name}</li>`)
            .join('');
    }
}

// 타워 제한 업데이트
function updateTowerLimit() {
    document.getElementById('towerLimitCount').textContent = gameState.towerCount;
    document.getElementById('towerLimitMax').textContent = gameState.maxTowers;
}

// 웨이브 종료 체크
function checkWaveEnd() {
    if (gameState.waveInProgress && gameState.enemiesRemaining === 0 && enemies.length === 0) {
        gameState.waveInProgress = false;
        gameState.wave++;
        const reward = calculateWaveReward();
        gameState.gold += reward;
        showRewardPopup(reward);
        // 웨이브 클리어 시 점수 추가
        gameState.score += reward;
        playSound('powerup');
    }
}

// 웨이브 진행 상황 업데이트
function updateWaveProgress() {
    const progress = document.getElementById('waveProgress');
    const fill = progress.querySelector('.fill');
    let text = progress.querySelector('.progress-text');

    // 전체 적의 수 대비 현재 진행률 계산
    const total = gameState.totalEnemies;
    const remaining = gameState.enemiesRemaining;
    const percentage = total > 0 ? ((total - remaining) / total) * 100 : 0;

    fill.style.width = `${percentage}%`;
    progress.style.display = gameState.waveInProgress ? 'block' : 'none';

    // 진행률 텍스트 동적 추가/갱신
    if (!text) {
        text = document.createElement('span');
        text.className = 'progress-text';
        progress.appendChild(text);
    }
    text.textContent = `${Math.round(percentage)}%`;
}

// 전역 객체에 노출
window.gameState = gameState;
window.gameStats = gameStats;
window.initializeGame = initializeGame;
window.updateInfoBar = updateInfoBar;
window.updateStats = updateStats;
window.updateTowerLimit = updateTowerLimit;
window.checkWaveEnd = checkWaveEnd;
window.updateWaveProgress = updateWaveProgress; 