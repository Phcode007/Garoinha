// ========================================
// CONFIGURAÇÕES GERAIS
// ========================================

const CONFIG = {
  // APIs
  GEOCODING_API: "https://geocoding-api.open-meteo.com/v1/search",
  WEATHER_API: "https://api.open-meteo.com/v1/forecast",

  // Cache & Storage
  CACHE_DURATION: 10 * 60 * 1000, // 10 minutos
  HISTORY_MAX_ITEMS: 5,
  LAST_SEARCH_EXPIRY: 24 * 60 * 60 * 1000, // 24 horas

  // Timeouts & Delays
  REQUEST_TIMEOUT: 10000, // 10 segundos
  DEBOUNCE_DELAY: 300, // 300ms

  // Autocomplete
  AUTOCOMPLETE_MIN_CHARS: 2,
  AUTOCOMPLETE_MAX_RESULTS: 5,

  // LocalStorage Keys
  STORAGE_KEYS: {
    WEATHER_CACHE: "garoinha_weather_cache",
    HISTORY: "garoinha_history",
    LAST_SEARCH: "garoinha_last_search",
  },

  // App Info
  APP_NAME: "Garoinha",
  VERSION: "1.0.0",
};

// ========================================
// CÓDIGOS METEOROLÓGICOS
// ========================================

const WEATHER_CODES = {
  0: {
    desc: "Céu limpo",
    icon: "☀️",
    color: "#FFD700",
    gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  },
  1: {
    desc: "Principalmente limpo",
    icon: "🌤️",
    color: "#FDB813",
    gradient: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
  },
  2: {
    desc: "Parcialmente nublado",
    icon: "⛅",
    color: "#9DB4C0",
    gradient: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  },
  3: {
    desc: "Nublado",
    icon: "☁️",
    color: "#8B8B8B",
    gradient: "linear-gradient(135deg, #d7d2cc 0%, #304352 100%)",
  },
  45: {
    desc: "Neblina",
    icon: "🌫️",
    color: "#B0C4DE",
    gradient: "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)",
  },
  48: {
    desc: "Geada depositando-se",
    icon: "🌫️",
    color: "#B0C4DE",
    gradient: "linear-gradient(135deg, #e0e0e0 0%, #74b9ff 100%)",
  },
  51: {
    desc: "Garoa leve",
    icon: "🌦️",
    color: "#4682B4",
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  },
  53: {
    desc: "Garoa moderada",
    icon: "🌦️",
    color: "#4682B4",
    gradient: "linear-gradient(135deg, #a8edea 0%, #89c4f4 100%)",
  },
  55: {
    desc: "Garoa intensa",
    icon: "🌧️",
    color: "#1E90FF",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  61: {
    desc: "Chuva leve",
    icon: "🌧️",
    color: "#4169E1",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  63: {
    desc: "Chuva moderada",
    icon: "🌧️",
    color: "#0000CD",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  65: {
    desc: "Chuva forte",
    icon: "🌧️",
    color: "#00008B",
    gradient: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
  },
  66: {
    desc: "Chuva gelada leve",
    icon: "🌨️",
    color: "#87CEEB",
    gradient: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
  },
  67: {
    desc: "Chuva gelada forte",
    icon: "🌨️",
    color: "#4682B4",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  71: {
    desc: "Neve leve",
    icon: "🌨️",
    color: "#F0F8FF",
    gradient: "linear-gradient(135deg, #e0e0e0 0%, #74b9ff 100%)",
  },
  73: {
    desc: "Neve moderada",
    icon: "❄️",
    color: "#E0FFFF",
    gradient: "linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)",
  },
  75: {
    desc: "Neve intensa",
    icon: "❄️",
    color: "#B0E0E6",
    gradient: "linear-gradient(135deg, #e0e0e0 0%, #74b9ff 100%)",
  },
  77: {
    desc: "Grãos de neve",
    icon: "🌨️",
    color: "#ADD8E6",
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  },
  80: {
    desc: "Pancadas de chuva leves",
    icon: "🌦️",
    color: "#4682B4",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  81: {
    desc: "Pancadas de chuva moderadas",
    icon: "⛈️",
    color: "#4169E1",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  82: {
    desc: "Pancadas de chuva fortes",
    icon: "⛈️",
    color: "#0000CD",
    gradient: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
  },
  85: {
    desc: "Pancadas de neve leves",
    icon: "🌨️",
    color: "#F0F8FF",
    gradient: "linear-gradient(135deg, #e0e0e0 0%, #74b9ff 100%)",
  },
  86: {
    desc: "Pancadas de neve fortes",
    icon: "❄️",
    color: "#E0FFFF",
    gradient: "linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)",
  },
  95: {
    desc: "Tempestade",
    icon: "⛈️",
    color: "#483D8B",
    gradient: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
  },
  96: {
    desc: "Tempestade com granizo leve",
    icon: "⛈️",
    color: "#2F4F4F",
    gradient: "linear-gradient(135deg, #757f9a 0%, #d7dde8 100%)",
  },
  99: {
    desc: "Tempestade com granizo forte",
    icon: "⛈️",
    color: "#191970",
    gradient: "linear-gradient(135deg, #434343 0%, #000000 100%)",
  },
};

// ========================================
// MENSAGENS DE ERRO
// ========================================

const ERROR_MESSAGES = {
  CITY_NOT_FOUND: "Cidade não encontrada. Tente novamente.",
  NETWORK_ERROR: "Erro de conexão. Verifique sua internet.",
  TIMEOUT: "A requisição demorou muito. Tente novamente.",
  GENERIC: "Algo deu errado. Tente novamente mais tarde.",
  EMPTY_INPUT: "Digite o nome de uma cidade.",
  GEOLOCATION_DENIED: "Permissão de localização negada.",
  GEOLOCATION_ERROR: "Erro ao obter localização.",
};

// ========================================
// DIREÇÕES DO VENTO
// ========================================

const WIND_DIRECTIONS = {
  0: "N",
  22.5: "NNE",
  45: "NE",
  67.5: "ENE",
  90: "E",
  112.5: "ESE",
  135: "SE",
  157.5: "SSE",
  180: "S",
  202.5: "SSO",
  225: "SO",
  247.5: "OSO",
  270: "O",
  292.5: "ONO",
  315: "NO",
  337.5: "NNO",
};

// Exportar para uso global
window.CONFIG = CONFIG;
window.WEATHER_CODES = WEATHER_CODES;
window.ERROR_MESSAGES = ERROR_MESSAGES;
window.WIND_DIRECTIONS = WIND_DIRECTIONS;
