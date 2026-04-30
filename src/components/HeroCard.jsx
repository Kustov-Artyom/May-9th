import { useState } from 'react';
import './HeroCard.css';

function HeroCard({ hero }) {
  const [showDetails, setShowDetails] = useState(false);

  const handleCardClick = () => {
    // Проверяем, что это мобильное устройство (ширина экрана <= 768px)
    if (window.innerWidth <= 768) {
      setShowDetails(!showDetails);
    }
  };

  return (
    <div 
      className={`hero-card ${showDetails ? 'show-details' : ''}`} 
      onClick={handleCardClick}
    >
      <div className="hero-image-container">
        <img src={`/images/${hero.image}`} alt={hero.fullName} className="hero-image" />
        <div className="hero-overlay">
          <div className="hero-content">
            <h3 className="hero-name">{hero.fullName}</h3>
            <p className="hero-rank">{hero.rank}</p>
            <p className="hero-birth">Год рождения: {hero.birthYear}</p>
            <p className="hero-unit">{hero.unit}</p>
            
            {hero.awards && hero.awards.length > 0 && (
              <div className="hero-awards">
                <h4>Награды:</h4>
                <ul>
                  {hero.awards.map((award, index) => (
                    <li key={index}>{award}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="hero-history">
              {hero.history}
            </div>
            
            {hero.source && (
              <div className="hero-source">
                {hero.source}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="hero-caption">
        <p>{hero.fullName}</p>
      </div>
    </div>
  );
}

export default HeroCard;