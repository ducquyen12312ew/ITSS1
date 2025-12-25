import { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/dashboard?period=${period}`);
      if (response.data.success) {
        setKpis(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      alert('ダッシュボードの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>読み込み中...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!kpis) {
    return (
      <AdminLayout>
        <div className="admin-empty">
          <i className="fa-solid fa-exclamation-triangle"></i>
          <p>データを読み込めませんでした</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Period Selector */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, color: '#6b7280' }}>期間:</span>
        {[7, 30, 90].map(days => (
          <button
            key={days}
            onClick={() => setPeriod(days)}
            className={`admin-btn ${period === days ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
          >
            {days}日
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue">
            <i className="fa-solid fa-users"></i>
          </div>
          <div className="kpi-info">
            <div className="kpi-label">ユーザー数</div>
            <div className="kpi-value">{kpis.totals.users}</div>
            {kpis.growth.new_users > 0 && (
              <div className="kpi-change positive">
                +{kpis.growth.new_users} 新規
              </div>
            )}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green">
            <i className="fa-solid fa-map-marker-alt"></i>
          </div>
          <div className="kpi-info">
            <div className="kpi-label">スポット数</div>
            <div className="kpi-value">{kpis.totals.spots}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">
            <i className="fa-solid fa-comments"></i>
          </div>
          <div className="kpi-info">
            <div className="kpi-label">レビュー数</div>
            <div className="kpi-value">{kpis.totals.reviews}</div>
            {kpis.growth.new_reviews > 0 && (
              <div className="kpi-change positive">
                +{kpis.growth.new_reviews} 新規
              </div>
            )}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon orange">
            <i className="fa-solid fa-star"></i>
          </div>
          <div className="kpi-info">
            <div className="kpi-label">平均評価</div>
            <div className="kpi-value">{kpis.ratings.average}</div>
            <div className="kpi-change">★ {kpis.ratings.total_reviews} 件</div>
          </div>
        </div>
      </div>

      {/* Popular Spots */}
      <div className="admin-table-container" style={{ marginTop: '32px' }}>
        <div className="admin-table-header">
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
            人気スポット TOP 10
          </h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>スポット名</th>
              <th>評価</th>
              <th>レビュー数</th>
              <th>お気に入り</th>
              <th>新規お気に入り</th>
              <th>新規レビュー</th>
            </tr>
          </thead>
          <tbody>
            {kpis.popular_spots.map(spot => (
              <tr key={spot.spot_id}>
                <td style={{ fontWeight: 600 }}>{spot.name}</td>
                <td>
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                    ★ {spot.average_rating}
                  </span>
                </td>
                <td>{spot.review_count}</td>
                <td>{spot.favorite_count}</td>
                <td>{spot.new_favorites}</td>
                <td>{spot.new_reviews}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Activity */}
      <div className="kpi-grid" style={{ marginTop: '32px' }}>
        <div className="kpi-card">
          <div className="kpi-icon blue">
            <i className="fa-solid fa-chart-line"></i>
          </div>
          <div className="kpi-info">
            <div className="kpi-label">アクティブユーザー</div>
            <div className="kpi-value">{kpis.activity.active_users}</div>
            <div className="kpi-change">{kpis.activity.activity_rate}% 活動率</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green">
            <i className="fa-solid fa-heart"></i>
          </div>
          <div className="kpi-info">
            <div className="kpi-label">お気に入り数</div>
            <div className="kpi-value">{kpis.totals.favorites}</div>
            <div className="kpi-change">
              平均 {kpis.activity.avg_favorites_per_user}/人
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">
            <i className="fa-solid fa-calendar"></i>
          </div>
          <div className="kpi-info">
            <div className="kpi-label">スケジュール数</div>
            <div className="kpi-value">{kpis.totals.schedules}</div>
            <div className="kpi-change">
              平均 {kpis.activity.avg_schedules_per_user}/人
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon orange">
            <i className="fa-solid fa-child"></i>
          </div>
          <div className="kpi-info">
            <div className="kpi-label">登録子供数</div>
            <div className="kpi-value">{kpis.totals.children}</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
