import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    // Check all fields filled
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('すべての項目を入力してください');
      return false;
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('有効なメールアドレスを入力してください');
      return false;
    }

    // Check password length
    if (formData.password.length < 8) {
      setError('パスワードは8文字以上にしてください');
      return false;
    }

    // Check passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return false;
    }

    // Check terms agreement
    if (!formData.agreeToTerms) {
      setError('利用規約に同意してください');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    const result = await register({
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      password: formData.password,
    });
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || '登録に失敗しました');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <div className="header-container">
          <div className="logo">コドモ週末ナビ</div>
          <div className="header-buttons">
            <Link to="/login" className="login-btn">ログイン</Link>
            <Link to="/register" className="signup-btn">新規登録</Link>
          </div>
        </div>
      </header>

      <main className="auth-main">
        <div className="form-container">
          <h1>新規登録</h1>
          <p className="form-subtitle">アカウントを作成してください</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="firstName">名<span className="required">*</span></label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="太郎"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">姓<span className="required">*</span></label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="山田"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">メールアドレス<span className="required">*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">パスワード<span className="required">*</span></label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="8文字以上"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">パスワード確認<span className="required">*</span></label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="パスワードを再入力"
                disabled={loading}
              />
            </div>
            
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="agreeToTerms">
                利用規約とプライバシーポリシーに同意します<span className="required">*</span>
              </label>
            </div>
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? '登録中...' : '登録'}
            </button>
          </form>
          
          <p className="form-footer">
            既にアカウントをお持ちの方は <Link to="/login">ログイン</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
