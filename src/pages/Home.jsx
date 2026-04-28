import { useState, useEffect, useMemo } from 'react';
import api from '../services/api'; // Импорт нашего сервиса API
import SearchBar from '../components/SearchBar';
import Gallery from '../components/Gallery';
import './Home.css'; // Создадим этот файл ниже для стилей

function Home() {
  const [heroes, setHeroes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // При загрузке страницы запрашиваем героев с сервера
  useEffect(() => {
    loadHeroes();
  }, []);

  const loadHeroes = async () => {
    try {
      const data = await api.getHeroes();
      setHeroes(data);
    } catch (error) {
      console.error("Ошибка загрузки героев:", error);
    } finally {
      setLoading(false);
    }
  };

  // Логика поиска
  const filteredHeroes = useMemo(() => {
    if (!searchTerm.trim()) {
      return heroes;
    }
    return heroes.filter(hero => 
      hero.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [heroes, searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  if (loading) return <div className="loading">Загрузка героев...</div>;

  return (
    <div className="page">
      <SearchBar onSearch={handleSearch} />
      <Gallery heroes={filteredHeroes} />
      {filteredHeroes.length === 0 && searchTerm && (
        <div className="no-results">Герой с таким именем не найден</div>
      )}
    </div>
  );
}

export default Home;