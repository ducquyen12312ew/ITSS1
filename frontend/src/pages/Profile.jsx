import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Tabbar from '../components/Tabbar';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    newPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        newPassword: ''
      });
    }
  }, [user]);

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      newPassword: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('すべての項目を入力してください');
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        name: formData.name,
        email: formData.email
      };

      const response = await api.put('/auth/profile', updateData);
      
      if (response.data.success) {
        updateUser(response.data.data);
        setIsEditing(false);
        alert('プロフィールを更新しました');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert(error.response?.data?.message || 'プロフィールの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <button className="profile-back-btn" onClick={() => navigate(-1)}>
          プロフィール
        </button>
      </header>

      {/* Main Content */}
      <main className="profile-container">
        <div className="profile-card">
          <h1 className="profile-title">プロフィール</h1>
          <p className="profile-subtitle">あなたの情報を編集</p>

          {/* Avatar Section */}
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              <span className="avatar-text">{user?.name?.[0] || 'V'}</span>
            </div>
            <h2 className="user-name">{user?.name}</h2>
            <p className="user-subtitle">安全に情報を更新できます</p>
          </div>

          {/* Info Section - Read Only */}
          <div className="profile-form">
            <div className="form-group">
              <label className="form-label">名前</label>
              <div className="form-value">{formData.name || '未設定'}</div>
            </div>

            <div className="form-group">
              <label className="form-label">メールアドレス</label>
              <div className="form-value">{formData.email || '未設定'}</div>
            </div>

            <div className="form-group">
              <label className="form-label">ロール</label>
              <div className="form-value">
                <span className={`role-badge ${user?.role?.toLowerCase()}`}>
                  {user?.role === 'ADMIN' ? '管理者' : 'ユーザー'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="profile-footer">
          <p className="footer-text">
            困ったときは、いつでもサポートにご連絡ください
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <Tabbar />
    </div>
  );
};

export default Profile;
