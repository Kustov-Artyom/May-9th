import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
    const location = useLocation();

    return (
        <header className="header">
            <div className="header-bg"></div>
            <div className="header-overlay"></div>

            <div className="header-content">
                <div className="logo-container">
                    <img src="/images/logo.png" alt="Логотип" className="logo" />
                </div>

                <div className="header-text">
                    <h1 className="header-title">ПОМНИМ</h1>
                    <p className="header-subtitle">Расскажи свою историю о ветеране</p>
                </div>

                <div className="header-main-title">
                    <h2>Они сражались за Родину</h2>
                </div>

                <nav className="header-nav">
                    <Link
                        to="/"
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        Лица героев
                    </Link>
                    <Link
                        to="/battles"
                        className={`nav-link ${location.pathname === '/battles' ? 'active' : ''}`}
                    >
                        Сюжеты
                    </Link>
                </nav>
            </div>
        </header>
    );
}

export default Header;