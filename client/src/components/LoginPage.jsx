
import { useState } from 'react';
import { Package, LockKeyhole, UserRound } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    onLogin(username.trim());
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">
          <Package size={30} />
        </div>

        <h1>StockLite ERP</h1>
        <p className="login-subtitle">
          Inventory Management System
        </p>

        <h2>Welcome Back!</h2>
        <p className="login-description">
          Sign in to continue to your dashboard.
        </p>

        <label htmlFor="login-username">Username</label>
        <div className="login-input-wrap">
          <UserRound size={18} />
          <input
            id="login-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            autoComplete="username"
            required
          />
        </div>

        <label htmlFor="login-password">Password</label>
        <div className="login-input-wrap">
          <LockKeyhole size={18} />
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
            required
          />
        </div>

        {error && <p className="login-error">{error}</p>}

        <button className="login-button" type="submit">
          Login
        </button>

        <p className="login-demo-note">
        </p>
      </form>
    </div>
  );
}
