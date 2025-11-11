const qs=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];
const S={q:"",age:new Set(),type:new Set(),rain:false,free:false,open:false,area:"",category:new Set(),price:new Set()};
function emit(){window.dispatchEvent(new CustomEvent("filters:changed"))}
function openPanel(){qs("#filterPanel").classList.add("open");qs("#scrim").classList.add("open")}
function closePanel(){qs("#filterPanel").classList.remove("open");qs("#scrim").classList.remove("open")}
function toggleChip(b){b.classList.toggle("active");const k=b.dataset.key,v=b.dataset.value;if(S[k] instanceof Set){b.classList.contains("active")?S[k].add(v):S[k].delete(v)}if(k==="rain")S.rain=b.classList.contains("active");if(k==="free")S.free=b.classList.contains("active");emit()}
function clearAll(){qsa(".pill.active").forEach(p=>p.classList.remove("active"));qsa("input[type=checkbox][data-key]").forEach(cb=>cb.checked=false);qsa(".field").forEach(f=>f.value="");S.q="";S.age.clear();S.type.clear();S.category.clear();S.price.clear();S.rain=false;S.free=false;S.open=false;S.area="";qs("#searchInput").value="";emit()}
function norm(s){return (s||"").toLowerCase()}
function anyMatch(set,txt){if(!set||set.size===0)return true;for(const v of set){if(txt.includes(norm(v)))return true}return false}
function flagsOk(txt){if(S.rain&&!txt.includes("雨ok"))return false;if(S.free&&!txt.includes("無料"))return false;if(S.open&&!txt.includes("本日営業"))return false;return true}
function show(el,ok){el.style.display=ok?"":"none"}
function applyFilter(){const cards=[...document.querySelectorAll(".card")];cards.forEach(c=>{const t=norm(c.innerText);const ok=(!S.q||t.includes(norm(S.q)))&&anyMatch(S.age,t)&&anyMatch(S.type,t)&&anyMatch(S.category,t)&&anyMatch(S.price,t)&&flagsOk(t);show(c,ok)});qsa(".section").forEach(sec=>{const any=[...sec.querySelectorAll(".card")].some(c=>c.style.display!=="none");show(sec,any)})}
qsa(".chip").forEach(ch=>ch.addEventListener("click",()=>toggleChip(ch)));
qsa(".pill-group").forEach(g=>g.addEventListener("click",e=>{const t=e.target.closest(".pill");if(!t)return;t.classList.toggle("active");const k=g.dataset.key,v=t.dataset.value;if(S[k] instanceof Set){t.classList.contains("active")?S[k].add(v):S[k].delete(v)}emit()}));
qsa(".field").forEach(f=>f.addEventListener("input",e=>{S[e.target.dataset.key]=e.target.value.trim();emit()}));
qsa("input[type=checkbox][data-key]").forEach(cb=>cb.addEventListener("change",()=>{S[cb.dataset.key]=cb.checked;emit()}));
qs("#openFilter").addEventListener("click",openPanel);
qs("#closeFilter").addEventListener("click",closePanel);
qs("#scrim").addEventListener("click",closePanel);
qs("#applyFilter").addEventListener("click",()=>{closePanel();emit()});
qs("#clearFilter").addEventListener("click",clearAll);
qs("#nearbyBtn").addEventListener("click",()=>{});
qs("#searchInput").addEventListener("input",e=>{S.q=e.target.value.trim();emit()});
window.addEventListener("filters:changed",applyFilter);
window.addEventListener("DOMContentLoaded",applyFilter);
