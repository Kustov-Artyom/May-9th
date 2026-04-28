import { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import AdminDashboard from '../components/AdminDashboard';
import './Admin.css';

function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Проверяем, есть ли уже токен при загрузке страницы
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="admin-page">
      {isLoggedIn ? (
        <AdminDashboard />
      ) : (
        <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
}

export default Admin;