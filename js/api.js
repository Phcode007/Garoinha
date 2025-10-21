// Funções de API do Garoinha

const api = {
  // Cache de requisições
  cache: new Map(),
  cacheExpiry: 10 * 60 * 1000, // 10 minutos

  /**
   * Faz requisição com timeout
   * @param {string} url - URL da requisição
   * @param {number} timeout - Timeout em ms
   * @returns {Promise<Response>} Response da requisição
   */
  async fetchWithTimeout(url, timeout = CONFIG.TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error("TIMEOUT_ERROR");
      }
      throw error;
    }
  },

  /**
   * Obtém dados do cache se disponível e válido
   * @param {string} key - Chave do cache
   * @returns {object|null} Dados em cache ou null
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  },

  /**
   * Salva dados no cache
   * @param {string} key - Chave do cache
   * @param {object} data - Dados para cachear
   */
  saveToCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  },

  /**
   * Busca sugestões de cidades (para autocomplete)
   * @param {string} query - Texto da busca
   * @returns {Promise<Array>} Lista de sugestões
   */
  async fetchCitySuggestions(query) {
    if (!query || query.length < 2) {
      return [];
    }

    const cacheKey = `suggestions_${query.toLowerCase()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const url = `${CONFIG.API.GEOCODING}?name=${encodeURIComponent(
        query
      )}&count=10&language=${CONFIG.DEFAULTS.LANGUAGE}&format=json`;

      const response = await this.fetchWithTimeout(url);
      const data = await response.json();

      let suggestions = data.results || [];

      // Priorizar resultados brasileiros
      suggestions = suggestions.sort((a, b) => {
        const aIsBrazil = a.country === "Brasil" || a.country_code === "BR";
        const bIsBrazil = b.country === "Brasil" || b.country_code === "BR";

        if (aIsBrazil && !bIsBrazil) return -1;
        if (!aIsBrazil && bIsBrazil) return 1;
        return 0;
      });

      // Limitar a 5 resultados após ordenação
      suggestions = suggestions.slice(0, 5);

      this.saveToCache(cacheKey, suggestions);

      return suggestions;
    } catch (error) {
      console.error("Erro ao buscar sugestões:", error);
      return [];
    }
  },

  /**
   * Busca coordenadas geográficas de uma cidade
   * @param {string} cityName - Nome da cidade
   * @returns {Promise<object>} Dados da localização
   */
  async fetchCityCoordinates(cityName) {
    const cacheKey = `coords_${cityName.toLowerCase()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const url = `${CONFIG.API.GEOCODING}?name=${encodeURIComponent(
      cityName
    )}&count=1&language=${CONFIG.DEFAULTS.LANGUAGE}&format=json`;

    const response = await this.fetchWithTimeout(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error("CITY_NOT_FOUND");
    }

    const location = data.results[0];
    this.saveToCache(cacheKey, location);
    return location;
  },

  /**
   * Busca dados meteorológicos usando coordenadas
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Promise<object>} Dados meteorológicos
   */
  async fetchWeatherData(latitude, longitude) {
    const cacheKey = `weather_${latitude}_${longitude}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
      latitude: latitude,
      longitude: longitude,
      current:
        "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,precipitation,pressure_msl,cloud_cover",
      timezone: CONFIG.DEFAULTS.TIMEZONE,
    });

    const url = `${CONFIG.API.WEATHER}?${params.toString()}`;

    const response = await this.fetchWithTimeout(url);
    const data = await response.json();

    this.saveToCache(cacheKey, data.current);
    return data.current;
  },

  /**
   * Busca previsão para os próximos dias
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} days - Número de dias (padrão: 7)
   * @returns {Promise<object>} Dados de previsão
   */
  async fetchForecast(latitude, longitude, days = 7) {
    const cacheKey = `forecast_${latitude}_${longitude}_${days}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
      latitude: latitude,
      longitude: longitude,
      daily:
        "temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum",
      timezone: CONFIG.DEFAULTS.TIMEZONE,
      forecast_days: days,
    });

    const url = `${CONFIG.API.WEATHER}?${params.toString()}`;

    const response = await this.fetchWithTimeout(url);
    const data = await response.json();

    this.saveToCache(cacheKey, data.daily);
    return data.daily;
  },

  /**
   * Busca todos os dados do clima para uma cidade
   * @param {string} cityName - Nome da cidade
   * @returns {Promise<object>} Objeto completo com localização e clima
   */
  async getCompleteWeatherData(cityName) {
    try {
      // Buscar coordenadas da cidade
      const location = await this.fetchCityCoordinates(cityName);

      // Buscar dados meteorológicos
      const weather = await this.fetchWeatherData(
        location.latitude,
        location.longitude
      );

      // Retornar dados consolidados
      return {
        cityName: location.name,
        state: location.admin1 || null,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude,
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
    } catch (error) {
      if (error.message === "CITY_NOT_FOUND") {
        throw error;
      }
      if (error.message === "TIMEOUT_ERROR") {
        throw new Error("TIMEOUT_ERROR");
      }
      throw new Error("CONNECTION_ERROR");
    }
  },

  /**
   * Limpa o cache
   */
  clearCache() {
    this.cache.clear();
    console.log("Cache limpo");
  },
};
