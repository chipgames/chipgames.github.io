/**
 * 게임 메인 파일
 * 게임의 핵심 로직과 게임 루프를 관리
 */

// 현재 선택된 맵 정보를 저장
let currentMap = MAPS[gameState.currentMap];

// ... existing code ...

/**
 * 게임 오버 화면을 표시하는 함수
 * 최종 점수와 웨이브 정보를 화면에 표시
 */
function showGameOver() {
    const gameOver = document.getElementById('gameOver');
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalWave').textContent = gameState.wave;
    gameOver.style.display = 'block';
}

/**
 * 게임 오버 화면을 캔버스에 그리는 함수
 * 게임 오버 상태일 때 호출되어 캔버스에 오버레이를 표시
 */
function drawGameOver() {
    // 반투명 배경
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 게임 오버 텍스트
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t('gameOver'), canvas.width / 2, canvas.height / 2 - 60);
    
    // 최종 점수
    ctx.fillStyle = '#f39c12';
    ctx.font = '24px Arial';
    ctx.fillText(`${t('finalScore')}: ${gameState.score}`, canvas.width / 2, canvas.height / 2);
    
    // 최종 웨이브
    ctx.fillStyle = '#3498db';
    ctx.font = '20px Arial';
    ctx.fillText(`${t('finalWave')}: ${gameState.wave}`, canvas.width / 2, canvas.height / 2 + 30);
    
    // 처치한 보스 수
    ctx.fillStyle = '#9b59b6';
    ctx.font = '18px Arial';
    ctx.fillText(`${t('bossesKilled')}: ${gameStats.bossesKilled}`, canvas.width / 2, canvas.height / 2 + 55);
    
    // 안내 메시지
    ctx.fillStyle = '#95a5a6';
    ctx.font = '16px Arial';
    ctx.fillText(t('gameOverMessage'), canvas.width / 2, canvas.height / 2 + 90);

    // '다시 시작' 버튼 동적 생성
    let restartBtn = document.getElementById('canvasRestartBtn');
    if (!restartBtn) {
        restartBtn = document.createElement('button');
        restartBtn.id = 'canvasRestartBtn';
        restartBtn.textContent = t('restart');
        restartBtn.style.position = 'absolute';
        restartBtn.style.left = '50%';
        restartBtn.style.top = 'calc(50%)';
        restartBtn.style.transform = 'translate(-50%, 0)';
        restartBtn.style.zIndex = '3000';
        restartBtn.style.padding = '10px 40px';
        restartBtn.style.fontSize = '1.2em';
        restartBtn.style.background = '#4F8CFF';
        restartBtn.style.color = '#fff';
        restartBtn.style.border = 'none';
        restartBtn.style.borderRadius = '8px';
        restartBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        restartBtn.style.cursor = 'pointer';
        restartBtn.onclick = () => {
            restartGame();
            restartBtn.remove();
        };
        // 캔버스 부모(게임 영역)에 추가
        const parent = canvas.parentElement || document.body;
        parent.appendChild(restartBtn);
    }
}

/**
 * 게임 시작 버튼 이벤트 리스너
 * 게임 시작/재시작 기능을 처리
 */
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        // 기존 이벤트 리스너 제거
        const newStartBtn = startBtn.cloneNode(true);
        startBtn.parentNode.replaceChild(newStartBtn, startBtn);
        
        newStartBtn.addEventListener('click', () => {
            if (!gameState.isStarted) {
                // 게임 시작
                gameState.isStarted = true;
                newStartBtn.textContent = t('restart');
                document.getElementById('tutorial').style.display = 'none';
                document.getElementById('waveStartButton').style.display = 'block';
                
                // 게임 초기화
                initializeGame();
                updateControlVisibility();
                
                // 게임 시작 시 배경음악 재생
                if (musicEnabled) {
                    sounds.bgm.loop = true;
                    sounds.bgm.play().catch(error => console.log(t('bgmPlayFailed') + ':', error));
                }
            } else {
                // 게임 재시작
                restartGame();
                gameState.isStarted = true;
                updateControlVisibility();
            }
        });
    }
});

/**
 * 웨이브 시작 함수
 * 일반 웨이브와 보스 웨이브를 처리하고 적을 생성
 */
function startWave() {
    if (gameState.waveInProgress) return;
    
    gameState.waveInProgress = true;
    
    // 보스 웨이브 처리
    if (gameState.wave % gameState.bossWave === 0) {
        // 보스 타입 순환
        const bossTypes = Object.keys(BOSS_TYPES);
        const bossType = bossTypes[Math.floor((gameState.wave / gameState.bossWave - 1) % bossTypes.length)];
        const startX = currentMap.path[0].x;
        const startY = currentMap.path[0].y;
        const boss = new Enemy(gameState.wave, true, null, startX, startY, bossType);
        enemies.push(boss);
        // 일반 적 5기
        const normalCount = 10;
        //for (let i = 0; i < normalCount; i++) {
        //    const enemy = new Enemy(gameState.wave, false);
        //    enemies.push(enemy);
        //}
        gameState.enemiesRemaining = 1 + normalCount;
        gameState.totalEnemies = 1 + normalCount;
        showWaveStartMessage(gameState.wave);
        playSound('wave_start');
        return; // 반드시 함수 종료
    }
    
    // 일반 웨이브 처리
    let totalEnemies = 10 + (gameState.wave * 2);
    let groupSize = 3 + Math.floor(Math.random() * 3); // 3~5마리 그룹
    let groupsToSpawn = Math.ceil(totalEnemies / groupSize);
    
    gameState.enemiesRemaining = totalEnemies;
    gameState.totalEnemies = totalEnemies;
    gameState.currentGroup = 0;
    gameState.totalGroups = groupsToSpawn;
    gameState.groupSize = groupSize;
    gameState.enemiesInCurrentGroup = 0;
    gameState.lastSpawnTime = Date.now();
    gameState.spawnTimer = null;
    enemyGroups = [];
    
    spawnNextEnemy();
    showWaveStartMessage(gameState.wave);
    playSound('wave_start');
}

/**
 * 다음 적을 생성하는 함수
 * 웨이브 진행 중에 적을 순차적으로 생성
 */
function spawnNextEnemy() {
    // 웨이브가 진행 중이 아니거나 적이 더 이상 없으면 종료
    if (!gameState.waveInProgress || gameState.enemiesRemaining <= 0) {
        if (gameState.spawnTimer) {
            clearTimeout(gameState.spawnTimer);
            gameState.spawnTimer = null;
        }
        return;
    }
    
    // 새로운 그룹 시작
    if (gameState.enemiesInCurrentGroup === 0) {
        const group = new EnemyGroup(groupIdCounter++, gameState.groupSize);
        enemyGroups.push(group);
        gameState.currentGroup++;        
    }
    
    // 현재 그룹에 적 추가
    const types = ['NORMAL', 'FAST', 'TANK', 'HEALER'];
    const randomType = types[Math.floor(Math.random() * types.length)];

    // 타입별 패턴 후보
    const patternCandidates = {
        NORMAL: [null, ENEMY_PATTERNS.NORMAL, ENEMY_PATTERNS.ZIGZAG],
        FAST: [null, ENEMY_PATTERNS.GROUP_RUSH, ENEMY_PATTERNS.ZIGZAG],
        TANK: [null, ENEMY_PATTERNS.AMBUSH],
        HEALER: [null]
    };
    const patterns = patternCandidates[randomType] || [null];
    const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];

    const enemy = new Enemy(
        gameState.wave,
        false,
        randomPattern,
        currentMap.path[0].x,
        currentMap.path[0].y,
        randomType
    );
    enemyGroups[gameState.currentGroup - 1].add(enemy);
    enemies.push(enemy);
    gameState.enemiesRemaining--;
    gameState.enemiesInCurrentGroup++;
    gameState.lastSpawnTime = Date.now();
    
    // 그룹이 가득 찼으면 다음 그룹 준비
    if (gameState.enemiesInCurrentGroup >= gameState.groupSize) {
        gameState.enemiesInCurrentGroup = 0;
    }
    
    // 다음 적 생성 예약
    if (gameState.enemiesRemaining > 0) {
        const randomDelay = 300 + Math.random() * 1700; // 0.3초 ~ 2초
        if (gameState.spawnTimer) {
            clearTimeout(gameState.spawnTimer);
        }
        gameState.spawnTimer = setTimeout(spawnNextEnemy, randomDelay);        
    }
}

/**
 * 게임 메인 루프
 * 매 프레임마다 게임 상태를 업데이트하고 화면을 갱신
 */
function gameLoop() {
    // 게임이 시작되지 않았거나 일시정지 상태일 때는 프리뷰 화면만 표시
    if (!gameState.isStarted || gameState.isPaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    // 게임 오버 상태일 때는 게임 오버 화면 표시
    if (gameState.isGameOver) {
        drawGameOver();
        requestAnimationFrame(gameLoop);
        return;
    }

    // 게임 화면 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 그리드와 경로 그리기
    ctx.strokeStyle = '#ccc';
    for (let i = 0; i < GRID_WIDTH; i++) {
        for (let j = 0; j < GRID_HEIGHT; j++) {
            ctx.strokeRect(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    ctx.fillStyle = '#eee';
    for (let point of currentMap.path) {
        ctx.fillRect(point.x * TILE_SIZE, point.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    // 타워 설치 가능한 위치 표시
    if (!gameState.waveInProgress && gameState.isStarted) {
        showPlaceablePositions();
    }

    // 타워 그리기 및 공격
    towers.forEach(tower => {
        tower.draw();
        tower.attack(enemies);
    });

    // 레벨업 이펙트 그리기
    const levelUpEffects = EffectPool.getPool('levelUp');
    if (levelUpEffects && Array.isArray(levelUpEffects)) {
        levelUpEffects.forEach(effect => {
            if (effect.active) {
                effect.update();
                effect.draw();
            }
        });
    }

    // 적 업데이트 및 그리기
    enemies = enemies.filter(enemy => {
        if (enemy.draw) enemy.draw();
        const shouldRemove = enemy.update();
        if (shouldRemove && enemy.health > 0) { // 경로 끝에 도달(살아있는 적)
            gameState.lives--;
            updateInfoBar();
        }
        return !shouldRemove;
    });

    // === 데미지 이펙트 그리기 ===
    drawDamageEffects();
    // === 데미지 이펙트 그리기 끝 ===

    // === 적 스킬 이펙트 그리기 ===
    drawSkillEffects();
    // === 적 스킬 이펙트 그리기 끝 ===

    // === 특수 이펙트 그리기 ===
    drawSpecialEffects();
    // === 특수 이펙트 그리기 끝 ===

    // === 타워 설치 미리보기 그리기 (canvas 직접) ===
    if (towerPreview) {
        const { x, y, range, type } = towerPreview;
        const centerX = x * TILE_SIZE + TILE_SIZE / 2;
        const centerY = y * TILE_SIZE + TILE_SIZE / 2;
        // 사거리 원
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.beginPath();
        ctx.arc(centerX, centerY, range * TILE_SIZE, 0, Math.PI * 2);
        ctx.fillStyle = TOWER_TYPES[type]?.color || 'rgba(0,0,0,0.18)';
        ctx.fill();
        ctx.restore();
        // 사거리 테두리
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = TOWER_TYPES[type]?.color || '#888';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, range * TILE_SIZE, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        // 타워 본체(반투명)
        ctx.save();
        ctx.globalAlpha = 0.5;
        const radius = TILE_SIZE / 2 - 4;
        switch (type) {
            case 'BASIC':
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fillStyle = TOWER_TYPES[type]?.color || '#888';
                ctx.fill();
                break;
            case 'ICE':
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI * 2) / 6;
                    const px = centerX + radius * Math.cos(angle);
                    const py = centerY + radius * Math.sin(angle);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fillStyle = TOWER_TYPES[type]?.color || '#888';
                ctx.fill();
                break;
            case 'POISON':
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
                    const px = centerX + radius * Math.cos(angle);
                    const py = centerY + radius * Math.sin(angle);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fillStyle = TOWER_TYPES[type]?.color || '#888';
                ctx.fill();
                break;
            case 'LASER':
                ctx.beginPath();
                for (let i = 0; i < 3; i++) {
                    const angle = (i * Math.PI * 2) / 3;
                    const px = centerX + radius * Math.cos(angle);
                    const py = centerY + radius * Math.sin(angle);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fillStyle = TOWER_TYPES[type]?.color || '#888';
                ctx.fill();
                break;
            case 'SPLASH':
                ctx.beginPath();
                ctx.rect(centerX - radius, centerY - radius, radius * 2, radius * 2);
                ctx.fillStyle = TOWER_TYPES[type]?.color || '#888';
                ctx.fill();
                break;
            case 'SUPPORT':
                ctx.beginPath();
                ctx.rect(centerX - radius / 2, centerY - radius, radius, radius * 2);
                ctx.rect(centerX - radius, centerY - radius / 2, radius * 2, radius);
                ctx.fillStyle = TOWER_TYPES[type]?.color || '#888';
                ctx.fill();
                break;
        }
        ctx.restore();
    }
    // === 타워 설치 미리보기 그리기 끝 ===

    // 웨이브 종료 체크
    checkWaveEnd();

    // 업적 체크
    checkAchievements();

    // 미니맵 업데이트
    drawMinimap();
    
    // 타워 조합 체크
    checkTowerCombos();
    
    // 최고 웨이브 업데이트
    if (gameState.wave > gameStats.highestWave) {
        gameStats.highestWave = gameState.wave;
        updateStats();
    }

    // UI 업데이트
    updateInfoBar();

    // 웨이브 진행 상황 업데이트
    updateWaveProgress();

    // 웨이브 시작 버튼 표시/숨김 처리
    const waveStartButton = document.getElementById('waveStartButton');
    if (waveStartButton) {
        waveStartButton.style.display = !gameState.waveInProgress && !gameState.isGameOver ? 'block' : 'none';
    }

    if (gameState.isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.fillText(t('pause'), canvas.width/2 - 100, canvas.height/2);
    }

    // 게임 오버 체크
    if (gameState.lives <= 0) {
        gameState.isGameOver = true;
        showGameOver();
    }

    // 그룹 연결선 그리기
    drawGroupConnections();

    // 적 생성 타이밍 체크 (2초 이상 지났고, 아직 적이 남아있으면 강제 생성)
    if (gameState.waveInProgress && 
        gameState.enemiesRemaining > 0 && 
        Date.now() - gameState.lastSpawnTime > 2000) {
        spawnNextEnemy();
    }

    // 웨이브 메시지 그리기
    drawWaveMessage();
    
    // === 다음 웨이브 카운트다운 그리기 ===
    drawCountdown();
    // === 다음 웨이브 카운트다운 그리기 끝 ===
    
    // 다음 프레임 요청
    requestAnimationFrame(gameLoop);
}

// 단축키 이벤트 추가
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!gameState.waveInProgress && !gameState.isGameOver && !countdownActive && gameState.isStarted) {
            showCountdown();
        }
    } else if (e.code === 'KeyP') {
        e.preventDefault();
        if (gameState.isStarted) {
            gameState.isPaused = !gameState.isPaused;
            document.getElementById('pauseBtn').textContent = gameState.isPaused ? t('resume') : t('pause');
        }
    } else if (e.code === 'KeyH') {
        e.preventDefault();
        helpModal.classList.add('show');
    }
});

// 타워 설치 이벤트 수정
canvas.addEventListener('click', (e) => {
    if (gameState.isGameOver || !gameState.isStarted || gameState.isPaused) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = Math.floor(((e.clientX - rect.left) * scaleX) / TILE_SIZE);
    const y = Math.floor(((e.clientY - rect.top) * scaleY) / TILE_SIZE);

    // 좌표가 유효한 범위 내에 있는지 확인
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return;

    const clickedTower = towers.find(tower => tower.x === x && tower.y === y);
    if (clickedTower) {
        showTowerUpgradeMenu(clickedTower, e.clientX, e.clientY);
        return;
    }

    const isOnPath = currentMap.path.some(point => point.x === x && point.y === y);
    if (isOnPath) return;

    const towerExists = towers.some(tower => tower.x === x && tower.y === y);
    if (towerExists) return;

    showTowerBuildMenu(x, y, e.clientX, e.clientY);
    showTowerEffect(x, y);
});

// 게임 컨트롤 이벤트
document.getElementById('pauseBtn').addEventListener('click', () => {
    if (gameState.isStarted) {
        gameState.isPaused = !gameState.isPaused;
        document.getElementById('pauseBtn').textContent = gameState.isPaused ? t('resume') : t('pause');
    }
});

// 난이도 선택 이벤트 수정
document.getElementById('difficultySelect').addEventListener('change', (e) => {
    if (!gameState.isStarted) {
        gameState.difficulty = e.target.value;
        const settings = DIFFICULTY_SETTINGS[gameState.difficulty];
        gameState.gold = settings.gold;
        gameState.lives = settings.lives;
        gameState.maxTowers = settings.maxTowers;
        updateTowerLimit();
    }
});

// 파워업 메뉴 이벤트
document.querySelectorAll('.powerup-item').forEach(item => {
    item.addEventListener('click', () => {
        const powerupType = item.dataset.powerup.toUpperCase();
        const powerup = POWERUPS[powerupType];
        
        if (gameState.gold >= powerup.cost) {
            gameState.gold -= powerup.cost;
            powerup.effect();
            playSound('powerup');
        }
    });
});

/**
 * 업적 체크 함수
 * 게임 진행 중 달성한 업적을 확인하고 처리
 */
function checkAchievements() {
    Object.entries(ACHIEVEMENTS).forEach(([key, achievement]) => {
        if (!achievement.unlocked && achievement.condition()) {
            achievement.unlocked = true;
            showAchievement(achievement.name);
        }
    });
}

// 게임 저장
document.getElementById('saveBtn').addEventListener('click', () => {
    saveGame();
});

// 게임 불러오기
document.getElementById('loadBtn').addEventListener('click', () => {
    loadGame();
});

// 게임 시작 시 로딩 화면
window.addEventListener('load', () => {
    initializeGame(); // 페이지 진입 시 게임 초기화
    drawMinimap();
    // 맵 선택 이벤트 리스너
    const mapSelect = document.getElementById('mapSelect');
    if (mapSelect) {
        mapSelect.value = gameState.currentMap;
        mapSelect.addEventListener('change', (e) => {
            if (!gameState.isStarted) {
                selectMap(e.target.value);
                gameState.currentMap = e.target.value;
                drawMinimap();
            }
        });
    }
    // 로딩 화면 숨기기
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
    
    // 모바일에서 스크롤 힌트 자동 숨김
    const canvasContainer = document.querySelector('.canvas-container');
    if (canvasContainer && window.innerWidth <= 768) {
        setTimeout(() => {
            canvasContainer.classList.add('hide-hint');
        }, 10000); // 10초 후 힌트 숨김
        
        // 스크롤 이벤트로 힌트 숨김
        canvasContainer.addEventListener('scroll', () => {
            canvasContainer.classList.add('hide-hint');
        }, { passive: true });
    }
});

/**
 * 그리드 하이라이트 함수
 * 타워 설치 가능한 위치를 시각적으로 표시
 */
function highlightGrid(x, y) {
    const highlight = document.createElement('div');
    highlight.className = 'grid-highlight';
    highlight.style.left = `${x * TILE_SIZE}px`;
    highlight.style.top = `${y * TILE_SIZE}px`;
    highlight.style.width = `${TILE_SIZE}px`;
    highlight.style.height = `${TILE_SIZE}px`;
    document.querySelector('.game-area').appendChild(highlight);
    
    return highlight;
}

/**
 * 웨이브 보상 계산 함수
 * 웨이브 클리어 시 지급할 골드를 계산
 */
function calculateWaveReward() {
    const baseReward = 50;
    const waveBonus = gameState.wave * 10;
    const difficultyMultiplier = DIFFICULTY_SETTINGS[gameState.difficulty].goldReward;
    const towerBonus = towers.length * 5;
    const levelBonus = gameState.level * 2;
    
    return Math.floor((baseReward + waveBonus + towerBonus + levelBonus) * difficultyMultiplier);
}

/**
 * 저장 데이터 검증 함수
 * 게임 저장 데이터의 유효성을 검사
 */
function validateSaveData(saveData) {
    // 웨이브/스폰, 환경설정, 그룹 등 필드도 검증
    const requiredFields = ['version', 'gameState', 'gameStats', 'towers', 'enemies', 'enemyGroups', 'groupIdCounter', 'achievements', 'currentMap', 'timestamp', 'soundEnabled', 'musicEnabled', 'lowSpecMode'];
    for (const field of requiredFields) {
        if (!(field in saveData)) {
            return false;
        }
    }
    if (!Array.isArray(saveData.towers)) return false;
    for (const tower of saveData.towers) {
        const towerFields = ['x', 'y', 'type', 'level', 'experience', 'experienceToNextLevel', 'rangeLevel', 'damageLevel', 'speedLevel', 'bulletLevel', 'specialLevel', 'activeBuffs', 'activeCombos', 'shieldEffectTime'];
        for (const field of towerFields) {
            if (!(field in tower)) {
                return false;
            }
        }
    }
    if (!Array.isArray(saveData.enemies)) return false;
    for (const enemy of saveData.enemies) {
        const enemyFields = ['x', 'y', 'type', 'health', 'maxHealth', 'statusEffects', 'pathIndex', 'isBoss', 'zigzagFrame', 'groupId'];
        for (const field of enemyFields) {
            if (!(field in enemy)) {
                return false;
            }
        }
    }
    if (!Array.isArray(saveData.enemyGroups)) return false;
    for (const group of saveData.enemyGroups) {
        const groupFields = ['id', 'size', 'type'];
        for (const field of groupFields) {
            if (!(field in group)) {
                return false;
            }
        }
    }
    return true;
}

/**
 * 경험치 획득 함수
 * 경험치를 획득하고 레벨업을 처리
 */
function gainExperience(amount) {
    gameState.experience += amount;
    
    // 레벨업 체크
    while (gameState.experience >= gameState.experienceToNextLevel) {
        gameState.experience -= gameState.experienceToNextLevel;
        gameState.level++;
        gameState.experienceToNextLevel = Math.floor(gameState.experienceToNextLevel * 1.5);
        
        // 레벨업 보상
        const levelUpReward = gameState.level * 50;
        gameState.gold += levelUpReward;
        //showLevelUpEffect(levelUpReward);
    }
    
    updateInfoBar();
}

/**
 * 보스 패턴 이펙트 표시 함수
 * 보스의 특수 패턴 사용 시 시각 효과를 표시
 */
function showBossPatternEffect(x, y, patternName) {
    const parent = document.querySelector('.game-area');
    if (!parent) return;
    // 이미 같은 위치+이름에 이펙트가 있으면 새로 만들지 않음
    let effect = parent.querySelector(`.boss-pattern-effect[data-x='${x}'][data-y='${y}'][data-name='${patternName}']`);
    if (!effect) {
        effect = EffectPool.get('special');
        effect.className = 'boss-pattern-effect';
        effect.setAttribute('data-x', x);
        effect.setAttribute('data-y', y);
        effect.setAttribute('data-name', patternName);
        parent.appendChild(effect);
    }
    effect.textContent = patternName;
    effect.style.display = 'block';
    effect.style.position = 'absolute';
    effect.style.left = `${x * TILE_SIZE + TILE_SIZE/2}px`;
    effect.style.top = `${y * TILE_SIZE + (TILE_SIZE*2)}px`;
    effect.style.transform = 'translate(-50%, -50%)';
    effect.style.zIndex = 1200;
    effect.style.pointerEvents = 'none';
    effect.style.color = '#00eaff';
    effect.style.fontWeight = 'bold';
    effect.style.fontSize = '14px';
    effect.style.textShadow = '0 2px 8px #000, 0 0 8px #00eaff';
    effect.style.animation = 'skillEffectFade 1.2s ease-out forwards';
    effect.addEventListener('animationend', () => {
        EffectPool.release(effect);
    }, { once: true });
    setTimeout(() => {
        EffectPool.release(effect);
    }, 1200);
}

/**
 * 맵 선택 함수
 * 게임 맵을 변경하고 관련 설정을 업데이트
 */
function selectMap(mapKey) {
    if (!MAPS[mapKey]) {
        alert('맵 데이터가 없습니다.');
        return;
    }
    currentMap = MAPS[mapKey];
    path = [...currentMap.path];
    
    // 게임 캔버스에 선택된 맵 표시
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
    ctx.moveTo(currentMap.path[0].x * TILE_SIZE + TILE_SIZE/2, currentMap.path[0].y * TILE_SIZE + TILE_SIZE/2);
    for (let i = 1; i < currentMap.path.length; i++) {
        ctx.lineTo(currentMap.path[i].x * TILE_SIZE + TILE_SIZE/2, currentMap.path[i].y * TILE_SIZE + TILE_SIZE/2);
    }
    ctx.stroke();
    
    // 시작점과 끝점 표시
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(currentMap.path[0].x * TILE_SIZE + TILE_SIZE/2, currentMap.path[0].y * TILE_SIZE + TILE_SIZE/2, TILE_SIZE/4, 0, Math.PI * 2);
            ctx.fill();
    ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
    ctx.arc(currentMap.path[currentMap.path.length-1].x * TILE_SIZE + TILE_SIZE/2, currentMap.path[currentMap.path.length-1].y * TILE_SIZE + TILE_SIZE/2, TILE_SIZE/4, 0, Math.PI * 2);
            ctx.fill();
    
    // 맵 이름 표시
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(t(currentMap.name), canvas.width/2, 10);
    
    // 게임 재시작
    restartGame();
}

// 맵 선택 UI 이벤트 리스너
document.getElementById('mapSelect').addEventListener('change', (e) => {
    if (!gameState.isStarted) {
        selectMap(e.target.value);
        gameState.currentMap = e.target.value;
        drawMinimap();
    }
});

/**
 * 미니맵 그리기 함수
 * 게임 화면 우측에 미니맵을 표시
 */
function drawMinimap() {
    const minimapCanvas = document.getElementById('minimapCanvas');
    if (!minimapCanvas) return;
    
    const minimapCtx = minimapCanvas.getContext('2d');
    const minimapWidth = minimapCanvas.width;
    const minimapHeight = minimapCanvas.height;
    
    // 미니맵 배경 지우기
    minimapCtx.clearRect(0, 0, minimapWidth, minimapHeight);
    
    // 미니맵 배경색 설정
    minimapCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    minimapCtx.fillRect(0, 0, minimapWidth, minimapHeight);
    
    // 경로 그리기
    minimapCtx.strokeStyle = '#4CAF50';
    minimapCtx.lineWidth = 3;
    minimapCtx.beginPath();
    
    const scaleX = minimapWidth / GRID_WIDTH;
    const scaleY = minimapHeight / GRID_HEIGHT;
    
    if (currentMap && currentMap.path) {
        currentMap.path.forEach((point, index) => {
            const x = point.x * scaleX;
            const y = point.y * scaleY;
            
            if (index === 0) {
                minimapCtx.moveTo(x, y);
            } else {
                minimapCtx.lineTo(x, y);
            }
        });
        
        minimapCtx.stroke();
        
        // 타워 표시
        towers.forEach(tower => {
            const x = tower.x * scaleX;
            const y = tower.y * scaleY;
            
            minimapCtx.fillStyle = tower.color;
            minimapCtx.beginPath();
            minimapCtx.arc(x, y, 3, 0, Math.PI * 2);
            minimapCtx.fill();
        });
        
        // 적 표시
        enemies.forEach(enemy => {
            const x = enemy.x * scaleX;
            const y = enemy.y * scaleY;
            
            minimapCtx.fillStyle = enemy.isBoss ? enemy.color : '#FF4444';
            minimapCtx.beginPath();
            minimapCtx.arc(x, y, 2, 0, Math.PI * 2);
            minimapCtx.fill();
        });

        // 시작점과 끝점 표시
        if (currentMap.path.length > 0) {
            // 시작점
            const start = currentMap.path[0];
            minimapCtx.fillStyle = '#4CAF50';
            minimapCtx.beginPath();
            minimapCtx.arc(start.x * scaleX, start.y * scaleY, 4, 0, Math.PI * 2);
            minimapCtx.fill();

            // 끝점
            const end = currentMap.path[currentMap.path.length - 1];
            minimapCtx.fillStyle = '#FF0000';
            minimapCtx.beginPath();
            minimapCtx.arc(end.x * scaleX, end.y * scaleY, 4, 0, Math.PI * 2);
            minimapCtx.fill();
        }
    }
}

/**
 * 조합 이펙트 표시 함수
 * 타워 조합 발견 시 시각 효과를 표시
 */
function showComboEffect(comboName) {
    if (lowSpecMode) return;
    const effect = document.createElement('div');
    effect.className = 'combo-effect';
    effect.innerHTML = `
        <h3>${t('comboDiscovered')}</h3>
        <p>${comboName}</p>
    `;
    document.body.appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 3000);
}

// 게임 시작
gameLoop(); 

// CSS 스타일 추가
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .combo-effect {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: gold;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 1000;
            animation: fadeInOut 3s ease-in-out;
        }

        .achievement {
            opacity: 0.5;
            transition: opacity 0.3s ease;
        }

        .achievement.unlocked {
            opacity: 1;
            color: gold;
        }

        #eventsList {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        #eventsList li {
            padding: 5px 0;
            border-bottom: 1px solid #ccc;
        }

        @keyframes fadeInOut {
            0% { opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; }
        }
    </style>
`);

// CSS 스타일 추가
document.head.insertAdjacentHTML('beforeend', `
    <style>
        /* 게임 컨테이너 스타일 */
        .game-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
            background: #1a1a1a;
            min-height: 100vh;
        }

        /* 게임 영역 스타일 */
        .game-area {
            position: relative;
            background: #2a2a2a;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }

        /* 정보 바 스타일 */
        .info-bar {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            padding: 15px;
            background: #2a2a2a;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        }

        .info-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: #333;
            border-radius: 8px;
            color: #fff;
        }

        .info-icon {
            font-size: 1.5em;
            color: #4CAF50;
        }

        /* 컨트롤 버튼 스타일 */
        .control-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 15px;
        }

        .control-button {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            background: #4CAF50;
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .control-button:hover {
            background: #45a049;
            transform: translateY(-2px);
        }

        /* 미니맵 스타일 */
        .minimap-container {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        }

        #minimapCanvas {
            border: 2px solid #4CAF50;
            border-radius: 4px;
        }

        /* 웨이브 진행 바 스타일 */
        .wave-progress {
            width: 100%;
            height: 10px;
            background: linear-gradient(90deg, #232526 0%, #414345 100%);
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
            overflow: hidden;
            margin: 10px 0 14px 0;
            position: relative;
            border: 1px solid #2196F3;
        }
        .wave-progress .fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50 0%, #2196F3 100%);
            border-radius: 8px 0 0 8px;
            transition: width 0.5s cubic-bezier(.4,2,.6,1);
            box-shadow: 0 0 8px #2196F355;
        }
        .wave-progress .progress-text {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            color: #fff;
            font-weight: bold;
            font-size: 11px;
            text-shadow: 1px 1px 2px #0008;
            pointer-events: none;
        }
        @media (max-width: 768px) {
            .wave-progress {
                height: 12px;
                border-radius: 6px;
            }
            .wave-progress .progress-text {
                font-size: 9px;
            }
        }

        /* 알림 메시지 스타일 */
        .notification {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 30px;
            background: rgba(0, 0, 0, 0.9);
            color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
            from { transform: translate(-50%, -100%); }
            to { transform: translate(-50%, 0); }
        }

        /* 타워 메뉴 스타일 */
        .tower-menu {
            position: fixed;
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid #4CAF50;
            border-radius: 10px;
            padding: 20px;
            color: white;
            z-index: 1000;
            min-width: 300px;
            box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
        }

        .tower-menu-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #4CAF50;
        }

        .tower-menu-title {
            font-size: 1.2em;
            color: #4CAF50;
            font-weight: bold;
        }

        /* 업그레이드 버튼 스타일 */
        .upgrade-button {
            width: 100%;
            padding: 10px;
            margin-top: 10px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .upgrade-button:hover:not(:disabled) {
            background: #45a049;
        }

        .upgrade-button:disabled {
            background: #666;
            cursor: not-allowed;
        }

        /* 모바일 최적화 */
        @media (max-width: 768px) {
            .game-container {
                padding: 10px;
            }

            .info-bar {
                grid-template-columns: repeat(2, 1fr);
            }

            .control-buttons {
                flex-wrap: wrap;
            }

            .control-button {
                flex: 1 1 calc(50% - 10px);
            }

            .minimap-container {
                position: relative;
                top: 0;
                right: 0;
                margin-top: 15px;
            }
        }
    </style>
`);

// CSS 스타일 추가
document.head.insertAdjacentHTML('beforeend', `
    <style>
        /* 카운트다운 스타일 */
        .countdown {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 72px;
            font-weight: bold;
            color: white;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            display: none;
            z-index: 1000;
        }

        /* 기존 스타일 */
        .combo-effect {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: gold;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 1000;
            animation: fadeInOut 3s ease-in-out;
        }

        .achievement {
            opacity: 0.5;
            transition: opacity 0.3s ease;
        }

        .achievement.unlocked {
            opacity: 1;
            color: gold;
        }

        #eventsList {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        #eventsList li {
            padding: 5px 0;
            border-bottom: 1px solid #ccc;
        }

        @keyframes fadeInOut {
            0% { opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; }
        }
    </style>
`);

// 음향 설정 버튼 이벤트 리스너
document.getElementById('soundToggleBtn').addEventListener('click', function() {
    toggleSound();
    this.classList.toggle('muted');
    this.textContent = soundEnabled ? `🔊 ${t('soundEffects')}` : `🔇 ${t('soundEffects')}`;
});

document.getElementById('musicToggleBtn').addEventListener('click', function() {
    toggleMusic();
    this.classList.toggle('muted');
    this.textContent = musicEnabled ? `🎵 ${t('backgroundMusic')}` : `🎵 ${t('backgroundMusic')}`;
});

document.head.insertAdjacentHTML('beforeend', `
    <style>
        /* 미니맵 컨테이너 스타일 수정 */
        .minimap-container {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 170px;
        }

        #minimapCanvas {
            border: 2px solid #4CAF50;
            border-radius: 4px;
            background: rgba(0, 0, 0, 0.5);
            width: 150px;
            height: 150px;
        }

        /* 게임 설정 스타일 */
        .game-settings {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 100%;
        }

        .settings-row {
            display: flex;
            gap: 8px;
        }

        .setting-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .setting-item label {
            color: #4CAF50;
            font-size: 12px;
            font-weight: bold;
        }

        .setting-item select {
            padding: 4px;
            border-radius: 4px;
            border: 1px solid #4CAF50;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .setting-item select:hover {
            background: rgba(0, 0, 0, 0.9);
            border-color: #45a049;
        }

        .setting-item select:focus {
            outline: none;
            border-color: #45a049;
            box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
        }

        /* 다음 웨이브 버튼 스타일 */
        .wave-start-button {
            padding: 8px;
            background: linear-gradient(to bottom, #4CAF50, #45a049);
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }

        .wave-start-button:hover {
            background: linear-gradient(to bottom, #45a049, #3d8b40);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .wave-start-button:active {
            transform: translateY(0);
            box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
        }

        /* 사운드 컨트롤 스타일 */
        .sound-controls {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-top: 4px;
            padding-top: 6px;
            border-top: 1px solid rgba(76, 175, 80, 0.3);
        }

        .sound-button {
            display: flex;
            align-items: center;
            padding: 6px 8px;
            background: rgba(0, 0, 0, 0.6);
            border: 1px solid #4CAF50;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
        }

        .sound-button:hover {
            background: rgba(0, 0, 0, 0.8);
            border-color: #45a049;
        }

        .sound-icon {
            font-size: 14px;
            margin-right: 6px;
            width: 20px;
            text-align: center;
        }

        .sound-label {
            flex-grow: 1;
            font-size: 12px;
            font-weight: bold;
        }

        .sound-status {
            font-size: 10px;
            padding: 1px 4px;
            background: rgba(76, 175, 80, 0.2);
            border-radius: 3px;
            color: #4CAF50;
        }

        .sound-button.muted .sound-status {
            background: rgba(255, 0, 0, 0.2);
            color: #ff4444;
        }

        .sound-button.muted .sound-status::after {
            content: "꺼짐";
        }

        .sound-button:not(.muted) .sound-status::after {
            content: "켜짐";
        }

        /* 모바일 최적화 */
        @media (max-width: 768px) {
            .minimap-container {
                position: relative;
                top: 0;
                right: 0;
                margin: 10px auto;
                width: 90%;
                max-width: 170px;
            }

            .settings-row {
                flex-direction: column;
                gap: 6px;
            }

            .setting-item {
                width: 100%;
            }

            .sound-button {
                padding: 4px 6px;
            }

            .sound-icon {
                font-size: 12px;
                margin-right: 4px;
            }

            .sound-label {
                font-size: 10px;
            }

            .sound-status {
                font-size: 8px;
                padding: 1px 3px;
            }
        }
    </style>
`);

// 초기 상태 설정
window.addEventListener('load', () => {
    loadSoundSettings(); // 저장된 사운드 설정 불러오기
});

document.head.insertAdjacentHTML('beforeend', `
    <style>
        /* 기존 스타일 유지 */
        // ... existing code ...

        /* 게임 컨트롤 스타일 */
        .game-controls {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid rgba(76, 175, 80, 0.3);
            width: 100%;
            box-sizing: border-box;
            padding-left: 0;
            padding-right: 0;
        }

        .control-button {
            padding: 4px 6px;
            background: rgba(0, 0, 0, 0.6);
            border: 1px solid #4CAF50;
            border-radius: 4px;
            color: white;
            font-size: 11px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
            text-align: center;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            margin: 4px 0;
        }

        .control-button:hover {
            background: rgba(0, 0, 0, 0.8);
            border-color: #45a049;
            transform: translateY(-1px);
        }

        .control-button:active {
            transform: translateY(0);
        }

        #startBtn {
            background: linear-gradient(to bottom, #4CAF50, #45a049);
            border: none;
            color: white;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }

        #startBtn:hover {
            background: linear-gradient(to bottom, #45a049, #3d8b40);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        #pauseBtn {
            background: linear-gradient(to bottom, #ff9800, #f57c00);
            border: none;
            color: white;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }

        #pauseBtn:hover {
            background: linear-gradient(to bottom, #f57c00, #ef6c00);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        /* 다음 웨이브 버튼 스타일 */
        .wave-start-button {
            padding: 0 8px;
            background: linear-gradient(to bottom, #2196F3, #1976D2);
            border: none;
            color: white;
            font-size: 14px;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
            text-align: center;
            box-sizing: border-box;
            margin: 4px 0;
        }

        .wave-start-button:hover {
            background: linear-gradient(to bottom, #1976D2, #1565C0);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            transform: translateY(-1px);
        }

        .wave-start-button:active {
            transform: translateY(0);
            box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
        }

        /* 게임 설정 컨테이너 스타일 */
        .game-settings {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 100%;
            box-sizing: border-box;
            padding-left: 0;
            padding-right: 0;
        }

        /* 미니맵 컨테이너 스타일 수정 */
        .minimap-container {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 170px;
            box-sizing: border-box;
        }

        /* 모바일 최적화 */
        @media (max-width: 768px) {
            .minimap-container {
                position: relative;
                top: 0;
                right: 0;
                margin: 10px auto;
                width: 90%;
                max-width: 170px;
                padding: 8px;
            }

            .game-settings {
                width: 100%;
                padding-left: 0;
                padding-right: 0;
            }

            .game-controls {
                width: 100%;
                padding-left: 0;
                padding-right: 0;
            }
        }
    </style>
`);

document.head.insertAdjacentHTML('beforeend', `
    <style>
        .info-bar {
            gap: 6px;
            padding: 8px;
        }
        .info-item {
            padding: 4px 6px;
            font-size: 12px;
        }
        .info-icon {
            font-size: 16px;
        }
        @media (max-width: 768px) {
            .info-bar {
                margin-top: 50px;
                gap: 4px;
                padding: 4px;
            }
            .info-item {
                padding: 2px 4px;
                font-size: 11px;
            }
            .info-icon {
                font-size: 13px;
            }
        }
    </style>
`);

document.head.insertAdjacentHTML('beforeend', `
    <style>
        /* 타워 설치 레이어 UI 개선 */
        #towerBuildMenu {
            background: linear-gradient(135deg, #232526 0%, #414345 100%);
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            padding: 12px;
            border: 1px solid #2196F3;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
        }
        #towerBuildMenu .tower-item {
            background: linear-gradient(to bottom, #4CAF50, #45a049);
            border: none;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            width: 100%;
        }
        #towerBuildMenu .tower-item:hover {
            background: linear-gradient(to bottom, #45a049, #3d8b40);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            transform: translateY(-1px);
        }
        #towerBuildMenu .tower-item:active {
            transform: translateY(0);
            box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
        }

        /* 타워 업그레이드 레이어 UI 개선 */
        #towerUpgradeMenu {
            background: linear-gradient(135deg, #232526 0%, #414345 100%);
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            padding: 12px;
            border: 1px solid #2196F3;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
        }
        #towerUpgradeMenu .upgrade-item {
            background: linear-gradient(to bottom, #4CAF50, #45a049);
            border: none;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            width: 100%;
        }
        #towerUpgradeMenu .upgrade-item:hover {
            background: linear-gradient(to bottom, #45a049, #3d8b40);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            transform: translateY(-1px);
        }
        #towerUpgradeMenu .upgrade-item:active {
            transform: translateY(0);
            box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
        }
    </style>
`);

document.head.insertAdjacentHTML('beforeend', `
    <style>
        /* 타워 업그레이드 메뉴 스타일 */
        .tower-menu {
            position: fixed;
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid #4CAF50;
            border-radius: 12px;
            padding: 15px;
            color: white;
            z-index: 1000;
            width: 85%;
            max-width: 400px;
            max-height: 80vh;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
            backdrop-filter: blur(10px);
        }

        .tower-header {
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(76, 175, 80, 0.3);
        }

        .tower-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 10px;
        }

        .tower-title h3 {
            margin: 0;
            color: #4CAF50;
            font-size: 1.1em;
        }

        .tower-level {
            background: #4CAF50;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.8em;
        }

        .tower-stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 4px;
            background: rgba(76, 175, 80, 0.05);
            border-radius: 6px;
            padding: 6px;
            margin: 6px 0;
        }

        .stat-item {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 3px 4px;
            background: rgba(76, 175, 80, 0.1);
            border-radius: 4px;
            font-size: 0.8em;
        }

        .stat-icon {
            font-size: 1em;
            min-width: 18px;
            text-align: center;
        }

        .stat-value {
            color: #4CAF50;
            font-weight: bold;
            flex: 1;
        }

        .stat-level {
            color: #888;
            font-size: 0.7em;
            background: rgba(0, 0, 0, 0.2);
            padding: 1px 3px;
            border-radius: 2px;
        }

        .upgrade-section {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 15px;
        }

        .upgrade-item {
            background: rgba(76, 175, 80, 0.1);
            border-radius: 6px;
            padding: 8px;
            transition: all 0.3s ease;
        }

        .upgrade-item:hover {
            background: rgba(76, 175, 80, 0.2);
        }

        .upgrade-info {
            margin-bottom: 8px;
        }

        .upgrade-header {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 6px;
        }

        .upgrade-icon {
            font-size: 1.1em;
        }

        .upgrade-name {
            font-weight: bold;
            color: #4CAF50;
            font-size: 0.9em;
        }

        .upgrade-description {
            font-size: 0.75em;
            color: #888;
            margin-bottom: 6px;
        }

        .upgrade-progress {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .progress-bar {
            flex: 1;
            height: 4px;
            background: rgba(76, 175, 80, 0.2);
            border-radius: 2px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: #4CAF50;
            transition: width 0.3s ease;
        }

        .progress-text {
            font-size: 0.75em;
            color: #888;
        }

        .upgrade-button {
            width: 100%;
            padding: 6px;
            background: linear-gradient(to bottom, #4CAF50, #45a049);
            border: none;
            border-radius: 3px;
            color: white;
            font-weight: bold;
            font-size: 0.9em;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .upgrade-button:hover:not(:disabled) {
            background: linear-gradient(to bottom, #45a049, #3d8b40);
            transform: translateY(-1px);
        }

        .upgrade-button:disabled {
            background: #666;
            cursor: not-allowed;
        }

        .sell-section {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid rgba(76, 175, 80, 0.3);
        }

        .sell-button {
            width: 100%;
            padding: 8px;
            background: linear-gradient(to bottom, #f44336, #d32f2f);
            border: none;
            border-radius: 4px;
            color: white;
            font-weight: bold;
            font-size: 0.9em;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }

        .sell-button:hover {
            background: linear-gradient(to bottom, #d32f2f, #b71c1c);
            transform: translateY(-1px);
        }

        @media (max-width: 768px) {
            .tower-menu {
                width: 90%;
                max-width: 350px;
                padding: 12px;
            }

            .upgrade-section {
                grid-template-columns: 1fr;
            }

            .tower-stats {
                grid-template-columns: 1fr;
            }
        }
    </style>
`);

document.head.insertAdjacentHTML('beforeend', `
    <style>
        .tower-range-preview {
            position: absolute;
            border-radius: 50%;
            background: rgba(76, 175, 80, 0.1);
            border: 2px solid rgba(76, 175, 80, 0.5);
            pointer-events: none;
            z-index: 100;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
            }
        }
    </style>
`);


/**
 * 상태 효과 표시 함수
 * 적에게 적용된 상태 효과를 시각적으로 표시
 */
function showStatusEffect(x, y, effectType) {
    const effect = document.createElement('div');
    effect.className = 'status-effect';
    effect.style.left = `${x * TILE_SIZE}px`;
    effect.style.top = `${y * TILE_SIZE}px`;
    effect.textContent = STATUS_EFFECTS[effectType].name;
    effect.style.color = STATUS_EFFECTS[effectType].color;
    
    document.getElementById('game-container').appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 1000);
}

/**
 * 상태 효과 업데이트 함수
 * 적의 상태 효과 지속시간과 효과를 관리
 */
function updateStatusEffects(enemy) {
    if (enemy.isDead) return;
    
    for (const [effectType, effect] of enemy.statusEffects) {
        if (!STATUS_EFFECTS[effectType]) continue;
        
        effect.remaining--;
        
        // 효과 업데이트
        if (STATUS_EFFECTS[effectType].update) {
            const shouldRemove = STATUS_EFFECTS[effectType].update(enemy);
            if (shouldRemove) {
                enemy.statusEffects.delete(effectType);
                continue;
            }
        }
        
        // 효과 종료
        if (effect.remaining <= 0) {
            // 효과 제거 시 원래 상태로 복구
            switch(effectType) {
                case 'FROZEN':
                    enemy.speed = enemy.baseSpeed;
                    break;
                case 'POISON':
                case 'BURNING':
                    enemy.continuousDamage = Math.max(0, enemy.continuousDamage - STATUS_EFFECTS[effectType].damagePerTick);
                    if (enemy.continuousDamage < 0) enemy.continuousDamage = 0;
                    break;
            }
            enemy.statusEffects.delete(effectType);
        }
    }
}

/**
 * 힐 이펙트 표시 함수
 * 힐링 효과 발생 시 시각 효과를 표시
 */
function showHealEffect(x, y) {
    const effect = {
        x: x * TILE_SIZE + TILE_SIZE / 2,
        y: y * TILE_SIZE + TILE_SIZE / 2,
        radius: 0,
        maxRadius: TILE_SIZE,
        alpha: 1,
        duration: 30, // 0.5초
        currentFrame: 0
    };

    const animate = () => {
        if (effect.currentFrame >= effect.duration) return;

        ctx.save();
        ctx.globalAlpha = effect.alpha * (1 - effect.currentFrame / effect.duration);
        ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(
            effect.x,
            effect.y,
            effect.radius + (effect.maxRadius - effect.radius) * (effect.currentFrame / effect.duration),
            0,
            Math.PI * 2
        );
        ctx.fill();
            ctx.restore();

        effect.currentFrame++;
        requestAnimationFrame(animate);
    };

    animate();
}

/**
 * 매복 이펙트 표시 함수
 * 매복 패턴 사용 시 시각 효과를 표시
 */
function showAmbushEffect(x, y) {
    const effect = {
        x: x * TILE_SIZE + TILE_SIZE / 2,
        y: y * TILE_SIZE + TILE_SIZE / 2,
        radius: 0,
        maxRadius: TILE_SIZE * 2,
        alpha: 1,
        duration: 20,
        currentFrame: 0
    };

    const animate = () => {
        if (effect.currentFrame >= effect.duration) return;

            ctx.save();
        ctx.globalAlpha = effect.alpha * (1 - effect.currentFrame / effect.duration);
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
            ctx.beginPath();
        ctx.arc(
            effect.x,
            effect.y,
            effect.radius + (effect.maxRadius - effect.radius) * (effect.currentFrame / effect.duration),
            0,
            Math.PI * 2
            );
            ctx.stroke();
            ctx.restore();

        effect.currentFrame++;
        requestAnimationFrame(animate);
    };

    animate();
}

/**
 * 스킬 이펙트 표시 함수
 * 적의 스킬 사용 시 시각 효과를 표시
 */
function showSkillEffect(x, y, name) {
    skillEffects.push({
        x, y, name,
        startTime: performance.now(),
        duration: 1200 // ms
    });
}

/**
 * 그룹 버프 적용 함수
 * 적 그룹에 버프 효과를 적용
 */
function applyGroupBuffs() {
    enemyGroups.forEach(group => {
        const alive = group.members.filter(e => e.health > 0 && !e.isDead);
        alive.forEach(e => {
            e.groupSpeedBuff = (alive.length === group.members.length) ? 1.2 : 1.0;
            e.groupDefenseBuff = (alive.length === 1) ? 1.5 : 1.0;
        });
        // 그룹 내 모두 죽었으면 버프 해제
        if (alive.length === 0) {
            group.members.forEach(e => {
                e.groupSpeedBuff = 1.0;
                e.groupDefenseBuff = 1.0;
            });
        }
    });
}

// 현재 맵 초기화
currentMap = MAPS[gameState.currentMap];

// 페이지 로드 시 미니맵 초기화
window.addEventListener('load', () => {
    drawMinimap();
    
    // 맵 선택 이벤트 리스너
    const mapSelect = document.getElementById('mapSelect');
    if (mapSelect) {
        mapSelect.value = gameState.currentMap;
        mapSelect.addEventListener('change', (e) => {
            if (!gameState.isStarted) {
                selectMap(e.target.value);
                gameState.currentMap = e.target.value;
                drawMinimap();
            }
        });
    }
});

// ... existing code ...
document.getElementById('waveStartButton').addEventListener('click', () => {
    showCountdown(); // initializeGame() 호출 금지
});

if (mapSelect) {
    mapSelect.addEventListener('change', (e) => {
        if (!gameState.isStarted) {
            selectMap(e.target.value);
            gameState.currentMap = e.target.value;
            drawMinimap(); // 미리보기 항상 갱신
        }
    });
}

if (startBtn) {
    // 기존에 이벤트 리스너가 중복 등록되지 않도록 제거
    startBtn.replaceWith(startBtn.cloneNode(true));
    const newStartBtn = document.getElementById('startBtn');
    
    newStartBtn.addEventListener('click', () => {
        if (!gameState.isStarted) {
            // 게임 시작
            gameState.isStarted = true;
            
            newStartBtn.textContent = t('restart');
            document.getElementById('tutorial').style.display = 'none';
            document.getElementById('waveStartButton').style.display = 'block';
            
            // 게임 초기화
            initializeGame();
            updateControlVisibility();
            
            // 게임 화면으로 전환
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 게임 시작 시 배경음악 재생
            if (musicEnabled) {
                sounds.bgm.loop = true;
                sounds.bgm.play().catch(error => console.log(t('bgmPlayFailed') + ':', error));
            }
        } else {
            // 게임 재시작
            restartGame();
            gameState.isStarted = true;
            updateControlVisibility();
        }
    });
}

/**
 * 이펙트 초기화 함수
 * 게임에서 사용할 이펙트 풀을 초기화
 */
function initializeEffects() {
    // 이펙트 풀 초기화
    EffectPool.init('attack', 20);
    EffectPool.init('damage', 30);
    EffectPool.init('special', 5);
    EffectPool.init('upgrade', 5);
    EffectPool.init('levelUp', 5);  // 레벨업 이펙트 풀 추가
}

/**
 * 공격 이펙트 표시 함수
 * 타워의 공격 시 시각 효과를 표시
 */
function showAttackEffect(x, y, targetX, targetY, isCritical = false) {
    if (lowSpecMode) return;
    const effect = EffectPool.get('attack');
    
    // 시작점과 목표점의 중심 좌표 계산
    const startX = x * TILE_SIZE + TILE_SIZE/2;
    const startY = y * TILE_SIZE + TILE_SIZE/2;
    const endX = targetX * TILE_SIZE + TILE_SIZE/2;
    const endY = targetY * TILE_SIZE + TILE_SIZE/2;
    
    // 공격선의 각도와 거리 계산
    const angle = Math.atan2(endY - startY, endX - startX);
    const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    
    effect.style.cssText = `
        display: block;
        left: ${startX}px;
        top: ${startY}px;
        width: ${distance}px;
        transform: rotate(${angle}rad);
    `;
    
    if (isCritical) {
        effect.classList.add('critical');
    }
    
    // 사운드 재생
    playSound(isCritical ? 'tower_critical' : 'tower_attack');
    
    // 애니메이션 종료 후 풀로 반환
    effect.addEventListener('animationend', () => {
        EffectPool.release(effect);
    }, { once: true });
}

/**
 * 데미지 숫자 표시 함수
 * 적에게 입힌 데미지를 숫자로 표시
 */
function showDamageNumber(x, y, damage, isCritical = false) {
    if (lowSpecMode) return;
    damageEffects.push({
        x, y, value: damage, isCritical,
        startTime: performance.now(),
        offsetX: (Math.random() - 0.5) * 16,
        velocity: -5.5,
        currentY: y * TILE_SIZE + TILE_SIZE / 2,
        finished: false
    });
}

// 데미지 숫자 점프 애니메이션 스타일 추가
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .damage-number {
            position: absolute;
            will-change: transform, opacity;
            font-weight: bold;
            text-shadow: 0 0 8px #fff, 0 0 4px #000;
        }
        .damage-number.critical {
            color: #ff4444;
            text-shadow: 0 0 10px #ff0000, 0 0 20px #ff0000, 0 0 30px #ff0000;
            font-weight: 900;
        }
        @keyframes damageNumberParabola {
            0% {
                opacity: 1;
                transform: translate(-50%, 0) scale(1);
                text-shadow: 0 0 10px #fff, 0 0 5px #000;
            }
            25% {
                opacity: 1;
                transform: translate(-50%, -60%) scale(1.18);
                text-shadow: 0 0 14px #fff, 0 0 8px #000;
            }
            50% {
                opacity: 0.95;
                transform: translate(-50%, -90%) scale(1.25);
                text-shadow: 0 0 16px #fff, 0 0 10px #000;
            }
            70% {
                opacity: 0.7;
                transform: translate(-50%, -40%) scale(1.08);
                text-shadow: 0 0 10px #fff, 0 0 5px #000;
            }
            85% {
                opacity: 0.4;
                transform: translate(-50%, 10%) scale(0.95);
                text-shadow: 0 0 6px #fff, 0 0 2px #000;
            }
            100% {
                opacity: 0;
                transform: translate(-50%, 40%) scale(0.8);
                text-shadow: 0 0 2px #fff, 0 0 1px #000;
            }
        }
    </style>
`);

/**
 * 특수 이펙트 표시 함수
 * 특수 능력 사용 시 시각 효과를 표시
 */
function showSpecialEffect(x, y, name) {
    if (lowSpecMode) return;
    specialEffects.push({
        x, y, name,
        startTime: performance.now(),
        duration: 1200 // ms
    });
    playSound('special');
}

window.addEventListener('DOMContentLoaded', function() {
    // ... 기존 초기화 코드 ...
    // 저사양 모드 체크박스 연동
    const lowSpecToggle = document.getElementById('lowSpecToggle');
    if (lowSpecToggle) {
        // 저장된 값 불러오기
        const saved = localStorage.getItem('lowSpecMode');
        if (saved === '1') {
            lowSpecToggle.checked = true;
            applyLowSpecMode(true);
        }
        lowSpecToggle.addEventListener('change', function() {
            applyLowSpecMode(this.checked);
        });
    }
});

/**
 * 컨트롤 가시성 업데이트 함수
 * 게임 상태에 따라 UI 컨트롤의 표시 여부를 관리
 */
function updateControlVisibility() {
    const isStarted = gameState.isStarted;
    // 게임 시작 버튼은 항상 노출, 텍스트만 변경
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.style.display = 'inline-block';
        startBtn.textContent = isStarted ? t('restart') : t('start');
    }
    // 난이도/맵 드롭다운
    document.getElementById('difficultySelect').style.display = isStarted ? 'none' : 'inline-block';
    document.getElementById('mapSelect').style.display = isStarted ? 'none' : 'inline-block';
    // 시작 후 노출
    document.getElementById('waveStartButton').style.display = isStarted ? 'inline-block' : 'none';
    document.getElementById('pauseBtn').style.display = isStarted ? 'inline-block' : 'none';
    document.getElementById('saveBtn').style.display = isStarted ? 'inline-block' : 'none';
    document.getElementById('loadBtn').style.display = isStarted ? 'inline-block' : 'none';
    document.getElementById('soundToggleBtn').style.display = isStarted ? 'inline-block' : 'none';
    document.getElementById('musicToggleBtn').style.display = isStarted ? 'inline-block' : 'none';
}

// 페이지 로드 시 초기 상태 설정
window.addEventListener('DOMContentLoaded', updateControlVisibility);

document.head.insertAdjacentHTML('beforeend', `
    <style>
        .enemy-skill-effect {
            position: absolute;
            color: #00eaff;
            font-weight: bold;
            font-size: 14px;
            text-shadow: 0 2px 8px #000, 0 0 8px #00eaff;
            z-index: 1200;
            pointer-events: none;
            animation: skillEffectFade 1.2s ease-out forwards;
        }
        .special-text {
            writing-mode: horizontal-tb !important;
            white-space: nowrap !important;
            text-align: center;
            font-size: 16px;
            color: #6cf;
            text-shadow: 0 2px 8px #000, 0 0 8px #6cf;
            font-weight: bold;
            letter-spacing: 2px;
            line-height: 1;
            margin: 0;
            padding: 0;
        }
        @keyframes skillEffectFade {
            0% { opacity: 1; transform: scale(1.2) translate(-50%, -50%);}
            100% { opacity: 0; transform: scale(1) translate(-50%, -80%);}
        }
    </style>
`);

// 1. BOSS_PATTERNS.HEAL 개선 (조건부 분기/랜덤성/예고)
BOSS_PATTERNS.HEAL = {
    name: '힐',
    cooldown: 240,
    update: (boss) => {
        if (boss.isDead) return true;
        // 쿨다운 60프레임(1초) 전 예고
        // if (boss.patternCooldown === 60) showBossPatternWarning(boss.x, boss.y, '힐');
        // 체력 50% 이하일 때만 힐 사용
        if (boss.health / boss.maxHealth <= 0.5 && boss.patternCooldown === 0) {
            const healAmount = Math.floor(boss.maxHealth * 0.4);
            boss.health = Math.min(boss.maxHealth, boss.health + healAmount);
            showBossPatternEffect(boss.x, boss.y, t('bossPatternHealStrong'));
            playSound('bossHeal');
        } else if (boss.patternCooldown === 0) {
            // 50% 초과면 소환 행동
            // 소환: 일반 적 2~3마리 생성
            const summonCount = Math.floor(Math.random() * 2) + 2; // 2~3마리
            for (let i = 0; i < summonCount; i++) {
                const enemy = new Enemy(gameState.wave, false);
                // 소환 위치를 보스 위치로 지정
                enemy.x = boss.x;
                enemy.y = boss.y;
                enemies.push(enemy);
            }
            showBossPatternEffect(boss.x, boss.y, t('bossPatternSummon'));
            playSound('bossSummon');
        }
        return false;
    }
};

// 2. 상태이상 내성/면역/중첩 제한
Enemy.prototype.applyStatusEffect = function(effectType, duration) {
    const effect = STATUS_EFFECTS[effectType];
    if (!effect) return;
    // 보스는 FROZEN 완전 면역
    if (this.type === 'BOSS' && effectType === 'FROZEN') return;
    // 탱커는 POISON 50%만 적용
    let actualDuration = duration || effect.duration;
    if (this.type === 'TANK' && effectType === 'POISON') actualDuration = Math.ceil(actualDuration * 0.5);
    if (this.type === 'BOSS') actualDuration = Math.ceil(actualDuration * 0.5);
    // 중첩 제한: 최대 2번까지만 중첩
    if (this.statusEffects.has(effectType)) {
        const current = this.statusEffects.get(effectType);
        if (current.remaining < actualDuration * 2) {
            current.remaining = Math.max(current.remaining, actualDuration);
        }
    } else {
        this.statusEffects.set(effectType, {
            duration: actualDuration,
            remaining: actualDuration
        });
        switch(effectType) {
            case 'FROZEN':
                this.speed *= effect.speedMultiplier;
                break;
            case 'POISON':
            case 'BURNING':
                this.continuousDamage += effect.damagePerTick;
                break;
        }
    }
};

/**
 * 웨이브 메시지 그리기 함수
 * 웨이브 시작 시 화면에 메시지를 표시
 */
function drawWaveMessage() {
    if (!gameState.currentWaveMessage) return;

    const elapsed = Date.now() - gameState.waveMessageStartTime;
    if (elapsed > 2000) {
        gameState.currentWaveMessage = null;
        return;
    }

    const alpha = elapsed < 500 ? elapsed / 500 :
        elapsed > 1500 ? (2000 - elapsed) / 500 : 1;

    ctx.save();

    // 배경
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.8})`;
    ctx.fillRect(
        canvas.width / 2 - 150,
        canvas.height / 2 - 80,
        300,
        160
    );

    // 웨이브 시작 텍스트
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`; // 골드 색상
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (gameState.currentWaveMessage.isBoss) {
        // 보스 웨이브 메시지
        ctx.fillText(
            `${t('bossWave')} ${gameState.currentWaveMessage.wave} ${t('waveStart')}!`,
            canvas.width / 2,
            canvas.height / 2 - 40
        );

        // 보스 타입 표시
        ctx.font = '18px Arial';
        ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`; // 빨간색
        const bossTypes = Object.keys(BOSS_TYPES);
        const randomBossType = bossTypes[Math.floor(Math.random() * bossTypes.length)];
        ctx.fillText(
            `${t(BOSS_TYPES[randomBossType].name)} ${t('bossAppear')}!`,
            canvas.width / 2,
            canvas.height / 2
        );
    } else {
        // 일반 웨이브 메시지
        ctx.fillText(
            `${t('wave')} ${gameState.currentWaveMessage.wave} ${t('waveStart')}!`,
            canvas.width / 2,
            canvas.height / 2 - 40
        );

        // 현재 레벨
        ctx.font = '18px Arial';
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillText(
            `${t('currentLevel')}: ${gameState.currentWaveMessage.wave}`,
            canvas.width / 2,
            canvas.height / 2
        );
    }

    // 보상
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`; // 골드 색상
    ctx.fillText(
        `${t('reward')}: ${gameState.currentWaveMessage.reward} ${t('gold')}`,
        canvas.width / 2,
        canvas.height / 2 + 40
    );

    ctx.restore();
}

/**
 * 설치 가능 위치 표시 함수
 * 타워를 설치할 수 있는 위치를 시각적으로 표시
 */
function showPlaceablePositions() {
    for (let i = 0; i < GRID_WIDTH; i++) {
        for (let j = 0; j < GRID_HEIGHT; j++) {
            const isOnPath = currentMap.path.some(point => point.x === i && point.y === j);
            const hasTower = towers.some(tower => tower.x === i && tower.y === j);
            
            if (!isOnPath && !hasTower) {
                ctx.fillStyle = 'rgba(76, 175, 80, 0.2)';
                ctx.strokeStyle = '#4CAF50';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                ctx.fillRect(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                ctx.setLineDash([]);
            }
        }
    }
}

/**
 * 웨이브 시작 메시지 표시 함수
 * 웨이브 시작 시 알림 메시지를 표시
 */
function showWaveStartMessage(wave) {
    // 초기 셋팅값일 때는 메시지 표시하지 않음
    if (wave <= 0) return;

    // 메시지 표시 시작 시간 저장
    gameState.waveMessageStartTime = Date.now();
    gameState.currentWaveMessage = {
        wave: wave,
        reward: calculateWaveReward(wave),
        isBoss: wave % gameState.bossWave === 0
    };
}

/**
 * 메뉴 닫기 핸들러 설정 함수
 * 메뉴 외부 클릭 시 메뉴를 닫는 기능을 설정
 */
function setupMenuCloseHandler(menu) {
    const closeMenu = (e) => {
        if (!menu.contains(e.target) && e.target !== canvas) {
            if (menu.parentNode) {
                menu.parentNode.removeChild(menu);
            }
            document.removeEventListener('click', closeMenu);
        }
    };
    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 100);
}

// 게임이 재시작될 때 버튼 제거
const origRestartGame = window.restartGame;
window.restartGame = function() {
    const btn = document.getElementById('canvasRestartBtn');
    if (btn) btn.remove();
    origRestartGame();
};

function drawDamageEffects() {
    const now = performance.now();
    for (let i = damageEffects.length - 1; i >= 0; i--) {
        const eff = damageEffects[i];
        const elapsed = now - eff.startTime;
        const duration = 1100;
        if (elapsed > duration) {
            damageEffects.splice(i, 1);
            continue;
        }
        // 애니메이션 계산
        eff.velocity += 0.2; // gravity
        eff.currentY += eff.velocity;
        const progress = elapsed / duration;
        const scale = 0.5 + Math.sin(progress * Math.PI * 2) * 1;
        const opacity = 1 - progress;
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.font = `bold ${eff.isCritical ? 28 : 20}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = eff.isCritical ? '#ff4444' : '#fff';
        ctx.strokeStyle = eff.isCritical ? '#ff0000' : '#000';
        ctx.lineWidth = eff.isCritical ? 4 : 2;
        ctx.shadowColor = eff.isCritical ? '#ff0000' : '#000';
        ctx.shadowBlur = eff.isCritical ? 12 : 6;
        ctx.save();
        ctx.translate(eff.x * TILE_SIZE + TILE_SIZE / 2 + eff.offsetX, eff.currentY);
        ctx.scale(scale, scale);
        ctx.strokeText(Math.round(eff.value), 0, 0);
        ctx.fillText(Math.round(eff.value), 0, 0);
        ctx.restore();
        ctx.restore();
    }
}

function drawSkillEffects() {
    const now = performance.now();
    for (let i = skillEffects.length - 1; i >= 0; i--) {
        const eff = skillEffects[i];
        const elapsed = now - eff.startTime;
        if (elapsed > eff.duration) {
            skillEffects.splice(i, 1);
            continue;
        }
        // 애니메이션 계산 (위로 떠오르며 사라짐)
        const progress = elapsed / eff.duration;
        const opacity = 1 - progress;
        const floatY = -40 * progress; // 위로 20px 이동
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = '#00eaff';
        ctx.shadowColor = '#00eaff';
        ctx.shadowBlur = 8;
        // 적의 중앙 위, HP바 위 등
        const drawX = eff.x * TILE_SIZE + TILE_SIZE / 2;
        const drawY = eff.y * TILE_SIZE + 6 + floatY;
        ctx.fillText(eff.name, drawX, drawY);
        ctx.restore();
    }
}

function drawSpecialEffects() {
    const now = performance.now();
    for (let i = specialEffects.length - 1; i >= 0; i--) {
        const eff = specialEffects[i];
        const elapsed = now - eff.startTime;
        if (elapsed > eff.duration) {
            specialEffects.splice(i, 1);
            continue;
        }
        // 애니메이션 계산 (확대, 투명도 변화)
        const progress = elapsed / eff.duration;
        const opacity = 0.1 - progress;
        const scale = 0.2 + 0.3 * progress; // 1 → 1.5로 커짐
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'gold';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 16;
        // 타워/적 중앙에 표시
        const drawX = eff.x * TILE_SIZE + TILE_SIZE / 2;
        const drawY = eff.y * TILE_SIZE + TILE_SIZE / 2;
        ctx.translate(drawX, drawY);
        ctx.scale(scale, scale);
        ctx.fillText(eff.name, 0, 0);
        ctx.restore();
    }
}

function showCountdown() {
    countdownActive = true;
    countdownStartTime = performance.now();
}

function drawCountdown() {
    if (!countdownActive) return;
    const now = performance.now();
    const elapsed = now - countdownStartTime;
    const totalSeconds = Math.ceil((countdownDuration - elapsed) / 1000);
    if (totalSeconds > 0) {
        ctx.save();
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFD600';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 16;
        ctx.globalAlpha = 0.9;
        ctx.fillText(totalSeconds, canvas.width / 2, canvas.height / 2);
        ctx.restore();
    } else {
        countdownActive = false;
        startWave();
    }
}

