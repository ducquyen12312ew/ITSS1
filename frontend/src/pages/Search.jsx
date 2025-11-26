import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import SpotCard from '../components/SpotCard';
import Tabbar from '../components/Tabbar';
import './Search.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popularity');
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  
  // Advanced filters
  const [filters, setFilters] = useState({
    age: [],
    area: '',
    category: [],
    price: [],
    rain: false,
    open: false,
    freeParking: false,
  });

  useEffect(() => {
    performSearch();
  }, [searchParams, sortBy]);

  const performSearch = async () => {
    try {
      setLoading(true);
      
      const params = {
        keyword: searchParams.get('q') || keyword,
        sort: sortBy,
      };

      // Add filters from URL
      if (searchParams.get('age')) params.age = searchParams.get('age');
      if (searchParams.get('area')) params.area = searchParams.get('area');
      if (searchParams.get('category')) params.category = searchParams.get('category');
      if (searchParams.get('price')) params.price_range = searchParams.get('price');
      if (searchParams.get('rain')) params.indoor = 'true';
      if (searchParams.get('lat') && searchParams.get('lng')) {
        params.latitude = searchParams.get('lat');
        params.longitude = searchParams.get('lng');
      }

      const response = await api.get('/spots/search', { params });
      setSpots(response.data.data?.spots || []);
    } catch (error) {
      console.error('Error searching spots:', error);
      setSpots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (sortBy !== 'popularity') params.set('sort', sortBy);
    navigate(`/search?${params.toString()}`);
  };

  const toggleFilter = (filterKey, value) => {
    const newFilters = { ...filters };
    const current = newFilters[filterKey];
    
    if (Array.isArray(current)) {
      // Toggle array values
      const index = current.indexOf(value);
      if (index > -1) {
        newFilters[filterKey] = current.filter(v => v !== value);
      } else {
        newFilters[filterKey] = [...current, value];
      }
    } else if (typeof current === 'boolean') {
      // Toggle boolean
      newFilters[filterKey] = !current;
    } else {
      // Set string value
      newFilters[filterKey] = value;
    }
    
    setFilters(newFilters);
    
    // Auto apply filters
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (sortBy !== 'popularity') params.set('sort', sortBy);
    
    if (newFilters.age.length > 0) params.set('age', newFilters.age.join(','));
    if (newFilters.area) params.set('area', newFilters.area);
    if (newFilters.category.length > 0) params.set('category', newFilters.category.join(','));
    if (newFilters.price.length > 0) params.set('price', newFilters.price.join(','));
    if (newFilters.rain) params.set('rain', 'true');
    if (newFilters.open) params.set('open', 'true');
    if (newFilters.freeParking) params.set('parking', 'true');
    
    navigate(`/search?${params.toString()}`);
  };

  const isFilterActive = (filterKey, value) => {
    const current = filters[filterKey];
    if (Array.isArray(current)) {
      return current.includes(value);
    }
    return current === value;
  };

  const clearFilters = () => {
    setFilters({
      age: [],
      area: '',
      category: [],
      price: [],
      rain: false,
      open: false,
      freeParking: false,
    });
    
    // Auto apply - clear all filters
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (sortBy !== 'popularity') params.set('sort', sortBy);
    navigate(`/search?${params.toString()}`);
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (keyword) params.set('q', keyword);
    if (sortBy !== 'popularity') params.set('sort', sortBy);
    
    if (filters.age.length > 0) params.set('age', filters.age.join(','));
    if (filters.area) params.set('area', filters.area);
    if (filters.category.length > 0) params.set('category', filters.category.join(','));
    if (filters.price.length > 0) params.set('price', filters.price.join(','));
    if (filters.rain) params.set('rain', 'true');
    if (filters.open) params.set('open', 'true');
    if (filters.freeParking) params.set('parking', 'true');
    
    setFilterPanelOpen(false);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="search-page">
      {/* Hero header */}
      <header className="hero">
        <div className="hero-inner">
          <div className="hero-top">
            <div className="brand">
              検索
              <span className="sub">スポットを探す</span>
            </div>
            <a href="/profile" className="profile-btn">プロフィール</a>
          </div>

          <div className="search-area">
            <div className="search-row">
              <form onSubmit={handleSearchSubmit} className="search-box">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="スポット名・カテゴリで検索（公園・博物館 など）"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </form>
            </div>

            {/* Quick filters */}
            <div className="quick-filters">
              <button
                className={`filter-chip ${isFilterActive('age', '3-5') ? 'active' : ''}`}
                onClick={() => toggleFilter('age', '3-5')}
              >
                3~5歳
              </button>
              <button
                className={`filter-chip ${isFilterActive('age', '6-8') ? 'active' : ''}`}
                onClick={() => toggleFilter('age', '6-8')}
              >
                6~8歳
              </button>
              <button
                className={`filter-chip ${isFilterActive('category', '屋内') ? 'active' : ''}`}
                onClick={() => toggleFilter('category', '屋内')}
              >
                屋内
              </button>
              <button
                className={`filter-chip ${isFilterActive('category', '屋外') ? 'active' : ''}`}
                onClick={() => toggleFilter('category', '屋外')}
              >
                屋外
              </button>
              <button
                className={`filter-chip ${filters.rain ? 'active' : ''}`}
                onClick={() => toggleFilter('rain')}
              >
                雨OK
              </button>
              <button
                className={`filter-chip ${isFilterActive('price', '無料') ? 'active' : ''}`}
                onClick={() => toggleFilter('price', '無料')}
              >
                無料
              </button>
            </div>

            <div className="control-row">
              <button 
                onClick={() => setFilterPanelOpen(true)} 
                className="btn btn-outline"
              >
                詳細フィルタ
              </button>
              <div className="sort">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popularity">おすすめ順</option>
                  <option value="newest">新着順</option>
                  <option value="distance">距離順</option>
                  <option value="rating">評価順</option>
                </select>
                <i className="fa-solid fa-chevron-down chev"></i>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Results count */}
      <div className="toolbar">
        <div className="result-meta">
          {loading ? '検索中...' : `${spots.length}件のスポットが見つかりました`}
        </div>
      </div>

      {/* Results grid */}
      <main className="grid">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : spots.length === 0 ? (
          <div className="no-results">スポットが見つかりませんでした</div>
        ) : (
          spots.map(spot => (
            <SpotCard key={spot.spot_id} spot={spot} />
          ))
        )}
      </main>

      {/* Filter panel */}
      <aside className={`filter-panel ${filterPanelOpen ? 'open' : ''}`}>
        <div className="filter-header">
          <strong>詳細フィルタ</strong>
          <span className="sub-vi">Bộ lọc chi tiết</span>
          <button onClick={() => setFilterPanelOpen(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="filter-body">
          <div className="filter-group">
            <label>年齢層</label>
            <div className="pill-group">
              {['0-2', '3-5', '6-8', '9-12'].map(age => (
                <button
                  key={age}
                  className={`pill ${isFilterActive('age', age) ? 'active' : ''}`}
                  onClick={() => toggleFilter('age', age)}
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
              value={filters.area}
              onChange={(e) => setFilters({ ...filters, area: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <label>カテゴリー</label>
            <div className="pill-group">
              {['公園', '博物館', '水族館', '屋内', '屋外'].map(cat => (
                <button
                  key={cat}
                  className={`pill ${isFilterActive('category', cat) ? 'active' : ''}`}
                  onClick={() => toggleFilter('category', cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>料金</label>
            <div className="pill-group">
              {[
                { label: '無料', value: '無料' },
                { label: '~¥1,000', value: '~1000' },
                { label: '¥1,000-2,000', value: '1000-2000' },
                { label: '¥2,000~', value: '2000~' },
              ].map(price => (
                <button
                  key={price.value}
                  className={`pill ${isFilterActive('price', price.value) ? 'active' : ''}`}
                  onClick={() => toggleFilter('price', price.value)}
                >
                  {price.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>その他</label>
            <label className="check">
              <input
                type="checkbox"
                checked={filters.rain}
                onChange={() => toggleFilter('rain')}
              />
              雨OK
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={filters.open}
                onChange={() => toggleFilter('open')}
              />
              本日営業
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={filters.freeParking}
                onChange={() => toggleFilter('freeParking')}
              />
              駐車場無料
            </label>
          </div>
        </div>

        <div className="filter-footer">
          <button onClick={clearFilters} className="ghost sm">
            条件をクリア
          </button>
          <button onClick={applyFilters} className="primary sm">
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

export default Search;
