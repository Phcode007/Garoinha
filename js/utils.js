// Funções utilitárias do Garoinha

const utils = {
  /**
   * Converte graus em direção cardinal do vento
   * @param {number} degrees - Graus (0-360)
   * @returns {string} Direção cardinal (N, NE, L, etc.)
   */
  getWindDirection(degrees) {
    const index = Math.round(degrees / 45) % 8;
    return CONFIG.WIND_DIRECTIONS[index];
  },

  /**
   * Obtém informações do clima baseado no código
   * @param {number} code - Código do clima Open-Meteo
   * @returns {object} Objeto com descrição e ícone
   */
  getWeatherInfo(code) {
    return CONFIG.WEATHER_CODES[code] || CONFIG.WEATHER_CODES[0];
  },

  /**
   * Arredonda temperatura para número inteiro
   * @param {number} temp - Temperatura
   * @returns {number} Temperatura arredondada
   */
  roundTemperature(temp) {
    return Math.round(temp);
  },

  /**
   * Valida se o input da cidade não está vazio
   * @param {string} cityName - Nome da cidade
   * @returns {boolean} True se válido
   */
  validateCityInput(cityName) {
    return cityName && cityName.trim().length > 0;
  },

  /**
   * Formata a velocidade do vento
   * @param {number} speed - Velocidade em km/h
   * @returns {string} Velocidade formatada
   */
  formatWindSpeed(speed) {
    return `${Math.round(speed)} km/h`;
  },

  /**
   * Formata a umidade
   * @param {number} humidity - Umidade relativa
   * @returns {string} Umidade formatada
   */
  formatHumidity(humidity) {
    return `${humidity}%`;
  },

  /**
   * Formata a temperatura com unidade
   * @param {number} temp - Temperatura
   * @returns {string} Temperatura formatada
   */
  formatTemperature(temp) {
    return `${Math.round(temp)}°C`;
  },
};
