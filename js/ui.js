// ========================================
// MANIPULAÇÃO DA INTERFACE DO USUÁRIO - VERSÃO COMPLETA E CORRIGIDA
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
   * Mostra card de clima - VERSÃO CORRIGIDA
   */
  showWeather(data) {
    this.hideAll();

    const processed = Weather.processWeatherData(data);

    if (!processed) {
      this.showError("Erro ao processar dados do clima");
      return;
    }

    // Debug: Mostrar estrutura dos dados processados
    console.log("🔍 Dados processados:", {
      location: processed.location,
      current: processed.current,
      description: processed.description,
      forecast: processed.forecast,
      forecastExists: !!processed.forecast,
      forecastTimeExists: processed.forecast
        ? !!processed.forecast.time
        : false,
    });

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

    // CORREÇÃO PRINCIPAL: Verificar se forecast existe e tem dados
    if (processed.forecast && processed.forecast.time) {
      console.log("✅ Forecast encontrado, exibindo...");
      this.showForecast(processed.forecast);
    } else {
      console.warn(
        "❌ Forecast não encontrado ou sem dados:",
        processed.forecast
      );
      this.elements.forecastContainer.innerHTML =
        '<p style="text-align: center; color: #718096;">Previsão não disponível para esta localização</p>';
    }

    this.elements.weatherCard.classList.remove("hidden");
  },

  /**
   * Mostra previsão de 7 dias - VERSÃO COMPLETA E CORRIGIDA
   */
  showForecast(forecast) {
    // CORREÇÃO: Verificar se forecast tem a estrutura correta
    console.log("🔍 Debug forecast na UI:", forecast);

    if (!forecast) {
      console.error("❌ Forecast é null/undefined");
      this.elements.forecastContainer.innerHTML =
        '<p style="text-align: center; color: #718096;">Dados de previsão indisponíveis</p>';
      return;
    }

    if (!forecast.time) {
      console.error("❌ Forecast não tem propriedade 'time':", forecast);
      this.elements.forecastContainer.innerHTML =
        '<p style="text-align: center; color: #718096;">Dados de previsão incompletos</p>';
      return;
    }

    if (!Array.isArray(forecast.time)) {
      console.error("❌ Forecast.time não é um array:", typeof forecast.time);
      this.elements.forecastContainer.innerHTML =
        '<p style="text-align: center; color: #718096;">Formato de dados inválido</p>';
      return;
    }

    if (forecast.time.length === 0) {
      console.error("❌ Forecast.time está vazio");
      this.elements.forecastContainer.innerHTML =
        '<p style="text-align: center; color: #718096;">Sem dados de previsão disponíveis</p>';
      return;
    }

    // CORREÇÃO: Verificar se os arrays correspondentes existem e têm dados
    const {
      time,
      temperature_2m_max,
      temperature_2m_min,
      weather_code,
      precipitation_sum,
      precipitation_probability_max,
    } = forecast;

    if (!temperature_2m_max || !temperature_2m_min || !weather_code) {
      console.error("❌ Arrays de forecast incompletos:", {
        temperature_2m_max: !!temperature_2m_max,
        temperature_2m_min: !!temperature_2m_min,
        weather_code: !!weather_code,
      });
      this.elements.forecastContainer.innerHTML =
        '<p style="text-align: center; color: #718096;">Dados de previsão incompletos</p>';
      return;
    }

    // Verificar se todos os arrays têm o mesmo tamanho
    if (
      temperature_2m_max.length !== time.length ||
      temperature_2m_min.length !== time.length ||
      weather_code.length !== time.length
    ) {
      console.error("❌ Arrays de forecast têm tamanhos diferentes:", {
        time: time.length,
        tempMax: temperature_2m_max.length,
        tempMin: temperature_2m_min.length,
        weatherCode: weather_code.length,
      });
      this.elements.forecastContainer.innerHTML =
        '<p style="text-align: center; color: #718096;">Dados de previsão inconsistentes</p>';
      return;
    }

    console.log("✅ Forecast validado com sucesso:", {
      dias: time.length,
      temProbabilidade: !!precipitation_probability_max,
      temChuva: !!precipitation_sum,
    });

    // Gerar HTML da previsão
    const forecastHTML = time
      .slice(0, 7)
      .map((date, index) => {
        const dayName = this.getDayName(date, index);
        const maxTemp = Math.round(temperature_2m_max[index]);
        const minTemp = Math.round(temperature_2m_min[index]);
        const weatherInfo = Utils.getWeatherInfo(weather_code[index]);

        // CORREÇÃO: Adicionar informação de chuva se disponível
        const rainInfo = precipitation_probability_max
          ? `<p style="font-size: 0.75rem; color: #4a90e2; margin-top: 2px; display: flex; align-items: center; justify-content: center; gap: 3px;">
            💧 <span>${precipitation_probability_max[index] || 0}%</span>
          </p>`
          : "";

        const rainAmount = precipitation_sum
          ? `<p style="font-size: 0.7rem; color: #718096; margin-top: 1px;">
            🌧️ ${precipitation_sum[index] || 0}mm
          </p>`
          : "";

        return `
        <div class="forecast-item" style="animation: fadeInUp 0.3s ease ${
          index * 0.1
        }s both;">
          <p class="forecast-day">${dayName}</p>
          <span class="forecast-icon" title="${weatherInfo.desc}">${
          weatherInfo.icon
        }</span>
          <div class="forecast-temps">
            <span class="temp-max">${maxTemp}°</span>
            <span class="temp-min">${minTemp}°</span>
          </div>
          ${rainInfo}
          ${rainAmount}
        </div>
      `;
      })
      .join("");

    this.elements.forecastContainer.innerHTML = forecastHTML;

    // Adicionar evento de hover para mostrar informações extras
    this.addForecastTooltips();
  },

  /**
   * Adiciona tooltips aos itens de previsão
   */
  addForecastTooltips() {
    const forecastItems =
      this.elements.forecastContainer.querySelectorAll(".forecast-item");

    forecastItems.forEach((item, index) => {
      item.addEventListener("mouseenter", (e) => {
        // Poderia adicionar tooltip com mais informações
        item.style.transform = "translateY(-4px)";
        item.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.2)";
      });

      item.addEventListener("mouseleave", (e) => {
        item.style.transform = "translateY(0)";
        item.style.boxShadow = "none";
      });
    });
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

  /**
   * Função para atualizar apenas a previsão (útil para refresh)
   */
  updateForecast(forecast) {
    if (forecast && forecast.time) {
      this.showForecast(forecast);
    }
  },

  /**
   * Mostra/esconde elementos de forma animada
   */
  animateElement(element, show = true) {
    if (show) {
      element.classList.remove("hidden");
      element.style.opacity = "0";
      element.style.transform = "translateY(20px)";

      setTimeout(() => {
        element.style.transition = "all 0.3s ease";
        element.style.opacity = "1";
        element.style.transform = "translateY(0)";
      }, 10);
    } else {
      element.style.transition = "all 0.3s ease";
      element.style.opacity = "0";
      element.style.transform = "translateY(-20px)";

      setTimeout(() => {
        element.classList.add("hidden");
      }, 300);
    }
  },

  /**
   * Atualiza a interface com novos dados de clima
   */
  refreshWeather(data) {
    if (data && data.weather) {
      // Atualizar informações principais
      this.elements.temperature.textContent = Utils.formatTemperature(
        data.weather.temperature_2m
      );
      this.elements.weatherIcon.textContent = Utils.getWeatherInfo(
        data.weather.weather_code
      ).icon;
      this.elements.weatherDesc.textContent = Utils.getWeatherInfo(
        data.weather.weather_code
      ).desc;
      this.elements.feelsLike.textContent = `Sensação: ${Utils.formatTemperature(
        data.weather.apparent_temperature
      )}`;

      // Atualizar detalhes
      this.elements.humidity.textContent = Utils.formatHumidity(
        data.weather.relative_humidity_2m
      );
      this.elements.windSpeed.textContent = `${Utils.formatWindSpeed(
        data.weather.wind_speed_10m
      )} ${Utils.getWindDirection(data.weather.wind_direction_10m)}`;
      this.elements.pressure.textContent = Utils.formatPressure(
        data.weather.pressure_msl
      );
      this.elements.cloudCover.textContent = Utils.formatCloudCover(
        data.weather.cloud_cover
      );

      // Atualizar horário
      this.elements.lastUpdate.textContent = `Atualizado: ${Utils.formatDate(
        new Date(data.timestamp)
      )}`;

      // Atualizar background
      if (data.weather) {
        const weatherInfo = Utils.getWeatherInfo(data.weather.weather_code);
        this.updateBackground(weatherInfo.gradient);
      }

      // Atualizar forecast se disponível
      if (data.forecast && data.forecast.time) {
        this.updateForecast(data.forecast);
      }
    }
  },
};

// Exportar para uso global
window.UI = UI;
