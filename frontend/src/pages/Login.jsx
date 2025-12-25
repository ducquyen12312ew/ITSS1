import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const result = await login(email, password);
    
    if (result.success) {
      // Redirect về trang trước đó hoặc home page
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'ログインに失敗しました');
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
          <h1>ログイン</h1>
          <p className="form-subtitle">アカウントにログインしてください</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">メールアドレス<span className="required">*</span></label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">パスワード<span className="required">*</span></label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8文字以上"
                disabled={loading}
              />
            </div>
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
          
          <p className="form-footer">
            アカウントをお持ちでない方は <Link to="/register">新規登録</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
