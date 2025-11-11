const qs=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];

function activeTab(){
  const path=location.pathname;
  qsa('.tabbar .tab').forEach(t=>{
    const href=t.getAttribute('href'); if(!href) return;
    if(path===href || (path.startsWith(href) && href!=='/')) t.classList.add('active');
  });
}

function bindLogout(){
  const b=qs('.logout-btn'); if(!b) return;
  b.addEventListener('click',async()=>{
    if(!confirm('ログアウトしますか？')) return;
    const r=await fetch('/api/auth/logout',{method:'POST'});
    const d=await r.json(); if(d.success) location.href='/login';
  });
}

function cardHTML(s){
  return `
  <article class="card" data-id="${s.id}">
    <div class="card-media">
      <img src="${s.img}" alt="">
      <button class="remove" data-remove="${s.id}"><i class="fa-regular fa-trash-can"></i> 削除</button>
      <div class="badge-stack">
        ${s.rainOk?'<span class="badge">雨OK</span>':''}
        ${s.openToday?'<span class="badge green">本日営業</span>':''}
        ${s.price.includes('無料')?'<span class="badge green">無料</span>':''}
      </div>
    </div>
    <div class="card-body">
      <h3 class="title">${s.title}</h3>
      <div class="meta">
        <span class="m"><i class="fa-solid fa-location-dot"></i> ${s.distanceKm}km</span>
        <span class="m"><i class="fa-solid fa-star"></i> ${s.rating} (${s.reviews})</span>
      </div>
      <div class="tags">
        <span class="tag">${s.age}</span><span class="tag">${s.type}</span><span class="tag">${s.price}</span>
      </div>
      <div class="tags thin">${(s.tags||[]).slice(0,3).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
    </div>
  </article>`;
}

async function load(){
  const r=await fetch('/api/favorites'); const d=await r.json();
  const items=d.items||[];
  qs('#count').textContent=`${d.total||0}件のお気に入り`;
  qs('#grid').innerHTML = items.map(cardHTML).join('');
  qs('#empty').style.display = items.length? 'none':'block';

  // click card -> spot detail
  qsa('.card[data-id]').forEach(el=>{
    el.addEventListener('click',e=>{
      if(e.target.closest('[data-remove]')) return; // đừng chuyển trang khi ấn nút xóa
      const id=el.dataset.id; if(id) location.href=`/spot/${id}`;
    });
  });

  // remove
  qsa('[data-remove]').forEach(btn=>{
    btn.addEventListener('click',async e=>{
      e.stopPropagation();
      const id=btn.dataset.remove;
      const ok=confirm('お気に入りから削除しますか？');
      if(!ok) return;
      await fetch(`/api/favorites/${id}`,{method:'DELETE'});
      load();
    });
  });
}

document.addEventListener('DOMContentLoaded',()=>{
  activeTab(); bindLogout(); load();
});
