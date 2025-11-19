import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

export default function TaskForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      api.get(`/tasks/${id}`).then((res) => {
        setTitle(res.data.title);
        setDescription(res.data.description || '');
        setStatus(res.data.status);
      }).catch((err) => setError(err.response?.data?.message || 'Failed to load'));
    }
  }, [id, isEdit]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEdit) await api.put(`/tasks/${id}`, { title, description, status });
      else await api.post('/tasks', { title, description, status });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  return (
    <div className="auth-card">
      <h2>{isEdit ? 'Edit Task' : 'New Task'}</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        {error && <div className="error">{error}</div>}
        <div className="actions">
          <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
}
