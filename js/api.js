// Gerenciamento de API e cache
class WeatherAPI {
  constructor() {
    this.cache = this.getCache();
  }

  // ========== CACHE ==========
  getCache() {
    const cached = localStorage.getItem(CONFIG.CACHE.KEY);
    return cached ? JSON.parse(cached) : {};
  }

  setCache(key, data) {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CONFIG.CACHE.KEY, JSON.stringify(this.cache));
  }

  getCachedData(key) {
    const cached = this.cache[key];
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > CONFIG.CACHE.DURATION;
    return isExpired ? null : cached.data;
  }

  clearCache() {
    this.cache = {};
    localStorage.removeItem(CONFIG.CACHE.KEY);
    console.log("✅ Cache limpo");
  }

  // ========== GEOCODING ==========
  async searchCities(query) {
    if (!query || query.length < 2) return [];

    try {
      const url = `${
        CONFIG.WEATHER_API.GEOCODING_URL
      }?name=${encodeURIComponent(query)}&count=5&language=pt`;
      const response = await this.fetchWithTimeout(url);

      if (!response.ok) throw new Error("Erro na busca de cidades");

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("❌ Erro ao buscar cidades:", error);
      return [];
    }
  }

  // ========== WEATHER DATA ==========
  async getWeatherData(lat, lon, cityName) {
    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    const cached = this.getCachedData(cacheKey);

    if (cached) {
      console.log("📦 Dados carregados do cache");
      return cached;
    }

    try {
      const url = `${CONFIG.WEATHER_API.BASE_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,precipitation,cloud_cover&timezone=auto`;

      const response = await this.fetchWithTimeout(url);

      if (!response.ok) throw new Error("Erro ao buscar dados do clima");

      const data = await response.json();
      const processedData = this.processWeatherData(data, cityName);

      this.setCache(cacheKey, processedData);
      return processedData;
    } catch (error) {
      console.error("❌ Erro ao buscar dados do clima:", error);
      throw error;
    }
  }

  // ========== PROCESS DATA ==========
  processWeatherData(data, cityName) {
    const current = data.current;
    const weatherCode = current.weather_code;
    const weatherInfo = CONFIG.WEATHER_CODES[weatherCode] || {
      desc: "Desconhecido",
      icon: "❓",
      color: "#666",
    };

    return {
      city: cityName,
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m * 3.6), // Convert m/s to km/h
      windDirection: this.getWindDirection(current.wind_direction_10m),
      pressure: Math.round(current.surface_pressure),
      precipitation: current.precipitation,
      cloudCover: current.cloud_cover,
      weatherCode: weatherCode,
      description: weatherInfo.desc,
      icon: weatherInfo.icon,
      color: weatherInfo.color,
      lastUpdated: new Date().toLocaleString("pt-BR"),
    };
  }

  getWindDirection(degrees) {
    const index = Math.round(degrees / 22.5) % 16;
    return CONFIG.WIND_DIRECTIONS[index];
  }

  // ========== UTILITIES ==========
  async fetchWithTimeout(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}

// Instância global da API
window.weatherAPI = new WeatherAPI();
