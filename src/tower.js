/**
 * 타워 관련 모든 로직을 담당하는 파일
 * 타워의 생성, 업그레이드, 공격, 특수 능력 등 게임 내 타워의 동작을 관리
 */

// 타워 관련 상수
const TOWER_TYPES = {
    BASIC: {
        name: t('basicTower'),
        cost: 30,
        damage: 5,
        range: 2,
        cooldown: 100,
        color: 'blue',
        special: {
            name: t('towerSpecialEnhancedShot'),
            description: t('towerSpecialEnhancedShotDesc'),
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
        name: t('iceTower'),
        cost: 100,
        damage: 5,
        range: 2,
        cooldown: 90,
        color: 'lightblue',
        freezeDuration: 2,
        special: {
            name: t('towerSpecialFrostExplosion'),
            description: t('towerSpecialFrostExplosionDesc'),
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
        name: t('poisonTower'),
        cost: 200,
        damage: 3,
        range: 2,
        cooldown: 60,
        color: 'green',
        poisonDamage: 2,
        poisonDuration: 5,
        special: {
            name: t('towerSpecialPoisonCloud'),
            description: t('towerSpecialPoisonCloudDesc'),
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
        name: t('laserTower'),
        cost: 300,
        damage: 8,
        range: 2.5,
        cooldown: 120,
        color: 'red',
        continuousDamage: 5,
        special: {
            name: t('towerSpecialOverheatLaser'),
            description: t('towerSpecialOverheatLaserDesc'),
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
        name: t('splashTower'),
        cost: 400,
        damage: 7,
        range: 2,
        cooldown: 110,
        color: 'purple',
        splashRadius: 1.5,
        slowEffect: 0.3,
        special: {
            name: t('towerSpecialMassiveExplosion'),
            description: t('towerSpecialMassiveExplosionDesc'),
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
        name: t('supportTower'),
        cost: 500,
        damage: 0,
        range: 3,
        cooldown: 0,
        color: 'yellow',
        buffRange: 3,
        buffMultiplier: 1.2,
        special: {
            name: t('towerSpecialFullEnhancement'),
            description: t('towerSpecialFullEnhancementDesc'),
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
// 각 타워 객체는 Tower 클래스를 통해 생성되며, 위치, 공격력, 범위 등 다양한 속성을 가짐
class Tower {
    // 생성자: 타워의 초기 속성을 설정
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

    // 특수 효과 초기화
    // 타워 타입에 따른 특수 효과 속성을 초기화
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

    // 특수 능력 사용
    // 타워의 특수 능력을 발동하고 쿨다운을 적용
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

    // 특수 능력 아이콘 반환
    // 타워 타입에 따른 특수 능력 아이콘을 반환
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

    // 업그레이드
    // 타워의 특정 속성을 업그레이드하고 비용을 차감
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

    // 업그레이드 비용 계산
    // 업그레이드 타입에 따른 비용을 계산
    getUpgradeCost(upgradeType) {
        const baseCost = 100;
        let level = this[`${upgradeType}Level`];
        if (typeof level !== 'number' || isNaN(level)) level = 1;
        return Math.floor(baseCost * Math.pow(1.5, level));
    }

    // 공격 실행
    // 범위 내 적을 찾아 공격을 실행
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

    // 타겟 찾기
    // 공격 범위 내 가장 적절한 타겟을 찾음
    findTarget(enemies) {
        if (!enemies || !Array.isArray(enemies)) return null;
        return enemies.filter(enemy => enemy && enemy.x !== undefined && enemy.y !== undefined)  // enemy가 유효한지 확인
            .filter(enemy => {
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                return Math.sqrt(dx * dx + dy * dy) <= this.range;
            })[0];
    }

    // 공격 실행
    // 선택된 타겟에 대해 공격을 실행
    executeAttack(target) {
        const isCritical = Math.random() < CRITICAL_CHANCE;
        const damage = isCritical ? this.damage * CRITICAL_MULTIPLIER : this.damage;

        // 공격 이펙트와 사운드 재생
        showAttackEffect(this.x, this.y, target.x, target.y, isCritical);

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

    // 스플래시 공격 실행
    // 주변 적들에게 범위 데미지를 적용
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

    // 지원 버프 실행
    // 주변 타워들에게 버프 효과를 적용
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

    // 버프 제거
    // 적용된 모든 버프 효과를 제거
    removeBuffs() {
        this.buffedTowers.forEach(tower => {
            tower.damage /= this.buffMultiplier;
        });
        this.buffedTowers.clear();
    }

    // 경험치 획득
    // 타워가 경험치를 획득하고 레벨업 처리
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

    // 상태 업데이트
    // 타워의 상태를 한 프레임마다 갱신
    update() {
        if (this.specialCooldown > 0) {
            this.specialCooldown--;
        }
    }

    // 타워 그리기
    // 타워를 캔버스에 그림
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
        ctx.fillText(t(towerName), nameX, nameY);

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

    // 판매 가치 계산
    // 타워의 판매 시 얻을 수 있는 골드를 계산
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

    // 타워 범위 미리보기 표시
    // 타워 설치 전 범위를 미리 보여줌
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

    // 타워 범위 미리보기 숨기기
    // 타워 범위 미리보기를 제거
    hideTowerRangePreview() {
        if (rangePreview) {
            rangePreview.remove();
            rangePreview = null;
        }
    }

    // 업그레이드 가능 여부 확인
    // 특정 업그레이드가 가능한지 확인
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

// 저장된 데이터로부터 타워 생성
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
    const centerY = (y * TILE_SIZE + TILE_SIZE * 2) + TILE_SIZE;
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
        console.error(t('showLevelUpEffectTowerOnly'), tower);
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

// 타워 호버 처리
// 마우스가 타워 위에 있을 때의 동작 처리
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

// 타워 툴팁 데이터
const towerTooltipData = {
    BASIC: `${t('basicTower')}\n- ${t('towerTooltipBasic1')}\n- ${t('towerTooltipBasic2')}\n- ${t('towerTooltipBasic3')}`,
    ICE: `${t('iceTower')}\n- ${t('towerTooltipIce1')}\n- ${t('towerTooltipIce2')}\n- ${t('towerTooltipIce3')}`,
    POISON: `${t('poisonTower')}\n- ${t('towerTooltipPoison1')}\n- ${t('towerTooltipPoison2')}\n- ${t('towerTooltipPoison3')}`,
    LASER: `${t('laserTower')}\n- ${t('towerTooltipLaser1')}\n- ${t('towerTooltipLaser2')}`,
    SPLASH: `${t('splashTower')}\n- ${t('towerTooltipSplash1')}\n- ${t('towerTooltipSplash2')}`,
    SUPPORT: `${t('supportTower')}\n- ${t('towerTooltipSupport1')}\n- ${t('towerTooltipSupport2')}`
};

// 타워 툴팁 관련 변수
let tooltipEl = null;

// 타워 툴팁 표시 함수
function showTowerTooltip(e) {
    const type = this.getAttribute('data-type');
    if (!type || !towerTooltipData[type]) return;
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'tooltip';
        document.body.appendChild(tooltipEl);
    }
    tooltipEl.textContent = towerTooltipData[type];
    tooltipEl.classList.add('show');
    // 위치 계산
    const rect = this.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    tooltipEl.style.left = `${rect.left + rect.width/2 - tooltipEl.offsetWidth/2}px`;
    tooltipEl.style.top = `${rect.bottom + scrollY + 8}px`;
}

// 타워 툴팁 숨기기
// 타워 툴팁을 제거
function hideTowerTooltip() {
    if (tooltipEl) {
        tooltipEl.classList.remove('show');
        setTimeout(() => { if (tooltipEl) tooltipEl.remove(); tooltipEl = null; }, 150);
    }
}

// 이벤트 리스너 등록
document.querySelectorAll('.tower-tooltip').forEach(el => {
    el.addEventListener('mouseenter', showTowerTooltip);
    el.addEventListener('focus', showTowerTooltip);
    el.addEventListener('mouseleave', hideTowerTooltip);
    el.addEventListener('blur', hideTowerTooltip);
    // 모바일 터치 대응
    el.addEventListener('touchstart', function(e) {
        showTowerTooltip.call(this, e);
        e.preventDefault();
    });
    el.addEventListener('touchend', hideTowerTooltip);
});

// 타워 건설 메뉴 표시 함수
function showTowerBuildMenu(x, y, clientX, clientY) {
    if (gameState.towerCount >= gameState.maxTowers) {
        showSaveLoadNotification(t('towerLimitReached'));
        return;
    }

    // 타워 업그레이드 모달이 열려 있으면 닫기
    const existingUpgradeMenu = document.querySelector('.tower-upgrade-menu');
    if (existingUpgradeMenu && existingUpgradeMenu.parentNode) {
        existingUpgradeMenu.parentNode.removeChild(existingUpgradeMenu);
    }

    const towerMenu = document.getElementById('towerMenu');
    const existingMenu = document.querySelector('.tower-build-menu');
    if (existingMenu && existingMenu.parentNode) {
        existingMenu.parentNode.removeChild(existingMenu);
    }

    const menu = document.createElement('div');
    menu.className = 'tower-build-menu';

    // 헤더 추가
    const header = document.createElement('div');
    header.className = 'tower-build-header';
    header.innerHTML = `
        <h2>${t('towerInstallation')}</h2>
        <p>${t('gold')}: ${gameState.gold}</p>
    `;
    menu.appendChild(header);

    // 타워 리스트 생성
    const towerList = document.createElement('div');
    towerList.className = 'tower-list';

    Object.entries(TOWER_TYPES).forEach(([type, tower]) => {
        const card = document.createElement('div');
        card.className = `tower-card ${gameState.gold < tower.cost ? 'disabled' : ''}`;

        card.innerHTML = `
            <div class="tower-card-header">
                <div class="tower-icon" tabindex="0" style="background: ${tower.color}">${type[0]}</div>
                <div class="tower-name">${t(tower.name)}</div>
                <div class="tower-cost">${tower.cost} ${t('gold')}</div>
            </div>
            <div class="tower-details">
                <div class="tower-stats">
                    <span class="tower-stat-label">${t('attackPower')}</span> ${tower.damage} /
                    <span class="tower-stat-label">${t('range')}</span> ${tower.range} /
                    <span class="tower-stat-label">${t('cooldown')}</span> ${(tower.cooldown / 60).toFixed(2)}${t('seconds')}
                </div>
                <div class="tower-description">${getSpecialDescription(type)}</div>
            </div>
        `;

        const icon = card.querySelector('.tower-icon');
        icon.addEventListener('mouseenter', () => card.classList.add('show-details'));
        icon.addEventListener('mouseleave', () => card.classList.remove('show-details'));
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            card.classList.toggle('show-details');
        });
        icon.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                card.classList.toggle('show-details');
            }
        });

        if (gameState.gold >= tower.cost) {
            card.onmouseover = () => showTowerRangePreview(x, y, tower.range, type);
            card.onmouseout = hideTowerRangePreview;

            card.onclick = () => {
                towers.push(new Tower(x, y, type));
                gameState.gold -= tower.cost;
                gameState.towerCount++;
                updateTowerLimit();
                playSound('tower_place');
                hideTowerRangePreview();
                if (menu.parentNode) {
                    menu.parentNode.removeChild(menu);
                }
                const highlight = document.querySelector('.grid-highlight');
                if (highlight) highlight.remove();
            };
        }

        towerList.appendChild(card);
    });

    menu.appendChild(towerList);
    towerMenu.appendChild(menu);
    setupMenuCloseHandler(menu);
}

// 타워 업그레이드 메뉴 표시
// 타워 업그레이드 시 표시되는 메뉴
function showTowerUpgradeMenu(tower, clientX, clientY) {
    // 타워 설치 모달이 열려 있으면 닫기
    const existingBuildMenu = document.querySelector('.tower-build-menu');
    if (existingBuildMenu && existingBuildMenu.parentNode) {
        existingBuildMenu.parentNode.removeChild(existingBuildMenu);
    }

    const towerMenu = document.getElementById('towerMenu');
    const existingMenu = document.querySelector('.tower-upgrade-menu');
    if (existingMenu && existingMenu.parentNode) {
        existingMenu.parentNode.removeChild(existingMenu);
    }

    const menu = document.createElement('div');
    menu.className = 'tower-upgrade-menu';

    // 상단: 타워명/레벨/스탯 요약 한 줄
    const headerRow = document.createElement('div');
    headerRow.className = 'tower-upgrade-header-row';
    headerRow.innerHTML = `
        <span class="tower-upgrade-header-title">${t(TOWER_TYPES[tower.type].name)} Lv.${tower.level}</span>
        <span class="tower-upgrade-header-stats">
            <span>⚔️ ${Math.floor(tower.damage)}</span>
            <span>🎯 ${tower.range}</span>
            <span>⚡ ${(60 / tower.maxCooldown).toFixed(1)}</span>
        </span>
    `;
    menu.appendChild(headerRow);

    // 하단: 업그레이드 옵션 3개 + 판매 버튼 한 줄
    const row = document.createElement('div');
    row.className = 'tower-upgrade-row';

    // 업그레이드 옵션들
    const upgradeTypes = ['damage', 'range', 'speed'];
    const upgradeIcons = ['⚔️', '🎯', '⚡'];
    const upgradeNames = [t('upgradeDamage'), t('upgradeRange'), t('upgradeSpeed')];

    upgradeTypes.forEach((type, index) => {
        const isSupport = tower.type === 'SUPPORT';
        const canUpgrade = isSupport ? (type === 'range' && tower.canUpgrade(type)) : tower.canUpgrade(type);
        let currentValue, nextValue;
        if (type === 'damage') {
            currentValue = Math.floor(tower[type]);
            nextValue = Math.floor(tower[type] * 1.2);
        } else if (type === 'range') {
            currentValue = tower[type].toFixed(1);
            nextValue = (tower[type] * 1.2).toFixed(1);
        } else if (type === 'speed') {
            currentValue = (60 / tower.maxCooldown).toFixed(1);
            nextValue = (60 / Math.max(10, tower.maxCooldown * 0.9)).toFixed(1);
        } else {
            currentValue = tower[type];
            nextValue = tower[type];
        }
        const option = document.createElement('div');
        option.className = `upgrade-option ${canUpgrade ? '' : 'disabled'}`;
        option.innerHTML = `
            <span class="upgrade-label">${upgradeNames[index]}</span>
            <span>${upgradeIcons[index]}</span>
            <span>${currentValue}</span>
            <span class="upgrade-arrow">→</span>
            <span>${nextValue}</span>
            <span class="upgrade-cost">💰${tower.getUpgradeCost(type)}</span>
        `;
        if (canUpgrade) {
            option.addEventListener('click', () => {
                tower.upgrade(type);
                showUpgradeEffect(tower.x, tower.y);
                updateInfoBar();
                menu.remove();
            });
        }
        row.appendChild(option);
    });

    // 판매 버튼
    const sellButton = document.createElement('button');
    sellButton.className = 'sell-button';
    sellButton.innerHTML = `💎 ${t('sell')} +${tower.getSellValue()}`;
    sellButton.addEventListener('click', () => {
        gameState.gold += tower.getSellValue();
        const index = towers.indexOf(tower);
        if (index > -1) {
            towers.splice(index, 1);
            gameState.towerCount--;
            updateTowerLimit();
        }
        updateInfoBar();
        menu.remove();
    });
    row.appendChild(sellButton);

    menu.appendChild(row);
    towerMenu.appendChild(menu);
    setupMenuCloseHandler(menu);
}

// 특수 능력 설명 반환
// 타워 타입에 따른 특수 능력 설명을 반환
function getSpecialDescription(type) {
    switch (type) {
        case 'ICE':
            return t('specialDescIce');
        case 'POISON':
            return t('specialDescPoison');
        case 'SUPPORT':
            return t('specialDescSupport');
        case 'BASIC':
            return t('specialDescBasic');
        case 'SNIPER':
            return t('specialDescSniper');
        case 'SPLASH':
            return t('specialDescSplash');
        case 'LASER':
            return t('specialDescLaser');
        default:
            return t('specialDescNone');
    }
}

// TOWER_TYPES를 전역 변수로 노출
window.TOWER_TYPES = TOWER_TYPES;

// 전역 객체에 노출
window.Tower = Tower;
window.towerFromData = towerFromData;
window.showTowerRangePreview = showTowerRangePreview;
window.hideTowerRangePreview = hideTowerRangePreview;
window.checkTowerCombos = checkTowerCombos;
window.showLevelUpEffect = showLevelUpEffect;
window.showTowerInfo = showTowerInfo;
window.handleTowerHover = handleTowerHover;
window.towerTooltipData = towerTooltipData;
window.showTowerTooltip = showTowerTooltip;
window.hideTowerTooltip = hideTowerTooltip;
window.showTowerBuildMenu = showTowerBuildMenu;
window.showTowerUpgradeMenu = showTowerUpgradeMenu;
window.getSpecialDescription = getSpecialDescription; 