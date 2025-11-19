import React, { useState } from 'react';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setToken('');
    try {
      const res = await api.post('/forgot-password', { email });
      setMsg(res.data?.message || 'If this email exists, a reset link has been generated.');
      if (res.data?.token) setToken(res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    }
  };

  return (
    <div className="auth-card">
      <h2>Forgot Password</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {error && <div className="error">{error}</div>}
        <button type="submit">Send Reset Link</button>
      </form>
      {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
      {token && (
        <div style={{ marginTop: 8 }}>
          Demo token: <code>{token}</code>
          <div style={{ marginTop: 4 }}>
            Open Reset page with token: <a href={`/reset?token=${token}`}>Reset Password</a>
          </div>
        </div>
      )}
    </div>
  );
}
