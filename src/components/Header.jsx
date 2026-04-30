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
                    <img src="/images/logo.png" alt="Логотип УРАЛЬСКАЯ СТАЛЬ" className="logo" />
                </div>

                <div className="header-text">
                    <h1 className="header-title">ПОМНИМ</h1>
                    <div className="header-description">
                        <p>Этот сайт — наша Книга памяти героев в лицах, созданная сотрудниками Группы компаний «Уральская Сталь». Здесь мы публикуем фотографии наших отцов, дедов и прадедов, чтобы сохранить память о каждом, кто сражался за Победу в Великой Отечественной войне.</p>
                        <p className="description-highlight">Присоединяйтесь к «Бессмертному полку» нашей компании: присылайте снимки родных и делитесь историями их подвигов.</p>
                        <p className="description-email">
                            <span>Прислать историю на почту:</span> 
                            <a href="mailto:a.hitrik@uralsteel.com">a.hitrik@uralsteel.com</a>
                        </p>
                    </div>
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