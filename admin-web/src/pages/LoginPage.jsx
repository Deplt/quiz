import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../api/auth.js';
import { useAuth } from '../auth/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { token, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const { token, admin } = await loginRequest({ username, password });
      login(token, admin);
      navigate('/dashboard', { replace: true });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : '登录失败');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <h1 className="login-card__title">刷题管理后台</h1>
        <p className="login-card__subtitle">请登录管理员账号</p>
        <form className="stack gap-md" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">用户名</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="请输入用户名"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="field">
            <label htmlFor="password">密码</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="请输入密码"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {error ? <p className="error-banner" role="alert">{error}</p> : null}

          <button type="submit" disabled={isSubmitting} style={{ width: '100%', height: 40 }}>
            {isSubmitting ? '登录中...' : '登 录'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
