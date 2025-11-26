const qs = s => document.querySelector(s);
const qsa = s => [...document.querySelectorAll(s)];
const fmtDate = t => new Date(t).toLocaleString('ja-JP');

function idFromURL() {
  const p = location.pathname.split('/');
  return p[p.length - 1];
}

function badgeHTML(s) {
  const b = [];
  if (s.rainOk) b.push('<span class="badge">雨OK</span>');
  if (s.openToday) b.push('<span class="badge green">本日営業</span>');
  if ((s.price || '').includes('無料')) b.push('<span class="badge green">無料</span>');
  return b.join('');
}

function tagNode(t) {
  const span = document.createElement('span');
  span.className = 'tag';
  span.textContent = t;
  return span;
}

async function load() {
  try {
    const id = idFromURL();
    console.log('Đang tải spot với ID:', id);
    const res = await fetch(`/api/spots/${id}`);
    if (!res.ok) {
      console.error('Lỗi khi tải dữ liệu spot:', res.status);
      return;
    }
    const data = await res.json();
    console.log('Dữ liệu spot đã tải:', data);
    const s = data.item;
    const reviews = data.reviews || [];
    if (!s) {
      console.error('Không tìm thấy spot');
      alert('スポットが見つかりません');
      return;
    }
    setText('#crumbName', s.title);
    setImg('#heroImg', s.img);
    setText('#spotName', s.title);
    setHTML('#badgeStack', badgeHTML(s));
    setHTML('#metaRow', `
      <span class="m"><i class="fa-solid fa-star"></i> ${s.rating} (${s.reviews})</span>
      <span class="m"><i class="fa-solid fa-location-dot"></i> ${s.distanceKm}km</span>
    `);
    setText('#ageTypePrice', `${s.age} ${s.type} ${s.price}`);
    setText('#desc', s.description || '');
    setText('#hours', s.hours || '');
    clear('#facilities'); (s.facilities || []).forEach(f => qs('#facilities')?.appendChild(tagNode(f)));
    setHTML('#safety', (s.safety || []).map(x => `<li>${x}</li>`).join(''));
    clear('#tags'); (s.tags || []).forEach(t => qs('#tags')?.appendChild(tagNode(t)));
    renderReviews(reviews);
    wireActions(s);
  } catch (error) {
    console.error('Lỗi trong hàm load:', error);
  }
}

function setText(sel, txt) { const el = qs(sel); if (el) el.textContent = txt; }
function setHTML(sel, html) { const el = qs(sel); if (el) el.innerHTML = html; }
function setImg(sel, src) { const el = qs(sel); if (el) el.src = src; }
function clear(sel) { const el = qs(sel); if (el) el.innerHTML = ''; }

function renderReviews(list) {
  const box = qs('#reviewList');
  if (!box) return;
  if (!list.length) {
    box.innerHTML = `<div class="item muted">レビューはまだありません。</div>`;
    return;
  }
  box.innerHTML = list.map(r => `
    <div class="item">
      <div style="display:flex;justify-content:space-between">
        <strong>${r.user}</strong><span class="muted">${fmtDate(r.at)}</span>
      </div>
      <div>★ ${r.rating}</div>
      <div>${r.text || ''}</div>
    </div>
  `).join('');
}

function on(sel, event, handler) {
  const el = qs(sel);
  if (el) el.addEventListener(event, handler);
}

function wireActions(s) {
  on('#btnRoute', () => {
    const q = encodeURIComponent(s.address || s.title);
    location.href = `https://www.google.com/maps/search/?api=1&query=${q}`;
  });

  on('#btnFav', async () => {
    try {
      if (!s || !s.id) {
        console.error('Không có ID spot hợp lệ');
        return;
      }
      console.log('Gửi yêu cầu yêu thích cho spot:', s.id);
      const r = await fetch(`/api/spots/${s.id}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('Trạng thái phản hồi:', r.status);
      const data = await r.json();
      console.log('Dữ liệu phản hồi:', data);
      const btn = qs('#btnFav');
      if (btn && data.success) {
        btn.innerHTML = data.favorite
          ? '<i class="fa-solid fa-heart"></i> 保存済み'
          : '<i class="fa-regular fa-heart"></i> 保存';
      }
    } catch (error) {
      console.error('Lỗi khi xử lý yêu thích:', error);
    }
  });

  const schedPanel = qs('#schedPanel');
  if (schedPanel) schedPanel.style.display = 'none';

  on('#btnOpenSched', () => { if (schedPanel) schedPanel.style.display = 'block'; });
  on('#btnCloseSched', () => { if (schedPanel) schedPanel.style.display = 'none'; });
  on('#btnCancelSched', () => { if (schedPanel) schedPanel.style.display = 'none'; });

  on('#btnSaveSched', async () => {
    try {
      const date = qs('#date')?.value, time = qs('#time')?.value, note = qs('#note')?.value;
      if (!date || !time) {
        alert('日付と時刻を選択してください');
        return;
      }
      console.log('Lưu lịch trình cho spot:', s.id, { date, time, note });
      const r = await fetch(`/api/spots/${s.id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, note })
      });
      console.log('Trạng thái phản hồi lịch trình:', r.status);
      const d = await r.json();
      console.log('Dữ liệu phản hồi lịch trình:', d);
      if (d.success && schedPanel) {
        alert('スケジュールに保存しました');
        schedPanel.style.display = 'none';
      }
    } catch (error) {
      console.error('Lỗi khi lưu lịch trình:', error);
    }
  });

  on('#btnPostReview', async () => {
    try {
      const rating = prompt('星(1-5)を入力');
      if (!rating) return;
      const text = prompt('レビュー本文');
      console.log('Gửi đánh giá cho spot:', s.id, { rating, text });
      const r = await fetch(`/api/spots/${s.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, text })
      });
      console.log('Trạng thái phản hồi đánh giá:', r.status);
      const d = await r.json();
      console.log('Dữ liệu phản hồi đánh giá:', d);
      if (d.success) load();
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    load();
    const path = window.location.pathname;
    qsa('.tabbar .tab').forEach(tab => {
      const href = tab.getAttribute('href');
      if (href && (path === href || (path.startsWith(href) && href !== '/'))) {
        tab.classList.add('active');
      }
    });
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        if (confirm('ログアウトしますか？')) {
          const res = await fetch('/api/auth/logout', { method: 'POST' });
          const data = await res.json();
          if (data.success) window.location.href = '/login';
        }
      });
    }
  } catch (error) {
    console.error('Lỗi khi khởi tạo trang:', error);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const favButton = document.querySelector('#btnFav');
    if (favButton) {
      console.log('Đã tìm thấy nút yêu thích');
      const newFavButton = favButton.cloneNode(true);
      favButton.parentNode.replaceChild(newFavButton, favButton);
      newFavButton.addEventListener('click', async () => {
        console.log('Đã nhấn nút yêu thích');
        try {
          const spotId = idFromURL();
          console.log('ID của spot:', spotId);
          if (!spotId) {
            console.error('Không có ID spot hợp lệ');
            return;
          }
          let response;
          try {
            console.log('Thử gọi API endpoint: /api/spots/' + spotId + '/favorite');
            response = await fetch(`/api/spots/${spotId}/favorite`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });
          } catch (err) {
            console.log('Lỗi với endpoint thứ nhất:', err);
            console.log('Thử gọi API endpoint: /api/favorites/' + spotId);
            response = await fetch(`/api/favorites/${spotId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });
          }
          console.log('Trạng thái phản hồi:', response.status);
          const data = await response.json();
          console.log('Dữ liệu phản hồi:', data);
          if (data.success) {
            newFavButton.innerHTML = data.favorite
              ? '<i class="fa-solid fa-heart"></i> 保存済み'
              : '<i class="fa-regular fa-heart"></i> 保存';
            alert(data.favorite ? 'お気に入りに追加しました' : 'お気に入りから削除しました');
          } else {
            alert('エラーが発生しました: ' + (data.message || 'Unknown error'));
          }
        } catch (error) {
          console.error('Lỗi khi xử lý yêu thích:', error);
          alert('エラーが発生しました');
        }
      });
      console.log('Đã gắn event listener cho nút yêu thích');
    } else {
      console.error('Không tìm thấy nút yêu thích (#btnFav)');
    }
  }, 500);
});
