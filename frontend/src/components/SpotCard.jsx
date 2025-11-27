import { Link } from 'react-router-dom';
import './SpotCard.css';

const SpotCard = ({ spot }) => {
  const {
    spot_id,
    name,
    area,
    distance,
    average_rating,
    review_count,
    min_age,
    max_age,
    price_range,
    image_url,
    main_image,
    tags = [],
    is_nearby = false,
    is_open_today = false,
    is_rain_ok = false,
    is_trending = false,
    is_free = false,
  } = spot;

  // Get price from tags
  const getPriceTag = () => {
    const priceTags = ['無料', '1000円以下', '1000-3000円', '3000-5000円', '5000円以上'];
    const priceTag = tags.find(tag => priceTags.includes(tag));
    return priceTag || '料金不明';
  };

  // Format age range
  const formatAge = () => {
    if (!min_age && !max_age) return '全年齢';
    if (min_age === max_age) return `${min_age}歳`;
    return `${min_age || 0}〜${max_age || 0}歳`;
  };

  return (
    <Link to={`/spot/${spot_id}`} className="card">
      <div className="card-media">
        <img 
          src={main_image || image_url || 'https://via.placeholder.com/400x300?text=No+Image'} 
          alt={name}
        />
        <div className="badge-stack">
          {is_nearby && <span className="badge blue">近く</span>}
          {is_trending && <span className="badge blue">話題</span>}
          {is_open_today && <span className="badge green">本日営業</span>}
          {is_rain_ok && <span className="badge">雨OK</span>}
          {is_free && <span className="badge green">無料</span>}
        </div>
      </div>
      <div className="card-body">
        <h3 className="title">{name}</h3>
        <div className="meta">
          {distance && (
            <span className="m">
              <i className="fa-solid fa-location-dot"></i> {distance}km
            </span>
          )}
          {average_rating && (
            <span className="m">
              <i className="fa-solid fa-star"></i> {Number(average_rating).toFixed(1)} ({review_count || 0})
            </span>
          )}
        </div>
        <div className="tags">
          <span className="tag">{formatAge()}</span>
          {area && <span className="tag">{area}</span>}
          <span className="tag">{getPriceTag()}</span>
        </div>
        {tags.length > 0 && (
          <div className="tags thin">
            {tags
              .filter(tag => {
                // Filter out age, price, indoor/outdoor, and area tags
                const excludeTags = ['0-2歳', '3-5歳', '6-8歳', '9-12歳', '13-18歳', 
                                     '無料', '1000円以下', '1000-3000円', '3000-5000円', '5000円以上',
                                     '室内', '屋外', '雨OK'];
                return !excludeTags.includes(tag);
              })
              .slice(0, 3)
              .map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default SpotCard;
