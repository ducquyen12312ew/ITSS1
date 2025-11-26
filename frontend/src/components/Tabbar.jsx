import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Tabbar.css';

const Tabbar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('ログアウトしますか？')) {
      logout();
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="tabbar">
      <Link to="/" className={`tab ${isActive('/') ? 'active' : ''}`}>
        <i className="fa-solid fa-house"></i>
        <span>ホーム</span>
      </Link>
      <Link to="/search" className={`tab ${isActive('/search') ? 'active' : ''}`}>
        <i className="fa-solid fa-magnifying-glass"></i>
        <span>検索</span>
      </Link>
      <Link to="/favorites" className={`tab ${isActive('/favorites') ? 'active' : ''}`}>
        <i className="fa-regular fa-heart"></i>
        <span>お気に入り</span>
      </Link>
      <Link to="/schedule" className={`tab ${isActive('/schedule') ? 'active' : ''}`}>
        <i className="fa-regular fa-calendar"></i>
        <span>スケジュール</span>
      </Link>
      <Link to="/kids" className={`tab ${isActive('/kids') || isActive('/swipe') ? 'active' : ''}`}>
        <i className="fa-solid fa-children"></i>
        <span>子供</span>
      </Link>
      <button onClick={handleLogout} className="tab logout-btn">
        <i className="fa-solid fa-right-from-bracket"></i>
        <span>ログアウト</span>
      </button>
    </nav>
  );
};

export default Tabbar;
