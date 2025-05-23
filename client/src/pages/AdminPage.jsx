import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminPage.css';

const AdminPage = () => {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('table');
  const [stats, setStats] = useState(null);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (!isAdmin()) {
      navigate('/');
      return;
    }
    
    fetchDisasters();
    fetchStats();
  }, [currentUser, isAdmin, navigate]);
  
  useEffect(() => {
    if (view === 'map') {
      console.log('Map view selected, initializing map...');
      setTimeout(() => {
        initMap();
      }, 300);
    }
  }, [view]);
  
  // Helper to get the authorization token from storage
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };
  
  // Add a helper function to format location data
  const formatLocation = (location) => {
    // If location is a string, return it
    if (typeof location === 'string') {
      return location;
    }
    
    // If location is an object with address property, use that
    if (location && typeof location === 'object') {
      // Return address if available
      if (location.address) {
        return location.address;
      }
      
      // Otherwise try to extract coordinates
      if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
        // Format as Lat, Long with 4 decimal places
        return `${location.coordinates[1].toFixed(4)}, ${location.coordinates[0].toFixed(4)}`;
      }
      
      // If it has type (likely GeoJSON)
      if (location.type === 'Point' && location.coordinates) {
        return `${location.coordinates[1].toFixed(4)}, ${location.coordinates[0].toFixed(4)}`;
      }
    }
    
    // Fallback for other cases
    return 'Unknown location';
  };
  
  // Helper function to format user data
  const formatUser = (user) => {
    if (!user) return 'Anonymous';
    
    if (typeof user === 'object') {
      return user.fullName || user.email || user.username || 'Anonymous';
    }
    
    return user;
  };
  
  const fetchDisasters = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/disasters', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to fetch disasters: ${response.status} ${response.statusText}`);
      }
      
      // Check content type to ensure it's JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format from server');
      }
      
      const responseData = await response.json();
      
      // Handle different response formats
      let disastersData = [];
      
      if (Array.isArray(responseData)) {
        disastersData = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        disastersData = responseData.data;
      } else if (responseData.success && responseData.disasters && Array.isArray(responseData.disasters)) {
        disastersData = responseData.disasters;
      } else {
        console.error('Unexpected API response format:', responseData);
        disastersData = [];
      }
      
      // Process each disaster to ensure valid data
      const processedDisasters = disastersData.map(disaster => ({
        ...disaster,
        // Ensure the disaster has a title
        title: disaster.title || 'Unnamed Disaster',
        // Ensure the disaster has a status
        status: disaster.status || 'Reported',
        // Ensure the disaster has a type
        disasterType: disaster.disasterType || 'Unknown',
        // Ensure the disaster has a severity
        severity: disaster.severity || 'Medium',
        // Ensure the disaster has a valid date
        createdAt: disaster.createdAt || new Date().toISOString()
      }));
      
      setDisasters(processedDisasters);
      setError(null);
    } catch (err) {
      console.error('Error fetching disasters:', err);
      setError(err.message);
      setDisasters([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/disasters/stats', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to fetch disaster statistics: ${response.status} ${response.statusText}`);
      }
      
      // Check content type to ensure it's JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format from server');
      }
      
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Set default stats so the UI doesn't break
      setStats({
        total: disasters?.length || 0,
        verified: 0,
        resolved: 0,
        mostCommonType: 'None'
      });
      setError(`Error loading statistics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const initMap = () => {
    console.log('Initializing map...');
    console.log('Map element exists:', !!mapRef.current);

    if (!window.google || !window.google.maps) {
      console.log('Google Maps API not loaded, loading script...');
      // Load Google Maps API if not already loaded
      const script = document.createElement('script');
      
      // Get API key from environment variable
      const apiKey = 'AIzaSyCdkxLosaiJW5u-eFcLGKIQ_am6d5Wbrw0';
      
      console.log('Using Google Maps API Key:', apiKey ? 'Key is available' : 'No key available');
      
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('Google Maps API loaded successfully');
        // Clear any existing map instance
        if (mapInstanceRef.current) {
          console.log('Clearing existing map instance');
          mapInstanceRef.current = null;
        }
        createMap();
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Google Maps API:', error);
        setError('Failed to load Google Maps. Please check your internet connection and make sure the API key is valid.');
      };
      
      document.head.appendChild(script);
    } else {
      console.log('Google Maps API already loaded');
      createMap();
    }
  };
  
  const createMap = () => {
    if (!mapRef.current) {
      console.error('Map container element not found');
      return;
    }

    try {
      console.log('Creating map instance');
      // Default center (adjust as needed)
      const center = { lat: 20, lng: 0 };
      
      // Create a new map instance
      const mapOptions = {
        center: center,
        zoom: 2,
        mapTypeId: 'terrain',
        fullscreenControl: true,
        streetViewControl: false
      };
      
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
      console.log('Map created successfully');
      
      // Add markers once map is ready
      mapInstanceRef.current.addListener('idle', () => {
        console.log('Map is idle, adding markers');
        addMarkersToMap();
      });
    } catch (error) {
      console.error('Error creating Google Map:', error);
      setError(`Failed to initialize map: ${error.message}`);
    }
  };
  
  const addMarkersToMap = () => {
    console.log('Adding markers to map, disasters count:', disasters?.length);
    // Safety check for map instance
    if (!mapInstanceRef.current || !window.google) {
      console.error('Map not initialized yet');
      return;
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Validate disasters data
    if (!Array.isArray(disasters) || disasters.length === 0) {
      console.log('No disaster data to display on map');
      return;
    }

    // Create bounds to fit all markers
    const bounds = new window.google.maps.LatLngBounds();
    let markersAdded = 0;
    
    disasters.forEach(disaster => {
      // Check for coordinates in various possible formats
      let lat = null;
      let lng = null;
      
      // Try direct latitude/longitude properties first
      if (disaster.latitude !== undefined && disaster.longitude !== undefined) {
        lat = parseFloat(disaster.latitude);
        lng = parseFloat(disaster.longitude);
      }
      // Next check for MongoDB GeoJSON format
      else if (disaster.location?.coordinates && Array.isArray(disaster.location.coordinates)) {
        // GeoJSON format is [longitude, latitude]
        lng = parseFloat(disaster.location.coordinates[0]);
        lat = parseFloat(disaster.location.coordinates[1]);
      }
      // If location is a string with lat,lng format
      else if (typeof disaster.location === 'string' && disaster.location.includes(',')) {
        const [latStr, lngStr] = disaster.location.split(',');
        lat = parseFloat(latStr.trim());
        lng = parseFloat(lngStr.trim());
      }
      
      if (isNaN(lat) || isNaN(lng)) {
        console.warn('Invalid coordinates for disaster:', disaster._id || 'unknown ID');
        return; // Skip this disaster
      }
      
      try {
        const position = { lat, lng };
        const icon = getDisasterIcon(disaster.disasterType || 'unknown', disaster.status);
        
        const marker = new window.google.maps.Marker({
          position: position,
          map: mapInstanceRef.current,
          title: disaster.title || 'Unnamed disaster',
          icon: icon,
          animation: window.google.maps.Animation.DROP
        });
        
        // Add info window
        const infoContent = `
          <div class="map-info-window">
            <h3>${disaster.title || 'Unnamed disaster'}</h3>
            <p><strong>Type:</strong> ${disaster.disasterType || 'Unknown'}</p>
            <p><strong>Status:</strong> ${disaster.status || 'Reported'}</p>
            <p><strong>Reported by:</strong> ${disaster.reportedBy || 'Anonymous'}</p>
            <p><strong>Date:</strong> ${new Date(disaster.createdAt).toLocaleString()}</p>
          </div>
        `;
        
        const infoWindow = new window.google.maps.InfoWindow({
          content: infoContent
        });
        
        marker.addListener('click', () => {
          // Close any open info windows
          markersRef.current.forEach(m => {
            if (m.infoWindow && m.infoWindow.getMap()) {
              m.infoWindow.close();
            }
          });
          
          // Open this info window
          infoWindow.open(mapInstanceRef.current, marker);
          
          // Store reference to open info window
          marker.infoWindow = infoWindow;
        });
        
        // Add delete button to info window
        window.google.maps.event.addListener(infoWindow, 'domready', () => {
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete Report';
          deleteButton.className = 'map-info-button delete';
          deleteButton.onclick = () => {
            if (confirm('Are you sure you want to delete this disaster report?')) {
              deleteDisaster(disaster._id);
              infoWindow.close();
            }
          };
          
          const viewButton = document.createElement('button');
          viewButton.textContent = 'View Details';
          viewButton.className = 'map-info-button';
          viewButton.onclick = () => {
            viewDisasterDetails(disaster);
            infoWindow.close();
          };
          
          // Add buttons to info window
          const infoWindowContent = document.querySelector('.map-info-window');
          if (infoWindowContent) {
            infoWindowContent.appendChild(viewButton);
            infoWindowContent.appendChild(deleteButton);
          }
        });
        
        // Store marker reference
        marker.disasterId = disaster._id;
        markersRef.current.push(marker);
        
        // Extend bounds to include this marker
        bounds.extend(position);
        markersAdded++;
      } catch (err) {
        console.error('Error adding marker:', err);
      }
    });
    
    // Fit map to bounds if we have markers
    if (markersAdded > 0) {
      console.log('Fitting map to bounds with', markersAdded, 'markers');
      mapInstanceRef.current.fitBounds(bounds);
      
      // Don't zoom in too far
      const listener = window.google.maps.event.addListener(mapInstanceRef.current, 'idle', () => {
        if (mapInstanceRef.current.getZoom() > 16) {
          mapInstanceRef.current.setZoom(16);
        }
        window.google.maps.event.removeListener(listener);
      });
    } else {
      console.log('No valid markers to display');
    }
  };
  
  const getDisasterIcon = (type, status) => {
    let iconUrl = '/icons/';
    
    switch (type) {
      case 'Flood':
        iconUrl += 'flood.png';
        break;
      case 'Earthquake':
        iconUrl += 'earthquake.png';
        break;
      case 'Wildfire':
        iconUrl += 'fire.png';
        break;
      case 'Hurricane':
        iconUrl += 'hurricane.png';
        break;
      case 'Tornado':
        iconUrl += 'tornado.png';
        break;
      default:
        iconUrl += 'other.png';
    }
    
    return iconUrl;
  };
  
  const handleStatusChange = async (disasterId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/disasters/${disasterId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to update disaster status: ${response.status} ${response.statusText}`);
      }
      
      setDisasters(disasters.map(d => 
        d._id === disasterId ? { ...d, status: newStatus } : d
      ));
      
      if (selectedDisaster && selectedDisaster._id === disasterId) {
        setSelectedDisaster({ ...selectedDisaster, status: newStatus });
      }
      
      if (view === 'map') {
        addMarkersToMap();
      }
      
      fetchStats();
    } catch (err) {
      setError(err.message);
    }
  };
  
  const deleteDisaster = async (disasterId) => {
    if (!window.confirm('Are you sure you want to delete this disaster report?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/disasters/${disasterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to delete disaster: ${response.status} ${response.statusText}`);
      }
      
      setDisasters(disasters.filter(d => d._id !== disasterId));
      
      if (showModal && selectedDisaster && selectedDisaster._id === disasterId) {
        setShowModal(false);
      }
      
      if (view === 'map') {
        addMarkersToMap();
      }
      
      fetchStats();
    } catch (err) {
      setError(err.message);
    }
  };
  
  const viewDisasterDetails = (disaster) => {
    setSelectedDisaster(disaster);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  const renderStatusBadge = (status) => {
    return (
      <span className={`disaster-status status-${status.toLowerCase()}`}>
        {status}
      </span>
    );
  };
  
  const renderStats = () => {
    // Always render the stats container, even if stats is null
    return (
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Reports</h3>
          <div className="stat-value">{stats?.total || 0}</div>
          <div className="stat-label">All disaster reports</div>
        </div>
        
        <div className="stat-card">
          <h3>Verified Reports</h3>
          <div className="stat-value">{stats?.verified || 0}</div>
          <div className="stat-label">Confirmed disasters</div>
        </div>
        
        <div className="stat-card">
          <h3>Resolved Reports</h3>
          <div className="stat-value">{stats?.resolved || 0}</div>
          <div className="stat-label">Completed disaster response</div>
        </div>
        
        <div className="stat-card">
          <h3>Most Common Type</h3>
          <div className="stat-value">{stats?.mostCommonType || 'None'}</div>
          <div className="stat-label">Highest frequency disaster</div>
        </div>
      </div>
    );
  };
  
  const renderDisastersTable = () => {
    return (
      <table className="disasters-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Title</th>
            <th>Location</th>
            <th>Reported By</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {disasters.map(disaster => (
            <tr key={disaster._id}>
              <td>{disaster.disasterType}</td>
              <td>{disaster.title}</td>
              <td>{formatLocation(disaster.location)}</td>
              <td>{formatUser(disaster.reportedBy)}</td>
              <td>{formatDate(disaster.createdAt)}</td>
              <td>{renderStatusBadge(disaster.status)}</td>
              <td>
                <div className="action-buttons">
                  <button 
                    className="view-button" 
                    onClick={() => viewDisasterDetails(disaster)}
                    title="View Details"
                  >
                    📋
                  </button>
                  <button 
                    className="delete-button" 
                    onClick={() => deleteDisaster(disaster._id)}
                    title="Delete Report"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
  const renderDisasterModal = () => {
    if (!selectedDisaster) return null;
    
    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="close-button" onClick={closeModal}>×</button>
          
          <div className="disaster-details">
            <h3>{selectedDisaster.title}</h3>
            
            <div className="detail-item">
              <span className="detail-label">Status</span>
              {renderStatusBadge(selectedDisaster.status)}
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Type</span>
              {selectedDisaster.disasterType}
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Severity</span>
              {selectedDisaster.severity}
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Location</span>
              {formatLocation(selectedDisaster.location)}
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Description</span>
              {selectedDisaster.description}
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Reported By</span>
              {formatUser(selectedDisaster.reportedBy)}
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Contact</span>
              {selectedDisaster.contactInfo || 'None provided'}
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Reported On</span>
              {formatDate(selectedDisaster.createdAt)}
            </div>
            
            <div className="status-change">
              <h4>Update Status</h4>
              <div className="status-buttons">
                <button 
                  className={`status-button ${selectedDisaster.status === 'Reported' ? 'active' : ''}`}
                  onClick={() => handleStatusChange(selectedDisaster._id, 'Reported')}
                >
                  Reported
                </button>
                <button 
                  className={`status-button ${selectedDisaster.status === 'Verified' ? 'active' : ''}`}
                  onClick={() => handleStatusChange(selectedDisaster._id, 'Verified')}
                >
                  Verified
                </button>
                <button 
                  className={`status-button ${selectedDisaster.status === 'Resolved' ? 'active' : ''}`}
                  onClick={() => handleStatusChange(selectedDisaster._id, 'Resolved')}
                >
                  Resolved
                </button>
                <button 
                  className={`status-button ${selectedDisaster.status === 'False' ? 'active' : ''}`}
                  onClick={() => handleStatusChange(selectedDisaster._id, 'False')}
                >
                  False Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const handleRetry = () => {
    setError(null);
    fetchDisasters();
    fetchStats();
  };
  
  const renderMapView = () => {
    return (
      <div className="map-container" ref={mapRef} style={{ height: '600px', width: '100%' }}>
        {!window.google && <div className="map-loading-overlay">Loading map...</div>}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="admin-page">
        <header className="admin-header">
          <h1>Disaster Management Administration</h1>
          <div>
            <p>Review and manage disaster reports across the system.</p>
            <p className="admin-contact">Contact: <a href="mailto:admin@disasterguard.org">admin@disasterguard.org</a></p>
          </div>
        </header>
        <div className="loading">Loading disaster reports...</div>
      </div>
    );
  }
  
  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Disaster Management Administration</h1>
        <div>
          <p>Review and manage disaster reports across the system.</p>
          <p className="admin-contact">Contact: <a href="mailto:admin@disasterguard.org">admin@disasterguard.org</a></p>
        </div>
      </header>
      
      {error && (
        <div className="error">
          <p>
            <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
            {error}
          </p>
          <button onClick={handleRetry} className="retry-button">
            <i className="fas fa-sync-alt"></i> Retry
          </button>
        </div>
      )}
      
      {renderStats()}
      
      <div className="admin-actions">
        <div className="view-toggle">
          <button 
            className={view === 'table' ? 'active' : ''} 
            onClick={() => setView('table')}
          >
            Table View
          </button>
          <button 
            className={view === 'map' ? 'active' : ''} 
            onClick={() => setView('map')}
          >
            Map View
          </button>
        </div>
      </div>
      
      {view === 'table' ? (
        disasters && disasters.length > 0 ? (
          renderDisastersTable()
        ) : (
          <div className="no-data-message">
            <p>No disaster reports available.</p>
          </div>
        )
      ) : (
        renderMapView()
      )}
      
      {showModal && renderDisasterModal()}
    </div>
  );
};

export default AdminPage; 