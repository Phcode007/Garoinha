// Funções de API do Garoinha

const api = {
  /**
   * Busca coordenadas geográficas de uma cidade
   * @param {string} cityName - Nome da cidade
   * @returns {Promise<object>} Dados da localização
   */
  async fetchCityCoordinates(cityName) {
    const url = `${CONFIG.API.GEOCODING}?name=${encodeURIComponent(
      cityName
    )}&count=${CONFIG.DEFAULTS.RESULTS_COUNT}&language=${
      CONFIG.DEFAULTS.LANGUAGE
    }&format=json`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error("CITY_NOT_FOUND");
    }

    return data.results[0];
  },

  /**
   * Busca dados meteorológicos usando coordenadas
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Promise<object>} Dados meteorológicos
   */
  async fetchWeatherData(latitude, longitude) {
    const params = new URLSearchParams({
      latitude: latitude,
      longitude: longitude,
      current:
        "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m",
      timezone: CONFIG.DEFAULTS.TIMEZONE,
    });

    const url = `${CONFIG.API.WEATHER}?${params.toString()}`;

    const response = await fetch(url);
    const data = await response.json();

    return data.current;
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
        country: location.country,
        temperature: weather.temperature_2m,
        apparentTemperature: weather.apparent_temperature,
        humidity: weather.relative_humidity_2m,
        windSpeed: weather.wind_speed_10m,
        windDirection: weather.wind_direction_10m,
        weatherCode: weather.weather_code,
      };
    } catch (error) {
      if (error.message === "CITY_NOT_FOUND") {
        throw error;
      }
      throw new Error("CONNECTION_ERROR");
    }
  },
};
