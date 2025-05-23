import React from 'react';
import '../styles/ContactPage.css';

const ContactPage = () => {
  const emergencyContacts = [
    {
      id: 1,
      service: "Police Helpline",
      number: "100",
      description: "For emergencies requiring law enforcement",
      icon: "fa-shield-alt"
    },
    {
      id: 2,
      service: "Ambulance",
      number: "102, 108",
      description: "For medical emergencies",
      icon: "fa-ambulance"
    },
    {
      id: 3,
      service: "Women Helpline",
      number: "1091",
      description: "For women's safety and assistance",
      icon: "fa-female"
    },
    {
      id: 4,
      service: "Child Helpline",
      number: "1098",
      description: "For child protection and welfare",
      icon: "fa-child"
    },
    {
      id: 5,
      service: "Citizens Call Centre",
      number: "155300",
      description: "For general citizen assistance",
      icon: "fa-phone-alt"
    },
    {
      id: 6,
      service: "Crime Stopper",
      number: "1090",
      description: "To report criminal activities anonymously",
      icon: "fa-user-secret"
    },
    {
      id: 7,
      service: "Rescue and Relief",
      number: "1070",
      description: "For disaster rescue and relief operations",
      icon: "fa-hands-helping"
    },
    {
      id: 8,
      service: "Railway Helpline",
      number: "23004000",
      description: "For railway-related emergencies and information",
      icon: "fa-train"
    },
    {
      id: 9,
      service: "NIC Service Desk",
      number: "1800-111-555",
      description: "For National Informatics Centre services",
      icon: "fa-laptop"
    }
  ];

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>Get in touch with our disaster management team or find emergency contacts.</p>
      </div>
      
      <div className="contact-content">
        <div className="contact-form-section">
          <h2>Send Us a Message</h2>
          <form className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" placeholder="Your name" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" placeholder="Your email" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input type="text" id="subject" name="subject" placeholder="Subject" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows="5" placeholder="Your message" required></textarea>
            </div>
            
            <button type="submit" className="submit-btn">Send Message</button>
          </form>
        </div>
        
        <div className="emergency-contacts-section">
          <h2>Emergency Contacts</h2>
          <div className="emergency-contacts-container">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="emergency-contact-card">
                <div className="contact-content-centered">
                  <div className="contact-icon">
                    <i className={`fas ${contact.icon}`}></i>
                  </div>
                  <div className="contact-details">
                    <h3>{contact.service}</h3>
                    <p className="contact-number">{contact.number}</p>
                    <p className="contact-description">{contact.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 