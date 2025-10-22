// Configuração global para testes Jest

// Mock do DOM
const { JSDOM } = require("jsdom");

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost",
  pretendToBeVisual: true,
  resources: "usable",
});

global.document = dom.window.document;
global.window = dom.window;
global.navigator = dom.window.navigator;

// Mock do fetch
global.fetch = jest.fn();

// Mock do navigator.onLine;
Object.defineProperty(global.navigator, "onLine", {
  value: true,
  writable: true,
});

// Mock do serviceWorker
Object.defineProperty(global.navigator, "serviceWorker", {
  value: {
    register: jest.fn().mockResolvedValue({
      installing: null,
      addEventListener: jest.fn(),
    }),
    addEventListener: jest.fn(),
  },
  writable: true,
});
