// Aplicação principal do Garoinha

const app = {
  /**
   * Inicializa a aplicação
   */
  init() {
    this.setupEventListeners();
    ui.init();
    this.loadLastSearch();
    this.registerServiceWorker();
    this.setupOfflineDetection();
    console.log("🌧️ Garoinha iniciado com sucesso!");
  },

  /**
   * Carrega última busca se existir
   */
  loadLastSearch() {
    const lastSearch = utils.getFromStorage(CONFIG.STORAGE.LAST_SEARCH);
    if (lastSearch && lastSearch.cityName) {
      // Auto-carrega apenas se foi nas últimas 24h
      const hoursSince = (Date.now() - lastSearch.timestamp) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        console.log("Carregando última busca:", lastSearch.cityName);
        this.handleSearch(lastSearch.cityName, true);
      }
    }
  },

  /**
   * Configura os event listeners
   */
  setupEventListeners() {
    const { cityInput, searchBtn } = ui.elements;

    // Busca ao clicar no botão
    searchBtn.addEventListener("click", () => {
      this.handleSearch(cityInput.value);
    });

    // Busca ao pressionar Enter
    cityInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (ui.autocomplete.isVisible && ui.autocomplete.selectedIndex >= 0) {
          ui.selectSuggestion(ui.autocomplete.selectedIndex);
        } else {
          this.handleSearch(cityInput.value);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        ui.navigateAutocomplete("down");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        ui.navigateAutocomplete("up");
      } else if (e.key === "Escape") {
        ui.hideAutocompleteSuggestions();
      }
    });

    // Autocomplete com debounce
    const debouncedAutocomplete = utils.debounce(async (value) => {
      if (value.length >= 2) {
        const suggestions = await api.fetchCitySuggestions(value);
        ui.showAutocompleteSuggestions(suggestions);
      } else {
        ui.hideAutocompleteSuggestions();
      }
    }, CONFIG.DEBOUNCE_DELAY);

    cityInput.addEventListener("input", (e) => {
      debouncedAutocomplete(e.target.value);
    });

    // Fecha autocomplete ao clicar fora
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-box")) {
        ui.hideAutocompleteSuggestions();
      }
    });

    // Limpar input ao focar (opcional)
    cityInput.addEventListener("focus", () => {
      cityInput.select();
    });

    // Atalho de teclado: Ctrl/Cmd + K para focar no input
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        cityInput.focus();
      }
    });
  },

  /**
   * Processa a busca de clima
   * @param {string} cityName - Nome da cidade
   * @param {boolean} silent - Se true, não mostra loading
   */
  async handleSearch(cityName, silent = false) {
    // Validar input
    if (!utils.validateCityInput(cityName)) {
      ui.showError("EMPTY_INPUT");
      ui.shakeInput();
      return;
    }

    try {
      // Mostrar loading
      if (!silent) {
        ui.showLoading();
      }

      // Buscar dados do clima
      const weatherData = await api.getCompleteWeatherData(cityName.trim());

      // Exibir dados na interface
      ui.showWeather(weatherData);

      // Salvar última busca
      utils.saveToStorage(CONFIG.STORAGE.LAST_SEARCH, {
        cityName: weatherData.cityName,
        timestamp: Date.now(),
      });

      // Log para debug
      console.log("Dados do clima:", weatherData);
    } catch (error) {
      // Tratar erros
      if (error.message === "CITY_NOT_FOUND") {
        ui.showError("CITY_NOT_FOUND");
      } else if (error.message === "TIMEOUT_ERROR") {
        ui.showError("A requisição demorou muito. Tente novamente.");
      } else if (error.message === "OFFLINE_ERROR") {
        ui.showError("OFFLINE_MESSAGE");
        utils.showOfflineNotification();
      } else {
        ui.showError("CONNECTION_ERROR");
      }
      console.error("Erro ao buscar clima:", error);
    }
  },

  /**
   * Busca clima da localização atual do usuário
   */
  async getWeatherByLocation() {
    if (!navigator.geolocation) {
      ui.showError("Geolocalização não suportada pelo navegador.");
      return;
    }

    ui.showLoading();

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Buscar dados do clima
          const weather = await api.fetchWeatherData(latitude, longitude);

          // Buscar nome da cidade usando reverse geocoding
          const geoUrl = `${CONFIG.API.GEOCODING}?latitude=${latitude}&longitude=${longitude}&count=1`;
          const response = await fetch(geoUrl);
          const data = await response.json();

          const cityName = data.results?.[0]?.name || "Sua localização";
          const country = data.results?.[0]?.country || "";

          // Consolidar dados
          const weatherData = {
            cityName,
            country,
            latitude,
            longitude,
            temperature: weather.temperature_2m,
            apparentTemperature: weather.apparent_temperature,
            humidity: weather.relative_humidity_2m,
            windSpeed: weather.wind_speed_10m,
            windDirection: weather.wind_direction_10m,
            weatherCode: weather.weather_code,
            precipitation: weather.precipitation || 0,
            pressure: weather.pressure_msl || 0,
            cloudCover: weather.cloud_cover || 0,
          };

          ui.showWeather(weatherData);
        } catch (error) {
          ui.showError("CONNECTION_ERROR");
          console.error("Erro ao buscar clima por localização:", error);
        }
      },
      (error) => {
        ui.showError("Não foi possível obter sua localização.");
        console.error("Erro de geolocalização:", error);
      }
    );
  },

  /**
   * Registra o Service Worker
   */
  async registerServiceWorker() {
    if (!utils.supportsServiceWorker()) {
      console.log("Service Worker não suportado");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registrado com sucesso:", registration);

      // Verificar se há uma nova versão disponível
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        console.log("Nova versão do Service Worker encontrada:", newWorker);

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            console.log(
              "Nova versão pronta. Recarregue a página para atualizar."
            );
            this.showUpdateNotification();
          }
        });
      });

      // Lidar com mensagens do Service Worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "CACHE_READY") {
          console.log("Cache do Service Worker pronto");
        }
      });
    } catch (error) {
      console.error("Falha ao registrar Service Worker:", error);
    }
  },

  /**
   * Mostra notificação de atualização
   */
  showUpdateNotification() {
    const notification = document.createElement("div");
    notification.className = "update-notification";
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">🔄</span>
        <span class="notification-text">Nova versão disponível!</span>
        <button class="update-btn" onclick="window.location.reload()">Atualizar</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Estilos inline para a notificação
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;

    notification.querySelector(".notification-content").style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
    `;

    notification.querySelector(".update-btn").style.cssText = `
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      padding: 5px 10px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 12px;
    `;
  },

  /**
   * Configura detecção de status offline/online
   */
  setupOfflineDetection() {
    window.addEventListener("online", () => {
      console.log("Aplicação online");
      this.hideOfflineIndicator();
    });

    window.addEventListener("offline", () => {
      console.log("Aplicação offline");
      this.showOfflineIndicator();
      utils.showOfflineNotification();
    });

    // Verificar status inicial
    if (!utils.isOnline()) {
      this.showOfflineIndicator();
    }
  },

  /**
   * Mostra indicador offline
   */
  showOfflineIndicator() {
    let indicator = document.getElementById("offlineIndicator");

    if (!indicator) {
      indicator = document.createElement("div");
      indicator.id = "offlineIndicator";
      indicator.innerHTML = "📶 Offline";
      indicator.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: #ff6b6b;
        color: white;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 12px;
        z-index: 10000;
      `;
      document.body.appendChild(indicator);
    }
  },

  /**
   * Esconde indicador offline
   */
  hideOfflineIndicator() {
    const indicator = document.getElementById("offlineIndicator");
    if (indicator) {
      indicator.remove();
    }
  },

  /**
   * Limpa cache e histórico (útil para debug)
   */
  clearAllData() {
    api.clearCache();
    utils.clearRecentCities();
    utils.clearOfflineData();
    localStorage.removeItem(CONFIG.STORAGE.LAST_SEARCH);
    console.log("Todos os dados foram limpos");

    // Recarregar a página
    window.location.reload();
  },
};

// Inicializar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  app.init();
});

// Expor funções úteis no console para debug
window.garoinha = {
  clearData: () => app.clearAllData(),
  getByLocation: () => app.getWeatherByLocation(),
  cacheStats: () => api.getCacheStats(),
  offlineData: () => utils.getOfflineData(),
  version: "1.2.0",
};
