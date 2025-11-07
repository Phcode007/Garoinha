// ========================================
// PROCESSAMENTO DE DADOS METEOROLÓGICOS
// ========================================

const Weather = {
  /**
   * Processa dados brutos da API
   * @param {Object} data - Dados da API
   * @returns {Object}
   */
  processWeatherData(data) {
    if (!data || !data.city || !data.weather) {
      console.error("Dados inválidos:", data);
      return null;
    }

    const { city, weather, timestamp, forecast } = data;
    const weatherInfo = Utils.getWeatherInfo(weather.weather_code);

    return {
      location: {
        name: city.name || "Desconhecido",
        country: city.country || "",
        admin1: city.admin1 || "",
        fullName: this.formatLocationName(city),
      },

      current: {
        temperature: weather.temperature_2m || 0,
        feelsLike: weather.apparent_temperature || 0,
        humidity: weather.relative_humidity_2m || 0,
        windSpeed: weather.wind_speed_10m || 0,
        windDirection: weather.wind_direction_10m || 0,
        pressure: weather.pressure_msl || 0,
        cloudCover: weather.cloud_cover || 0,
        precipitation: weather.precipitation || 0,
        weatherCode: weather.weather_code || 0,
      },

      description: {
        text: weatherInfo.desc,
        icon: weatherInfo.icon,
        color: weatherInfo.color,
        gradient: weatherInfo.gradient,
      },

      formatted: {
        temperature: Utils.formatTemperature(weather.temperature_2m),
        feelsLike: Utils.formatTemperature(weather.apparent_temperature),
        humidity: Utils.formatHumidity(weather.relative_humidity_2m),
        windSpeed: Utils.formatWindSpeed(weather.wind_speed_10m),
        windDirection: Utils.getWindDirection(weather.wind_direction_10m),
        pressure: Utils.formatPressure(weather.pressure_msl),
        cloudCover: Utils.formatCloudCover(weather.cloud_cover),
        lastUpdate: Utils.formatDate(new Date(timestamp)),
      },

      // Incluir forecast se disponível
      forecast: forecast || null,

      timestamp,
    };
  },

  /**
   * Formata nome completo da localização
   * @param {Object} city - Objeto cidade
   * @returns {string}
   */
  formatLocationName(city) {
    if (!city || !city.name) return "Desconhecido";

    const parts = [city.name];

    if (city.admin1 && city.admin1 !== city.name) {
      parts.push(city.admin1);
    }

    return parts.join(", ");
  },

  /**
   * Obtém recomendação de roupa baseado no clima
   * @param {number} temp - Temperatura
   * @param {number} weatherCode - Código do clima
   * @returns {string}
   */
  getClothingRecommendation(temp, weatherCode) {
    const isRainy = weatherCode >= 51 && weatherCode <= 99;

    if (temp < 10) {
      return isRainy ? "🧥 Casaco impermeável" : "🧥 Casaco pesado";
    } else if (temp < 20) {
      return isRainy ? "☂️ Jaqueta e guarda-chuva" : "🧥 Jaqueta leve";
    } else if (temp < 28) {
      return isRainy ? "☂️ Roupa leve e guarda-chuva" : "👕 Roupa leve";
    } else {
      return isRainy ? "☂️ Roupa fresca e guarda-chuva" : "👕 Roupa bem leve";
    }
  },

  /**
   * Classifica qualidade do ar baseado na umidade
   * @param {number} humidity - Umidade relativa
   * @returns {Object}
   */
  getAirQualityFromHumidity(humidity) {
    if (humidity < 30) {
      return { level: "Baixa", desc: "Ar muito seco", emoji: "🏜️" };
    } else if (humidity < 60) {
      return { level: "Ideal", desc: "Umidade confortável", emoji: "✅" };
    } else if (humidity < 80) {
      return { level: "Alta", desc: "Ar úmido", emoji: "💧" };
    } else {
      return { level: "Muito Alta", desc: "Ar muito úmido", emoji: "💦" };
    }
  },

  /**
   * Classifica intensidade do vento
   * @param {number} speed - Velocidade em km/h
   * @returns {Object}
   */
  getWindIntensity(speed) {
    if (speed < 12) {
      return { level: "Calmo", desc: "Vento fraco", emoji: "🍃" };
    } else if (speed < 30) {
      return { level: "Brisa", desc: "Vento moderado", emoji: "💨" };
    } else if (speed < 50) {
      return { level: "Ventania", desc: "Vento forte", emoji: "🌬️" };
    } else {
      return { level: "Temporal", desc: "Vento muito forte", emoji: "🌪️" };
    }
  },

  /**
   * Verifica se é hora de usar protetor solar
   * @param {number} cloudCover - Cobertura de nuvens em %
   * @param {number} weatherCode - Código do clima
   * @returns {boolean}
   */
  needsSunscreen(cloudCover, weatherCode) {
    const isSunny = weatherCode <= 2;
    return isSunny && cloudCover < 50;
  },

  /**
   * Obtém dica do dia baseada no clima
   * @param {Object} weatherData - Dados processados
   * @returns {string}
   */
  getDailyTip(weatherData) {
    if (!weatherData || !weatherData.current) return "😊 Tenha um ótimo dia!";

    const { current, description } = weatherData;
    const tips = [];

    // Chuva
    if (current.weatherCode >= 51 && current.weatherCode <= 99) {
      tips.push("☂️ Não esqueça o guarda-chuva!");
    }

    // Sol forte
    if (this.needsSunscreen(current.cloudCover, current.weatherCode)) {
      tips.push("☀️ Use protetor solar!");
    }

    // Vento forte
    if (current.windSpeed > 30) {
      tips.push("🌬️ Cuidado com objetos soltos!");
    }

    // Temperatura extrema
    if (current.temperature > 35) {
      tips.push("🥵 Mantenha-se hidratado!");
    } else if (current.temperature < 10) {
      tips.push("🥶 Vista-se bem!");
    }

    // Umidade
    if (current.humidity > 80) {
      tips.push("💧 Dia abafado, beba água!");
    } else if (current.humidity < 30) {
      tips.push("🏜️ Ar seco, hidrate-se!");
    }

    return tips.length > 0 ? tips[0] : "😊 Tenha um ótimo dia!";
  },

  /**
   * Compara duas leituras de clima
   * @param {Object} current - Dados atuais
   * @param {Object} previous - Dados anteriores
   * @returns {Object}
   */
  compareWeather(current, previous) {
    return {
      temperatureDiff: current.temperature - previous.temperature,
      humidityDiff: current.humidity - previous.humidity,
      pressureDiff: current.pressure - previous.pressure,
      conditionChanged: current.weatherCode !== previous.weatherCode,
    };
  },
};

// Exportar para uso global
window.Weather = Weather;
