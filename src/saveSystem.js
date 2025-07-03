/**
 * 게임 저장 시스템 파일
 * 게임의 진행 상태, 설정, 통계 등을 저장하고 불러오는 기능을 관리
 */

// 게임 저장
// 현재 게임의 상태(타워, 적, 웨이브 등)를 로컬 스토리지에 저장
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
            throw new Error(t('saveDataInvalid'));
        }

        // 저장 데이터 크기 확인 (5MB 제한)
        const saveString = JSON.stringify(saveData);
        if (saveString.length > 5 * 1024 * 1024) {
            throw new Error(t('saveDataTooLarge'));
        }

        // localStorage 저장 시도
        try {
            localStorage.setItem('towerDefenseSave', saveString);
            showSaveLoadNotification(t('gameSaved'));
        } catch (storageError) {
            // localStorage 용량 초과 시 이전 저장 데이터 삭제 후 재시도
            if (storageError.name === 'QuotaExceededError') {
                localStorage.removeItem('towerDefenseSave');
                localStorage.setItem('towerDefenseSave', saveString);
                showSaveLoadNotification(t('gameSavedWithCleanup'));
            } else {
                throw storageError;
            }
        }
    } catch (error) {
        console.error(t('saveFailedPrefix'), error);
        showSaveLoadNotification(`${t('saveFailed')}: ${error.message}`, true);
    }
}

// 게임 불러오기
// 저장된 게임 상태를 로컬 스토리지에서 불러와 게임을 복원
function loadGame() {
    try {
        const saveData = localStorage.getItem('towerDefenseSave');
        if (!saveData) {
            showSaveLoadNotification(t('noSavedGame'), true);
            return;
        }

        const data = JSON.parse(saveData);
        // 저장 데이터 버전 확인
        if (!data.version || data.version < 3) {
            showSaveLoadNotification(t('saveDataVersionIncompatible'), true);
            return;
        }
        // 저장 데이터 검증
        if (!validateSaveData(data)) {
            throw new Error(t('saveDataCorrupted'));
        }
        // 저장 시간 확인 (24시간 제한)
        const saveTime = new Date(data.timestamp);
        const currentTime = new Date();
        const hoursDiff = (currentTime - saveTime) / (1000 * 60 * 60);
        if (hoursDiff > 24) {
            showSaveLoadNotification(t('saveDataExpired'), true);
            return;
        }
        // 게임 상태 복원
        Object.assign(gameState, data.gameState);
        if (data.gameStats) Object.assign(gameStats, data.gameStats);
        
        // 맵 복원 (수정된 부분)
        gameState.currentMap = data.currentMap;
        currentMap = MAPS[data.currentMap]; // currentMap 변수 직접 업데이트
        path = [...currentMap.path]; // 경로 배열 복사
        
        // 맵 UI 갱신
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
        showSaveLoadNotification(t('gameLoaded'));
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
        console.error(t('loadFailedPrefix'), error);
        showSaveLoadNotification(`${t('loadFailed')}: ${error.message}`, true);
    }
}

// 저장/불러오기 알림
// 저장이나 불러오기 작업의 결과를 사용자에게 알림
function showSaveLoadNotification(message, isError = false) {
    const notification = document.getElementById('saveLoadNotification');
    if (!notification) {
        console.error(t('notificationElementNotFound'));
        return;
    }

    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.backgroundColor = isError ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.8)';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
}

// 전역 객체에 노출
window.saveGame = saveGame;
window.loadGame = loadGame;
window.showSaveLoadNotification = showSaveLoadNotification;
