// Funções de interface do Garoinha

const ui = {
  // Elementos do DOM
  elements: {
    loading: document.getElementById("loading"),
    errorMsg: document.getElementById("errorMsg"),
    welcomeMsg: document.getElementById("welcomeMsg"),
    weatherInfo: document.getElementById("weatherInfo"),
    cityName: document.getElementById("cityName"),
    country: document.getElementById("country"),
    weatherIcon: document.getElementById("weatherIcon"),
    weatherDesc: document.getElementById("weatherDesc"),
    temperature: document.getElementById("temperature"),
    windSpeed: document.getElementById("windSpeed"),
    humidity: document.getElementById("humidity"),
    feelsLike: document.getElementById("feelsLike"),
    windDirection: document.getElementById("windDirection"),
  },

  /**
   * Mostra o indicador de loading
   */
  showLoading() {
    this.elements.loading.style.display = "block";
    this.elements.errorMsg.style.display = "none";
    this.elements.welcomeMsg.style.display = "none";
    this.elements.weatherInfo.style.display = "none";
  },

  /**
   * Mostra mensagem de erro
   * @param {string} messageKey - Chave da mensagem em CONFIG.MESSAGES
   */
  showError(messageKey) {
    this.elements.loading.style.display = "none";
    this.elements.errorMsg.textContent =
      CONFIG.MESSAGES[messageKey] || messageKey;
    this.elements.errorMsg.style.display = "block";
    this.elements.welcomeMsg.style.display = "none";
    this.elements.weatherInfo.style.display = "none";
  },

  /**
   * Exibe os dados do clima na interface
   * @param {object} data - Objeto com dados do clima
   */
  showWeather(data) {
    this.elements.loading.style.display = "none";
    this.elements.errorMsg.style.display = "none";
    this.elements.welcomeMsg.style.display = "none";
    this.elements.weatherInfo.style.display = "block";

    // Atualizar localização
    this.elements.cityName.textContent = data.cityName;
    this.elements.country.textContent = data.country;

    // Atualizar clima atual
    const weatherInfo = utils.getWeatherInfo(data.weatherCode);
    this.elements.weatherIcon.textContent = weatherInfo.icon;
    this.elements.weatherDesc.textContent = weatherInfo.desc;
    this.elements.temperature.textContent = utils.formatTemperature(
      data.temperature
    );

    // Atualizar detalhes
    this.elements.windSpeed.textContent = utils.formatWindSpeed(data.windSpeed);
    this.elements.humidity.textContent = utils.formatHumidity(data.humidity);
    this.elements.feelsLike.textContent = utils.formatTemperature(
      data.apparentTemperature
    );
    this.elements.windDirection.textContent = utils.getWindDirection(
      data.windDirection
    );
  },

  /**
   * Mostra a mensagem de boas-vindas
   */
  showWelcome() {
    this.elements.loading.style.display = "none";
    this.elements.errorMsg.style.display = "none";
    this.elements.welcomeMsg.style.display = "block";
    this.elements.weatherInfo.style.display = "none";
  },
};
