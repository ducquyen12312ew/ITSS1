const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const config = require('./config/config');
const db = require('./database/db');
const childrenByUser = {};

const app = express();

app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use(session({
  secret: config.sessionSecret || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 2 }
}));

app.use((req, _res, next) => { console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`); next(); });

function requireLogin(req, res, next){ if (req.session && req.session.user) return next(); return res.redirect('/login'); }

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) { req.session.user = { email }; return res.json({ success:true, message:'ログイン成功', user:{ email } }); }
  return res.status(400).json({ success:false, message:'メールアドレスまたはパスワードが間違っています' });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (name && email && password) return res.json({ success:true, message:'アカウント作成成功', user:{ name, email } });
  return res.status(400).json({ success:false, message:'登録情報が不完全です' });
});

app.post('/api/auth/logout', (req, res) => { req.session.destroy(() => res.json({ success:true, message:'ログアウトしました' })); });

const spots = [
  { id:'sp1', title:'キッズパーク ひまわり', distanceKm:3.2, rating:4.4, reviews:128, age:'3〜8歳', type:'室内', price:'¥500〜¥1,200', tags:['室内遊び','有料','ボールプール'], img:'https://ik.imagekit.io/lginc73sk/Kid/pic11.png?updatedAt=1762859324941', rainOk:true, openToday:true, popularity:92, createdAt:1730500000000, address:'東京都A区1-2-3', hours:'10:00–18:00(最終17:30)', facilities:['授乳室','ベビーカー可','駐車場'], safety:['滑り台は係員常駐','混雑時は入場制限あり'], description:'子ども向けの室内遊び場。ボールプールや小型アスレチックが人気です。' },
  { id:'sp2', title:'恐竜博物館', distanceKm:4.6, rating:4.6, reviews:243, age:'5〜12歳', type:'屋内', price:'¥900〜¥1,500', tags:['学習','博物館'], img:'https://ik.imagekit.io/lginc73sk/Kid/pic12.png?updatedAt=1762859324756', rainOk:true, openToday:false, popularity:88, createdAt:1732700000000, address:'東京都B区4-5-6', hours:'9:30–17:00(最終16:30)', facilities:['授乳室','ロッカー'], safety:['暗所エリアあり'], description:'恐竜時代を学べる常設展示と体験コーナーがあります。' },
  { id:'sp3', title:'わんぱく公園', distanceKm:2.1, rating:4.2, reviews:209, age:'2〜10歳', type:'屋外', price:'無料', tags:['公園','無料'], img:'https://ik.imagekit.io/lginc73sk/Kid/pic13.png?updatedAt=1762859324793', rainOk:false, openToday:true, popularity:84, createdAt:1729900000000, address:'東京都C市1-9-9', hours:'常時開放(一部エリア除く)', facilities:['トイレ','駐車場'], safety:['雨天時は遊具の利用に注意'], description:'広い芝生と遊具がある無料の公園です。' },
  { id:'sp4', title:'水族館マリンワールド', distanceKm:7.5, rating:4.7, reviews:425, age:'3〜12歳', type:'室内', price:'¥1,100〜¥2,400', tags:['水族館','雨OK'], img:'https://ik.imagekit.io/lginc73sk/Kid/pic14.png?updatedAt=1762859324792', rainOk:true, openToday:true, popularity:96, createdAt:1733200000000, address:'東京都D区7-8-9', hours:'10:00–20:00', facilities:['授乳室','ベビーカー可','レストラン'], safety:['水槽前は転倒注意'], description:'大きな水槽とイルカショーが見どころの人気水族館。' }
];

const reviews = {
  sp1: [{ user:'ゲスト', rating:5, text:'子どもがとても楽しめました。', at:Date.now()-86400000 }],
  sp2: [], sp3: [], sp4: []
};

const favoritesByUser = {}; // { email: Set(ids) }
const schedulesByUser = {}; // { email: [{id, date, time, note}] }

function includes(t,q){return t.toLowerCase().includes((q||'').toLowerCase())}
function findSpot(id){return spots.find(s=>s.id===id)}

app.get('/api/spots', (req, res) => {
  const { q, rain, free, open, sort } = req.query;
  let list = spots.slice();
  if (q) list = list.filter(s => includes(s.title,q) || includes(s.type,q) || s.tags.some(t=>includes(t,q)));
  if (rain === '1') list = list.filter(s => s.rainOk);
  if (open === '1') list = list.filter(s => s.openToday);
  if (free === '1') list = list.filter(s => s.price.includes('無料'));
  if (sort === 'distance') list.sort((a,b)=>a.distanceKm-b.distanceKm);
  else if (sort === 'newest') list.sort((a,b)=>b.createdAt-a.createdAt);
  else if (sort === 'rating') list.sort((a,b)=>b.rating-a.rating);
  else list.sort((a,b)=>b.popularity-a.popularity);
  res.json({ success:true, total:list.length, items:list });
});

app.get('/api/spots/:id', (req, res) => {
  const spot = findSpot(req.params.id);
  if (!spot) return res.status(404).json({ success:false, message:'Not found' });
  const rvs = reviews[spot.id] || [];
  res.json({ success:true, item:spot, reviews:rvs });
});

app.post('/api/spots/:id/reviews', requireLogin, (req, res) => {
  const spot = findSpot(req.params.id);
  if (!spot) return res.status(404).json({ success:false, message:'Not found' });
  const { rating, text } = req.body;
  const email = req.session.user.email;
  const r = { user: email, rating: Number(rating)||0, text: text||'', at: Date.now() };
  reviews[spot.id] = reviews[spot.id] || [];
  reviews[spot.id].unshift(r);
  res.json({ success:true, review:r });
});

app.post('/api/spots/:id/favorite', requireLogin, (req, res) => {
  const email = req.session.user.email;
  favoritesByUser[email] = favoritesByUser[email] || new Set();
  const set = favoritesByUser[email];
  if (set.has(req.params.id)) set.delete(req.params.id); else set.add(req.params.id);
  res.json({ success:true, favorite: set.has(req.params.id) });
});

app.post('/api/spots/:id/schedule', requireLogin, (req, res) => {
  const email = req.session.user.email;
  schedulesByUser[email] = schedulesByUser[email] || [];
  const item = { id:req.params.id, date:req.body.date, time:req.body.time, note:req.body.note||'' };
  schedulesByUser[email].push(item);
  res.json({ success:true, scheduled:item });
});

app.get('/', requireLogin, (_req, res) => res.sendFile(path.join(__dirname, '../public/home.html')));
app.get('/login', (_req, res) => res.sendFile(path.join(__dirname, '../public/login.html')));
app.get('/search', requireLogin, (_req, res) => res.sendFile(path.join(__dirname, '../public/search.html')));
app.get('/spot/:id', requireLogin, (req, res) => res.sendFile(path.join(__dirname, '../public/spot.html')));
app.get('/kids', requireLogin, (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/kids.html'));
});

app.get('/api/children', requireLogin, (req, res) => {
  const email = req.session.user.email;
  res.json({ success:true, profile: childrenByUser[email] || null });
});

app.post('/api/children', requireLogin, (req, res) => {
  const email = req.session.user.email;
  const { name="", age="", likes=[], dislikes=[] } = req.body || {};
  childrenByUser[email] = { name, age, likes: Array.isArray(likes)?likes:[], dislikes: Array.isArray(dislikes)?dislikes:[] };
  res.json({ success:true, profile: childrenByUser[email] });
});

app.get('/health', (_req, res) => res.json({ status:'OK', timestamp:new Date().toISOString(), uptime:process.uptime(), environment:config.env }));
app.get('/api', (_req, res) => res.json({ message:'Kodomo Weekend Navi API', version:'1.0.0' }));

app.use((req, res) => res.status(404).json({ error:'Not Found', message:`Cannot ${req.method} ${req.path}` }));
app.use((err, _req, res, _next) => { console.error('Error:', err); res.status(err.status||500).json({ error:err.message||'Internal Server Error', ...(config.env==='development'&&{stack:err.stack}) }); });

const startServer = async () => {
  try {
    const isConnected = await db.testConnection();
    if (!isConnected) console.warn('Starting without DB');
    app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
  } catch (e) { console.error('Failed to start server:', e.message); process.exit(1); }
};
process.on('SIGINT', async () => { try{await db.pool.end();}catch{} process.exit(0); });
process.on('SIGTERM', async () => { try{await db.pool.end();}catch{} process.exit(0); });
startServer();
