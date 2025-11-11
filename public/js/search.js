const qs=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];
const S={q:"",sort:"popularity",rain:"0",open:"0",free:"0"};

function toQS(){const p=new URLSearchParams();if(S.q)p.set("q",S.q);p.set("sort",S.sort);if(S.rain==="1")p.set("rain","1");if(S.open==="1")p.set("open","1");if(S.free==="1")p.set("free","1");return p.toString()}

function card(s){
  return `
  <a href="/spot/${s.id}" class="card" style="text-decoration:none;color:inherit">
    <div class="card-media">
      <img src="${s.img}" alt="">
      <div class="badge-stack">
        ${s.rainOk?'<span class="badge">雨OK</span>':''}
        ${s.openToday?'<span class="badge green">本日営業</span>':''}
        ${s.price.includes('無料')?'<span class="badge green">無料</span>':''}
      </div>
    </div>
    <div class="card-body">
      <h3 class="title">${s.title}</h3>
      <div class="meta"><span class="m"><i class="fa-solid fa-location-dot"></i> ${s.distanceKm}km</span><span class="m"><i class="fa-solid fa-star"></i> ${s.rating} (${s.reviews})</span></div>
      <div class="tags"><span class="tag">${s.age}</span><span class="tag">${s.type}</span><span class="tag">${s.price}</span></div>
      <div class="tags thin">${s.tags.slice(0,3).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
    </div>
  </a>`;
}

async function load(){const res=await fetch('/api/spots?'+toQS());const data=await res.json();qs('#grid').innerHTML=data.items.map(card).join('');qs('#count').textContent=`${data.total}件のスポットが見つかりました`;const url=new URL(location.href);url.search=toQS();history.replaceState(null,"",url.toString())}

function initFromURL(){const u=new URL(location.href);S.q=u.searchParams.get('q')||"";S.sort=u.searchParams.get('sort')||"popularity";S.rain=u.searchParams.get('rain')==="1"?"1":"0";S.open=u.searchParams.get('open')==="1"?"1":"0";S.free=u.searchParams.get('free')==="1"?"1":"0";qs('#q').value=S.q;qs('#sort').value=S.sort}

function bindLogout(){const b=document.querySelector('.logout-btn');if(b){b.addEventListener('click',async()=>{if(confirm('ログアウトしますか？')){const r=await fetch('/api/auth/logout',{method:'POST'});const d=await r.json();if(d.success)location.href='/login';}})}}

function init(){initFromURL();qs('#q').addEventListener('input',e=>{S.q=e.target.value.trim();load()});qs('#sort').addEventListener('change',e=>{S.sort=e.target.value;load()});qs('#openAdvanced').addEventListener('click',()=>location.href='/?openFilter=1');bindLogout();load()}

document.addEventListener('DOMContentLoaded',init);
