const fs = require('fs');
const path = require('path');

function loadScript(file) {
  const code = fs.readFileSync(path.resolve(__dirname, file), 'utf8');
  // Evaluate in global scope so scripts attach to window/global
  eval(code);
}

describe('Utils (unit)', () => {
  beforeEach(() => {
    // minimal globals expected by utils.js
    global.CONFIG = { APP_NAME: 'Garoinha' };
    global.Storage = { getUnit: () => 'C' };
    global.WEATHER_CODES = {};
    global.WIND_DIRECTIONS = {0: 'N'};
    // load utils
    loadScript('utils.js');
  });

  test('formatTemperature - Celsius and Fahrenheit', () => {
    expect(Utils.formatTemperature(10)).toBe('10°');

    global.Storage = { getUnit: () => 'F' };
    // reload utils to pick up Storage change
    loadScript('utils.js');

    expect(Utils.formatTemperature(0)).toBe('32°');
  });

  test('sanitizeInput removes angle brackets and trims', () => {
    expect(Utils.sanitizeInput('  <b>hello</b>  ')).toBe('bhellob/');
  });

  test('promiseWithTimeout rejects on timeout', async () => {
    jest.useFakeTimers();

    const longPromise = new Promise((resolve) => setTimeout(() => resolve('ok'), 1000));
    const p = Utils.promiseWithTimeout(longPromise, 10);

    jest.advanceTimersByTime(20);

    await expect(p).rejects.toThrow('REQUEST_TIMEOUT');
    jest.useRealTimers();
  });
});
