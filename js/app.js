// Lógica principal e inicialização do aplicativo
class GaroinhaApp {
  constructor() {
    this.ui = window.weatherUI;
    this.api = window.weatherAPI;
    this.history = this.getHistory();
    this.init();
  }

  init() {
    console.log("🌧️ Garoinha inicializado - Versão 1.0.0");

    // Carregar última busca se disponível
    this.loadLastSearch();

    // Expor funções globais para debug
    this.exposeToGlobal();
  }

  // ========== SEARCH ==========
  async searchWeather(query) {
    if (!query) return;

    try {
      this.ui.showLoading();

      // Buscar coordenadas da cidade
      const cities = await this.api.searchCities(query);
      if (cities.length === 0) {
        this.ui.showError();
        return;
      }

      // Usar primeira sugestão
      const city = cities[0];
      await this.searchWeatherByCoords(
        city.latitude,
        city.longitude,
        city.name
      );
    } catch (error) {
      console.error("❌ Erro na busca:", error);
      this.ui.showError();
    }
  }

  async searchWeatherByCoords(lat, lon, cityName) {
    try {
      this.ui.showLoading();

      const weatherData = await this.api.getWeatherData(lat, lon, cityName);

      // Atualizar UI
      this.ui.showWeather(weatherData);

      // Salvar no histórico
      this.saveToHistory(weatherData);

      // Salvar como última busca
      this.saveLastSearch(weatherData);
    } catch (error) {
      console.error("❌ Erro ao buscar clima:", error);
      this.ui.showError();
    }
  }

  // ========== HISTORY ==========
  getHistory() {
    const history = localStorage.getItem(CONFIG.HISTORY.KEY);
    return history ? JSON.parse(history) : [];
  }

  saveToHistory(weatherData) {
    // Remover se já existir
    this.history = this.history.filter(
      (item) => item.city !== weatherData.city
    );

    // Adicionar no início
    this.history.unshift({
      city: weatherData.city,
      timestamp: Date.now(),
    });

    // Manter apenas os últimos X itens
    this.history = this.history.slice(0, CONFIG.HISTORY.MAX_ITEMS);

    // Salvar
    localStorage.setItem(CONFIG.HISTORY.KEY, JSON.stringify(this.history));
  }

  // ========== LAST SEARCH ==========
  saveLastSearch(weatherData) {
    const lastSearch = {
      ...weatherData,
      savedAt: Date.now(),
    };
    localStorage.setItem("garoinha_last_search", JSON.stringify(lastSearch));
  }

  loadLastSearch() {
    const lastSearch = localStorage.getItem("garoinha_last_search");
    if (!lastSearch) return;

    const data = JSON.parse(lastSearch);
    const isRecent = Date.now() - data.savedAt < 24 * 60 * 60 * 1000; // 24 horas

    if (isRecent) {
      this.ui.showWeather(data);
    }
  }

  // ========== UTILITIES ==========
  clearData() {
    this.api.clearCache();
    this.history = [];
    localStorage.removeItem(CONFIG.HISTORY.KEY);
    localStorage.removeItem("garoinha_last_search");
    console.log("✅ Todos os dados limpos");
  }

  exposeToGlobal() {
    window.garoinha = {
      searchWeather: (query) => this.searchWeather(query),
      searchWeatherByCoords: (lat, lon, city) =>
        this.searchWeatherByCoords(lat, lon, city),
      clearData: () => this.clearData(),
      getByLocation: () => this.getByLocation(),
      version: "1.0.0",
    };
  }

  // ========== GEOLOCATION ==========
  getByLocation() {
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada neste navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await this.searchWeatherByCoords(
          latitude,
          longitude,
          "Sua Localização"
        );
      },
      (error) => {
        console.error("❌ Erro de geolocalização:", error);
        alert("Não foi possível obter sua localização.");
      }
    );
  }
}

// Inicializar app quando DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.garoinhaApp = new GaroinhaApp();
});
