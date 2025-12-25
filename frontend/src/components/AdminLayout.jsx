import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../pages/Admin.css';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
    { path: '/admin/users', label: 'ユーザー管理', icon: 'fa-users' },
    { path: '/admin/reviews', label: 'レビュー管理', icon: 'fa-comments' },
    { path: '/admin/spots', label: 'スポット管理', icon: 'fa-map-marker-alt' }
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <i className="fa-solid fa-shield-halved"></i>
          <span>Admin Panel</span>
        </div>

        <nav className="admin-nav">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-user-info">
          <div className="admin-user-avatar">
            <i className="fa-solid fa-user-shield"></i>
          </div>
          <div className="admin-user-details">
            <div className="admin-user-name">{user?.name || 'Admin'}</div>
            <div className="admin-user-role">Administrator</div>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn" title="Logout">
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-header">
          <h1 className="admin-page-title">
            {menuItems.find(item => item.path === location.pathname)?.label || 'Admin'}
          </h1>
          <Link to="/" className="btn-back-to-site">
            <i className="fa-solid fa-home"></i> サイトに戻る
          </Link>
        </div>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
