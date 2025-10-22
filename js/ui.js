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
    cityInput: document.getElementById("cityInput"),
    searchBtn: document.getElementById("searchBtn"),
  },

  // Estado do autocomplete
  autocomplete: {
    isVisible: false,
    selectedIndex: -1,
    suggestions: [],
  },

  /**
   * Inicializa componentes da UI
   */
  init() {
    this.createAutocompleteElement();
    this.loadRecentCities();
    this.createThemeToggle();
    this.setupAccessibility();
    this.createLocationButton();
    utils.applyTheme(utils.getCurrentTheme());

    // Verificar primeiro acesso
    if (utils.isFirstVisit()) {
      this.showWelcomeTour();
    }
  },

  /**
   * Configura melhorias de acessibilidade
   */
  setupAccessibility() {
    // Adicionar ARIA labels
    this.elements.cityInput.setAttribute(
      "aria-label",
      "Digite o nome da cidade para buscar previsão do tempo"
    );
    this.elements.cityInput.setAttribute(
      "aria-describedby",
      "searchInstructions"
    );
    this.elements.searchBtn.setAttribute(
      "aria-label",
      "Buscar previsão do tempo"
    );

    // Criar elemento de instruções
    const instructions = document.createElement("div");
    instructions.id = "searchInstructions";
    instructions.className = "sr-only";
    instructions.textContent =
      "Pressione Enter para buscar ou use as setas para navegar nas sugestões. Pressione Escape para fechar as sugestões.";

    this.elements.cityInput.parentNode.appendChild(instructions);
  },

  /**
   * Cria elemento de autocomplete
   */
  createAutocompleteElement() {
    const container = document.querySelector(".search-box");
    const dropdown = document.createElement("div");
    dropdown.id = "autocomplete";
    dropdown.className = "autocomplete-dropdown";
    dropdown.setAttribute("role", "listbox");
    dropdown.setAttribute("aria-label", "Sugestões de cidades");
    dropdown.style.display = "none";
    container.appendChild(dropdown);
  },

  /**
   * Cria botão de alternar tema
   */
  createThemeToggle() {
    const themeToggle = document.createElement("button");
    themeToggle.id = "themeToggle";
    themeToggle.className = "theme-toggle";
    themeToggle.innerHTML = utils.getCurrentTheme() === "light" ? "🌙" : "☀️";
    themeToggle.setAttribute(
      "aria-label",
      utils.getCurrentTheme() === "light"
        ? "Ativar modo escuro"
        : "Ativar modo claro"
    );

    themeToggle.addEventListener("click", () => {
      utils.toggleTheme();
    });

    document.querySelector(".logo").appendChild(themeToggle);
  },

  /**
   * Cria botão de localização
   */
  createLocationButton() {
    const locationBtn = document.createElement("button");
    locationBtn.id = "locationBtn";
    locationBtn.className = "location-btn";
    locationBtn.innerHTML = "📍";
    locationBtn.setAttribute("aria-label", "Usar minha localização atual");
    locationBtn.setAttribute("title", "Usar minha localização atual");

    locationBtn.addEventListener("click", () => {
      this.getLocationWeather();
    });

    // Inserir após a caixa de busca
    document
      .querySelector(".search-box")
      .parentNode.insertBefore(
        locationBtn,
        document.querySelector(".search-box").nextSibling
      );
  },

  /**
   * Busca clima pela localização atual
   */
  async getLocationWeather() {
    try {
      this.showLoading();

      const position = await utils.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      // Buscar nome da cidade
      const geoUrl = `${CONFIG.API.GEOCODING}?latitude=${latitude}&longitude=${longitude}&count=1&language=pt`;
      const response = await fetch(geoUrl);
      const data = await response.json();

      const cityName = data.results?.[0]?.name || "Localização Atual";

      // Buscar dados do clima
      await app.handleSearch(cityName);
    } catch (error) {
      console.error("Erro ao obter localização:", error);

      if (error.code === error.PERMISSION_DENIED) {
        this.showError(
          "Permissão de localização negada. Por favor, permita o acesso à localização."
        );
      } else if (error.code === error.TIMEOUT) {
        this.showError(
          "Tempo esgotado ao buscar localização. Tente novamente."
        );
      } else {
        this.showError(
          "Não foi possível obter sua localização. Verifique as permissões."
        );
      }
    }
  },

  /**
   * Mostra sugestões de autocomplete
   * @param {Array} suggestions - Lista de sugestões
   */
  showAutocompleteSuggestions(suggestions) {
    const dropdown = document.getElementById("autocomplete");

    if (!suggestions || suggestions.length === 0) {
      this.hideAutocompleteSuggestions();
      return;
    }

    this.autocomplete.suggestions = suggestions;
    this.autocomplete.selectedIndex = -1;

    dropdown.innerHTML = suggestions
      .map((city, index) => {
        // Construir localização completa
        let location = city.name;

        // Adicionar estado/região se existir
        if (city.admin1) {
          location += `, ${city.admin1}`;
        }

        // Adicionar país
        location += ` - ${city.country}`;

        return `
                <div class="autocomplete-item" 
                     data-index="${index}" 
                     role="option"
                     aria-selected="false"
                     id="suggestion-${index}">
                    <div class="city-info">
                        <span class="city-name">${city.name}</span>
                        <span class="city-details">${
                          city.admin1 ? city.admin1 + ", " : ""
                        }${city.country}</span>
                    </div>
                </div>
            `;
      })
      .join("");

    dropdown.style.display = "block";
    this.autocomplete.isVisible = true;

    // Atualizar ARIA
    dropdown.setAttribute("aria-expanded", "true");

    // Event listeners para cada item
    dropdown.querySelectorAll(".autocomplete-item").forEach((item) => {
      item.addEventListener("click", () => {
        const index = parseInt(item.dataset.index);
        this.selectSuggestion(index);
      });

      item.addEventListener("mouseenter", () => {
        this.autocomplete.selectedIndex = parseInt(item.dataset.index);
        this.highlightAutocompleteItem();
      });
    });
  },

  /**
   * Esconde sugestões de autocomplete
   */
  hideAutocompleteSuggestions() {
    const dropdown = document.getElementById("autocomplete");
    dropdown.style.display = "none";
    this.autocomplete.isVisible = false;
    this.autocomplete.selectedIndex = -1;
    dropdown.setAttribute("aria-expanded", "false");
  },

  /**
   * Seleciona uma sugestão do autocomplete
   * @param {number} index - Índice da sugestão
   */
  selectSuggestion(index) {
    const suggestion = this.autocomplete.suggestions[index];
    if (suggestion) {
      this.elements.cityInput.value = suggestion.name;
      this.hideAutocompleteSuggestions();
      app.handleSearch(suggestion.name);
    }
  },

  /**
   * Navega pelas sugestões com teclado
   * @param {string} direction - 'up' ou 'down'
   */
  navigateAutocomplete(direction) {
    if (
      !this.autocomplete.isVisible ||
      this.autocomplete.suggestions.length === 0
    ) {
      return;
    }

    const max = this.autocomplete.suggestions.length - 1;

    if (direction === "down") {
      this.autocomplete.selectedIndex = Math.min(
        this.autocomplete.selectedIndex + 1,
        max
      );
    } else if (direction === "up") {
      this.autocomplete.selectedIndex = Math.max(
        this.autocomplete.selectedIndex - 1,
        -1
      );
    }

    this.highlightAutocompleteItem();
  },

  /**
   * Destaca item selecionado do autocomplete
   */
  highlightAutocompleteItem() {
    const items = document.querySelectorAll(".autocomplete-item");
    items.forEach((item, index) => {
      const isSelected = index === this.autocomplete.selectedIndex;
      item.classList.toggle("selected", isSelected);
      item.setAttribute("aria-selected", isSelected);

      if (isSelected) {
        item.scrollIntoView({ block: "nearest" });
        const suggestion = this.autocomplete.suggestions[index];
        this.elements.cityInput.setAttribute(
          "aria-activedescendant",
          `suggestion-${index}`
        );
      }
    });

    if (this.autocomplete.selectedIndex === -1) {
      this.elements.cityInput.removeAttribute("aria-activedescendant");
    }
  },

  /**
   * Carrega cidades recentes
   */
  loadRecentCities() {
    const recent = utils.getRecentCities();
    if (recent.length > 0) {
      console.log("Cidades recentes:", recent);
      // Você pode exibir estas cidades em uma seção especial
    }
  },

  /**
   * Mostra o indicador de loading
   */
  showLoading() {
    this.elements.loading.style.display = "block";
    this.elements.errorMsg.style.display = "none";
    this.elements.welcomeMsg.style.display = "none";
    this.elements.weatherInfo.style.display = "none";
    this.hideAutocompleteSuggestions();

    // Atualizar ARIA
    this.elements.loading.setAttribute("aria-live", "polite");
    this.elements.loading.setAttribute("aria-busy", "true");
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

    // Atualizar ARIA
    this.elements.errorMsg.setAttribute("role", "alert");
    this.elements.errorMsg.setAttribute("aria-live", "assertive");
    this.elements.loading.setAttribute("aria-busy", "false");
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

    // Atualizar ARIA
    this.elements.weatherInfo.setAttribute("aria-live", "polite");
    this.elements.loading.setAttribute("aria-busy", "false");

    // Adicionar indicador offline se necessário
    if (data.isOffline) {
      this.showOfflineIndicator(data);
    }

    // Atualizar localização com estado se disponível
    this.elements.cityName.textContent = data.cityName;

    // Mostrar estado e país
    let locationDetails = "";
    if (data.state) {
      locationDetails = `${data.state}, ${data.country}`;
    } else {
      locationDetails = data.country;
    }
    this.elements.country.textContent = locationDetails;

    // Atualizar clima atual
    const weatherInfo = utils.getWeatherInfo(data.weatherCode);
    this.elements.weatherIcon.textContent = weatherInfo.icon;
    this.elements.weatherIcon.setAttribute("aria-label", weatherInfo.desc);
    this.elements.weatherDesc.textContent = weatherInfo.desc;
    this.elements.temperature.textContent = utils.formatTemperature(
      data.temperature
    );

    // Atualizar cor do gradiente baseado no clima
    const currentWeather = document.querySelector(".current-weather");
    if (weatherInfo.color) {
      currentWeather.style.background = `linear-gradient(135deg, ${
        weatherInfo.color
      } 0%, ${this.darkenColor(weatherInfo.color, 20)} 100%)`;
    }

    // Atualizar detalhes
    this.elements.windSpeed.textContent = utils.formatWindSpeed(data.windSpeed);
    this.elements.humidity.textContent = utils.formatHumidity(data.humidity);
    this.elements.feelsLike.textContent = utils.formatTemperature(
      data.apparentTemperature
    );
    this.elements.windDirection.textContent = utils.getWindDirection(
      data.windDirection
    );

    // Adicionar botão de favoritos
    this.addFavoriteButton(data);

    // Renderizar previsão semanal se disponível
    if (data.weeklyForecast) {
      this.renderWeeklyForecast(data.weeklyForecast);
    }

    // Adicionar animação suave
    this.elements.weatherInfo.style.animation = "fadeIn 0.5s ease-in";

    // Salvar no histórico
    utils.addToRecentCities({
      name: data.cityName,
      state: data.state,
      country: data.country,
    });
  },

  /**
   * Adiciona botão de favoritos
   * @param {object} cityData - Dados da cidade
   */
  addFavoriteButton(cityData) {
    // Remover botão existente se houver
    const existingBtn = document.getElementById("favoriteBtn");
    if (existingBtn) {
      existingBtn.remove();
    }

    const favoriteBtn = document.createElement("button");
    favoriteBtn.id = "favoriteBtn";
    favoriteBtn.className = "favorite-btn";
    favoriteBtn.innerHTML = utils.isFavorite(
      cityData.cityName,
      cityData.country
    )
      ? "♥"
      : "♡";
    favoriteBtn.setAttribute(
      "aria-label",
      utils.isFavorite(cityData.cityName, cityData.country)
        ? `Remover ${cityData.cityName} dos favoritos`
        : `Adicionar ${cityData.cityName} aos favoritos`
    );

    favoriteBtn.addEventListener("click", () => {
      this.toggleFavorite(cityData, favoriteBtn);
    });

    // Inserir após o nome da cidade
    this.elements.cityName.parentNode.insertBefore(
      favoriteBtn,
      this.elements.cityName.nextSibling
    );
  },

  /**
   * Alterna estado de favorito
   * @param {object} cityData - Dados da cidade
   * @param {HTMLElement} button - Botão de favorito
   */
  toggleFavorite(cityData, button) {
    const isCurrentlyFavorite = utils.isFavorite(
      cityData.cityName,
      cityData.country
    );

    if (isCurrentlyFavorite) {
      utils.removeFromFavorite(cityData.cityName, cityData.country);
      button.innerHTML = "♡";
      button.setAttribute(
        "aria-label",
        `Adicionar ${cityData.cityName} aos favoritos`
      );
      button.classList.remove("favorited");
    } else {
      utils.addToFavorites({
        name: cityData.cityName,
        country: cityData.country,
        state: cityData.state,
      });
      button.innerHTML = "♥";
      button.setAttribute(
        "aria-label",
        `Remover ${cityData.cityName} dos favoritos`
      );
      button.classList.add("favorited");
    }
  },

  /**
   * Renderiza previsão semanal
   * @param {object} forecastData - Dados da previsão
   */
  renderWeeklyForecast(forecastData) {
    // Remover previsão anterior se existir
    const existingForecast = document.querySelector(".weekly-forecast");
    if (existingForecast) {
      existingForecast.remove();
    }

    const forecastHTML = `
      <div class="weekly-forecast" aria-label="Previsão para os próximos 7 dias">
        <h3>Previsão para 7 Dias</h3>
        <div class="forecast-grid">
          ${forecastData.time
            .map((date, index) => {
              const weatherInfo = utils.getWeatherInfo(
                forecastData.weather_code[index]
              );
              return `
              <div class="forecast-day" role="listitem">
                <div class="day-name">${this.getDayName(date)}</div>
                <div class="forecast-icon" aria-label="${weatherInfo.desc}">${
                weatherInfo.icon
              }</div>
                <div class="forecast-temp">
                  <span class="max-temp">${Math.round(
                    forecastData.temperature_2m_max[index]
                  )}°</span>
                  <span class="min-temp">${Math.round(
                    forecastData.temperature_2m_min[index]
                  )}°</span>
                </div>
                ${
                  forecastData.precipitation_probability
                    ? `
                  <div class="precipitation-chance">
                    <span class="rain-icon">💧</span>
                    <span class="rain-value">${forecastData.precipitation_probability[index]}%</span>
                  </div>
                `
                    : ""
                }
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `;

    // Inserir após current-weather
    document
      .querySelector(".current-weather")
      .insertAdjacentHTML("afterend", forecastHTML);
  },

  /**
   * Obtém nome do dia da semana
   * @param {string} dateString - Data no formato string
   * @returns {string} Nome do dia
   */
  getDayName(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Verificar se é hoje
    if (date.toDateString() === today.toDateString()) {
      return "Hoje";
    }
    // Verificar se é amanhã
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Amanhã";
    }

    // Para outros dias, retornar nome abreviado
    return date.toLocaleDateString("pt-BR", { weekday: "short" });
  },

  /**
   * Mostra indicador de dados offline
   * @param {object} data - Dados do clima
   */
  showOfflineIndicator(data) {
    // Remover indicador anterior se existir
    const existingIndicator = document.querySelector(".offline-data-indicator");
    if (existingIndicator) {
      existingIndicator.remove();
    }

    const indicator = document.createElement("div");
    indicator.className = "offline-data-indicator";
    indicator.innerHTML = `
        <div class="offline-indicator-content">
            <span class="offline-icon">📶</span>
            <span class="offline-text">${
              data.offlineMessage || CONFIG.MESSAGES.OFFLINE_DATA
            }</span>
            <span class="offline-time">${utils.formatDateTime(
              data.offlineTimestamp || data.timestamp
            )}</span>
        </div>
    `;

    // Inserir antes das informações do clima
    this.elements.weatherInfo.insertBefore(
      indicator,
      this.elements.weatherInfo.firstChild
    );
  },

  /**
   * Escurece uma cor hexadecimal
   * @param {string} color - Cor em hex
   * @param {number} percent - Percentual para escurecer
   * @returns {string} Cor escurecida
   */
  darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00ff) - amt;
    const B = (num & 0x0000ff) - amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
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

  /**
   * Mostra tour de boas-vindas
   */
  showWelcomeTour() {
    // Implementar um tour guiado para novos usuários
    console.log("Mostrando tour de boas-vindas para novo usuário");

    // Você pode implementar um modal ou dicas interativas aqui
    setTimeout(() => {
      this.showSimpleTip(
        "💡 Dica: Use Ctrl+K para focar rapidamente na busca!"
      );
    }, 2000);
  },

  /**
   * Mostra dica simples
   * @param {string} message - Mensagem da dica
   */
  showSimpleTip(message) {
    const tip = document.createElement("div");
    tip.className = "simple-tip";
    tip.textContent = message;

    document.body.appendChild(tip);

    setTimeout(() => {
      if (tip.parentNode) {
        tip.parentNode.removeChild(tip);
      }
    }, 5000);
  },

  /**
   * Adiciona animação de shake ao input
   */
  shakeInput() {
    this.elements.cityInput.style.animation = "shake 0.5s";
    setTimeout(() => {
      this.elements.cityInput.style.animation = "";
    }, 500);
  },
};
