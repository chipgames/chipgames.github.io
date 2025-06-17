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

// 게임 저장
function saveGame() {
    try {
        const saveData = {
            version: 3, // 버전 증가
            gameState: {
                ...gameState,
                lastSpawnTime: gameState.lastSpawnTime,
                totalEnemies: gameState.totalEnemies,
                currentGroup: gameState.currentGroup,
                totalGroups: gameState.totalGroups,
                groupSize: gameState.groupSize,
                enemiesInCurrentGroup: gameState.enemiesInCurrentGroup,
            },
            gameStats: { ...gameStats },
            towers: towers.map(tower => ({
                x: tower.x,
                y: tower.y,
                type: tower.type,
                level: tower.level,
                experience: tower.experience,
                experienceToNextLevel: tower.experienceToNextLevel,
                rangeLevel: tower.rangeLevel,
                damageLevel: tower.damageLevel,
                speedLevel: tower.speedLevel,
                bulletLevel: tower.bulletLevel,
                specialLevel: tower.specialLevel || 0,
                cooldown: tower.cooldown || 0,
                activeBuffs: Array.from(tower.activeBuffs || []),
                activeCombos: Array.from(tower.activeCombos || []),
                shieldEffectTime: tower.shieldEffectTime || 0,
                baseDamage: tower.baseDamage,
                baseRange: tower.baseRange,
                baseCooldown: tower.baseCooldown,
                range: tower.range,
                damage: tower.damage,
                maxCooldown: tower.maxCooldown
            })),
            enemies: enemies.map(enemy => ({
                x: enemy.x,
                y: enemy.y,
                type: enemy.type,
                health: enemy.health,
                maxHealth: enemy.maxHealth,
                statusEffects: Array.from(enemy.statusEffects.entries()),
                pathIndex: enemy.pathIndex,
                isBoss: enemy.isBoss || false,
                zigzagFrame: enemy.zigzagFrame || 0,
                groupId: enemy.groupId || null,
                // 추가 상태 저장
                speed: enemy.speed,
                direction: enemy.direction,
                pattern: enemy.pattern ? enemy.pattern.name : null,  // pattern 이름만 저장
                level: enemy.level,
                experience: enemy.experience,
                experienceToNextLevel: enemy.experienceToNextLevel,
                baseReward: enemy.baseReward,
                baseExperience: enemy.baseExperience,
                currentPath: enemy.currentPath,
                targetX: enemy.targetX,
                targetY: enemy.targetY
            })),
            enemyGroups: enemyGroups.map(group => ({
                id: group.id,
                size: group.size,
                type: group.type || null
            })),
            groupIdCounter: groupIdCounter,
            achievements: Object.fromEntries(
                Object.entries(ACHIEVEMENTS).map(([key, achievement]) => [key, achievement.unlocked])
            ),
            currentMap: gameState.currentMap,
            timestamp: Date.now(),
            // 환경설정
            soundEnabled: soundEnabled,
            musicEnabled: musicEnabled,
            lowSpecMode: typeof lowSpecMode !== 'undefined' ? lowSpecMode : false
        };

        // 저장 데이터 검증
        if (!validateSaveData(saveData)) {
            throw new Error('저장할 데이터가 유효하지 않습니다.');
        }

        // 저장 데이터 크기 확인 (5MB 제한)
        const saveString = JSON.stringify(saveData);
        if (saveString.length > 5 * 1024 * 1024) {
            throw new Error('저장 데이터가 너무 큽니다.');
        }

        // localStorage 저장 시도
        try {
            localStorage.setItem('towerDefenseSave', saveString);
            showSaveLoadNotification('게임이 저장되었습니다.');
        } catch (storageError) {
            // localStorage 용량 초과 시 이전 저장 데이터 삭제 후 재시도
            if (storageError.name === 'QuotaExceededError') {
                localStorage.removeItem('towerDefenseSave');
                localStorage.setItem('towerDefenseSave', saveString);
                showSaveLoadNotification('이전 저장 데이터를 삭제하고 게임을 저장했습니다.');
            } else {
                throw storageError;
            }
        }
    } catch (error) {
        console.error('게임 저장 실패:', error);
        showSaveLoadNotification(`저장 실패: ${error.message}`, true);
    }
}

// 게임 불러오기
function loadGame() {
    try {
        const saveData = localStorage.getItem('towerDefenseSave');
        if (!saveData) {
            showSaveLoadNotification('저장된 게임이 없습니다.', true);
            return;
        }

        const data = JSON.parse(saveData);
        // 저장 데이터 버전 확인
        if (!data.version || data.version < 3) {
            showSaveLoadNotification('저장 데이터 버전이 호환되지 않습니다.', true);
            return;
        }
        // 저장 데이터 검증
        if (!validateSaveData(data)) {
            throw new Error('저장된 데이터가 손상되었습니다.');
        }
        // 저장 시간 확인 (24시간 제한)
        const saveTime = new Date(data.timestamp);
        const currentTime = new Date();
        const hoursDiff = (currentTime - saveTime) / (1000 * 60 * 60);
        if (hoursDiff > 24) {
            showSaveLoadNotification('저장된 게임이 만료되었습니다.', true);
            return;
        }
        // 게임 상태 복원
        Object.assign(gameState, data.gameState);
        if (data.gameStats) Object.assign(gameStats, data.gameStats);
        gameState.currentMap = data.currentMap;
        // selectMap(data.currentMap); // gameState 값이 덮어써지지 않도록 제거
        // 맵 UI만 갱신
        if (typeof drawMinimap === 'function') {
            drawMinimap();
        }
        // 웨이브/스폰 관련 필드 복원
        gameState.lastSpawnTime = data.gameState.lastSpawnTime;
        gameState.totalEnemies = data.gameState.totalEnemies;
        gameState.currentGroup = data.gameState.currentGroup;
        gameState.totalGroups = data.gameState.totalGroups;
        gameState.groupSize = data.gameState.groupSize;
        gameState.enemiesInCurrentGroup = data.gameState.enemiesInCurrentGroup;
        // 타워 복원 (팩토리 함수 사용)
        towers = data.towers.map(towerFromData);
        
        // 적 복원 (팩토리 함수 사용)
        enemies = (data.enemies || []).map(enemyData => {
            const enemy = enemyFromData(enemyData);
            return enemy;
        });
        
        // 적 그룹 복원
        enemyGroups = (data.enemyGroups || []).map(groupData => {
            const group = new EnemyGroup(groupData.id, groupData.size, groupData.type);
            return group;
        });
        groupIdCounter = data.groupIdCounter || 1;

        // 적 그룹 멤버 복원
        enemies.forEach(enemy => {
            if (enemy && enemy.groupId) {  // enemy가 존재하는지 확인
                const group = enemyGroups.find(g => g.id === enemy.groupId);
                if (group) {
                    group.members.push(enemy);
                }
            }
        });
        // 업적 복원
        Object.entries(data.achievements).forEach(([key, unlocked]) => {
            if (ACHIEVEMENTS[key]) {
                ACHIEVEMENTS[key].unlocked = unlocked;
            }
        });
        // 환경설정 복원
        soundEnabled = data.soundEnabled;
        musicEnabled = data.musicEnabled;
        if (typeof applyLowSpecMode === 'function') {
            applyLowSpecMode(data.lowSpecMode);
        }
        // UI/통계 등 갱신
        updateTowerLimit();
        updateInfoBar();
        updateStats();
        showSaveLoadNotification('게임을 불러왔습니다.');
        // 웨이브 진행 중이었다면 적 스폰 재개
        if (gameState.waveInProgress) {
            // 이미 복원된 적이 있으면 spawnNextEnemy를 호출하지 않음
            if (enemies.length === 0) {
                // 웨이브가 아직 끝나지 않았고, 현재 그룹의 적 수가 그룹 크기보다 작으면 스폰
                if (gameState.currentGroup <= gameState.totalGroups && 
                    gameState.enemiesInCurrentGroup < gameState.groupSize) {
                    spawnNextEnemy();
                }
            }
            updateWaveProgress();
        }
        // 불러오기 후 일시정지 해제
        gameState.isPaused = false;
    } catch (error) {
        console.error('게임 불러오기 실패:', error);
        showSaveLoadNotification(`불러오기 실패: ${error.message}`, true);
    }
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
window.saveGame = saveGame;
window.loadGame = loadGame;
window.updateInfoBar = updateInfoBar;
window.updateStats = updateStats;
window.updateTowerLimit = updateTowerLimit;
window.checkWaveEnd = checkWaveEnd;
window.updateWaveProgress = updateWaveProgress; 