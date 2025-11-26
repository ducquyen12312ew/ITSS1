import { useState, useEffect } from 'react';
import api from '../services/api';
import Tabbar from '../components/Tabbar';
import './ChildrenProfile.css';

const ChildrenProfile = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [currentChild, setCurrentChild] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    avatar_url: '',
    notes: '',
  });

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await api.get('/children');
      setChildren(response.data.data?.children || []);
    } catch (error) {
      console.error('Error fetching children:', error);
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleEdit = (child) => {
    setCurrentChild(child);
    // Format birth_date to YYYY-MM-DD for date input
    const birthDateStr = child.birth_date.split('T')[0];
    setFormData({
      name: child.name,
      birth_date: birthDateStr,
      avatar_url: child.avatar_url || '',
      notes: child.notes || '',
    });
    setEditMode(true);
  };

  const handleDelete = async (childId) => {
    if (!window.confirm('本当にこのプロフィールを削除しますか？')) {
      return;
    }

    try {
      await api.delete(`/children/${childId}`);
      alert('削除しました');
      fetchChildren();
    } catch (error) {
      console.error('Error deleting child:', error);
      alert('削除に失敗しました');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.birth_date) {
      alert('名前と生年月日を入力してください');
      return;
    }

    try {
      if (currentChild) {
        // Update existing child
        await api.put(`/children/${currentChild.child_id}`, formData);
        alert('更新しました');
      } else {
        // Create new child
        await api.post('/children', formData);
        alert('追加しました');
      }

      setEditMode(false);
      setCurrentChild(null);
      setFormData({ name: '', birth_date: '', avatar_url: '', notes: '' });
      fetchChildren();
    } catch (error) {
      console.error('Error saving child:', error);
      alert('保存に失敗しました');
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setCurrentChild(null);
    setFormData({ name: '', birth_date: '', avatar_url: '', notes: '' });
  };

  const handleAddNew = () => {
    setCurrentChild(null);
    setFormData({ name: '', birth_date: '', avatar_url: '', notes: '' });
    setEditMode(true);
  };

  return (
    <div className="children-page">
      {/* Hero header */}
      <header className="hero">
        <div className="hero-inner">
          <div className="hero-top">
            <div className="brand">
              コドモ週末ナビ
              <span className="sub">子どもプロフィール</span>
            </div>
            <a href="/profile" className="profile-btn">プロフィール</a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="wrap">
        <div className="title-top">
          子供プロフィール
          {!editMode && (
            <button onClick={handleAddNew} className="btn-add">
              <i className="fa-solid fa-plus"></i> 追加
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : editMode ? (
          /* Edit/Add form */
          <div className="card-form">
            <h3>{currentChild ? 'プロフィール編集' : '新規追加'}</h3>
            <form onSubmit={handleSubmit}>
              <label className="label">名前<span className="required">*</span></label>
              <input
                className="field"
                placeholder="はると"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <label className="label">生年月日<span className="required">*</span></label>
              <input
                className="field"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                required
              />

              <label className="label">アバターURL（任意）</label>
              <input
                className="field"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              />

              <label className="label">メモ（任意）</label>
              <textarea
                className="field"
                rows="4"
                placeholder="好きなこと、苦手なことなど..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              ></textarea>

              <div className="btn-row">
                <button type="button" onClick={handleCancel} className="btn-ghost">
                  キャンセル
                </button>
                <button type="submit" className="btn-primary">
                  保存
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Children list */
          <div className="children-list">
            {children.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-child"></i>
                <p>まだ子供のプロフィールがありません</p>
                <button onClick={handleAddNew} className="btn-primary">
                  最初のプロフィールを追加
                </button>
              </div>
            ) : (
              <>
                <div className="section-header">
                  <h3>誰のためにスポットを探しますか？</h3>
                </div>
                <div className="children-grid">
                  {children.map((child) => (
                    <div key={child.child_id} className="child-card-modern">
                      <div className="card-content">
                        <div className="child-avatar-large">
                          {child.avatar_url ? (
                            <img src={child.avatar_url} alt={child.name} />
                          ) : (
                            <div className="avatar-emoji">
                              {child.gender === 'male' ? '👦' : child.gender === 'female' ? '👧' : '🧒'}
                            </div>
                          )}
                        </div>
                        <h3 className="child-name">{child.name}</h3>
                        <p className="child-age">{calculateAge(child.birth_date)}歳</p>
                      </div>
                      <div className="card-actions">
                        <button 
                          onClick={() => window.location.href = `/swipe?child=${child.child_id}`} 
                          className="btn-action btn-swipe-card"
                        >
                          <i className="fa-solid fa-heart"></i>
                          <span>スワイプ</span>
                        </button>
                        <button 
                          onClick={() => handleEdit(child)} 
                          className="btn-action btn-edit-card"
                        >
                          <i className="fa-solid fa-pen"></i>
                          <span>編集</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(child.child_id)} 
                          className="btn-action btn-delete-card"
                        >
                          <i className="fa-solid fa-trash"></i>
                          <span>削除</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <Tabbar />
    </div>
  );
};

export default ChildrenProfile;
