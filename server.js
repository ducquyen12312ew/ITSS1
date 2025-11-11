const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    return res.json({
      success: true,
      message: 'ログイン成功',
      user: { email }
    });
  }
  return res.status(400).json({
    success: false,
    message: 'メールアドレスまたはパスワードが間違っています'
  });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (name && email && password) {
    return res.json({
      success: true,
      message: 'アカウント作成成功',
      user: { name, email }
    });
  }
  return res.status(400).json({
    success: false,
    message: '登録情報が不完全です'
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});