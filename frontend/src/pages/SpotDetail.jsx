import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Tabbar from '../components/Tabbar';
import './SpotDetail.css';

const SpotDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [spot, setSpot] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: 9,
    note: '',
  });
  const [existingSchedules, setExistingSchedules] = useState([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
    reviewTarget: '', // 清家, 子ども達とキレか?, ベビーカーで移動しやすい!, 授乳室あり?
  });

  useEffect(() => {
    fetchSpotDetail();
    checkFavoriteStatus();
    fetchExistingSchedules();
  }, [id]);

  const fetchSpotDetail = async () => {
    try {
      setLoading(true);
      
      // Fetch spot details
      const spotRes = await api.get(`/spots/${id}`);
      setSpot(spotRes.data.data);

      // Fetch reviews
      const reviewsRes = await api.get(`/spots/${id}/reviews`);
      setReviews(reviewsRes.data.data?.reviews || []);
    } catch (error) {
      console.error('Error fetching spot detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await api.get('/favorites');
      const favorites = response.data.data?.favorites || [];
      setIsFavorite(favorites.some(fav => fav.spot_id === parseInt(id)));
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const fetchExistingSchedules = async () => {
    try {
      const response = await api.get('/schedules');
      const allSchedules = response.data.data?.schedules || [];
      // Filter schedules for this spot only
      const spotSchedules = allSchedules.filter(
        schedule => schedule.spot_id === parseInt(id) && schedule.status !== 'CANCELLED'
      );
      setExistingSchedules(spotSchedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
        alert('お気に入りから削除しました');
      } else {
        await api.post('/favorites', { spot_id: id });
        setIsFavorite(true);
        alert('お気に入りに追加しました');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('エラーが発生しました');
    }
  };

  const handleAddToSchedule = async () => {
    try {
      if (!scheduleData.date) {
        alert('日付を選択してください');
        return;
      }

      await api.post('/schedules', {
        spot_id: parseInt(id),
        scheduled_date: scheduleData.date,
        time: scheduleData.time,
        notes: scheduleData.note || null,
      });

      alert('スケジュールに追加しました');
      setScheduleOpen(false);
      setScheduleData({ date: '', time: 9, note: '' });
      fetchExistingSchedules(); // Refresh schedule list
    } catch (error) {
      console.error('Error adding to schedule:', error);
      alert('エラーが発生しました');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!confirm('このスケジュールを削除しますか？')) return;
    
    try {
      await api.delete(`/schedules/${scheduleId}`);
      alert('削除しました');
      fetchExistingSchedules(); // Refresh list
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('エラーが発生しました');
    }
  };

  const formatTime = (time) => {
    return `${time}:00`;
  };

  const handleSubmitReview = async () => {
    try {
      if (!reviewData.rating || !reviewData.comment) {
        alert('評価とコメントを入力してください');
        return;
      }

      await api.post('/reviews', {
        spot_id: parseInt(id),
        rating: reviewData.rating,
        comment: reviewData.comment,
      });

      alert('レビューを投稿しました');
      setReviewOpen(false);
      setReviewData({ rating: 5, comment: '', reviewTarget: '' });
      fetchSpotDetail(); // Refresh reviews
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('エラーが発生しました: ' + (error.response?.data?.message || error.message));
    }
  };

  const openRoute = () => {
    if (spot?.latitude && spot?.longitude) {
      // Default origin: HUST (21.0055°N, 105.8433°E)
      const origin = '21.0055,105.8433';
      const destination = `${spot.latitude},${spot.longitude}`;
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`, '_blank');
    } else if (spot?.address) {
      const origin = 'Đại+học+Bách+khoa+Hà+Nội';
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${encodeURIComponent(spot.address)}&travelmode=driving`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="spot-detail-page">
        <div className="loading">Loading...</div>
        <Tabbar />
      </div>
    );
  }

  if (!spot) {
    return (
      <div className="spot-detail-page">
        <div className="error">スポットが見つかりませんでした</div>
        <Tabbar />
      </div>
    );
  }

  return (
    <div className="spot-detail-page">
      {/* Hero header */}
      <header className="hero">
        <div className="hero-inner">
          <div className="hero-top">
            <div className="brand">
              コドモ週末ナビ
              <span className="sub">スポットの詳細</span>
            </div>
            <a href="/profile" className="profile-btn">プロフィール</a>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="wrap">
        {/* Breadcrumb */}
        <div className="crumb">
          <button onClick={() => navigate(-1)} className="back-btn">
            <i className="fa-solid fa-angle-left"></i> 戻る
          </button>
          <span className="muted">{spot.name}</span>
        </div>

        {/* Hero image */}
        <div className="hero-img">
          <img src={spot.images?.[0]?.image_url || spot.image_url || 'https://via.placeholder.com/1100x380?text=No+Image'} alt={spot.name} />
        </div>

        {/* Title row */}
        <div className="title-row">
          <h2 className="spot-title">{spot.name}</h2>
          <div className="badge-stack">
            {spot.is_open_today && <span className="badge green">本日営業</span>}
            {spot.tags?.includes('雨OK') && <span className="badge">雨OK</span>}
          </div>
        </div>

        {/* Meta info */}
        <div className="meta-row">
          {spot.area && (
            <span className="m">
              <i className="fa-solid fa-location-dot"></i> {spot.area}
            </span>
          )}
          {spot.latitude && spot.longitude && (
            <span className="m">
              <i className="fa-solid fa-route"></i> 
              {(() => {
                // Default location: HUST (21.0055°N, 105.8433°E)
                const defaultLat = 21.0055;
                const defaultLng = 105.8433;
                const toRad = (val) => val * Math.PI / 180;
                const lat1 = toRad(defaultLat);
                const lat2 = toRad(spot.latitude);
                const dLat = toRad(spot.latitude - defaultLat);
                const dLng = toRad(spot.longitude - defaultLng);
                const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                          Math.cos(lat1) * Math.cos(lat2) *
                          Math.sin(dLng/2) * Math.sin(dLng/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                const distance = 6371 * c;
                return distance.toFixed(1);
              })()}km
            </span>
          )}
          {spot.average_rating && (
            <span className="m">
              <i className="fa-solid fa-star"></i> {Number(spot.average_rating).toFixed(1)} ({spot.review_count || 0})
            </span>
          )}
        </div>

        {/* Pill info */}
        <div className="pilltab">
          <span className="tabb">
            {(() => {
              const ageTags = spot.tags?.filter(tag => ['0-2歳', '3-5歳', '6-8歳', '9-12歳', '13-18歳'].includes(tag));
              return ageTags?.length > 0 ? ageTags.join(', ') : '全年齢';
            })()}
          </span>
          <span className="tabb">
            {(() => {
              const priceTags = ['無料', '1000円以下', '1000-3000円', '3000-5000円', '5000円以上'];
              const priceTag = spot.tags?.find(tag => priceTags.includes(tag));
              return priceTag || '料金不明';
            })()}
          </span>
        </div>

        {/* Action buttons */}
        <div className="op-row">
          <button onClick={openRoute} className="btn">
            <i className="fa-solid fa-location-arrow"></i> 経路
          </button>
          <button onClick={toggleFavorite} className={`btn ${isFavorite ? 'active' : 'ghost'}`}>
            <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-heart`}></i> 
            {isFavorite ? 'お気に入り済み' : '保存'}
          </button>
          <button onClick={() => setScheduleOpen(!scheduleOpen)} className="btn">
            <i className="fa-regular fa-calendar"></i> 追加
          </button>
        </div>

        {/* Existing Schedules Card */}
        {existingSchedules.length > 0 && (
          <div 
            className="sect schedule-badge-card"
            onClick={() => navigate('/schedule')}
            style={{
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                <i className="fa-solid fa-calendar-check"></i>
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                  このスポットの予定あり
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  {existingSchedules.length}件のスケジュール
                </div>
              </div>
            </div>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '20px', opacity: 0.8 }}></i>
          </div>
        )}

        {/* Schedule panel */}
        {scheduleOpen && (
          <div className="sect schedule-panel">
            <div className="sched-head">
              <strong>スケジュールに追加</strong>
              <button onClick={() => setScheduleOpen(false)} className="btn-close">
                閉じる
              </button>
            </div>
            <div className="hr"></div>
            <div className="grid2">
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#666' }}>
                  日付
                </label>
                <input
                  type="date"
                  className="field"
                  value={scheduleData.date}
                  onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#666' }}>
                  時間 (0-24時)
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  className="field"
                  value={scheduleData.time}
                  onChange={(e) => setScheduleData({ ...scheduleData, time: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div style={{ marginTop: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#666' }}>
                メモ (任意)
              </label>
              <input
                className="field"
                placeholder="例: お弁当持参、雨具準備"
                value={scheduleData.note}
                onChange={(e) => setScheduleData({ ...scheduleData, note: e.target.value })}
              />
            </div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <button onClick={() => setScheduleOpen(false)} className="btn ghost">
                キャンセル
              </button>
              <button onClick={handleAddToSchedule} className="btn primary">
                保存する
              </button>
            </div>
          </div>
        )}

        {/* Details sections */}
        <div className="sect">
          <strong>施設について</strong>
          <div style={{ marginTop: '8px' }}>{spot.description || '情報がありません'}</div>
        </div>

        <div className="sect">
          <strong>営業時間</strong>
          <div style={{ marginTop: '8px' }}>
            {(() => {
              if (!spot.operating_hours) return '情報がありません';
              if (typeof spot.operating_hours === 'string') return spot.operating_hours;
              // If it's an object, format it
              const hours = spot.operating_hours;
              const dayMap = {
                monday: '月', tuesday: '火', wednesday: '水', thursday: '木',
                friday: '金', saturday: '土', sunday: '日'
              };
              return Object.entries(hours)
                .filter(([_, time]) => time)
                .map(([day, time]) => `${dayMap[day] || day}: ${time}`)
                .join(', ') || '情報がありません';
            })()}
          </div>
        </div>

        {spot.facilities && (
          <div className="sect">
            <strong>設備</strong>
            <div className="taglist" style={{ marginTop: '8px' }}>
              {(() => {
                let facs = [];
                if (typeof spot.facilities === 'string') {
                  facs = spot.facilities.split(',').map(f => f.trim());
                } else if (Array.isArray(spot.facilities)) {
                  facs = spot.facilities;
                } else if (typeof spot.facilities === 'object') {
                  // If it's an object like {parking: true, restroom: true}
                  // Extract keys where value is truthy
                  const facilityMap = {
                    'parking': '駐車場',
                    'restroom': 'トイレ',
                    'nursing_room': '授乳室',
                    'diaper_changing': 'おむつ交換台',
                    'stroller_accessible': 'ベビーカー可',
                    'elevator': 'エレベーター',
                    'wheelchair_accessible': '車椅子対応',
                    'restaurant': 'レストラン',
                    'vending_machine': '自動販売機',
                    'lockers': 'ロッカー'
                  };
                  facs = Object.entries(spot.facilities)
                    .filter(([key, value]) => value === true || value === 'true' || value === 1)
                    .map(([key]) => facilityMap[key] || key);
                }
                return facs.map((fac, idx) => (
                  <span key={idx} className="tag">{String(fac).trim()}</span>
                ));
              })()}
            </div>
          </div>
        )}

        {spot.safety_notes && (
          <div className="sect">
            <strong>安全メモ</strong>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              {(() => {
                const notes = typeof spot.safety_notes === 'string'
                  ? spot.safety_notes.split('\n')
                  : Array.isArray(spot.safety_notes)
                  ? spot.safety_notes
                  : [spot.safety_notes];
                return notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ));
              })()}
            </ul>
          </div>
        )}

        {spot.tags && (
          <div className="sect">
            <strong>タグ</strong>
            <div className="taglist" style={{ marginTop: '8px' }}>
              {(() => {
                const tags = typeof spot.tags === 'string'
                  ? spot.tags.split(',')
                  : Array.isArray(spot.tags)
                  ? spot.tags
                  : [];
                return tags.map((tag, idx) => (
                  <span key={idx} className="tag">{String(tag).trim()}</span>
                ));
              })()}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="sect reviews">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>レビュー</strong>
            <button onClick={() => setReviewOpen(!reviewOpen)} className="btn">投稿する</button>
          </div>

          {/* Review form - Full page modal */}
          {reviewOpen && (
            <>
              <div 
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: '#fff',
                  zIndex: 9999,
                  overflowY: 'auto'
                }}
              >
                {/* Header */}
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'sticky',
                  top: 0,
                  background: '#fff',
                  zIndex: 10
                }}>
                  <button
                    onClick={() => {
                      setReviewOpen(false);
                      setReviewData({ rating: 5, comment: '', reviewTarget: '' });
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '20px',
                      cursor: 'pointer',
                      padding: '8px',
                      color: '#374151'
                    }}
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>レビューを投稿</h3>
                  <button
                    onClick={() => navigate('/profile')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '14px',
                      cursor: 'pointer',
                      color: '#3b82f6',
                      fontWeight: '500'
                    }}
                  >
                    プロフィール
                  </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px 20px', maxWidth: '700px', margin: '0 auto' }}>
                  {/* Rating */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '12px', 
                      fontSize: '16px', 
                      fontWeight: '600',
                      color: '#111'
                    }}>
                      評価
                    </label>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '32px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewData({ ...reviewData, rating: star })}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer',
                            color: star <= reviewData.rating ? '#fbbf24' : '#e5e7eb',
                            padding: 0,
                            transition: 'color 0.2s'
                          }}
                        >
                          <i className={star <= reviewData.rating ? 'fa-solid fa-star' : 'fa-regular fa-star'}></i>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review comment */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontSize: '16px', 
                      fontWeight: '600',
                      color: '#111'
                    }}>
                      レビュー <span style={{ fontSize: '14px', color: '#9ca3af' }}>(必須)</span>
                    </label>
                    <textarea
                      placeholder="訪問した感想を教えてください！（最大140文字）"
                      value={reviewData.comment}
                      onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                      maxLength={140}
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '15px',
                        resize: 'none',
                        fontFamily: 'inherit',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                    <div style={{ 
                      textAlign: 'right', 
                      fontSize: '13px', 
                      color: '#9ca3af',
                      marginTop: '4px'
                    }}>
                      {reviewData.comment.length} / 140
                    </div>
                  </div>

                  {/* Review target - radio buttons */}
                  <div style={{ marginBottom: '32px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '12px', 
                      fontSize: '16px', 
                      fontWeight: '600',
                      color: '#111'
                    }}>
                      誰について
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { value: 'clean', label: '清家' },
                        { value: 'kids_friendly', label: '子ども達とキレか?' },
                        { value: 'stroller', label: 'ベビーカーで移動しやすい!' },
                        { value: 'nursing', label: '授乳室あり?' }
                      ].map(option => (
                        <label
                          key={option.value}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            padding: '12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            background: reviewData.reviewTarget === option.value ? '#eff6ff' : '#fff',
                            borderColor: reviewData.reviewTarget === option.value ? '#3b82f6' : '#e5e7eb',
                            transition: 'all 0.2s'
                          }}
                        >
                          <input
                            type="radio"
                            name="reviewTarget"
                            value={option.value}
                            checked={reviewData.reviewTarget === option.value}
                            onChange={(e) => setReviewData({ ...reviewData, reviewTarget: e.target.value })}
                            style={{
                              marginRight: '12px',
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer',
                              accentColor: '#3b82f6'
                            }}
                          />
                          <span style={{ fontSize: '15px', color: '#111' }}>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    onClick={handleSubmitReview}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginBottom: '12px'
                    }}
                  >
                    投稿する
                  </button>

                  {/* Cancel button */}
                  <button
                    onClick={() => {
                      setReviewOpen(false);
                      setReviewData({ rating: 5, comment: '', reviewTarget: '' });
                    }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: '#fff',
                      color: '#6b7280',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="review-list">
            {reviews.length === 0 ? (
              <p className="muted" style={{ marginTop: '12px' }}>まだレビューがありません</p>
            ) : (
              reviews.map((review) => (
                <div key={review.review_id} className="review-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong>{review.user_name || '匿名'}</strong>
                    <span className="muted">
                      <i className="fa-solid fa-star"></i> {review.rating}
                    </span>
                  </div>
                  <p>{review.comment}</p>
                  <span className="muted small">
                    {new Date(review.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <Tabbar />
    </div>
  );
};

export default SpotDetail;
