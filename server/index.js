const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key-change-this-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/images')));

// Хранилище для загруженных файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/images'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Хранилища данных
let heroes = [];
let battles = [];

// Пути к JSON файлам
const heroesFilePath = path.join(__dirname, '../src/data/heroes.json');
const battlesFilePath = path.join(__dirname, '../src/data/battles.json');

// Загрузка данных из JSON файлов
function loadData() {
  // Загрузка героев
  try {
    const heroesData = fs.readFileSync(heroesFilePath, 'utf8');
    heroes = JSON.parse(heroesData);
    console.log(`Загружено ${heroes.length} героев`);
  } catch (error) {
    console.log('Heroes file not found or invalid, starting with empty array');
    heroes = [];
  }

  // Загрузка сюжетов
  try {
    const battlesData = fs.readFileSync(battlesFilePath, 'utf8');
    battles = JSON.parse(battlesData);
    console.log(`Загружено ${battles.length} сюжетов`);
  } catch (error) {
    console.log('Battles file not found or invalid, starting with empty array');
    battles = [];
  }
}

// Сохранение героев в JSON файл
function saveHeroes() {
  try {
    fs.writeFileSync(heroesFilePath, JSON.stringify(heroes, null, 2));
    console.log('Герои сохранены');
  } catch (error) {
    console.error('Ошибка сохранения героев:', error);
  }
}

// Сохранение сюжетов в JSON файл
function saveBattles() {
  try {
    fs.writeFileSync(battlesFilePath, JSON.stringify(battles, null, 2));
    console.log('Сюжеты сохранены');
  } catch (error) {
    console.error('Ошибка сохранения сюжетов:', error);
  }
}

// Хеш пароля администратора (пароль: admin123)
const ADMIN_PASSWORD_HASH = '$2b$10$0Xuy11FFe.7PSDyIXyZhA.uvUF0N05IIVmpwhJzw4RmB86lq6D9ba';
const ADMIN_USERNAME = 'admin';

// Генерация хеша пароля (выполни один раз)
async function generatePasswordHash() {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('admin123', salt);
  console.log('Hash для пароля admin123:', hash);
  return hash;
}

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Неверный токен' });
    }
    req.user = user;
    next();
  });
};

// ==================== AUTH ROUTES ====================

// Вход в админку
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (username !== ADMIN_USERNAME) {
    return res.status(401).json({ message: 'Неверный логин или пароль' });
  }

  const validPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!validPassword) {
    return res.status(401).json({ message: 'Неверный логин или пароль' });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, message: 'Успешный вход' });
});

// ==================== HEROES ROUTES ====================

// Получить всех героев
app.get('/api/heroes', (req, res) => {
  res.json(heroes);
});

// Получить одного героя
app.get('/api/heroes/:id', (req, res) => {
  const hero = heroes.find(h => h.id === parseInt(req.params.id));
  if (!hero) {
    return res.status(404).json({ message: 'Герой не найден' });
  }
  res.json(hero);
});

// Добавить героя (с загрузкой фото)
app.post('/api/heroes', authenticateToken, upload.single('image'), (req, res) => {
  const newHero = {
    id: heroes.length > 0 ? Math.max(...heroes.map(h => h.id)) + 1 : 1,
    fullName: req.body.fullName,
    birthYear: parseInt(req.body.birthYear),
    rank: req.body.rank,
    unit: req.body.unit,
    awards: req.body.awards ? JSON.parse(req.body.awards) : [],
    history: req.body.history,
    source: req.body.source,
    image: req.file ? req.file.filename : 'default.jpg'
  };

  heroes.push(newHero);
  saveHeroes(); // Сохраняем в JSON файл

  res.status(201).json(newHero);
});

// Обновить героя
app.put('/api/heroes/:id', authenticateToken, upload.single('image'), (req, res) => {
  const heroIndex = heroes.findIndex(h => h.id === parseInt(req.params.id));
  
  if (heroIndex === -1) {
    return res.status(404).json({ message: 'Герой не найден' });
  }

  const updatedHero = {
    ...heroes[heroIndex],
    fullName: req.body.fullName || heroes[heroIndex].fullName,
    birthYear: req.body.birthYear ? parseInt(req.body.birthYear) : heroes[heroIndex].birthYear,
    rank: req.body.rank || heroes[heroIndex].rank,
    unit: req.body.unit || heroes[heroIndex].unit,
    awards: req.body.awards ? JSON.parse(req.body.awards) : heroes[heroIndex].awards,
    history: req.body.history || heroes[heroIndex].history,
    source: req.body.source || heroes[heroIndex].source,
    image: req.file ? req.file.filename : heroes[heroIndex].image
  };

  heroes[heroIndex] = updatedHero;
  saveHeroes(); // Сохраняем в JSON файл

  res.json(updatedHero);
});

// Удалить героя
app.delete('/api/heroes/:id', authenticateToken, (req, res) => {
  const heroIndex = heroes.findIndex(h => h.id === parseInt(req.params.id));
  
  if (heroIndex === -1) {
    return res.status(404).json({ message: 'Герой не найден' });
  }

  heroes.splice(heroIndex, 1);
  saveHeroes(); // Сохраняем в JSON файл

  res.json({ message: 'Герой удален' });
});

// ==================== BATTLES ROUTES ====================

// Получить все сюжеты
app.get('/api/battles', (req, res) => {
  res.json(battles);
});

// Добавить сюжет (с загрузкой фото)
app.post('/api/battles', authenticateToken, upload.single('image'), (req, res) => {
  const newBattle = {
    id: battles.length > 0 ? Math.max(...battles.map(b => b.id)) + 1 : 1,
    title: req.body.title,
    year: req.body.year,
    description: req.body.description,
    image: req.file ? req.file.filename : 'default.jpg'
  };

  battles.push(newBattle);
  saveBattles(); // Сохраняем в JSON файл

  res.status(201).json(newBattle);
});

// Обновить сюжет
app.put('/api/battles/:id', authenticateToken, upload.single('image'), (req, res) => {
  const battleIndex = battles.findIndex(b => b.id === parseInt(req.params.id));
  
  if (battleIndex === -1) {
    return res.status(404).json({ message: 'Сюжет не найден' });
  }

  const updatedBattle = {
    ...battles[battleIndex],
    title: req.body.title || battles[battleIndex].title,
    year: req.body.year || battles[battleIndex].year,
    description: req.body.description || battles[battleIndex].description,
    image: req.file ? req.file.filename : battles[battleIndex].image
  };

  battles[battleIndex] = updatedBattle;
  saveBattles(); // Сохраняем в JSON файл

  res.json(updatedBattle);
});

// Удалить сюжет
app.delete('/api/battles/:id', authenticateToken, (req, res) => {
  const battleIndex = battles.findIndex(b => b.id === parseInt(req.params.id));
  
  if (battleIndex === -1) {
    return res.status(404).json({ message: 'Сюжет не найден' });
  }

  battles.splice(battleIndex, 1);
  saveBattles(); // Сохраняем в JSON файл

  res.json({ message: 'Сюжет удален' });
});

// Загрузка данных при старте сервера
loadData();

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = { generatePasswordHash };