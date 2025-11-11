const qs=s=>document.querySelector(s),fmtDate=t=>new Date(t).toLocaleString('ja-JP');

function idFromURL(){const p=location.pathname.split('/');return p[p.length-1];}

function badgeHTML(s){
  const b=[]; if(s.rainOk)b.push('<span class="badge">雨OK</span>'); if(s.openToday)b.push('<span class="badge green">本日営業</span>'); if((s.price||'').includes('無料'))b.push('<span class="badge green">無料</span>'); return b.join('');
}

function tagNode(t){const span=document.createElement('span');span.className='tag';span.textContent=t;return span;}

async function load(){
  const id=idFromURL();
  const res=await fetch(`/api/spots/${id}`);
  const { item:s, reviews } = await res.json();

  qs('#crumbName').textContent = s.title;
  qs('#heroImg').src = s.img;
  qs('#spotName').textContent = s.title;
  qs('#badgeStack').innerHTML = badgeHTML(s);
  qs('#metaRow').innerHTML = `<span class="m"><i class="fa-solid fa-star"></i> ${s.rating} (${s.reviews})</span><span class="m"><i class="fa-solid fa-location-dot"></i> ${s.distanceKm}km</span>`;
  qs('#ageTypePrice').textContent = `${s.age} ${s.type} ${s.price}`;
  qs('#desc').textContent = s.description || '';
  qs('#hours').textContent = s.hours || '';
  qs('#facilities').innerHTML = '';
  (s.facilities||[]).forEach(f=>qs('#facilities').appendChild(tagNode(f)));
  qs('#safety').innerHTML = (s.safety||[]).map(x=>`<li>${x}</li>`).join('');
  qs('#tags').innerHTML = '';
  (s.tags||[]).forEach(t=>qs('#tags').appendChild(tagNode(t)));

  renderReviews(reviews||[]);
  wireActions(s);
}

function renderReviews(list){
  const box=qs('#reviewList');
  if(!list.length){ box.innerHTML = `<div class="item muted">レビューはまだありません。</div>`; return; }
  box.innerHTML = list.map(r=>`
    <div class="item">
      <div style="display:flex;justify-content:space-between">
        <strong>${r.user}</strong><span class="muted">${fmtDate(r.at)}</span>
      </div>
      <div>★ ${r.rating}</div>
      <div>${r.text||''}</div>
    </div>
  `).join('');
}

function wireActions(s){
  qs('#btnRoute').addEventListener('click',()=>{ const q = encodeURIComponent(s.address||s.title); location.href = `https://www.google.com/maps/search/?api=1&query=${q}`; });
  qs('#btnFav').addEventListener('click',async ()=>{
    const res=await fetch(`/api/spots/${s.id}/favorite`,{method:'POST'}); const data=await res.json();
    qs('#btnFav').innerHTML = data.favorite ? '<i class="fa-solid fa-heart"></i> 保存済み' : '<i class="fa-regular fa-heart"></i> 保存';
  });

  const schedBox=document.querySelector('.sect'); // khối schedule đầu tiên
  schedBox.style.display='none';
  qs('#btnOpenSched').addEventListener('click',()=>schedBox.style.display='block');
  qs('#btnCloseSched').addEventListener('click',()=>schedBox.style.display='none');
  qs('#btnCancelSched').addEventListener('click',()=>schedBox.style.display='none');
  qs('#btnSaveSched').addEventListener('click',async ()=>{
    const date=qs('#date').value, time=qs('#time').value, note=qs('#note').value;
    if(!date||!time){ alert('日付と時刻を選択してください'); return; }
    const res=await fetch(`/api/spots/${s.id}/schedule`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({date,time,note})});
    const data=await res.json(); if(data.success){ alert('スケジュールに保存しました'); schedBox.style.display='none'; }
  });

  qs('#btnPostReview').addEventListener('click',async ()=>{
    const rating=prompt('星(1-5)を入力'); if(!rating) return;
    const text=prompt('レビュー本文'); 
    const res=await fetch(`/api/spots/${s.id}/reviews`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({rating,text})});
    const data=await res.json(); if(data.success){ const cur=qs('#reviewList').innerHTML; load(); }
  });
}

document.addEventListener('DOMContentLoaded',load);
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  document.querySelectorAll('.tabbar .tab').forEach(tab => {
    const href = tab.getAttribute('href');
    if (!href) return;
    // Nếu URL khớp đầu đường dẫn thì active
    if (path === href || (path.startsWith(href) && href !== '/')) {
      tab.classList.add('active');
    }
  });

  // Xử lý logout
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
});
