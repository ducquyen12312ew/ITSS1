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
  
  // Advanced filters for panel
  const [advancedFilters, setAdvancedFilters] = useState({
    age: [],
    area: '',
    category: [],
    price: [],
    rating: [],
    open: false,
    freeParking: false,
  });

  // Quick filter chips
  const quickFilters = [
    { key: 'age', value: '3-5歳', label: '3〜5歳' },
    { key: 'age', value: '6-8歳', label: '6〜8歳' },
    { key: 'category', value: '室内', label: '屋内' },
    { key: 'category', value: '屋外', label: '屋外' },
    { key: 'category', value: '雨OK', label: '雨OK' },
    { key: 'category', value: '無料', label: '無料' },
  ];

  useEffect(() => {
    fetchSpots();
    
    // Load filters from URL if navigating back from search
    const params = new URLSearchParams(window.location.search);
    const urlFilters = {
      age: [],
      area: '',
      category: [],
      price: [],
      rating: [],
      open: false,
      freeParking: false,
    };
    
    if (params.get('age')) urlFilters.age = params.get('age').split(',');
    if (params.get('area')) urlFilters.area = params.get('area');
    if (params.get('category')) urlFilters.category = params.get('category').split(',');
    if (params.get('price')) urlFilters.price = params.get('price').split(',');
    if (params.get('rating')) urlFilters.rating = params.get('rating').split(',');
    if (params.get('open')) urlFilters.open = true;
    if (params.get('parking')) urlFilters.freeParking = true;
    
    setAdvancedFilters(urlFilters);
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

  const handleQuickFilterClick = (key, value) => {
    // Navigate to search page with the selected filter
    const params = new URLSearchParams();
    params.set(key, value);
    navigate(`/search?${params.toString()}`);
  };

  const isFilterActive = (key, value) => {
    return false; // Quick filters don't have active state on home page
  };

  const toggleAdvancedFilter = (filterKey, value) => {
    const newFilters = { ...advancedFilters };
    const current = newFilters[filterKey];
    
    if (Array.isArray(current)) {
      const index = current.indexOf(value);
      if (index > -1) {
        newFilters[filterKey] = current.filter(v => v !== value);
      } else {
        newFilters[filterKey] = [...current, value];
      }
    } else if (typeof current === 'boolean') {
      newFilters[filterKey] = !current;
    } else {
      newFilters[filterKey] = value;
    }
    
    setAdvancedFilters(newFilters);
  };

  const isAdvancedFilterActive = (filterKey, value) => {
    const current = advancedFilters[filterKey];
    if (Array.isArray(current)) {
      return current.includes(value);
    }
    return current === value;
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      age: [],
      area: '',
      category: [],
      price: [],
      rain: false,
      open: false,
      freeParking: false,
    });
  };

  const applyAdvancedFilters = () => {
    const params = new URLSearchParams();
    
    if (searchKeyword) params.set('q', searchKeyword);
    
    if (advancedFilters.age.length > 0) params.set('age', advancedFilters.age.join(','));
    if (advancedFilters.area) params.set('area', advancedFilters.area);
    if (advancedFilters.category.length > 0) params.set('category', advancedFilters.category.join(','));
    if (advancedFilters.price.length > 0) params.set('price', advancedFilters.price.join(','));
    if (advancedFilters.rating.length > 0) params.set('rating', advancedFilters.rating.join(','));
    if (advancedFilters.open) params.set('open', 'true');
    if (advancedFilters.freeParking) params.set('parking', 'true');
    
    setFilterPanelOpen(false);
    navigate(`/search?${params.toString()}`);
  };

  const handleNearbySearch = () => {
    // Request location and search nearby
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          navigate(`/search?lat=${latitude}&lng=${longitude}&sort=distance`);
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
                  className="chip"
                  onClick={() => handleQuickFilterClick(filter.key, filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="action-row">
  <button
    onClick={() => setFilterPanelOpen(true)}
    className="btn btn-outline font-bold"
  >
    <i className="fa-solid fa-filter mr-1"></i> 詳細フィルタ
  </button>

  <button onClick={handleNearbySearch} className="ghost font-bold">
    <i className="fa-solid fa-location-crosshairs mr-1"></i> 現在地から探す
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

      {/* Filter panel */}
      <aside className={`filter-panel ${filterPanelOpen ? 'open' : ''}`}>
        <div className="filter-header">
          <strong>詳細フィルタ</strong>
          <button onClick={() => setFilterPanelOpen(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="filter-body">
          <div className="filter-group">
            <label>年齢層</label>
            <div className="pill-group">
              {['0-2歳', '3-5歳', '6-8歳', '9-12歳'].map(age => (
                <button
                  key={age}
                  className={`pill ${isAdvancedFilterActive('age', age) ? 'active' : ''}`}
                  onClick={() => toggleAdvancedFilter('age', age)}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>エリア</label>
            <input
              className="field"
              type="text"
              placeholder="区・駅・市…"
              value={advancedFilters.area}
              onChange={(e) => setAdvancedFilters({ ...advancedFilters, area: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <label>カテゴリー</label>
            <div className="pill-group">
              {['公園', '博物館', '遊び場', '動物園', 'プール', '図書館', '科学'].map(cat => (
                <button
                  key={cat}
                  className={`pill ${isAdvancedFilterActive('category', cat) ? 'active' : ''}`}
                  onClick={() => toggleAdvancedFilter('category', cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>室内・屋外</label>
            <div className="pill-group">
              {['室内', '屋外', '雨OK'].map(type => (
                <button
                  key={type}
                  className={`pill ${isAdvancedFilterActive('category', type) ? 'active' : ''}`}
                  onClick={() => toggleAdvancedFilter('category', type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>料金</label>
            <div className="pill-group">
              {[
                { label: '無料', value: '無料' },
                { label: '~¥1,000', value: '1000円以下' },
                { label: '¥1,000-3,000', value: '1000-3000円' },
                { label: '¥3,000-5,000', value: '3000-5000円' },
                { label: '¥5,000~', value: '5000円以上' },
              ].map(price => (
                <button
                  key={price.value}
                  className={`pill ${isAdvancedFilterActive('price', price.value) ? 'active' : ''}`}
                  onClick={() => toggleAdvancedFilter('price', price.value)}
                >
                  {price.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>評価</label>
            <div className="pill-group">
              {[
                { label: '★ 4.5+', value: '4.5' },
                { label: '★ 4.0+', value: '4.0' },
                { label: '★ 3.5+', value: '3.5' },
                { label: '★ 3.0+', value: '3.0' },
              ].map(rating => (
                <button
                  key={rating.value}
                  className={`pill ${isAdvancedFilterActive('rating', rating.value) ? 'active' : ''}`}
                  onClick={() => toggleAdvancedFilter('rating', rating.value)}
                >
                  {rating.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="filter-footer">
          <button onClick={clearAdvancedFilters} className="ghost sm">
            条件をクリア
          </button>
          <button onClick={applyAdvancedFilters} className="primary sm">
            この条件で絞り込む
          </button>
        </div>
      </aside>

      {/* Scrim overlay */}
      {filterPanelOpen && (
        <div 
          className="scrim open" 
          onClick={() => setFilterPanelOpen(false)}
        ></div>
      )}

      {/* Bottom navigation */}
      <Tabbar />
    </div>
  );
};

export default Home;
