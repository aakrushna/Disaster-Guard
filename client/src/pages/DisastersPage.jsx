import React, { useState, useEffect } from 'react';
import '../styles/DisastersPage.css';

const DisastersPage = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [city, setCity] = useState('Mumbai');
  const [searchCity, setSearchCity] = useState('');
  
  // State for disaster report form
  const [reportForm, setReportForm] = useState({
    name: '',
    phone: '',
    location: '',
    disasterType: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const API_KEY = '22d270c0482783a1710964c4f07f5c81';

  useEffect(() => {
    fetchWeatherData();
  }, [city]);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      console.log(`Fetching weather data for: ${city}`);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'City not found or weather data unavailable');
      }
      
      const data = await response.json();
      console.log('Weather data received:', data);
      setWeatherData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      console.log(`Setting city to: ${searchCity.trim()}`);
      setCity(searchCity.trim());
      setSearchCity('');
    }
  };

  const handleReportChange = (e) => {
    const { id, value } = e.target;
    setReportForm(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      console.log('Disaster report submitted:', reportForm);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setReportForm({
        name: '',
        phone: '',
        location: '',
        disasterType: '',
        description: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 1500);
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getBackgroundClass = (weatherMain) => {
    if (!weatherMain) return 'default-bg';
    
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return 'clear-bg';
      case 'clouds':
        return 'clouds-bg';
      case 'rain':
      case 'drizzle':
        return 'rain-bg';
      case 'thunderstorm':
        return 'thunderstorm-bg';
      case 'snow':
        return 'snow-bg';
      case 'mist':
      case 'fog':
      case 'haze':
        return 'mist-bg';
      default:
        return 'default-bg';
    }
  };

  return (
    <div className="disasters-container">
      <div className="disasters-header">
        <h1>Disasters Information</h1>
        <p>Stay informed about current weather conditions and report disasters in your area to help others stay safe.</p>
      </div>
      
      <div className="disaster-cards-section">
        <div className="cards-container">
          <div className={`weather-card ${weatherData ? getBackgroundClass(weatherData.weather[0].main) : 'default-bg'}`}>
            <div className="weather-search">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search city..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                />
                <button type="submit">
                  <i className="fas fa-search"></i>
                </button>
              </form>
            </div>
            
            {loading && (
              <div className="weather-loading">
                <div className="spinner"></div>
                <p>Loading weather data...</p>
              </div>
            )}
            
            {error && !loading && (
              <div className="weather-error">
                <i className="fas fa-exclamation-circle"></i>
                <p>{error}</p>
                <p>Please try another city.</p>
              </div>
            )}
            
            {weatherData && !loading && !error && (
              <div className="weather-content">
                <div className="weather-header">
                  <h3>{weatherData.name}, {weatherData.sys.country}</h3>
                  <p className="weather-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                
                <div className="weather-info">
                  <div className="weather-temp">
                    <h2>{Math.round(weatherData.main.temp)}°C</h2>
                    <p>Feels like: {Math.round(weatherData.main.feels_like)}°C</p>
                  </div>
                  
                  <div className="weather-condition">
                    <img 
                      src={getWeatherIcon(weatherData.weather[0].icon)} 
                      alt={weatherData.weather[0].description} 
                    />
                    <p>{weatherData.weather[0].description}</p>
                  </div>
                </div>
                
                <div className="weather-details">
                  <div className="weather-detail-item">
                    <i className="fas fa-wind"></i>
                    <div>
                      <p className="detail-label">Wind</p>
                      <p className="detail-value">{Math.round(weatherData.wind.speed * 3.6)} km/h</p>
                    </div>
                  </div>
                  
                  <div className="weather-detail-item">
                    <i className="fas fa-tint"></i>
                    <div>
                      <p className="detail-label">Humidity</p>
                      <p className="detail-value">{weatherData.main.humidity}%</p>
                    </div>
                  </div>
                  
                  <div className="weather-detail-item">
                    <i className="fas fa-compress-arrows-alt"></i>
                    <div>
                      <p className="detail-label">Pressure</p>
                      <p className="detail-value">{weatherData.main.pressure} hPa</p>
                    </div>
                  </div>
                </div>
                
                <div className="weather-alert">
                  {weatherData.weather[0].main === 'Thunderstorm' && (
                    <p><i className="fas fa-exclamation-triangle"></i> Thunderstorm Alert: Seek shelter and stay away from windows and electrical appliances.</p>
                  )}
                  {weatherData.weather[0].main === 'Rain' && weatherData.rain && weatherData.rain['1h'] > 10 && (
                    <p><i className="fas fa-exclamation-triangle"></i> Heavy Rain Alert: Be aware of potential flooding in low-lying areas.</p>
                  )}
                  {weatherData.wind.speed > 20 && (
                    <p><i className="fas fa-exclamation-triangle"></i> Strong Wind Alert: Secure loose objects outdoors and be cautious when driving.</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="report-card">
            <div className="report-card-header">
              <h3>Report a Disaster</h3>
              <p>Help others by reporting disasters in your area</p>
            </div>
            <div className="report-card-body">
              {submitSuccess ? (
                <div className="report-success">
                  <i className="fas fa-check-circle"></i>
                  <p>Thank you for your report! Your information has been submitted successfully.</p>
                </div>
              ) : (
                <form className="report-form" onSubmit={handleReportSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      placeholder="Enter your full name"
                      value={reportForm.name}
                      onChange={handleReportChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      placeholder="Enter your phone number"
                      value={reportForm.phone}
                      onChange={handleReportChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input 
                      type="text" 
                      id="location" 
                      placeholder="City, State"
                      value={reportForm.location}
                      onChange={handleReportChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="disasterType">Disaster Type</label>
                    <select 
                      id="disasterType" 
                      value={reportForm.disasterType}
                      onChange={handleReportChange}
                      required
                    >
                      <option value="">Select disaster type</option>
                      <option value="flood">Flood</option>
                      <option value="earthquake">Earthquake</option>
                      <option value="cyclone">Cyclone</option>
                      <option value="landslide">Landslide</option>
                      <option value="fire">Fire</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea 
                      id="description" 
                      rows="4" 
                      placeholder="Briefly describe the situation"
                      value={reportForm.description}
                      onChange={handleReportChange}
                      required
                    ></textarea>
                  </div>
                  
                  <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="spinner-small"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit Report'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisastersPage; 