import { useState } from 'react';
import './BattleCard.css';

function BattleCard({ battle }) {
  const [showDetails, setShowDetails] = useState(false);

  const handleCardClick = () => {
    // Проверяем, что это мобильное устройство (ширина экрана <= 768px)
    if (window.innerWidth <= 768) {
      setShowDetails(!showDetails);
    }
  };

  return (
    <div 
      className={`battle-card ${showDetails ? 'show-details' : ''}`} 
      onClick={handleCardClick}
    >
      <div className="battle-image-container">
        {battle.image ? (
          <img src={`/images/${battle.image}`} alt={battle.title} className="battle-image" />
        ) : (
          <div className="battle-image-placeholder">Нет фото</div>
        )}
        <div className="battle-overlay">
          <div className="battle-content">
            <h3 className="battle-title-overlay">{battle.title}</h3>
            <p className="battle-year-overlay">{battle.year}</p>
            <div className="battle-description-overlay">
              {battle.description}
            </div>
          </div>
        </div>
      </div>
      <div className="battle-caption">
        <p>{battle.title}</p>
      </div>
    </div>
  );
}

export default BattleCard;