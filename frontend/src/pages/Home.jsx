import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import SpotCard from '../components/SpotCard';
import Tabbar from '../components/Tabbar';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [spots, setSpots] = useState({
    nearby: [],
    popular: [],
    rainy: [],
  });
  const [loading, setLoading] = useState(true);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // Quick filter chips
  const quickFilters = [
    { key: 'age', value: '3-5', label: '3〜5歳' },
    { key: 'age', value: '6-8', label: '6〜8歳' },
    { key: 'type', value: '屋内', label: '屋内' },
    { key: 'type', value: '屋外', label: '屋外' },
    { key: 'rain', value: 'true', label: '雨OK' },
    { key: 'free', value: 'true', label: '無料' },
  ];

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      setLoading(true);
      
      // Fetch all spots
      const response = await api.get('/spots/search', {
        params: { limit: 20 }
      });
      
      const allSpots = response.data.data?.spots || [];
      
      // Categorize spots
      const nearby = allSpots.filter(s => s.distance && s.distance < 5).slice(0, 3);
      const popular = allSpots
        .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
        .slice(0, 4);
      const rainy = allSpots.filter(s => {
        const tags = s.tags || [];
        const tagsStr = Array.isArray(tags) ? tags.join(',') : String(tags);
        return tagsStr.includes('雨OK') || tagsStr.includes('室内');
      }).slice(0, 3);
      
      setSpots({
        nearby: nearby.length > 0 ? nearby : allSpots.slice(0, 3),
        popular,
        rainy: rainy.length > 0 ? rainy : allSpots.slice(0, 3),
      });
    } catch (error) {
      console.error('Error fetching spots:', error);
      // Set empty if error
      setSpots({ nearby: [], popular: [], rainy: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchKeyword)}`);
    }
  };

  const toggleQuickFilter = (key, value) => {
    const filterKey = `${key}_${value}`;
    const newFilters = { ...selectedFilters };
    
    if (newFilters[filterKey]) {
      delete newFilters[filterKey];
    } else {
      newFilters[filterKey] = { key, value };
    }
    
    setSelectedFilters(newFilters);
  };

  const isFilterActive = (key, value) => {
    return !!selectedFilters[`${key}_${value}`];
  };

  const applyFilters = () => {
    // Build query string from selected filters
    const params = new URLSearchParams();
    
    Object.values(selectedFilters).forEach(filter => {
      params.append(filter.key, filter.value);
    });
    
    if (searchKeyword) {
      params.append('q', searchKeyword);
    }
    
    navigate(`/search?${params.toString()}`);
  };

  const handleNearbySearch = () => {
    // Request location and search nearby
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          navigate(`/search?lat=${latitude}&lng=${longitude}`);
        },
        (error) => {
          alert('位置情報の取得に失敗しました');
        }
      );
    } else {
      alert('お使いのブラウザは位置情報に対応していません');
    }
  };

  return (
    <div className="home-page">
      {/* Hero header */}
      <header className="hero">
        <div className="hero-inner">
          <div className="hero-top">
            <div className="brand">
              週末、どこへ行く？
              <span className="sub">子供と一緒に楽しめるスポットを検索</span>
            </div>
            <Link to="/profile" className="profile-btn">プロフィール</Link>
          </div>

          {/* Search box */}
          <div className="search-row">
            <form onSubmit={handleSearch} className="search-box">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="スポット名・エリア・カテゴリで検索（屋内遊び場 など）"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </form>
          </div>

          {/* Quick filter chips */}
          <div className="chip-row">
            <div className="chip-group">
              {quickFilters.map((filter, index) => (
                <button
                  key={index}
                  className={`chip ${isFilterActive(filter.key, filter.value) ? 'active' : ''}`}
                  onClick={() => toggleQuickFilter(filter.key, filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="action-row">
            <button onClick={applyFilters} className="primary">
              条件で探す
            </button>
            <button onClick={handleNearbySearch} className="ghost">
              <i className="fa-solid fa-location-crosshairs"></i> 現在地から探す
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {/* Nearby spots */}
            {spots.nearby.length > 0 && (
              <section className="section">
                <div className="section-title">
                  <i className="dot"></i>
                  <span>あなたの近くのおすすめ</span>
                </div>
                <div className="card-grid">
                  {spots.nearby.map((spot) => (
                    <SpotCard key={spot.spot_id} spot={{ ...spot, is_nearby: true }} />
                  ))}
                </div>
              </section>
            )}

            {/* Popular this weekend */}
            {spots.popular.length > 0 && (
              <section className="section">
                <div className="section-title">
                  <i className="trend"></i>
                  <span>今週末に人気</span>
                </div>
                <div className="card-grid">
                  {spots.popular.map((spot) => (
                    <SpotCard key={spot.spot_id} spot={{ ...spot, is_trending: true }} />
                  ))}
                </div>
              </section>
            )}

            {/* Rainy day spots */}
            {spots.rainy.length > 0 && (
              <section className="section">
                <div className="section-title">
                  <i className="rain"></i>
                  <span>雨の日におすすめ</span>
                </div>
                <div className="card-grid">
                  {spots.rainy.map((spot) => (
                    <SpotCard key={spot.spot_id} spot={{ ...spot, is_rain_ok: true }} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Bottom navigation */}
      <Tabbar />
    </div>
  );
};

export default Home;
