const fs = require('fs');
const path = require('path');

function loadScript(file) {
  const code = fs.readFileSync(path.resolve(__dirname, file), 'utf8');
  eval(code);
}

describe('API (unit)', () => {
  beforeEach(() => {
    global.CONFIG = { GEOCODING_API: 'https://example.test/geocode', AUTOCOMPLETE_MAX_RESULTS: 5, REQUEST_TIMEOUT: 1000, WEATHER_API: 'https://example.test/weather' };
    global.Utils = {
      promiseWithTimeout: (p) => p,
      error: jest.fn(),
      log: jest.fn(),
      isEmpty: (s) => !s || s.trim().length === 0,
    };
    global.Storage = {
      getFromCache: () => null,
      saveToCache: jest.fn(),
    };
    global.fetch = jest.fn();
    loadScript('api.js');
  });

  test('searchCity returns results when API responds', async () => {
    const fake = { results: [{ name: 'Teste', country: 'BR', latitude: -23.5, longitude: -46.6 }] };
    global.fetch.mockResolvedValue({ ok: true, json: async () => fake });

    const res = await API.searchCity('Teste');
    expect(Array.isArray(res)).toBe(true);
    expect(res[0].name).toBe('Teste');
  });

  test('searchCity throws CITY_NOT_FOUND when no results', async () => {
    const fake = { results: [] };
    global.fetch.mockResolvedValue({ ok: true, json: async () => fake });

    await expect(API.searchCity('Nada')).rejects.toThrow('CITY_NOT_FOUND');
  });
});
