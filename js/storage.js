// ========================================
// GERENCIAMENTO DE ARMAZENAMENTO LOCAL
// ========================================

const Storage = {
  /**
   * Salva dados no cache
   * @param {string} cityName - Nome da cidade
   * @param {Object} data - Dados meteorológicos
   */
  saveToCache(cityName, data) {
    try {
      const cache = this.getCache();
      const key = cityName.toLowerCase();

      cache[key] = {
        data,
        timestamp: Date.now(),
      };

      localStorage.setItem(
        CONFIG.STORAGE_KEYS.WEATHER_CACHE,
        JSON.stringify(cache)
      );
      Utils.log("Cache atualizado:", cityName);
    } catch (error) {
      Utils.error("Erro ao salvar cache:", error);
    }
  },

  /**
   * Obtém dados do cache
   * @param {string} cityName - Nome da cidade
   * @returns {Object|null}
   */
  getFromCache(cityName) {
    try {
      const cache = this.getCache();
      const key = cityName.toLowerCase();
      const cached = cache[key];

      if (!cached) return null;

      // Verifica se o cache expirou
      const isExpired = Date.now() - cached.timestamp > CONFIG.CACHE_DURATION;

      if (isExpired) {
        this.removeFromCache(cityName);
        return null;
      }

      Utils.log("Cache encontrado:", cityName);
      return cached.data;
    } catch (error) {
      Utils.error("Erro ao ler cache:", error);
      return null;
    }
  },

  /**
   * Remove cidade do cache
   * @param {string} cityName - Nome da cidade
   */
  removeFromCache(cityName) {
    try {
      const cache = this.getCache();
      const key = cityName.toLowerCase();
      delete cache[key];
      localStorage.setItem(
        CONFIG.STORAGE_KEYS.WEATHER_CACHE,
        JSON.stringify(cache)
      );
    } catch (error) {
      Utils.error("Erro ao remover do cache:", error);
    }
  },

  /**
   * Obtém todo o cache
   * @returns {Object}
   */
  getCache() {
    try {
      const cache = localStorage.getItem(CONFIG.STORAGE_KEYS.WEATHER_CACHE);
      return cache ? JSON.parse(cache) : {};
    } catch (error) {
      Utils.error("Erro ao ler cache:", error);
      return {};
    }
  },

  /**
   * Limpa todo o cache
   */
  clearCache() {
    try {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.WEATHER_CACHE);
      Utils.log("Cache limpo");
    } catch (error) {
      Utils.error("Erro ao limpar cache:", error);
    }
  },

  /**
   * Adiciona cidade ao histórico
   * @param {string} cityName - Nome da cidade
   * @param {string} country - País
   */
  addToHistory(cityName, country) {
    try {
      let history = this.getHistory();

      // Remove duplicatas
      history = history.filter(
        (item) => item.name.toLowerCase() !== cityName.toLowerCase()
      );

      // Adiciona no início
      history.unshift({ name: cityName, country });

      // Mantém apenas os últimos N itens
      history = history.slice(0, CONFIG.HISTORY_MAX_ITEMS);

      localStorage.setItem(
        CONFIG.STORAGE_KEYS.HISTORY,
        JSON.stringify(history)
      );
      Utils.log("Histórico atualizado");
    } catch (error) {
      Utils.error("Erro ao salvar histórico:", error);
    }
  },

  /**
   * Obtém histórico de buscas
   * @returns {Array}
   */
  getHistory() {
    try {
      const history = localStorage.getItem(CONFIG.STORAGE_KEYS.HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      Utils.error("Erro ao ler histórico:", error);
      return [];
    }
  },

  /**
   * Limpa histórico
   */
  clearHistory() {
    try {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.HISTORY);
      Utils.log("Histórico limpo");
    } catch (error) {
      Utils.error("Erro ao limpar histórico:", error);
    }
  },

  /**
   * Salva última busca
   * @param {string} cityName - Nome da cidade
   */
  saveLastSearch(cityName) {
    try {
      const data = {
        city: cityName,
        timestamp: Date.now(),
      };
      localStorage.setItem(
        CONFIG.STORAGE_KEYS.LAST_SEARCH,
        JSON.stringify(data)
      );
    } catch (error) {
      Utils.error("Erro ao salvar última busca:", error);
    }
  },

  /**
   * Obtém última busca
   * @returns {string|null}
   */
  getLastSearch() {
    try {
      const data = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_SEARCH);
      if (!data) return null;

      const parsed = JSON.parse(data);
      const isExpired =
        Date.now() - parsed.timestamp > CONFIG.LAST_SEARCH_EXPIRY;

      if (isExpired) {
        this.clearLastSearch();
        return null;
      }

      return parsed.city;
    } catch (error) {
      Utils.error("Erro ao ler última busca:", error);
      return null;
    }
  },

  /**
   * Limpa última busca
   */
  clearLastSearch() {
    try {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.LAST_SEARCH);
    } catch (error) {
      Utils.error("Erro ao limpar última busca:", error);
    }
  },

  /**
   * Limpa todos os dados
   */
  clearAll() {
    this.clearCache();
    this.clearHistory();
    this.clearLastSearch();
    Utils.log("Todos os dados foram limpos");
  },

  /**
   * Obtém tamanho total do storage em bytes
   * @returns {number}
   */
  getStorageSize() {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    } catch (error) {
      Utils.error("Erro ao calcular tamanho do storage:", error);
      return 0;
    }
  },

  /**
   * Verifica se o storage está disponível
   * @returns {boolean}
   */
  isAvailable() {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  },
};

// Exportar para uso global
window.Storage = Storage;
