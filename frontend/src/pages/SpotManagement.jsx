import { useState, useEffect } from 'react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';

const SpotManagement = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    google_maps_url: '',
    image_url: '',
    standards_checked: false
  });

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/spot-management');
      if (response.data.success) {
        setSpots(response.data.data.spots);
      }
    } catch (error) {
      console.error('Error fetching spots:', error);
      alert('地点の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      google_maps_url: '',
      image_url: '',
      standards_checked: false
    });
    setEditMode(false);
    setSelectedSpot(null);
    setPreviewMode(false);
  };

  const handleOpenModal = async (spot = null, preview = false) => {
    if (spot && preview) {
      // Preview mode
      try {
        const response = await api.get(`/admin/spot-management/${spot.spot_id}/preview`);
        setSelectedSpot(response.data.data.spot);
        setPreviewMode(true);
        setShowModal(true);
      } catch (error) {
        console.error('Error previewing spot:', error);
        alert('プレビューの読み込みに失敗しました');
      }
    } else if (spot) {
      // Edit mode
      setEditMode(true);
      setSelectedSpot(spot);
      
      try {
        const response = await api.get(`/admin/spot-management/${spot.spot_id}/preview`);
        const spotDetails = response.data.data.spot;
        
        setFormData({
          name: spotDetails.name || '',
          google_maps_url: spotDetails.google_maps_url || '',
          image_url: spotDetails.images && spotDetails.images.length > 0 
            ? (typeof spotDetails.images[0] === 'string' ? spotDetails.images[0] : spotDetails.images[0].image_url)
            : '',
          standards_checked: false
        });
      } catch (error) {
        console.error('Error loading spot details:', error);
        alert('地点の読み込みに失敗しました');
      }
      setShowModal(true);
    } else {
      // Add new mode
      resetForm();
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePreview = () => {
    if (!formData.name.trim()) {
      alert('地点名は必須です');
      return;
    }
    // Show preview of current form
    setPreviewMode(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('地点名は必須です');
      return;
    }

    if (!formData.standards_checked) {
      alert('投稿基準の確認が必要です');
      return;
    }

    try {
      setLoading(true);

      if (editMode && selectedSpot) {
        await api.put(`/admin/spot-management/${selectedSpot.spot_id}`, formData);
        alert('地点を更新しました');
      } else {
        await api.post('/admin/spot-management', formData);
        alert('地点を作成しました');
      }

      handleCloseModal();
      fetchSpots();
    } catch (error) {
      console.error('Error saving spot:', error);
      alert(error.response?.data?.message || '地点の保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (spotId) => {
    if (!confirm('この地点を公開しますか？')) return;

    try {
      await api.post(`/admin/spot-management/${spotId}/publish`);
      alert('地点を公開しました');
      fetchSpots();
    } catch (error) {
      console.error('Error publishing spot:', error);
      alert(error.response?.data?.message || '公開に失敗しました');
    }
  };

  if (loading && !showModal) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>読み込み中...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header with mode indicator */}
      <div className="admin-header">
        <div>
          <h2>
            <i className="fa-solid fa-map-marker-alt"></i>
            スポット管理
          </h2>
          {showModal && !previewMode && (
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
              現在のモード: {editMode ? '編集' : '新規追加'}
            </div>
          )}
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => handleOpenModal()}>
          <i className="fa-solid fa-plus"></i>
          新規地点追加
        </button>
      </div>

      {/* Spots Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>地点名</th>
              <th>ステータス</th>
              <th>画像</th>
              <th>評価</th>
              <th>作成日</th>
              <th>アクション</th>
            </tr>
          </thead>
          <tbody>
            {spots.map(spot => (
              <tr key={spot.spot_id}>
                <td>{spot.spot_id}</td>
                <td style={{ fontWeight: 600 }}>{spot.name}</td>
                <td>
                  <span className={`admin-badge ${
                    spot.status === 'PUBLIC' ? 'admin-badge-success' : 
                    spot.status === 'DRAFT' ? 'admin-badge-warning' : 
                    'admin-badge-secondary'
                  }`}>
                    {spot.status}
                  </span>
                </td>
                <td>
                  {spot.images ? (Array.isArray(spot.images) ? spot.images.length : spot.images.split(',').length) : 0}
                </td>
                <td>
                  <span style={{ color: '#f59e0b' }}>★ {spot.average_rating}</span>
                </td>
                <td>{new Date(spot.created_at).toLocaleDateString('ja-JP')}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="admin-btn admin-btn-sm admin-btn-secondary"
                      onClick={() => handleOpenModal(spot, false)}
                      title="編集"
                    >
                      <i className="fa-solid fa-edit"></i>
                    </button>
                    <button
                      className="admin-btn admin-btn-sm admin-btn-info"
                      onClick={() => handleOpenModal(spot, true)}
                      title="プレビュー"
                    >
                      <i className="fa-solid fa-eye"></i>
                    </button>
                    {spot.status === 'DRAFT' && (
                      <button
                        className="admin-btn admin-btn-sm admin-btn-success"
                        onClick={() => handlePublish(spot.spot_id)}
                        title="公開"
                      >
                        <i className="fa-solid fa-check"></i>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && !previewMode && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>
                <i className="fa-solid fa-map-marker-alt"></i>
                {editMode ? 'スポット編集' : 'スポット新規追加'}
              </h3>
              <button className="admin-modal-close" onClick={handleCloseModal}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                {/* Spot Name */}
                <div className="admin-form-group">
                  <label className="admin-label">
                    地点名 <span className="admin-required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="admin-input"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="例: 上野動物園"
                    required
                  />
                  <small className="admin-hint">
                    特殊文字（!@#$%^&*+=[]{}';:"|,&lt;&gt;/?~`）は使用できません
                  </small>
                </div>

                {/* Google Maps URL */}
                <div className="admin-form-group">
                  <label className="admin-label">Google Maps URL</label>
                  <input
                    type="url"
                    name="google_maps_url"
                    className="admin-input"
                    value={formData.google_maps_url}
                    onChange={handleChange}
                    placeholder="https://maps.google.com/..."
                  />
                </div>

                {/* Image URL */}
                <div className="admin-form-group">
                  <label className="admin-label">画像URL</label>
                  <input
                    type="url"
                    name="image_url"
                    className="admin-input"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  <small className="admin-hint">
                    画像のURLを入力してください
                  </small>
                </div>

                {/* Image Preview */}
                {formData.image_url && (
                  <div className="admin-form-group">
                    <label className="admin-label">画像プレビュー</label>
                    <img
                      src={formData.image_url}
                      alt="プレビュー"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '200px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Standards Checked */}
                <div className="admin-form-group">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      name="standards_checked"
                      checked={formData.standards_checked}
                      onChange={handleChange}
                      required
                    />
                    <span>投稿基準を確認しました <span className="admin-required">*</span></span>
                  </label>
                  <small className="admin-hint">
                    投稿する前に、内容が投稿基準を満たしていることを確認してください
                  </small>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={handlePreview}
                >
                  <i className="fa-solid fa-eye"></i>
                  プレビュー
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={handleCloseModal}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={loading}
                >
                  <i className="fa-solid fa-paper-plane"></i>
                  {loading ? '送信中...' : '送信'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showModal && previewMode && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>
                <i className="fa-solid fa-eye"></i>
                プレビュー
              </h3>
              <button className="admin-modal-close" onClick={handleCloseModal}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="spot-preview">
                <h2>{selectedSpot ? selectedSpot.name : formData.name}</h2>
                
                {/* Display image */}
                {((selectedSpot && selectedSpot.images && selectedSpot.images.length > 0) || formData.image_url) && (
                  <div className="preview-images" style={{ marginBottom: '20px' }}>
                    <img
                      src={
                        selectedSpot && selectedSpot.images && selectedSpot.images.length > 0
                          ? (typeof selectedSpot.images[0] === 'string' ? selectedSpot.images[0] : selectedSpot.images[0].image_url)
                          : formData.image_url
                      }
                      alt="スポット画像"
                      style={{ maxWidth: '100%', borderRadius: '8px' }}
                    />
                  </div>
                )}

                <div className="preview-info">
                  {(selectedSpot?.google_maps_url || formData.google_maps_url) && (
                    <p>
                      <strong>Google Maps:</strong>{' '}
                      <a 
                        href={selectedSpot ? selectedSpot.google_maps_url : formData.google_maps_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        地図を開く <i className="fa-solid fa-external-link-alt"></i>
                      </a>
                    </p>
                  )}
                  
                  {selectedSpot && (
                    <>
                      <p><strong>ステータス:</strong> {selectedSpot.status}</p>
                      <p><strong>作成日:</strong> {new Date(selectedSpot.created_at).toLocaleString('ja-JP')}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => {
                  setPreviewMode(false);
                  if (!selectedSpot) {
                    // Return to edit form
                  }
                }}
              >
                {selectedSpot ? '閉じる' : '戻る'}
              </button>
              {selectedSpot && selectedSpot.status === 'DRAFT' && (
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={() => {
                    handleCloseModal();
                    handlePublish(selectedSpot.spot_id);
                  }}
                >
                  <i className="fa-solid fa-check"></i>
                  公開する
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default SpotManagement;
