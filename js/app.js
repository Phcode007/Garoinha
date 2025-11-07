// ========================================
// LÓGICA PRINCIPAL E INICIALIZAÇÃO
// ========================================

const App = {
  /**
   * Inicializa aplicativo
   */
  init() {
    Utils.log(`${CONFIG.APP_NAME} v${CONFIG.VERSION} inicializado`);

    // Inicializa UI
    UI.init();

    // Carrega última busca
    this.loadLastSearch();

    // Expõe API global
    this.exposeGlobalAPI();
  },

  /**
   * Busca clima por nome da cidade
   * @param {string} cityName - Nome da cidade
   */
  async searchWeather(cityName) {
    try {
      UI.showLoading();

      const data = await API.getWeatherByCity(cityName);

      UI.showWeather(data);
      Storage.addToHistory(data.city.name, data.city.country);
      Storage.saveLastSearch(data.city.name);

      Utils.log("Clima carregado:", data.city.name);
    } catch (error) {
      Utils.error("Erro ao buscar clima:", error);
      UI.showError(Utils.getErrorMessage(error));
    }
  },

  /**
   * Busca clima por objeto cidade (do autocomplete)
   * @param {Object} city - Objeto cidade
   */
  async searchWeatherByCity(city) {
    try {
      UI.showLoading();

      const data = await API.getWeatherByCityObject(city);

      UI.showWeather(data);
      Storage.addToHistory(data.city.name, data.city.country);
      Storage.saveLastSearch(data.city.name);

      Utils.log("Clima carregado:", data.city.name);
    } catch (error) {
      Utils.error("Erro ao buscar clima:", error);
      UI.showError(Utils.getErrorMessage(error));
    }
  },

  /**
   * Busca clima pela geolocalização
   */
  async searchByGeolocation() {
    try {
      UI.showLoading();

      const data = await API.getWeatherByGeolocation();

      UI.showWeather(data);
      Storage.addToHistory(data.city.name, data.city.country);

      Utils.log("Clima da localização atual carregado");
    } catch (error) {
      Utils.error("Erro ao buscar por geolocalização:", error);

      if (error.message === "GEOLOCATION_ERROR") {
        UI.showError(ERROR_MESSAGES.GEOLOCATION_ERROR);
      } else if (error.message === "Geolocalização não suportada") {
        UI.showError(ERROR_MESSAGES.GEOLOCATION_DENIED);
      } else {
        UI.showError(Utils.getErrorMessage(error));
      }
    }
  },

  /**
   * Carrega última busca salva
   */
  loadLastSearch() {
    const lastCity = Storage.getLastSearch();

    if (lastCity) {
      Utils.log("Carregando última busca:", lastCity);
      this.searchWeather(lastCity);
    }
  },

  /**
   * Limpa todos os dados salvos
   */
  clearAllData() {
    Storage.clearAll();
    UI.hideAll();
    UI.elements.cityInput.value = "";
    Utils.log("Todos os dados foram limpos");
  },

  /**
   * Expõe API global para debug
   */
  exposeGlobalAPI() {
    window.garoinha = {
      searchWeather: (city) => this.searchWeather(city),
      searchByLocation: () => this.searchByGeolocation(),
      clearData: () => this.clearAllData(),
      getHistory: () => Storage.getHistory(),
      version: CONFIG.VERSION,
      config: CONFIG,
    };

    Utils.log("API global exposta em window.garoinha");
  },
};

// Inicializar quando DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.app = App;
  App.init();
});

// Exportar
window.App = App;
