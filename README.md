# Task Manager with Role-Based Access

A simple MERN stack app with authentication, role-based access control, and task management.

## Tech Stack
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Joi
- Frontend: React, React Router, Axios

## Prerequisites
- Node.js >= 18
- MongoDB instance (local or cloud)

## Setup

### Backend
1. cd backend
2. Copy .env.example to .env and fill values
3. npm install
4. npm run dev

Environment variables (.env):
- PORT=5000
- MONGO_URI=mongodb://localhost:27017/task_manager
- JWT_SECRET=your_jwt_secret

### Frontend
1. cd frontend
2. npm install
3. npm start

The frontend proxy is configured to call the backend at http://localhost:5000.

## Features
- Register/Login with hashed passwords
- JWT-based auth with protected routes
- Roles: user, admin
- Users manage their own tasks
- Admin can view and delete any task
- Pagination and filtering on tasks list

## Scripts
- Backend: `npm run dev` (nodemon)
- Frontend: `npm start`
