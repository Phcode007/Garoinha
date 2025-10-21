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
};
