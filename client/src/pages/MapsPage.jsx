import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { disastersAPI } from '../services/api';
import '../styles/MapsPage.css';

const MapsPage = () => {
  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState('disaster'); // Options: disaster, evacuation, relief
  const [showReportForm, setShowReportForm] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [reportData, setReportData] = useState({
    title: '',
    type: 'flood',
    description: '',
    severity: 'medium',
    contact: ''
  });
  const [disasters, setDisasters] = useState([]);
  const [error, setError] = useState(null);
  
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkersRef = useRef([]);
  
  const { isLoggedIn, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Map center coordinates (Mumbai, India as default)
  const defaultCenter = { lat: 19.0760, lng: 72.8777 };
  
  // Map configurations for different types
  const mapConfigs = {
    disaster: {
      center: defaultCenter,
      zoom: 12,
      mapTypeId: 'terrain',
      styles: [
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#e9e9e9' }, { lightness: 17 }]
        },
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [{ color: '#f5f5f5' }, { lightness: 20 }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.fill',
          stylers: [{ color: '#ffffff' }, { lightness: 17 }]
        },
        {
          featureType: 'administrative',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#ff0000' }, { lightness: 17 }, { weight: 1.2 }]
        }
      ]
    },
    evacuation: {
      center: defaultCenter,
      zoom: 14,
      mapTypeId: 'roadmap',
      styles: [
        {
          featureType: 'road.highway',
          elementType: 'geometry.fill',
          stylers: [{ color: '#007bff' }, { lightness: 40 }]
        },
        {
          featureType: 'road.arterial',
          elementType: 'geometry.fill',
          stylers: [{ color: '#6c757d' }, { lightness: 40 }]
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#000000' }]
        }
      ]
    },
    relief: {
      center: defaultCenter,
      zoom: 13,
      mapTypeId: 'roadmap',
      styles: [
        {
          featureType: 'poi.medical',
          elementType: 'geometry',
          stylers: [{ color: '#ff5252' }, { lightness: 40 }]
        },
        {
          featureType: 'poi.business',
          elementType: 'geometry',
          stylers: [{ color: '#4caf50' }, { lightness: 40 }]
        },
        {
          featureType: 'poi.government',
          elementType: 'geometry',
          stylers: [{ color: '#2196f3' }, { lightness: 40 }]
        }
      ]
    }
  };

  // Sample markers for different map types (fallback if API fails)
  const sampleMarkers = {
    disaster: [
      { position: { lat: 19.0760, lng: 72.8777 }, title: 'High Risk Zone', icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' },
      { position: { lat: 19.0860, lng: 72.8877 }, title: 'Medium Risk Zone', icon: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png' },
      { position: { lat: 19.0660, lng: 72.8677 }, title: 'Low Risk Zone', icon: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png' }
    ],
    evacuation: [
      { position: { lat: 19.0760, lng: 72.8777 }, title: 'Evacuation Start Point', icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' },
      { position: { lat: 19.0960, lng: 72.8977 }, title: 'Emergency Exit', icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' },
      { position: { lat: 19.1060, lng: 72.9077 }, title: 'Safe Zone', icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' }
    ],
    relief: [
      { position: { lat: 19.0760, lng: 72.8777 }, title: 'Medical Center', icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' },
      { position: { lat: 19.0860, lng: 72.8877 }, title: 'Food & Water Distribution', icon: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png' },
      { position: { lat: 19.0660, lng: 72.8677 }, title: 'Shelter', icon: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png' }
    ]
  };

  // Fetch disasters from API
  const fetchDisasters = async () => {
    try {
      setError(null);
      const response = await disastersAPI.getAllDisasters();
      
      if (response.data.success) {
        setDisasters(response.data.data);
      } else {
        setError('Failed to fetch disaster data');
        console.error('API error:', response.data.message);
      }
    } catch (err) {
      setError('Error connecting to the server');
      console.error('Fetch disasters error:', err);
    }
  };

  // Initialize map when component mounts
  useEffect(() => {
    // Fetch disasters from API
    fetchDisasters();
    
    // Function to initialize the map
    const initializeMap = () => {
      if (mapRef.current && window.google && window.google.maps) {
        try {
          // Get the configuration for the current map type
          const config = mapConfigs[mapType];
          
          // Create a new map instance
          googleMapRef.current = new window.google.maps.Map(mapRef.current, {
            center: defaultCenter,
            zoom: config.zoom,
            mapTypeId: config.mapTypeId,
            styles: config.styles,
            fullscreenControl: false,
            streetViewControl: false
          });
          
          // Explicitly set center to Mumbai
          googleMapRef.current.setCenter(defaultCenter);
          
          // Add markers
          addMarkers();
          
          // Add click listener for adding user location
          googleMapRef.current.addListener('click', (event) => {
            if (showReportForm) {
              setUserLocation({
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
              });
              
              // Show temporary marker at clicked location
              addTemporaryMarker(event.latLng);
            }
          });
          
          // Set loading to false once map is loaded
          setLoading(false);
          
          // Add listener for when the map is idle (fully loaded)
          googleMapRef.current.addListener('idle', () => {
            console.log('Map is fully loaded and centered on Mumbai');
          });
        } catch (error) {
          console.error('Error initializing Google Maps:', error);
          setLoading(false);
        }
      }
    };

    // Check if Google Maps API is loaded
    if (window.google && window.google.maps) {
      console.log('Google Maps API already loaded');
      initializeMap();
    } else {
      console.log('Loading Google Maps API script');
      // If not loaded yet, create and append the script
      const googleMapScript = document.createElement('script');
      googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCdkxLosaiJW5u-eFcLGKIQ_am6d5Wbrw0&libraries=places`;
      googleMapScript.async = true;
      googleMapScript.defer = true;
      
      // Add event listener for when the script loads
      googleMapScript.addEventListener('load', () => {
        console.log('Google Maps API script loaded');
        initializeMap();
      });
      
      // Add error handler
      googleMapScript.addEventListener('error', (error) => {
        console.error('Error loading Google Maps API script:', error);
        setLoading(false);
      });
      
      // Append the script to the document body
      document.body.appendChild(googleMapScript);
      
      // Cleanup function
      return () => {
        googleMapScript.removeEventListener('load', initializeMap);
        googleMapScript.removeEventListener('error', () => {
          console.error('Error loading Google Maps API script');
        });
      };
    }
  }, []);

  // Update markers when disasters change
  useEffect(() => {
    if (googleMapRef.current && disasters.length > 0) {
      addMarkers();
    }
  }, [disasters, mapType]);

  // Add temporary marker at user's selected location
  const addTemporaryMarker = (latLng) => {
    // Clear any existing temporary markers
    userMarkersRef.current.forEach(marker => marker.setMap(null));
    userMarkersRef.current = [];
    
    // Add new temporary marker
    if (googleMapRef.current) {
      const marker = new window.google.maps.Marker({
        position: latLng,
        map: googleMapRef.current,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new window.google.maps.Size(40, 40)
        },
        animation: window.google.maps.Animation.BOUNCE,
        title: 'Your selected location'
      });
      
      userMarkersRef.current.push(marker);
    }
  };

  // Get appropriate icon based on disaster type
  const getDisasterIcon = (disasterType) => {
    const iconMap = {
      flood: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      fire: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      earthquake: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
      cyclone: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
      landslide: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
      other: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
    };
    
    return iconMap[disasterType] || iconMap.other;
  };

  // Add markers to the map
  const addMarkers = () => {
    if (googleMapRef.current) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      
      if (mapType === 'disaster' && disasters.length > 0) {
        // Add disaster markers from API data
        disasters.forEach(disaster => {
          if (disaster.location && disaster.location.coordinates && disaster.location.coordinates.length === 2) {
            const position = {
              lat: disaster.location.coordinates[1],
              lng: disaster.location.coordinates[0]
            };
            
            const marker = new window.google.maps.Marker({
              position: position,
              map: googleMapRef.current,
              title: disaster.title,
              icon: getDisasterIcon(disaster.type),
              animation: window.google.maps.Animation.DROP
            });
            
            // Add info window
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div class="disaster-info-window">
                  <h3>${disaster.title}</h3>
                  <p><strong>Type:</strong> ${disaster.type}</p>
                  <p><strong>Severity:</strong> ${disaster.severity}</p>
                  <p><strong>Description:</strong> ${disaster.description}</p>
                  <p><strong>Status:</strong> ${disaster.status}</p>
                  <p><strong>Reported:</strong> ${new Date(disaster.createdAt).toLocaleString()}</p>
                </div>
              `
            });
            
            marker.addListener('click', () => {
              infoWindow.open(googleMapRef.current, marker);
            });
            
            markersRef.current.push(marker);
          }
        });
      } else {
        // Add sample markers for other map types or if no disasters
        const markers = mapType === 'disaster' && disasters.length === 0 ? 
          sampleMarkers[mapType] : sampleMarkers[mapType];
        
        markers.forEach(markerInfo => {
          const marker = new window.google.maps.Marker({
            position: markerInfo.position,
            map: googleMapRef.current,
            title: markerInfo.title,
            icon: markerInfo.icon,
            animation: window.google.maps.Animation.DROP
          });
          
          // Add info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div><strong>${markerInfo.title}</strong></div>`
          });
          
          marker.addListener('click', () => {
            infoWindow.open(googleMapRef.current, marker);
          });
          
          // Store marker reference for later cleanup
          markersRef.current.push(marker);
        });
      }
    }
  };

  // Handle map type change
  const handleMapTypeChange = (type) => {
    setLoading(true);
    setMapType(type);
    
    // Short delay to show loading state
    setTimeout(() => {
      if (googleMapRef.current) {
        const config = mapConfigs[type];
        googleMapRef.current.setOptions({
          center: config.center,
          zoom: config.zoom,
          mapTypeId: config.mapTypeId,
          styles: config.styles
        });
        
        // Explicitly set center again
        googleMapRef.current.setCenter(config.center);
        
        // Clear existing markers and add new ones
        addMarkers();
      }
      
      setLoading(false);
    }, 800);
  };

  // Toggle report form - check if user is logged in
  const toggleReportForm = () => {
    if (!isLoggedIn()) {
      // Redirect to login page with current location
      navigate('/login', { state: { from: location } });
      return;
    }
    
    setShowReportForm(!showReportForm);
    
    // Clear temporary markers when closing form
    if (showReportForm) {
      userMarkersRef.current.forEach(marker => marker.setMap(null));
      userMarkersRef.current = [];
      setUserLocation(null);
    }
  };

  // Handle input change in the report form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportData({
      ...reportData,
      [name]: value
    });
  };

  // Handle report submission
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    
    if (!userLocation) {
      alert('Please select your location on the map first');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create disaster data for API
      const disasterData = {
        title: reportData.title,
        description: reportData.description,
        type: reportData.type,
        severity: reportData.severity,
        location: {
          type: 'Point',
          coordinates: [userLocation.lng, userLocation.lat],
          address: 'Selected location'
        },
        evacuationZone: {
          type: 'Polygon',
          coordinates: [[
            [userLocation.lng - 0.01, userLocation.lat - 0.01],
            [userLocation.lng + 0.01, userLocation.lat - 0.01],
            [userLocation.lng + 0.01, userLocation.lat + 0.01],
            [userLocation.lng - 0.01, userLocation.lat + 0.01],
            [userLocation.lng - 0.01, userLocation.lat - 0.01]
          ]]
        }
      };
      
      // Submit to API
      const response = await disastersAPI.createDisaster(disasterData);
      
      if (response.data.success) {
        // Clear form and close it
        setReportData({
          title: '',
          type: 'flood',
          description: '',
          severity: 'medium',
          contact: ''
        });
        setUserLocation(null);
        setShowReportForm(false);
        
        // Clear temporary markers
        userMarkersRef.current.forEach(marker => marker.setMap(null));
        userMarkersRef.current = [];
        
        // Refresh disasters from API
        await fetchDisasters();
        
        // Show success message
        alert('Your disaster report has been submitted successfully!');
      } else {
        alert(`Failed to submit report: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Submit report error:', error);
      alert('An error occurred while submitting your report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setUserLocation(userPos);
          
          // Center map on user location
          if (googleMapRef.current) {
            googleMapRef.current.setCenter(userPos);
            googleMapRef.current.setZoom(15);
            
            // Add temporary marker
            addTemporaryMarker(userPos);
          }
          
          setLoading(false);
        },
        (error) => {
          console.error('Error getting user location:', error);
          alert('Unable to get your current location. Please select your location on the map.');
          setLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser. Please select your location on the map.');
    }
  };

  return (
    <div className="maps-container">
      <div className="maps-header">
        <h1>Disaster Management Maps</h1>
        <p>Interactive maps showing disaster zones, evacuation routes, and relief centers</p>
      </div>

      <div className="map-controls">
        <button 
          className={`map-button ${mapType === 'disaster' ? 'active' : ''}`}
          onClick={() => handleMapTypeChange('disaster')}
        >
          <i className="fas fa-exclamation-triangle"></i> Disaster Zones
        </button>
        <button 
          className={`map-button ${mapType === 'evacuation' ? 'active' : ''}`}
          onClick={() => handleMapTypeChange('evacuation')}
        >
          <i className="fas fa-running"></i> Evacuation Routes
        </button>
        <button 
          className={`map-button ${mapType === 'relief' ? 'active' : ''}`}
          onClick={() => handleMapTypeChange('relief')}
        >
          <i className="fas fa-hands-helping"></i> Relief Centers
        </button>
        <button 
          className={`map-button report-button ${showReportForm ? 'active' : ''}`}
          onClick={toggleReportForm}
        >
          <i className="fas fa-exclamation-circle"></i> Report Disaster
        </button>
      </div>

      <div className="map-container">
        {loading ? (
          <div className="map-loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading map data...</p>
          </div>
        ) : null}
        
        {error && (
          <div className="map-error">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
          </div>
        )}
        
        <div 
          ref={mapRef} 
          className="google-map"
          style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
        ></div>
        
        <div className="map-overlay">
          {mapType === 'disaster' && (
            <>
              <h3>Disaster Zones</h3>
              <p>Current active disaster zones and affected areas</p>
              <div className="map-legend">
                <div className="legend-item">
                  <span className="legend-color high"></span>
                  <span>High Risk</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color medium"></span>
                  <span>Medium Risk</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color low"></span>
                  <span>Low Risk</span>
                </div>
              </div>
            </>
          )}
          
          {mapType === 'evacuation' && (
            <>
              <h3>Evacuation Routes</h3>
              <p>Safe evacuation routes and emergency exits</p>
              <div className="map-legend">
                <div className="legend-item">
                  <span className="legend-line primary"></span>
                  <span>Primary Route</span>
                </div>
                <div className="legend-item">
                  <span className="legend-line secondary"></span>
                  <span>Secondary Route</span>
                </div>
                <div className="legend-item">
                  <span className="legend-icon"></span>
                  <span>Emergency Exit</span>
                </div>
              </div>
            </>
          )}
          
          {mapType === 'relief' && (
            <>
              <h3>Relief Centers</h3>
              <p>Locations of relief centers, medical facilities, and supply distribution</p>
              <div className="map-legend">
                <div className="legend-item">
                  <span className="legend-icon medical"></span>
                  <span>Medical Center</span>
                </div>
                <div className="legend-item">
                  <span className="legend-icon food"></span>
                  <span>Food & Water</span>
                </div>
                <div className="legend-item">
                  <span className="legend-icon shelter"></span>
                  <span>Shelter</span>
                </div>
              </div>
            </>
          )}
        </div>
        
        {showReportForm && (
          <div className="report-form-container">
            <div className="report-form">
              <h3>Report a Disaster</h3>
              <p className="form-instruction">
                {userLocation 
                  ? "Location selected. Fill the form below to submit your report." 
                  : "Click on the map to select your location or use the button below."}
              </p>
              
              {!userLocation && (
                <button 
                  className="location-button"
                  onClick={getCurrentLocation}
                >
                  <i className="fas fa-map-marker-alt"></i> Use My Current Location
                </button>
              )}
              
              <form onSubmit={handleSubmitReport}>
                <div className="form-group">
                  <label htmlFor="title">Title:</label>
                  <input 
                    type="text" 
                    id="title" 
                    name="title" 
                    value={reportData.title}
                    onChange={handleInputChange}
                    placeholder="Enter a title for your report"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="type">Disaster Type:</label>
                  <select 
                    id="type" 
                    name="type" 
                    value={reportData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="flood">Flood</option>
                    <option value="fire">Fire</option>
                    <option value="earthquake">Earthquake</option>
                    <option value="hurricane">Hurricane/Cyclone</option>
                    <option value="tornado">Tornado</option>
                    <option value="tsunami">Tsunami</option>
                    <option value="landslide">Landslide</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="severity">Severity:</label>
                  <select 
                    id="severity" 
                    name="severity" 
                    value={reportData.severity}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Description:</label>
                  <textarea 
                    id="description" 
                    name="description" 
                    value={reportData.description}
                    onChange={handleInputChange}
                    placeholder="Briefly describe the situation..."
                    required
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label htmlFor="contact">Contact Number:</label>
                  <input 
                    type="text" 
                    id="contact" 
                    name="contact" 
                    value={reportData.contact}
                    onChange={handleInputChange}
                    placeholder="Enter your contact number"
                    required
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={toggleReportForm}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={!userLocation || loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Submitting...
                      </>
                    ) : 'Submit Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <div className="map-info">
        <div className="info-card">
          <i className="fas fa-info-circle"></i>
          <h3>Map Information</h3>
          <p>These maps are updated regularly to provide the most current information during disaster situations. For emergency assistance, please call the emergency hotline at <strong>1-800-DISASTER</strong>.</p>
        </div>
        <div className="info-card">
          <i className="fas fa-mobile-alt"></i>
          <h3>Mobile Access</h3>
          <p>Download our mobile app to access these maps offline and receive real-time alerts and notifications during emergencies.</p>
        </div>
      </div>
    </div>
  );
};

export default MapsPage; 