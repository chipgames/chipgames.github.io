// 게임 캔버스 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 게임 상수
const TILE_SIZE = 40;
const CRITICAL_CHANCE = 0.2; // 20%
const CRITICAL_MULTIPLIER = 2;
const ENEMY_LEVEL_SETTINGS = {
    maxLevel: 10,
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
    currentMap: 'STRAIGHT' // 현재 맵 정보 추가
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
        const level = this[`${upgradeType}Level`];
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
        return enemies
            .filter(enemy => {
                const dx = (enemy.x - this.x) * TILE_SIZE;
                const dy = (enemy.y - this.y) * TILE_SIZE;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance <= this.range * TILE_SIZE;
            })
            .sort((a, b) => {
                // 가장 가까운 적 우선
                const distA = Math.sqrt(Math.pow(a.x - this.x, 2) + Math.pow(a.y - this.y, 2));
                const distB = Math.sqrt(Math.pow(b.x - this.x, 2) + Math.pow(b.y - this.y, 2));
                return distA - distB;
            })[0];
    }

    // 공격 실행 함수
    executeAttack(target) {
        const isCritical = Math.random() < CRITICAL_CHANCE;
        const damage = isCritical ? this.damage * CRITICAL_MULTIPLIER : this.damage;
        
        target.lastDamage = { amount: damage, isCritical };
        playSound('tower_attack');

        switch(this.type) {
            case 'BASIC':
                target.health -= damage;
                break;
            case 'ICE':
                target.health -= damage;
                target.applyStatusEffect('FROZEN', this.freezeDuration);
                break;
            case 'POISON':
                target.health -= damage;
                target.poisonDamage = this.poisonDamage;
                target.poisonDuration = this.poisonDuration;
                break;
            case 'LASER':
                target.health -= damage;
                target.continuousDamage = this.continuousDamage;
                break;
            case 'SPLASH':
                this.executeSplashAttack(target, damage);
                break;
            case 'SUPPORT':
                this.executeSupportBuff();
                break;
        }

        showDamageNumber(target.x, target.y, damage, isCritical);
    }

    // 스플래시 공격 실행 함수
    executeSplashAttack(mainTarget, damage) {
        mainTarget.health -= damage;
        mainTarget.applyStatusEffect('SLOWED', this.slowEffect);

        // 범위 내 다른 적들도 데미지
        enemies.forEach(enemy => {
            if (enemy === mainTarget) return;
            
            const dx = (enemy.x - mainTarget.x) * TILE_SIZE;
            const dy = (enemy.y - mainTarget.y) * TILE_SIZE;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.splashRadius * TILE_SIZE) {
                enemy.health -= damage * 0.5;
                enemy.applyStatusEffect('SLOWED', this.slowEffect);
            }
        });
    }

    // 지원 버프 실행 함수
    executeSupportBuff() {
        towers.forEach(tower => {
            if (tower === this) return;
            
            const dx = tower.x - this.x;
            const dy = tower.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.buffRange) {
                if (!this.buffedTowers.has(tower)) {
                    tower.damage *= this.buffMultiplier;
                    this.buffedTowers.add(tower);
                }
            } else if (this.buffedTowers.has(tower)) {
                tower.damage /= this.buffMultiplier;
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
            this.range += 0.5;
            if (this.splashRadius) this.splashRadius += 0.5;
            this.maxCooldown = Math.max(10, this.maxCooldown * 0.8);
            
            // 특수 능력 강화
            if (this.type === 'LASER') {
                this.continuousDamage = Math.floor(this.damage * 0.2);
            }
            
            // 레벨업 이펙트
            showUpgradeEffect(this.x, this.y);
            playSound('powerup');
        }
    }

    update() {
        if (this.specialCooldown > 0) {
            this.specialCooldown--;
        }
    }

    draw() {
        // 타워 기본 모양 그리기
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.x * TILE_SIZE + 5,
            this.y * TILE_SIZE + 5,
            TILE_SIZE - 10,
            TILE_SIZE - 10
        );
        
        // 타워 레벨 표시
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            this.level.toString(),
            this.x * TILE_SIZE + TILE_SIZE/2,
            this.y * TILE_SIZE + TILE_SIZE/2 + 4
        );
        
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
        ctx.lineWidth = 3;
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
        
        gradient.addColorStop(0, rgbaColor);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
            this.x * TILE_SIZE + TILE_SIZE/2,
            this.y * TILE_SIZE + TILE_SIZE/2,
            this.range * TILE_SIZE,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // 범위 테두리
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(
            this.x * TILE_SIZE + TILE_SIZE/2,
            this.y * TILE_SIZE + TILE_SIZE/2,
            this.range * TILE_SIZE,
            0,
            Math.PI * 2
        );
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // 쿨다운 표시
        if (this.cooldown > 0) {
            const cooldownPercentage = this.cooldown / this.maxCooldown;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(
                this.x * TILE_SIZE + 5,
                this.y * TILE_SIZE + 5,
                (TILE_SIZE - 10) * cooldownPercentage,
                TILE_SIZE - 10
            );
        }

        // 특수 능력 쿨다운 표시
        if (this.specialCooldown > 0) {
            const cooldownPercentage = this.specialCooldown / this.special.cooldown;
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(
                this.x * TILE_SIZE + 5,
                this.y * TILE_SIZE + TILE_SIZE - 10,
                (TILE_SIZE - 10) * cooldownPercentage,
                5
            );
        }
    }

    // 판매 가격 계산
    getSellValue() {
        const totalUpgradeCost = 
            this.getUpgradeCost('range') +
            this.getUpgradeCost('damage') +
            this.getUpgradeCost('speed') +
            this.getUpgradeCost('bullet');
        return Math.floor(totalUpgradeCost * 0.7);
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
} // ← class Tower 끝에 중괄호 추가

// 이제 class Enemy를 전역에 선언
class Enemy {
    constructor(wave, isBoss = false) {
        this.pathIndex = 0;
        this.x = currentMap.path[0].x;
        this.y = currentMap.path[0].y;
        
        // 레벨 시스템 초기화
        this.level = this.calculateInitialLevel(wave);
        this.levelUpCount = 0;
        
        // 적 유형 선택
        if (!isBoss) {
            const enemyTypes = Object.keys(ENEMY_TYPES);
            const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const enemyType = ENEMY_TYPES[randomType];
            
            this.type = randomType;
            this.name = `${enemyType.name} Lv.${this.level}`;
            this.baseSpeed = enemyType.speed;
            this.speed = this.calculateLeveledSpeed(this.baseSpeed);
            this.health = this.calculateLeveledHealth(enemyType.health * (1 + (wave * 0.1)));
            this.maxHealth = this.health;
            this.reward = Math.floor(this.calculateLeveledReward(enemyType.reward * (1 + (wave * 0.1))));
            this.color = enemyType.color;
            this.experienceValue = Math.floor(this.calculateLeveledExperience(enemyType.experienceValue));
        } else {
            const bossType = Object.keys(BOSS_TYPES)[Math.floor(Math.random() * Object.keys(BOSS_TYPES).length)];
            const boss = BOSS_TYPES[bossType];
            this.type = 'BOSS';
            this.name = `${boss.name} Lv.${this.level}`;
            this.health = this.calculateLeveledHealth(boss.health);
            this.maxHealth = this.health;
            this.speed = this.calculateLeveledSpeed(boss.speed);
            this.reward = Math.floor(this.calculateLeveledReward(boss.reward));
            this.color = boss.color;
            this.ability = boss.ability;
            this.abilityCooldown = 0;
            this.pattern = BOSS_PATTERNS[bossType];
            gameState.bossKilled = false;
            playSound('bossSpawn');
        }

        // 상태 효과 관련 속성
        this.statusEffects = new Map();
        this.continuousDamage = 0;
        this.defense = 0;
        this.isInvincible = false;
        this.patternCooldown = 0;
        this.healCooldown = 0;

        // AI 패턴 초기화
        if (!isBoss) {
            const patterns = Object.keys(ENEMY_PATTERNS);
            const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
            this.pattern = ENEMY_PATTERNS[randomPattern];
            this.name = `${this.name} (${this.pattern.name})`;
        }

        // 적 스킬 정의
        const ENEMY_SKILLS = {
            SHIELD: {
                name: '방어막',
                cooldown: 300, // 5초
                effect: function(enemy) {
                    enemy.isInvincible = true;
                    showSkillEffect(enemy.x, enemy.y, '방어막');
                    setTimeout(() => {
                        enemy.isInvincible = false;
                    }, 2000); // 2초간 무적
                }
            },
            TELEPORT: {
                name: '순간이동',
                cooldown: 400,
                effect: function(enemy) {
                    if (enemy.pathIndex + 3 < currentMap.path.length - 1) {
                        enemy.pathIndex += 3;
                        const target = currentMap.path[enemy.pathIndex];
                        enemy.x = target.x;
                        enemy.y = target.y;
                        showSkillEffect(enemy.x, enemy.y, '순간이동');
                    }
                }
            },
            HEAL_SELF: {
                name: '자가회복',
                cooldown: 350,
                effect: function(enemy) {
                    const heal = Math.floor(enemy.maxHealth * 0.3);
                    enemy.health = Math.min(enemy.maxHealth, enemy.health + heal);
                    showSkillEffect(enemy.x, enemy.y, '자가회복');
                }
            },
            HEAL_AOE: {
                name: '광역 힐',
                cooldown: 500,
                effect: function(enemy) {
                    enemies.forEach(e => {
                        if (e !== enemy && Math.abs(e.x - enemy.x) < 2 && Math.abs(e.y - enemy.y) < 2) {
                            e.health = Math.min(e.maxHealth, e.health + Math.floor(e.maxHealth * 0.2));
                            showSkillEffect(e.x, e.y, '힐');
                        }
                    });
                    showSkillEffect(enemy.x, enemy.y, '광역힐');
                }
            }
        };

        // Enemy 생성자 내 (보스/특수 적에 스킬 부여 예시)
        // 예시: 탱커는 방어막, 보스는 순간이동, 힐러는 광역힐
        if (this.type === 'TANK') {
            this.skill = ENEMY_SKILLS.SHIELD;
            this.skillCooldown = this.skill.cooldown;
        } else if (this.type === 'BOSS') {
            this.skill = ENEMY_SKILLS.TELEPORT;
            this.skillCooldown = this.skill.cooldown;
        } else if (this.type === 'HEALER') {
            this.skill = ENEMY_SKILLS.HEAL_AOE;
            this.skillCooldown = this.skill.cooldown;
        } else {
            this.skill = null;
            this.skillCooldown = 0;
        }
    }

    calculateInitialLevel(wave) {
        // 웨이브에 따라 초기 레벨 계산
        const baseLevel = Math.floor(wave / 2);
        const randomBonus = Math.random() < 0.3 ? 1 : 0; // 30% 확률로 추가 레벨
        return Math.min(baseLevel + randomBonus, ENEMY_LEVEL_SETTINGS.maxLevel);
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
            showLevelUpEffect(this.x, this.y);
            return true;
        }
        return false;
    }

    applyStatusEffect(effectType, duration) {
        const effect = STATUS_EFFECTS[effectType];
        if (!effect) return;

        this.statusEffects.set(effectType, {
            duration: duration || effect.duration,
            remaining: duration || effect.duration
        });

        // 효과 적용
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

    updateStatusEffects() {
        for (const [effectType, effect] of this.statusEffects) {
            effect.remaining--;
            
            if (effect.remaining <= 0) {
                // 효과 제거
                switch(effectType) {
                    case 'FROZEN':
                        this.speed = this.baseSpeed;
                        break;
                    case 'POISON':
                    case 'BURNING':
                        this.continuousDamage -= STATUS_EFFECTS[effectType].damagePerTick;
                        break;
                }
                this.statusEffects.delete(effectType);
            }
        }
    }

    healNearbyEnemies() {
        if (this.type === 'HEALER' && this.healCooldown <= 0) {
            enemies.forEach(enemy => {
                if (enemy !== this) {
                    const dx = (enemy.x - this.x) * TILE_SIZE;
                    const dy = (enemy.y - this.y) * TILE_SIZE;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance <= ENEMY_TYPES.HEALER.healRange * TILE_SIZE) {
                        enemy.health = Math.min(enemy.maxHealth, enemy.health + ENEMY_TYPES.HEALER.healAmount);
                        showHealEffect(enemy.x, enemy.y);
                    }
                }
            });
            this.healCooldown = 60; // 1초 쿨다운
        }
        if (this.healCooldown > 0) this.healCooldown--;
    }

    update() {
        // 상태 효과 업데이트
        this.updateStatusEffects();
        
        // 레벨업 시도
        this.tryLevelUp();
        
        // 지속 데미지 적용
        if (this.continuousDamage > 0) {
            const damage = Math.floor(this.continuousDamage);
            this.health -= damage;
            this.continuousDamage = Math.max(0, this.continuousDamage * 0.95);
        }

        // 경로 종료 체크
        if (this.pathIndex >= currentMap.path.length - 1) {
            gameState.lives--;
            return true;
        }

        // 사망 체크
        if (this.health <= 0) {
            if (!this.isInvincible) {
                gainExperience(this.experienceValue);
                
                // 타워 경험치 획득
                towers.forEach(tower => {
                    const dx = (this.x - tower.x) * TILE_SIZE;
                    const dy = (this.y - tower.y) * TILE_SIZE;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance <= tower.range * TILE_SIZE) {
                        tower.gainExperience(this.experienceValue / 2);
                    }
                });
                
                gameState.gold += this.reward * (gameState.goldMultiplier || 1);
                gameStats.totalGold += this.reward * (gameState.goldMultiplier || 1);
                gameStats.enemiesKilled++;
                // 크리티컬로 처치 시 점수 2배, 보스는 3배
                let scoreToAdd = this.reward;
                if (this.lastDamage && this.lastDamage.isCritical) {
                    scoreToAdd *= 2;
                }
                if (this.type === 'BOSS') {
                    scoreToAdd = this.reward * 3;
                    gameStats.bossesKilled++;
                    gameState.bossKilled = true;
                }
                gameState.score += scoreToAdd;
                playSound('enemy_death');
                updateStats();
            }
            return true;
        }

        // AI 패턴 업데이트
        if (this.pattern && this.pattern.update) {
            const shouldRemove = this.pattern.update(this);
            if (shouldRemove) return true;
        }

        // 치유사 능력 사용
        this.healNearbyEnemies();

        // 보스 패턴 사용
        if (this.type === 'BOSS' && this.patternCooldown <= 0) {
            this.pattern.effect(this);
            this.patternCooldown = this.pattern.cooldown;
            showBossPatternEffect(this.x, this.y, this.pattern.name);
        }
        if (this.patternCooldown > 0) this.patternCooldown--;

        // Enemy update() 내 추가
        if (this.skill && this.skillCooldown > 0) {
            this.skillCooldown--;
        }
        if (this.skill && this.skillCooldown === 0) {
            this.skill.effect(this);
            this.skillCooldown = this.skill.cooldown;
        }

        // 그룹 버프 적용
        applyGroupBuffs();
        if (this.groupSpeedBuff) this.speed = this.baseSpeed * this.groupSpeedBuff;
        if (this.groupDefenseBuff) this.defense = 10 * this.groupDefenseBuff; // 예시: 방어력 10 기준

        // 스킬 발동 예고
        if (this.skill && this.skillCooldown === 30) { // 0.5초 전에 경고
            showSkillWarning(this.x, this.y, this.skill.name);
        }

        return false;
    }

    draw() {
        // 적 기본 모양
        ctx.save();
        let baseColor = this.color;
        // 상태이상별 색상 오버레이 및 오라
        let statusIcons = [];
        if (this.statusEffects.has('POISON')) {
            baseColor = 'limegreen';
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(
                this.x * TILE_SIZE + TILE_SIZE / 2 + Math.sin(Date.now()/100)*6,
                this.y * TILE_SIZE + TILE_SIZE / 2 + Math.cos(Date.now()/120)*6,
                8 + Math.sin(Date.now()/200)*2,
                0, Math.PI * 2
            );
            ctx.fillStyle = 'rgba(0,255,0,0.2)';
            ctx.fill();
            ctx.globalAlpha = 1.0;
            statusIcons.push('🟢');
        }
        if (this.statusEffects.has('FROZEN')) {
            baseColor = 'deepskyblue';
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(
                this.x * TILE_SIZE + TILE_SIZE / 2,
                this.y * TILE_SIZE + TILE_SIZE / 2,
                TILE_SIZE/2 + Math.sin(Date.now()/150)*2,
                0, Math.PI * 2
            );
            ctx.fillStyle = 'rgba(0,200,255,0.18)';
            ctx.fill();
            ctx.globalAlpha = 1.0;
            statusIcons.push('❄️');
        }
        if (this.statusEffects.has('BURNING')) {
            baseColor = 'orangered';
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(
                this.x * TILE_SIZE + TILE_SIZE / 2 + Math.sin(Date.now()/80)*4,
                this.y * TILE_SIZE + TILE_SIZE / 2 - 8 + Math.cos(Date.now()/60)*2,
                7 + Math.sin(Date.now()/100)*2,
                0, Math.PI * 2
            );
            ctx.fillStyle = 'rgba(255,80,0,0.18)';
            ctx.fill();
            ctx.globalAlpha = 1.0;
            statusIcons.push('🔥');
        }
        ctx.fillStyle = baseColor;
        ctx.fillRect(
            this.x * TILE_SIZE + 5,
            this.y * TILE_SIZE + 5,
            TILE_SIZE - 10,
            TILE_SIZE - 10
        );
        // 그룹 버프 오라
        if (this.groupSpeedBuff && this.groupSpeedBuff > 1.01) {
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(
                this.x * TILE_SIZE + TILE_SIZE / 2,
                this.y * TILE_SIZE + TILE_SIZE / 2,
                TILE_SIZE/2 + 10 + Math.sin(Date.now()/100)*2,
                0, Math.PI * 2
            );
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }
        if (this.groupDefenseBuff && this.groupDefenseBuff > 1.01) {
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(
                this.x * TILE_SIZE + TILE_SIZE / 2,
                this.y * TILE_SIZE + TILE_SIZE / 2,
                TILE_SIZE/2 + 14 + Math.sin(Date.now()/120)*2,
                0, Math.PI * 2
            );
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }
        // 방어막(무적) 오라
        if (this.isInvincible) {
            ctx.save();
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(
                this.x * TILE_SIZE + TILE_SIZE / 2,
                this.y * TILE_SIZE + TILE_SIZE / 2,
                TILE_SIZE/2 + 6 + Math.sin(Date.now()/120)*2,
                0, Math.PI * 2
            );
            ctx.strokeStyle = '#00eaff';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
        }
        // 그룹 색상 테두리
        if (this.groupColor) {
            ctx.strokeStyle = this.groupColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(
                this.x * TILE_SIZE + 5,
                this.y * TILE_SIZE + 5,
                TILE_SIZE - 10,
                TILE_SIZE - 10
            );
        }
        // 보스/특수 적 강조 오라
        if (this.type === 'BOSS') {
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(
                this.x * TILE_SIZE + TILE_SIZE / 2,
                this.y * TILE_SIZE + TILE_SIZE / 2,
                TILE_SIZE/2 + 18 + Math.sin(Date.now()/80)*3,
                0, Math.PI * 2
            );
            ctx.strokeStyle = '#ff00ff';
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }
        ctx.restore();
        // 상태이상/스킬/쿨다운 아이콘 표시
        if (statusIcons.length > 0 || (this.skill && this.skillCooldown > 0)) {
            ctx.save();
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            let icons = statusIcons.join(' ');
            if (this.skill && this.skillCooldown > 0) {
                icons += ' ⏳';
            }
            ctx.fillStyle = '#fff';
            ctx.fillText(
                icons,
                this.x * TILE_SIZE + TILE_SIZE / 2,
                this.y * TILE_SIZE - 18
            );
            ctx.restore();
        }

        // 레벨 표시
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            `Lv.${this.level}`,
            this.x * TILE_SIZE + TILE_SIZE / 2,
            this.y * TILE_SIZE + TILE_SIZE / 2
        );

        // 체력바
        const healthBarWidth = TILE_SIZE - 10;
        const healthBarHeight = 5;
        const healthPercentage = this.health / this.maxHealth;
        
        ctx.fillStyle = 'red';
        ctx.fillRect(
            this.x * TILE_SIZE + 5,
            this.y * TILE_SIZE,
            healthBarWidth,
            healthBarHeight
        );
        
        ctx.fillStyle = 'green';
        ctx.fillRect(
            this.x * TILE_SIZE + 5,
            this.y * TILE_SIZE,
            healthBarWidth * healthPercentage,
            healthBarHeight
        );

        // 상태 효과 표시
        let effectY = this.y * TILE_SIZE - 15;
        for (const [effectType, effect] of this.statusEffects) {
            const statusEffect = STATUS_EFFECTS[effectType];
            ctx.fillStyle = statusEffect.color;
            ctx.fillRect(
                this.x * TILE_SIZE + 5,
                effectY,
                (TILE_SIZE - 10) * (effect.remaining / effect.duration),
                3
            );
            effectY -= 5;
        }

        // 이름 표시
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(
            this.name,
            this.x * TILE_SIZE,
            this.y * TILE_SIZE - 5
        );

        // 크리티컬 데미지 표시
        if (this.lastDamage && this.lastDamage.isCritical) {
            showDamageNumber(this.x, this.y, this.lastDamage.amount, true);
            this.lastDamage = null;
        }
    }
}

// 게임 시작 시 튜토리얼 표시
function showTutorial() {
    document.getElementById('tutorial').style.display = 'block';
}

// 카운트다운 상태 변수 추가
let isCountdownActive = false;

// 카운트다운 표시
function showCountdown() {
    if (isCountdownActive) return; // 이미 카운트다운이 진행 중이면 중단
    
    isCountdownActive = true;
    const countdown = document.getElementById('countdown');
    if (!countdown) {
        console.error('카운트다운 요소를 찾을 수 없습니다.');
        isCountdownActive = false;
        startWave();
        return;
    }
    
    countdown.style.display = 'block';
    countdown.textContent = ''; // 카운트다운 시작 시 텍스트 초기화
    let count = 3;
    
    const interval = setInterval(() => {
        if (count > 0) {
            countdown.textContent = count;
            count--;
        } else {
            countdown.style.display = 'none';
            countdown.textContent = ''; // 카운트다운 종료 시 텍스트 초기화
            clearInterval(interval);
            isCountdownActive = false;
            startWave();
        }
    }, 1000);
}

// 게임 오버 화면 표시
function showGameOver() {
    const gameOver = document.getElementById('gameOver');
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalWave').textContent = gameState.wave;
    gameOver.style.display = 'block';
}

// 게임 재시작
function restartGame() {
    gameState.gold = DIFFICULTY_SETTINGS[gameState.difficulty].gold;
    gameState.lives = DIFFICULTY_SETTINGS[gameState.difficulty].lives;
    gameState.wave = 1;
    gameState.isGameOver = false;
    gameState.waveInProgress = false;
    gameState.enemiesRemaining = 0;
    gameState.isPaused = false;
    gameState.score = 0;
    towers = [];
    enemies = [];
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('tutorial').style.display = 'none';
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

// 타워 설치/업그레이드 이펙트
function showTowerEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'tower-effect';
    
    // 타워 중심을 기준으로 계산
    const centerX = x * TILE_SIZE + TILE_SIZE/2;
    const centerY = y * TILE_SIZE + TILE_SIZE/2;
    
    effect.style.left = `${centerX - TILE_SIZE/2}px`;
    effect.style.top = `${centerY - TILE_SIZE/2}px`;
    effect.style.width = `${TILE_SIZE}px`;
    effect.style.height = `${TILE_SIZE}px`;
    
    document.querySelector('.game-area').appendChild(effect);
    
    // 애니메이션 종료 후 제거
    effect.addEventListener('animationend', () => {
        effect.remove();
    });
}

// 타워 업그레이드 이펙트
function showUpgradeEffect(x, y) {
    // 업그레이드 이펙트 생성
    const effect = document.createElement('div');
    effect.className = 'upgrade-effect';
    
    // 타워 중심을 기준으로 계산
    const centerX = x * TILE_SIZE + TILE_SIZE/2;
    const centerY = y * TILE_SIZE + TILE_SIZE/2;
    
    effect.style.left = `${centerX}px`;
    effect.style.top = `${centerY}px`;
    
    // 이펙트 내용
    effect.innerHTML = `
        <div class="upgrade-ring"></div>
        <div class="upgrade-particles">
            ${Array(8).fill().map(() => '<div class="particle"></div>').join('')}
        </div>
        <div class="upgrade-text">업그레이드!</div>
    `;
    
    document.querySelector('.game-area').appendChild(effect);
    
    // 사운드 재생
    playSound('upgrade');
    
    // 애니메이션 종료 후 제거
    effect.addEventListener('animationend', () => {
        effect.remove();
    });
}

// 게임 시작 버튼 이벤트 수정
document.getElementById('startBtn').addEventListener('click', () => {
    if (!gameState.isStarted) {
        gameState.isStarted = true;
        document.getElementById('startBtn').textContent = '재시작';
        document.getElementById('tutorial').style.display = 'none';
        document.getElementById('waveStartButton').style.display = 'block';
        
        // 게임 시작 시 배경음악 재생
        if (musicEnabled) {
            sounds.bgm.loop = true;
            sounds.bgm.play().catch(error => console.log('BGM 재생 실패:', error));
        }
    } else {
        restartGame();
    }
});

// 웨이브 시작 함수 수정
function startWave() {
    if (gameState.waveInProgress) return;
    
    gameState.waveInProgress = true;
    let groupSize = 3 + Math.floor(Math.random() * 3); // 3~5마리 그룹
    let totalEnemies = 10 + (gameState.wave * 2);
    let groupsToSpawn = Math.ceil(totalEnemies / groupSize);
    gameState.enemiesRemaining = totalEnemies;
    enemyGroups = [];
    
    // 20% 확률로 특수 이벤트 발생
    if (Math.random() < 0.2) {
        triggerSpecialEvent();
    }
    
    for (let i = 0; i < groupsToSpawn; i++) {
        const group = new EnemyGroup(groupIdCounter++, groupSize);
        for (let j = 0; j < groupSize && gameState.enemiesRemaining > 0; j++) {
            const enemy = new Enemy(gameState.wave);
            group.add(enemy);
            enemies.push(enemy);
            gameState.enemiesRemaining--;
        }
        enemyGroups.push(group);
    }
    
    // 보스 웨이브는 기존대로
    if (gameState.wave % gameState.bossWave === 0) {
        gameState.enemiesRemaining = 1;
        enemies.push(new Enemy(gameState.wave, true));
    }
    
    showWaveStartEffect();
    playSound('wave_start');
}

// 웨이브 시작 이펙트
function showWaveStartEffect() {
    const effect = document.createElement('div');
    effect.className = 'wave-start-effect';
    effect.innerHTML = `
        <h2>웨이브 ${gameState.wave} 시작!</h2>
        <p>적의 수: ${gameState.enemiesRemaining}</p>
    `;
    document.body.appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 2000);
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

// 웨이브 진행 상황 업데이트
function updateWaveProgress() {
    const progress = document.getElementById('waveProgress');
    const fill = progress.querySelector('.fill');
    let text = progress.querySelector('.progress-text');
    const total = gameState.enemiesRemaining + enemies.length;
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

// 보상 팝업 표시
function showRewardPopup(amount) {
    // 기존 팝업이 있다면 제거
    const existingPopup = document.getElementById('rewardPopup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // 새로운 팝업 생성
    const popup = document.createElement('div');
    popup.id = 'rewardPopup';
    popup.className = 'reward-popup';
    
    // 팝업 내용 설정
    popup.innerHTML = `
        <div class="reward-content">
            <h3>웨이브 완료!</h3>
            <p>보상: <span class="gold-amount">${amount}</span> 골드</p>
        </div>
    `;
    
    // 팝업을 body에 추가
    document.body.appendChild(popup);
    
    // 3초 후 팝업 제거
    setTimeout(() => {
        popup.remove();
    }, 3000);
}

// 골드 부족 메시지 표시
function showInsufficientGold() {
    const message = document.getElementById('insufficientGold');
    message.style.display = 'block';
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 1000);
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
    if (gameState.isGameOver || !gameState.isStarted || gameState.isPaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

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
    if (!gameState.waveInProgress) {
        showPlaceablePositions();
    }

    // 타워 그리기 및 공격
    towers.forEach(tower => {
        tower.draw();
        tower.attack(enemies);
    });

    // 적 업데이트 및 그리기
    enemies = enemies.filter(enemy => {
        enemy.draw();
        return !enemy.update();
    });

    // 새로운 적 생성
    if (gameState.waveInProgress && gameState.enemiesRemaining > 0 && 
        Math.random() < DIFFICULTY_SETTINGS[gameState.difficulty].enemySpawnRate) {
        enemies.push(new Enemy(gameState.wave));
        gameState.enemiesRemaining--;
    }

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

// 업적 표시
function showAchievement(name) {
    const achievement = document.getElementById('achievement');
    if (achievement) {
        achievement.textContent = `업적 달성: ${name}!`;
        achievement.style.display = 'block';
        setTimeout(() => {
            achievement.style.display = 'none';
        }, 3000);
    }
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

// 타워 설치 메뉴 표시 함수 수정
function showTowerBuildMenu(x, y, clientX, clientY) {
    if (gameState.towerCount >= gameState.maxTowers) {
        showSaveLoadNotification('타워 설치 한도에 도달했습니다!');
        return;
    }
    
    const existingMenu = document.querySelector('.tower-build-menu');
    if (existingMenu && existingMenu.parentNode) {
        existingMenu.parentNode.removeChild(existingMenu);
    }

    const towerMenu = document.createElement('div');
    towerMenu.className = 'tower-build-menu';

    const header = document.createElement('div');
    header.className = 'tower-build-header';
    header.innerHTML = `
        <h2>타워 설치</h2>
        <p>골드: ${gameState.gold}</p>
    `;
    towerMenu.appendChild(header);

    const towerList = document.createElement('div');
    towerList.className = 'tower-list';

    Object.entries(TOWER_TYPES).forEach(([type, tower]) => {
        const card = document.createElement('div');
        card.className = `tower-card ${gameState.gold < tower.cost ? 'disabled' : ''}`;
        
        card.innerHTML = `
            <div class="tower-card-header">
                <div class="tower-icon" style="background: ${tower.color}">${type[0]}</div>
                <div class="tower-name">${tower.name}</div>
            </div>
            <div class="tower-cost">${tower.cost} 골드</div>
            <div class="tower-stats">
                <div class="tower-stat">
                    <span class="tower-stat-label">공격력</span>
                    <span class="tower-stat-value">${tower.damage}</span>
                </div>
                <div class="tower-stat">
                    <span class="tower-stat-label">범위</span>
                    <span class="tower-stat-value">${tower.range}</span>
                </div>
                <div class="tower-stat">
                    <span class="tower-stat-label">쿨다운</span>
                    <span class="tower-stat-value">${(tower.cooldown/60).toFixed(2)}초</span>
                </div>
            </div>
            <div class="tower-description">${getSpecialDescription(type)}</div>
        `;

            if (gameState.gold >= tower.cost) {
            card.onmouseover = () => showTowerRangePreview(x, y, tower.range, type);
            card.onmouseout = hideTowerRangePreview;
            
            card.onclick = () => {
                towers.push(new Tower(x, y, type));
                gameState.gold -= tower.cost;
                gameState.towerCount++;
                updateTowerLimit();
                playSound('tower_place');
                if (towerMenu.parentNode) {
                    towerMenu.parentNode.removeChild(towerMenu);
                }
                const highlight = document.querySelector('.grid-highlight');
                if (highlight) highlight.remove();
            };
        }
        
        towerList.appendChild(card);
    });

    towerMenu.appendChild(towerList);
    document.body.appendChild(towerMenu);
    setupMenuCloseHandler(towerMenu);
}

// 타워 업그레이드 메뉴 표시 함수 수정
function showTowerUpgradeMenu(tower, clientX, clientY) {
    const menu = document.createElement('div');
    menu.className = 'tower-upgrade-menu';
    
    // 메뉴 위치 계산 (화면 밖으로 나가지 않도록)
    const menuWidth = 280;
    const menuHeight = 400;
    const padding = 20;
    
    let left = clientX;
    let top = clientY;
    
    // 오른쪽으로 넘치면 왼쪽에 표시
    if (left + menuWidth > window.innerWidth) {
        left = window.innerWidth - menuWidth - padding;
    }
    
    // 아래로 넘치면 위에 표시
    if (top + menuHeight > window.innerHeight) {
        top = window.innerHeight - menuHeight - padding;
    }
    
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    
    // 타워 정보 헤더
    const header = document.createElement('div');
    header.className = 'upgrade-header';
    header.innerHTML = `
        <h3>${TOWER_TYPES[tower.type].name} Lv.${tower.level}</h3>
        <div class="tower-stats">
            <div class="stat">
                <span class="stat-icon">⚔️</span>
                <span class="stat-value">${tower.damage}</span>
            </div>
            <div class="stat">
                <span class="stat-icon">🎯</span>
                <span class="stat-value">${tower.range}</span>
            </div>
            <div class="stat">
                <span class="stat-icon">⚡</span>
                <span class="stat-value">${tower.attackSpeed.toFixed(1)}</span>
            </div>
        </div>
    `;
    menu.appendChild(header);
    
    // 업그레이드 옵션들
    const upgradeTypes = ['damage', 'range', 'speed'];
    const upgradeIcons = ['⚔️', '🎯', '⚡'];
    const upgradeNames = ['공격력', '사거리', '공격속도'];
    
    upgradeTypes.forEach((type, index) => {
        const cost = tower.getUpgradeCost(type);
        const canUpgrade = tower.canUpgrade(type);
        
        const option = document.createElement('div');
        option.className = `upgrade-option ${canUpgrade ? '' : 'disabled'}`;
        
        const currentValue = type === 'speed' ? 
            tower.attackSpeed.toFixed(1) : 
            tower[type];
        
        const nextValue = type === 'speed' ? 
            (tower.attackSpeed * 1.2).toFixed(1) : 
            Math.floor(tower[type] * 1.2);
        
        option.innerHTML = `
            <div class="upgrade-info">
                <span class="upgrade-icon">${upgradeIcons[index]}</span>
                <div class="upgrade-details">
                    <span class="upgrade-name">${upgradeNames[index]}</span>
                    <div class="upgrade-values">
                        <span class="current-value">${currentValue}</span>
                        <span class="arrow">→</span>
                        <span class="next-value">${nextValue}</span>
                    </div>
                </div>
            </div>
            <div class="upgrade-cost ${canUpgrade ? '' : 'insufficient'}">
                <span class="cost-icon">💰</span>
                <span class="cost-value">${cost}</span>
            </div>
        `;
        
        if (canUpgrade) {
            option.addEventListener('click', () => {
                tower.upgrade(type);
                showUpgradeEffect(tower.x, tower.y);
                updateInfoBar();
                menu.remove();
            });
        }
        
        menu.appendChild(option);
    });
    
    // 특수능력 업그레이드 (레벨 3 이상)
    if (tower.level >= 3) {
        const specialOption = document.createElement('div');
        specialOption.className = 'upgrade-option special';
        
        const specialCost = tower.getUpgradeCost('special');
        const canUpgradeSpecial = tower.canUpgrade('special');
        
        specialOption.innerHTML = `
            <div class="upgrade-info">
                <span class="upgrade-icon">✨</span>
                <div class="upgrade-details">
                    <span class="upgrade-name">특수능력 강화</span>
                    <div class="upgrade-description">
                        ${getSpecialDescription(tower.type)}
                    </div>
                </div>
            </div>
            <div class="upgrade-cost ${canUpgradeSpecial ? '' : 'insufficient'}">
                <span class="cost-icon">💰</span>
                <span class="cost-value">${specialCost}</span>
            </div>
        `;
        
        if (canUpgradeSpecial) {
            specialOption.addEventListener('click', () => {
                tower.upgrade('special');
                showUpgradeEffect(tower.x, tower.y);
                updateInfoBar();
                menu.remove();
            });
        }
        
        menu.appendChild(specialOption);
    }
    
    // 판매 버튼
    const sellButton = document.createElement('button');
    sellButton.className = 'sell-button';
    sellButton.innerHTML = `
        <span class="sell-icon">💎</span>
        <span class="sell-text">판매</span>
        <span class="sell-value">+${tower.getSellValue()}</span>
    `;
    
    sellButton.addEventListener('click', () => {
        const sellValue = tower.getSellValue();
        gold += sellValue;
        showRewardPopup(sellValue);
        towers = towers.filter(t => t !== tower);
        updateInfoBar();
        menu.remove();
    });
    
    menu.appendChild(sellButton);
    document.body.appendChild(menu);
    
    // 메뉴 외부 클릭 시 닫기
    setupMenuCloseHandler(menu);
}

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

// 데미지 숫자 표시 함수
function showDamageNumber(x, y, damage, isCritical = false) {
    const damageText = document.createElement('div');
    damageText.className = 'damage-number';
    if (isCritical) damageText.classList.add('critical');
    
    // 타워 중심을 기준으로 계산
    const centerX = x * TILE_SIZE + TILE_SIZE/2;
    const centerY = y * TILE_SIZE + TILE_SIZE/2;
    
    damageText.style.left = `${centerX}px`;
    damageText.style.top = `${centerY}px`;
    damageText.textContent = damage;
    
    document.querySelector('.game-area').appendChild(damageText);
    
    // 애니메이션 종료 후 제거
    damageText.addEventListener('animationend', () => {
        damageText.remove();
    });
}

// 스킬 발동 예고 효과
function showSkillWarning(x, y, skillName) {
    const warning = document.createElement('div');
    warning.className = 'skill-warning';
    warning.textContent = `⚠️ ${skillName}`;
    warning.style.left = `${x * TILE_SIZE + TILE_SIZE/2}px`;
    warning.style.top = `${y * TILE_SIZE - 40}px`;
    document.querySelector('.game-area').appendChild(warning);

    const animation = warning.animate([
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(1.2)', opacity: 0.8 },
        { transform: 'scale(1)', opacity: 1 }
    ], {
        duration: 500,
        iterations: 3,
        easing: 'ease-in-out'
    });

    animation.onfinish = () => warning.remove();
}

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

// 저장/불러오기 알림
function showSaveLoadNotification(message, isError = false) {
    const notification = document.getElementById('saveLoadNotification');
    if (!notification) {
        console.error('알림 요소를 찾을 수 없습니다.');
        return;
    }
    
    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.backgroundColor = isError ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.8)';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
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
            gameState: {
                ...gameState,
                isPaused: true
            },
            towers: towers.map(tower => ({
                x: tower.x,
                y: tower.y,
                type: tower.type,
                level: tower.level,
                experience: tower.experience,
                experienceToNextLevel: tower.experienceToNextLevel
            })),
            achievements: Object.fromEntries(
                Object.entries(ACHIEVEMENTS).map(([key, achievement]) => [key, achievement.unlocked])
            ),
            currentMap: gameState.currentMap,
            timestamp: Date.now()
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
        selectMap(data.currentMap);
        
        // 타워 복원
        towers = data.towers.map(towerData => {
            const tower = new Tower(towerData.x, towerData.y, towerData.type);
            tower.experience = towerData.experience;
            tower.experienceToNextLevel = towerData.experienceToNextLevel;
            for (let i = 1; i < towerData.level; i++) {
                tower.level++;
                tower.damage = Math.floor(tower.damage * 1.5);
                tower.range += 0.5;
                if (tower.splashRadius) tower.splashRadius += 0.5;
            }
            return tower;
        });
        
        // 업적 복원
        Object.entries(data.achievements).forEach(([key, unlocked]) => {
            if (ACHIEVEMENTS[key]) {
                ACHIEVEMENTS[key].unlocked = unlocked;
            }
        });
        
        updateTowerLimit();
        showSaveLoadNotification('게임을 불러왔습니다.');
    } catch (error) {
        console.error('게임 불러오기 실패:', error);
        showSaveLoadNotification(`불러오기 실패: ${error.message}`, true);
    }
}

// 저장 데이터 검증
function validateSaveData(saveData) {
    const requiredFields = ['gameState', 'towers', 'achievements', 'currentMap', 'timestamp'];
    
    // 필수 필드 확인
    for (const field of requiredFields) {
        if (!(field in saveData)) {
            return false;
        }
    }
    
    // 게임 상태 검증
    const gameStateFields = ['gold', 'lives', 'wave', 'isGameOver', 'waveInProgress', 'enemiesRemaining', 'isPaused', 'isStarted', 'score', 'difficulty'];
    for (const field of gameStateFields) {
        if (!(field in saveData.gameState)) {
            return false;
        }
    }
    
    // 타워 데이터 검증
    if (!Array.isArray(saveData.towers)) {
        return false;
    }
    
    for (const tower of saveData.towers) {
        const towerFields = ['x', 'y', 'type', 'level', 'experience', 'experienceToNextLevel'];
        for (const field of towerFields) {
            if (!(field in tower)) {
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
        showLevelUpEffect(levelUpReward);
    }
    
    updateInfoBar();
}

// 레벨업 이펙트
function showLevelUpEffect(reward) {
    const effect = document.createElement('div');
    effect.className = 'level-up-effect';
    effect.innerHTML = `
        <h3>레벨 업!</h3>
        <p>현재 레벨: ${gameState.level}</p>
        <p>보상: +${reward} 골드</p>
    `;
    document.body.appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 3000);
}

// 특수 이벤트 표시
function showEventNotification(message) {
    // 이미 표시된 알림이 있는지 확인
    const existingNotification = document.querySelector('.event-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'event-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// HTML에 이벤트 알림 스타일 추가
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .event-notification {
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: gold;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            animation: fadeInOut 3s ease-in-out;
        }
    </style>
`);

// 특수 효과 표시 함수
function showSpecialEffect(x, y, name) {
    const effect = document.createElement('div');
    effect.className = 'special-effect';
    effect.innerHTML = `
        <div class="special-name">${name}</div>
        <div class="special-animation"></div>
    `;
    effect.style.left = `${x * TILE_SIZE}px`;
    effect.style.top = `${y * TILE_SIZE}px`;
    document.querySelector('.game-area').appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 2000);
}

function showBossPatternEffect(x, y, name) {
    const effect = document.createElement('div');
    effect.className = 'boss-pattern-effect';
    effect.textContent = name;
    effect.style.left = `${x * TILE_SIZE}px`;
    effect.style.top = `${y * TILE_SIZE}px`;
    document.querySelector('.game-area').appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 2000);
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
                    if (!tower.activeCombos) tower.activeCombos = [];
                    tower.activeCombos.push(comboKey);
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

// 게임 통계 업데이트 함수
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

// 보스 패턴 정의
const BOSS_PATTERNS = {
    TANK: {
        name: '방어막',
        cooldown: 300,
        effect: (boss) => {
            boss.isInvincible = true;
            boss.defense = 50;
            setTimeout(() => {
                boss.isInvincible = false;
                boss.defense = 0;
            }, 5000);
        }
    },
    SPEED: {
        name: '돌진',
        cooldown: 200,
        effect: (boss) => {
            const currentIndex = boss.pathIndex;
            if (currentIndex + 3 < currentMap.path.length) {
                boss.x = currentMap.path[currentIndex + 3].x;
                boss.y = currentMap.path[currentIndex + 3].y;
                boss.pathIndex += 3;
            }
        }
    },
    SUMMONER: {
        name: '소환',
        cooldown: 400,
        effect: (boss) => {
            for (let i = 0; i < 3; i++) {
                const enemy = new Enemy(gameState.wave);
                enemy.x = boss.x;
                enemy.y = boss.y;
                enemy.health = 50;
                enemy.maxHealth = 50;
                enemy.speed = 0.03;
                enemies.push(enemy);
            }
        }
    }
};

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
            height: 16px;
            background: linear-gradient(90deg, #232526 0%, #414345 100%);
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
            overflow: hidden;
            margin: 10px 0 18px 0;
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

// 적 유형 정의
const ENEMY_TYPES = {
    NORMAL: {
        name: '일반 적',
        health: 100,
        speed: 0.02,
        reward: 10,
        color: 'red',
        experienceValue: 10
    },
    FAST: {
        name: '빠른 적',
        health: 50,
        speed: 0.04,
        reward: 15,
        color: 'yellow',
        experienceValue: 15
    },
    TANK: {
        name: '탱커',
        health: 300,
        speed: 0.01,
        reward: 20,
        color: 'purple',
        experienceValue: 20
    },
    HEALER: {
        name: '치유사',
        health: 80,
        speed: 0.015,
        reward: 25,
        color: 'green',
        experienceValue: 25,
        healAmount: 10,
        healRange: 2
    }
};

// 상태 효과 정의
const STATUS_EFFECTS = {
    POISON: {
        name: '독',
        duration: 5,
        damagePerTick: 2,
        color: 'green'
    },
    FROZEN: {
        name: '빙결',
        duration: 3,
        speedMultiplier: 0.5,
        color: 'blue'
    },
    BURNING: {
        name: '화상',
        duration: 4,
        damagePerTick: 3,
        color: 'orange'
    }
};

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

// 적 AI 패턴 상수
const ENEMY_PATTERNS = {
    NORMAL: {
        name: '일반',
        description: '기본 경로를 따라 이동',
        update: function(enemy) {
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
        update: function(enemy) {
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
        update: function(enemy) {
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
        update: function(enemy) {
            if (enemy.pathIndex >= currentMap.path.length - 1) {
                gameState.lives--;
                return true;
            }
            if (!enemy.ambushState) {
                enemy.ambushState = 'hiding';
                enemy.ambushTimer = 60;
                enemy.originalSpeed = enemy.speed;
            }
            switch(enemy.ambushState) {
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
        update: function(enemy) {
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

// 적 스킬 정의
const ENEMY_SKILLS = {
    SHIELD: {
        name: '방어막',
        cooldown: 300, // 5초
        effect: function(enemy) {
            enemy.isInvincible = true;
            showSkillEffect(enemy.x, enemy.y, '방어막');
            setTimeout(() => {
                enemy.isInvincible = false;
            }, 2000); // 2초간 무적
        }
    },
    TELEPORT: {
        name: '순간이동',
        cooldown: 400,
        effect: function(enemy) {
            if (enemy.pathIndex + 3 < currentMap.path.length - 1) {
                enemy.pathIndex += 3;
                const target = currentMap.path[enemy.pathIndex];
                enemy.x = target.x;
                enemy.y = target.y;
                showSkillEffect(enemy.x, enemy.y, '순간이동');
            }
        }
    },
    HEAL_SELF: {
        name: '자가회복',
        cooldown: 350,
        effect: function(enemy) {
            const heal = Math.floor(enemy.maxHealth * 0.3);
            enemy.health = Math.min(enemy.maxHealth, enemy.health + heal);
            showSkillEffect(enemy.x, enemy.y, '자가회복');
        }
    },
    HEAL_AOE: {
        name: '광역 힐',
        cooldown: 500,
        effect: function(enemy) {
            enemies.forEach(e => {
                if (e !== enemy && Math.abs(e.x - enemy.x) < 2 && Math.abs(e.y - enemy.y) < 2) {
                    e.health = Math.min(e.maxHealth, e.health + Math.floor(e.maxHealth * 0.2));
                    showSkillEffect(e.x, e.y, '힐');
                }
            });
            showSkillEffect(enemy.x, enemy.y, '광역힐');
        }
    }
};

// 적 스킬 시각 효과
function showSkillEffect(x, y, name) {
    const effect = document.createElement('div');
    effect.className = 'enemy-skill-effect';
    effect.textContent = name;
    effect.style.position = 'absolute';
    effect.style.left = `${x * TILE_SIZE + TILE_SIZE / 2}px`;
    effect.style.top = `${y * TILE_SIZE}px`;
    effect.style.transform = 'translate(-50%, -100%)';
    effect.style.color = '#00eaff';
    effect.style.fontWeight = 'bold';
    effect.style.fontSize = '14px';
    effect.style.pointerEvents = 'none';
    effect.style.zIndex = 1000;
    document.querySelector('.game-area').appendChild(effect);
    setTimeout(() => effect.remove(), 1200);
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
        const alive = group.members.filter(e => e.health > 0);
        // 모두 살아있으면 속도 20% 증가
        alive.forEach(e => {
            e.groupSpeedBuff = (alive.length === group.members.length) ? 1.2 : 1.0;
        });
        // 1마리만 남으면 방어력 50% 증가
        alive.forEach(e => {
            e.groupDefenseBuff = (alive.length === 1) ? 1.5 : 1.0;
        });
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
    gameState.gold = DIFFICULTY_SETTINGS[gameState.difficulty].initialGold;
    gameState.lives = DIFFICULTY_SETTINGS[gameState.difficulty].initialLives;
    gameState.wave = 0;
    gameState.score = 0;
    gameState.towers = [];
    gameState.enemies = [];
    gameState.projectiles = [];
    gameState.effects = [];
    gameState.isPaused = false;
    gameState.isGameOver = false;
    gameState.isWaveInProgress = false;
    gameState.towerLimit = DIFFICULTY_SETTINGS[gameState.difficulty].maxTowers;
    gameState.towersPlaced = 0;
    gameState.selectedTower = null;
    gameState.hoveredTile = null;
    gameState.lastFrameTime = performance.now();
    gameState.waveStartTime = 0;
    gameState.waveDuration = 0;
    gameState.waveProgress = 0;
    gameState.enemiesSpawned = 0;
    gameState.enemiesDefeated = 0;
    gameState.totalEnemies = 0;
    gameState.waveReward = 0;

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
    showCountdown();
});

// 특수 이벤트 트리거 함수 추가
function triggerSpecialEvent() {
    const eventKeys = Object.keys(SPECIAL_EVENTS);
    const randomEvent = eventKeys[Math.floor(Math.random() * eventKeys.length)];
    
    // 이미 발생한 이벤트인지 확인
    if (!gameStats.eventsTriggered.includes(randomEvent)) {
        const event = SPECIAL_EVENTS[randomEvent];
        event.effect();
        gameStats.eventsTriggered.push(randomEvent);
        updateStats();
    }
}

// 웨이브 시작 시 특수 이벤트 발생 확률 추가
function startWave() {
    if (gameState.waveInProgress) return;
    
    gameState.waveInProgress = true;
    let groupSize = 3 + Math.floor(Math.random() * 3); // 3~5마리 그룹
    let totalEnemies = 10 + (gameState.wave * 2);
    let groupsToSpawn = Math.ceil(totalEnemies / groupSize);
    gameState.enemiesRemaining = totalEnemies;
    enemyGroups = [];
    
    // 20% 확률로 특수 이벤트 발생
    if (Math.random() < 0.2) {
        triggerSpecialEvent();
    }
    
    for (let i = 0; i < groupsToSpawn; i++) {
        const group = new EnemyGroup(groupIdCounter++, groupSize);
        for (let j = 0; j < groupSize && gameState.enemiesRemaining > 0; j++) {
            const enemy = new Enemy(gameState.wave);
            group.add(enemy);
            enemies.push(enemy);
            gameState.enemiesRemaining--;
        }
        enemyGroups.push(group);
    }
    
    // 보스 웨이브는 기존대로
    if (gameState.wave % gameState.bossWave === 0) {
        gameState.enemiesRemaining = 1;
        enemies.push(new Enemy(gameState.wave, true));
    }
    
    showWaveStartEffect();
    playSound('wave_start');
}

// ... existing code ...

// 게임 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 게임 컨트롤 이벤트
    const pauseBtn = document.getElementById('pauseBtn');
    const helpBtn = document.getElementById('helpBtn');
    const closeHelp = document.getElementById('closeHelp');
    const difficultySelect = document.getElementById('difficultySelect');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const mapSelect = document.getElementById('mapSelect');
    const waveStartButton = document.getElementById('waveStartButton');
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const musicToggleBtn = document.getElementById('musicToggleBtn');

    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            if (gameState.isStarted) {
                gameState.isPaused = !gameState.isPaused;
                pauseBtn.textContent = gameState.isPaused ? '계속하기' : '일시정지';
            }
        });
    }

    if (difficultySelect) {
        difficultySelect.addEventListener('change', (e) => {
            if (!gameState.isStarted) {
                gameState.difficulty = e.target.value;
                const settings = DIFFICULTY_SETTINGS[gameState.difficulty];
                gameState.gold = settings.gold;
                gameState.lives = settings.lives;
                gameState.maxTowers = settings.maxTowers;
                updateTowerLimit();
            }
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveGame();
        });
    }

    if (loadBtn) {
        loadBtn.addEventListener('click', () => {
            loadGame();
        });
    }

    if (mapSelect) {
        mapSelect.addEventListener('change', (e) => {
            if (!gameState.isStarted) {
                selectMap(e.target.value);
                gameState.currentMap = e.target.value;
                drawMinimap();
            }
        });
    }

    if (waveStartButton) {
        waveStartButton.addEventListener('click', () => {
            showCountdown();
        });
    }

    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', function() {
            toggleSound();
            this.classList.toggle('muted');
            this.textContent = soundEnabled ? '🔊 효과음' : '🔇 효과음';
        });
    }

    if (musicToggleBtn) {
        musicToggleBtn.addEventListener('click', function() {
            toggleMusic();
            this.classList.toggle('muted');
            this.textContent = musicEnabled ? '🎵 배경음악' : '🎵 배경음악';
        });
    }

    // 파워업 메뉴 이벤트
    const powerupItems = document.querySelectorAll('.powerup-item');
    if (powerupItems.length > 0) {
        powerupItems.forEach(item => {
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
    }

    // 게임 초기화
    initializeGame();
});

// 이펙트 풀 관리자
const EffectPool = {
    pools: {},
    
    // 풀 초기화
    init(type, count = 10) {
        if (!this.pools[type]) {
            this.pools[type] = [];
            for (let i = 0; i < count; i++) {
                const element = document.createElement('div');
                element.className = `${type}-effect`;
                element.style.display = 'none';
                document.querySelector('.game-area').appendChild(element);
                this.pools[type].push(element);
            }
        }
    },
    
    // 이펙트 가져오기
    get(type) {
        if (!this.pools[type]) {
            this.init(type);
        }
        
        const pool = this.pools[type];
        const element = pool.find(el => el.style.display === 'none');
        
        if (element) {
            return element;
        }
        
        // 풀에 여유가 없으면 새로 생성
        const newElement = document.createElement('div');
        newElement.className = `${type}-effect`;
        document.querySelector('.game-area').appendChild(newElement);
        pool.push(newElement);
        return newElement;
    },
    
    // 이펙트 반환
    release(element) {
        element.style.display = 'none';
        element.className = element.className.split(' ')[0]; // 기본 클래스만 유지
        element.style = ''; // 스타일 초기화
        element.innerHTML = ''; // 내용 초기화
    }
};

// 이펙트 초기화
function initializeEffects() {
    EffectPool.init('attack', 20);
    EffectPool.init('damage', 30);
    EffectPool.init('special', 5);
    EffectPool.init('upgrade', 5);
}

// 공격 이펙트 표시 (최적화)
function showAttackEffect(x, y, targetX, targetY, isCritical = false) {
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
    const damageText = EffectPool.get('damage');
    
    // 랜덤한 회전과 이동
    const rotation = (Math.random() - 0.5) * 30;
    const offsetX = (Math.random() - 0.5) * 20;
    
    damageText.style.cssText = `
        display: block;
        left: ${x * TILE_SIZE + TILE_SIZE/2 + offsetX}px;
        top: ${y * TILE_SIZE + TILE_SIZE/2}px;
        transform: translate(-50%, -50%) rotate(${rotation}deg);
    `;
    
    damageText.className = `damage-number ${isCritical ? 'critical' : ''}`;
    damageText.textContent = damage.toLocaleString();
    
    // 애니메이션 종료 후 풀로 반환
    damageText.addEventListener('animationend', () => {
        EffectPool.release(damageText);
    }, { once: true });
}

// 특수능력 이펙트 표시 (최적화)
function showSpecialEffect(x, y, name) {
    const effect = EffectPool.get('special');
    
    const centerX = x * TILE_SIZE + TILE_SIZE/2;
    const centerY = y * TILE_SIZE + TILE_SIZE/2;
    
    effect.style.cssText = `
        display: block;
        left: ${centerX}px;
        top: ${centerY}px;
    `;
    
    effect.innerHTML = `
        <div class="special-ring"></div>
        <div class="special-particles">
            ${Array(12).fill().map(() => '<div class="particle"></div>').join('')}
        </div>
        <div class="special-text">${name}</div>
    `;
    
    // 사운드 재생
    playSound('special');
    
    // 애니메이션 종료 후 풀로 반환
    effect.addEventListener('animationend', () => {
        EffectPool.release(effect);
    }, { once: true });
}

// 저사양 모드 상태
let lowSpecMode = false;

function applyLowSpecMode(enabled) {
    lowSpecMode = enabled;
    document.body.classList.toggle('low-spec-mode', enabled);
    localStorage.setItem('lowSpecMode', enabled ? '1' : '0');
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

// 이펙트 생성 함수들에서 저사양 모드 분기 추가
function showTowerEffect(x, y) {
    if (lowSpecMode) return;
    // ... 기존 코드 ...
}
function showUpgradeEffect(x, y) {
    if (lowSpecMode) return;
    // ... 기존 코드 ...
}
function showAttackEffect(x, y, targetX, targetY, isCritical = false) {
    if (lowSpecMode) return;
    // ... 기존 코드 ...
}
function showDamageNumber(x, y, damage, isCritical = false) {
    if (lowSpecMode) return;
    // ... 기존 코드 ...
}
function showSpecialEffect(x, y, name) {
    if (lowSpecMode) return;
    // ... 기존 코드 ...
}
function showComboEffect(comboName) {
    if (lowSpecMode) return;
    // ... 기존 코드 ...
}
function showLevelUpEffect(reward) {
    if (lowSpecMode) return;
    // ... 기존 코드 ...
}
function showEventNotification(message) {
    if (lowSpecMode) return;
    // ... 기존 코드 ...
}

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

// 게임 시작 버튼 클릭 이벤트에 추가
const startBtn = document.getElementById('startBtn');
if (startBtn) {
    startBtn.addEventListener('click', () => {
        if (!gameState.isStarted) {
            gameState.isStarted = true;
            updateControlVisibility();
            // 기존 게임 시작 로직은 그대로 유지
        } else {
            // 재시작 로직
            // (원래의 restartGame 함수 등 호출)
            restartGame();
            gameState.isStarted = true; // 재시작 후에도 isStarted는 true 유지
            updateControlVisibility();
        }
    });
}

// 페이지 로드 시 초기 상태 설정
window.addEventListener('DOMContentLoaded', updateControlVisibility);
