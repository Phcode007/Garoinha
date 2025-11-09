// ========================================
// PROCESSAMENTO DE DADOS METEOROLÓGICOS - VERSÃO CORRIGIDA
// ========================================

const Weather = {
  /**
   * Processa dados brutos da API - VERSÃO CORRIGIDA
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

    // CORREÇÃO: Verificar se forecast existe e tem a estrutura correta
    console.log("🔍 Processando dados:", {
      forecastExiste: !!forecast,
      forecastEArray: Array.isArray(forecast),
      forecastTime: forecast ? forecast.time : "N/A",
      forecastLength: forecast ? forecast.time?.length : 0,
      forecastDaily: forecast ? forecast.daily : "N/A",
    });

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

      // CORREÇÃO: Garantir que forecast seja passado corretamente
      // O forecast já vem com a estrutura correta da API (forecast.daily)
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

  /**
   * Função para validar e processar dados de forecast
   * @param {Object} forecast - Dados do forecast da API
   * @returns {Object|null}
   */
  validateForecastData(forecast) {
    if (!forecast) {
      console.warn("❌ Forecast não fornecido");
      return null;
    }

    // Verificar se é um objeto com propriedades
    if (typeof forecast !== "object") {
      console.warn("❌ Forecast não é um objeto:", typeof forecast);
      return null;
    }

    // Verificar se tem time
    if (!forecast.time) {
      console.warn("❌ Forecast não tem propriedade 'time'");
      return null;
    }

    // Verificar se time é um array
    if (!Array.isArray(forecast.time)) {
      console.warn("❌ Forecast.time não é um array:", typeof forecast.time);
      return null;
    }

    // Verificar se tem dados
    if (forecast.time.length === 0) {
      console.warn("❌ Forecast.time está vazio");
      return null;
    }

    // Verificar se os arrays correspondentes existem
    const requiredArrays = [
      "temperature_2m_max",
      "temperature_2m_min",
      "weather_code",
    ];
    for (const arrayName of requiredArrays) {
      if (!forecast[arrayName]) {
        console.warn(`❌ Forecast não tem '${arrayName}'`);
        return null;
      }
      if (!Array.isArray(forecast[arrayName])) {
        console.warn(`❌ Forecast.${arrayName} não é um array`);
        return null;
      }
      if (forecast[arrayName].length !== forecast.time.length) {
        console.warn(`❌ Array ${arrayName} tem tamanho diferente de time`);
        return null;
      }
    }

    console.log("✅ Forecast validado com sucesso:", {
      dias: forecast.time.length,
      temProbabilidade: !!forecast.precipitation_probability_max,
    });

    return forecast;
  },

  /**
   * Obtém resumo do clima para os próximos dias
   * @param {Object} forecast - Dados do forecast
   * @returns {string}
   */
  getForecastSummary(forecast) {
    if (!forecast || !forecast.time || forecast.time.length === 0) {
      return "Previsão indisponível";
    }

    const rainyDays = forecast.weather_code.filter(
      (code) => code >= 51 && code <= 99
    ).length;
    const sunnyDays = forecast.weather_code.filter((code) => code <= 2).length;

    if (rainyDays > forecast.time.length / 2) {
      return `Chuva em ${rainyDays} dos ${forecast.time.length} dias`;
    } else if (sunnyDays > forecast.time.length / 2) {
      return `Predominantemente ensolarado`;
    } else {
      return `Clima variável nos próximos ${forecast.time.length} dias`;
    }
  },

  /**
   * Função de debug para verificar estrutura dos dados
   * @param {Object} data - Dados brutos da API
   */
  debugDataStructure(data) {
    console.log("🔍 ESTRUTURA DOS DADOS - DEBUG");
    console.log("=" * 50);
    console.log("📊 Dados fornecidos:", data);
    console.log("📍 City:", data?.city);
    console.log("🌤️ Weather:", data?.weather);
    console.log("📅 Forecast:", data?.forecast);

    if (data?.forecast) {
      console.log("📅 Forecast details:");
      console.log("  - time:", data.forecast.time);
      console.log("  - temperature_2m_max:", data.forecast.temperature_2m_max);
      console.log("  - temperature_2m_min:", data.forecast.temperature_2m_min);
      console.log("  - weather_code:", data.forecast.weather_code);
      console.log("  - precipitation_sum:", data.forecast.precipitation_sum);
      console.log(
        "  - precipitation_probability_max:",
        data.forecast.precipitation_probability_max
      );
    }

    console.log("=" * 50);
  },
};

// Exportar para uso global
window.Weather = Weather;

// Função de diagnóstico global (pode ser usada no console)
window.diagnosticarForecast = async function () {
  console.log("🔍 DIAGNÓSTICO DO FORECAST - GAROINHA");
  console.log("=" * 50);

  try {
    // Testar com uma cidade
    const resultado = await API.getWeatherByCity("São Paulo");

    console.log("✅ Dados retornados:", resultado);
    console.log("📊 Estrutura dos dados:");
    console.log("- city:", resultado.city ? "✅" : "❌");
    console.log("- weather:", resultado.weather ? "✅" : "❌");
    console.log("- forecast:", resultado.forecast ? "✅" : "❌");
    console.log("- forecast.time:", resultado.forecast?.time ? "✅" : "❌");

    if (resultado.forecast) {
      console.log("📅 Forecast details:");
      console.log("- forecast.time:", resultado.forecast.time);
      console.log(
        "- forecast.temperature_2m_max:",
        resultado.forecast.temperature_2m_max
      );
      console.log(
        "- forecast.temperature_2m_min:",
        resultado.forecast.temperature_2m_min
      );
      console.log("- forecast.weather_code:", resultado.forecast.weather_code);
    }

    // Testar validação
    const forecastValidado = Weather.validateForecastData(resultado.forecast);
    console.log(
      "✅ Forecast validado:",
      forecastValidado ? "SUCESSO" : "FALHOU"
    );
  } catch (error) {
    console.error("❌ Erro:", error);
  }
};
