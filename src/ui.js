/**
 * UI 관리 시스템
 * 게임의 사용자 인터페이스 요소들을 관리하고 업데이트하는 기능을 제공합니다.
 */

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
        TANK: t('enemyTooltipTank'),
        SWARM: t('enemyTooltipSwarm')
    };

    // 스킬 툴팁 데이터
    const skillTooltipData = {
        SHIELD: t('skillTooltipShield'),
        TELEPORT: t('skillTooltipTeleport'),
        SUMMON: t('skillTooltipSummon')
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
            <div class="upgrade-text">${t('upgradeComplete')}</div>
        `;
        
        document.querySelector('.game-area').appendChild(effect);
        
        // 사운드 재생
        playSound('upgrade');
        
        // 애니메이션 종료 후 제거
        effect.addEventListener('animationend', () => {
            effect.remove();
        });
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
                <h3>${t('waveComplete')}</h3>
                <p>${t('reward')}: <span class="gold-amount">${amount}</span> ${t('gold')}</p>
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
            achievement.textContent = `${t('achievementUnlocked')}: ${name}!`;
            achievement.style.display = 'block';
            setTimeout(() => {
                achievement.style.display = 'none';
            }, 3000);
        }
    }

    // 게임 오버 화면
    function showGameOver() {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        // 반투명 오버레이 그리기
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 게임 오버 텍스트 그리기
        ctx.fillStyle = '#FF4444';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(t('gameOver'), canvas.width / 2, canvas.height / 2 - 50);
        
        // 점수와 웨이브 정보 그리기
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.fillText(`${t('finalScore')}: ${gameState.score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText(`${t('reachedWave')}: ${gameState.wave}`, canvas.width / 2, canvas.height / 2 + 40);
        
        // 다시 시작 안내
        ctx.fillStyle = '#4CAF50';
        ctx.font = '20px Arial';
        ctx.fillText(t('pressRToRestart'), canvas.width / 2, canvas.height / 2 + 100);
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
        document.getElementById('tutorial').style.display = 'none';
    }

    // 튜토리얼 표시
    function showTutorial() {
        document.getElementById('tutorial').style.display = 'block';
    }

    // 저사양 모드 적용
    function applyLowSpecMode(enabled) {
        lowSpecMode = enabled;
        document.body.classList.toggle('low-spec-mode', enabled);
        localStorage.setItem('lowSpecMode', enabled ? '1' : '0');
    }

    // 전역 객체에 함수들 노출    
    window.showEventNotification = showEventNotification;
    window.showTowerEffect = showTowerEffect;
    window.showUpgradeEffect = showUpgradeEffect;
    window.showRewardPopup = showRewardPopup;
    window.showInsufficientGold = showInsufficientGold;
    window.showAchievement = showAchievement;
    window.showGameOver = showGameOver;
    window.restartGame = restartGame;
    window.showTutorial = showTutorial;
    window.applyLowSpecMode = applyLowSpecMode;

}); 