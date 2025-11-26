import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Tabbar from '../components/Tabbar';
import './Schedule.css';

const Schedule = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    spot_id: '',
    scheduled_date: '',
    time_slot: 'FULL_DAY',
    notes: '',
  });

  useEffect(() => {
    fetchSchedules();
  }, [selectedDate]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const params = selectedDate ? { date: selectedDate } : {};
      const response = await api.get('/schedules', { params });
      setSchedules(response.data.data?.schedules || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm('このスケジュールを削除しますか？')) {
      return;
    }

    try {
      await api.delete(`/schedules/${scheduleId}`);
      setSchedules(schedules.filter(s => s.schedule_id !== scheduleId));
      alert('スケジュールを削除しました');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('削除に失敗しました');
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    // Backend returns YYYY-MM-DD string directly
    setFormData({
      spot_id: schedule.spot_id,
      scheduled_date: schedule.scheduled_date,
      time_slot: schedule.time_slot || 'FULL_DAY',
      notes: schedule.notes || '',
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.scheduled_date) {
      alert('日付を選択してください');
      return;
    }

    try {
      await api.put(`/schedules/${editingSchedule.schedule_id}`, formData);
      alert('スケジュールを更新しました');
      setEditingSchedule(null);
      fetchSchedules();
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('更新に失敗しました');
    }
  };

  const groupByDate = (schedules) => {
    const grouped = {};
    schedules.forEach(schedule => {
      // Backend returns YYYY-MM-DD string directly
      const date = schedule.scheduled_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(schedule);
    });
    return grouped;
  };

  const groupedSchedules = groupByDate(schedules);
  const sortedDates = Object.keys(groupedSchedules).sort();

  return (
    <div className="schedule-page">
      {/* Header */}
      <header className="hero">
        <div className="hero-inner">
          <div className="hero-top">
            <div className="brand">
              週末スケジュール
              <span className="sub">お出かけ予定を管理</span>
            </div>
            <a href="/profile" className="profile-btn">プロフィール</a>
          </div>
        </div>
      </header>

      {/* Filter by date */}
      <div className="filter-section">
        <div className="container">
          <label htmlFor="date-filter">日付で絞り込み：</label>
          <input
            id="date-filter"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="clear-filter-btn"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <main className="container">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : schedules.length === 0 ? (
          <div className="empty-state">
            <i className="fa-regular fa-calendar"></i>
            <h3>予定がありません</h3>
            <p>スポット詳細ページからスケジュールを追加しましょう</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              スポットを探す
            </button>
          </div>
        ) : (
          <div className="schedules-list">
            {sortedDates.map((date) => (
              <div key={date} className="date-group">
                <h3 className="date-header">
                  <i className="fa-solid fa-calendar-day"></i>
                  {(() => {
                    // Format YYYY-MM-DD to Japanese date
                    const [year, month, day] = date.split('-');
                    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
                    // Create date object with explicit values to avoid timezone issues
                    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    const weekday = !isNaN(d.getTime()) ? weekdays[d.getDay()] : '';
                    return `${year}年${parseInt(month)}月${parseInt(day)}日${weekday ? `(${weekday})` : ''}`;
                  })()}
                </h3>
                <div className="schedule-cards">
                  {groupedSchedules[date].map((schedule) => (
                    <div key={schedule.schedule_id} className="schedule-card">
                      <div className="schedule-time">
                        <i className="fa-regular fa-clock"></i>
                        {schedule.time_slot === 'AM' ? '午前' : schedule.time_slot === 'PM' ? '午後' : schedule.time_slot === 'FULL_DAY' ? '終日' : schedule.time_slot}
                      </div>
                      <div className="schedule-content">
                        <h4
                          className="spot-name"
                          onClick={() => navigate(`/spot/${schedule.spot_id}`)}
                        >
                          {schedule.spot_name}
                        </h4>
                        {schedule.notes && (
                          <p className="schedule-notes">
                            <i className="fa-solid fa-memo"></i>
                            {schedule.notes}
                          </p>
                        )}
                        {schedule.spot_address && (
                          <p className="spot-address">
                            <i className="fa-solid fa-location-dot"></i>
                            {schedule.spot_address}
                          </p>
                        )}
                      </div>
                      <div className="schedule-actions">
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="btn-edit"
                          title="編集"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.schedule_id)}
                          className="btn-delete"
                          title="削除"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingSchedule && (
        <>
          <div className="modal-overlay" onClick={() => setEditingSchedule(null)}></div>
          <div className="edit-modal">
            <div className="modal-header">
              <h3>スケジュール編集</h3>
              <button onClick={() => setEditingSchedule(null)} className="close-btn">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="modal-body">
              <div className="form-group">
                <label>スポット名</label>
                <input
                  type="text"
                  value={editingSchedule.spot_name}
                  disabled
                  className="field"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>日付 *</label>
                  <input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    className="field"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>時間帯</label>
                  <select
                    value={formData.time_slot}
                    onChange={(e) => setFormData({ ...formData, time_slot: e.target.value })}
                    className="field"
                  >
                    <option value="AM">午前</option>
                    <option value="PM">午後</option>
                    <option value="FULL_DAY">終日</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>メモ</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="field"
                  rows="3"
                  placeholder="持ち物、注意事項など"
                ></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setEditingSchedule(null)} className="btn ghost">
                  キャンセル
                </button>
                <button type="submit" className="btn primary">
                  保存する
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Bottom navigation */}
      <Tabbar />
    </div>
  );
};

export default Schedule;
