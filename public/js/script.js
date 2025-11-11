document.addEventListener('DOMContentLoaded', () => {
  function showMessage(targetForm, type, text) {
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) existingAlert.remove();
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type}`;
    messageDiv.textContent = text;
    targetForm.parentNode.insertBefore(messageDiv, targetForm);
    setTimeout(() => messageDiv.remove(), 5000);
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = loginForm.querySelector('input[type="email"]')?.value || '';
      const password = loginForm.querySelector('input[type="password"]')?.value || '';
      const submitBtn = loginForm.querySelector('.submit-btn') || loginForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'ログイン中...';
      }
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data && data.success) {
          showMessage(loginForm, 'success', data.message || '成功しました');
        } else {
          showMessage(loginForm, 'error', data?.message || '失敗しました');
        }
      } catch (err) {
        showMessage(loginForm, 'error', 'サーバーエラーが発生しました');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'ログイン';
      }
    });
  }

  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = signupForm.querySelector('input[name="name"], #name')?.value || '';
      const email = signupForm.querySelector('input[type="email"]')?.value || '';
      const password = signupForm.querySelector('input[name="password"], #password')?.value || '';
      const confirmPassword = signupForm.querySelector('input[name="confirm-password"], #confirm-password')?.value || '';
      const terms = signupForm.querySelector('#terms, input[name="terms"]')?.checked || false;
      const submitBtn = signupForm.querySelector('.submit-btn') || signupForm.querySelector('button[type="submit"]');
      if (password !== confirmPassword) {
        showMessage(signupForm, 'error', 'パスワードが一致しません');
        return;
      }
      if (!terms) {
        showMessage(signupForm, 'error', '利用規約に同意する必要があります');
        return;
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '登録中...';
      }
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        if (data && data.success) {
          showMessage(signupForm, 'success', data.message || '成功しました');
        } else {
          showMessage(signupForm, 'error', data?.message || '失敗しました');
        }
      } catch (err) {
        showMessage(signupForm, 'error', 'サーバーエラーが発生しました');
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '登録';
      }
    });
  }
});
