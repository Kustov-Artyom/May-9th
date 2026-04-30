import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import SearchBar from '../components/SearchBar';
import BattleCard from '../components/BattleCard';
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

  // Логика поиска
  const filteredBattles = useMemo(() => {
    if (!searchTerm.trim()) {
      return battles;
    }
    return battles.filter(battle => 
      battle.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [battles, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  if (loading) return <div className="loading">Загрузка сюжетов...</div>;

  return (
    <div className="page">
      <SearchBar onSearch={handleSearch} />
      <div className="battles-gallery">
        {filteredBattles.map((battle) => (
          <BattleCard key={battle.id} battle={battle} />
        ))}
      </div>
      {filteredBattles.length === 0 && searchTerm && (
        <div className="no-results">Сюжетов не найдено</div>
      )}
      {battles.length === 0 && !searchTerm && (
        <div className="no-results">Сюжетов пока нет</div>
      )}
    </div>
  );
}

export default Battles;