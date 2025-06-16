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
            document.body.classList.toggle('low-spec-mode', this.checked);
            // 게임 성능 설정 업데이트
            if (typeof updatePerformanceSettings === 'function') {
                updatePerformanceSettings(this.checked);
            }
        });
    }
}); 