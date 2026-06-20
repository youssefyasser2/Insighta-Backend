# Insighta Backend API

Insighta Backend is a Node.js and Express API that provides authentication, profile management, notifications, audit logs, token refresh, email verification, OTP-based password recovery, and password reset workflows backed by MongoDB and Redis.

## Tech Stack

- Node.js and Express
- MongoDB with Mongoose
- Redis for short-lived verification and refresh-token state
- JWT authentication
- bcryptjs password hashing
- express-validator request validation
- Helmet, CORS, HPP, and rate limiting for baseline API hardening
- Winston and Morgan for application and HTTP logging

## Project Structure

```text
config/        Runtime configuration, MongoDB, and Redis clients
controllers/   Request handlers for non-trivial workflows
middlewares/   Authentication, error handling, and rate limiting
models/        Mongoose schemas and indexes
routes/        Express route definitions
services/      Reusable business operations
utils/         Shared helpers for email, JWTs, hashing, dates, and responses
test/          Node test runner coverage for shared utilities
```

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

   Required runtime configuration can be provided either with `MONGO_URI` or with `MONGO_USER`, `MONGO_PASS`, `MONGO_HOST`, `MONGO_PORT`, and `MONGO_DB`.

3. Start the API:

   ```bash
   npm start
   ```

4. Run tests:

   ```bash
   npm test
   ```

## Key Endpoints

- `GET /health` - service health check
- `POST /api/auth/register` - register a user and send email verification
- `POST /api/auth/login` - authenticate and issue access and refresh tokens
- `POST /api/auth/logout` - revoke a refresh token
- `POST /api/tokens/refresh` - issue a new access token
- `GET /api/users/me` - get the authenticated user
- `GET /api/notifications` - list authenticated user notifications
- `POST /api/password-resets/request` - request a password reset link
- `POST /api/otp-codes/request` - request an OTP for password recovery

## Production Notes

- Set `NODE_ENV=production` in deployed environments.
- Use strong, distinct values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
- Restrict `CLIENT_URL` to trusted origins.
- Configure SMTP credentials with least privilege.
- Run MongoDB and Redis with authentication and private-network access only.
