// 타워 관련 상수
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

// Tower 클래스
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
        switch (type) {
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
        switch (this.type) {
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

        switch (upgradeType) {
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

        switch (this.type) {
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
        const centerX = this.x * TILE_SIZE + TILE_SIZE / 2;
        const centerY = this.y * TILE_SIZE + TILE_SIZE / 2;
        const radius = TILE_SIZE / 2 - 4;

        // 사거리 원 내부 채우기 (더 진하게)
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.beginPath();
        ctx.arc(
            this.x * TILE_SIZE + TILE_SIZE / 2,
            this.y * TILE_SIZE + TILE_SIZE / 2,
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
            this.x * TILE_SIZE + TILE_SIZE / 2,
            this.y * TILE_SIZE + TILE_SIZE / 2,
            this.range * TILE_SIZE,
            0,
            Math.PI * 2
        );
        ctx.stroke();
        ctx.restore();

        // 타워 범위 표시 (항상 표시)
        const gradient = ctx.createRadialGradient(
            this.x * TILE_SIZE + TILE_SIZE / 2,
            this.y * TILE_SIZE + TILE_SIZE / 2,
            0,
            this.x * TILE_SIZE + TILE_SIZE / 2,
            this.y * TILE_SIZE + TILE_SIZE / 2,
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
        switch (this.type) {
            case 'BASIC':
                // 기본 타워: 원형
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'ICE':
                // 얼음 타워: 육각형
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI * 2) / 6;
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                break;

            case 'POISON':
                // 독 타워: 별 모양
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                break;

            case 'LASER':
                // 레이저 타워: 삼각형
                ctx.beginPath();
                for (let i = 0; i < 3; i++) {
                    const angle = (i * Math.PI * 2) / 3;
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
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
                ctx.rect(centerX - radius / 2, centerY - radius, radius, radius * 2);
                ctx.rect(centerX - radius, centerY - radius / 2, radius * 2, radius);
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
            nameX - nameWidth / 2 - 4,
            nameY - nameHeight / 2 - 2,
            nameWidth + 8,
            nameHeight + 4
        );

        // 타워 이름 테두리
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            nameX - nameWidth / 2 - 4,
            nameY - nameHeight / 2 - 2,
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
            levelX - levelWidth / 2 - 4,
            levelY - levelHeight / 2 - 2,
            levelWidth + 8,
            levelHeight + 4
        );

        // 레벨 테두리
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            levelX - levelWidth / 2 - 4,
            levelY - levelHeight / 2 - 2,
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
            ctx.arc(centerX, centerY, cooldownRadius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * cooldownProgress));
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
            ctx.arc(centerX, centerY, specialRadius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * specialCooldownProgress));
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
        const centerX = x * TILE_SIZE + TILE_SIZE / 2;
        const centerY = y * TILE_SIZE + TILE_SIZE / 2;
        const diameter = range * TILE_SIZE * 2;

        rangePreview.style.left = `${centerX - diameter / 2}px`;
        rangePreview.style.top = `${centerY - diameter / 2}px`;
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

// 타워 관련 유틸리티 함수들
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

// 타워 제한 업데이트
function updateTowerLimit() {
    document.getElementById('towerLimitCount').textContent = gameState.towerCount;
    document.getElementById('towerLimitMax').textContent = gameState.maxTowers;
}

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

function showLevelUpEffect(tower) {
    if (!tower || typeof tower !== 'object' || tower.x === undefined || tower.y === undefined) {
        console.error('showLevelUpEffect는 반드시 타워 객체로 호출해야 합니다!', tower);
        return;
    }
    // 이펙트 풀에서 이펙트 가져오기
    const effect = EffectPool.get('levelUp');
    if (!effect) return;

    // 이펙트 초기화
    effect.x = tower.x * TILE_SIZE + TILE_SIZE / 2;  // 타워의 실제 화면 좌표로 변환
    effect.y = tower.y * TILE_SIZE + TILE_SIZE / 2;  // 타워의 실제 화면 좌표로 변환
    effect.alpha = 1;
    effect.scale = 0.5;
    effect.rotation = 0;
    effect.active = true;
    effect.type = 'levelUp';
    effect.duration = 1000; // 1초 동안 지속
    effect.startTime = Date.now();

    // 이펙트 그리기 함수
    effect.draw = function () {
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
    effect.update = function () {
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

// 타워 정보 표시
function showTowerInfo(tower) {
    const info = document.createElement('div');
    info.className = 'tower-info';
    info.innerHTML = `
        <div class="tower-name">${TOWER_TYPES[tower.type].name}</div>
        <div class="tower-level">Level ${tower.level}</div>
        <div class="tower-stats">
            <div>⚔️ ${tower.damage}</div>
            <div>🎯 ${tower.range}</div>
            <div>⚡ ${(60 / tower.maxCooldown).toFixed(1)}</div>
        </div>
    `;
    
    // 위치 설정
    const centerX = tower.x * TILE_SIZE + TILE_SIZE/2;
    const centerY = tower.y * TILE_SIZE + TILE_SIZE/2;
    
    info.style.left = `${centerX}px`;
    info.style.top = `${centerY - 80}px`;
    info.style.transform = 'translateX(-50%)';
    
    document.getElementById('game-container').appendChild(info);
    return info;
}

// 타워 호버 효과
function handleTowerHover(tower) {
    let infoElement = null;
    
    const showInfo = () => {
        if (!infoElement) {
            infoElement = showTowerInfo(tower);
        }
    };
    
    const hideInfo = () => {
        if (infoElement) {
            infoElement.remove();
            infoElement = null;
        }
    };
    
    return { showInfo, hideInfo };
}

// TOWER_TYPES를 전역 변수로 노출
window.TOWER_TYPES = TOWER_TYPES;

// 전역 객체에 노출
window.Tower = Tower;
window.towerFromData = towerFromData;
window.showTowerRangePreview = showTowerRangePreview;
window.hideTowerRangePreview = hideTowerRangePreview;
window.updateTowerLimit = updateTowerLimit;
window.checkTowerCombos = checkTowerCombos;
window.showLevelUpEffect = showLevelUpEffect;
window.showTowerInfo = showTowerInfo;
window.handleTowerHover = handleTowerHover; 