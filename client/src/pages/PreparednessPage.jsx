import React from 'react';
import '../styles/PreparednessPage.css';

const PreparednessPage = () => {
  const disasterPreparedness = [
    {
      id: 1,
      name: "Earthquake",
      tips: [
        "Identify safe spots under sturdy furniture and away from windows.",
        "Secure heavy furniture and appliances to prevent tipping.",
        "Have an emergency kit with water, food, flashlight, and first-aid supplies.",
        "Practice \"Drop, Cover, and Hold On\" drills regularly."
      ],
      icon: "fa-house-damage"
    },
    {
      id: 2,
      name: "Flood",
      tips: [
        "Know your area's flood risk and evacuation routes.",
        "Store important documents in waterproof containers.",
        "Keep emergency supplies and move valuables to higher ground.",
        "Avoid walking or driving through floodwaters."
      ],
      icon: "fa-water"
    },
    {
      id: 3,
      name: "Hurricane",
      tips: [
        "Install storm shutters and reinforce doors/windows.",
        "Prepare a disaster supply kit with food, water, and medications.",
        "Know your evacuation plan and shelter locations.",
        "Stay indoors and away from windows during the storm."
      ],
      icon: "fa-wind"
    },
    {
      id: 4,
      name: "Tornado",
      tips: [
        "Identify a safe shelter (like a basement or interior room).",
        "Secure outdoor furniture and remove loose debris.",
        "Stay updated on weather alerts and warnings.",
        "Practice tornado drills with your family."
      ],
      icon: "fa-tornado"
    },
    {
      id: 5,
      name: "Wildfire",
      tips: [
        "Create a defensible space by clearing dry vegetation around your home.",
        "Prepare an emergency kit with essential supplies.",
        "Plan multiple evacuation routes.",
        "Keep important documents and valuables ready to grab quickly."
      ],
      icon: "fa-fire"
    },
    {
      id: 6,
      name: "Landslide",
      tips: [
        "Identify landslide-prone areas near you.",
        "Avoid construction or living in high-risk zones.",
        "Listen to weather alerts, especially during heavy rain.",
        "Have an emergency plan and evacuation route ready."
      ],
      icon: "fa-mountain"
    },
    {
      id: 7,
      name: "Tsunami",
      tips: [
        "If near a coast, know evacuation routes and high ground locations.",
        "Move inland or to higher ground immediately after strong shaking.",
        "Stay updated on tsunami warnings via radio or alerts.",
        "Do not return to low-lying areas until officials declare it safe."
      ],
      icon: "fa-water"
    },
    {
      id: 8,
      name: "Blizzard & Extreme Cold",
      tips: [
        "Keep extra food, water, and blankets in case of power outages.",
        "Insulate your home and dress in layers.",
        "Avoid unnecessary travel during severe storms.",
        "Have alternative heating sources, but use them safely to prevent carbon monoxide poisoning."
      ],
      icon: "fa-snowflake"
    },
    {
      id: 9,
      name: "Drought",
      tips: [
        "Conserve water by fixing leaks and using efficient appliances.",
        "Store extra water for emergencies.",
        "Plant drought-resistant vegetation.",
        "Follow local water restrictions and guidelines."
      ],
      icon: "fa-tint-slash"
    },
    {
      id: 10,
      name: "Pandemic",
      tips: [
        "Maintain hygiene by washing hands regularly.",
        "Stay updated on health advisories and vaccinations.",
        "Stock up on essential medicines, food, and hygiene products.",
        "Practice social distancing and wear masks if required."
      ],
      icon: "fa-virus"
    }
  ];

  return (
    <div className="preparedness-container">
      <div className="preparedness-header">
        <h1>Disaster Preparedness</h1>
        <p>Learn how to prepare yourself, your family, and your community for various types of disasters.</p>
      </div>
      
      <div className="disaster-cards-container">
        {disasterPreparedness.map((disaster) => (
          <div key={disaster.id} className="disaster-card">
            <div className="disaster-card-header">
              <i className={`fas ${disaster.icon}`}></i>
              <h2>{disaster.name}</h2>
            </div>
            <div className="disaster-card-body">
              <ul>
                {disaster.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreparednessPage; 