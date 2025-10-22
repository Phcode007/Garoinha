// Configurações e constantes do aplicativo
const CONFIG = {
  // API
  WEATHER_API: {
    BASE_URL: "https://api.open-meteo.com/v1/forecast",
    GEOCODING_URL: "https://geocoding-api.open-meteo.com/v1/search",
  },

  // Cache
  CACHE: {
    DURATION: 10 * 60 * 1000, // 10 minutos em milissegundos
    KEY: "garoinha_cache",
  },

  // Histórico
  HISTORY: {
    MAX_ITEMS: 5,
    KEY: "garoinha_history",
  },

  // Timeouts
  TIMEOUT: 10000, // 10 segundos
  DEBOUNCE: 300, // 300ms

  // Códigos do tempo e ícones
  WEATHER_CODES: {
    0: { desc: "Céu limpo", icon: "☀️", color: "#FFD700" },
    1: { desc: "Principalmente limpo", icon: "🌤️", color: "#87CEEB" },
    2: { desc: "Parcialmente nublado", icon: "⛅", color: "#B0C4DE" },
    3: { desc: "Nublado", icon: "☁️", color: "#A9A9A9" },
    45: { desc: "Nevoeiro", icon: "🌫️", color: "#D3D3D3" },
    48: { desc: "Nevoeiro com geada", icon: "🌫️❄️", color: "#D3D3D3" },
    51: { desc: "Garoa leve", icon: "🌦️", color: "#4682B4" },
    53: { desc: "Garoa moderada", icon: "🌦️", color: "#4682B4" },
    55: { desc: "Garoa densa", icon: "🌧️", color: "#4169E1" },
    56: { desc: "Garoa congelante leve", icon: "🌧️❄️", color: "#B0E0E6" },
    57: { desc: "Garoa congelante densa", icon: "🌧️❄️", color: "#B0E0E6" },
    61: { desc: "Chuva leve", icon: "🌦️", color: "#4682B4" },
    63: { desc: "Chuva moderada", icon: "🌧️", color: "#4169E1" },
    65: { desc: "Chuva forte", icon: "🌧️", color: "#000080" },
    66: { desc: "Chuva congelante leve", icon: "🌧️❄️", color: "#B0E0E6" },
    67: { desc: "Chuva congelante forte", icon: "🌧️❄️", color: "#B0E0E6" },
    71: { desc: "Queda de neve leve", icon: "🌨️", color: "#F0F8FF" },
    73: { desc: "Queda de neve moderada", icon: "🌨️", color: "#E6E6FA" },
    75: { desc: "Queda de neve forte", icon: "🌨️", color: "#D8BFD8" },
    77: { desc: "Grãos de neve", icon: "🌨️", color: "#E6E6FA" },
    80: { desc: "Pancadas de chuva leve", icon: "🌦️", color: "#4682B4" },
    81: { desc: "Pancadas de chuva moderada", icon: "🌧️", color: "#4169E1" },
    82: { desc: "Pancadas de chuva forte", icon: "🌧️", color: "#000080" },
    85: { desc: "Pancadas de neve leve", icon: "🌨️", color: "#F0F8FF" },
    86: { desc: "Pancadas de neve forte", icon: "🌨️", color: "#D8BFD8" },
    95: { desc: "Trovoada leve", icon: "⛈️", color: "#4B0082" },
    96: { desc: "Trovoada com granizo leve", icon: "⛈️🌀", color: "#4B0082" },
    99: { desc: "Trovoada com granizo forte", icon: "⛈️🌀", color: "#4B0082" },
  },

  // Direções do vento
  WIND_DIRECTIONS: [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ],
};

// Exportar para uso global (em projetos maiores usaríamos modules)
window.CONFIG = CONFIG;
