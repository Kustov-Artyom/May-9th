import { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
  // ================= STATE: HEROES =================
  const [heroes, setHeroes] = useState([]);
  const [isHeroFormOpen, setIsHeroFormOpen] = useState(false);
  const [editingHeroId, setEditingHeroId] = useState(null); // ID героя, которого редактируем
  const [newHero, setNewHero] = useState({
    fullName: '', birthYear: '', rank: '', unit: '', awards: '', history: '', source: ''
  });
  const [heroImageFile, setHeroImageFile] = useState(null);

  // ================= STATE: BATTLES =================
  const [battlesList, setBattlesList] = useState([]);
  const [isBattleFormOpen, setIsBattleFormOpen] = useState(false);
  const [editingBattleId, setEditingBattleId] = useState(null);
  const [newBattle, setNewBattle] = useState({
    title: '', year: '', description: ''
  });
  const [battleImageFile, setBattleImageFile] = useState(null);

  const [loading, setLoading] = useState(true);

  // Загрузка данных при входе
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const heroesData = await api.getHeroes();
      setHeroes(heroesData);
      
      const battlesData = await api.getBattles();
      setBattlesList(battlesData);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.reload();
  };

  // ================= LOGIC: HEROES =================
  
  const handleHeroInputChange = (e) => {
    setNewHero({ ...newHero, [e.target.name]: e.target.value });
  };

  const handleHeroImageChange = (e) => {
    setHeroImageFile(e.target.files[0]);
  };

  // Функция начала редактирования
  const startEditHero = (hero) => {
    setEditingHeroId(hero.id);
    setIsHeroFormOpen(true);
    // Заполняем форму данными героя
    setNewHero({
      fullName: hero.fullName,
      birthYear: hero.birthYear,
      rank: hero.rank,
      unit: hero.unit,
      awards: Array.isArray(hero.awards) ? hero.awards.join(', ') : hero.awards,
      history: hero.history,
      source: hero.source
    });
    setHeroImageFile(null); // Сбрасываем файл, чтобы не перезаписывать, если не выбрали новый
    window.scrollTo(0, 0); // Прокрутка к форме
  };

  const handleHeroSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    const formData = new FormData();
    formData.append('fullName', newHero.fullName);
    formData.append('birthYear', newHero.birthYear);
    formData.append('rank', newHero.rank);
    formData.append('unit', newHero.unit);
    formData.append('awards', JSON.stringify(newHero.awards.split(',').map(s => s.trim()))); 
    formData.append('history', newHero.history);
    formData.append('source', newHero.source);
    if (heroImageFile) {
      formData.append('image', heroImageFile);
    }

    try {
      if (editingHeroId) {
        // Если есть ID — обновляем
        await api.updateHero(editingHeroId, formData, token);
      } else {
        // Если нет ID — создаем
        await api.createHero(formData, token);
      }
      
      // Сброс формы
      setIsHeroFormOpen(false);
      setEditingHeroId(null);
      setNewHero({ fullName: '', birthYear: '', rank: '', unit: '', awards: '', history: '', source: '' });
      setHeroImageFile(null);
      loadData(); 
    } catch (err) {
      alert('Ошибка при сохранении');
      console.error(err);
    }
  };

  const handleDeleteHero = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого героя?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      await api.deleteHero(id, token);
      loadData();
    } catch (err) {
      alert('Ошибка при удалении');
    }
  };

  // ================= LOGIC: BATTLES =================
  
  const handleBattleInputChange = (e) => {
    setNewBattle({ ...newBattle, [e.target.name]: e.target.value });
  };

  const handleBattleImageChange = (e) => {
    setBattleImageFile(e.target.files[0]);
  };

  const startEditBattle = (battle) => {
    setEditingBattleId(battle.id);
    setIsBattleFormOpen(true);
    setNewBattle({
      title: battle.title,
      year: battle.year,
      description: battle.description
    });
    setBattleImageFile(null);
    window.scrollTo(0, document.body.scrollHeight);
  };

  const handleBattleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    const formData = new FormData();
    formData.append('title', newBattle.title);
    formData.append('year', newBattle.year);
    formData.append('description', newBattle.description);
    if (battleImageFile) {
      formData.append('image', battleImageFile);
    }

    try {
      if (editingBattleId) {
        await api.updateBattle(editingBattleId, formData, token); // Убедись, что метод есть в api.js!
      } else {
        await api.createBattle(formData, token);
      }
      
      setIsBattleFormOpen(false);
      setEditingBattleId(null);
      setNewBattle({ title: '', year: '', description: '' });
      setBattleImageFile(null);
      loadData();
    } catch (err) {
      alert('Ошибка при сохранении сюжета');
      console.error(err);
    }
  };

  const handleDeleteBattle = async (id) => {
    if (!window.confirm('Удалить этот сюжет?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      await api.deleteBattle(id, token);
      loadData();
    } catch (err) {
      alert('Ошибка удаления');
    }
  };

  if (loading) return <div className="admin-loading">Загрузка данных...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Панель управления</h1>
        <button className="logout-btn" onClick={handleLogout}>Выйти</button>
      </div>

      {/* ================= СЕКЦИЯ ГЕРОЕВ ================= */}
      <div className="section-block">
        <h2 className="section-title">Управление Героями</h2>
        
        <button className="add-btn" onClick={() => {
          setIsHeroFormOpen(!isHeroFormOpen);
          setEditingHeroId(null); // Сброс режима редактирования при открытии/закрытии
          if (!isHeroFormOpen) {
             setNewHero({ fullName: '', birthYear: '', rank: '', unit: '', awards: '', history: '', source: '' });
             setHeroImageFile(null);
          }
        }}>
          {isHeroFormOpen && !editingHeroId ? 'Закрыть форму' : '+ Добавить героя'}
        </button>

        {isHeroFormOpen && (
          <form className="add-hero-form" onSubmit={handleHeroSubmit}>
            <h3>{editingHeroId ? 'Редактирование героя' : 'Новый герой'}</h3>
            <input name="fullName" placeholder="ФИО" value={newHero.fullName} onChange={handleHeroInputChange} required />
            <input name="birthYear" placeholder="Год рождения" value={newHero.birthYear} onChange={handleHeroInputChange} />
            <input name="rank" placeholder="Звание" value={newHero.rank} onChange={handleHeroInputChange} />
            <input name="unit" placeholder="Часть" value={newHero.unit} onChange={handleHeroInputChange} />
            <textarea name="awards" placeholder="Награды (через запятую)" value={newHero.awards} onChange={handleHeroInputChange} />
            <textarea name="history" placeholder="История" value={newHero.history} onChange={handleHeroInputChange} />
            <textarea name="source" placeholder="Источник" value={newHero.source} onChange={handleHeroInputChange} />
            <label className="file-label">
              Фото героя: <input type="file" accept="image/*" onChange={handleHeroImageChange} />
              {editingHeroId && !heroImageFile && <span style={{fontSize: '12px', color: 'gray'}}> (Оставьте пустым, чтобы не менять фото)</span>}
            </label>
            <button type="submit">{editingHeroId ? 'Сохранить изменения' : 'Сохранить героя'}</button>
          </form>
        )}

        <div className="heroes-list">
          {heroes.map(hero => (
            <div key={hero.id} className="admin-hero-item">
              <div className="hero-info">
                <strong>{hero.fullName}</strong>
                <span>{hero.rank}</span>
              </div>
              <div className="admin-actions">
                <button className="edit-btn" onClick={() => startEditHero(hero)}>Ред.</button>
                <button className="delete-btn" onClick={() => handleDeleteHero(hero.id)}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= СЕКЦИЯ СЮЖЕТОВ ================= */}
      <div className="section-block" style={{marginTop: '50px', borderTop: '2px solid #eee', paddingTop: '30px'}}>
        <h2 className="section-title">Управление Сюжетами</h2>
        
        <button className="add-btn" style={{background: '#1976d2'}} onClick={() => {
          setIsBattleFormOpen(!isBattleFormOpen);
          setEditingBattleId(null);
          if (!isBattleFormOpen) {
            setNewBattle({ title: '', year: '', description: '' });
            setBattleImageFile(null);
          }
        }}>
          {isBattleFormOpen && !editingBattleId ? 'Закрыть форму' : '+ Добавить сюжет'}
        </button>

        {isBattleFormOpen && (
          <form className="add-hero-form" onSubmit={handleBattleSubmit}>
            <h3>{editingBattleId ? 'Редактирование сюжета' : 'Новый сюжет'}</h3>
            <input name="title" placeholder="Название битвы" value={newBattle.title} onChange={handleBattleInputChange} required />
            <input name="year" placeholder="Годы (напр. 1941-1942)" value={newBattle.year} onChange={handleBattleInputChange} />
            <textarea name="description" placeholder="Описание сюжета" value={newBattle.description} onChange={handleBattleInputChange} />
            <label className="file-label">
              Фото сюжета: <input type="file" accept="image/*" onChange={handleBattleImageChange} />
            </label>
            <button type="submit" style={{background: '#1976d2'}}>
              {editingBattleId ? 'Сохранить изменения' : 'Сохранить сюжет'}
            </button>
          </form>
        )}

        <div className="heroes-list">
           {battlesList.length === 0 ? <p>Сюжетов пока нет</p> : battlesList.map(battle => (
            <div key={battle.id} className="admin-hero-item">
              <div className="hero-info">
                <strong>{battle.title}</strong>
                <span>{battle.year}</span>
              </div>
              <div className="admin-actions">
                <button className="edit-btn" onClick={() => startEditBattle(battle)}>Ред.</button>
                <button className="delete-btn" onClick={() => handleDeleteBattle(battle.id)}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default AdminDashboard;