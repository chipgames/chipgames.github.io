// 게임 캔버스 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 게임 상수
const TILE_SIZE = 40;
const CRITICAL_CHANCE = 0.2; // 20%
const CRITICAL_MULTIPLIER = 2;
const ENEMY_LEVEL_SETTINGS = {
    maxLevel: 999,
    healthMultiplier: 1.2, // 레벨당 체력 증가율
    speedMultiplier: 1.05, // 레벨당 속도 증가율
    rewardMultiplier: 1.15, // 레벨당 보상 증가율
    experienceMultiplier: 1.1, // 레벨당 경험치 증가율
    levelUpChance: 0.1, // 적이 레벨업할 확률
    maxLevelUpPerWave: 2 // 웨이브당 최대 레벨업 횟수
};

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
    waveMessageStartTime: 0   // 웨이브 메시지 시작 시간
};

// 난이도 설정
const DIFFICULTY_SETTINGS = {
    EASY: {
        gold: 200,
        lives: 25,
        enemyHealth: 0.8,
        enemySpeed: 0.8,
        goldReward: 1.2,
        maxTowers: 12,
        enemySpawnRate: 0.03,
        initialGold: 200,
        initialLives: 25
    },
    NORMAL: {
        gold: 150,
        lives: 20,
        enemyHealth: 1,
        enemySpeed: 1,
        goldReward: 1,
        maxTowers: 10,
        enemySpawnRate: 0.05,
        initialGold: 150,
        initialLives: 20
    },
    HARD: {
        gold: 100,
        lives: 15,
        enemyHealth: 1.3,
        enemySpeed: 1.2,
        goldReward: 0.8,
        maxTowers: 8,
        enemySpawnRate: 0.07,
        initialGold: 100,
        initialLives: 15
    }
};

// 타일 크기 설정
const GRID_WIDTH = canvas.width / TILE_SIZE;
const GRID_HEIGHT = canvas.height / TILE_SIZE;

// 맵 정의
const MAPS = {
    STRAIGHT: {
        name: '직선 경로',
        path: [
            {x: 0, y: 7},
            {x: 1, y: 7},
            {x: 2, y: 7},
            {x: 3, y: 7},
            {x: 4, y: 7},
            {x: 5, y: 7},
            {x: 6, y: 7},
            {x: 7, y: 7},
            {x: 8, y: 7},
            {x: 9, y: 7},
            {x: 10, y: 7},
            {x: 11, y: 7},
            {x: 12, y: 7},
            {x: 13, y: 7},
            {x: 14, y: 7},
            {x: 15, y: 7},
            {x: 16, y: 7},
            {x: 17, y: 7},
            {x: 18, y: 7},
            {x: 19, y: 7}
        ]
    },
    ZIGZAG: {
        name: '지그재그',
        path: [
            {x: 0, y: 5},
            {x: 1, y: 5},
            {x: 2, y: 5},
            {x: 3, y: 5},
            {x: 4, y: 5},
            {x: 4, y: 3},
            {x: 5, y: 3},
            {x: 6, y: 3},
            {x: 7, y: 3},
            {x: 8, y: 3},
            {x: 8, y: 7},
            {x: 9, y: 7},
            {x: 10, y: 7},
            {x: 11, y: 7},
            {x: 12, y: 7},
            {x: 12, y: 3},
            {x: 13, y: 3},
            {x: 14, y: 3},
            {x: 15, y: 3},
            {x: 16, y: 3},
            {x: 16, y: 7},
            {x: 17, y: 7},
            {x: 18, y: 7},
            {x: 19, y: 7}
        ]
    },
    SPIRAL: {
        name: '나선형',
        path: [
            {x: 0, y: 7},
            {x: 1, y: 7},
            {x: 2, y: 7},
            {x: 3, y: 7},
            {x: 4, y: 7},
            {x: 4, y: 5},
            {x: 4, y: 3},
            {x: 4, y: 1},
            {x: 6, y: 1},
            {x: 8, y: 1},
            {x: 10, y: 1},
            {x: 10, y: 3},
            {x: 10, y: 5},
            {x: 10, y: 7},
            {x: 10, y: 9},
            {x: 10, y: 11},
            {x: 12, y: 11},
            {x: 14, y: 11},
            {x: 16, y: 11},
            {x: 16, y: 9},
            {x: 16, y: 7},
            {x: 16, y: 5},
            {x: 16, y: 3},
            {x: 16, y: 1},
            {x: 18, y: 1},
            {x: 19, y: 1}
        ]
    },
    MAZE: {
        name: '미로',
        path: [
            {x: 0, y: 7},
            {x: 1, y: 7},
            {x: 2, y: 7},
            {x: 3, y: 7},
            {x: 4, y: 7},
            {x: 4, y: 5},
            {x: 4, y: 3},
            {x: 6, y: 3},
            {x: 8, y: 3},
            {x: 8, y: 5},
            {x: 8, y: 7},
            {x: 8, y: 9},
            {x: 10, y: 9},
            {x: 12, y: 9},
            {x: 12, y: 7},
            {x: 12, y: 5},
            {x: 14, y: 5},
            {x: 16, y: 5},
            {x: 16, y: 7},
            {x: 16, y: 9},
            {x: 18, y: 9},
            {x: 19, y: 9}
        ]
    },
    CROSS: {
        name: '십자형',
        path: [
            {x: 0, y: 7},
            {x: 1, y: 7},
            {x: 2, y: 7},
            {x: 3, y: 7},
            {x: 4, y: 7},
            {x: 5, y: 7},
            {x: 6, y: 7},
            {x: 7, y: 7},
            {x: 8, y: 7},
            {x: 9, y: 7},
            {x: 9, y: 5},
            {x: 9, y: 3},
            {x: 9, y: 1},
            {x: 11, y: 1},
            {x: 13, y: 1},
            {x: 15, y: 1},
            {x: 15, y: 3},
            {x: 15, y: 5},
            {x: 15, y: 7},
            {x: 15, y: 9},
            {x: 15, y: 11},
            {x: 17, y: 11},
            {x: 19, y: 11}
        ]
    },
    SNAKE: {
        name: '뱀형',
        path: [
            {x: 0, y: 3},
            {x: 2, y: 3},
            {x: 4, y: 3},
            {x: 4, y: 5},
            {x: 4, y: 7},
            {x: 6, y: 7},
            {x: 8, y: 7},
            {x: 8, y: 5},
            {x: 8, y: 3},
            {x: 10, y: 3},
            {x: 12, y: 3},
            {x: 12, y: 5},
            {x: 12, y: 7},
            {x: 14, y: 7},
            {x: 16, y: 7},
            {x: 16, y: 5},
            {x: 16, y: 3},
            {x: 18, y: 3},
            {x: 19, y: 3}
        ]
    },
    DIAMOND: {
        name: '다이아몬드',
        path: [
            {x: 0, y: 7},
            {x: 2, y: 7},
            {x: 4, y: 7},
            {x: 6, y: 7},
            {x: 8, y: 7},
            {x: 8, y: 5},
            {x: 8, y: 3},
            {x: 10, y: 3},
            {x: 12, y: 3},
            {x: 12, y: 5},
            {x: 12, y: 7},
            {x: 14, y: 7},
            {x: 16, y: 7},
            {x: 16, y: 9},
            {x: 16, y: 11},
            {x: 14, y: 11},
            {x: 12, y: 11},
            {x: 12, y: 9},
            {x: 10, y: 9},
            {x: 8, y: 9},
            {x: 6, y: 9},
            {x: 4, y: 9},
            {x: 2, y: 9},
            {x: 0, y: 9}
        ]
    },
    STAR: {
        name: '별형',
        path: [
            {x: 0, y: 7},  // 시작점
            {x: 4, y: 7},  // 오른쪽으로 이동
            {x: 6, y: 3},  // 오른쪽 상단 꼭지점
            {x: 8, y: 7},  // 중앙으로
            {x: 12, y: 3}, // 오른쪽 상단 꼭지점
            {x: 14, y: 7}, // 중앙으로
            {x: 19, y: 7}, // 오른쪽 끝
            {x: 15, y: 11}, // 오른쪽 하단 꼭지점
            {x: 14, y: 7}, // 중앙으로
            {x: 10, y: 11}, // 왼쪽 하단 꼭지점
            {x: 8, y: 7},  // 중앙으로
            {x: 4, y: 11}, // 왼쪽 하단 꼭지점
            {x: 0, y: 7}   // 시작점으로 복귀
        ]
    },
    VORTEX: {
        name: '소용돌이',
        path: [
            {x: 0, y: 7},
            {x: 1, y: 7},
            {x: 2, y: 7},
            {x: 3, y: 7},
            {x: 4, y: 7},
            {x: 4, y: 6},
            {x: 4, y: 5},
            {x: 4, y: 4},
            {x: 4, y: 3},
            {x: 5, y: 3},
            {x: 6, y: 3},
            {x: 7, y: 3},
            {x: 8, y: 3},
            {x: 8, y: 4},
            {x: 8, y: 5},
            {x: 8, y: 6},
            {x: 8, y: 7},
            {x: 8, y: 8},
            {x: 8, y: 9},
            {x: 8, y: 10},
            {x: 9, y: 10},
            {x: 10, y: 10},
            {x: 11, y: 10},
            {x: 12, y: 10},
            {x: 12, y: 9},
            {x: 12, y: 8},
            {x: 12, y: 7},
            {x: 12, y: 6},
            {x: 12, y: 5},
            {x: 12, y: 4},
            {x: 13, y: 4},
            {x: 14, y: 4},
            {x: 15, y: 4},
            {x: 16, y: 4},
            {x: 16, y: 5},
            {x: 16, y: 6},
            {x: 16, y: 7},
            {x: 16, y: 8},
            {x: 16, y: 9},
            {x: 16, y: 10},
            {x: 17, y: 10},
            {x: 18, y: 10},
            {x: 19, y: 10}
        ]
    },
    MAZE2: {
        name: '맵14',
        path: [
            {x: 0, y: 7},
            {x: 1, y: 7},
            {x: 2, y: 7},
            {x: 3, y: 7},
            {x: 4, y: 7},
            {x: 4, y: 5},
            {x: 4, y: 3},
            {x: 6, y: 3},
            {x: 8, y: 3},
            {x: 10, y: 3},
            {x: 10, y: 5},
            {x: 10, y: 7},
            {x: 10, y: 9},
            {x: 12, y: 9},
            {x: 14, y: 9},
            {x: 16, y: 9},
            {x: 16, y: 7},
            {x: 16, y: 5},
            {x: 16, y: 3},
            {x: 16, y: 1},
            {x: 18, y: 1},
            {x: 19, y: 1}
        ]
    },
    SNAKE2: {
        name: '맵15',
        path: [
            {x: 0, y: 3},
            {x: 2, y: 3},
            {x: 4, y: 3},
            {x: 4, y: 5},
            {x: 4, y: 7},
            {x: 6, y: 7},
            {x: 8, y: 7},
            {x: 8, y: 5},
            {x: 8, y: 3},
            {x: 10, y: 3},
            {x: 12, y: 3},
            {x: 12, y: 5},
            {x: 12, y: 7},
            {x: 14, y: 7},
            {x: 16, y: 7},
            {x: 16, y: 5},
            {x: 16, y: 3},
            {x: 18, y: 3},
            {x: 19, y: 3}
        ]
    },
    TRIANGLE: {
        name: '맵12',
        path: [
            {x: 0, y: 7},   // 시작점
            {x: 4, y: 7},   // 오른쪽으로
            {x: 8, y: 3},   // 상단 꼭지점
            {x: 12, y: 7},  // 오른쪽으로
            {x: 16, y: 7},  // 오른쪽으로
            {x: 19, y: 7},  // 오른쪽 끝
            {x: 16, y: 11}, // 하단 꼭지점
            {x: 12, y: 11}, // 왼쪽으로
            {x: 8, y: 11},  // 왼쪽으로
            {x: 4, y: 11},  // 왼쪽으로
            {x: 0, y: 7}    // 시작점으로 복귀
        ]
    },
    WAVE: {
        name: '파도형',
        path: [
            {x: 0, y: 5},
            {x: 1, y: 5},
            {x: 2, y: 5},
            {x: 3, y: 5},
            {x: 4, y: 5},
            {x: 4, y: 3},
            {x: 5, y: 3},
            {x: 6, y: 3},
            {x: 7, y: 3},
            {x: 8, y: 3},
            {x: 8, y: 5},
            {x: 9, y: 5},
            {x: 10, y: 5},
            {x: 11, y: 5},
            {x: 12, y: 5},
            {x: 12, y: 7},
            {x: 13, y: 7},
            {x: 14, y: 7},
            {x: 15, y: 7},
            {x: 16, y: 7},
            {x: 16, y: 9},
            {x: 17, y: 9},
            {x: 18, y: 9},
            {x: 19, y: 9}
        ]
    },
    STAIRS: {
        name: '계단형',
        path: [
            {x: 0, y: 1},
            {x: 2, y: 1},
            {x: 2, y: 3},
            {x: 4, y: 3},
            {x: 4, y: 5},
            {x: 6, y: 5},
            {x: 6, y: 7},
            {x: 8, y: 7},
            {x: 8, y: 9},
            {x: 10, y: 9},
            {x: 10, y: 11},
            {x: 12, y: 11},
            {x: 12, y: 9},
            {x: 14, y: 9},
            {x: 14, y: 7},
            {x: 16, y: 7},
            {x: 16, y: 5},
            {x: 18, y: 5},
            {x: 18, y: 3},
            {x: 19, y: 3}
        ]
    },
    CROSSROADS: {
        name: '교차로',
        path: [
            {x: 0, y: 7},
            {x: 2, y: 7},
            {x: 4, y: 7},
            {x: 6, y: 7},
            {x: 8, y: 7},
            {x: 8, y: 5},
            {x: 8, y: 3},
            {x: 8, y: 1},
            {x: 10, y: 1},
            {x: 12, y: 1},
            {x: 14, y: 1},
            {x: 16, y: 1},
            {x: 16, y: 3},
            {x: 16, y: 5},
            {x: 16, y: 7},
            {x: 16, y: 9},
            {x: 16, y: 11},
            {x: 14, y: 11},
            {x: 12, y: 11},
            {x: 10, y: 11},
            {x: 8, y: 11},
            {x: 8, y: 9},
            {x: 8, y: 7},
            {x: 10, y: 7},
            {x: 12, y: 7},
            {x: 14, y: 7},
            {x: 16, y: 7},
            {x: 18, y: 7},
            {x: 19, y: 7}
        ]
    },
    INFINITY: {
        name: '무한형',
        path: [
            {x: 0, y: 7},
            {x: 2, y: 7},
            {x: 4, y: 7},
            {x: 6, y: 7},
            {x: 8, y: 7},
            {x: 8, y: 5},
            {x: 8, y: 3},
            {x: 10, y: 3},
            {x: 12, y: 3},
            {x: 12, y: 5},
            {x: 12, y: 7},
            {x: 12, y: 9},
            {x: 12, y: 11},
            {x: 10, y: 11},
            {x: 8, y: 11},
            {x: 8, y: 9},
            {x: 8, y: 7},
            {x: 6, y: 7},
            {x: 4, y: 7},
            {x: 2, y: 7},
            {x: 0, y: 7},
            {x: 0, y: 5},
            {x: 0, y: 3},
            {x: 2, y: 3},
            {x: 4, y: 3},
            {x: 6, y: 3},
            {x: 8, y: 3},
            {x: 10, y: 3},
            {x: 12, y: 3},
            {x: 14, y: 3},
            {x: 16, y: 3},
            {x: 18, y: 3},
            {x: 19, y: 3}
        ]
    },
    BUTTERFLY: {
        name: '나비형',
        path: [
            {x: 0, y: 7},
            {x: 2, y: 7},
            {x: 4, y: 7},
            {x: 6, y: 7},
            {x: 8, y: 7},
            {x: 8, y: 5},
            {x: 8, y: 3},
            {x: 10, y: 3},
            {x: 12, y: 3},
            {x: 12, y: 5},
            {x: 12, y: 7},
            {x: 12, y: 9},
            {x: 12, y: 11},
            {x: 10, y: 11},
            {x: 8, y: 11},
            {x: 8, y: 9},
            {x: 8, y: 7},
            {x: 6, y: 7},
            {x: 4, y: 7},
            {x: 2, y: 7},
            {x: 0, y: 7},
            {x: 0, y: 5},
            {x: 0, y: 3},
            {x: 2, y: 3},
            {x: 4, y: 3},
            {x: 6, y: 3},
            {x: 8, y: 3},
            {x: 10, y: 3},
            {x: 12, y: 3},
            {x: 14, y: 3},
            {x: 16, y: 3},
            {x: 18, y: 3},
            {x: 19, y: 3}
        ]
    },
    HOURGLASS: {
        name: '모래시계',
        path: [
            {x: 0, y: 3},
            {x: 2, y: 3},
            {x: 4, y: 3},
            {x: 6, y: 3},
            {x: 8, y: 3},
            {x: 10, y: 3},
            {x: 10, y: 5},
            {x: 10, y: 7},
            {x: 8, y: 7},
            {x: 6, y: 7},
            {x: 4, y: 7},
            {x: 2, y: 7},
            {x: 0, y: 7},
            {x: 0, y: 9},
            {x: 0, y: 11},
            {x: 2, y: 11},
            {x: 4, y: 11},
            {x: 6, y: 11},
            {x: 8, y: 11},
            {x: 10, y: 11},
            {x: 12, y: 11},
            {x: 14, y: 11},
            {x: 16, y: 11},
            {x: 18, y: 11},
            {x: 19, y: 11}
        ]
    },
    TRIANGLE: {
        name: '삼각형',
        path: [
            {x: 0, y: 7},   // 시작점
            {x: 4, y: 7},   // 오른쪽으로
            {x: 8, y: 3},   // 상단 꼭지점
            {x: 12, y: 7},  // 오른쪽으로
            {x: 16, y: 7},  // 오른쪽으로
            {x: 19, y: 7},  // 오른쪽 끝
            {x: 16, y: 11}, // 하단 꼭지점
            {x: 12, y: 11}, // 왼쪽으로
            {x: 8, y: 11},  // 왼쪽으로
            {x: 4, y: 11},  // 왼쪽으로
            {x: 0, y: 7}    // 시작점으로 복귀
        ]
    }
};

// 현재 선택된 맵
let currentMap = MAPS[gameState.currentMap];

// 타워 배열
let towers = [];

// 적 배열
let enemies = [];

// 타워 아이콘 정의
const TOWER_ICONS = {
    BASIC: '⚔️',
    ICE: '❄️',
    POISON: '☠️',
    LASER: '🔴',
    SPLASH: '💥',
    SUPPORT: '💫'
};

// 타워 타입 정의
const TOWER_TYPES = {
    BASIC: {
        name: '기본 타워',
        cost: 100,
        damage: 10,
        range: 3,
        cooldown: 30,
        color: 'blue',
        special: {
            name: '강화 사격',
            description: '10초 동안 공격력이 50% 증가합니다.',
            cooldown: 30,
            duration: 10,
            effect: (tower) => {
                tower.damage *= 1.5;
                setTimeout(() => {
                    tower.damage /= 1.5;
                }, 10000);
            }
        }
    },
    ICE: {
        name: '얼음 타워',
        cost: 150,
        damage: 5,
        range: 3,
        cooldown: 40,
        color: 'lightblue',
        freezeDuration: 2,
        special: {
            name: '빙결 폭발',
            description: '범위 내 모든 적을 5초 동안 얼립니다.',
            cooldown: 45,
            effect: (tower) => {
                enemies.forEach(enemy => {
                    const dx = (enemy.x - tower.x) * TILE_SIZE;
                    const dy = (enemy.y - tower.y) * TILE_SIZE;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance <= tower.range * TILE_SIZE) {
                        enemy.applyStatusEffect('FROZEN', 5);
                        showSkillEffect(enemy.x, enemy.y, '❄️');
                    }
                });
                playSound('ice_special');
            }
        }
    },
    POISON: {
        name: '독 타워',
        cost: 200,
        damage: 3,
        range: 2,
        cooldown: 20,
        color: 'green',
        poisonDamage: 2,
        poisonDuration: 5,
        special: {
            name: '독 구름',
            description: '범위 내 적들에게 강력한 독 데미지를 줍니다.',
            cooldown: 40,
            effect: (tower) => {
                enemies.forEach(enemy => {
                    const dx = (enemy.x - tower.x) * TILE_SIZE;
                    const dy = (enemy.y - tower.y) * TILE_SIZE;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance <= tower.range * TILE_SIZE) {
                        enemy.poisonDamage = tower.poisonDamage * 3;
                        enemy.poisonDuration = tower.poisonDuration * 2;
                    }
                });
            }
        }
    },
    LASER: {
        name: '레이저 타워',
        cost: 250,
        damage: 15,
        range: 4,
        cooldown: 50,
        color: 'red',
        continuousDamage: 5,
        special: {
            name: '과열 레이저',
            description: '10초 동안 연속 데미지가 3배로 증가합니다.',
        cooldown: 60,
            duration: 10,
            effect: (tower) => {
                tower.continuousDamage *= 3;
                setTimeout(() => {
                    tower.continuousDamage /= 3;
                }, 10000);
            }
        }
    },
    SPLASH: {
        name: '스플래시 타워',
        cost: 300,
        damage: 8,
        range: 2,
        cooldown: 45,
        color: 'purple',
        splashRadius: 1.5,
        slowEffect: 0.3,
        special: {
            name: '대규모 폭발',
            description: '범위가 2배로 증가하고 데미지가 50% 증가합니다.',
            cooldown: 50,
            duration: 8,
            effect: (tower) => {
                tower.splashRadius *= 2;
                tower.damage *= 1.5;
                setTimeout(() => {
                    tower.splashRadius /= 2;
                    tower.damage /= 1.5;
                }, 8000);
            }
        }
    },
    SUPPORT: {
        name: '지원 타워',
        cost: 200,
        damage: 0,
        range: 4,
        cooldown: 0,
        color: 'yellow',
        buffRange: 3,
        buffMultiplier: 1.2,
        special: {
            name: '전체 강화',
            description: '모든 타워의 공격력이 30% 증가합니다.',
            cooldown: 60,
            duration: 15,
            effect: (tower) => {
                towers.forEach(t => {
                    if (t !== tower) {
                        t.damage *= 1.3;
                    }
                });
                setTimeout(() => {
                    towers.forEach(t => {
                        if (t !== tower) {
                            t.damage /= 1.3;
                        }
                    });
                }, 15000);
            }
        }
    }
};

// 파워업 정의
const POWERUPS = {
    GOLD: {
        name: '골드 부스트',
        cost: 100,
        duration: 30000,
        effect: () => {
            gameState.goldMultiplier = 2;
            setTimeout(() => {
                gameState.goldMultiplier = 1;
            }, 30000);
        }
    },
    DAMAGE: {
        name: '데미지 부스트',
        cost: 150,
        duration: 30000,
        effect: () => {
            towers.forEach(tower => {
                tower.damage *= 2;
            });
            setTimeout(() => {
                towers.forEach(tower => {
                    tower.damage /= 2;
                });
            }, 30000);
        }
    },
    FREEZE: {
        name: '시간 정지',
        cost: 200,
        duration: 10000,
        effect: () => {
            enemies.forEach(enemy => {
                enemy.speed = 0;
            });
            setTimeout(() => {
                enemies.forEach(enemy => {
                    enemy.speed = enemy.baseSpeed;
                });
            }, 10000);
        }
    }
};

// 특수 이벤트 정의
const SPECIAL_EVENTS = {
    GOLD_RUSH: {
        name: '골드 러시',
        description: '모든 적 처치 시 골드 2배!',
        duration: 30000,
        effect: () => {
            gameState.goldMultiplier = 2;
            showEventNotification('골드 러시 시작!');
            setTimeout(() => {
                gameState.goldMultiplier = 1;
                showEventNotification('골드 러시 종료');
            }, 30000);
        }
    },
    TOWER_POWER: {
        name: '타워 강화',
        description: '모든 타워의 공격력 50% 증가!',
        duration: 20000,
        effect: () => {
            towers.forEach(tower => {
                tower.damage *= 1.5;
            });
            showEventNotification('타워 강화 시작!');
            setTimeout(() => {
                towers.forEach(tower => {
                    tower.damage /= 1.5;
                });
                showEventNotification('타워 강화 종료');
            }, 20000);
        }
    },
    ENEMY_WEAKNESS: {
        name: '적 약화',
        description: '모든 적의 체력 30% 감소!',
        duration: 25000,
        effect: () => {
            enemies.forEach(enemy => {
                enemy.health *= 0.7;
                enemy.maxHealth *= 0.7;
            });
            showEventNotification('적 약화 시작!');
            setTimeout(() => {
                showEventNotification('적 약화 종료');
            }, 25000);
        }
    }
};

// 업적 정의
const ACHIEVEMENTS = {
    FIRST_TOWER: {
        name: '첫 타워',
        description: '첫 타워를 설치했습니다.',
        condition: () => towers.length === 1,
        unlocked: false
    },
    BOSS_KILLER: {
        name: '보스 킬러',
        description: '첫 보스를 처치했습니다.',
        condition: () => gameState.bossKilled,
        unlocked: false
    },
    TOWER_MASTER: {
        name: '타워 마스터',
        description: '모든 타워 종류를 설치했습니다.',
        condition: () => {
            const towerTypes = new Set(towers.map(t => t.type));
            return towerTypes.size === Object.keys(TOWER_TYPES).length;
        },
        unlocked: false
    },
    WAVE_MASTER: {
        name: '웨이브 마스터',
        description: '10웨이브를 클리어했습니다.',
        condition: () => gameState.wave >= 10,
        unlocked: false
    },
    TOWER_EXPERT: {
        name: '타워 전문가',
        description: '타워를 10레벨까지 업그레이드했습니다.',
        condition: () => towers.some(tower => tower.level >= 10),
        unlocked: false
    },
    GOLD_COLLECTOR: {
        name: '골드 수집가',
        description: '총 10000 골드를 획득했습니다.',
        condition: () => gameStats.totalGold >= 10000,
        unlocked: false
    },
    EVENT_MASTER: {
        name: '이벤트 마스터',
        description: '모든 특수 이벤트를 경험했습니다.',
        condition: () => Object.keys(SPECIAL_EVENTS).every(event => gameStats.eventsTriggered?.includes(event)),
        unlocked: false
    }
};

// 사운드 관리
const sounds = {
    bgm: new Audio('sounds/bgm.mp3'),
    tower_place: new Audio('sounds/tower_place.mp3'),
    tower_attack: new Audio('sounds/tower_attack.mp3'),
    enemy_death: new Audio('sounds/enemy_death.mp3'),
    game_start: new Audio('sounds/game_start.mp3'),
    game_over: new Audio('sounds/game_over.mp3'),
    ui_click: new Audio('sounds/ui_click.mp3')
};

// 사운드 설정
let soundEnabled = true;
let musicEnabled = true;

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

// 게임 통계
const gameStats = {
    enemiesKilled: 0,
    bossesKilled: 0,
    totalGold: 0,
    highestWave: 0,
    eventsTriggered: []
};

// 타워 조합 정의 개선
const TOWER_COMBOS = {
    ICE_POISON: {
        name: '독성 얼음',
        description: '얼음 타워와 독 타워가 함께 있을 때, 얼음 효과가 독 데미지를 증가시킵니다.',
        condition: (towers) => {
            return towers.some(t => t.type === 'ICE') && 
                   towers.some(t => t.type === 'POISON');
        },
        effect: (towers) => {
            const iceTower = towers.find(t => t.type === 'ICE');
            const poisonTower = towers.find(t => t.type === 'POISON');
            if (iceTower && poisonTower) {
                // 이전 효과 제거
                if (iceTower.activeCombos.has('ICE_POISON')) {
                    poisonTower.poisonDamage /= 1.5;
                    iceTower.freezeDuration -= 2;
                }
                // 새 효과 적용
                poisonTower.poisonDamage *= 1.5;
                iceTower.freezeDuration += 2;
            }
        }
    },
    SUPPORT_NETWORK: {
        name: '지원 네트워크',
        description: '지원 타워가 다른 타워들을 강화합니다.',
        condition: (towers) => {
            return towers.some(t => t.type === 'SUPPORT');
        },
        effect: (towers) => {
            const supportTowers = towers.filter(t => t.type === 'SUPPORT');
            supportTowers.forEach(support => {
                // 이전 버프 제거
                support.removeBuffs();
                // 새 버프 적용
                towers.forEach(tower => {
                    if (tower !== support) {
                        const dx = tower.x - support.x;
                        const dy = tower.y - support.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance <= support.buffRange) {
                            tower.damage *= support.buffMultiplier;
                            support.buffedTowers.add(tower);
                        }
                    }
                });
            });
        }
    },
    ELEMENTAL_MASTERY: {
        name: '원소 지배',
        description: '모든 타워 종류가 설치되어 있을 때, 특수 효과가 100% 강화됩니다.',
        condition: (towers) => {
            const requiredTypes = ['BASIC', 'ICE', 'POISON', 'LASER', 'SPLASH', 'SUPPORT'];
            return requiredTypes.every(type => towers.some(t => t.type === type));
        },
        effect: (towers) => {
            towers.forEach(tower => {
                // 이전 효과 제거
                if (tower.activeCombos.has('ELEMENTAL_MASTERY')) {
                    switch(tower.type) {
                        case 'ICE':
                            tower.freezeDuration /= 2;
                            break;
                        case 'POISON':
                            tower.poisonDamage /= 2;
                            tower.poisonDuration /= 2;
                            break;
                        case 'LASER':
                            tower.continuousDamage /= 2;
                            break;
                        case 'SPLASH':
                            tower.splashRadius /= 1.5;
                            tower.slowEffect /= 1.5;
                            break;
                    }
                }
                // 새 효과 적용
                switch(tower.type) {
                    case 'ICE':
                        tower.freezeDuration *= 2;
                        break;
                    case 'POISON':
                        tower.poisonDamage *= 2;
                        tower.poisonDuration *= 2;
                        break;
                    case 'LASER':
                        tower.continuousDamage *= 2;
                        break;
                    case 'SPLASH':
                        tower.splashRadius *= 1.5;
                        tower.slowEffect *= 1.5;
                        break;
                }
            });
        }
    }
};

// 특수 능력 정의
const ABILITIES = {
    TOWER_BOOST: {
        name: '전체 타워 강화',
        cost: 300
    }
};

// ... existing code ...

class Tower {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = 100;
        
        // 특수 능력 관련 속성 개선
        this.specialCooldown = 0;
        this.specialActive = false;
        this.specialDuration = 0;
        this.special = TOWER_TYPES[type].special;
        
        // 업그레이드 레벨 초기화 (최대 레벨 제한 추가)
        this.rangeLevel = 0;
        this.damageLevel = 0;
        this.speedLevel = 0;
        this.bulletLevel = 0;
        this.maxUpgradeLevel = 5; // 최대 업그레이드 레벨 제한
        
        const towerType = TOWER_TYPES[type];
        this.baseDamage = towerType.damage;
        this.baseRange = towerType.range;
        this.baseCooldown = towerType.cooldown;
        this.damage = this.baseDamage;
        this.range = this.baseRange;
        this.maxCooldown = this.baseCooldown;
        this.cooldown = 0;
        this.color = towerType.color;
        this.bulletCount = 1;
        
        // 특수 능력 초기화 개선
        this.initializeSpecialEffects(type, towerType);
        
        // 버프 효과 추적을 위한 Set
        this.activeBuffs = new Set();
        this.activeCombos = new Set();
        this.shieldEffectTime = 0;
    }

    // 특수 효과 초기화 함수 추가
    initializeSpecialEffects(type, towerType) {
        switch(type) {
            case 'SPLASH':
                this.splashRadius = towerType.splashRadius;
                this.slowEffect = towerType.slowEffect;
                break;
            case 'POISON':
                this.poisonDamage = towerType.poisonDamage;
                this.poisonDuration = towerType.poisonDuration;
                break;
            case 'ICE':
                this.freezeDuration = towerType.freezeDuration;
                break;
            case 'LASER':
                this.continuousDamage = towerType.continuousDamage;
                break;
            case 'SUPPORT':
                this.buffRange = towerType.buffRange;
                this.buffMultiplier = towerType.buffMultiplier;
                this.buffedTowers = new Set();
                break;
        }
    }

    // 특수 능력 사용 함수 개선
    useSpecial() {
        if (this.specialCooldown > 0 || this.specialActive) return false;
        
        if (this.special && this.special.effect) {
            this.special.effect(this);
            this.specialCooldown = this.special.cooldown;
            this.specialActive = true;
            this.specialDuration = this.special.duration || 0;
            
            // 특수 능력 사용 이펙트
            showSkillEffect(this.x, this.y, this.getSpecialIcon());
            playSound(`${this.type.toLowerCase()}_special`);
            return true;
        }
        return false;
    }

    // 특수 능력 아이콘 반환 함수
    getSpecialIcon() {
        switch(this.type) {
            case 'ICE': return '❄️';
            case 'POISON': return '☠️';
            case 'LASER': return '⚡';
            case 'SPLASH': return '💥';
            case 'SUPPORT': return '✨';
            default: return '⭐';
        }
    }

    // 업그레이드 함수 개선
    upgrade(upgradeType) {
        if (this[`${upgradeType}Level`] >= this.maxUpgradeLevel) {
            return false;
        }

        const upgradeCost = this.getUpgradeCost(upgradeType);
        if (gameState.gold < upgradeCost) {
            return false;
        }

        gameState.gold -= upgradeCost;
        this[`${upgradeType}Level`]++;

        switch(upgradeType) {
            case 'damage':
                this.damage = Math.floor(this.baseDamage * (1 + this.damageLevel * 0.2));
                break;
            case 'range':
                this.range = this.baseRange + (this.rangeLevel * 0.5);
                break;
            case 'speed':
                this.maxCooldown = Math.max(10, this.baseCooldown * Math.pow(0.9, this.speedLevel));
                break;
            case 'bullet':
                this.bulletCount = 1 + this.bulletLevel;
                break;
        }

        // 업그레이드 이펙트
        showUpgradeEffect(this.x, this.y);
        playSound('upgrade');
        return true;
    }

    // 업그레이드 비용 계산 함수
    getUpgradeCost(upgradeType) {
        const baseCost = 100;
        let level = this[`${upgradeType}Level`];
        if (typeof level !== 'number' || isNaN(level)) level = 1;
        return Math.floor(baseCost * Math.pow(1.5, level));
    }

    // 공격 함수 개선
    attack(enemies) {
        if (this.cooldown > 0) {
            this.cooldown--;
            return;
        }

        // 범위 내 적 찾기 (가장 가까운 적 우선)
        const target = this.findTarget(enemies);
        if (!target) return;

        // 공격 실행
        this.executeAttack(target);
        this.cooldown = this.maxCooldown;
    }

    // 타겟 찾기 함수
    findTarget(enemies) {
        if (!enemies || !Array.isArray(enemies)) return null;
        return enemies.filter(enemy => enemy && enemy.x !== undefined && enemy.y !== undefined)  // enemy가 유효한지 확인
            .filter(enemy => {
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                return Math.sqrt(dx * dx + dy * dy) <= this.range;
            })[0];
    }

    // 공격 실행 함수
    executeAttack(target) {
        const isCritical = Math.random() < CRITICAL_CHANCE;
        const damage = isCritical ? this.damage * CRITICAL_MULTIPLIER : this.damage;

        switch(this.type) {
            case 'BASIC': {
                const actualDamage = target.takeDamage(damage, isCritical, this);
                if (actualDamage > 0) showDamageNumber(target.x, target.y, actualDamage, isCritical);
                break;
            }
            case 'ICE': {
                const actualDamage = target.takeDamage(damage, isCritical, this);
                if (actualDamage > 0) showDamageNumber(target.x, target.y, actualDamage, isCritical);
                target.applyStatusEffect('FROZEN', this.freezeDuration);
                break;
            }
            case 'POISON': {
                const actualDamage = target.takeDamage(damage, isCritical, this);
                if (actualDamage > 0) showDamageNumber(target.x, target.y, actualDamage, isCritical);
                target.poisonDamage = this.poisonDamage;
                target.poisonDuration = this.poisonDuration;
                break;
            }
            case 'LASER': {
                const actualDamage = target.takeDamage(damage, isCritical, this);
                if (actualDamage > 0) showDamageNumber(target.x, target.y, actualDamage, isCritical);
                target.continuousDamage = this.continuousDamage;
                break;
            }
            case 'SPLASH': {
                const actualDamage = this.executeSplashAttack(target, damage);
                if (actualDamage > 0) showDamageNumber(target.x, target.y, actualDamage, isCritical);
                break;
            }
            case 'SUPPORT':
                this.executeSupportBuff();
                // showDamageNumber 호출하지 않음
                break;
        }
    }

    // 스플래시 공격 실행 함수
    executeSplashAttack(mainTarget, damage) {
        const actualDamage = mainTarget.takeDamage(damage, false, this);
        mainTarget.applyStatusEffect('SLOWED', this.slowEffect);

        // 범위 내 다른 적들도 데미지
        enemies.forEach(enemy => {
            if (enemy === mainTarget) return;
            const dx = (enemy.x - mainTarget.x) * TILE_SIZE;
            const dy = (enemy.y - mainTarget.y) * TILE_SIZE;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= this.splashRadius * TILE_SIZE) {
                enemy.takeDamage(damage * 0.5, false, this);
                enemy.applyStatusEffect('SLOWED', this.slowEffect);
            }
        });
        return actualDamage;
    }

    // 지원 버프 실행 함수
    executeSupportBuff() {
        towers.forEach(tower => {
            if (tower === this) return;
            const dx = tower.x - this.x;
            const dy = tower.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            // 지원 범위 내에 있으면 버프 적용
            if (distance <= this.buffRange) {
                if (!this.buffedTowers.has(tower)) {
                    // 항상 baseDamage 기준으로만 버프 적용
                    tower.damage = tower.baseDamage * this.buffMultiplier;
                    this.buffedTowers.add(tower);
                }
            } else if (this.buffedTowers.has(tower)) {
                // 지원 범위에서 벗어나면 baseDamage로 복구
                tower.damage = tower.baseDamage;
                this.buffedTowers.delete(tower);
            }
        });
    }

    // 버프 효과 제거 함수
    removeBuffs() {
        this.buffedTowers.forEach(tower => {
            tower.damage /= this.buffMultiplier;
        });
        this.buffedTowers.clear();
    }

    gainExperience(amount) {
        this.experience += amount;
        
        // 타워 레벨업 체크
        while (this.experience >= this.experienceToNextLevel) {
            this.experience -= this.experienceToNextLevel;
            this.level++;
            this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
            
            // 레벨업 시 능력치 상승
            this.damage = Math.floor(this.damage * 1.5);
            this.baseDamage = Math.floor(this.baseDamage * 1.5); // baseDamage도 함께 증가
            this.range += 0.5;
            this.baseRange += 0.5; // baseRange도 함께 증가
            if (this.splashRadius) this.splashRadius += 0.5;
            this.maxCooldown = Math.max(10, this.maxCooldown * 0.8);
            this.baseCooldown = Math.max(10, this.baseCooldown * 0.8); // baseCooldown도 함께 감소
            
            // 특수 능력 강화
            if (this.type === 'LASER') {
                this.continuousDamage = Math.floor(this.damage * 0.2);
            }
            
            // 레벨업 이펙트
            showLevelUpEffect(this);
            playSound('powerup');
        }
    }

    update() {
        if (this.specialCooldown > 0) {
            this.specialCooldown--;
        }
    }

    draw() {
        const centerX = this.x * TILE_SIZE + TILE_SIZE/2;
        const centerY = this.y * TILE_SIZE + TILE_SIZE/2;
        const radius = TILE_SIZE/2 - 4;

        // 사거리 원 내부 채우기 (더 진하게)
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.beginPath();
        ctx.arc(
            this.x * TILE_SIZE + TILE_SIZE/2,
            this.y * TILE_SIZE + TILE_SIZE/2,
            this.range * TILE_SIZE,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = this.color === 'blue' ? 'rgba(0, 0, 255, 0.18)' :
                        this.color === 'red' ? 'rgba(255, 0, 0, 0.18)' :
                        this.color === 'green' ? 'rgba(0, 255, 0, 0.18)' :
                        this.color === 'yellow' ? 'rgba(255, 255, 0, 0.18)' :
                        this.color === 'purple' ? 'rgba(128, 0, 128, 0.18)' :
                        'rgba(255, 255, 255, 0.18)';
        ctx.fill();
        ctx.restore();

        // 사거리 원 테두리 강조
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(
            this.x * TILE_SIZE + TILE_SIZE/2,
            this.y * TILE_SIZE + TILE_SIZE/2,
            this.range * TILE_SIZE,
            0,
            Math.PI * 2
        );
        ctx.stroke();
        ctx.restore();
        
        // 타워 범위 표시 (항상 표시)
        const gradient = ctx.createRadialGradient(
            this.x * TILE_SIZE + TILE_SIZE/2,
            this.y * TILE_SIZE + TILE_SIZE/2,
            0,
            this.x * TILE_SIZE + TILE_SIZE/2,
            this.y * TILE_SIZE + TILE_SIZE/2,
            this.range * TILE_SIZE
        );
        
        // 색상 값을 rgba 형식으로 변환
        const color = this.color;
        const rgbaColor = color === 'blue' ? 'rgba(0, 0, 255, 0.25)' :
                         color === 'red' ? 'rgba(255, 0, 0, 0.25)' :
                         color === 'green' ? 'rgba(0, 255, 0, 0.25)' :
                         color === 'yellow' ? 'rgba(255, 255, 0, 0.25)' :
                         color === 'purple' ? 'rgba(128, 0, 128, 0.25)' :
                         'rgba(255, 255, 255, 0.25)';

        // 타워 본체 그리기
        ctx.save();
        
        // 타워 타입별 모양 차별화
        switch(this.type) {
            case 'BASIC':
                // 기본 타워: 원형
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'ICE':
                // 얼음 타워: 육각형
                ctx.beginPath();
                for(let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI * 2) / 6;
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);
                    if(i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'POISON':
                // 독 타워: 별 모양
                ctx.beginPath();
                for(let i = 0; i < 5; i++) {
                    const angle = (i * Math.PI * 2) / 5 - Math.PI/2;
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);
                    if(i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'LASER':
                // 레이저 타워: 삼각형
                ctx.beginPath();
                for(let i = 0; i < 3; i++) {
                    const angle = (i * Math.PI * 2) / 3;
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);
                    if(i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'SPLASH':
                // 스플래시 타워: 사각형
                ctx.beginPath();
                ctx.rect(centerX - radius, centerY - radius, radius * 2, radius * 2);
                ctx.fill();
                break;
                
            case 'SUPPORT':
                // 지원 타워: 십자가
                ctx.beginPath();
                ctx.rect(centerX - radius/2, centerY - radius, radius, radius * 2);
                ctx.rect(centerX - radius, centerY - radius/2, radius * 2, radius);
                ctx.fill();
                break;
        }

        // 타워 테두리
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 타워 아이콘
        ctx.font = '16px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            TOWER_ICONS[this.type],
            centerX,
            centerY - 5
        );

        // 타워 이름 표시
        const towerName = TOWER_TYPES[this.type].name;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 타워 이름 크기 측정
        const nameWidth = ctx.measureText(towerName).width;
        const nameHeight = 16;
        const nameX = centerX;
        const nameY = centerY - 20;
        
        // 타워 이름 배경
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(
            nameX - nameWidth/2 - 4,
            nameY - nameHeight/2 - 2,
            nameWidth + 8,
            nameHeight + 4
        );
        
        // 타워 이름 테두리
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            nameX - nameWidth/2 - 4,
            nameY - nameHeight/2 - 2,
            nameWidth + 8,
            nameHeight + 4
        );
        
        // 타워 이름 텍스트
        ctx.fillStyle = '#ffd700'; // 골드 색상
        ctx.fillText(towerName, nameX, nameY);

        // 레벨 표시 (배경과 테두리 추가)
        const levelText = `Lv.${this.level}`;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 레벨 텍스트 크기 측정
        const levelWidth = ctx.measureText(levelText).width;
        const levelHeight = 16;
        const levelX = centerX;
        const levelY = centerY + 10;
        
        // 레벨 배경
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(
            levelX - levelWidth/2 - 4,
            levelY - levelHeight/2 - 2,
            levelWidth + 8,
            levelHeight + 4
        );
        
        // 레벨 테두리
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            levelX - levelWidth/2 - 4,
            levelY - levelHeight/2 - 2,
            levelWidth + 8,
            levelHeight + 4
        );
        
        // 레벨 텍스트
        ctx.fillStyle = '#fff';
        ctx.fillText(levelText, levelX, levelY);

        // 공격 쿨다운 표시
        if (this.cooldown > 0) {
            const cooldownProgress = 1 - (this.cooldown / this.maxCooldown);
            const cooldownRadius = radius * 0.8;
            
            // 쿨다운 배경 원
            ctx.beginPath();
            ctx.arc(centerX, centerY, cooldownRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 쿨다운 진행 표시
            ctx.beginPath();
            ctx.arc(centerX, centerY, cooldownRadius, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * cooldownProgress));
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // 특수 능력 쿨다운 표시
        if (this.specialCooldown > 0) {
            const specialCooldownProgress = 1 - (this.specialCooldown / this.specialMaxCooldown);
            const specialRadius = radius * 0.6;
            
            // 특수 능력 쿨다운 배경 원
            ctx.beginPath();
            ctx.arc(centerX, centerY, specialRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)'; // 골드 색상
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 특수 능력 쿨다운 진행 표시
            ctx.beginPath();
            ctx.arc(centerX, centerY, specialRadius, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * specialCooldownProgress));
            ctx.strokeStyle = '#ffd700'; // 골드 색상
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.restore();
    }

    // 판매 가격 계산
    getSellValue() {
        const baseValue = TOWER_TYPES[this.type].cost || 100;
        // 실제 투자한 업그레이드 비용 누적
        let upgradeCost = 0;
        const baseUpgradeCost = 100;
        for (let i = 0; i < this.rangeLevel; i++) {
            upgradeCost += Math.floor(baseUpgradeCost * Math.pow(1.5, i));
        }
        for (let i = 0; i < this.damageLevel; i++) {
            upgradeCost += Math.floor(baseUpgradeCost * Math.pow(1.5, i));
        }
        for (let i = 0; i < this.speedLevel; i++) {
            upgradeCost += Math.floor(baseUpgradeCost * Math.pow(1.5, i));
        }
        for (let i = 0; i < this.bulletLevel; i++) {
            upgradeCost += Math.floor(baseUpgradeCost * Math.pow(1.5, i));
        }
        // 특수 업그레이드(레벨 3 이상)
        if (this.specialLevel) {
            for (let i = 0; i < this.specialLevel; i++) {
                upgradeCost += Math.floor(baseUpgradeCost * Math.pow(1.5, i));
            }
        }
        return Math.floor((baseValue + upgradeCost) * 0.7);
    }

    // 타워 범위 미리보기
    showTowerRangePreview(x, y, range, type) {
        if (rangePreview) {
            rangePreview.remove();
        }
        
        rangePreview = document.createElement('div');
        rangePreview.className = 'tower-range-preview';
        
        // 타워 중심을 기준으로 계산
        const centerX = x * TILE_SIZE + TILE_SIZE/2;
        const centerY = y * TILE_SIZE + TILE_SIZE/2;
        const diameter = range * TILE_SIZE * 2;
        
        rangePreview.style.left = `${centerX - diameter/2}px`;
        rangePreview.style.top = `${centerY - diameter/2}px`;
        rangePreview.style.width = `${diameter}px`;
        rangePreview.style.height = `${diameter}px`;
        
        // 타워 종류에 따른 색상 설정
        const tower = TOWER_TYPES[type];
        rangePreview.style.backgroundColor = `${tower.color}20`;
        rangePreview.style.borderColor = tower.color;
        
        document.querySelector('.game-area').appendChild(rangePreview);
    }

    hideTowerRangePreview() {
        if (rangePreview) {
            rangePreview.remove();
            rangePreview = null;
        }
    }

    canUpgrade(upgradeType) {
        if (upgradeType === 'special') {
            // 특수 업그레이드는 레벨 3 이상, 골드 충분해야 가능
            if (this.level < 3) return false;
            const upgradeCost = this.getUpgradeCost('special');
            if (gameState.gold < upgradeCost) return false;
            return true;
        }
        // 일반 업그레이드
        if (this[`${upgradeType}Level`] >= this.maxUpgradeLevel) return false;
        const upgradeCost = this.getUpgradeCost(upgradeType);
        if (gameState.gold < upgradeCost) return false;
        return true;
    }
} // ← class Tower 끝에 중괄호 추가

// 적 유형 정의
const ENEMY_TYPES = {
    NORMAL: {
        name: '일반 적',
        health: 100,
        speed: 0.013,  // 0.02 -> 0.015로 감소
        reward: 10,
        color: 'red',
        experienceValue: 10
    },
    FAST: {
        name: '빠른 적',
        health: 50,
        speed: 0.023,  // 0.04 -> 0.025로 감소
        reward: 15,
        color: 'yellow',
        experienceValue: 15
    },
    TANK: {
        name: '탱커',
        health: 300,
        speed: 0.007,  // 유지
        reward: 20,
        color: 'purple',
        experienceValue: 20
    },
    HEALER: {
        name: '치유사',
        health: 80,
        speed: 0.01,  // 0.015 -> 0.012로 감소
        reward: 25,
        color: 'green',
        experienceValue: 25,
        healAmount: 10,
        healRange: 2
    }
};

// 적 AI 패턴 상수
const ENEMY_PATTERNS = {
    NORMAL: {
        name: '일반',
        description: '기본 경로를 따라 이동',
        update: function (enemy) {
            if (enemy.pathIndex >= currentMap.path.length - 1) {
                gameState.lives--;
                return true;
            }
            const target = currentMap.path[enemy.pathIndex + 1];
            const dx = target.x - enemy.x;
            const dy = target.y - enemy.y;
            if (Math.abs(dx) < enemy.speed && Math.abs(dy) < enemy.speed) {
                enemy.pathIndex++;
            } else {
                enemy.x += dx * enemy.speed;
                enemy.y += dy * enemy.speed;
            }
            return false;
        }
    },
    ZIGZAG: {
        name: '지그재그',
        description: '경로를 따라가면서 좌우로 살짝 흔들림',
        update: function (enemy) {
            if (enemy.pathIndex >= currentMap.path.length - 1) {
                gameState.lives--;
                return true;
            }
            const prev = currentMap.path[enemy.pathIndex];
            const target = currentMap.path[enemy.pathIndex + 1];
            const dx = target.x - prev.x;
            const dy = target.y - prev.y;
            // 경로의 법선 벡터(좌우 흔들림)
            const nx = -dy;
            const ny = dx;
            if (enemy.zigzagFrame === undefined) enemy.zigzagFrame = 0;
            enemy.zigzagFrame++;
            const offset = Math.sin(enemy.zigzagFrame * 0.2) * 0.2; // 0.2칸 이내로 흔들림
            // 목표 위치 계산 (경로 + 흔들림)
            const tx = target.x + nx * offset;
            const ty = target.y + ny * offset;
            const ddx = tx - enemy.x;
            const ddy = ty - enemy.y;
            if (Math.abs(ddx) < enemy.speed && Math.abs(ddy) < enemy.speed) {
                enemy.pathIndex++;
            } else {
                enemy.x += ddx * enemy.speed;
                enemy.y += ddy * enemy.speed;
            }
            return false;
        }
    },
    SWARM: {
        name: '무리',
        description: '경로를 따라가면서 가까운 적과 뭉침',
        update: function (enemy) {
            if (enemy.pathIndex >= currentMap.path.length - 1) {
                gameState.lives--;
                return true;
            }
            // 경로 기본 이동
            const target = currentMap.path[enemy.pathIndex + 1];
            let dx = target.x - enemy.x;
            let dy = target.y - enemy.y;
            // 가까운 적과의 거리 보정(경로에서 크게 벗어나지 않게 0.1칸 이내로만 영향)
            let minDist = Infinity;
            let closest = null;
            enemies.forEach(other => {
                if (other !== enemy) {
                    const dist = Math.sqrt((other.x - enemy.x) ** 2 + (other.y - enemy.y) ** 2);
                    if (dist < minDist) {
                        minDist = dist;
                        closest = other;
                    }
                }
            });
            if (closest && minDist > 0.1 && minDist < 2) {
                dx += (closest.x - enemy.x) * 0.05;
                dy += (closest.y - enemy.y) * 0.05;
            }
            if (Math.abs(dx) < enemy.speed && Math.abs(dy) < enemy.speed) {
                enemy.pathIndex++;
            } else {
                enemy.x += dx * enemy.speed;
                enemy.y += dy * enemy.speed;
            }
            return false;
        }
    },
    AMBUSH: {
        name: '매복',
        description: '경로에서 잠시 멈췄다가 빠르게 돌진',
        update: function (enemy) {
            if (enemy.pathIndex >= currentMap.path.length - 1) {
                gameState.lives--;
                return true;
            }
            if (!enemy.ambushState) {
                enemy.ambushState = 'hiding';
                enemy.ambushTimer = 60;
                enemy.originalSpeed = enemy.speed;
            }
            switch (enemy.ambushState) {
                case 'hiding':
                    enemy.ambushTimer--;
                    if (enemy.ambushTimer <= 0) {
                        enemy.ambushState = 'charging';
                        enemy.speed = enemy.originalSpeed * 2;
                        showAmbushEffect(enemy.x, enemy.y);
                    }
                    break;
                case 'charging':
                    const target = currentMap.path[enemy.pathIndex + 1];
                    const dx = target.x - enemy.x;
                    const dy = target.y - enemy.y;
                    if (Math.abs(dx) < enemy.speed && Math.abs(dy) < enemy.speed) {
                        enemy.pathIndex++;
                        enemy.ambushState = 'hiding';
                        enemy.speed = enemy.originalSpeed;
                        enemy.ambushTimer = 60;
                    } else {
                        enemy.x += dx * enemy.speed;
                        enemy.y += dy * enemy.speed;
                    }
                    break;
            }
            return false;
        }
    },
    // ... existing code ...
    GROUP_RUSH: {
        name: '집단 돌진',
        description: '그룹 신호에 맞춰 동시에 돌진',
        update: function (enemy) {
            if (enemy.pathIndex >= currentMap.path.length - 1) {
                gameState.lives--;
                return true;
            }
            // 그룹 신호: 그룹 전체가 일정 거리 이하로 모이면 돌진
            const group = enemyGroups.find(g => g.id === enemy.groupId);
            let rush = false;
            if (group) {
                const alive = group.members.filter(e => e.health > 0);
                // 그룹 내 적이 모두 가까이 모이면 돌진
                const close = alive.every(e => Math.abs(e.x - enemy.x) < 1 && Math.abs(e.y - enemy.y) < 1);
                if (close) rush = true;
            }
            const target = currentMap.path[enemy.pathIndex + 1];
            const dx = target.x - enemy.x;
            const dy = target.y - enemy.y;
            const speed = rush ? enemy.speed * 2 : enemy.speed;
            if (Math.abs(dx) < speed && Math.abs(dy) < speed) {
                enemy.pathIndex++;
            } else {
                enemy.x += dx * speed;
                enemy.y += dy * speed;
            }
            return false;
        }
    }
};

// 보스 몬스터 정의
const BOSS_TYPES = {
    TANK: {
        name: '탱크 보스',
        health: 1000,
        speed: 0.01,
        reward: 100,
        color: 'brown',
        ability: 'shield' // 일정 시간 무적
    },
    SPEED: {
        name: '스피드 보스',
        health: 500,
        speed: 0.03,
        reward: 150,
        color: 'cyan',
        ability: 'dash' // 순간 이동
    },
    SUMMONER: {
        name: '소환사 보스',
        health: 800,
        speed: 0.015,
        reward: 200,
        color: 'green',
        ability: 'summon' // 적 소환
    }
};

// 보스 패턴 정의
const BOSS_PATTERNS = {
    SHIELD: {
        name: '방어막',
        cooldown: 300,
        duration: 180,
        update: (boss) => {
            if (boss.isDead) return true;

            if (boss.patternCooldown === 0) {
                boss.isInvincible = true;
                boss.defense = 50;
                showBossPatternEffect(boss.x, boss.y, '방어막');
                playSound('bossShield');
            }

            if (boss.patternCooldown === boss.pattern.duration) {
                boss.isInvincible = false;
                boss.defense = 0;
            }

            return false;
        }
    },
    TELEPORT: {
        name: '순간이동',
        cooldown: 300, // 5초
        update: (boss) => {
            if (boss.isDead) return true;
            if (boss.patternCooldown === 0) {
                // 현재 pathIndex에서 2~3칸 앞(랜덤)으로 순간이동
                const jump = Math.floor(Math.random() * 2) + 2; // 2~3칸
                let newIndex = Math.min(boss.pathIndex + jump, currentMap.path.length - 1);
                boss.pathIndex = newIndex;
                const target = currentMap.path[newIndex];
                boss.x = target.x;
                boss.y = target.y;
                showBossPatternEffect(boss.x, boss.y, '순간이동');
                playSound('bossTeleport');
            }
            return false;
        }
    },
    HEAL: {
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
                showBossPatternEffect(boss.x, boss.y, '강력한 힐!');
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
                showBossPatternEffect(boss.x, boss.y, '소환!');
                playSound('bossSummon');
            }
            return false;
        }
    }
};

// 적 스킬 정의
const ENEMY_SKILLS = {
    SHIELD: {
        name: '방어막',
        cooldown: 300, // 5초
        effect: function (enemy) {
            enemy.isInvincible = true;
            enemy.shieldEffectTime = 120; // 2초(60fps 기준)
            showSpecialEffect(enemy.x, enemy.y, '방어막');
            setTimeout(() => {
                if (!enemy.isDead) enemy.isInvincible = false;
            }, 2000);
        }
    },
    TELEPORT: {
        name: '순간이동',
        cooldown: 400,
        effect: function (enemy) {
            if (enemy.pathIndex + 3 < currentMap.path.length - 1) {
                enemy.pathIndex += 3;
                const target = currentMap.path[enemy.pathIndex];
                enemy.x = target.x;
                enemy.y = target.y;
                showSkillEffect(enemy.x, enemy.y, '순간이동');
                enemy.teleportEffectTime = 40; // 0.7초간 이펙트
            }
        }
    },
    HEAL_SELF: {
        name: '자가회복',
        cooldown: 350,
        effect: function (enemy) {
            const heal = Math.floor(enemy.maxHealth * 0.3);
            enemy.health = Math.min(enemy.maxHealth, enemy.health + heal);
            showSkillEffect(enemy.x, enemy.y, '자가회복');
            enemy.healEffectTime = 60; // 1초간 이펙트
        }
    },
    HEAL_AOE: {
        name: '힐',
        cooldown: 500,
        effect: function (enemy) {
            enemies.forEach(e => {
                if (e !== enemy && Math.abs(e.x - enemy.x) < 2 && Math.abs(e.y - enemy.y) < 2) {
                    e.health = Math.min(e.maxHealth, e.health + Math.floor(e.maxHealth * 0.2));
                    showSkillEffect(e.x, e.y, '힐');
                    e.healEffectTime = 60; // 1초간 이펙트
                }
            });
            showSkillEffect(enemy.x, enemy.y, '힐');
            enemy.healEffectTime = 60; // 1초간 이펙트
        }
    }
};

// 이제 class Enemy를 전역에 선언
class Enemy {
    constructor(wave, isBoss = false, initialPattern = null, initialX = 0, initialY = 0, type = null) {
        this.x = initialX;
        this.y = initialY;
        this.isDead = false;
        this.isInvincible = false;
        this.health = 0;
        this.maxHealth = 0;
        this.speed = 0;
        this.baseSpeed = 0;
        this.type = null;
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = 100;
        this.baseReward = 0;
        this.baseExperience = 0;
        this.statusEffects = new Map();
        this.pathIndex = 0;
        this.isBoss = isBoss;
        this.zigzagFrame = 0;
        this.groupId = 0;
        this.skill = null;
        this.skillCooldown = 0;
        this.patternCooldown = 0;
        this.healCooldown = 0;
        this.healEffectTime = 0;
        this.continuousDamage = 0;
        this.lastDamage = null;
        this.lastAttacker = null;
        this.defense = 10;
        this.groupDefenseBuff = 1;
        this.groupSpeedBuff = 1;
        this._isLoading = false;
        
        // 현재 경로 설정
        this.currentPath = currentMap.path;
        
        // 패턴 설정
        let _pattern = initialPattern;
        Object.defineProperty(this, 'pattern', {
            get() { return _pattern; },
            set(v) {
                _pattern = v;
                if (v && v.cooldown) {
                    this.patternCooldown = v.cooldown;
                }
            }
        });
        
        // 초기 레벨 설정
        this.level = this.calculateInitialLevel(wave);
        
        // 타입과 기본 스탯 및 이름 설정
        if (isBoss) {
            this.type = type;
            const bossInfo = BOSS_TYPES[type] || BOSS_TYPES.TANK;
            this.name = bossInfo.name;
            this.baseSpeed = bossInfo.speed;
            this.speed = this.baseSpeed;
            this.health = bossInfo.health;
            this.maxHealth = bossInfo.health;
            this.baseReward = bossInfo.reward;
            this.baseExperience = 50;
            this.color = bossInfo.color;
            this.ability = bossInfo.ability;
        } else {
            this.type = type || 'NORMAL';
            switch (this.type) {
                case 'NORMAL':
                    this.name = '일반 적';
                    this.baseSpeed = 0.015;
                    this.speed = this.baseSpeed;
                    this.health = 100;
                    this.maxHealth = 100;
                    this.baseReward = 10;
                    this.baseExperience = 5;
                    this.color = 'red';
                    break;
                case 'FAST':
                    this.name = '빠른 적';
                    this.baseSpeed = 0.025;
                    this.speed = this.baseSpeed;
                    this.health = 50;
                    this.maxHealth = 50;
                    this.baseReward = 15;
                    this.baseExperience = 8;
                    this.color = 'yellow';
                    break;
                case 'TANK':
                    this.name = '탱커';
                    this.baseSpeed = 0.01;
                    this.speed = this.baseSpeed;
                    this.health = 200;
                    this.maxHealth = 200;
                    this.baseReward = 20;
                    this.baseExperience = 10;
                    this.color = 'blue';
                    this.skill = ENEMY_SKILLS.SHIELD;
                    this.skillCooldown = this.skill.cooldown;
                    break;
                case 'HEALER':
                    this.name = '치유사';
                    this.baseSpeed = 0.012;
                    this.speed = this.baseSpeed;
                    this.health = 80;
                    this.maxHealth = 80;
                    this.baseReward = 25;
                    this.baseExperience = 12;
                    this.color = 'green';
                    this.skill = ENEMY_SKILLS.HEAL_AOE;
                    this.skillCooldown = this.skill.cooldown;
                    break;
            }
            this.name += ` Lv.${this.level}`;
        }
        
        // 레벨에 따른 스탯 보정
        this.health = this.calculateLeveledHealth(this.health);
        this.maxHealth = this.health;
        this.speed = this.calculateLeveledSpeed(this.baseSpeed);
        this.baseReward = this.calculateLeveledReward(this.baseReward);
        this.baseExperience = this.calculateLeveledExperience(this.baseExperience);
        
        // 보상 값 항상 세팅
        this.reward = this.baseReward;
        this.experienceValue = this.baseExperience;
    }

    calculateInitialLevel(wave) {
        // 웨이브에 따라 초기 레벨 계산 (최소 1)
        const baseLevel = Math.floor(wave / 2);
        const randomBonus = Math.random() < 0.3 ? 1 : 0; // 30% 확률로 추가 레벨
        return Math.max(1, Math.min(baseLevel + randomBonus, ENEMY_LEVEL_SETTINGS.maxLevel));
    }

    calculateLeveledHealth(baseHealth) {
        return Math.floor(baseHealth * Math.pow(ENEMY_LEVEL_SETTINGS.healthMultiplier, this.level - 1));
    }

    calculateLeveledSpeed(baseSpeed) {
        return baseSpeed * Math.pow(ENEMY_LEVEL_SETTINGS.speedMultiplier, this.level - 1);
    }

    calculateLeveledReward(baseReward) {
        return baseReward * Math.pow(ENEMY_LEVEL_SETTINGS.rewardMultiplier, this.level - 1);
    }

    calculateLeveledExperience(baseExperience) {
        return baseExperience * Math.pow(ENEMY_LEVEL_SETTINGS.experienceMultiplier, this.level - 1);
    }

    tryLevelUp() {
        if (this.level < ENEMY_LEVEL_SETTINGS.maxLevel && 
            this.levelUpCount < ENEMY_LEVEL_SETTINGS.maxLevelUpPerWave &&
            Math.random() < ENEMY_LEVEL_SETTINGS.levelUpChance) {
            
            this.level++;
            this.levelUpCount++;
            this.name = `${this.name.split(' Lv.')[0]} Lv.${this.level}`;
            
            // 레벨업에 따른 능력치 재계산
            this.health = this.calculateLeveledHealth(this.maxHealth);
            this.maxHealth = this.health;
            this.speed = this.calculateLeveledSpeed(this.baseSpeed);
            this.reward = Math.floor(this.calculateLeveledReward(this.reward));
            this.experienceValue = Math.floor(this.calculateLeveledExperience(this.experienceValue));
            
            // 레벨업 효과 표시
            //showLevelUpEffect(this.x, this.y);
            return true;
        }
        return false;
    }

    applyStatusEffect(effectType, duration) {
        const effect = STATUS_EFFECTS[effectType];
        if (!effect) return;
        // 보스는 상태이상 지속시간 50% 감소
        let actualDuration = duration || effect.duration;
        if (this.type === 'BOSS') actualDuration = Math.ceil(actualDuration * 0.5);
        if (this.statusEffects.has(effectType)) {
            const current = this.statusEffects.get(effectType);
            current.remaining = Math.max(current.remaining, actualDuration);
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
    }

    updateStatusEffects() {
        for (const [effectType, effect] of this.statusEffects) {
            effect.remaining--;
            
            if (effect.remaining <= 0) {
                // 효과 제거
                switch(effectType) {
                    case 'FROZEN':
                        // FROZEN이 여러 번 중첩된 경우를 위해, 남은 FROZEN이 없을 때만 복구
                        if (![...this.statusEffects.keys()].filter(e => e === 'FROZEN').length <= 1) {
                            this.speed = this.baseSpeed;
                        }
                        break;
                    case 'POISON':
                    case 'BURNING':
                        this.continuousDamage -= STATUS_EFFECTS[effectType].damagePerTick;
                        if (this.continuousDamage < 0) this.continuousDamage = 0;
                        break;
                }
                this.statusEffects.delete(effectType);
            }
        }
    }

    healNearbyEnemies() {
        if (this.type !== 'HEALER' || this.healCooldown > 0 || this.isDead) return;
        let healedAny = false;
        enemies.forEach(enemy => {
            if (enemy !== this && !enemy.isDead) {
                const dx = (enemy.x - this.x) * TILE_SIZE;
                const dy = (enemy.y - this.y) * TILE_SIZE;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= ENEMY_TYPES.HEALER.healRange * TILE_SIZE) {
                    const healAmount = Math.min(ENEMY_TYPES.HEALER.healAmount, enemy.maxHealth - enemy.health);
                    if (healAmount > 0) {
                        enemy.health = Math.min(enemy.maxHealth, enemy.health + healAmount);
                        // 이펙트 중복 방지: 이미 같은 위치에 이펙트가 있으면 추가하지 않음
                        if (!document.querySelector(`.enemy-skill-effect[data-x='${enemy.x}'][data-y='${enemy.y}']`)) {
                            showSkillEffect(enemy.x, enemy.y, '힐');
                        }
                        healedAny = true;
                    }
                }
            }
        });
        if (healedAny) this.healCooldown = 60;
    }

    update() {
        if (this.isDead) return true;

        if (this.shieldEffectTime > 0) this.shieldEffectTime--;
        if (this.healEffectTime > 0) this.healEffectTime--;
        if (this.teleportEffectTime > 0) this.teleportEffectTime--;

        if (this.shieldEffectTime > 0) {
            this.shieldEffectTime--;
        }

        if (this.health <= 0 && !this.isDead) {
            this.die();
            return true;
        }

        // 이동 전 로그
        this.updateStatusEffects();
        // 레벨업 시도
        this.tryLevelUp();
        
        // 지속 데미지 적용
        if (this.continuousDamage > 0) {
            const damage = Math.floor(this.continuousDamage);
            this.takeDamage(damage);
            this.continuousDamage = Math.max(0, this.continuousDamage * 0.95);
        }
        
        // 기본 이동 로직 추가
        const target = this.currentPath[this.pathIndex + 1];
        if (!target) return true; // 경로의 끝에 도달했으면 제거
        
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        if (Math.abs(dx) < this.speed && Math.abs(dy) < this.speed) {
            this.pathIndex++;
        } else {
            this.x += dx * this.speed;
            this.y += dy * this.speed;
        }

        // AI 패턴 업데이트
        if (this.pattern && this.pattern.update) {
            const before = {x: this.x, y: this.y, pathIndex: this.pathIndex};
            const shouldRemove = this.pattern.update(this);
            // 이동 후 로그
            if (shouldRemove) return true;
        }

        // 치유사 능력 사용
        this.healNearbyEnemies();

        // Enemy update() 내 추가
        if (this.skill && this.skillCooldown > 0) {
            this.skillCooldown--;
        }
        if (this.skill && this.skillCooldown === 0) {
            this.skill.effect(this);
            showSpecialEffect(this.x, this.y, this.skill.name);
            this.skillCooldown = this.skill.cooldown > 0 ? this.skill.cooldown : 1; // 즉시 쿨다운 세팅
        }

        // 그룹 버프 적용
        applyGroupBuffs();
        if (this.groupSpeedBuff) this.speed = this.baseSpeed * this.groupSpeedBuff;
        if (this.groupDefenseBuff) this.defense = 10 * this.groupDefenseBuff; // 예시: 방어력 10 기준

        // Enemy.update 내 보스 패턴 실행 안전장치 - 수정된 부분
        if (this.type === 'BOSS') {
            if (this.patternCooldown <= 0 && !this.isDead) {
                if (this.pattern && typeof this.pattern.update === 'function') {
                    this.pattern.update(this);
                    this.patternCooldown = this.pattern.cooldown > 0 ? this.pattern.cooldown : 1; // 즉시 쿨다운 세팅
                    showBossPatternEffect(this.x, this.y, this.pattern.name);
                }
            } else if (this.patternCooldown > 0) {
                this.patternCooldown--;
            }
        }

        return false;
    }

    draw() {
        if (this.isDead) return;
        ctx.save();

        // 1. 적 본체(사각형)
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.x * TILE_SIZE + 6,
            this.y * TILE_SIZE + 6, // 18 → 6
            TILE_SIZE - 12,
            TILE_SIZE - 12
        );
        // 적 본체 테두리 추가
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            this.x * TILE_SIZE + 6,
            this.y * TILE_SIZE + 6,
            TILE_SIZE - 12,
            TILE_SIZE - 12
        );

        // 2. HP바 (적 본체 위)
        const barX = this.x * TILE_SIZE + 6;
        const barY = this.y * TILE_SIZE - 4; // 8 → -4
        const barW = TILE_SIZE - 12;
        const barH = 8;
        const percent = Math.max(0, this.health / this.maxHealth);

        // HP바 배경
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barW, barH);

        // HP바 실제 체력
        ctx.fillStyle = percent > 0.6 ? '#4ef04e' : (percent > 0.3 ? '#ffe066' : '#ff4e4e');
        ctx.fillRect(barX, barY, barW * percent, barH);

        // HP바 테두리
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barW, barH);

        // HP 숫자 (원하면 주석 해제)
        // ctx.font = 'bold 11px Arial';
        // ctx.fillStyle = '#fff';
        // ctx.textAlign = 'center';
        // ctx.textBaseline = 'middle';
        // ctx.fillText(`${Math.ceil(this.health)}/${this.maxHealth}`, barX + barW / 2, barY + barH / 2);

        // 3. 이름/패턴명 (HP바 위, 테두리 추가)
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.strokeText(`${this.name}${this.pattern?.name ? ' [' + this.pattern.name + ']' : ''}`, barX + barW / 2, barY - 6); // -4 → -6
        ctx.fillStyle = '#fff';
        ctx.fillText(`${this.name}${this.pattern?.name ? ' [' + this.pattern.name + ']' : ''}`, barX + barW / 2, barY - 6);

        // 4. 레벨 (적 본체 중앙, 테두리 추가)
        ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.strokeText(`Lv.${this.level}`, this.x * TILE_SIZE + TILE_SIZE / 2, this.y * TILE_SIZE + 6 + (TILE_SIZE - 12) / 2);
        ctx.fillStyle = '#fff';
        ctx.fillText(`Lv.${this.level}`, this.x * TILE_SIZE + TILE_SIZE / 2, this.y * TILE_SIZE + 6 + (TILE_SIZE - 12) / 2);

        // 5. 상태이상 아이콘 (HP바 아래)
        const statusIcons = [...this.statusEffects.keys()].map(k => {
            if (k === 'FROZEN') return '❄️';
            if (k === 'POISON') return '☠️';
            if (k === 'BURNING') return '🔥';
            if (k === 'SLOWED') return '⏳';
            return '🌀';
        });

        if (statusIcons.length) {
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(statusIcons.join(' '), barX, barY + barH + 2);
        }


        // === 스킬별 이펙트 ===
        const centerX = this.x * TILE_SIZE + TILE_SIZE / 2;
        const centerY = this.y * TILE_SIZE + TILE_SIZE / 2;
        const baseRadius = (TILE_SIZE - 12) / 2 + 6;
        // 1. 방어막 (푸른 원 + 🛡️ + 파란 빛)
        if (this.shieldEffectTime > 0) {
            const t = this.shieldEffectTime;
            ctx.save();
            ctx.globalAlpha = 0.18;
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius + 8 + Math.sin(t / 8) * 2, 0, Math.PI * 2);
            ctx.fillStyle = '#aef6ff';
            ctx.fill();
            ctx.globalAlpha = 0.35;
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#5fd6ff';
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🛡️', centerX, centerY);
            ctx.restore();
        }

        // 2. 힐/자가회복 (초록 원 + ✚ + 초록 빛)
        if (this.healEffectTime > 0) {
            const t = this.healEffectTime;
            ctx.save();
            ctx.globalAlpha = 0.18;
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius + 8 + Math.sin(t / 8) * 2, 0, Math.PI * 2);
            ctx.fillStyle = '#b6ffb6';
            ctx.fill();
            ctx.globalAlpha = 0.35;
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#4ef04e';
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✚', centerX, centerY);
            ctx.restore();
        }
        // 3. 순간이동 (밝은 파랑 원 + ✨ + 섬광)
        if (this.teleportEffectTime > 0) {
            const t = this.teleportEffectTime;
            ctx.save();
            ctx.globalAlpha = 0.22;
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius + 12 + Math.sin(t / 5) * 3, 0, Math.PI * 2);
            ctx.fillStyle = '#e0f7ff';
            ctx.fill();
            ctx.globalAlpha = 0.38;
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#b3e6ff';
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✨', centerX, centerY);
            ctx.restore();
        }

            ctx.restore();
    }

    // 방어력 일관 적용
    takeDamage(damage, isCritical = false, attacker = null) {
        if (this.isDead || this.isInvincible) return 0;
        // 방어력 적용
        const actualDamage = Math.max(1, Math.floor(damage * (1 - (this.defense / (this.defense + 100)))));
        this.health = Math.max(0, this.health - actualDamage);
        this.lastDamage = { amount: actualDamage, isCritical };
        if (attacker) this.lastAttacker = attacker;
        if (this.health <= 0) {
            this.die();
        }
        return actualDamage;
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        // 그룹에서 제거
        if (this.groupId && Array.isArray(enemyGroups)) {
            const group = enemyGroups.find(g => g.id === this.groupId);
            if (group) {
                group.members = group.members.filter(e => e !== this);
            }
        }
        // 버프 해제
        this.groupSpeedBuff = 1.0;
        this.groupDefenseBuff = 1.0;
        // 보상 지급 및 중복 방지
        if (this.lastAttacker && typeof this.lastAttacker.gainExperience === 'function') {
            this.lastAttacker.gainExperience(this.experienceValue);
        }
        gameState.gold += Math.floor(this.reward * (gameState.goldMultiplier || 1));
        gameStats.totalGold += Math.floor(this.reward * (gameState.goldMultiplier || 1));
        gameStats.enemiesKilled++;
        let scoreToAdd = this.reward;
        if (this.lastDamage && this.lastDamage.isCritical) scoreToAdd *= 2;
        if (this.type === 'BOSS') {
            scoreToAdd = this.reward * 3;
            gameStats.bossesKilled++;
            gameState.bossKilled = true;
            this.patternCooldown = 99999;
            this.skillCooldown = 99999;
        }
        gameState.score += Math.floor(scoreToAdd);
        playSound('enemy_death');
        updateStats();
    }
}

// 게임 오버 화면 표시
function showGameOver() {
    const gameOver = document.getElementById('gameOver');
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalWave').textContent = gameState.wave;
    gameOver.style.display = 'block';
}

// 게임 시작 버튼 이벤트 수정
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
                newStartBtn.textContent = '재시작';
                document.getElementById('tutorial').style.display = 'none';
                document.getElementById('waveStartButton').style.display = 'block';
                
                // 게임 초기화
                initializeGame();
                updateControlVisibility();
                
                // 게임 시작 시 배경음악 재생
                if (musicEnabled) {
                    sounds.bgm.loop = true;
                    sounds.bgm.play().catch(error => console.log('BGM 재생 실패:', error));
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

// 웨이브 시작 함수 수정
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
        showWaveStartEffect();
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
    showWaveStartEffect();
    playSound('wave_start');
}

// 다음 적 생성 함수
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

// 타워 범위 미리보기
let rangePreview = null;

function showTowerRangePreview(x, y, range, type) {
    if (rangePreview) {
        rangePreview.remove();
    }
    
    rangePreview = document.createElement('div');
    rangePreview.className = 'tower-range-preview';
    
    // 타워 중심을 기준으로 계산
    const centerX = x * TILE_SIZE + TILE_SIZE/2;
    const centerY = y * TILE_SIZE + TILE_SIZE/2;
    const diameter = range * TILE_SIZE * 2;
    
    rangePreview.style.left = `${centerX - diameter/2}px`;
    rangePreview.style.top = `${centerY - diameter/2}px`;
    rangePreview.style.width = `${diameter}px`;
    rangePreview.style.height = `${diameter}px`;
    
    // 타워 종류에 따른 색상 설정
    const tower = TOWER_TYPES[type];
    rangePreview.style.backgroundColor = `${tower.color}20`;
    rangePreview.style.borderColor = tower.color;
    
    document.querySelector('.game-area').appendChild(rangePreview);
}


function hideTowerRangePreview() {
    if (rangePreview) {
        rangePreview.remove();
        rangePreview = null;
    }
}

// 웨이브 종료 체크 수정
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

// 게임 루프 수정
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
        ctx.fillText('일시정지', canvas.width/2 - 100, canvas.height/2);
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
    
    // 다음 프레임 요청
    requestAnimationFrame(gameLoop);
}

// 단축키 이벤트 추가
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!gameState.waveInProgress && !gameState.isGameOver && !isCountdownActive && gameState.isStarted) {
            showCountdown();
        }
    } else if (e.code === 'KeyP') {
        e.preventDefault();
        if (gameState.isStarted) {
            gameState.isPaused = !gameState.isPaused;
            document.getElementById('pauseBtn').textContent = gameState.isPaused ? '계속하기' : '일시정지';
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
        document.getElementById('pauseBtn').textContent = gameState.isPaused ? '계속하기' : '일시정지';
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

// 업적 체크
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

function getSpecialDescription(type) {
    switch(type) {
        case 'ICE':
            return '범위 내 모든 적을 5초 동안 얼립니다.';
        case 'POISON':
            return '적에게 지속적인 독 데미지를 줍니다.';
        case 'SUPPORT':
            return '주변 타워의 공격력을 20% 증가시킵니다.';
        case 'BASIC':
            return '기본적인 공격력과 범위를 가진 타워입니다.';
        case 'SNIPER':
            return '관통 공격이 가능한 타워입니다.';
        case 'SPLASH':
            return '범위 공격과 감속 효과를 가진 타워입니다.';
        case 'LASER':
            return '지속적인 데미지를 주는 타워입니다.';
        default:
            return '특수 능력이 없습니다.';
    }
}

// CSS 스타일 추가
document.head.insertAdjacentHTML('beforeend', `
    <style>
        /* 타워 설치 메뉴 스타일 */
        .tower-build-menu {
            position: fixed;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #4CAF50;
            border-radius: 10px;
            padding: 15px;
            color: white;
            font-family: Arial, sans-serif;
            z-index: 1000;
            box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%);
        }

        .tower-list {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 15px;
        }

        .tower-card {
            background: rgba(76, 175, 80, 0.1);
            border-radius: 8px;
            padding: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            min-height: 100px;
        }

        .tower-card:hover {
            background: rgba(76, 175, 80, 0.2);
            transform: translateY(-2px);
        }

        .tower-card.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .tower-cost {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.7);
            padding: 4px 8px;
            font-size: 0.8rem;
            color: gold;
            text-align: center;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }

        .tower-card-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 25px;
            margin-bottom: 8px;
        }

        .tower-icon {
            width: 24px;
            height: 24px;
            background: #4CAF50;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1em;
            flex-shrink: 0;
        }

        .tower-name {
            font-weight: bold;
            color: #4CAF50;
            font-size: 0.9rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .tower-stats {
            font-size: 0.7rem;
            color: #ccc;
            margin-top: 6px;
        }

        .tower-stat {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
        }

        .tower-description {
            font-size: 0.7rem;
            color: #888;
            margin-top: 6px;
            line-height: 1.3;
        }

        @media (max-width: 768px) {
            .tower-build-menu {
                width: 95%;
                
                max-width: none;
            }
            
            .tower-list {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
`);

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
});

// 그룹 시각화 효과
function drawGroupConnections() {
    const groups = new Map();
    
    // 그룹별로 적 분류
    enemies.forEach(enemy => {
        if (enemy.groupId) {
            if (!groups.has(enemy.groupId)) {
                groups.set(enemy.groupId, []);
            }
            groups.get(enemy.groupId).push(enemy);
        }
    });

    // 각 그룹의 연결선 그리기
    groups.forEach(members => {
        if (members.length > 1) {
            ctx.save();
            ctx.strokeStyle = members[0].groupColor;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3;
            
            // 모든 멤버를 연결하는 선 그리기
            for (let i = 0; i < members.length - 1; i++) {
                const start = members[i];
                const end = members[i + 1];
                
            ctx.beginPath();
                ctx.moveTo(
                    start.x * TILE_SIZE + TILE_SIZE/2,
                    start.y * TILE_SIZE + TILE_SIZE/2
                );
                ctx.lineTo(
                    end.x * TILE_SIZE + TILE_SIZE/2,
                    end.y * TILE_SIZE + TILE_SIZE/2
                );
                ctx.stroke();
            }
            ctx.restore();
        }
    });
}

// 그리드 하이라이트 함수
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

// 타워 제한 업데이트
function updateTowerLimit() {
    document.getElementById('towerLimitCount').textContent = gameState.towerCount;
    document.getElementById('towerLimitMax').textContent = gameState.maxTowers;
}

// 웨이브 클리어 보상 계산
function calculateWaveReward() {
    const baseReward = 50;
    const waveBonus = gameState.wave * 10;
    const difficultyMultiplier = DIFFICULTY_SETTINGS[gameState.difficulty].goldReward;
    const towerBonus = towers.length * 5;
    const levelBonus = gameState.level * 2;
    
    return Math.floor((baseReward + waveBonus + towerBonus + levelBonus) * difficultyMultiplier);
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

// 저장 데이터 검증
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

// 경험치 획득 및 레벨업
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

// 보스 패턴 이펙트 표시 함수
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

// 맵 선택 함수
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
    ctx.fillText(currentMap.name, canvas.width/2, 10);
    
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

// 미니맵 그리기 함수
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

// 타워 조합 체크 함수
// 이미 표시된 조합을 추적하는 전역 배열 추가
let shownCombos = [];

function checkTowerCombos() {
    Object.entries(TOWER_COMBOS).forEach(([comboKey, combo]) => {
        // 조합 조건을 만족하는지 확인
        const hasCombo = combo.condition ? combo.condition(towers) : true;
        
        if (hasCombo) {
            // 조합 효과 적용
            combo.effect(towers);
            
            // 조합 이펙트 표시 (이미 표시되지 않은 경우에만)
            if (!shownCombos.includes(comboKey)) {
                towers.forEach(tower => {
                    if (!tower.activeCombos) tower.activeCombos = new Set();
                    tower.activeCombos.add(comboKey);
                });
                showComboEffect(combo.name);
                shownCombos.push(comboKey);
            }
        } else {
            // 조합이 해제된 경우
            towers.forEach(tower => {
                if (tower.activeCombos && tower.activeCombos.has(comboKey)) {
                    tower.activeCombos.delete(comboKey);
                }
            });
            // 조합이 해제되면 shownCombos에서도 제거
            const shownIdx = shownCombos.indexOf(comboKey);
            if (shownIdx > -1) {
                shownCombos.splice(shownIdx, 1);
            }
        }
    });
}

// 조합 이펙트 표시 함수
function showComboEffect(comboName) {
    if (lowSpecMode) return;
    const effect = document.createElement('div');
    effect.className = 'combo-effect';
    effect.innerHTML = `
        <h3>타워 조합 발견!</h3>
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
    this.textContent = soundEnabled ? '🔊 효과음' : '🔇 효과음';
});

document.getElementById('musicToggleBtn').addEventListener('click', function() {
    toggleMusic();
    this.classList.toggle('muted');
    this.textContent = musicEnabled ? '🎵 배경음악' : '🎵 배경음악';
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

// 상태 효과 정의
const STATUS_EFFECTS = {
    POISON: {
        name: '독',
        duration: 180,
        damagePerTick: 2,
        color: '#00ff00',
        update: (enemy) => {
            if (enemy.isDead) return true;
            enemy.takeDamage(STATUS_EFFECTS.POISON.damagePerTick);
            return false;
        }
    },
    FROZEN: {
        name: '빙결',
        duration: 120,
        speedMultiplier: 0.5,
        color: '#00ffff',
        update: (enemy) => {
            if (enemy.isDead) return true;
            enemy.speed = enemy.baseSpeed * STATUS_EFFECTS.FROZEN.speedMultiplier;
            return false;
        }
    },
    BURNING: {
        name: '화상',
        duration: 150,
        damagePerTick: 3,
        color: '#ff0000',
        update: (enemy) => {
            if (enemy.isDead) return true;
            enemy.takeDamage(STATUS_EFFECTS.BURNING.damagePerTick);
            return false;
        }
    }
};

// 상태 효과 이펙트 표시 함수
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

// 상태 효과 업데이트 함수
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

// 매복 효과 표시 함수
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

// 적 스킬 시각 효과
function showSkillEffect(x, y, name) {
    const parent = document.querySelector('.game-area');
    if (!parent) return;
    // 이미 같은 위치+이름에 이펙트가 있으면 새로 만들지 않음
    let effect = parent.querySelector(`.enemy-skill-effect[data-x='${x}'][data-y='${y}'][data-name='${name}']`);
    if (!effect) {
        effect = EffectPool.get('special');
        effect.className = 'enemy-skill-effect';
        effect.setAttribute('data-x', x);
        effect.setAttribute('data-y', y);
        effect.setAttribute('data-name', name);
        // DOM에 없을 때만 append
        if (!effect.parentNode) {
            parent.appendChild(effect);
        }
    }
    effect.textContent = name;
    effect.style.display = 'block';
    effect.style.position = 'absolute';
    effect.style.left = `${x * TILE_SIZE + TILE_SIZE / 2}px`;
    // HP바 바로 위에 표시
    //effect.style.top = `${y * TILE_SIZE + 8}px`;
    effect.style.top = `${y * TILE_SIZE + (TILE_SIZE * 2) }px`;
    effect.style.transform = 'translate(-50%, -100%)';
    effect.style.color = '#00eaff';
    effect.style.fontWeight = 'bold';
    effect.style.fontSize = '14px';
    effect.style.pointerEvents = 'none';
    effect.style.zIndex = 1200;
    effect.style.animation = 'skillEffectFade 1.2s ease-out forwards';
    effect.addEventListener('animationend', () => {
        EffectPool.release(effect);
    }, { once: true });
    setTimeout(() => {
        EffectPool.release(effect);
    }, 1200);
}

// 적 그룹 클래스
class EnemyGroup {
    constructor(id, size, type = null) {
        this.id = id;
        this.size = size;
        this.type = type; // 그룹 전체 타입(선택)
        this.members = [];
        this.color = `hsl(${Math.floor(Math.random()*360)}, 60%, 60%)`;
    }
    add(enemy) {
        enemy.groupId = this.id;
        enemy.groupColor = this.color;
        this.members.push(enemy);
    }
    aliveCount() {
        return this.members.filter(e => e.health > 0).length;
    }
}

// 그룹 관리 배열
let enemyGroups = [];
let groupIdCounter = 1;

// 그룹 버프/효과 적용 함수
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

// 게임 초기화 함수
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
        waveMessageStartTime: 0   // 웨이브 메시지 시작 시간
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
// ... existing code ...

document.getElementById('waveStartButton').addEventListener('click', () => {
    showCountdown(); // initializeGame() 호출 금지
});

// 맵 선택 이벤트에서만 initializeGame() 호출
const mapSelect = document.getElementById('mapSelect');
if (mapSelect) {
    mapSelect.addEventListener('change', (e) => {
        if (!gameState.isStarted) {
            selectMap(e.target.value);
            gameState.currentMap = e.target.value;
            drawMinimap(); // 미리보기 항상 갱신
        }
    });
}

// 게임 시작 버튼에서만 initializeGame() 호출
const startBtn = document.getElementById('startBtn');
if (startBtn) {
    // 기존에 이벤트 리스너가 중복 등록되지 않도록 제거
    startBtn.replaceWith(startBtn.cloneNode(true));
    const newStartBtn = document.getElementById('startBtn');
    
    newStartBtn.addEventListener('click', () => {
        if (!gameState.isStarted) {
            // 게임 시작
            gameState.isStarted = true;
            
            newStartBtn.textContent = '재시작';
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
                sounds.bgm.play().catch(error => console.log('BGM 재생 실패:', error));
            }
        } else {
            // 게임 재시작
            restartGame();
            gameState.isStarted = true;
            updateControlVisibility();
        }
    });
}
// ... existing code ...

// 이펙트 풀 관리자
const EffectPool = {
    pools: new Map(),
    
    init(type, count = 10) {
        if (!this.pools.has(type)) {
            const pool = [];
            for (let i = 0; i < count; i++) {
                if (type === 'levelUp') {
                    pool.push({
                        active: false,
                        x: 0,
                        y: 0,
                        alpha: 1,
                        scale: 1,
                        rotation: 0,
                        type: 'levelUp',
                        duration: 1000,
                        startTime: 0,
                        draw: function() {},
                        update: function() {}
                    });
                } else {
                    const element = document.createElement('div');
                    element.className = type + '-effect';
                    element.style.display = 'none';
                    pool.push(element);
                }
            }
            this.pools.set(type, pool);
        }
    },
    
    get(type) {
        if (!this.pools.has(type)) {
            this.init(type);
        }
        const pool = this.pools.get(type);
        if (type === 'levelUp') {
            const effect = pool.find(e => !e.active);
            if (effect) {
                effect.active = true;
                return effect;
            }
            // 풀이 비어있으면 새로 생성
            const newEffect = {
                active: true,
                x: 0,
                y: 0,
                alpha: 1,
                scale: 1,
                rotation: 0,
                type: 'levelUp',
                duration: 1000,
                startTime: 0,
                draw: function() {},
                update: function() {}
            };
            pool.push(newEffect);
            return newEffect;
        } else {
            const element = pool.find(el => el.style.display === 'none');
            if (element) {
                return element;
            }
            // 풀이 비어있으면 새로 생성
            const newElement = document.createElement('div');
            newElement.className = type + '-effect';
            pool.push(newElement);
            return newElement;
        }
    },
    
    release(element) {
        if (element.type === 'levelUp') {
            element.active = false;
        } else {
            element.style.display = 'none';
            element.className = element.className.split(' ')[0]; // 클래스 초기화
            element.textContent = ''; // 내용 초기화
            element.style.cssText = ''; // 스타일 초기화
        }
    },
    
    getPool(type) {
        return this.pools.get(type) || [];
    }
};

function initializeEffects() {
    // 이펙트 풀 초기화
    EffectPool.init('attack', 20);
    EffectPool.init('damage', 30);
    EffectPool.init('special', 5);
    EffectPool.init('upgrade', 5);
    EffectPool.init('levelUp', 5);  // 레벨업 이펙트 풀 추가
}

// 공격 이펙트 표시 (최적화)
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
    playSound(isCritical ? 'critical' : 'attack');
    
    // 애니메이션 종료 후 풀로 반환
    effect.addEventListener('animationend', () => {
        EffectPool.release(effect);
    }, { once: true });
}

// 데미지 숫자 표시 (최적화)
function showDamageNumber(x, y, damage, isCritical = false) {
    if (lowSpecMode) return;

    const damageText = EffectPool.get('damage');
    const parent = document.querySelector('.game-area');
    if (parent && damageText.parentNode !== parent) {
        if (damageText.parentNode) damageText.parentNode.removeChild(damageText);
        parent.appendChild(damageText);
    }

    // 데미지 크기에 따른 스타일 변화
    const damageSize = Math.min(Math.max(damage / 100, 1.2), 2);
    const fontSize = Math.floor(16 * damageSize);
    const color = isCritical ? '#ff4444' : '#ffffff';
    const textShadow = isCritical 
        ? '0 0 10px #ff0000, 0 0 20px #ff0000, 0 0 30px #ff0000' 
        : '0 0 5px #000000, 0 0 10px #000000';

    // 초기 위치 설정
    const startX = x * TILE_SIZE + TILE_SIZE/2;
    const startY = y * TILE_SIZE + TILE_SIZE*2;
    const offsetX = (Math.random() - 0.5) * 16;

    // 애니메이션 상태
    let startTime = null;
    const duration = 1100; // 1.5초
    const initialVelocity = -3.5; // 초기 상승 속도
    const gravity = 0.2; // 중력
    let currentY = startY;
    let currentVelocity = initialVelocity;
    const maxFallDistance = TILE_SIZE * 1.5; // 최대 낙하 거리 (타일 2개 높이)

    // 애니메이션 함수
    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 물리 기반 움직임 계산
        currentVelocity += gravity;
        currentY += currentVelocity;

        // 최대 낙하 높이 제한
        const maxY = startY + maxFallDistance;
        if (currentY > maxY) {
            currentY = maxY;
            currentVelocity = 0;
        }

        // scale 변화 (0.3 ~ 1.3)
        const scale = 0.5 + Math.sin(progress * Math.PI * 2) * 1;
        const opacity = 1 - progress;

        // 위치와 스타일 업데이트
        damageText.style.cssText = `
            display: block;
            position: absolute;
            left: ${startX + offsetX}px;
            top: ${currentY}px;
            transform: translate(-50%, -50%) scale(${scale});
            font-size: ${fontSize}px;
            color: ${color};
            text-shadow: ${textShadow};
            font-weight: ${isCritical ? '900' : 'bold'};
            opacity: ${opacity};
            z-index: 1000;
            pointer-events: none;
        `;

        damageText.textContent = Math.round(damage).toLocaleString();

        // 애니메이션 계속
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            EffectPool.release(damageText);
        }
    }

    // 애니메이션 시작
    requestAnimationFrame(animate);
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

// 특수능력 이펙트 표시 (최적화)
function showSpecialEffect(x, y, name) {
    if (lowSpecMode) return;
    const effect = EffectPool.get('special');
    const parent = document.querySelector('.game-area');
    if (parent && !effect.parentNode) {
        parent.appendChild(effect);
    }
    const centerX = x * TILE_SIZE + TILE_SIZE/2;
    const centerY = y * TILE_SIZE + TILE_SIZE * 3.2; // 본체 중심에 오도록 조정
    effect.style.cssText = `
        display: block;
        left: ${centerX}px;
        top: ${centerY}px;
    `;
    effect.innerHTML = `
        <div class="special-text">${name}</div>
    `;
    playSound('special');
    effect.addEventListener('animationend', () => {
        EffectPool.release(effect);
    }, { once: true });
}

// 저사양 모드 상태
let lowSpecMode = false;

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

function updateControlVisibility() {
    const isStarted = gameState.isStarted;
    // 게임 시작 버튼은 항상 노출, 텍스트만 변경
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.style.display = 'inline-block';
        startBtn.textContent = isStarted ? '재시작' : '게임 시작';
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
            showBossPatternEffect(boss.x, boss.y, '강력한 힐!');
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
            showBossPatternEffect(boss.x, boss.y, '소환!');
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

// ... existing code ...

function showLevelUpEffect(tower) {
    if (!tower || typeof tower !== 'object' || tower.x === undefined || tower.y === undefined) {
        console.error('showLevelUpEffect는 반드시 타워 객체로 호출해야 합니다!', tower);
        return;
    }
    // 이펙트 풀에서 이펙트 가져오기
    const effect = EffectPool.get('levelUp');
    if (!effect) return;

    // 이펙트 초기화
    effect.x = tower.x * TILE_SIZE + TILE_SIZE/2;  // 타워의 실제 화면 좌표로 변환
    effect.y = tower.y * TILE_SIZE + TILE_SIZE/2;  // 타워의 실제 화면 좌표로 변환
    effect.alpha = 1;
    effect.scale = 0.5;
    effect.rotation = 0;
    effect.active = true;
    effect.type = 'levelUp';
    effect.duration = 1000; // 1초 동안 지속
    effect.startTime = Date.now();

    // 이펙트 그리기 함수
    effect.draw = function() {
        if (!this.active) return;

        const elapsed = Date.now() - this.startTime;
        const progress = elapsed / this.duration;

        // 알파값 감소 (1 -> 0)
        this.alpha = 1 - progress;
        
        // 크기 증가 (0.5 -> 2)
        this.scale = 0.5 + (progress * 1.5);
        
        // 회전 (0 -> 360도)
        this.rotation = progress * 360;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.alpha;

        // 레벨업 이펙트 그리기
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.5)'; // 반투명 금색
        ctx.fill();

        // 별 모양 그리기
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
            const x = Math.cos(angle) * 15;
            const y = Math.sin(angle) * 15;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 215, 0, 0.8)'; // 더 진한 금색
        ctx.fill();

        ctx.restore();
    };

    // 이펙트 업데이트 함수
    effect.update = function() {
        if (!this.active) return false;
        
        const elapsed = Date.now() - this.startTime;
        if (elapsed >= this.duration) {
            this.active = false;
            EffectPool.release(this);
            return false;
        }
        return true;
    };
}

// Enemy 복원 팩토리 함수
function enemyFromData(data) {
    // 패턴 이름을 영문으로 변환
    const patternMap = {
        "매복": "AMBUSH",
        "무리": "SWARM",
        "일반": "NORMAL",
        "지그재그": "ZIGZAG",
        "집단 돌진": "GROUP_RUSH",
        "GROUP": "SWARM"  // 추가
    };

    // 패턴 이름 변환 로직 수정
    const patternName = patternMap[data.pattern] || data.pattern;
    
    const patternData = patternName ? ENEMY_PATTERNS[patternName] : null;
    
    // Enemy 생성 시 type 전달
    const enemy = new Enemy(
        data.wave || 1,
        data.isBoss,
        patternData,
        parseFloat(data.x) || 0,
        parseFloat(data.y) || 0,
        data.type // 타입 전달
    );
    
    // 기본 속성 복원 (Number 변환 시 안전하게 처리)
    enemy.health = parseFloat(data.health) || 0;
    enemy.maxHealth = parseFloat(data.maxHealth) || 0;
    enemy.statusEffects = new Map(data.statusEffects || []);
    enemy.pathIndex = parseInt(data.pathIndex) || 0;
    enemy.isBoss = data.isBoss;
    enemy.zigzagFrame = parseInt(data.zigzagFrame) || 0;
    enemy.groupId = parseInt(data.groupId) || 0;
    enemy.speed = parseFloat(data.speed) || 0;

    // 현재 경로 설정
    enemy.currentPath = currentMap.path;

    // 추가 상태 복원
    if (data.direction !== undefined) enemy.direction = data.direction;
    if (data.level !== undefined) enemy.level = parseInt(data.level) || 1;
    if (data.experience !== undefined) enemy.experience = parseFloat(data.experience) || 0;
    if (data.experienceToNextLevel !== undefined) enemy.experienceToNextLevel = parseFloat(data.experienceToNextLevel) || 0;
    if (data.baseReward !== undefined) enemy.baseReward = parseFloat(data.baseReward);
    if (data.baseExperience !== undefined) enemy.baseExperience = parseFloat(data.baseExperience);
    if (data.reward !== undefined) enemy.reward = parseFloat(data.reward);
    if (data.experienceValue !== undefined) enemy.experienceValue = parseFloat(data.experienceValue);
    if (data.targetX !== undefined) enemy.targetX = parseFloat(data.targetX) || 0;
    if (data.targetY !== undefined) enemy.targetY = parseFloat(data.targetY) || 0;

    // 타입별 스킬/쿨다운 세팅
    if (enemy.type === 'TANK') {
        enemy.skill = ENEMY_SKILLS.SHIELD;
        enemy.skillCooldown = enemy.skill.cooldown;
    } else if (enemy.type === 'HEALER') {
        enemy.skill = ENEMY_SKILLS.HEAL_AOE;
        enemy.skillCooldown = enemy.skill.cooldown;
    } else {
        enemy.skill = null;
        enemy.skillCooldown = 0;
    }

    return enemy;
}

// Tower 복원 팩토리 함수
function towerFromData(data) {
    const tower = Object.create(Tower.prototype);
    Object.assign(tower, data);
    tower.activeBuffs = new Set(data.activeBuffs);
    tower.activeCombos = new Set(data.activeCombos);
    if (!tower.buffedTowers) tower.buffedTowers = new Set();
    // 기본값 보정
    if (!isFinite(tower.baseDamage)) tower.baseDamage = TOWER_TYPES[tower.type]?.damage || 1;
    if (!isFinite(tower.baseRange)) tower.baseRange = TOWER_TYPES[tower.type]?.range || 1;
    if (!isFinite(tower.baseCooldown)) tower.baseCooldown = TOWER_TYPES[tower.type]?.cooldown || 60;
    if (!isFinite(tower.range)) tower.range = tower.baseRange;
    if (!isFinite(tower.damage)) tower.damage = tower.baseDamage;
    if (!isFinite(tower.maxCooldown)) tower.maxCooldown = tower.baseCooldown;
    if (!tower.color) tower.color = TOWER_TYPES[tower.type]?.color || '#888888';
    
    return tower;
}

// ... existing code ...
// 게임 루프에서 메시지 그리기
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
            `보스 웨이브 ${gameState.currentWaveMessage.wave} 시작!`,
            canvas.width / 2,
            canvas.height / 2 - 40
        );

        // 보스 타입 표시
        ctx.font = '18px Arial';
        ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`; // 빨간색
        const bossTypes = Object.keys(BOSS_TYPES);
        const randomBossType = bossTypes[Math.floor(Math.random() * bossTypes.length)];
        ctx.fillText(
            `${BOSS_TYPES[randomBossType].name} 출현!`,
            canvas.width / 2,
            canvas.height / 2
        );
    } else {
        // 일반 웨이브 메시지
        ctx.fillText(
            `웨이브 ${gameState.currentWaveMessage.wave} 시작!`,
            canvas.width / 2,
            canvas.height / 2 - 40
        );

        // 현재 레벨
        ctx.font = '18px Arial';
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillText(
            `현재 레벨: ${gameState.currentWaveMessage.wave}`,
            canvas.width / 2,
            canvas.height / 2
        );
    }

    // 보상
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`; // 골드 색상
    ctx.fillText(
        `보상: ${gameState.currentWaveMessage.reward} 골드`,
        canvas.width / 2,
        canvas.height / 2 + 40
    );

    ctx.restore();
}

// 타워 설치 가능한 위치 표시
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
// ... existing code ...

