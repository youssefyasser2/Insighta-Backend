# Insighta Backend API

A scalable and production-oriented backend powering **Insighta**, a mental health monitoring platform designed to support therapist-patient communication, mood tracking, journaling, and real-time interactions.

Built with **Node.js**, **Express.js**, and **TypeScript**, the project focuses on clean architecture, secure authentication, real-time communication, and maintainable API design.

[![Node.js](https://img.shields.io/badge/Node.js-green)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-blue)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-brightgreen)](https://mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue)](https://typescriptlang.org/)

---

# Features

## Core Functionality

- Therapist-patient communication system
- Mood tracking and journaling APIs
- Secure JWT authentication with role-based access control
- Real-time chat and notifications using Socket.io
- RESTful API architecture with clean endpoint structure
- Centralized error handling and validation

---

## Performance & Database

- MongoDB integration with Mongoose ODM
- Optimized database queries and indexing
- Redis-based caching and session optimization
- Environment-based configuration for development and production

---

## Security & Reliability

- Password hashing using bcrypt
- Protected routes and access control middleware
- Rate limiting against abuse and brute-force attacks
- Secure HTTP headers using Helmet
- CORS configuration for trusted origins

---

## Developer Experience

- Modular and scalable folder structure
- Service-based architecture
- Request validation using Joi
- Logging with Morgan and Winston
- Hot reload development workflow with Nodemon

---

# Tech Stack

| Category | Technologies |
|---|---|
| Backend | Node.js, Express.js |
| Language | TypeScript |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| Real-time | Socket.io |
| Validation | Joi |
| Security | Helmet, CORS, express-rate-limit |
| Caching | Redis |
| Logging | Morgan, Winston |
| Dev Tools | Nodemon, dotenv, ESLint |

---

# Architecture Highlights

- Layered architecture (Routes → Controllers → Services → Database)
- Reusable middleware pipeline
- Centralized error handling
- Role-based authorization system
- Real-time event handling with Socket.io
- Clean separation of concerns for maintainability

---

# Project Structure

```bash
src/
├── controllers/
├── services/
├── routes/
├── models/
├── middleware/
├── config/
├── utils/
└── socket/
