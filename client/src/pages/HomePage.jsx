import { Link } from 'react-router-dom';
import '../styles/HomePage.css';
// Import disaster images
import floodImg from '../assets/images/Flood.webp';
import earthquakeImg from '../assets/images/Earthquake.webp';
import hurricaneImg from '../assets/images/Hurricane.webp';
import wildfireImg from '../assets/images/Wildfire.webp';

const HomePage = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Disaster Management & Response</h1>
          <p>Preparing communities for disasters, providing relief during crises, and supporting recovery efforts.</p>
          <div className="hero-buttons">
            <Link to="/preparedness" className="btn btn-primary">
              Be Prepared
            </Link>
            <Link to="/signup" className="btn btn-secondary">
              Join Our Community
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>How We Help</h2>
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-book"></i>
            </div>
            <h3>Education & Awareness</h3>
            <p>Learn about different types of disasters and how to prepare for them.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-hands-helping"></i>
            </div>
            <h3>Emergency Response</h3>
            <p>Coordinated efforts to provide immediate assistance during disasters.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-heartbeat"></i>
            </div>
            <h3>Recovery Support</h3>
            <p>Resources and guidance to help communities rebuild after disasters.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-map-marked-alt"></i>
            </div>
            <h3>Evacuation Planning</h3>
            <p>Detailed evacuation routes and safe zones for different disaster scenarios.</p>
          </div>
        </div>
      </div>

      {/* Disaster Types Section */}
      <div className="disaster-types-section">
        <h2>Common Disasters</h2>
        <div className="disaster-types-container">
          <div className="disaster-type">
            <img src={floodImg} alt="Flood" />
            <h3>Floods</h3>
          </div>
          <div className="disaster-type">
            <img src={earthquakeImg} alt="Earthquake" />
            <h3>Earthquakes</h3>
          </div>
          <div className="disaster-type">
            <img src={hurricaneImg} alt="Hurricane" />
            <h3>Hurricanes</h3>
          </div>
          <div className="disaster-type">
            <img src={wildfireImg} alt="Wildfire" />
            <h3>Wildfires</h3>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>Be Prepared, Stay Safe</h2>
          <p>Join our community of prepared citizens and learn how to protect yourself and your loved ones.</p>
          <div className="cta-buttons">
            <Link to="/contact" className="btn btn-primary">
              Get Involved
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Member Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 