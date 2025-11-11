document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitBtn = document.querySelector('.submit-btn');
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'ログイン中...';
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'alert alert-success';
                    messageDiv.textContent = data.message;
                    loginForm.parentNode.insertBefore(messageDiv, loginForm);
                    
                    if (data.token) {
                        localStorage.setItem('token', data.token);
                    }
                    
                    setTimeout(() => {
                        window.location.href = '/home.html';
                    }, 1000);
                } else {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'alert alert-error';
                    messageDiv.textContent = data.message;
                    loginForm.parentNode.insertBefore(messageDiv, loginForm);
                }
            } catch (err) {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'alert alert-error';
                messageDiv.textContent = 'サーバーエラーが発生しました';
                loginForm.parentNode.insertBefore(messageDiv, loginForm);
            }
            
            submitBtn.disabled = false;
            submitBtn.textContent = 'ログイン';
        });
    }
    
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const terms = document.getElementById('terms').checked;
            const submitBtn = document.querySelector('.submit-btn');
            
            if (password !== confirmPassword) {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'alert alert-error';
                messageDiv.textContent = 'パスワードが一致しません';
                signupForm.parentNode.insertBefore(messageDiv, signupForm);
                return;
            }
            
            if (!terms) {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'alert alert-error';
                messageDiv.textContent = '利用規約に同意する必要があります';
                signupForm.parentNode.insertBefore(messageDiv, signupForm);
                return;
            }
            
            submitBtn.disabled = true;
            submitBtn.textContent = '登録中...';
            
            try {
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'alert alert-success';
                    messageDiv.textContent = data.message;
                    signupForm.parentNode.insertBefore(messageDiv, signupForm);
                    
                    setTimeout(() => {
                        window.location.href = '/login.html';
                    }, 2000);
                } else {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'alert alert-error';
                    messageDiv.textContent = data.message;
                    signupForm.parentNode.insertBefore(messageDiv, signupForm);
                }
            } catch (err) {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'alert alert-error';
                messageDiv.textContent = 'サーバーエラーが発生しました';
                signupForm.parentNode.insertBefore(messageDiv, signupForm);
            }
            
            submitBtn.disabled = false;
            submitBtn.textContent = '登録';
        });
    }
});