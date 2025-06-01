# Weather Application 🌦️

A responsive weather application that displays current weather conditions, hourly forecasts, and 7-day forecasts for any location worldwide.

## Features ✨

- **Current Weather**: Temperature, conditions, humidity, wind speed, precipitation, and feels-like temperature
- **Hourly Forecast**: 6-hour weather predictions with icons
- **7-Day Forecast**: Daily weather overview with min/max temperatures
- **Location Detection**: Automatic weather for your current location
- **City Search**: Search for weather in any city worldwide
- **Unit Toggle**: Switch between Celsius and Fahrenheit
- **Additional Data**: UV index, air quality, sunrise/sunset times, and visibility
- **Responsive Design**: Works on mobile, tablet, and desktop

## Technologies Used 🛠️

- **Frontend**: HTML5, CSS3, JavaScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Remix Icon](https://remixicon.com/)
- **Weather API**: [OpenWeatherMap](https://openweathermap.org/)
- **Geolocation API**: [BigDataCloud](https://www.bigdatacloud.com/)

## Setup Instructions 🚀

### Prerequisites
- Web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- (Optional) API key from OpenWeatherMap

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/weather-app.git
2. Navigate to the project directory:
    ```bash
   cd weather-app
### Configuration
1. Get a free API key from OpenWeatherMap

2. Replace the placeholder API key in script.js:
   ```bash
   const API_KEY = 'your_api_key_here';
### Running the Application
Simply open index.html in your web browser. No server required!
### API Usage 📡
This app uses:

OpenWeatherMap Current Weather Data API

OpenWeatherMap 5 Day / 3 Hour Forecast API

OpenWeatherMap Air Pollution API

BigDataCloud Reverse Geocoding API
### Customization 🎨
You can easily customize:

Colors in the Tailwind config (in index.html)

Layout in the HTML/CSS

Weather icons by modifying the getWeatherIcon() function
