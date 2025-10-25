/**
 * ChipGames Tower Defense Service Worker
 * GitHub Pages 환경에서 오프라인 지원 및 캐싱 최적화
 */

const CACHE_NAME = 'chipgames-td-v1.0.0';
const STATIC_CACHE = 'chipgames-static-v1.0.0';
const DYNAMIC_CACHE = 'chipgames-dynamic-v1.0.0';

// 캐시할 정적 리소스
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/images/ChipGames_Logo.webp',
    '/images/ChipGames_favicon.ico',
    '/lang/i18n.js',
    '/lang/translations.ko.js',
    '/lang/translations.en.js',
    '/lang/translations.zh.js',
    '/lang/translations.ja.js',
    '/src/common.js',
    '/src/ui.js',
    '/src/gameState.js',
    '/src/tower.js',
    '/src/enemy.js',
    '/src/saveSystem.js',
    '/src/sound.js',
    '/src/game.js',
    '/site.webmanifest',
    '/robots.txt',
    '/sitemap.xml'
];

// 파비콘 파일들 (선택적 캐싱)
const FAVICON_ASSETS = [
    '/images/ChipGames_favicon-16x16.png',
    '/images/ChipGames_favicon-32x32.png',
    '/images/ChipGames_favicon-180x180.png',
    '/images/ChipGames_favicon-192x192.png',
    '/images/ChipGames_favicon-512x512.png'
];

// 캐시할 사운드 파일 (지연 로딩)
const SOUND_ASSETS = [
    '/sounds/ui_click.mp3',
    '/sounds/game_start.mp3'
];

// Service Worker 설치
self.addEventListener('install', function(event) {
    //console.log('Service Worker 설치 중...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(function(cache) {
                //console.log('정적 리소스 캐싱 중...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(function() {
                //console.log('정적 리소스 캐싱 완료');
                // 파비콘 파일들은 선택적으로 캐싱 (실패해도 계속 진행)
                return caches.open(STATIC_CACHE).then(function(cache) {
                    return Promise.allSettled(
                        FAVICON_ASSETS.map(function(url) {
                            return cache.add(url).catch(function(error) {
                                //console.log('파비콘 캐싱 실패 (무시):', url, error);
                                return null;
                            });
                        })
                    );
                });
            })
            .then(function() {
                //console.log('Service Worker 설치 완료');
                return self.skipWaiting();
            })
    );
});

// Service Worker 활성화
self.addEventListener('activate', function(event) {
    //console.log('Service Worker 활성화 중...');
    
    event.waitUntil(
        caches.keys()
            .then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            //console.log('오래된 캐시 삭제:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(function() {
                //console.log('Service Worker 활성화 완료');
                return self.clients.claim();
            })
    );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', function(event) {
    const request = event.request;
    const url = new URL(request.url);
    
    // GitHub Pages 도메인만 처리
    if (url.origin !== location.origin) {
        return;
    }
    
    // HTML 페이지 요청
    if (request.destination === 'document') {
        event.respondWith(
            caches.match(request)
                .then(function(response) {
                    if (response) {
                        return response;
                    }
                    return fetch(request)
                        .then(function(fetchResponse) {
                            return caches.open(DYNAMIC_CACHE)
                                .then(function(cache) {
                                    cache.put(request, fetchResponse.clone());
                                    return fetchResponse;
                                });
                        })
                        .catch(function() {
                            // 오프라인 시 기본 페이지 반환
                            return caches.match('/index.html');
                        });
                })
        );
    }
    
    // 정적 리소스 요청
    else if (request.destination === 'script' || 
             request.destination === 'style' || 
             request.destination === 'image') {
        event.respondWith(
            caches.match(request)
                .then(function(response) {
                    if (response) {
                        return response;
                    }
                    return fetch(request)
                        .then(function(fetchResponse) {
                            return caches.open(DYNAMIC_CACHE)
                                .then(function(cache) {
                                    cache.put(request, fetchResponse.clone());
                                    return fetchResponse;
                                });
                        });
                })
        );
    }
    
    // 사운드 파일 요청 (지연 로딩)
    else if (request.destination === 'audio') {
        event.respondWith(
            caches.match(request)
                .then(function(response) {
                    if (response) {
                        return response;
                    }
                    return fetch(request)
                        .then(function(fetchResponse) {
                            return caches.open(DYNAMIC_CACHE)
                                .then(function(cache) {
                                    cache.put(request, fetchResponse.clone());
                                    return fetchResponse;
                                });
                        })
                        .catch(function() {
                            // 사운드 로딩 실패 시 빈 응답
                            return new Response('', { status: 404 });
                        });
                })
        );
    }
});

// 백그라운드 동기화 (게임 데이터 저장)
self.addEventListener('sync', function(event) {
    if (event.tag === 'game-save') {
        event.waitUntil(
            // 게임 저장 데이터 동기화 로직
            //console.log('게임 데이터 동기화 중...')
        );
    }
});

// 푸시 알림 (게임 업데이트 등)
self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/images/ChipGames_favicon-192x192.png',
            badge: '/images/ChipGames_favicon-192x192.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            }
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

console.log('🚀 ChipGames Service Worker 로드 완료');
