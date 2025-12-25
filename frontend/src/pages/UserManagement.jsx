import { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: 100,
        offset: 0
      });
      if (search) params.append('search', search);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await api.get(`/admin/user-management?${params}`);
      if (response.data.success) {
        setUsers(response.data.data.users);
        setStatistics(response.data.data.statistics);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('ユーザーデータの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserBan = async (userId, currentStatus) => {
    const action = currentStatus === 'BANNED' ? 'UNBAN' : 'BAN';
    if (!confirm(`このユーザーを${action}しますか？`)) return;

    try {
      const response = await api.patch(`/admin/user-management/${userId}/toggle-ban`, {
        is_banned: action === 'BAN'
      });

      if (response.data.success) {
        alert(response.data.message);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error toggling ban:', error);
      alert('ステータスの変更に失敗しました');
    }
  };

  const changeUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`このユーザーのロールを${newRole}に変更しますか？`)) return;

    try {
      const response = await api.patch(`/admin/user-management/${userId}/change-role`, {
        role: newRole
      });

      if (response.data.success) {
        alert(response.data.message);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error changing role:', error);
      alert('ロールの変更に失敗しました');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      {/* Statistics */}
      {statistics && (
        <div className="kpi-grid" style={{ marginBottom: '24px' }}>
          <div className="kpi-card">
            <div className="kpi-icon blue">
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="kpi-info">
              <div className="kpi-label">総ユーザー数</div>
              <div className="kpi-value">{statistics.total_users}</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon green">
              <i className="fa-solid fa-user-check"></i>
            </div>
            <div className="kpi-info">
              <div className="kpi-label">アクティブ</div>
              <div className="kpi-value">{statistics.active_count}</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon orange">
              <i className="fa-solid fa-user-shield"></i>
            </div>
            <div className="kpi-info">
              <div className="kpi-label">管理者</div>
              <div className="kpi-value">{statistics.admin_count}</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon purple">
              <i className="fa-solid fa-user-slash"></i>
            </div>
            <div className="kpi-info">
              <div className="kpi-label">BAN済み</div>
              <div className="kpi-value">{statistics.banned_count}</div>
            </div>
          </div>
        </div>
      )}

      {/* User Table */}
      <div className="admin-table-container">
        <div className="admin-table-header">
          <div className="admin-search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="名前・メールで検索"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="admin-filters">
            <select
              className="admin-filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">すべてのロール</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <select
              className="admin-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">すべてのステータス</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="BANNED">BANNED</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>読み込み中...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty">
            <i className="fa-solid fa-users-slash"></i>
            <p>ユーザーが見つかりません</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>ユーザー</th>
                <th>ロール</th>
                <th>ステータス</th>
                <th>アクティビティ</th>
                <th>登録日</th>
                <th>最終ログイン</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{user.email}</div>
                  </td>
                  <td>
                    <span className={`badge ${user.role === 'ADMIN' ? 'warning' : 'info'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.is_banned ? 'danger' : 'success'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px' }}>
                      <div>★ {user.activity.total_reviews} レビュー</div>
                      <div>❤️ {user.activity.total_favorites} お気に入り</div>
                    </div>
                  </td>
                  <td style={{ fontSize: '12px' }}>{formatDate(user.created_at)}</td>
                  <td style={{ fontSize: '12px' }}>{formatDate(user.last_login_at)}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        onClick={() => toggleUserBan(user.user_id, user.status)}
                        className={`admin-btn ${user.is_banned ? 'admin-btn-primary' : 'admin-btn-danger'}`}
                        title={user.is_banned ? 'UNBAN' : 'BAN'}
                      >
                        <i className={`fa-solid fa-${user.is_banned ? 'unlock' : 'ban'}`}></i>
                      </button>
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => changeUserRole(user.user_id, user.role)}
                          className="admin-btn admin-btn-secondary"
                          title="ロール変更"
                        >
                          <i className="fa-solid fa-user-shield"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
