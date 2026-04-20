// ========================================
// HELPERS PARA FORMATOS E INFORMAÇÕES DE CLIMA
// Separa responsabilidade relacionada ao clima do Utils principal
// ========================================

const WeatherUtils = {
  formatTemperature(temp) {
    const unit = window.Storage && window.Storage.getUnit ? window.Storage.getUnit() : 'C';
    let finalTemp = temp;
    if (unit === 'F') {
      finalTemp = (temp * 9 / 5) + 32;
    }
    return `${Math.round(finalTemp)}°`;
  },

  formatWindSpeed(speed) {
    return `${Math.round(speed)} km/h`;
  },

  formatHumidity(humidity) {
    return `${Math.round(humidity)}%`;
  },

  formatPressure(pressure) {
    return `${Math.round(pressure)} hPa`;
  },

  formatCloudCover(cloudCover) {
    return `${Math.round(cloudCover)}%`;
  },

  getWindDirection(degrees) {
    const directions = Object.keys(window.WIND_DIRECTIONS || {})
      .map(Number)
      .sort((a, b) => a - b);

    for (let i = 0; i < directions.length; i++) {
      const current = directions[i];
      const next = directions[i + 1] || 360;

      if (degrees >= current && degrees < next) {
        const midpoint = (current + next) / 2;
        return (
          (window.WIND_DIRECTIONS && window.WIND_DIRECTIONS[degrees < midpoint ? current : next]) ||
          (window.WIND_DIRECTIONS && window.WIND_DIRECTIONS[current])
        );
      }
    }

    return (window.WIND_DIRECTIONS && window.WIND_DIRECTIONS[0]) || 'N';
  },

  getWeatherInfo(code) {
    const codes = window.WEATHER_CODES || {};
    return (
      codes[code] || {
        desc: "Desconhecido",
        icon: "❓",
        color: "#888888",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }
    );
  },
};

// Exportar para uso global (compatibilidade)
window.WeatherUtils = WeatherUtils;
