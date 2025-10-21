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
    RESULTS_COUNT: 1,
  },

  // Códigos de clima do Open-Meteo
  WEATHER_CODES: {
    0: { desc: "Céu limpo", icon: "☀️" },
    1: { desc: "Principalmente limpo", icon: "🌤️" },
    2: { desc: "Parcialmente nublado", icon: "⛅" },
    3: { desc: "Nublado", icon: "☁️" },
    45: { desc: "Neblina", icon: "🌫️" },
    48: { desc: "Névoa", icon: "🌫️" },
    51: { desc: "Garoa leve", icon: "🌦️" },
    53: { desc: "Garoa moderada", icon: "🌦️" },
    55: { desc: "Garoa densa", icon: "🌧️" },
    61: { desc: "Chuva leve", icon: "🌧️" },
    63: { desc: "Chuva moderada", icon: "🌧️" },
    65: { desc: "Chuva forte", icon: "⛈️" },
    71: { desc: "Neve leve", icon: "🌨️" },
    73: { desc: "Neve moderada", icon: "❄️" },
    75: { desc: "Neve forte", icon: "❄️" },
    80: { desc: "Pancadas leves", icon: "🌦️" },
    81: { desc: "Pancadas moderadas", icon: "⛈️" },
    82: { desc: "Pancadas fortes", icon: "⛈️" },
    95: { desc: "Tempestade", icon: "⛈️" },
    96: { desc: "Tempestade com granizo", icon: "⛈️" },
    99: { desc: "Tempestade severa", icon: "⛈️" },
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
  },
};
