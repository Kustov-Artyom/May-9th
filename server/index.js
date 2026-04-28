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

// Простая база данных (в реальном проекте используйте MongoDB/PostgreSQL)
let heroes = [];
let battles = [];

// Загрузка данных из JSON файла
const heroesFilePath = path.join(__dirname, '../src/data/heroes.json');
try {
  const data = fs.readFileSync(heroesFilePath, 'utf8');
  heroes = JSON.parse(data);
} catch (error) {
  console.log('Heroes file not found or invalid');
}

// Хеш пароля администратора (пароль: admin123)
const ADMIN_PASSWORD_HASH = '$2b$10$0Xuy11FFe.7PSDyIXyZhA.uvUF0N05IIVmpwhJzw4RmB86lq6D9ba'; // Сгенерируешь ниже
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
  
  // Сохраняем в JSON файл
  try {
    fs.writeFileSync(heroesFilePath, JSON.stringify(heroes, null, 2));
  } catch (error) {
    console.error('Ошибка сохранения:', error);
  }

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
  
  // Сохраняем в JSON файл
  try {
    fs.writeFileSync(heroesFilePath, JSON.stringify(heroes, null, 2));
  } catch (error) {
    console.error('Ошибка сохранения:', error);
  }

  res.json(updatedHero);
});

// Удалить героя
app.delete('/api/heroes/:id', authenticateToken, (req, res) => {
  const heroIndex = heroes.findIndex(h => h.id === parseInt(req.params.id));
  
  if (heroIndex === -1) {
    return res.status(404).json({ message: 'Герой не найден' });
  }

  heroes.splice(heroIndex, 1);
  
  // Сохраняем в JSON файл
  try {
    fs.writeFileSync(heroesFilePath, JSON.stringify(heroes, null, 2));
  } catch (error) {
    console.error('Ошибка сохранения:', error);
  }

  res.json({ message: 'Герой удален' });
});

// ==================== BATTLES ROUTES ====================

app.get('/api/battles', (req, res) => {
  res.json(battles);
});

app.post('/api/battles', authenticateToken, upload.single('image'), (req, res) => {
  const newBattle = {
    id: battles.length > 0 ? Math.max(...battles.map(b => b.id)) + 1 : 1,
    title: req.body.title,
    year: req.body.year,
    description: req.body.description,
    image: req.file ? req.file.filename : 'default.jpg'
  };

  battles.push(newBattle);
  res.status(201).json(newBattle);
});

app.delete('/api/battles/:id', authenticateToken, (req, res) => {
  const battleIndex = battles.findIndex(b => b.id === parseInt(req.params.id));
  
  if (battleIndex === -1) {
    return res.status(404).json({ message: 'Сюжет не найден' });
  }

  battles.splice(battleIndex, 1);
  res.json({ message: 'Сюжет удален' });
});

// ================= UPDATE HERO =================
app.put('/api/heroes/:id', authenticateToken, upload.single('image'), (req, res) => {
  const heroId = parseInt(req.params.id);
  const heroIndex = heroes.findIndex(h => h.id === heroId);

  if (heroIndex === -1) return res.status(404).json({ message: 'Герой не найден' });

  const hero = heroes[heroIndex];
  
  // Обновляем поля, если они пришли в запросе
  hero.fullName = req.body.fullName || hero.fullName;
  hero.birthYear = req.body.birthYear || hero.birthYear;
  hero.rank = req.body.rank || hero.rank;
  hero.unit = req.body.unit || hero.unit;
  hero.history = req.body.history || hero.history;
  hero.source = req.body.source || hero.source;
  if (req.body.awards) hero.awards = JSON.parse(req.body.awards);
  
  // Если загрузили новое фото, обновляем имя файла
  if (req.file) {
    hero.image = req.file.filename;
  }

  heroes[heroIndex] = hero;

  // Сохраняем в файл
  fs.writeFileSync(heroesFilePath, JSON.stringify(heroes, null, 2));
  res.json({ message: 'Герой обновлен', hero });
});

// ================= UPDATE BATTLE =================
app.put('/api/battles/:id', authenticateToken, upload.single('image'), (req, res) => {
  const battleId = parseInt(req.params.id);
  const battleIndex = battles.findIndex(b => b.id === battleId);

  if (battleIndex === -1) return res.status(404).json({ message: 'Сюжет не найден' });

  const battle = battles[battleIndex];
  
  battle.title = req.body.title || battle.title;
  battle.year = req.body.year || battle.year;
  battle.description = req.body.description || battle.description;
  
  if (req.file) {
    battle.image = req.file.filename;
  }

  battles[battleIndex] = battle;
  res.json({ message: 'Сюжет обновлен', battle });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Для генерации хеша пароля выполни: node -e "require(\'./index.js\').generatePasswordHash()"');
});

module.exports = { generatePasswordHash };