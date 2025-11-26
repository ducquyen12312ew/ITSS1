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
    firstName: '',
    lastName: '',
    email: '',
    newPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        newPassword: ''
      });
    }
  }, [user]);

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      newPassword: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      alert('すべての項目を入力してください');
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
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
              <span className="avatar-text">{user?.firstName?.[0] || 'V'}</span>
            </div>
            <h2 className="user-name">{user?.firstName} {user?.lastName}</h2>
            <p className="user-subtitle">安全に情報を更新できます</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label className="form-label">名前</label>
              <input
                type="text"
                className="form-input"
                value={`${formData.firstName} ${formData.lastName}`}
                onChange={(e) => {
                  const names = e.target.value.split(' ');
                  setFormData({ 
                    ...formData, 
                    firstName: names[0] || '',
                    lastName: names.slice(1).join(' ') || ''
                  });
                }}
                disabled={!isEditing}
                placeholder="Bui Quoc Bao"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">メールアドレス</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                placeholder="ngduc4897@gmail.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">新しいパスワード (任意)</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  disabled={!isEditing}
                  placeholder="------"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={!isEditing}
                >
                  {showPassword ? '👁️' : '👁️'}
                </button>
              </div>
              <small className="form-hint">空欄の場合は変更されません</small>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="btn-edit-profile"
                >
                  <i className="fa-solid fa-pen"></i>
                  変更する
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={loading}
                  >
                    <i className="fa-solid fa-floppy-disk"></i>
                    {loading ? '保存中...' : '保存する'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-cancel"
                    disabled={loading}
                  >
                    <i className="fa-solid fa-xmark"></i>
                    キャンセル
                  </button>
                </>
              )}
            </div>
          </form>
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
