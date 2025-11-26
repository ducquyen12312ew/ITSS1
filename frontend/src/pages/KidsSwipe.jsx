import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Tabbar from '../components/Tabbar';
import './KidsSwipe.css';

const KidsSwipe = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [spots, setSpots] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [swipeHistory, setSwipeHistory] = useState([]);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await api.get('/children');
      const childrenList = response.data.data?.children || [];
      setChildren(childrenList);
      
      // Check if child_id in URL query
      const childId = searchParams.get('child');
      if (childId) {
        const selectedChild = childrenList.find(c => c.child_id === parseInt(childId));
        if (selectedChild) {
          handleSelectChild(selectedChild);
          return;
        }
      }
      
      // If only one child, auto-select
      if (childrenList.length === 1) {
        handleSelectChild(childrenList[0]);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChild = async (child) => {
    setSelectedChild(child);
    setLoading(true);
    await fetchSpots(child);
    setLoading(false);
  };

  const fetchSpots = async (child) => {
    try {
      const response = await api.get('/spots/search', {
        params: { 
          limit: 50, 
          sort: 'recommended',
          min_age: child.age,
          max_age: child.age
        }
      });
      setSpots(response.data.data?.spots || []);
      setCurrentIndex(0);
      setSwipeHistory([]);
    } catch (error) {
      console.error('Error fetching spots:', error);
      setSpots([]);
    }
  };

  const handleLike = async () => {
    const spot = spots[currentIndex];
    if (!spot) return;

    try {
      // Save kid swipe as LIKE
      await api.post(`/kids-swipe/${selectedChild.child_id}/swipe`, { 
        spot_id: spot.spot_id,
        action: 'LIKE'
      });
      
      // Record swipe history
      setSwipeHistory([...swipeHistory, { spot_id: spot.spot_id, action: 'like' }]);
      
      // Move to next
      setCurrentIndex(currentIndex + 1);
    } catch (error) {
      console.error('Error saving kid swipe:', error);
      // Still move to next even if save fails
      setSwipeHistory([...swipeHistory, { spot_id: spot.spot_id, action: 'like' }]);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = async () => {
    const spot = spots[currentIndex];
    if (!spot) return;

    try {
      // Save kid swipe as SKIP
      await api.post(`/kids-swipe/${selectedChild.child_id}/swipe`, { 
        spot_id: spot.spot_id,
        action: 'SKIP'
      });
      
      // Record swipe history
      setSwipeHistory([...swipeHistory, { spot_id: spot.spot_id, action: 'skip' }]);
      
      // Move to next
      setCurrentIndex(currentIndex + 1);
    } catch (error) {
      console.error('Error saving kid swipe:', error);
      // Still move to next even if save fails
      setSwipeHistory([...swipeHistory, { spot_id: spot.spot_id, action: 'skip' }]);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleUndo = () => {
    if (swipeHistory.length === 0) return;
    
    // Remove last action from history
    const newHistory = [...swipeHistory];
    newHistory.pop();
    setSwipeHistory(newHistory);
    
    // Go back one card
    setCurrentIndex(currentIndex - 1);
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    setDragOffset(0);
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setDragOffset(e.movementX);
  };

  const handleMouseUp = () => {
    if (!dragging) return;
    
    setDragging(false);
    
    // If dragged far enough, trigger action
    if (Math.abs(dragOffset) > 100) {
      if (dragOffset > 0) {
        handleLike();
      } else {
        handleSkip();
      }
    }
    
    setDragOffset(0);
  };

  const handleTouchStart = (e) => {
    setDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e) => {
    if (!dragging || !e.touches[0]) return;
    const touch = e.touches[0];
    const cardElement = e.currentTarget;
    const rect = cardElement.getBoundingClientRect();
    setDragOffset(touch.clientX - rect.left - rect.width / 2);
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  // Redirect to kids page if no child selected
  if (!selectedChild) {
    navigate('/kids');
    return null;
  }

  if (loading) {
    return (
      <div className="kids-swipe-page">
        <div className="loading">Loading...</div>
        <Tabbar />
      </div>
    );
  }

  const currentSpot = spots[currentIndex];
  const progress = spots.length > 0 ? ((currentIndex / spots.length) * 100).toFixed(0) : 0;

  if (!currentSpot || currentIndex >= spots.length) {
    return (
      <div className="kids-swipe-page">
        <header className="hero">
          <div className="hero-inner">
            <div className="hero-top">
              <div className="brand">
                子供スワイプ
                <span className="sub">遊び感覚で選ぼう</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container">
          <div className="completion-screen">
            <div className="completion-icon">
              <i className="fa-solid fa-check-circle"></i>
            </div>
            <h2>全部見終わったよ！</h2>
            <p>気に入ったスポットは「お気に入り」に保存されています</p>
            <div className="completion-stats">
              <div className="stat-item">
                <div className="stat-value">{swipeHistory.filter(h => h.action === 'like').length}</div>
                <div className="stat-label">すき！</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{swipeHistory.filter(h => h.action === 'skip').length}</div>
                <div className="stat-label">スキップ</div>
              </div>
            </div>
            <div className="completion-actions">
              <button onClick={() => navigate('/favorites')} className="btn-primary">
                お気に入りを見る
              </button>
              <button onClick={() => navigate('/kids')} className="btn-secondary">
                子供ページに戻る
              </button>
              <button onClick={() => { setCurrentIndex(0); setSwipeHistory([]); fetchSpots(selectedChild); }} className="btn-secondary">
                もう一度遊ぶ
              </button>
            </div>
          </div>
        </main>

        <Tabbar />
      </div>
    );
  }

  return (
    <div className="kids-swipe-page">
      {/* Header */}
      <header className="swipe-header">
        <div className="header-left">
          <h1 className="header-title">子供スワイプ画面</h1>
        </div>
        <div className="header-right">
          <button onClick={() => navigate('/profile')} className="profile-link">
            プロフィール
          </button>
        </div>
      </header>

      {/* Main Card */}
      <main className="swipe-container">
        <div
          className={`swipe-card ${dragging ? 'dragging' : ''}`}
          style={{ 
            transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.1}deg)`,
            opacity: Math.max(0.5, 1 - Math.abs(dragOffset) / 300)
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Card Counters */}
          <div className="card-counters">
            <div className="counter-badge like-counter">
              すき<br/>{swipeHistory.filter(h => h.action === 'like').length}
            </div>
            <div className="counter-badge skip-counter">
              いや<br/>{swipeHistory.filter(h => h.action === 'skip').length}
            </div>
          </div>

          <div className="card-image">
            <img
              src={currentSpot.main_image || currentSpot.image_url || 'https://via.placeholder.com/400x500?text=No+Image'}
              alt={currentSpot.name}
            />
          </div>
          <div className="card-info">
            <h2 className="spot-name">{currentSpot.name}</h2>
            <p className="spot-description">
              {currentSpot.description?.substring(0, 100) || '雨の日でも安心な室内遊び場です。大型遊具とボールプール、トランポリンなどこどもが思いっきり体を動かせる設備が充実しています。'}{currentSpot.description?.length > 100 ? '...' : ''}
            </p>
            <div className="spot-meta">
              {currentSpot.min_age && currentSpot.max_age && (
                <span className="meta-tag">
                  {currentSpot.min_age}〜{currentSpot.max_age}歳
                </span>
              )}
              {currentSpot.price_range && (
                <span className="meta-tag">
                  {currentSpot.price_range}
                </span>
              )}
              {currentSpot.average_rating && (
                <span className="meta-tag">
                  ★{Number(currentSpot.average_rating).toFixed(1)}
                </span>
              )}
            </div>
            {currentSpot.tags && currentSpot.tags.length > 0 && (
              <div className="spot-tags">
                {(Array.isArray(currentSpot.tags) ? currentSpot.tags : currentSpot.tags.split(',')).slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="tag">{String(tag).trim()}</span>
                ))}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="card-actions">
              <button
                onClick={(e) => { e.stopPropagation(); handleSkip(); }}
                className="action-btn-swipe skip-btn-swipe"
                title="スキップ"
              >
                <i className="fa-solid fa-xmark"></i> スキップ
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleLike(); }}
                className="action-btn-swipe like-btn-swipe"
                title="すき！"
              >
                <i className="fa-solid fa-heart"></i> すき！
              </button>
            </div>
          </div>
        </div>

        {/* Card Progress */}
        <div className="card-progress">
          {currentIndex + 1} / {spots.length}
        </div>
      </main>

      {/* Info Modal */}
      {showInfoModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowInfoModal(false)}></div>
          <div className="info-modal">
            <div className="modal-header">
              <h3>{currentSpot.name}</h3>
              <button onClick={() => setShowInfoModal(false)} className="close-modal-btn">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-image">
                <img
                  src={currentSpot.main_image || currentSpot.image_url || 'https://via.placeholder.com/400x300'}
                  alt={currentSpot.name}
                />
              </div>
              
              <div className="modal-section">
                <h4><i className="fa-solid fa-info-circle"></i> 施設について</h4>
                <p>{currentSpot.description || '情報がありません'}</p>
              </div>

              {currentSpot.address && (
                <div className="modal-section">
                  <h4><i className="fa-solid fa-location-dot"></i> 住所</h4>
                  <p>{currentSpot.address}</p>
                </div>
              )}

              {currentSpot.operating_hours && (
                <div className="modal-section">
                  <h4><i className="fa-regular fa-clock"></i> 営業時間</h4>
                  <p>{typeof currentSpot.operating_hours === 'string' ? currentSpot.operating_hours : '情報がありません'}</p>
                </div>
              )}

              {currentSpot.facilities && (
                <div className="modal-section">
                  <h4><i className="fa-solid fa-toilet"></i> 設備</h4>
                  <div className="facility-tags">
                    {(typeof currentSpot.facilities === 'string' 
                      ? currentSpot.facilities.split(',')
                      : Array.isArray(currentSpot.facilities) 
                      ? currentSpot.facilities 
                      : []
                    ).map((fac, idx) => (
                      <span key={idx} className="facility-tag">{String(fac).trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button onClick={() => {
                  setShowInfoModal(false);
                  navigate(`/spot/${currentSpot.spot_id}`);
                }} className="btn-detail">
                  詳細ページへ
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom navigation */}
      <Tabbar />
    </div>
  );
};

export default KidsSwipe;
