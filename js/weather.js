// ========================================
// MANIPULAÇÃO DA INTERFACE DO USUÁRIO
// ========================================

const UI = {
  elements: null,
  currentSuggestionIndex: -1,

  /**
   * Inicializa elementos do DOM
   */
  init() {
    this.elements = {
      // Search
      cityInput: document.getElementById("cityInput"),
      searchBtn: document.getElementById("searchBtn"),
      autocomplete: document.getElementById("autocomplete"),

      // States
      loading: document.getElementById("loading"),
      error: document.getElementById("error"),
      errorMessage: document.getElementById("errorMessage"),
      weatherCard: document.getElementById("weatherCard"),

      // Weather Info
      cityName: document.getElementById("cityName"),
      country: document.getElementById("country"),
      weatherIcon: document.getElementById("weatherIcon"),
      temperature: document.getElementById("temperature"),
      weatherDesc: document.getElementById("weatherDesc"),
      feelsLike: document.getElementById("feelsLike"),
      humidity: document.getElementById("humidity"),
      windSpeed: document.getElementById("windSpeed"),
      pressure: document.getElementById("pressure"),
      cloudCover: document.getElementById("cloudCover"),
      lastUpdate: document.getElementById("lastUpdate"),

      // Forecast
      forecastContainer: document.getElementById("forecastContainer"),
    };

    this.bindEvents();
    Utils.log("UI inicializada");
  },

  /**
   * Vincula eventos
   */
  bindEvents() {
    // Search
    this.elements.searchBtn.addEventListener("click", () =>
      this.handleSearch()
    );
    this.elements.cityInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleSearch();
    });

    // Autocomplete
    this.elements.cityInput.addEventListener(
      "input",
      Utils.debounce(() => this.handleAutocomplete(), CONFIG.DEBOUNCE_DELAY)
    );

    // Keyboard navigation
    this.elements.cityInput.addEventListener("keydown", (e) =>
      this.handleKeyboardNavigation(e)
    );

    // Click outside to close autocomplete
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-section")) {
        this.hideAutocomplete();
      }
    });

    // Keyboard shortcut: Ctrl/Cmd + K
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        this.elements.cityInput.focus();
      }
    });
  },

  /**
   * Lida com busca
   */
  async handleSearch() {
    const query = Utils.sanitizeInput(this.elements.cityInput.value);

    if (Utils.isEmpty(query)) {
      this.showError(ERROR_MESSAGES.EMPTY_INPUT);
      return;
    }

    this.hideAutocomplete();

    // Delegar para app.js
    if (window.app) {
      await window.app.searchWeather(query);
    }
  },

  /**
   * Lida com autocomplete
   */
  async handleAutocomplete() {
    const query = Utils.sanitizeInput(this.elements.cityInput.value);

    if (query.length < CONFIG.AUTOCOMPLETE_MIN_CHARS) {
      this.hideAutocomplete();
      return;
    }

    try {
      const suggestions = await API.getCitySuggestions(query);
      this.showAutocomplete(suggestions);
    } catch (error) {
      Utils.error("Erro no autocomplete:", error);
    }
  },

  /**
   * Mostra sugestões de autocomplete
   */
  showAutocomplete(suggestions) {
    if (!suggestions || suggestions.length === 0) {
      this.hideAutocomplete();
      return;
    }

    const html = suggestions
      .map(
        (city) => `
      <div class="autocomplete-item" data-city='${JSON.stringify(city)}'>
        <p class="city-name">${city.name}</p>
        <p class="country">${city.displayName}</p>
      </div>
    `
      )
      .join("");

    this.elements.autocomplete.innerHTML = html;
    this.elements.autocomplete.classList.remove("hidden");
    this.currentSuggestionIndex = -1;

    // Add click handlers
    this.elements.autocomplete
      .querySelectorAll(".autocomplete-item")
      .forEach((item) => {
        item.addEventListener("click", () => this.selectSuggestion(item));
      });
  },

  /**
   * Esconde autocomplete
   */
  hideAutocomplete() {
    this.elements.autocomplete.classList.add("hidden");
    this.currentSuggestionIndex = -1;
  },

  /**
   * Seleciona sugestão
   */
  selectSuggestion(item) {
    const city = JSON.parse(item.dataset.city);
    this.elements.cityInput.value = city.name;
    this.hideAutocomplete();

    if (window.app) {
      window.app.searchWeatherByCity(city);
    }
  },

  /**
   * Navegação por teclado no autocomplete
   */
  handleKeyboardNavigation(e) {
    const items =
      this.elements.autocomplete.querySelectorAll(".autocomplete-item");
    if (items.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.currentSuggestionIndex =
          (this.currentSuggestionIndex + 1) % items.length;
        this.highlightSuggestion(items);
        break;

      case "ArrowUp":
        e.preventDefault();
        this.currentSuggestionIndex =
          this.currentSuggestionIndex <= 0
            ? items.length - 1
            : this.currentSuggestionIndex - 1;
        this.highlightSuggestion(items);
        break;

      case "Enter":
        if (this.currentSuggestionIndex >= 0) {
          e.preventDefault();
          this.selectSuggestion(items[this.currentSuggestionIndex]);
        }
        break;

      case "Escape":
        this.hideAutocomplete();
        break;
    }
  },

  /**
   * Destaca sugestão ativa
   */
  highlightSuggestion(items) {
    items.forEach((item, index) => {
      item.classList.toggle("active", index === this.currentSuggestionIndex);
    });
  },

  /**
   * Mostra loading
   */
  showLoading() {
    this.hideAll();
    this.elements.loading.classList.remove("hidden");
  },

  /**
   * Mostra erro
   */
  showError(message = ERROR_MESSAGES.GENERIC) {
    this.hideAll();
    this.elements.errorMessage.textContent = message;
    this.elements.error.classList.remove("hidden");
  },

  /**
   * Mostra card de clima
   */
  showWeather(data) {
    this.hideAll();

    const processed = Weather.processWeatherData(data);

    // Update location
    this.elements.cityName.textContent = processed.location.name;
    this.elements.country.textContent = processed.location.country;

    // Update main weather
    this.elements.weatherIcon.textContent = processed.description.icon;
    this.elements.temperature.textContent = processed.formatted.temperature;
    this.elements.weatherDesc.textContent = processed.description.text;
    this.elements.feelsLike.textContent = `Sensação: ${processed.formatted.feelsLike}`;

    // Update details
    this.elements.humidity.textContent = processed.formatted.humidity;
    this.elements.windSpeed.textContent = `${processed.formatted.windSpeed} ${processed.formatted.windDirection}`;
    this.elements.pressure.textContent = processed.formatted.pressure;
    this.elements.cloudCover.textContent = processed.formatted.cloudCover;

    // Update time
    this.elements.lastUpdate.textContent = `Atualizado: ${processed.formatted.lastUpdate}`;

    // Update background gradient
    this.updateBackground(processed.description.gradient);

    // Show forecast if available
    if (data.forecast) {
      this.showForecast(data.forecast);
    }

    this.elements.weatherCard.classList.remove("hidden");
  },

  /**
   * Mostra previsão de 7 dias
   */
  showForecast(forecast) {
    if (!forecast || !forecast.daily) return;

    const { time, temperature_2m_max, temperature_2m_min, weather_code } =
      forecast.daily;

    const forecastHTML = time
      .slice(0, 7)
      .map((date, index) => {
        const dayName = this.getDayName(date, index);
        const maxTemp = Math.round(temperature_2m_max[index]);
        const minTemp = Math.round(temperature_2m_min[index]);
        const weatherInfo = Utils.getWeatherInfo(weather_code[index]);

        return `
        <div class="forecast-item">
          <p class="forecast-day">${dayName}</p>
          <span class="forecast-icon">${weatherInfo.icon}</span>
          <div class="forecast-temps">
            <span class="temp-max">${maxTemp}°</span>
            <span class="temp-min">${minTemp}°</span>
          </div>
        </div>
      `;
      })
      .join("");

    this.elements.forecastContainer.innerHTML = forecastHTML;
  },

  /**
   * Obtém nome do dia da semana
   */
  getDayName(dateString, index) {
    if (index === 0) return "Hoje";
    if (index === 1) return "Amanhã";

    const date = new Date(dateString);
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return days[date.getDay()];
  },

  /**
   * Atualiza gradiente de fundo
   */
  updateBackground(gradient) {
    document.body.style.background = gradient;
  },

  /**
   * Esconde todos os estados
   */
  hideAll() {
    this.elements.loading.classList.add("hidden");
    this.elements.error.classList.add("hidden");
    this.elements.weatherCard.classList.add("hidden");
  },
};

// Exportar para uso global
window.UI = UI;
