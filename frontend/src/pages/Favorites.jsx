import { useState, useEffect } from 'react';
import api from '../services/api';
import SpotCard from '../components/SpotCard';
import Tabbar from '../components/Tabbar';
import './Favorites.css';

const Favorites = () => {
  const [adultFavorites, setAdultFavorites] = useState([]);
  const [children, setChildren] = useState([]);
  const [kidsFavorites, setKidsFavorites] = useState({}); // { childId: [favorites] }
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('adult'); // 'adult', or childId
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch adult favorites
      const favResponse = await api.get('/favorites');
      setAdultFavorites(favResponse.data.data?.favorites || []);
      
      // Fetch children list
      const childrenResponse = await api.get('/children');
      const childrenList = childrenResponse.data.data?.children || [];
      setChildren(childrenList);
      
      // Fetch kid favorites for each child
      const kidFavs = {};
      for (const child of childrenList) {
        try {
          const kidFavResponse = await api.get(`/kids-swipe/${child.child_id}/favorites`);
          kidFavs[child.child_id] = kidFavResponse.data.data?.favorites || [];
        } catch (error) {
          console.error(`Error fetching favorites for child ${child.child_id}:`, error);
          kidFavs[child.child_id] = [];
        }
      }
      setKidsFavorites(kidFavs);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setAdultFavorites([]);
    } finally {
      setLoading(false);
    }
  };
  
  const getFilteredFavorites = () => {
    if (activeTab === 'adult') {
      return adultFavorites;
    } else {
      // activeTab is childId
      return kidsFavorites[activeTab] || [];
    }
  };
  
  const filteredFavorites = getFilteredFavorites();
  const allKidsFavoritesCount = Object.values(kidsFavorites).reduce((sum, favs) => sum + favs.length, 0);

  const handleRemoveFavorite = async (spotId, tab) => {
    if (!window.confirm('お気に入りから削除しますか？')) {
      return;
    }

    try {
      if (tab === 'adult') {
        // Remove adult favorite
        await api.delete(`/favorites/${spotId}`);
        setAdultFavorites(adultFavorites.filter(fav => fav.spot_id !== spotId));
      } else {
        // Remove kid favorite - need to delete from kid_swipe
        // We'll need a new endpoint for this
        await api.delete(`/kids-swipe/${tab}/swipe/${spotId}`);
        setKidsFavorites({
          ...kidsFavorites,
          [tab]: kidsFavorites[tab].filter(fav => fav.spot_id !== spotId)
        });
      }
      alert('お気に入りから削除しました');
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('削除に失敗しました');
    }
  };

  return (
    <div className="favorites-page">
      {/* Hero header */}
      <header className="hero">
        <div className="hero-inner">
          <div className="hero-top">
            <div className="brand">
              お気に入り
              <span className="sub">保存したスポット</span>
            </div>
            <a href="/profile" className="profile-btn">プロフィール</a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container">
        <div className="title-row">
          <h2>お気に入りリスト</h2>
          <span className="count">{filteredFavorites.length}件</span>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={`tab-btn ${activeTab === 'adult' ? 'active' : ''}`}
            onClick={() => setActiveTab('adult')}
          >
            <i className="fa-regular fa-user"></i>
            大人 ({adultFavorites.length})
          </button>
          {children.map(child => (
            <button 
              key={child.child_id}
              className={`tab-btn ${activeTab === child.child_id ? 'active' : ''}`}
              onClick={() => setActiveTab(child.child_id)}
            >
              <i className="fa-solid fa-child"></i>
              {child.name} ({kidsFavorites[child.child_id]?.length || 0})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : filteredFavorites.length === 0 ? (
          <div className="empty-state">
            <i className="fa-regular fa-heart"></i>
            <h3>お気に入りがありません</h3>
            <p>
              {activeTab === 'adult' 
                ? '気になるスポットを保存して、後で見返しましょう' 
                : 'スワイプで「すき！」したスポットが表示されます'}
            </p>
            <a href={activeTab === 'adult' ? '/' : '/kids'} className="btn-primary">
              {activeTab === 'adult' ? 'スポットを探す' : 'スワイプする'}
            </a>
          </div>
        ) : (
          <div className="favorites-grid">
            {filteredFavorites.map((favorite) => (
              <div key={favorite.swipe_id || favorite.favorite_id} className="favorite-item">
                <SpotCard spot={favorite} />
                <div className="favorite-badge">
                  {activeTab === 'adult' ? (
                    <span className="badge-adult">
                      <i className="fa-regular fa-user"></i> 大人のすき
                    </span>
                  ) : (
                    <span className="badge-kids">
                      <i className="fa-solid fa-child"></i> {children.find(c => c.child_id === activeTab)?.name}のすき
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveFavorite(favorite.spot_id, activeTab)}
                  className="remove-btn"
                  title="お気に入りから削除"
                >
                  <i className="fa-solid fa-heart"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <Tabbar />
    </div>
  );
};

export default Favorites;
