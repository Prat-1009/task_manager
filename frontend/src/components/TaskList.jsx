import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function TaskList() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 10 });

  const load = async (p = page) => {
    const params = { page: p, limit: data.limit };
    if (q) params.q = q;
    if (status) params.status = status;
    const res = await api.get('/tasks', { params });
    setData(res.data);
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line
  }, []);

  const totalPages = Math.ceil(data.total / data.limit) || 1;

  return (
    <div>
      <div className="filters">
        <input placeholder="Search title..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button onClick={() => load(1)}>Apply</button>
      </div>
      <ul className="task-list">
        {data.items.map((t) => (
          <li key={t._id} className="task-item">
            <div>
              <strong>{t.title}</strong>
              <div className={`status ${t.status}`}>{t.status}</div>
              <small>{new Date(t.createdAt).toLocaleString()}</small>
            </div>
            <div>
              <Link to={`/tasks/${t._id}`}>Edit</Link>
            </div>
          </li>
        ))}
      </ul>
      <div className="pager">
        <button disabled={page <= 1} onClick={() => { setPage(page - 1); load(page - 1); }}>Prev</button>
        <span>
          Page {data.page} / {totalPages}
        </span>
        <button disabled={data.page >= totalPages} onClick={() => { setPage(page + 1); load(page + 1); }}>Next</button>
      </div>
    </div>
  );
}
