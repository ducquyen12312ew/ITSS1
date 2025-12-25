import { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, [ratingFilter, statusFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: 100 });
      if (ratingFilter !== 'all') params.append('rating', ratingFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await api.get(`/admin/review-management?${params}`);
      if (response.data.success) {
        setReviews(response.data.data.reviews);
        setStatistics(response.data.data.statistics);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      alert('レビューデータの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const toggleReviewVisibility = async (reviewId, currentStatus) => {
    const action = currentStatus ? '非表示' : '公開';
    if (!confirm(`このレビューを${action}にしますか？`)) return;

    try {
      const response = await api.patch(`/admin/review-management/${reviewId}/toggle-visibility`, {
        is_hidden: !currentStatus
      });

      if (response.data.success) {
        alert(response.data.message);
        fetchReviews();
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('ステータスの変更に失敗しました');
    }
  };

  const deleteReview = async (reviewId) => {
    if (!confirm('このレビューを削除しますか？この操作は取り消せません。')) return;

    try {
      const response = await api.delete(`/admin/review-management/${reviewId}`);
      if (response.data.success) {
        alert('レビューを削除しました');
        fetchReviews();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('レビューの削除に失敗しました');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <AdminLayout>
      {/* Statistics */}
      {statistics && (
        <div className="kpi-grid" style={{ marginBottom: '24px' }}>
          <div className="kpi-card">
            <div className="kpi-icon purple">
              <i className="fa-solid fa-comments"></i>
            </div>
            <div className="kpi-info">
              <div className="kpi-label">総レビュー数</div>
              <div className="kpi-value">{statistics.total_reviews}</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon green">
              <i className="fa-solid fa-eye"></i>
            </div>
            <div className="kpi-info">
              <div className="kpi-label">公開中</div>
              <div className="kpi-value">{statistics.public_reviews}</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon orange">
              <i className="fa-solid fa-eye-slash"></i>
            </div>
            <div className="kpi-info">
              <div className="kpi-label">非表示</div>
              <div className="kpi-value">{statistics.hidden_reviews}</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon blue">
              <i className="fa-solid fa-star"></i>
            </div>
            <div className="kpi-info">
              <div className="kpi-label">平均評価</div>
              <div className="kpi-value">{statistics.average_rating}</div>
            </div>
          </div>
        </div>
      )}

      {/* Review Table */}
      <div className="admin-table-container">
        <div className="admin-table-header">
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
            レビュー一覧
          </h3>
          <div className="admin-filters">
            <select
              className="admin-filter-select"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="all">すべての評価</option>
              <option value="5">★★★★★ (5)</option>
              <option value="4">★★★★☆ (4)</option>
              <option value="3">★★★☆☆ (3)</option>
              <option value="2">★★☆☆☆ (2)</option>
              <option value="1">★☆☆☆☆ (1)</option>
            </select>
            <select
              className="admin-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">すべてのステータス</option>
              <option value="public">公開中</option>
              <option value="hidden">非表示</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>読み込み中...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="admin-empty">
            <i className="fa-solid fa-comments-slash"></i>
            <p>レビューが見つかりません</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>ユーザー</th>
                <th>スポット</th>
                <th>評価</th>
                <th>コメント</th>
                <th>報告</th>
                <th>ステータス</th>
                <th>投稿日</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(review => (
                <tr key={review.review_id}>
                  <td>{review.review_id}</td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{review.user_name}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{review.user_email}</div>
                  </td>
                  <td style={{ fontWeight: 600, maxWidth: '200px', fontSize: '13px' }}>
                    {review.spot_name}
                  </td>
                  <td>
                    <div style={{ color: '#f59e0b', fontSize: '14px' }}>
                      {renderStars(review.rating)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      {review.rating}/5
                    </div>
                  </td>
                  <td style={{ maxWidth: '250px', fontSize: '13px' }}>
                    {review.comment || <span style={{ color: '#9ca3af' }}>-</span>}
                  </td>
                  <td>
                    {review.report_count > 0 ? (
                      <span className="badge danger">
                        <i className="fa-solid fa-flag"></i> {review.report_count}
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>-</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${review.is_hidden ? 'warning' : 'success'}`}>
                      {review.is_hidden ? '非表示' : '公開中'}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px' }}>{formatDate(review.created_at)}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        onClick={() => toggleReviewVisibility(review.review_id, review.is_hidden)}
                        className={`admin-btn ${review.is_hidden ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                        title={review.is_hidden ? '公開' : '非表示'}
                      >
                        <i className={`fa-solid fa-eye${review.is_hidden ? '' : '-slash'}`}></i>
                      </button>
                      <button
                        onClick={() => deleteReview(review.review_id)}
                        className="admin-btn admin-btn-danger"
                        title="削除"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
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

export default ReviewManagement;
