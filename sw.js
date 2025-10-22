// Service Worker do Garoinha - Para funcionalidade offline
const CACHE_NAME = "garoinha-v1.2";
const urlsToCache = [
  "/",
  "/index.html",
  "/styles/style.css",
  "/config/config.js",
  "/js/utils.js",
  "/js/api.js",
  "/js/ui.js",
  "/js/app.js",
  "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap",
];

// Instalação do Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker: Instalando...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Cacheando arquivos");
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log("Service Worker: Instalação completa");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker: Erro na instalação:", error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Ativando...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log("Service Worker: Removendo cache antigo:", cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker: Ativação completa");
        return self.clients.claim();
      })
  );
});

// Interceptação de requisições
self.addEventListener("fetch", (event) => {
  // Ignorar requisições não GET
  if (event.request.method !== "GET") {
    return;
  }

  // Ignorar requisições para APIs externas (para sempre obter dados atualizados)
  if (event.request.url.includes("open-meteo.com")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna do cache se encontrado
      if (response) {
        console.log("Service Worker: Retornando do cache:", event.request.url);
        return response;
      }

      // Faz requisição network
      return fetch(event.request)
        .then((networkResponse) => {
          // Não cachear respostas inválidas
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          // Clona a resposta para cache
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
            console.log(
              "Service Worker: Cacheando novo recurso:",
              event.request.url
            );
          });

          return networkResponse;
        })
        .catch((error) => {
          console.log("Service Worker: Erro na requisição:", error);

          // Para páginas HTML, retorna página offline
          if (event.request.destination === "document") {
            return caches.match("/index.html");
          }

          throw error;
        });
    })
  );
});

// Mensagens do Service Worker
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Sincronização em background (para futuras funcionalidades)
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    console.log("Service Worker: Sincronização em background");
    // Aqui você pode implementar sincronização de dados
  }
});
