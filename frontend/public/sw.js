const CACHE_NAME = 'gestao-integrada-v1';

// Arquivos críticos para carregar a casca (App Shell) do PWA offline
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo-circular.png'
];

// INSTALAÇÃO: Baixa os recursos estáticos essenciais
self.addEventListener('install', event => {
  // Força a atualização imediata do Service Worker novo, ignorando a fila
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.log('Aviso: Falha ao pré-cachear assets', err))
  );
});

// ATIVAÇÃO: Limpa caches antigos e assume controle
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Assume o controle de todas as abas abertas imediatamente
  self.clients.claim();
});

// FETCH: Estratégia "Network First" (Rede primeiro, fallback para Cache)
// Ideal para sistemas de gestão, pois queremos sempre dados frescos,
// mas não queremos a tela do "dinossauro" se a conexão cair temporariamente.
self.addEventListener('fetch', event => {
  // Ignora requisições de extensões do Chrome e chamadas de API (não cachear a API)
  if (!event.request.url.startsWith('http') || event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Se a requisição for boa, clona e guarda no cache atualizado
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // Se a rede falhar (offline), tenta buscar no cache
        return caches.match(event.request);
      })
  );
});