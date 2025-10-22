// Testes unitários para utils.js

// Mock do localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock do CONFIG
global.CONFIG = {
  WIND_DIRECTIONS: ["N", "NE", "L", "SE", "S", "SO", "O", "NO"],
  WEATHER_CODES: {
    0: { desc: "Céu limpo", icon: "☀️", color: "#FFD700" },
    1: { desc: "Principalmente limpo", icon: "🌤️", color: "#FFA500" },
  },
  STORAGE: {
    RECENT_CITIES: "garoinha_recent_cities",
    FAVORITE_CITIES: "garoinha_favorite_cities",
    THEME: "garoinha_theme",
    OFFLINE_DATA: "garoinha_offline_data",
  },
  DEFAULTS: {
    MAX_RECENT_CITIES: 5,
  },
  MESSAGES: {
    OFFLINE_MESSAGE: "Você está offline. Dados podem não estar atualizados.",
    OFFLINE_DATA: "Dados em cache - Última busca online",
  },
  THEME: {
    LIGHT: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      cardBg: "rgba(255, 255, 255, 0.95)",
      text: "#333",
      secondaryText: "#666",
    },
    DARK: {
      background: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
      cardBg: "rgba(30, 30, 30, 0.95)",
      text: "#fff",
      secondaryText: "#bbb",
    },
  },
  SERVICE_WORKER: {
    ENABLED: true,
  },
};

// Importar utils após definir os mocks
const utils = require("../js/utils");

describe("Utils Functions", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test("getWindDirection returns correct direction", () => {
    expect(utils.getWindDirection(0)).toBe("N");
    expect(utils.getWindDirection(45)).toBe("NE");
    expect(utils.getWindDirection(90)).toBe("L");
    expect(utils.getWindDirection(180)).toBe("S");
    expect(utils.getWindDirection(270)).toBe("O");
    expect(utils.getWindDirection(360)).toBe("N");
  });

  test("getWeatherInfo returns correct weather info", () => {
    const clearSky = utils.getWeatherInfo(0);
    expect(clearSky.desc).toBe("Céu limpo");
    expect(clearSky.icon).toBe("☀️");

    const mostlyClear = utils.getWeatherInfo(1);
    expect(mostlyClear.desc).toBe("Principalmente limpo");
  });

  test("roundTemperature rounds correctly", () => {
    expect(utils.roundTemperature(22.4)).toBe(22);
    expect(utils.roundTemperature(22.6)).toBe(23);
    expect(utils.roundTemperature(-5.2)).toBe(-5);
  });

  test("validateCityInput works correctly", () => {
    expect(utils.validateCityInput("São Paulo")).toBe(true);
    expect(utils.validateCityInput("  ")).toBe(false);
    expect(utils.validateCityInput("")).toBe(false);
    expect(utils.validateCityInput(null)).toBe(false);
    expect(utils.validateCityInput(undefined)).toBe(false);
  });

  test("formatTemperature formats correctly", () => {
    expect(utils.formatTemperature(22.4)).toBe("22°C");
    expect(utils.formatTemperature(22.6)).toBe("23°C");
    expect(utils.formatTemperature(-5)).toBe("-5°C");
  });

  test("formatWindSpeed formats correctly", () => {
    expect(utils.formatWindSpeed(15.7)).toBe("16 km/h");
    expect(utils.formatWindSpeed(10.2)).toBe("10 km/h");
  });

  test("formatHumidity formats correctly", () => {
    expect(utils.formatHumidity(65)).toBe("65%");
    expect(utils.formatHumidity(100)).toBe("100%");
  });

  test("debounce delays function execution", () => {
    jest.useFakeTimers();
    const mockFn = jest.fn();
    const debouncedFn = utils.debounce(mockFn, 100);

    debouncedFn();
    expect(mockFn).not.toBeCalled();

    jest.advanceTimersByTime(100);
    expect(mockFn).toBeCalled();
  });

  test("saveToStorage and getFromStorage work correctly", () => {
    const testData = { city: "São Paulo", temp: 22 };
    utils.saveToStorage("test", testData);

    expect(localStorageMock.setItem).toBeCalledWith(
      "test",
      JSON.stringify(testData)
    );

    const retrieved = utils.getFromStorage("test");
    expect(retrieved).toEqual(testData);
  });

  test("addToRecentCities manages recent cities correctly", () => {
    const cityData = { name: "São Paulo", country: "Brasil", state: "SP" };

    utils.addToRecentCities(cityData);

    const recent = utils.getRecentCities();
    expect(recent).toHaveLength(1);
    expect(recent[0].name).toBe("São Paulo");
  });

  test("addToRecentCities prevents duplicates", () => {
    const cityData = { name: "São Paulo", country: "Brasil", state: "SP" };

    utils.addToRecentCities(cityData);
    utils.addToRecentCities(cityData); // Duplicata

    const recent = utils.getRecentCities();
    expect(recent).toHaveLength(1); // Ainda deve ter apenas 1
  });

  test("formatDateTime formats correctly", () => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;

    expect(utils.formatDateTime(oneMinuteAgo)).toContain("minuto");
    expect(utils.formatDateTime(oneHourAgo)).toContain("hora");
  });

  test("favorite management works correctly", () => {
    const cityData = { name: "Rio de Janeiro", country: "Brasil", state: "RJ" };

    // Adicionar aos favoritos
    utils.addToFavorites(cityData);
    expect(utils.isFavorite("Rio de Janeiro", "Brasil")).toBe(true);

    // Remover dos favoritos
    utils.removeFromFavorite("Rio de Janeiro", "Brasil");
    expect(utils.isFavorite("Rio de Janeiro", "Brasil")).toBe(false);
  });

  test("theme management works correctly", () => {
    // Testar aplicação de tema
    utils.applyTheme("light");
    utils.applyTheme("dark");

    // Testar toggle
    utils.saveToStorage(CONFIG.STORAGE.THEME, "light");
    utils.toggleTheme();
    expect(utils.getCurrentTheme()).toBe("dark");

    utils.toggleTheme();
    expect(utils.getCurrentTheme()).toBe("light");
  });

  test("offline data management works correctly", () => {
    const weatherData = {
      cityName: "São Paulo",
      country: "Brasil",
      temperature: 22,
      timestamp: Date.now(),
    };

    // Salvar dados offline
    utils.saveOfflineData(weatherData);

    // Recuperar dados offline
    const offlineData = utils.getOfflineData();
    expect(offlineData.data.cityName).toBe("São Paulo");

    // Limpar dados offline
    utils.clearOfflineData();
    expect(utils.getOfflineData()).toBeNull();
  });

  test("capitalize capitalizes correctly", () => {
    expect(utils.capitalize("são paulo")).toBe("São Paulo");
    expect(utils.capitalize("rio de janeiro")).toBe("Rio De Janeiro");
  });

  test("isMobile detects mobile devices", () => {
    // Este teste pode variar dependendo do ambiente
    expect(typeof utils.isMobile()).toBe("boolean");
  });
});
