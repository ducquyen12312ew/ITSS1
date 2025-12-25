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
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recommended');
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  
  // Advanced filters
  const [filters, setFilters] = useState({
    age: [],
    area: '',
    category: [],
    price: [],
    rating: [],
    open: false,
    freeParking: false,
  });

  // All available tags from database
  // No need for allTags object, using inline arrays matching database

  useEffect(() => {
    // Always use ĐHBK Hanoi coordinates
    setUserLocation({ lat: 21.0054, lng: 105.8433 });
  }, []);

  useEffect(() => {
    if (userLocation) {
      performSearch();
    }
    
    // Load current filters from URL to display in filter panel
    loadFiltersFromURL();
  }, [searchParams, sortBy, userLocation]);
  
  const loadFiltersFromURL = () => {
    const urlFilters = {
      age: [],
      area: '',
      category: [],
      price: [],
      rating: [],
      open: false,
      freeParking: false,
    };
    
    if (searchParams.get('age')) {
      urlFilters.age = searchParams.get('age').split(',');
    }
    if (searchParams.get('area')) {
      urlFilters.area = searchParams.get('area');
    }
    if (searchParams.get('category')) {
      urlFilters.category = searchParams.get('category').split(',');
    }
    if (searchParams.get('price')) {
      urlFilters.price = searchParams.get('price').split(',');
    }
    if (searchParams.get('rating')) {
      urlFilters.rating = searchParams.get('rating').split(',');
    }
    if (searchParams.get('open')) {
      urlFilters.open = true;
    }
    if (searchParams.get('parking')) {
      urlFilters.freeParking = true;
    }
    
    setFilters(urlFilters);
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      
      const params = {
        keyword: searchParams.get('q') || keyword,
        sort: searchParams.get('sort') || sortBy,
      };

      // Add filters from URL
      if (searchParams.get('age')) params.age = searchParams.get('age');
      if (searchParams.get('area')) params.area = searchParams.get('area');
      if (searchParams.get('category')) params.category = searchParams.get('category');
      if (searchParams.get('price')) params.price = searchParams.get('price');
      if (searchParams.get('rating')) params.rating = searchParams.get('rating');
      
      // Location-based search
      if (searchParams.get('lat') && searchParams.get('lng')) {
        // Use location from URL if provided
        params.lat = searchParams.get('lat');
        params.lng = searchParams.get('lng');
        // Force distance sort for location-based search
        if (!searchParams.get('sort')) {
          params.sort = 'distance';
          setSortBy('distance');
        }
      } else if (params.sort === 'distance' && userLocation) {
        // If sorting by distance but no URL location, use current location
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }

      console.log('🔍 Frontend sending params:', params);
      console.log('📍 URL searchParams.sort:', searchParams.get('sort'));
      console.log('📍 State sortBy:', sortBy);

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
    if (sortBy !== 'recommended') params.set('sort', sortBy);
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
    if (sortBy !== 'recommended') params.set('sort', sortBy);
    
    if (newFilters.age.length > 0) params.set('age', newFilters.age.join(','));
    if (newFilters.area) params.set('area', newFilters.area);
    if (newFilters.category.length > 0) params.set('category', newFilters.category.join(','));
    if (newFilters.price.length > 0) params.set('price', newFilters.price.join(','));
    if (newFilters.rating.length > 0) params.set('rating', newFilters.rating.join(','));
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
      rating: [],
      open: false,
      freeParking: false,
    });
    
    // Auto apply - clear all filters
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (sortBy !== 'recommended') params.set('sort', sortBy);
    navigate(`/search?${params.toString()}`);
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (keyword) params.set('q', keyword);
    if (sortBy !== 'recommended') params.set('sort', sortBy);
    
    if (filters.age.length > 0) params.set('age', filters.age.join(','));
    if (filters.area) params.set('area', filters.area);
    if (filters.category.length > 0) params.set('category', filters.category.join(','));
    if (filters.price.length > 0) params.set('price', filters.price.join(','));
    if (filters.rating.length > 0) params.set('rating', filters.rating.join(','));
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

            {/* Quick filter chips */}
            <div className="quick-filters">
              <button
                className={`filter-chip ${filters.age.includes('3-5歳') ? 'active' : ''}`}
                onClick={() => toggleFilter('age', '3-5歳')}
              >
                3~5歳
              </button>
              <button
                className={`filter-chip ${filters.age.includes('6-8歳') ? 'active' : ''}`}
                onClick={() => toggleFilter('age', '6-8歳')}
              >
                6~8歳
              </button>
              <button
                className={`filter-chip ${filters.category.includes('室内') ? 'active' : ''}`}
                onClick={() => toggleFilter('category', '室内')}
              >
                室内
              </button>
              <button
                className={`filter-chip ${filters.category.includes('屋外') ? 'active' : ''}`}
                onClick={() => toggleFilter('category', '屋外')}
              >
                屋外
              </button>
              <button
                className={`filter-chip ${filters.category.includes('雨OK') ? 'active' : ''}`}
                onClick={() => toggleFilter('category', '雨OK')}
              >
                雨OK
              </button>
              <button
                className={`filter-chip ${filters.category.includes('無料') ? 'active' : ''}`}
                onClick={() => toggleFilter('category', '無料')}
              >
                無料
              </button>
              <button
                className={`filter-chip ${filters.open ? 'active' : ''}`}
                onClick={() => toggleFilter('open', true)}
              >
                <i className="fa-solid fa-clock" style={{ marginRight: '4px' }}></i>
                今日営業中
              </button>
            </div>

           <div className="control-row">

  <button
    onClick={() => setFilterPanelOpen(true)}
    className="btn btn-outline font-bold"
  >
    <i className="fa-solid fa-filter mr-1"></i> 詳細フィルタ
  </button>

  <div className="sort font-bold">
    <select 
      value={sortBy}
      onChange={(e) => {
        const newSort = e.target.value;
        setSortBy(newSort);
        
        // Update URL with new sort parameter
        const params = new URLSearchParams(searchParams);
        if (newSort !== 'recommended') {
          params.set('sort', newSort);
        } else {
          params.delete('sort');
        }
        navigate(`/search?${params.toString()}`);
      }}
    >
      <option value="recommended">おすすめ順</option>
      <option value="distance">距離が近い順</option>
      <option value="rating">評価が高い順</option>
      <option value="age">年齢適合順</option>
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
            <div className="pill-group" style={{ flexWrap: 'wrap', gap: '8px' }}>
              {['公園', '博物館', '遊び場', '動物園', 'プール', '図書館', '科学'].map(cat => (
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
            <label>室内・屋外</label>
            <div className="pill-group" style={{ flexWrap: 'wrap', gap: '8px' }}>
              {['室内', '屋外', '雨OK'].map(type => (
                <button
                  key={type}
                  className={`pill ${isFilterActive('category', type) ? 'active' : ''}`}
                  onClick={() => toggleFilter('category', type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>施設</label>
            <div className="pill-group" style={{ flexWrap: 'wrap', gap: '8px' }}>
              {['駐車場', '授乳室', '医療施設', 'レストラン', '喫煙所'].map(facility => (
                <button
                  key={facility}
                  className={`pill ${isFilterActive('category', facility) ? 'active' : ''}`}
                  onClick={() => toggleFilter('category', facility)}
                >
                  {facility}
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
                  className={`pill ${isFilterActive('price', price.value) ? 'active' : ''}`}
                  onClick={() => toggleFilter('price', price.value)}
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
                  className={`pill ${isFilterActive('rating', rating.value) ? 'active' : ''}`}
                  onClick={() => toggleFilter('rating', rating.value)}
                >
                  {rating.label}
                </button>
              ))}
            </div>
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
