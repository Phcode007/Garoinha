// ========================================
// CAMADA DE API - COMUNICAÇÃO COM OPEN-METEO
// ========================================

const API = {
  /**
   * Busca coordenadas de uma cidade (Geocoding)
   * @param {string} cityName - Nome da cidade
   * @returns {Promise<Object>}
   */
  async searchCity(cityName) {
    try {
      const url = `${CONFIG.GEOCODING_API}?name=${encodeURIComponent(
        cityName
      )}&count=${CONFIG.AUTOCOMPLETE_MAX_RESULTS}&language=pt&format=json`;

      const response = await Utils.promiseWithTimeout(
        fetch(url),
        CONFIG.REQUEST_TIMEOUT
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error("CITY_NOT_FOUND");
      }

      return data.results;
    } catch (error) {
      Utils.error("Erro na busca de cidade:", error);
      throw error;
    }
  },

  /**
   * Busca dados meteorológicos com previsão de 7 dias
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Promise<Object>}
   */
  async getWeather(latitude, longitude) {
    try {
      const params = new URLSearchParams({
        latitude: latitude,
        longitude: longitude,
        current: [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "precipitation",
          "weather_code",
          "cloud_cover",
          "pressure_msl",
          "wind_speed_10m",
          "wind_direction_10m",
        ].join(","),
        daily: [
          "temperature_2m_max",
          "temperature_2m_min",
          "weather_code",
          "precipitation_sum",
          "precipitation_probability_max",
        ].join(","),
        timezone: "auto",
        forecast_days: 7,
      });

      const url = `${CONFIG.WEATHER_API}?${params.toString()}`;

      const response = await Utils.promiseWithTimeout(
        fetch(url),
        CONFIG.REQUEST_TIMEOUT
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      Utils.error("Erro ao buscar clima:", error);
      throw error;
    }
  },

  /**
   * Busca completa: geocoding + weather + forecast
   * @param {string} cityName - Nome da cidade
   * @returns {Promise<Object>}
   */
  async getWeatherByCity(cityName) {
    try {
      // Verifica cache primeiro
      const cached = Storage.getFromCache(cityName);
      if (cached) {
        Utils.log("Usando dados do cache");
        return cached;
      }

      // Busca coordenadas
      const cities = await this.searchCity(cityName);
      const city = cities[0]; // Primeira opção

      // Busca clima + previsão
      const weatherData = await this.getWeather(city.latitude, city.longitude);

      // Combina dados
      const result = {
        city: {
          name: city.name,
          country: city.country,
          admin1: city.admin1,
          latitude: city.latitude,
          longitude: city.longitude,
        },
        weather: weatherData.current,
        forecast: weatherData.daily,
        timezone: weatherData.timezone,
        timestamp: Date.now(),
      };

      // Salva no cache
      Storage.saveToCache(cityName, result);

      return result;
    } catch (error) {
      Utils.error("Erro na busca completa:", error);
      throw error;
    }
  },

  /**
   * Busca clima por cidade específica (objeto)
   * @param {Object} city - Objeto com dados da cidade
   * @returns {Promise<Object>}
   */
  async getWeatherByCityObject(city) {
    try {
      const cached = Storage.getFromCache(city.name);
      if (cached) {
        Utils.log("Usando dados do cache");
        return cached;
      }

      const weatherData = await this.getWeather(city.latitude, city.longitude);

      const result = {
        city: {
          name: city.name,
          country: city.country,
          admin1: city.admin1,
          latitude: city.latitude,
          longitude: city.longitude,
        },
        weather: weatherData.current,
        forecast: weatherData.daily,
        timezone: weatherData.timezone,
        timestamp: Date.now(),
      };

      Storage.saveToCache(city.name, result);

      return result;
    } catch (error) {
      Utils.error("Erro ao buscar clima:", error);
      throw error;
    }
  },

  /**
   * Busca sugestões de cidades (para autocomplete)
   * @param {string} query - Texto de busca
   * @returns {Promise<Array>}
   */
  async getCitySuggestions(query) {
    try {
      if (
        Utils.isEmpty(query) ||
        query.length < CONFIG.AUTOCOMPLETE_MIN_CHARS
      ) {
        return [];
      }

      const cities = await this.searchCity(query);

      // Formata resultados
      return cities.map((city) => ({
        name: city.name,
        country: city.country,
        admin1: city.admin1,
        latitude: city.latitude,
        longitude: city.longitude,
        displayName: this.formatCityName(city),
      }));
    } catch (error) {
      Utils.error("Erro ao buscar sugestões:", error);
      return [];
    }
  },

  /**
   * Formata nome da cidade para exibição
   * @param {Object} city - Objeto cidade
   * @returns {string}
   */
  formatCityName(city) {
    let parts = [city.name];

    if (city.admin1) {
      parts.push(city.admin1);
    }

    parts.push(city.country);

    return parts.join(", ");
  },

  /**
   * Busca clima pela geolocalização do usuário
   * @returns {Promise<Object>}
   */
  async getWeatherByGeolocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalização não suportada"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const weatherData = await this.getWeather(latitude, longitude);

            // Busca nome da cidade pelas coordenadas (reverse geocoding)
            const url = `${CONFIG.GEOCODING_API}?latitude=${latitude}&longitude=${longitude}&count=1&language=pt&format=json`;
            const response = await fetch(url);
            const geoData = await response.json();

            const city = geoData.results?.[0] || {
              name: "Localização Atual",
              country: "",
            };

            const result = {
              city: {
                name: city.name,
                country: city.country,
                latitude,
                longitude,
              },
              weather: weatherData.current,
              forecast: weatherData.daily,
              timezone: weatherData.timezone,
              timestamp: Date.now(),
            };

            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          Utils.error("Erro de geolocalização:", error);
          reject(new Error("GEOLOCATION_ERROR"));
        },
        {
          timeout: CONFIG.REQUEST_TIMEOUT,
          enableHighAccuracy: false,
        }
      );
    });
  },
};

// Exportar para uso global
window.API = API;
