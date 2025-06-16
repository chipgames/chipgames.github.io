// UI/UX 관련 코드
document.addEventListener('DOMContentLoaded', function() {
    // 게임 설명 모달
    const descriptionBtn = document.getElementById('descriptionBtn');
    const descriptionModal = document.getElementById('descriptionModal');

    if (descriptionBtn && descriptionModal) {
        descriptionBtn.addEventListener('click', function(e) {
            e.preventDefault();
            descriptionModal.classList.add('show');
        });
    }

    // 이용 방법 모달
    const howtoBtn = document.getElementById('howtoBtn');
    const howtoModal = document.getElementById('howtoModal');

    if (howtoBtn && howtoModal) {
        howtoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            howtoModal.classList.add('show');
        });
    }

    // 도움말 모달
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');

    if (helpBtn && helpModal) {
        helpBtn.addEventListener('click', function(e) {
            e.preventDefault();
            helpModal.classList.add('show');
        });
    }

    // 상단 가이드 메뉴 클릭 시 메인 가이드 모달 열기
    const navGuide = document.querySelector('a[href="#guides"]');
    const mainGuideModal = document.getElementById('mainGuideModal');

    if (navGuide && mainGuideModal) {
        navGuide.addEventListener('click', function(e) {
            e.preventDefault();
            mainGuideModal.classList.add('show');
        });
    }

    // 메인 가이드 모달에서 각 상세 가이드로 이동
    const openBeginnerGuideFromMain = document.getElementById('openBeginnerGuideFromMain');
    const openTowerGuideFromMain = document.getElementById('openTowerGuideFromMain');
    const openStrategyGuideFromMain = document.getElementById('openStrategyGuideFromMain');
    const beginnerGuideModal = document.getElementById('beginnerGuideModal');
    const towerGuideModal = document.getElementById('towerGuideModal');
    const strategyGuideModal = document.getElementById('strategyGuideModal');

    if (openBeginnerGuideFromMain && beginnerGuideModal) {
        openBeginnerGuideFromMain.addEventListener('click', function(e) {
            e.preventDefault();
            mainGuideModal.classList.remove('show');
            beginnerGuideModal.classList.add('show');
        });
    }

    if (openTowerGuideFromMain && towerGuideModal) {
        openTowerGuideFromMain.addEventListener('click', function(e) {
            e.preventDefault();
            mainGuideModal.classList.remove('show');
            towerGuideModal.classList.add('show');
        });
    }

    if (openStrategyGuideFromMain && strategyGuideModal) {
        openStrategyGuideFromMain.addEventListener('click', function(e) {
            e.preventDefault();
            mainGuideModal.classList.remove('show');
            strategyGuideModal.classList.add('show');
        });
    }

    // 왼쪽 메뉴 클릭 시 가이드 모달 열기
    const beginnerGuideLink = document.querySelector('a[href="#beginner-guide"]');
    const towerGuideLink = document.querySelector('a[href="#tower-guide"]');
    const strategyGuideLink = document.querySelector('a[href="#strategy-guide"]');

    if (beginnerGuideLink && beginnerGuideModal) {
        beginnerGuideLink.addEventListener('click', function(e) {
            e.preventDefault();
            beginnerGuideModal.classList.add('show');
        });
    }

    if (towerGuideLink && towerGuideModal) {
        towerGuideLink.addEventListener('click', function(e) {
            e.preventDefault();
            towerGuideModal.classList.add('show');
        });
    }

    if (strategyGuideLink && strategyGuideModal) {
        strategyGuideLink.addEventListener('click', function(e) {
            e.preventDefault();
            strategyGuideModal.classList.add('show');
        });
    }

    // 각 가이드 모달의 닫기 버튼
    const closeBeginnerGuide = document.getElementById('closeBeginnerGuide');
    const closeTowerGuide = document.getElementById('closeTowerGuide');
    const closeStrategyGuide = document.getElementById('closeStrategyGuide');

    if (closeBeginnerGuide && beginnerGuideModal) {
        closeBeginnerGuide.addEventListener('click', function() {
            beginnerGuideModal.classList.remove('show');
        });
    }

    if (closeTowerGuide && towerGuideModal) {
        closeTowerGuide.addEventListener('click', function() {
            towerGuideModal.classList.remove('show');
        });
    }

    if (closeStrategyGuide && strategyGuideModal) {
        closeStrategyGuide.addEventListener('click', function() {
            strategyGuideModal.classList.remove('show');
        });
    }

    // X 버튼 및 모달 배경 클릭 시 닫기 (이벤트 위임)
    document.addEventListener('click', function(e) {
        // X 버튼 클릭
        if (e.target.classList.contains('modal-close')) {
            const modal = e.target.closest('.modal');
            if (modal) modal.classList.remove('show');
        }
        // 모달 배경 클릭 (modal-content 바깥)
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });

    // 햄버거 메뉴 토글
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('open');
        });
    }

    // 퀵 가이드 플로팅 버튼 클릭 시 게임 가이드 모달 열기
    const quickGuideBtn = document.getElementById('quickGuideBtn');
    if (quickGuideBtn && mainGuideModal) {
        quickGuideBtn.addEventListener('click', function() {
            mainGuideModal.classList.add('show');
        });
    }

    // 가이드 탭 전환 기능
    const guideTabs = document.querySelectorAll('.guide-tab');
    const guideSections = {
        beginner: document.getElementById('guide-beginner'),
        tower: document.getElementById('guide-tower'),
        strategy: document.getElementById('guide-strategy'),
        faq: document.getElementById('guide-faq')
    };
    guideTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            guideTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            Object.values(guideSections).forEach(sec => sec.style.display = 'none');
            const key = this.getAttribute('data-tab');
            if (guideSections[key]) guideSections[key].style.display = 'block';
        });
    });

    // 타워 툴팁 기능
    const towerTooltipData = {
        BASIC: '기본 타워\n- 저렴한 비용, 빠른 공격 속도\n- 범용적으로 사용 가능\n- 초반 방어선 구축에 적합',
        ICE: '얼음 타워\n- 적을 느리게 만드는 빙결 효과\n- 빠른 적/보스 이동을 늦춤\n- 업그레이드 시 빙결 지속 증가',
        POISON: '독 타워\n- 지속적인 독 데미지 부여\n- 체력이 높은 적/보스에 효과적\n- 업그레이드 시 독 데미지/지속 증가',
        LASER: '레이저 타워\n- 강력한 단일 공격, 연속 데미지\n- 업그레이드 시 보스 처치에 매우 유용',
        SPLASH: '스플래시 타워\n- 범위 공격 및 감속 효과\n- 적이 몰려올 때 효율적',
        SUPPORT: '지원 타워\n- 주변 타워의 공격력을 강화\n- 여러 타워와 조합 시 전체 방어력 상승'
    };
    let tooltipEl = null;
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
    function hideTowerTooltip() {
        if (tooltipEl) {
            tooltipEl.classList.remove('show');
            setTimeout(() => { if (tooltipEl) tooltipEl.remove(); tooltipEl = null; }, 150);
        }
    }
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

    // 가이드 검색 기능
    const guideSearchInput = document.getElementById('guideSearchInput');
    if (guideSearchInput) {
        guideSearchInput.addEventListener('input', function() {
            const keyword = this.value.trim().toLowerCase();
            document.querySelectorAll('.guide-section').forEach(section => {
                // 모든 하이라이트 제거
                section.querySelectorAll('.highlight').forEach(h => {
                    h.outerHTML = h.innerText;
                });
                // li, span, p 등 텍스트 요소만 필터링
                const items = section.querySelectorAll('li, span.tower-tooltip, p, div');
                let anyVisible = false;
                items.forEach(item => {
                    if (!keyword) {
                        item.style.display = '';
                    } else {
                        const text = item.innerText.toLowerCase();
                        if (text.includes(keyword)) {
                            item.style.display = '';
                            // 하이라이트 처리
                            const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                            item.innerHTML = item.innerHTML.replace(regex, '<span class="highlight">$1</span>');
                            anyVisible = true;
                        } else {
                            item.style.display = 'none';
                        }
                    }
                });
                // 섹션 전체 숨김/표시
                section.style.display = (!keyword || anyVisible) ? (section.classList.contains('active') ? 'block' : '') : 'none';
            });
        });
    }

    // ESC로 모든 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(modal => {
                modal.classList.remove('show');
            });
        }
    });

    // 가이드 탭 키보드 접근성(Enter/Space로 탭 전환)
    guideTabs.forEach(tab => {
        tab.setAttribute('tabindex', '0');
        tab.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // 툴팁 대상 포커스 가능하게 tabindex 추가
    document.querySelectorAll('.tower-tooltip, .enemy-tooltip, .skill-tooltip').forEach(el => {
        el.setAttribute('tabindex', '0');
    });

    // 적 툴팁 데이터
    const enemyTooltipData = {
        TANK: '탱커\n- 높은 체력과 방어력\n- 느린 이동 속도\n- 단일 공격 타워에 취약',
        SWARM: '무리 적\n- 낮은 체력, 빠른 이동\n- 다수 등장\n- 범위 공격 타워에 취약'
    };

    // 스킬 툴팁 데이터
    const skillTooltipData = {
        SHIELD: '방어막\n- 일시적으로 데미지 감소\n- 지속 시간 동안 무적',
        TELEPORT: '순간이동\n- 짧은 거리 순간 이동\n- 타워 공격 회피',
        SUMMON: '소환\n- 추가 적 소환\n- 전투력 증가'
    };

    // 적 툴팁 기능
    document.querySelectorAll('.enemy-tooltip').forEach(el => {
        el.addEventListener('mouseenter', function() {
            const type = this.getAttribute('data-type');
            if (!type || !enemyTooltipData[type]) return;
            if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.className = 'tooltip';
                document.body.appendChild(tooltipEl);
            }
            tooltipEl.textContent = enemyTooltipData[type];
            tooltipEl.classList.add('show');
            const rect = this.getBoundingClientRect();
            const scrollY = window.scrollY || window.pageYOffset;
            tooltipEl.style.left = `${rect.left + rect.width/2 - tooltipEl.offsetWidth/2}px`;
            tooltipEl.style.top = `${rect.bottom + scrollY + 8}px`;
        });
        el.addEventListener('mouseleave', hideTowerTooltip);
        el.addEventListener('focus', function() {
            const type = this.getAttribute('data-type');
            if (!type || !enemyTooltipData[type]) return;
            if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.className = 'tooltip';
                document.body.appendChild(tooltipEl);
            }
            tooltipEl.textContent = enemyTooltipData[type];
            tooltipEl.classList.add('show');
            const rect = this.getBoundingClientRect();
            const scrollY = window.scrollY || window.pageYOffset;
            tooltipEl.style.left = `${rect.left + rect.width/2 - tooltipEl.offsetWidth/2}px`;
            tooltipEl.style.top = `${rect.bottom + scrollY + 8}px`;
        });
        el.addEventListener('blur', hideTowerTooltip);
    });

    // 스킬 툴팁 기능
    document.querySelectorAll('.skill-tooltip').forEach(el => {
        el.addEventListener('mouseenter', function() {
            const type = this.getAttribute('data-type');
            if (!type || !skillTooltipData[type]) return;
            if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.className = 'tooltip';
                document.body.appendChild(tooltipEl);
            }
            tooltipEl.textContent = skillTooltipData[type];
            tooltipEl.classList.add('show');
            const rect = this.getBoundingClientRect();
            const scrollY = window.scrollY || window.pageYOffset;
            tooltipEl.style.left = `${rect.left + rect.width/2 - tooltipEl.offsetWidth/2}px`;
            tooltipEl.style.top = `${rect.bottom + scrollY + 8}px`;
        });
        el.addEventListener('mouseleave', hideTowerTooltip);
        el.addEventListener('focus', function() {
            const type = this.getAttribute('data-type');
            if (!type || !skillTooltipData[type]) return;
            if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.className = 'tooltip';
                document.body.appendChild(tooltipEl);
            }
            tooltipEl.textContent = skillTooltipData[type];
            tooltipEl.classList.add('show');
            const rect = this.getBoundingClientRect();
            const scrollY = window.scrollY || window.pageYOffset;
            tooltipEl.style.left = `${rect.left + rect.width/2 - tooltipEl.offsetWidth/2}px`;
            tooltipEl.style.top = `${rect.bottom + scrollY + 8}px`;
        });
        el.addEventListener('blur', hideTowerTooltip);
    });

    // 저사양 모드 토글
    const lowSpecToggle = document.getElementById('lowSpecToggle');
    if (lowSpecToggle) {
        lowSpecToggle.addEventListener('change', function() {
            applyLowSpecMode(this.checked);
        });
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

    // 웨이브 진행 상태 표시
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

        // 메뉴 위치 계산 (화면 밖으로 나가지 않도록)
        const menuWidth = 300;
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
        
        towerMenu.style.left = `${left}px`;
        towerMenu.style.top = `${top}px`;

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
                    hideTowerRangePreview(); // 타워 설치 후 미리보기 즉시 제거
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
                    <span class="stat-value">${Math.floor(tower.damage)}</span>
                </div>
                <div class="stat">
                    <span class="stat-icon">🎯</span>
                    <span class="stat-value">${tower.range}</span>
                </div>
                <div class="stat">
                    <span class="stat-icon">⚡</span>
                    <span class="stat-value">${(60 / tower.maxCooldown).toFixed(1)}</span>
                </div>
            </div>
        `;
        menu.appendChild(header);
        
        // 업그레이드 옵션들
        const upgradeTypes = ['damage', 'range', 'speed'];
        const upgradeIcons = ['⚔️', '🎯', '⚡'];
        const upgradeNames = ['공격력', '사거리', '공격속도'];
        
        upgradeTypes.forEach((type, index) => {
            const isSupport = tower.type === 'SUPPORT';
            // 지원 타워는 range만 활성화
            const canUpgrade = isSupport ? (type === 'range' && tower.canUpgrade(type)) : tower.canUpgrade(type);

            const option = document.createElement('div');
            option.className = `upgrade-option ${canUpgrade ? '' : 'disabled'}`;

            // 값 표시 형식 분기
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
                    <span class="cost-value">${tower.getUpgradeCost(type)}</span>
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
            
            // 버프 효과 제거
            if (tower.type === 'SUPPORT') {
                tower.removeBuffs();
            }
            
            // 타워 제거 및 상태 업데이트
            towers = towers.filter(t => t !== tower);
            gameState.towerCount--;
            gameState.gold += sellValue;
            
            // UI 업데이트
            updateInfoBar();
            updateTowerLimit(); // 타워 개수 UI 즉시 갱신
            showRewardPopup(sellValue);
            menu.remove();
        });
        
        menu.appendChild(sellButton);
        document.body.appendChild(menu);
        
        // 메뉴 외부 클릭 시 닫기
        setupMenuCloseHandler(menu);
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

    // 특수 이벤트 표시
    function showEventNotification(message) {
        if (lowSpecMode) return;
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

    // 타워 설치/업그레이드 이펙트
    function showTowerEffect(x, y) {
        if (lowSpecMode) return;
        const effect = EffectPool.get('tower');
        
        const centerX = x * TILE_SIZE + TILE_SIZE/2;
        const centerY = y * TILE_SIZE + TILE_SIZE/2;
        
        effect.style.cssText = `
            display: block;
            left: ${centerX - TILE_SIZE/2}px;
            top: ${centerY - TILE_SIZE/2}px;
            width: ${TILE_SIZE}px;
            height: ${TILE_SIZE}px;
        `;
        
        // 사운드 재생
        playSound('tower_build');
        
        // 애니메이션 종료 후 풀로 반환
        effect.addEventListener('animationend', () => {
            EffectPool.release(effect);
        }, { once: true });
    }

    // 타워 업그레이드 이펙트
    function showUpgradeEffect(x, y) {
        if (lowSpecMode) return;
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

    // 웨이브 시작 이펙트
    function showWaveStartEffect() {
        const effect = document.createElement('div');
        effect.className = 'wave-start-effect';
        effect.innerHTML = `
            <h2>웨이브 ${gameState.wave} 시작!</h2>
            <p>적의 수: ${gameState.enemiesRemaining}</p>
        `;
        
        // .game-area에 추가
        const parent = document.querySelector('.game-area');
        if (!parent) {
            console.error('게임 영역을 찾을 수 없습니다.');
            return;
        }
        parent.appendChild(effect);

        // 중앙 배치 스타일
        effect.style.position = 'absolute';
        effect.style.left = '50%';
        effect.style.top = '50%';
        effect.style.transform = 'translate(-50%, -50%)';
        effect.style.zIndex = '2000';
        effect.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        effect.style.padding = '20px';
        effect.style.borderRadius = '10px';
        effect.style.color = '#fff';
        effect.style.textAlign = 'center';
        effect.style.animation = 'fadeInOut 2s ease-in-out';
        
        setTimeout(() => {
            effect.remove();
        }, 2000);
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

    // 게임 오버 화면
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

    // 튜토리얼 표시
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

    // 저사양 모드 적용
    function applyLowSpecMode(enabled) {
        lowSpecMode = enabled;
        document.body.classList.toggle('low-spec-mode', enabled);
        localStorage.setItem('lowSpecMode', enabled ? '1' : '0');
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

    // 웨이브 메시지 관련 변수
    let currentWaveMessage = null;
    let waveMessageStartTime = 0;

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

    // 메뉴 닫기 핸들러
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

    // 전역 객체에 함수들 노출
    window.updateInfoBar = updateInfoBar;
    window.updateWaveProgress = updateWaveProgress;
    window.updateStats = updateStats;
    window.showTowerBuildMenu = showTowerBuildMenu;
    window.showTowerUpgradeMenu = showTowerUpgradeMenu;
    window.showSaveLoadNotification = showSaveLoadNotification;
    window.showEventNotification = showEventNotification;
    window.showTowerEffect = showTowerEffect;
    window.showUpgradeEffect = showUpgradeEffect;
    window.showWaveStartEffect = showWaveStartEffect;
    window.showRewardPopup = showRewardPopup;
    window.showInsufficientGold = showInsufficientGold;
    window.showAchievement = showAchievement;
    window.showGameOver = showGameOver;
    window.restartGame = restartGame;
    window.showTutorial = showTutorial;
    window.showCountdown = showCountdown;
    window.applyLowSpecMode = applyLowSpecMode;
    window.showTowerInfo = showTowerInfo;
    window.handleTowerHover = handleTowerHover;
    window.showWaveStartMessage = showWaveStartMessage;
    window.drawWaveMessage = drawWaveMessage;
    window.setupMenuCloseHandler = setupMenuCloseHandler;
    window.showPlaceablePositions = showPlaceablePositions;

}); 