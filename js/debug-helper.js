// ========================================
// SCRIPT DE DEBUG PARA GAROINHA
// ========================================

// Adicione este script no final do index.html para debug
// <script src="js/debug-helper.js"></script>

const GaroinhaDebug = {
  /**
   * Testa a API diretamente
   */
  async testAPI(cityName = "São Paulo") {
    console.log("🧪 Testando API para:", cityName);

    try {
      // Teste 1: Geocoding
      console.log("1️⃣ Buscando coordenadas...");
      const geoUrl = `${CONFIG.GEOCODING_API}?name=${encodeURIComponent(
        cityName
      )}&count=1&language=pt`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();
      console.log("✅ Geocoding:", geoData);

      if (!geoData.results || !geoData.results.length) {
        console.error("❌ Cidade não encontrada");
        return;
      }

      const city = geoData.results[0];
      console.log("📍 Coordenadas:", city.latitude, city.longitude);

      // Teste 2: Weather + Forecast
      console.log("2️⃣ Buscando clima + previsão...");
      const weatherUrl = `${CONFIG.WEATHER_API}?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,cloud_cover&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=7`;

      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();
      console.log("✅ Weather Data:", weatherData);

      // Teste 3: Dados processados
      console.log("3️⃣ Processando dados...");
      const result = {
        city: {
          name: city.name,
          country: city.country,
          latitude: city.latitude,
          longitude: city.longitude,
        },
        weather: weatherData.current,
        forecast: weatherData.daily,
        timezone: weatherData.timezone,
        timestamp: Date.now(),
      };

      console.log("✅ Dados finais:", result);
      console.log("✅ Previsão disponível:", result.forecast ? "SIM" : "NÃO");

      if (result.forecast) {
        console.log("📅 Dias de previsão:", result.forecast.time.length);
        console.log("📊 Temperaturas:", result.forecast.temperature_2m_max);
      }

      return result;
    } catch (error) {
      console.error("❌ Erro no teste:", error);
    }
  },

  /**
   * Verifica integridade dos módulos
   */
  checkModules() {
    console.log("🔍 Verificando módulos...\n");

    const modules = {
      CONFIG: typeof CONFIG !== "undefined",
      Utils: typeof Utils !== "undefined",
      Storage: typeof Storage !== "undefined",
      API: typeof API !== "undefined",
      Weather: typeof Weather !== "undefined",
      UI: typeof UI !== "undefined",
      App: typeof App !== "undefined",
    };

    for (const [name, loaded] of Object.entries(modules)) {
      console.log(`${loaded ? "✅" : "❌"} ${name}`);
    }

    return Object.values(modules).every((v) => v);
  },

  /**
   * Limpa todos os dados e recarrega
   */
  reset() {
    console.log("🔄 Resetando aplicação...");
    if (typeof Storage !== "undefined") {
      Storage.clearAll();
    }
    localStorage.clear();
    location.reload();
  },

  /**
   * Mostra informações do storage
   */
  showStorage() {
    console.log("📦 LocalStorage Info:\n");

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);

      try {
        const parsed = JSON.parse(value);
        console.log(`${key}:`, parsed);
      } catch {
        console.log(`${key}:`, value);
      }
    }
  },

  /**
   * Teste completo
   */
  async runAllTests() {
    console.clear();
    console.log("🌧️ GAROINHA - TESTES COMPLETOS\n");
    console.log("=".repeat(50));

    // 1. Verificar módulos
    console.log("\n📋 1. VERIFICANDO MÓDULOS");
    const modulesOk = this.checkModules();

    if (!modulesOk) {
      console.error("❌ Alguns módulos não foram carregados!");
      return;
    }

    // 2. Testar API
    console.log("\n📋 2. TESTANDO API");
    const data = await this.testAPI("Aracaju");

    // 3. Verificar Storage
    console.log("\n📋 3. VERIFICANDO STORAGE");
    this.showStorage();

    console.log("\n" + "=".repeat(50));
    console.log("✅ Testes concluídos!");

    return data;
  },
};

// Expor globalmente
window.GaroinhaDebug = GaroinhaDebug;

// Comandos úteis no console:
console.log(`
🌧️ GAROINHA DEBUG - Comandos disponíveis:

GaroinhaDebug.testAPI('cidade')     → Testa API para uma cidade
GaroinhaDebug.checkModules()        → Verifica módulos carregados
GaroinhaDebug.showStorage()         → Mostra conteúdo do localStorage
GaroinhaDebug.reset()               → Limpa tudo e recarrega
GaroinhaDebug.runAllTests()         → Executa todos os testes

garoinha.clearData()                → Limpa cache e histórico
garoinha.searchWeather('cidade')    → Busca clima
garoinha.getHistory()               → Ver histórico
`);
