import { useState, useEffect } from 'react';
import api from '../services/api';
import SearchBar from '../components/SearchBar';
import './Battles.css';

function Battles() {
  const [battles, setBattles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBattles();
  }, []);

  const loadBattles = async () => {
    try {
      const data = await api.getBattles();
      setBattles(data);
    } catch (error) {
      console.error("Ошибка загрузки сюжетов:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBattles = battles.filter(battle => 
    battle.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  if (loading) return <div className="loading">Загрузка сюжетов...</div>;

  return (
    <div className="page">
      <SearchBar onSearch={handleSearch} />
      <div className="battles-gallery">
        {filteredBattles.map((battle) => (
          <div key={battle.id} className="battle-card">
            <div className="battle-image-container">
              {/* Проверяем, есть ли картинка, если нет - ставим заглушку */}
              {battle.image ? (
                <img src={`/images/${battle.image}`} alt={battle.title} className="battle-image" />
              ) : (
                <div className="battle-image-placeholder">Нет фото</div>
              )}
            </div>
            <div className="battle-content">
              <h3 className="battle-title">{battle.title}</h3>
              <p className="battle-year">{battle.year}</p>
              <p className="battle-description">{battle.description}</p>
            </div>
          </div>
        ))}
      </div>
      {filteredBattles.length === 0 && (
        <div className="no-results">Сюжетов пока нет</div>
      )}
    </div>
  );
}

export default Battles;