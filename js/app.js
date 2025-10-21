// Aplicação principal do Garoinha

const app = {
  /**
   * Inicializa a aplicação
   */
  init() {
    this.setupEventListeners();
    console.log("🌧️ Garoinha iniciado com sucesso!");
  },

  /**
   * Configura os event listeners
   */
  setupEventListeners() {
    const cityInput = document.getElementById("cityInput");
    const searchBtn = document.getElementById("searchBtn");

    // Busca ao clicar no botão
    searchBtn.addEventListener("click", () => {
      this.handleSearch(cityInput.value);
    });

    // Busca ao pressionar Enter
    cityInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleSearch(cityInput.value);
      }
    });
  },

  /**
   * Processa a busca de clima
   * @param {string} cityName - Nome da cidade
   */
  async handleSearch(cityName) {
    // Validar input
    if (!utils.validateCityInput(cityName)) {
      ui.showError("Por favor, digite o nome de uma cidade.");
      return;
    }

    try {
      // Mostrar loading
      ui.showLoading();

      // Buscar dados do clima
      const weatherData = await api.getCompleteWeatherData(cityName.trim());

      // Exibir dados na interface
      ui.showWeather(weatherData);
    } catch (error) {
      // Tratar erros
      if (error.message === "CITY_NOT_FOUND") {
        ui.showError("CITY_NOT_FOUND");
      } else {
        ui.showError("CONNECTION_ERROR");
      }
      console.error("Erro ao buscar clima:", error);
    }
  },
};

// Inicializar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  app.init();
});
