// Script simples para buscar temperatura de uma cidade usando Open-Meteo API

async function getWeather(cityName) {
  try {
    // 1. Primeiro, buscar as coordenadas da cidade
    console.log(`Buscando dados para: ${cityName}...`);

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      cityName
    )}&count=1&language=pt&format=json`;

    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    // Verificar se a cidade foi encontrada
    if (!geoData.results || geoData.results.length === 0) {
      console.log(`Cidade "${cityName}" não encontrada.`);
      return;
    }

    const location = geoData.results[0];
    const { latitude, longitude, name, country } = location;

    console.log(`\nCidade encontrada: ${name}, ${country}`);
    console.log(`Coordenadas: ${latitude}, ${longitude}`);

    // 2. Buscar dados meteorológicos usando as coordenadas
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;

    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    // 3. Extrair e exibir a temperatura
    const temperature = weatherData.current_weather.temperature;
    const windSpeed = weatherData.current_weather.windspeed;
    const weatherCode = weatherData.current_weather.weathercode;

    console.log("\n--- DADOS METEOROLÓGICOS ---");
    console.log(`Temperatura: ${temperature}°C`);
    console.log(`Velocidade do vento: ${windSpeed} km/h`);
    console.log(`Código do clima: ${weatherCode}`);
    console.log("---------------------------\n");
  } catch (error) {
    console.error("Erro ao buscar dados meteorológicos:", error.message);
  }
}

// Exemplo de uso
getWeather("São Paulo");

// Para testar com outras cidades, descomente as linhas abaixo:
// getWeather('Rio de Janeiro');
// getWeather('Londres');
// getWeather('Nova York');
