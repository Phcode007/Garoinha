// Manipulação da interface do usuário
class WeatherUI {
  constructor() {
    this.elements = this.initializeElements();
    this.bindEvents();
  }

  initializeElements() {
    return {
      searchInput: document.getElementById("searchInput"),
      searchBtn: document.getElementById("searchBtn"),
      suggestions: document.getElementById("suggestions"),
      weatherCard: document.getElementById("weatherCard"),
      errorMessage: document.getElementById("errorMessage"),
      loading: document.getElementById("loading"),

      // Elementos de dados do clima
      cityName: document.getElementById("cityName"),
      currentTime: document.getElementById("currentTime"),
      weatherIcon: document.getElementById("weatherIcon"),
      currentTemp: document.getElementById("currentTemp"),
      weatherDesc: document.getElementById("weatherDesc"),
      feelsLike: document.getElementById("feelsLike"),
      humidity: document.getElementById("humidity"),
      windSpeed: document.getElementById("windSpeed"),
      pressure: document.getElementById("pressure"),
    };
  }

  bindEvents() {
    // Busca
    this.elements.searchBtn.addEventListener("click", () =>
      this.handleSearch()
    );
    this.elements.searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleSearch();
    });

    // Autocomplete
    this.elements.searchInput.addEventListener(
      "input",
      this.debounce(() => {
        this.handleAutocomplete();
      }, CONFIG.DEBOUNCE)
    );

    // Sugestões
    this.elements.suggestions.addEventListener("click", (e) => {
      if (e.target.classList.contains("suggestion-item")) {
        this.selectSuggestion(e.target);
      }
    });

    // Teclado nas sugestões
    this.elements.searchInput.addEventListener("keydown", (e) => {
      this.handleKeyboardNavigation(e);
    });

    // Fechar sugestões ao clicar fora
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-container")) {
        this.hideSuggestions();
      }
    });

    // Atalho Ctrl/Cmd + K
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        this.elements.searchInput.focus();
      }
    });
  }

  // ========== SEARCH ==========
  async handleSearch() {
    const query = this.elements.searchInput.value.trim();
    if (!query) return;

    this.hideSuggestions();
    await window.garoinha.searchWeather(query);
  }

  // ========== AUTOCOMPLETE ==========
  async handleAutocomplete() {
    const query = this.elements.searchInput.value.trim();

    if (query.length < 2) {
      this.hideSuggestions();
      return;
    }

    const cities = await weatherAPI.searchCities(query);
    this.showSuggestions(cities);
  }

  showSuggestions(cities) {
    if (cities.length === 0) {
      this.hideSuggestions();
      return;
    }

    const suggestionsHTML = cities
      .map(
        (city) => `
            <div class="suggestion-item" data-lat="${
              city.latitude
            }" data-lon="${city.longitude}" data-name="${city.name}">
                <strong>${city.name}</strong>
                <span class="suggestion-details">
                    ${city.admin1 || ""} ${
          city.country_code ? `(${city.country_code})` : ""
        }
                </span>
            </div>
        `
      )
      .join("");

    this.elements.suggestions.innerHTML = suggestionsHTML;
    this.elements.suggestions.style.display = "block";
  }

  hideSuggestions() {
    this.elements.suggestions.style.display = "none";
  }

  selectSuggestion(suggestionElement) {
    const cityName = suggestionElement.dataset.name;
    const lat = parseFloat(suggestionElement.dataset.lat);
    const lon = parseFloat(suggestionElement.dataset.lon);

    this.elements.searchInput.value = cityName;
    this.hideSuggestions();
    window.garoinha.searchWeatherByCoords(lat, lon, cityName);
  }

  // ========== KEYBOARD NAVIGATION ==========
  handleKeyboardNavigation(e) {
    const suggestions =
      this.elements.suggestions.querySelectorAll(".suggestion-item");
    const activeSuggestion = this.elements.suggestions.querySelector(
      ".suggestion-item.active"
    );
    let currentIndex = Array.from(suggestions).indexOf(activeSuggestion);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        currentIndex = (currentIndex + 1) % suggestions.length;
        this.setActiveSuggestion(suggestions, currentIndex);
        break;

      case "ArrowUp":
        e.preventDefault();
        currentIndex =
          currentIndex <= 0 ? suggestions.length - 1 : currentIndex - 1;
        this.setActiveSuggestion(suggestions, currentIndex);
        break;

      case "Enter":
        if (activeSuggestion) {
          e.preventDefault();
          this.selectSuggestion(activeSuggestion);
        }
        break;

      case "Escape":
        this.hideSuggestions();
        break;
    }
  }

  setActiveSuggestion(suggestions, index) {
    suggestions.forEach((s) => s.classList.remove("active"));
    suggestions[index].classList.add("active");
  }

  // ========== WEATHER DISPLAY ==========
  showWeather(data) {
    this.hideAll();

    // Atualizar dados
    this.elements.cityName.textContent = data.city;
    this.elements.currentTime.textContent = data.lastUpdated;
    this.elements.weatherIcon.textContent = data.icon;
    this.elements.currentTemp.textContent = `${data.temperature}°`;
    this.elements.weatherDesc.textContent = data.description;
    this.elements.feelsLike.textContent = `${data.feelsLike}°`;
    this.elements.humidity.textContent = `${data.humidity}%`;
    this.elements.windSpeed.textContent = `${data.windSpeed} km/h ${data.windDirection}`;
    this.elements.pressure.textContent = `${data.pressure} hPa`;

    // Atualizar gradiente baseado no clima
    this.updateBackground(data.color);

    // Mostrar card
    this.elements.weatherCard.classList.remove("hidden");
  }

  updateBackground(color) {
    document.body.style.background = `linear-gradient(135deg, ${color} 0%, #764ba2 100%)`;
  }

  // ========== STATES ==========
  showLoading() {
    this.hideAll();
    this.elements.loading.classList.remove("hidden");
  }

  showError() {
    this.hideAll();
    this.elements.errorMessage.classList.remove("hidden");
  }

  hideAll() {
    this.elements.weatherCard.classList.add("hidden");
    this.elements.errorMessage.classList.add("hidden");
    this.elements.loading.classList.add("hidden");
  }

  // ========== UTILITIES ==========
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Instância global da UI
window.weatherUI = new WeatherUI();
