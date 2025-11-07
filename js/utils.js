// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================

const Utils = {
  /**
   * Debounce - Atrasa execução de função
   * @param {Function} func - Função a ser executada
   * @param {number} delay - Atraso em ms
   * @returns {Function}
   */
  debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },

  /**
   * Formata data para exibição
   * @param {Date} date - Data a ser formatada
   * @returns {string}
   */
  formatDate(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `Há ${diffMins} minuto${diffMins > 1 ? "s" : ""}`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return `Há ${diffHours} hora${diffHours > 1 ? "s" : ""}`;

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  /**
   * Formata temperatura
   * @param {number} temp - Temperatura em Celsius
   * @returns {string}
   */
  formatTemperature(temp) {
    return `${Math.round(temp)}°C`;
  },

  /**
   * Formata velocidade do vento
   * @param {number} speed - Velocidade em km/h
   * @returns {string}
   */
  formatWindSpeed(speed) {
    return `${Math.round(speed)} km/h`;
  },

  /**
   * Formata umidade
   * @param {number} humidity - Umidade em %
   * @returns {string}
   */
  formatHumidity(humidity) {
    return `${Math.round(humidity)}%`;
  },

  /**
   * Formata pressão atmosférica
   * @param {number} pressure - Pressão em hPa
   * @returns {string}
   */
  formatPressure(pressure) {
    return `${Math.round(pressure)} hPa`;
  },

  /**
   * Formata cobertura de nuvens
   * @param {number} cloudCover - Cobertura em %
   * @returns {string}
   */
  formatCloudCover(cloudCover) {
    return `${Math.round(cloudCover)}%`;
  },

  /**
   * Converte direção do vento em graus para cardinal
   * @param {number} degrees - Direção em graus
   * @returns {string}
   */
  getWindDirection(degrees) {
    const directions = Object.keys(WIND_DIRECTIONS)
      .map(Number)
      .sort((a, b) => a - b);

    for (let i = 0; i < directions.length; i++) {
      const current = directions[i];
      const next = directions[i + 1] || 360;

      if (degrees >= current && degrees < next) {
        const midpoint = (current + next) / 2;
        return (
          WIND_DIRECTIONS[degrees < midpoint ? current : next] ||
          WIND_DIRECTIONS[current]
        );
      }
    }

    return WIND_DIRECTIONS[0]; // Norte como padrão
  },

  /**
   * Obtém informações do código meteorológico
   * @param {number} code - Código WMO
   * @returns {Object}
   */
  getWeatherInfo(code) {
    return (
      WEATHER_CODES[code] || {
        desc: "Desconhecido",
        icon: "❓",
        color: "#888888",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }
    );
  },

  /**
   * Sanitiza entrada de texto
   * @param {string} input - Texto a ser sanitizado
   * @returns {string}
   */
  sanitizeInput(input) {
    return input.trim().replace(/[<>]/g, "");
  },

  /**
   * Verifica se string está vazia ou apenas espaços
   * @param {string} str - String a verificar
   * @returns {boolean}
   */
  isEmpty(str) {
    return !str || str.trim().length === 0;
  },

  /**
   * Cria timeout para Promise
   * @param {Promise} promise - Promise a ser executada
   * @param {number} timeoutMs - Timeout em ms
   * @returns {Promise}
   */
  async promiseWithTimeout(promise, timeoutMs) {
    let timeoutHandle;

    const timeoutPromise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new Error("REQUEST_TIMEOUT"));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutHandle);
      return result;
    } catch (error) {
      clearTimeout(timeoutHandle);
      throw error;
    }
  },

  /**
   * Capitaliza primeira letra
   * @param {string} str - String a capitalizar
   * @returns {string}
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Gera ID único
   * @returns {string}
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Log com prefixo do app
   * @param {...any} args - Argumentos para log
   */
  log(...args) {
    console.log(`[${CONFIG.APP_NAME}]`, ...args);
  },

  /**
   * Error log com prefixo do app
   * @param {...any} args - Argumentos para erro
   */
  error(...args) {
    console.error(`[${CONFIG.APP_NAME}]`, ...args);
  },

  /**
   * Verifica se está em modo de desenvolvimento
   * @returns {boolean}
   */
  isDev() {
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    );
  },

  /**
   * Obtém mensagem de erro amigável
   * @param {Error} error - Objeto de erro
   * @returns {string}
   */
  getErrorMessage(error) {
    if (error.message === "REQUEST_TIMEOUT") {
      return ERROR_MESSAGES.TIMEOUT;
    }

    if (error.message === "CITY_NOT_FOUND") {
      return ERROR_MESSAGES.CITY_NOT_FOUND;
    }

    if (!navigator.onLine) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }

    return ERROR_MESSAGES.GENERIC;
  },
};

// Exportar para uso global
window.Utils = Utils;
