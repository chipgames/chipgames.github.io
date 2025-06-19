/**
 * 게임의 전역 변수와 상수를 관리하는 파일
 * 모든 게임 관련 기본 설정과 상태를 포함
 */

// 캔버스 관련 변수
// 게임의 메인 렌더링 컨텍스트를 관리
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 게임 기본 상수
// 게임의 기본적인 수치와 설정값을 정의
const TILE_SIZE = 40;                // 타일의 크기 (픽셀)
const CRITICAL_CHANCE = 0.2;         // 치명타 발생 확률 (20%)
const CRITICAL_MULTIPLIER = 2;       // 치명타 데미지 배율
const GRID_WIDTH = canvas.width / TILE_SIZE;    // 그리드 가로 타일 수
const GRID_HEIGHT = canvas.height / TILE_SIZE;  // 그리드 세로 타일 수

// 게임 상태 관련 변수
// 게임의 현재 상태와 진행 상황을 추적
const gameState = {
    gold: 200,           // 현재 보유 골드
    lives: 25,           // 남은 생명력
    wave: 1,             // 현재 웨이브
    isGameOver: false,   // 게임 오버 상태
    waveInProgress: false, // 웨이브 진행 중 여부
    enemiesRemaining: 0,  // 남은 적 수
    isPaused: false,     // 일시정지 상태
    isStarted: false,    // 게임 시작 여부
    score: 0,            // 현재 점수
    difficulty: 'EASY',  // 현재 난이도
    bossWave: 5,         // 보스 등장 웨이브
    bossKilled: false,   // 보스 처치 여부
    goldMultiplier: 1,   // 골드 획득 배율
    maxTowers: 12,       // 최대 타워 수
    towerCount: 0,       // 현재 설치된 타워 수
    experience: 0,       // 현재 경험치
    level: 1,            // 현재 레벨
    experienceToNextLevel: 100, // 다음 레벨까지 필요한 경험치
    currentMap: 'STRAIGHT', // 현재 맵
    currentWaveMessage: null, // 현재 웨이브 메시지
    waveMessageStartTime: 0,  // 웨이브 메시지 시작 시간
    lastSpawnTime: 0,    // 마지막 적 생성 시간
    totalEnemies: 0,     // 총 적 수
    currentGroup: 1,     // 현재 적 그룹
    totalGroups: 1,      // 총 적 그룹 수
    groupSize: 1,        // 그룹당 적 수
    enemiesInCurrentGroup: 0 // 현재 그룹의 남은 적 수
};

// 게임 통계
// 게임 진행 중의 통계 정보를 저장
const gameStats = {
    enemiesKilled: 0,    // 처치한 적 수
    bossesKilled: 0,     // 처치한 보스 수
    totalGold: 0,        // 총 획득 골드
    highestWave: 0,      // 최고 웨이브
    eventsTriggered: [], // 발생한 이벤트 목록
    playTime: 0,         // 플레이 시간
    gamesPlayed: 0,      // 플레이한 게임 수
    gamesWon: 0,         // 승리한 게임 수
    gamesLost: 0         // 패배한 게임 수
};

// 게임 객체 관련 변수
// 게임 내 동적 객체들을 관리
let towers = [];         // 설치된 타워 배열
let enemies = [];        // 생성된 적 배열
let enemyGroups = [];    // 적 그룹 배열
let groupIdCounter = 1;  // 그룹 ID 카운터
let rangePreview = null; // 타워 범위 미리보기
let shownCombos = [];    // 표시된 타워 조합
let currentWaveMessage = null; // 현재 웨이브 메시지
let waveMessageStartTime = 0;  // 웨이브 메시지 시작 시간
let lowSpecMode = false; // 저사양 모드 상태

// UI 요소
// 게임의 UI 요소 참조
const mapSelect = document.getElementById('mapSelect'); // 맵 선택 드롭다운
const startBtn = document.getElementById('startBtn');   // 게임 시작 버튼

// 게임 설정
// 게임의 다양한 설정값들을 정의

// 적 레벨 설정
const ENEMY_LEVEL_SETTINGS = {
    maxLevel: 999,               // 최대 레벨
    healthMultiplier: 1.2,       // 레벨당 체력 증가율
    speedMultiplier: 1.05,       // 레벨당 속도 증가율
    rewardMultiplier: 1.15,      // 레벨당 보상 증가율
    experienceMultiplier: 1.1,   // 레벨당 경험치 증가율
    levelUpChance: 0.1,          // 레벨업 확률
    maxLevelUpPerWave: 2         // 웨이브당 최대 레벨업 횟수
};

// 난이도 설정
const DIFFICULTY_SETTINGS = {
    EASY: {
        gold: 200,           // 초기 골드
        lives: 25,           // 초기 생명력
        enemyHealth: 0.8,    // 적 체력 배율
        enemySpeed: 0.8,     // 적 속도 배율
        goldReward: 0.9,     // 골드 보상 배율 (1.2 → 0.9)
        maxTowers: 12,       // 최대 타워 수
        enemySpawnRate: 0.03,// 적 생성 속도
        initialGold: 200,    // 시작 골드
        initialLives: 25     // 시작 생명력
    },
    NORMAL: {
        gold: 150,
        lives: 20,
        enemyHealth: 1,
        enemySpeed: 1,
        goldReward: 0.7,     // 골드 보상 배율 (1.0 → 0.7)
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
        goldReward: 0.5,     // 골드 보상 배율 (0.8 → 0.5)
        maxTowers: 8,
        enemySpawnRate: 0.07,
        initialGold: 100,
        initialLives: 15
    }
};

// 맵 정의
// 게임에서 사용 가능한 맵들의 경로 정의
const MAPS = {
    STRAIGHT: {
        name: '직선 경로',
        path: [
            { x: 0, y: 7 },
            { x: 1, y: 7 },
            { x: 2, y: 7 },
            { x: 3, y: 7 },
            { x: 4, y: 7 },
            { x: 5, y: 7 },
            { x: 6, y: 7 },
            { x: 7, y: 7 },
            { x: 8, y: 7 },
            { x: 9, y: 7 },
            { x: 10, y: 7 },
            { x: 11, y: 7 },
            { x: 12, y: 7 },
            { x: 13, y: 7 },
            { x: 14, y: 7 },
            { x: 15, y: 7 },
            { x: 16, y: 7 },
            { x: 17, y: 7 },
            { x: 18, y: 7 },
            { x: 19, y: 7 }
        ]
    },
    ZIGZAG: {
        name: '지그재그',
        path: [
            { x: 0, y: 5 },
            { x: 1, y: 5 },
            { x: 2, y: 5 },
            { x: 3, y: 5 },
            { x: 4, y: 5 },
            { x: 4, y: 3 },
            { x: 5, y: 3 },
            { x: 6, y: 3 },
            { x: 7, y: 3 },
            { x: 8, y: 3 },
            { x: 8, y: 7 },
            { x: 9, y: 7 },
            { x: 10, y: 7 },
            { x: 11, y: 7 },
            { x: 12, y: 7 },
            { x: 12, y: 3 },
            { x: 13, y: 3 },
            { x: 14, y: 3 },
            { x: 15, y: 3 },
            { x: 16, y: 3 },
            { x: 16, y: 7 },
            { x: 17, y: 7 },
            { x: 18, y: 7 },
            { x: 19, y: 7 }
        ]
    },
    SPIRAL: {
        name: '나선형',
        path: [
            { x: 0, y: 7 },
            { x: 1, y: 7 },
            { x: 2, y: 7 },
            { x: 3, y: 7 },
            { x: 4, y: 7 },
            { x: 4, y: 5 },
            { x: 4, y: 3 },
            { x: 4, y: 1 },
            { x: 6, y: 1 },
            { x: 8, y: 1 },
            { x: 10, y: 1 },
            { x: 10, y: 3 },
            { x: 10, y: 5 },
            { x: 10, y: 7 },
            { x: 10, y: 9 },
            { x: 10, y: 11 },
            { x: 12, y: 11 },
            { x: 14, y: 11 },
            { x: 16, y: 11 },
            { x: 16, y: 9 },
            { x: 16, y: 7 },
            { x: 16, y: 5 },
            { x: 16, y: 3 },
            { x: 16, y: 1 },
            { x: 18, y: 1 },
            { x: 19, y: 1 }
        ]
    },
    MAZE: {
        name: '미로',
        path: [
            { x: 0, y: 7 },
            { x: 1, y: 7 },
            { x: 2, y: 7 },
            { x: 3, y: 7 },
            { x: 4, y: 7 },
            { x: 4, y: 5 },
            { x: 4, y: 3 },
            { x: 6, y: 3 },
            { x: 8, y: 3 },
            { x: 8, y: 5 },
            { x: 8, y: 7 },
            { x: 8, y: 9 },
            { x: 10, y: 9 },
            { x: 12, y: 9 },
            { x: 12, y: 7 },
            { x: 12, y: 5 },
            { x: 14, y: 5 },
            { x: 16, y: 5 },
            { x: 16, y: 7 },
            { x: 16, y: 9 },
            { x: 18, y: 9 },
            { x: 19, y: 9 }
        ]
    },
    CROSS: {
        name: '십자형',
        path: [
            { x: 0, y: 7 },
            { x: 1, y: 7 },
            { x: 2, y: 7 },
            { x: 3, y: 7 },
            { x: 4, y: 7 },
            { x: 5, y: 7 },
            { x: 6, y: 7 },
            { x: 7, y: 7 },
            { x: 8, y: 7 },
            { x: 9, y: 7 },
            { x: 9, y: 5 },
            { x: 9, y: 3 },
            { x: 9, y: 1 },
            { x: 11, y: 1 },
            { x: 13, y: 1 },
            { x: 15, y: 1 },
            { x: 15, y: 3 },
            { x: 15, y: 5 },
            { x: 15, y: 7 },
            { x: 15, y: 9 },
            { x: 15, y: 11 },
            { x: 17, y: 11 },
            { x: 19, y: 11 }
        ]
    },
    SNAKE: {
        name: '뱀형',
        path: [
            { x: 0, y: 3 },
            { x: 2, y: 3 },
            { x: 4, y: 3 },
            { x: 4, y: 5 },
            { x: 4, y: 7 },
            { x: 6, y: 7 },
            { x: 8, y: 7 },
            { x: 8, y: 5 },
            { x: 8, y: 3 },
            { x: 10, y: 3 },
            { x: 12, y: 3 },
            { x: 12, y: 5 },
            { x: 12, y: 7 },
            { x: 14, y: 7 },
            { x: 16, y: 7 },
            { x: 16, y: 5 },
            { x: 16, y: 3 },
            { x: 18, y: 3 },
            { x: 19, y: 3 }
        ]
    },
    DIAMOND: {
        name: '다이아몬드',
        path: [
            { x: 0, y: 7 },
            { x: 2, y: 7 },
            { x: 4, y: 7 },
            { x: 6, y: 7 },
            { x: 8, y: 7 },
            { x: 8, y: 5 },
            { x: 8, y: 3 },
            { x: 10, y: 3 },
            { x: 12, y: 3 },
            { x: 12, y: 5 },
            { x: 12, y: 7 },
            { x: 14, y: 7 },
            { x: 16, y: 7 },
            { x: 16, y: 9 },
            { x: 16, y: 11 },
            { x: 14, y: 11 },
            { x: 12, y: 11 },
            { x: 12, y: 9 },
            { x: 10, y: 9 },
            { x: 8, y: 9 },
            { x: 6, y: 9 },
            { x: 4, y: 9 },
            { x: 2, y: 9 },
            { x: 0, y: 9 }
        ]
    },
    STAR: {
        name: '별형',
        path: [
            { x: 0, y: 7 },  // 시작점
            { x: 4, y: 7 },  // 오른쪽으로 이동
            { x: 6, y: 3 },  // 오른쪽 상단 꼭지점
            { x: 8, y: 7 },  // 중앙으로
            { x: 12, y: 3 }, // 오른쪽 상단 꼭지점
            { x: 14, y: 7 }, // 중앙으로
            { x: 19, y: 7 }, // 오른쪽 끝
            { x: 15, y: 11 }, // 오른쪽 하단 꼭지점
            { x: 14, y: 7 }, // 중앙으로
            { x: 10, y: 11 }, // 왼쪽 하단 꼭지점
            { x: 8, y: 7 },  // 중앙으로
            { x: 4, y: 11 }, // 왼쪽 하단 꼭지점
            { x: 0, y: 7 }   // 시작점으로 복귀
        ]
    },
    VORTEX: {
        name: '소용돌이',
        path: [
            { x: 0, y: 7 },
            { x: 1, y: 7 },
            { x: 2, y: 7 },
            { x: 3, y: 7 },
            { x: 4, y: 7 },
            { x: 4, y: 6 },
            { x: 4, y: 5 },
            { x: 4, y: 4 },
            { x: 4, y: 3 },
            { x: 5, y: 3 },
            { x: 6, y: 3 },
            { x: 7, y: 3 },
            { x: 8, y: 3 },
            { x: 8, y: 4 },
            { x: 8, y: 5 },
            { x: 8, y: 6 },
            { x: 8, y: 7 },
            { x: 8, y: 8 },
            { x: 8, y: 9 },
            { x: 8, y: 10 },
            { x: 9, y: 10 },
            { x: 10, y: 10 },
            { x: 11, y: 10 },
            { x: 12, y: 10 },
            { x: 12, y: 9 },
            { x: 12, y: 8 },
            { x: 12, y: 7 },
            { x: 12, y: 6 },
            { x: 12, y: 5 },
            { x: 12, y: 4 },
            { x: 13, y: 4 },
            { x: 14, y: 4 },
            { x: 15, y: 4 },
            { x: 16, y: 4 },
            { x: 16, y: 5 },
            { x: 16, y: 6 },
            { x: 16, y: 7 },
            { x: 16, y: 8 },
            { x: 16, y: 9 },
            { x: 16, y: 10 },
            { x: 17, y: 10 },
            { x: 18, y: 10 },
            { x: 19, y: 10 }
        ]
    },
    MAZE2: {
        name: '맵14',
        path: [
            { x: 0, y: 7 },
            { x: 1, y: 7 },
            { x: 2, y: 7 },
            { x: 3, y: 7 },
            { x: 4, y: 7 },
            { x: 4, y: 5 },
            { x: 4, y: 3 },
            { x: 6, y: 3 },
            { x: 8, y: 3 },
            { x: 10, y: 3 },
            { x: 10, y: 5 },
            { x: 10, y: 7 },
            { x: 10, y: 9 },
            { x: 12, y: 9 },
            { x: 14, y: 9 },
            { x: 16, y: 9 },
            { x: 16, y: 7 },
            { x: 16, y: 5 },
            { x: 16, y: 3 },
            { x: 16, y: 1 },
            { x: 18, y: 1 },
            { x: 19, y: 1 }
        ]
    },
    SNAKE2: {
        name: '맵15',
        path: [
            { x: 0, y: 3 },
            { x: 2, y: 3 },
            { x: 4, y: 3 },
            { x: 4, y: 5 },
            { x: 4, y: 7 },
            { x: 6, y: 7 },
            { x: 8, y: 7 },
            { x: 8, y: 5 },
            { x: 8, y: 3 },
            { x: 10, y: 3 },
            { x: 12, y: 3 },
            { x: 12, y: 5 },
            { x: 12, y: 7 },
            { x: 14, y: 7 },
            { x: 16, y: 7 },
            { x: 16, y: 5 },
            { x: 16, y: 3 },
            { x: 18, y: 3 },
            { x: 19, y: 3 }
        ]
    },
    TRIANGLE: {
        name: '맵12',
        path: [
            { x: 0, y: 7 },   // 시작점
            { x: 4, y: 7 },   // 오른쪽으로
            { x: 8, y: 3 },   // 상단 꼭지점
            { x: 12, y: 7 },  // 오른쪽으로
            { x: 16, y: 7 },  // 오른쪽으로
            { x: 19, y: 7 },  // 오른쪽 끝
            { x: 16, y: 11 }, // 하단 꼭지점
            { x: 12, y: 11 }, // 왼쪽으로
            { x: 8, y: 11 },  // 왼쪽으로
            { x: 4, y: 11 },  // 왼쪽으로
            { x: 0, y: 7 }    // 시작점으로 복귀
        ]
    },
    WAVE: {
        name: '파도형',
        path: [
            { x: 0, y: 5 },
            { x: 1, y: 5 },
            { x: 2, y: 5 },
            { x: 3, y: 5 },
            { x: 4, y: 5 },
            { x: 4, y: 3 },
            { x: 5, y: 3 },
            { x: 6, y: 3 },
            { x: 7, y: 3 },
            { x: 8, y: 3 },
            { x: 8, y: 5 },
            { x: 9, y: 5 },
            { x: 10, y: 5 },
            { x: 11, y: 5 },
            { x: 12, y: 5 },
            { x: 12, y: 7 },
            { x: 13, y: 7 },
            { x: 14, y: 7 },
            { x: 15, y: 7 },
            { x: 16, y: 7 },
            { x: 16, y: 9 },
            { x: 17, y: 9 },
            { x: 18, y: 9 },
            { x: 19, y: 9 }
        ]
    },
    STAIRS: {
        name: '계단형',
        path: [
            { x: 0, y: 1 },
            { x: 2, y: 1 },
            { x: 2, y: 3 },
            { x: 4, y: 3 },
            { x: 4, y: 5 },
            { x: 6, y: 5 },
            { x: 6, y: 7 },
            { x: 8, y: 7 },
            { x: 8, y: 9 },
            { x: 10, y: 9 },
            { x: 10, y: 11 },
            { x: 12, y: 11 },
            { x: 12, y: 9 },
            { x: 14, y: 9 },
            { x: 14, y: 7 },
            { x: 16, y: 7 },
            { x: 16, y: 5 },
            { x: 18, y: 5 },
            { x: 18, y: 3 },
            { x: 19, y: 3 }
        ]
    },
    CROSSROADS: {
        name: '교차로',
        path: [
            { x: 0, y: 7 },
            { x: 2, y: 7 },
            { x: 4, y: 7 },
            { x: 6, y: 7 },
            { x: 8, y: 7 },
            { x: 8, y: 5 },
            { x: 8, y: 3 },
            { x: 8, y: 1 },
            { x: 10, y: 1 },
            { x: 12, y: 1 },
            { x: 14, y: 1 },
            { x: 16, y: 1 },
            { x: 16, y: 3 },
            { x: 16, y: 5 },
            { x: 16, y: 7 },
            { x: 16, y: 9 },
            { x: 16, y: 11 },
            { x: 14, y: 11 },
            { x: 12, y: 11 },
            { x: 10, y: 11 },
            { x: 8, y: 11 },
            { x: 8, y: 9 },
            { x: 8, y: 7 },
            { x: 10, y: 7 },
            { x: 12, y: 7 },
            { x: 14, y: 7 },
            { x: 16, y: 7 },
            { x: 18, y: 7 },
            { x: 19, y: 7 }
        ]
    },
    INFINITY: {
        name: '무한형',
        path: [
            { x: 0, y: 7 },
            { x: 2, y: 7 },
            { x: 4, y: 7 },
            { x: 6, y: 7 },
            { x: 8, y: 7 },
            { x: 8, y: 5 },
            { x: 8, y: 3 },
            { x: 10, y: 3 },
            { x: 12, y: 3 },
            { x: 12, y: 5 },
            { x: 12, y: 7 },
            { x: 12, y: 9 },
            { x: 12, y: 11 },
            { x: 10, y: 11 },
            { x: 8, y: 11 },
            { x: 8, y: 9 },
            { x: 8, y: 7 },
            { x: 6, y: 7 },
            { x: 4, y: 7 },
            { x: 2, y: 7 },
            { x: 0, y: 7 },
            { x: 0, y: 5 },
            { x: 0, y: 3 },
            { x: 2, y: 3 },
            { x: 4, y: 3 },
            { x: 6, y: 3 },
            { x: 8, y: 3 },
            { x: 10, y: 3 },
            { x: 12, y: 3 },
            { x: 14, y: 3 },
            { x: 16, y: 3 },
            { x: 18, y: 3 },
            { x: 19, y: 3 }
        ]
    },
    BUTTERFLY: {
        name: '나비형',
        path: [
            { x: 0, y: 7 },
            { x: 2, y: 7 },
            { x: 4, y: 7 },
            { x: 6, y: 7 },
            { x: 8, y: 7 },
            { x: 8, y: 5 },
            { x: 8, y: 3 },
            { x: 10, y: 3 },
            { x: 12, y: 3 },
            { x: 12, y: 5 },
            { x: 12, y: 7 },
            { x: 12, y: 9 },
            { x: 12, y: 11 },
            { x: 10, y: 11 },
            { x: 8, y: 11 },
            { x: 8, y: 9 },
            { x: 8, y: 7 },
            { x: 6, y: 7 },
            { x: 4, y: 7 },
            { x: 2, y: 7 },
            { x: 0, y: 7 },
            { x: 0, y: 5 },
            { x: 0, y: 3 },
            { x: 2, y: 3 },
            { x: 4, y: 3 },
            { x: 6, y: 3 },
            { x: 8, y: 3 },
            { x: 10, y: 3 },
            { x: 12, y: 3 },
            { x: 14, y: 3 },
            { x: 16, y: 3 },
            { x: 18, y: 3 },
            { x: 19, y: 3 }
        ]
    },
    HOURGLASS: {
        name: '모래시계',
        path: [
            { x: 0, y: 3 },
            { x: 2, y: 3 },
            { x: 4, y: 3 },
            { x: 6, y: 3 },
            { x: 8, y: 3 },
            { x: 10, y: 3 },
            { x: 10, y: 5 },
            { x: 10, y: 7 },
            { x: 8, y: 7 },
            { x: 6, y: 7 },
            { x: 4, y: 7 },
            { x: 2, y: 7 },
            { x: 0, y: 7 },
            { x: 0, y: 9 },
            { x: 0, y: 11 },
            { x: 2, y: 11 },
            { x: 4, y: 11 },
            { x: 6, y: 11 },
            { x: 8, y: 11 },
            { x: 10, y: 11 },
            { x: 12, y: 11 },
            { x: 14, y: 11 },
            { x: 16, y: 11 },
            { x: 18, y: 11 },
            { x: 19, y: 11 }
        ]
    },
    TRIANGLE: {
        name: '삼각형',
        path: [
            { x: 0, y: 7 },   // 시작점
            { x: 4, y: 7 },   // 오른쪽으로
            { x: 8, y: 3 },   // 상단 꼭지점
            { x: 12, y: 7 },  // 오른쪽으로
            { x: 16, y: 7 },  // 오른쪽으로
            { x: 19, y: 7 },  // 오른쪽 끝
            { x: 16, y: 11 }, // 하단 꼭지점
            { x: 12, y: 11 }, // 왼쪽으로
            { x: 8, y: 11 },  // 왼쪽으로
            { x: 4, y: 11 },  // 왼쪽으로
            { x: 0, y: 7 }    // 시작점으로 복귀
        ]
    }
};

// 타워 아이콘 정의
// 각 타워 타입별 아이콘
const TOWER_ICONS = {
    BASIC: '⚔️',    // 기본 타워
    ICE: '❄️',      // 얼음 타워
    POISON: '☠️',   // 독 타워
    LASER: '🔴',    // 레이저 타워
    SPLASH: '💥',   // 스플래시 타워
    SUPPORT: '💫'   // 지원 타워
};

// 파워업 정의
// 게임 내 사용 가능한 파워업 효과
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
// 게임 중 발생하는 특수 이벤트
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
// 게임 내 달성 가능한 업적
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
            return towerTypes.size === Object.keys(window.TOWER_TYPES).length;
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

// 타워 조합 정의
// 타워들 간의 특별한 조합 효과
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
                    switch (tower.type) {
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
                switch (tower.type) {
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
// 타워나 적이 가진 특수 능력
const ABILITIES = {
    TOWER_BOOST: {
        name: '전체 타워 강화',
        cost: 300
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
                        draw: function () { },
                        update: function () { }
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
                draw: function () { },
                update: function () { }
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
