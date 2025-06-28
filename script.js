const locationElement = document.getElementById("location");
const weatherIcon = document.getElementById("weatherIcon");
const currentTempElement = document.getElementById("currentTemp");
const highTempElement = document.getElementById("highTemp");
const lowTempElement = document.getElementById("lowTemp");
const descriptionElement = document.getElementById("description");
const weatherForecastElement = document.getElementById("weatherForecast");
const cityInput = document.getElementById("cityInput");
const getWeatherBtn = document.getElementById("getWeatherBtn");
const changeCityBtn = document.getElementById("changeCityBtn");
const cityModal = document.getElementById("cityModal");
const closeModalBtn = document.querySelector(".close-button");

const API_KEY = "e435a1628e851fa2a7b1b4a462798512";

// Function to get weather data
async function getWeatherData(city) {
  try {
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    const [currentWeatherResponse, forecastResponse] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastUrl),
    ]);

    if (!currentWeatherResponse.ok) throw new Error("City not found");
    if (!forecastResponse.ok) throw new Error("Forecast data not found");

    const currentWeatherData = await currentWeatherResponse.json();
    const forecastData = await forecastResponse.json();

    displayWeather(currentWeatherData);
    displayForecast(forecastData);

    cityModal.style.display = "none";

  } catch (error) {
    alert(error.message);
    cityModal.style.display = "flex";
  }
}

function displayWeather(data) {
  locationElement.textContent = data.name;
  weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  if (data.main.temp !== undefined && data.main.temp !== null) {
    currentTempElement.textContent = Math.round(data.main.temp);
    document.querySelector('.unit').style.display = '';
  } else {
    currentTempElement.textContent = '';
    document.querySelector('.unit').style.display = 'none';
  }
  highTempElement.textContent = Math.round(data.main.temp_max);
  lowTempElement.textContent = Math.round(data.main.temp_min);
  descriptionElement.textContent = data.weather[0].description;
  // Show high/low only when data is present
  document.getElementById('highLow').style.display = '';

  // Set dynamic background based on weather condition
  const weatherMain = data.weather[0].main.toLowerCase();
  const body = document.body;

  // Remove all existing weather-related background classes
  body.classList.remove(
    "clear-sky",
    "few-clouds",
    "scattered-clouds",
    "broken-clouds",
    "overcast-clouds",
    "shower-rain",
    "rain",
    "thunderstorm",
    "snow",
    "mist",
    "haze",
    "fog"
  );

  // Add the appropriate background class
  if (weatherMain === "clear") {
    body.classList.add("clear-sky");
  } else if (weatherMain === "clouds") {
    const description = data.weather[0].description.toLowerCase();
    if (description.includes("few clouds")) {
      body.classList.add("few-clouds");
    } else if (description.includes("scattered clouds")) {
      body.classList.add("scattered-clouds");
    } else if (description.includes("broken clouds")) {
      body.classList.add("broken-clouds");
    } else if (description.includes("overcast clouds")) {
      body.classList.add("overcast-clouds");
    } else {
      body.classList.add("cloudy");
    }
  } else if (weatherMain === "rain") {
    body.classList.add("rain");
  } else if (weatherMain === "drizzle") {
    body.classList.add("shower-rain");
  } else if (weatherMain === "thunderstorm") {
    body.classList.add("thunderstorm");
  } else if (weatherMain === "snow") {
    body.classList.add("snow");
  } else if (["mist", "smoke", "haze", "dust", "fog", "sand", "ash", "squall", "tornado"].includes(weatherMain)) {
    body.classList.add("mist");
  }
}

function displayForecast(data) {
  weatherForecastElement.innerHTML = "";
  const dailyForecasts = {};

  data.list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });

    if (!dailyForecasts[day]) {
      dailyForecasts[day] = { min: item.main.temp, max: item.main.temp, icon: item.weather[0].icon };
    } else {
      dailyForecasts[day].min = Math.min(dailyForecasts[day].min, item.main.temp);
      dailyForecasts[day].max = Math.max(dailyForecasts[day].max, item.main.temp);
    }
  });

  const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
  let forecastCount = 0;
  for (const day in dailyForecasts) {
    if (day === today && forecastCount === 0) {
        continue;
    }
    if (forecastCount >= 5) break;

    const item = dailyForecasts[day];
    const forecastItem = document.createElement("div");
    forecastItem.classList.add("forecast-item");
    forecastItem.innerHTML = `
      <div>${day}</div>
      <img src="http://openweathermap.org/img/wn/${item.icon}.png" alt="Weather Icon" />
      <div>${Math.round(item.max)}/${Math.round(item.min)}</div>
    `;
    weatherForecastElement.appendChild(forecastItem);
    forecastCount++;
  }
}

// Event Listeners
getWeatherBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeatherData(city);
  }
});

changeCityBtn.addEventListener("click", () => {
  cityModal.style.display = "flex";
  cityInput.focus();
});

closeModalBtn.addEventListener("click", () => {
  cityModal.style.display = "none";
});

// Allow Enter key to submit
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) {
      getWeatherData(city);
    }
  }
});

// Close modal when clicking outside
window.addEventListener("click", (event) => {
  if (event.target === cityModal) {
    cityModal.style.display = "none";
  }
});

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  weatherIcon.src = 'assets/default-weather.svg';
  document.querySelector('.unit').style.display = 'none';
  document.getElementById('highLow').style.display = 'none';
  cityModal.style.display = "flex";
});
