# Insighta Backend API

Backend API for Insighta built with Node.js, Express, MongoDB, and Redis.

The project provides authentication, user management, email verification, password recovery, notifications, and audit logging through a modular and scalable architecture.

## Features

* JWT Authentication & Refresh Tokens
* Email Verification
* Password Reset & OTP Recovery
* User Management
* Notifications System
* Audit Logs
* Request Validation
* Rate Limiting & Security Middleware
* MongoDB & Redis Integration
* Structured Logging

## Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Redis

### Authentication & Security

* JWT
* bcryptjs
* Helmet
* CORS
* HPP
* express-rate-limit

### Utilities

* Nodemailer
* Winston
* Morgan
* express-validator

## Project Structure

```text
.
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
├── utils/
├── test/
├── app.js
├── server.js
└── package.json
```

## Getting Started

### Prerequisites

* Node.js 18+
* MongoDB
* Redis

### Installation

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Example variables:

```env
PORT=5000

MONGO_URI=

REDIS_HOST=
REDIS_PORT=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

EMAIL_USER=
EMAIL_PASS=

CLIENT_URL=
FRONTEND_URL=
```

### Run Development Server

```bash
npm run dev
```

### Run Production Server

```bash
npm start
```

## Available Scripts

```bash
npm run dev
npm start
npm test
```

## Core Modules

### Authentication

* Registration
* Login
* Logout
* Refresh Tokens
* Email Verification

### Password Recovery

* Reset Links
* OTP Verification
* Password Updates

### User Management

* Profile Management
* User Listing
* Access Control

### Notifications

* Create Notifications
* Read Notifications
* Clear Notifications

### Audit Logs

* User Activity Tracking
* Log Cleanup

## Security Features

* JWT Authentication
* Password Hashing
* Request Validation
* Rate Limiting
* Secure HTTP Headers
* CORS Protection

## Future Improvements

* Docker Deployment
* OpenAPI / Swagger Documentation
* CI/CD Pipeline
* Integration Testing
* Background Jobs
* Monitoring & Observability

## License

MIT
