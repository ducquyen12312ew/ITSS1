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

function togglePill(groupEl){
  groupEl.addEventListener('click',e=>{
    const p=e.target.closest('.pill'); if(!p) return;
    p.classList.toggle('active');
  });
}
function getSelected(groupEl){
  return [...groupEl.querySelectorAll('.pill.active')].map(x=>x.dataset.value);
}
function setSelected(groupEl,values){
  [...groupEl.querySelectorAll('.pill')].forEach(p=>{
    p.classList.toggle('active', Array.isArray(values) && values.includes(p.dataset.value));
  });
}

async function loadProfile(){
  const r=await fetch('/api/children'); const d=await r.json();
  const p=d.profile||{};
  qs('#kidName').value=p.name||'';
  qs('#kidAge').value=p.age||'';
  setSelected(qs('#likes'), p.likes||[]);
  setSelected(qs('#dislikes'), p.dislikes||[]);
}

async function saveProfile(){
  const payload={
    name:qs('#kidName').value.trim(),
    age:qs('#kidAge').value.trim(),
    likes:getSelected(qs('#likes')),
    dislikes:getSelected(qs('#dislikes'))
  };
  const r=await fetch('/api/children',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const d=await r.json(); if(d.success){ alert('保存しました'); }
}

function init(){
  activeTab(); bindLogout();
  togglePill(qs('#likes')); togglePill(qs('#dislikes'));
  qs('#saveBtn').addEventListener('click',saveProfile);
  loadProfile();
}

document.addEventListener('DOMContentLoaded',init);
