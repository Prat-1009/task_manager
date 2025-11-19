import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  return (
    <nav className="nav">
      <div>
        <Link to="/">Task Manager</Link>
      </div>
      <div>
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        {user && (
          <>
            <span>Hi, {user.user.name} ({user.user.role})</span>
            <Link to="/tasks/new">New Task</Link>
            <button onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
