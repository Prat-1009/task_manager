import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetPassword() {
  const q = useQuery();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = q.get('token') || '';
    setToken(t);
  }, [q]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="auth-card">
      <h2>Reset Password</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Token" value={token} onChange={(e) => setToken(e.target.value)} required />
        <input placeholder="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <div className="error">{error}</div>}
        {success && <div>Reset successful. Redirecting to login...</div>}
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}
