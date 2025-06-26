/**
 * 적(enemy) 관련 모든 로직을 담당하는 파일
 * 적의 생성, 이동, 상태 효과, 보스 패턴 등 게임 내 적의 동작을 관리
 */

// 적 유형 정의
// 게임 내 등장하는 적의 종류와 각각의 특성을 정의
const ENEMY_TYPES = {
    NORMAL: {
        name: t('normalEnemy'),
        health: 100,
        speed: 0.007,
        reward: 10,
        color: 'red',
        experienceValue: 10
    },
    FAST: {
        name: t('fastEnemy'),
        health: 50,
        speed: 0.01,
        reward: 15,
        color: 'yellow',
        experienceValue: 15
    },
    TANK: {
        name: t('tankEnemy'),
        health: 300,
        speed: 0.004,
        reward: 20,
        color: 'purple',
        experienceValue: 20
    },
    HEALER: {
        name: t('healerEnemy'),
        health: 80,
        speed: 0.005,
        reward: 25,
        color: 'green',
        experienceValue: 25,
        healAmount: 10,
        healRange: 2
    }
};

// 적 AI 패턴 상수
// 적의 이동 패턴과 특수 행동을 정의
const ENEMY_PATTERNS = {
    NORMAL: {
        name: t('enemyPatternNormal'),
        description: t('enemyPatternNormalDesc'),
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
        name: t('enemyPatternZigzag'),
        description: t('enemyPatternZigzagDesc'),
        update: function (enemy) {
            if (enemy.pathIndex >= currentMap.path.length - 1) {
                gameState.lives--;
                return true;
            }
            const prev = currentMap.path[enemy.pathIndex];
            const target = currentMap.path[enemy.pathIndex + 1];
            const dx = target.x - prev.x;
            const dy = target.y - prev.y;
            const nx = -dy;
            const ny = dx;
            if (enemy.zigzagFrame === undefined) enemy.zigzagFrame = 0;
            enemy.zigzagFrame++;
            const offset = Math.sin(enemy.zigzagFrame * 0.2) * 0.2;
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
        name: t('enemyPatternSwarm'),
        description: t('enemyPatternSwarmDesc'),
        update: function (enemy) {
            if (enemy.pathIndex >= currentMap.path.length - 1) {
                gameState.lives--;
                return true;
            }
            const target = currentMap.path[enemy.pathIndex + 1];
            let dx = target.x - enemy.x;
            let dy = target.y - enemy.y;
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
        name: t('enemyPatternAmbush'),
        description: t('enemyPatternAmbushDesc'),
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
    GROUP_RUSH: {
        name: t('enemyPatternGroupRush'),
        description: t('enemyPatternGroupRushDesc'),
        update: function (enemy) {
            if (enemy.pathIndex >= currentMap.path.length - 1) {
                gameState.lives--;
                return true;
            }
            const group = enemyGroups.find(g => g.id === enemy.groupId);
            let rush = false;
            if (group) {
                const alive = group.members.filter(e => e.health > 0);
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
// 보스 타입별 특성과 능력을 정의
const BOSS_TYPES = {
    TANK: {
        name: t('bossTank'),
        health: 1000,
        speed: 0.01,
        reward: 100,
        color: 'brown',
        ability: 'shield' // 일정 시간 무적
    },
    SPEED: {
        name: t('bossSpeed'),
        health: 500,
        speed: 0.03,
        reward: 150,
        color: 'cyan',
        ability: 'dash' // 순간 이동
    },
    SUMMONER: {
        name: t('bossSummoner'),
        health: 800,
        speed: 0.015,
        reward: 200,
        color: 'green',
        ability: 'summon' // 적 소환
    }
};

// Enemy 클래스
// 각 적 객체는 Enemy 클래스를 통해 생성되며, 위치, 체력, 속도 등 다양한 속성을 가짐
class Enemy {
    // 생성자: 적의 초기 속성을 설정
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
                    this.name = t('normalEnemy');
                    this.baseSpeed = 0.007;
                    this.speed = this.baseSpeed;
                    this.health = 100;
                    this.maxHealth = 100;
                    this.baseReward = 10;
                    this.baseExperience = 5;
                    this.color = 'red';
                    break;
                case 'FAST':
                    this.name = t('fastEnemy');
                    this.baseSpeed = 0.01;
                    this.speed = this.baseSpeed;
                    this.health = 50;
                    this.maxHealth = 50;
                    this.baseReward = 15;
                    this.baseExperience = 8;
                    this.color = 'yellow';
                    break;
                case 'TANK':
                    this.name = t('tankEnemy');
                    this.baseSpeed = 0.004;
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
                    this.name = t('healerEnemy');
                    this.baseSpeed = 0.005;
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

    // 적의 초기 레벨을 계산
    calculateInitialLevel(wave) {
        // 웨이브에 따라 초기 레벨 계산 (최소 1)
        const baseLevel = Math.floor(wave / 2);
        const randomBonus = Math.random() < 0.3 ? 1 : 0; // 30% 확률로 추가 레벨
        return Math.max(1, Math.min(baseLevel + randomBonus, ENEMY_LEVEL_SETTINGS.maxLevel));
    }

    // 레벨에 따른 체력 계산
    calculateLeveledHealth(baseHealth) {
        return Math.floor(baseHealth * Math.pow(ENEMY_LEVEL_SETTINGS.healthMultiplier, this.level - 1));
    }

    // 레벨에 따른 속도 계산
    calculateLeveledSpeed(baseSpeed) {
        return baseSpeed * Math.pow(ENEMY_LEVEL_SETTINGS.speedMultiplier, this.level - 1);
    }

    // 레벨에 따른 보상 계산
    calculateLeveledReward(baseReward) {
        return baseReward * Math.pow(ENEMY_LEVEL_SETTINGS.rewardMultiplier, this.level - 1);
    }

    // 레벨에 따른 경험치 계산
    calculateLeveledExperience(baseExperience) {
        return baseExperience * Math.pow(ENEMY_LEVEL_SETTINGS.experienceMultiplier, this.level - 1);
    }

    // 레벨업 시도
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

    // 상태 효과 적용
    applyStatusEffect(effectType, duration) {
        const effect = STATUS_EFFECTS[effectType];
        if (!effect) return;
        // 보스는 상태이상 지속시간 50% 감소
        let actualDuration = duration || effect.duration;
        if (this.isBoss) actualDuration = Math.ceil(actualDuration * 0.5);
        if (this.statusEffects.has(effectType)) {
            const current = this.statusEffects.get(effectType);
            current.remaining = Math.max(current.remaining, actualDuration);
        } else {
            this.statusEffects.set(effectType, {
                duration: actualDuration,
                remaining: actualDuration
            });
            switch (effectType) {
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

    // 상태 효과 업데이트
    updateStatusEffects() {
        for (const [effectType, effect] of this.statusEffects) {
            effect.remaining--;

            if (effect.remaining <= 0) {
                // 효과 제거
                switch (effectType) {
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

    // 주변 적 치유 (치유사 타입 전용)
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

    // 적 상태 업데이트
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
            const before = { x: this.x, y: this.y, pathIndex: this.pathIndex };
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
            showSpecialEffect(this.x, this.y, t(this.skill.name));
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

    // 적 그리기
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
        ctx.strokeText(`${t(this.name)}${this.pattern?.name ? ' [' + t(this.pattern.name) + ']' : ''}`, barX + barW / 2, barY - 6); // -4 → -6
        ctx.fillStyle = '#fff';
        ctx.fillText(`${t(this.name)}${this.pattern?.name ? ' [' + t(this.pattern.name) + ']' : ''}`, barX + barW / 2, barY - 6);

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

    // 데미지 처리
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

    // 사망 처리
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
        if (this.isBoss) {
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

// 적 그룹 클래스
// 여러 적을 하나의 그룹으로 관리
class EnemyGroup {
    // 생성자: 그룹 초기화
    constructor(id, size, type = null) {
        this.id = id;
        this.size = size;
        this.type = type; // 그룹 전체 타입(선택)
        this.members = [];
        this.color = `hsl(${Math.floor(Math.random() * 360)}, 60%, 60%)`;
    }

    // 적 추가
    add(enemy) {
        enemy.groupId = this.id;
        enemy.groupColor = this.color;
        this.members.push(enemy);
    }

    // 생존한 적 수 계산
    aliveCount() {
        return this.members.filter(e => e.health > 0).length;
    }
}

// 저장된 데이터로부터 적 생성
function enemyFromData(data) {
    // 패턴 이름을 영문으로 변환
    const patternMap = {
        [t('enemyPatternAmbush')]: "AMBUSH",
        [t('enemyPatternSwarm')]: "SWARM",
        [t('enemyPatternNormal')]: "NORMAL",
        [t('enemyPatternZigzag')]: "ZIGZAG",
        [t('enemyPatternGroupRush')]: "GROUP_RUSH",
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

// 그룹 연결선 그리기
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
                    start.x * TILE_SIZE + TILE_SIZE / 2,
                    start.y * TILE_SIZE + TILE_SIZE / 2
                );
                ctx.lineTo(
                    end.x * TILE_SIZE + TILE_SIZE / 2,
                    end.y * TILE_SIZE + TILE_SIZE / 2
                );
                ctx.stroke();
            }
            ctx.restore();
        }
    });
}

// 전역 객체에 노출
window.ENEMY_TYPES = ENEMY_TYPES;
window.ENEMY_PATTERNS = ENEMY_PATTERNS;
window.BOSS_TYPES = BOSS_TYPES;
window.Enemy = Enemy;
window.EnemyGroup = EnemyGroup;
window.enemyFromData = enemyFromData;
window.enemies = enemies;
window.enemyGroups = enemyGroups;
window.drawGroupConnections = drawGroupConnections; 