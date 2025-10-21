// Configurações da aplicação Garoinha

const CONFIG = {
  // URLs da API
  API: {
    GEOCODING: "https://geocoding-api.open-meteo.com/v1/search",
    WEATHER: "https://api.open-meteo.com/v1/forecast",
  },

  // Parâmetros padrão
  DEFAULTS: {
    LANGUAGE: "pt",
    TIMEZONE: "auto",
    RESULTS_COUNT: 5, // Aumentado para autocomplete
    MAX_RECENT_CITIES: 5,
  },

  // LocalStorage keys
  STORAGE: {
    RECENT_CITIES: "garoinha_recent_cities",
    FAVORITE_CITY: "garoinha_favorite_city",
    LAST_SEARCH: "garoinha_last_search",
  },

  // Códigos de clima do Open-Meteo
  WEATHER_CODES: {
    0: { desc: "Céu limpo", icon: "☀️", color: "#FFD700" },
    1: { desc: "Principalmente limpo", icon: "🌤️", color: "#FFA500" },
    2: { desc: "Parcialmente nublado", icon: "⛅", color: "#87CEEB" },
    3: { desc: "Nublado", icon: "☁️", color: "#B0C4DE" },
    45: { desc: "Neblina", icon: "🌫️", color: "#778899" },
    48: { desc: "Névoa", icon: "🌫️", color: "#778899" },
    51: { desc: "Garoa leve", icon: "🌦️", color: "#4682B4" },
    53: { desc: "Garoa moderada", icon: "🌦️", color: "#4169E1" },
    55: { desc: "Garoa densa", icon: "🌧️", color: "#1E90FF" },
    61: { desc: "Chuva leve", icon: "🌧️", color: "#4682B4" },
    63: { desc: "Chuva moderada", icon: "🌧️", color: "#4169E1" },
    65: { desc: "Chuva forte", icon: "⛈️", color: "#191970" },
    71: { desc: "Neve leve", icon: "🌨️", color: "#F0F8FF" },
    73: { desc: "Neve moderada", icon: "❄️", color: "#E0FFFF" },
    75: { desc: "Neve forte", icon: "❄️", color: "#B0E0E6" },
    80: { desc: "Pancadas leves", icon: "🌦️", color: "#4682B4" },
    81: { desc: "Pancadas moderadas", icon: "⛈️", color: "#483D8B" },
    82: { desc: "Pancadas fortes", icon: "⛈️", color: "#2F4F4F" },
    95: { desc: "Tempestade", icon: "⛈️", color: "#191970" },
    96: { desc: "Tempestade com granizo", icon: "⛈️", color: "#000080" },
    99: { desc: "Tempestade severa", icon: "⛈️", color: "#000000" },
  },

  // Direções do vento
  WIND_DIRECTIONS: ["N", "NE", "L", "SE", "S", "SO", "O", "NO"],

  // Mensagens
  MESSAGES: {
    LOADING: "Buscando dados do clima...",
    CITY_NOT_FOUND: "Cidade não encontrada. Tente novamente.",
    CONNECTION_ERROR: "Erro ao buscar dados. Verifique sua conexão.",
    WELCOME_TITLE: "Bem-vindo ao Garoinha! 🌧️",
    WELCOME_TEXT: "Digite o nome de uma cidade para ver a previsão do tempo",
    EMPTY_INPUT: "Por favor, digite o nome de uma cidade.",
    LOADING_SUGGESTIONS: "Buscando sugestões...",
  },

  // Timeout para requisições (ms)
  TIMEOUT: 10000,

  // Debounce delay para autocomplete (ms)
  DEBOUNCE_DELAY: 300,
};
