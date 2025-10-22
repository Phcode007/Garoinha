// Funções utilitárias do Garoinha

const utils = {
  /**
   * Converte graus em direção cardinal do vento
   * @param {number} degrees - Graus (0-360)
   * @returns {string} Direção cardinal (N, NE, L, etc.)
   */
  getWindDirection(degrees) {
    const index = Math.round(degrees / 45) % 8;
    return CONFIG.WIND_DIRECTIONS[index];
  },

  /**
   * Obtém informações do clima baseado no código
   * @param {number} code - Código do clima Open-Meteo
   * @returns {object} Objeto com descrição, ícone e cor
   */
  getWeatherInfo(code) {
    return CONFIG.WEATHER_CODES[code] || CONFIG.WEATHER_CODES[0];
  },

  /**
   * Arredonda temperatura para número inteiro
   * @param {number} temp - Temperatura
   * @returns {number} Temperatura arredondada
   */
  roundTemperature(temp) {
    return Math.round(temp);
  },

  /**
   * Valida se o input da cidade não está vazio
   * @param {string} cityName - Nome da cidade
   * @returns {boolean} True se válido
   */
  validateCityInput(cityName) {
    return cityName && cityName.trim().length > 0;
  },

  /**
   * Formata a velocidade do vento
   * @param {number} speed - Velocidade em km/h
   * @returns {string} Velocidade formatada
   */
  formatWindSpeed(speed) {
    return `${Math.round(speed)} km/h`;
  },

  /**
   * Formata a umidade
   * @param {number} humidity - Umidade relativa
   * @returns {string} Umidade formatada
   */
  formatHumidity(humidity) {
    return `${humidity}%`;
  },

  /**
   * Formata a temperatura com unidade
   * @param {number} temp - Temperatura
   * @returns {string} Temperatura formatada
   */
  formatTemperature(temp) {
    return `${Math.round(temp)}°C`;
  },

  /**
   * Debounce - Atrasa a execução de uma função
   * @param {Function} func - Função a ser executada
   * @param {number} delay - Tempo de espera em ms
   * @returns {Function} Função com debounce
   */
  debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },

  /**
   * Salva dados no localStorage
   * @param {string} key - Chave
   * @param {any} value - Valor (será convertido para JSON)
   */
  saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error);
    }
  },

  /**
   * Recupera dados do localStorage
   * @param {string} key - Chave
   * @returns {any} Valor recuperado ou null
   */
  getFromStorage(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Erro ao ler do localStorage:", error);
      return null;
    }
  },

  /**
   * Adiciona cidade ao histórico de buscas recentes
   * @param {object} cityData - Dados da cidade
   */
  addToRecentCities(cityData) {
    let recent = this.getFromStorage(CONFIG.STORAGE.RECENT_CITIES) || [];

    // Remove duplicatas
    recent = recent.filter(
      (city) =>
        !(city.name === cityData.name && city.country === cityData.country)
    );

    // Adiciona no início
    recent.unshift({
      name: cityData.name,
      country: cityData.country,
      state: cityData.state,
      timestamp: Date.now(),
    });

    // Limita ao máximo configurado
    recent = recent.slice(0, CONFIG.DEFAULTS.MAX_RECENT_CITIES);

    this.saveToStorage(CONFIG.STORAGE.RECENT_CITIES, recent);
  },

  /**
   * Obtém cidades recentes
   * @returns {Array} Lista de cidades recentes
   */
  getRecentCities() {
    return this.getFromStorage(CONFIG.STORAGE.RECENT_CITIES) || [];
  },

  /**
   * Formata data/hora de forma legível
   * @param {number} timestamp - Timestamp em ms
   * @returns {string} Data formatada
   */
  formatDateTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Menos de 1 hora
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return minutes <= 1 ? "agora mesmo" : `há ${minutes} minutos`;
    }

    // Menos de 24 horas
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return hours === 1 ? "há 1 hora" : `há ${hours} horas`;
    }

    // Mais de 24 horas
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  /**
   * Limpa o histórico de buscas
   */
  clearRecentCities() {
    localStorage.removeItem(CONFIG.STORAGE.RECENT_CITIES);
  },

  /**
   * Detecta se é dispositivo móvel
   * @returns {boolean} True se for mobile
   */
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },

  /**
   * Capitaliza primeira letra de cada palavra
   * @param {string} str - String para capitalizar
   * @returns {string} String capitalizada
   */
  capitalize(str) {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  },

  // MÉTODOS PARA FAVORITOS E TEMA

  /**
   * Adiciona cidade aos favoritos
   * @param {object} cityData - Dados da cidade
   */
  addToFavorites(cityData) {
    let favorites = this.getFromStorage(CONFIG.STORAGE.FAVORITE_CITIES) || [];

    // Evitar duplicatas
    if (
      !favorites.find(
        (fav) => fav.name === cityData.name && fav.country === cityData.country
      )
    ) {
      favorites.push({
        name: cityData.name,
        country: cityData.country,
        state: cityData.state,
        timestamp: Date.now(),
      });

      this.saveToStorage(CONFIG.STORAGE.FAVORITE_CITIES, favorites);
    }
  },

  /**
   * Remove cidade dos favoritos
   * @param {string} cityName - Nome da cidade
   * @param {string} country - País
   */
  removeFromFavorite(cityName, country) {
    let favorites = this.getFromStorage(CONFIG.STORAGE.FAVORITE_CITIES) || [];
    favorites = favorites.filter(
      (fav) => !(fav.name === cityName && fav.country === country)
    );
    this.saveToStorage(CONFIG.STORAGE.FAVORITE_CITIES, favorites);
  },

  /**
   * Obtém lista de cidades favoritas
   * @returns {Array} Lista de favoritos
   */
  getFavorites() {
    return this.getFromStorage(CONFIG.STORAGE.FAVORITE_CITIES) || [];
  },

  /**
   * Alterna entre temas claro e escuro
   */
  toggleTheme() {
    const currentTheme = this.getFromStorage(CONFIG.STORAGE.THEME) || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";

    this.saveToStorage(CONFIG.STORAGE.THEME, newTheme);
    this.applyTheme(newTheme);
  },

  /**
   * Aplica o tema selecionado
   * @param {string} theme - 'light' ou 'dark'
   */
  applyTheme(theme) {
    const themeConfig = CONFIG.THEME[theme.toUpperCase()];

    // Aplicar variáveis CSS
    document.documentElement.style.setProperty(
      "--bg-gradient",
      themeConfig.background
    );
    document.documentElement.style.setProperty("--card-bg", themeConfig.cardBg);
    document.documentElement.style.setProperty(
      "--text-color",
      themeConfig.text
    );
    document.documentElement.style.setProperty(
      "--secondary-text",
      themeConfig.secondaryText
    );

    // Atualizar botão de tema
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      themeToggle.innerHTML = theme === "light" ? "🌙" : "☀️";
      themeToggle.setAttribute(
        "aria-label",
        theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"
      );
    }
  },

  /**
   * Obtém o tema atual
   * @returns {string} 'light' ou 'dark'
   */
  getCurrentTheme() {
    return this.getFromStorage(CONFIG.STORAGE.THEME) || "light";
  },

  /**
   * Verifica se uma cidade está nos favoritos
   * @param {string} cityName - Nome da cidade
   * @param {string} country - País
   * @returns {boolean} True se for favorita
   */
  isFavorite(cityName, country) {
    const favorites = this.getFavorites();
    return favorites.some(
      (fav) => fav.name === cityName && fav.country === country
    );
  },

  // NOVOS MÉTODOS PARA FUNCIONALIDADE OFFLINE

  /**
   * Salva dados offline para uso sem conexão
   * @param {object} weatherData - Dados do clima
   */
  saveOfflineData(weatherData) {
    const offlineData = {
      data: weatherData,
      timestamp: Date.now(),
      cityName: weatherData.cityName,
      country: weatherData.country,
    };

    this.saveToStorage(CONFIG.STORAGE.OFFLINE_DATA, offlineData);
  },

  /**
   * Obtém dados salvos offline
   * @returns {object|null} Dados offline ou null
   */
  getOfflineData() {
    const offlineData = this.getFromStorage(CONFIG.STORAGE.OFFLINE_DATA);

    if (!offlineData) {
      return null;
    }

    // Verificar se os dados não estão muito antigos (mais de 2 horas)
    const isExpired = Date.now() - offlineData.timestamp > 2 * 60 * 60 * 1000;

    if (isExpired) {
      this.clearOfflineData();
      return null;
    }

    return offlineData;
  },

  /**
   * Limpa dados offline
   */
  clearOfflineData() {
    localStorage.removeItem(CONFIG.STORAGE.OFFLINE_DATA);
  },

  /**
   * Verifica se está online
   * @returns {boolean} True se online
   */
  isOnline() {
    return navigator.onLine;
  },

  /**
   * Verifica suporte a Service Worker
   * @returns {boolean} True se suportado
   */
  supportsServiceWorker() {
    return "serviceWorker" in navigator && CONFIG.SERVICE_WORKER.ENABLED;
  },

  /**
   * Mostra notificação offline
   */
  showOfflineNotification() {
    // Criar notificação temporária
    const notification = document.createElement("div");
    notification.className = "offline-notification";
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">📶</span>
        <span class="notification-text">${CONFIG.MESSAGES.OFFLINE_MESSAGE}</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Remover após 3 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  },

  /**
   * Obtém dados de geolocalização do usuário
   * @returns {Promise<object>} Promise com coordenadas
   */
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalização não suportada"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000,
        }
      );
    });
  },

  /**
   * Formata bytes para formato legível
   * @param {number} bytes - Bytes para formatar
   * @returns {string} String formatada
   */
  formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  /**
   * Verifica se é primeiro acesso
   * @returns {boolean} True se for primeiro acesso
   */
  isFirstVisit() {
    const hasVisited = this.getFromStorage("garoinha_has_visited");
    if (!hasVisited) {
      this.saveToStorage("garoinha_has_visited", true);
      return true;
    }
    return false;
  },

  /**
   * Gera ID único
   * @returns {string} ID único
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
};
