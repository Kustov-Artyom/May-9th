const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : '/api';

const api = {
  // --- AUTH ---
  login: async (username, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response.json();
  },

  // --- HEROES ---
  getHeroes: async () => {
    const response = await fetch(`${API_URL}/heroes`);
    return response.json();
  },

  createHero: async (formData, token) => {
    const response = await fetch(`${API_URL}/heroes`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return response.json();
  },

  updateHero: async (id, formData, token) => {
    const response = await fetch(`${API_URL}/heroes/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return response.json();
  },

  deleteHero: async (id, token) => {
    const response = await fetch(`${API_URL}/heroes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // --- BATTLES ---
  getBattles: async () => {
    const response = await fetch(`${API_URL}/battles`);
    return response.json();
  },

  createBattle: async (formData, token) => {
    const response = await fetch(`${API_URL}/battles`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return response.json();
  },

  updateBattle: async (id, formData, token) => {
    const response = await fetch(`${API_URL}/battles/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return response.json();
  },

  deleteBattle: async (id, token) => {
    const response = await fetch(`${API_URL}/battles/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

export default api;