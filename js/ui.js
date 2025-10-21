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
  },

  /**
   * Cria elemento de autocomplete
   */
  createAutocompleteElement() {
    const container = document.querySelector(".search-box");
    const dropdown = document.createElement("div");
    dropdown.id = "autocomplete";
    dropdown.className = "autocomplete-dropdown";
    dropdown.style.display = "none";
    container.appendChild(dropdown);
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
                <div class="autocomplete-item" data-index="${index}">
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

    // Event listeners para cada item
    dropdown.querySelectorAll(".autocomplete-item").forEach((item) => {
      item.addEventListener("click", () => {
        const index = parseInt(item.dataset.index);
        this.selectSuggestion(index);
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
      if (index === this.autocomplete.selectedIndex) {
        item.classList.add("selected");
        const suggestion = this.autocomplete.suggestions[index];
        this.elements.cityInput.value = suggestion.name;
      } else {
        item.classList.remove("selected");
      }
    });
  },

  /**
   * Carrega cidades recentes
   */
  loadRecentCities() {
    const recent = utils.getRecentCities();
    if (recent.length > 0) {
      // Você pode criar uma seção de "Buscas Recentes" aqui
      console.log("Cidades recentes:", recent);
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
   * Adiciona animação de shake ao input
   */
  shakeInput() {
    this.elements.cityInput.style.animation = "shake 0.5s";
    setTimeout(() => {
      this.elements.cityInput.style.animation = "";
    }, 500);
  },
};
