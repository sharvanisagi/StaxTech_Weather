// Weather data fetching functions
const API_KEY = '0e597e65407d85df172c9ee946e59196'; 

async function fetchWeatherData(lat, lon) {
  try {
    // Fetch current weather
    const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const currentData = await currentResponse.json();
    
    // Fetch 7-day forecast
    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const forecastData = await forecastResponse.json();
    
    // Fetch air quality
    const airQualityResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    const airQualityData = await airQualityResponse.json();
    
    return {
      current: currentData,
      forecast: forecastData,
      airQuality: airQualityData
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    showToast('Failed to fetch weather data. Please try again.');
    return null;
  }
}

function updateWeatherUI(data) {
  if (!data) return;
  
  // Update current weather
  const current = data.current;
  document.getElementById('locationTitle').textContent = `${current.name}, ${current.sys.country}`;
  document.getElementById('currentTemp').textContent = `${Math.round(current.main.temp)}°`;
  document.getElementById('weatherCondition').textContent = current.weather[0].description;
  document.getElementById('humidity').textContent = `${current.main.humidity}%`;
  document.getElementById('windSpeed').textContent = `${Math.round(current.wind.speed * 3.6)} km/h`;
  document.getElementById('feelsLike').textContent = `${Math.round(current.main.feels_like)}°`;
  
  // Update precipitation (rain or snow)
  if (current.rain && current.rain['1h']) {
    document.getElementById('precipitation').textContent = `${Math.round(current.rain['1h'])}%`;
  } else if (current.snow && current.snow['1h']) {
    document.getElementById('precipitation').textContent = `${Math.round(current.snow['1h'])}%`;
  } else {
    document.getElementById('precipitation').textContent = '0%';
  }
  
  // Update weather icon
  const weatherIcon = document.getElementById('weatherIcon');
  const weatherCode = current.weather[0].id;
  weatherIcon.className = getWeatherIcon(weatherCode, current.sys.sunrise, current.sys.sunset) + ' text-6xl text-primary';
  
  // Update date
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
  
  // Update hourly forecast
  updateHourlyForecast(data.forecast.list);
  
  // Update daily forecast
  updateDailyForecast(data.forecast.list);
  
  // Update UV index, sunrise/sunset
  document.getElementById('sunrise').textContent = new Date(current.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('sunset').textContent = new Date(current.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Update air quality
  const aqi = data.airQuality.list[0].main.aqi;
  document.getElementById('airQuality').textContent = aqi;
  document.getElementById('airQualityText').textContent = getAirQualityText(aqi);
  
  // Update visibility
  document.getElementById('visibility').textContent = `${current.visibility / 1000} km`;
  document.getElementById('visibilityText').textContent = getVisibilityText(current.visibility / 1000);
}

function updateHourlyForecast(hourlyData) {
  const hourlyContainer = document.getElementById('hourlyForecast');
  hourlyContainer.innerHTML = '';
  
  // Show next 12 hours
  const now = new Date();
  const next12Hours = hourlyData.filter(item => {
    const itemDate = new Date(item.dt * 1000);
    return itemDate > now && itemDate <= new Date(now.getTime() + 12 * 60 * 60 * 1000);
  }).slice(0, 6); // Limit to 6 items for better display
  
  // Add current weather as first item
  const currentItem = hourlyData[0];
  const currentHourDiv = createHourlyForecastItem('Now', currentItem.weather[0].id, currentItem.main.temp);
  hourlyContainer.appendChild(currentHourDiv);
  
  // Add next hours
  next12Hours.forEach(item => {
    const date = new Date(item.dt * 1000);
    const hour = date.getHours();
    const hourDiv = createHourlyForecastItem(`${hour}:00`, item.weather[0].id, item.main.temp);
    hourlyContainer.appendChild(hourDiv);
  });
}

function createHourlyForecastItem(time, weatherCode, temp) {
  const div = document.createElement('div');
  div.className = 'text-center p-4 bg-gray-50 rounded-lg min-w-[100px]';
  
  const timeDiv = document.createElement('div');
  timeDiv.className = 'text-sm text-gray-600 mb-2';
  timeDiv.textContent = time;
  
  const iconDiv = document.createElement('div');
  iconDiv.className = 'w-8 h-8 flex items-center justify-center mx-auto mb-2';
  
  const icon = document.createElement('i');
  icon.className = getWeatherIcon(weatherCode) + ' text-xl text-primary';
  
  const tempDiv = document.createElement('div');
  tempDiv.className = 'font-medium';
  tempDiv.textContent = `${Math.round(temp)}°`;
  
  iconDiv.appendChild(icon);
  div.appendChild(timeDiv);
  div.appendChild(iconDiv);
  div.appendChild(tempDiv);
  
  return div;
}

function updateDailyForecast(dailyData) {
  const dailyContainer = document.getElementById('dailyForecast');
  dailyContainer.innerHTML = '';
  
  // Group by day
  const days = {};
  dailyData.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    if (!days[dayKey]) {
      days[dayKey] = {
        temps: [],
        weatherCodes: []
      };
    }
    
    days[dayKey].temps.push(item.main.temp);
    days[dayKey].weatherCodes.push(item.weather[0].id);
  });
  
  // Get min/max temps and most common weather for each day
  const dayKeys = Object.keys(days);
  dayKeys.slice(0, 7).forEach((dayKey, index) => {
    const dayData = days[dayKey];
    const minTemp = Math.min(...dayData.temps);
    const maxTemp = Math.max(...dayData.temps);
    
    // Find most common weather code
    const weatherCounts = {};
    dayData.weatherCodes.forEach(code => {
      weatherCounts[code] = (weatherCounts[code] || 0) + 1;
    });
    const mostCommonWeather = Object.keys(weatherCounts).reduce((a, b) => weatherCounts[a] > weatherCounts[b] ? a : b);
    
    const dayDiv = document.createElement('div');
    dayDiv.className = 'flex items-center justify-between p-4 bg-gray-50 rounded-lg';
    
    const dayNameDiv = document.createElement('div');
    dayNameDiv.className = 'w-24';
    dayNameDiv.textContent = index === 0 ? 'Today' : dayKey;
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'w-8 h-8 flex items-center justify-center';
    
    const icon = document.createElement('i');
    icon.className = getWeatherIcon(mostCommonWeather) + ' text-xl text-primary';
    
    const tempDiv = document.createElement('div');
    tempDiv.className = 'flex gap-4';
    
    const maxTempSpan = document.createElement('span');
    maxTempSpan.className = 'font-medium';
    maxTempSpan.textContent = `${Math.round(maxTemp)}°`;
    
    const minTempSpan = document.createElement('span');
    minTempSpan.className = 'text-gray-400';
    minTempSpan.textContent = `${Math.round(minTemp)}°`;
    
    iconDiv.appendChild(icon);
    tempDiv.appendChild(maxTempSpan);
    tempDiv.appendChild(minTempSpan);
    
    dayDiv.appendChild(dayNameDiv);
    dayDiv.appendChild(iconDiv);
    dayDiv.appendChild(tempDiv);
    
    dailyContainer.appendChild(dayDiv);
  });
}

function getWeatherIcon(weatherCode, sunrise = null, sunset = null) {
  const isDay = sunrise && sunset 
    ? (Date.now() / 1000 > sunrise && Date.now() / 1000 < sunset)
    : true; // Default to day if no sunrise/sunset provided
  
  // Thunderstorm
  if (weatherCode >= 200 && weatherCode < 300) {
    return 'ri-thunderstorms-line';
  }
  // Drizzle
  else if (weatherCode >= 300 && weatherCode < 400) {
    return 'ri-drizzle-line';
  }
  // Rain
  else if (weatherCode >= 500 && weatherCode < 600) {
    if (weatherCode < 502) return 'ri-rainy-line';
    if (weatherCode < 504) return 'ri-heavy-showers-line';
    return 'ri-rainy-heavy-line';
  }
  // Snow
  else if (weatherCode >= 600 && weatherCode < 700) {
    return 'ri-snowy-line';
  }
  // Atmosphere (fog, mist, etc.)
  else if (weatherCode >= 700 && weatherCode < 800) {
    return 'ri-foggy-line';
  }
  // Clear
  else if (weatherCode === 800) {
    return isDay ? 'ri-sun-line' : 'ri-moon-clear-line';
  }
  // Clouds
  else if (weatherCode > 800 && weatherCode < 900) {
    if (weatherCode === 801) return isDay ? 'ri-sun-cloudy-line' : 'ri-moon-cloudy-line';
    if (weatherCode === 802) return 'ri-cloudy-line';
    return 'ri-cloudy-2-line';
  }
  // Extreme or additional conditions
  else {
    return 'ri-question-line';
  }
}

function getAirQualityText(aqi) {
  switch(aqi) {
    case 1: return 'Good';
    case 2: return 'Fair';
    case 3: return 'Moderate';
    case 4: return 'Poor';
    case 5: return 'Very Poor';
    default: return 'Unknown';
  }
}

function getVisibilityText(visibilityKm) {
  if (visibilityKm > 10) return 'Excellent visibility';
  if (visibilityKm > 5) return 'Good visibility';
  if (visibilityKm > 2) return 'Moderate visibility';
  if (visibilityKm > 1) return 'Poor visibility';
  return 'Very poor visibility';
}

// Location handling
document.addEventListener('DOMContentLoaded', function() {
  const tempToggle = document.querySelector('.switch input');
  tempToggle.addEventListener('change', function() {
    const temps = document.querySelectorAll('[class*="text-"]:not([class*="text-gray"])');
    temps.forEach(temp => {
      const text = temp.textContent;
      if (text.includes('°')) {
        const num = parseInt(text);
        if (this.checked) {
          temp.textContent = Math.round(num * 9/5 + 32) + '°';
        } else {
          temp.textContent = Math.round((num - 32) * 5/9) + '°';
        }
      }
    });
  });
  
  const locationBtn = document.getElementById('locationBtn');
  const locationModal = document.getElementById('locationModal');
  const allowLocationBtn = document.getElementById('allowLocationBtn');
  const denyLocationBtn = document.getElementById('denyLocationBtn');
  const toast = document.getElementById('toast');
  
  locationBtn.addEventListener('click', () => {
    locationModal.style.display = 'flex';
  });
  
  allowLocationBtn.addEventListener('click', () => {
    locationModal.style.display = 'none';
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          
          try {
            // First get city name
            const geoResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const geoData = await geoResponse.json();
            
            const city = geoData.city || geoData.locality;
            const country = geoData.countryCode;
            
            if (city) {
              document.getElementById('locationTitle').textContent = `${city}, ${country}`;
              document.getElementById('searchInput').value = `${city}, ${country}`;
            }
            
            // Then get weather data
            const weatherData = await fetchWeatherData(latitude, longitude);
            updateWeatherUI(weatherData);
          } catch (error) {
            console.error('Error:', error);
            showToast('Unable to get location details. Please search manually.');
          }
        },
        (error) => {
          showToast('Location access denied. Please search manually.');
        }
      );
    } else {
      showToast('Geolocation is not supported. Please search manually.');
    }
  });
  
  denyLocationBtn.addEventListener('click', () => {
    locationModal.style.display = 'none';
    showToast('Location access denied. Please search manually.');
  });
  
  function showToast(message = 'Location access denied. Please search for your city manually.') {
    toast.firstElementChild.textContent = message;
    toast.style.display = 'flex';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }
});

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  let debounceTimer;
  
  searchInput.addEventListener('input', function() {
    const value = this.value.toLowerCase();
    clearTimeout(debounceTimer);
    
    if (value.length >= 2) {
      debounceTimer = setTimeout(() => {
        fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${value}&limit=5&appid=${API_KEY}`)
          .then(response => response.json())
          .then(data => {
            if (data.length > 0) {
              const cities = data.map(city => {
                return `${city.name}, ${city.country}`;
              });
              displayResults(cities, data);
              searchResults.classList.add('show');
            } else {
              displayResults(['No cities found']);
            }
          })
          .catch(err => {
            console.error(err);
            displayResults(['No cities found']);
          });
      }, 300);
    } else {
      searchResults.classList.remove('show');
    }
  });
  
  document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.remove('show');
    }
  });
  
  function displayResults(results, geoData = []) {
    searchResults.innerHTML = '';
    
    if (results[0] === 'No cities found') {
      const div = document.createElement('div');
      div.classList.add('search-item');
      div.textContent = 'No cities found';
      searchResults.appendChild(div);
      return;
    }
    
    results.forEach((city, index) => {
      const div = document.createElement('div');
      div.classList.add('search-item');
      div.textContent = city;
      div.addEventListener('click', async () => {
        document.getElementById('locationTitle').textContent = city;
        searchInput.value = city;
        searchResults.classList.remove('show');
        
        // Fetch weather for selected city
        const selectedCity = geoData[index];
        const weatherData = await fetchWeatherData(selectedCity.lat, selectedCity.lon);
        updateWeatherUI(weatherData);
      });
      searchResults.appendChild(div);
    });
  }
});

// Initialize with default location (San Francisco)
window.addEventListener('load', async () => {
  const defaultLat = 37.7749;
  const defaultLon = -122.4194;
  const weatherData = await fetchWeatherData(defaultLat, defaultLon);
  updateWeatherUI(weatherData);
});