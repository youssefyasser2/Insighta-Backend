# Insighta Backend API

Insighta Backend is a REST API built with Node.js, Express, MongoDB, and Redis. It provides the authentication and account-management layer for Insighta, including user registration, email verification, login, refresh tokens, password reset, OTP recovery, notifications, and user audit logs.

The codebase follows a layered structure (`routes -> controllers/services -> models`) with centralized configuration, middleware, logging, and error handling so it can be reviewed, tested, and extended predictably.

## Features

- User registration, login, logout, and authenticated profile access
- JWT access tokens with refresh-token support
- Email verification with Redis-backed verification codes
- Password reset links and OTP-based password recovery
- Notification listing, creation, read-state updates, and cleanup
- User-scoped audit log listing, creation, and retention cleanup
- Request validation with `express-validator`
- Security middleware for CORS, HTTP headers, parameter pollution protection, JSON body limits, and rate limiting
- MongoDB persistence through Mongoose models and indexes
- Redis support for short-lived token and verification state
- Structured application logging with Winston and HTTP request logging with Morgan

## Tech Stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js 18+ |
| Web framework | Express 4 |
| Database | MongoDB, Mongoose |
| Cache / token state | Redis via ioredis |
| Authentication | JSON Web Tokens, bcryptjs |
| Validation | express-validator, validator |
| Email | Nodemailer |
| Security | Helmet, CORS, HPP, express-rate-limit |
| Logging | Winston, Morgan |
| Tests | Node.js built-in test runner |

## Project Structure

```text
.
├── app.js                 # Express app composition and route mounting
├── server.js              # Runtime bootstrap, config validation, DB connection, shutdown handling
├── config/                # Environment config, MongoDB connection, Redis client
├── controllers/           # Request handlers for multi-step workflows
├── middlewares/           # Authentication, rate limiting, and error handling
├── models/                # Mongoose schemas and indexes
├── routes/                # API route definitions and route-level validation
├── services/              # Reusable business logic helpers
├── utils/                 # Logging, email, JWT, hashing, date, and response helpers
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- MongoDB
- Redis
- SMTP credentials for email-based flows

### Installation

```bash
npm install
```

### Environment Configuration

Create a local environment file from the example:

```bash
cp .env.example .env
```

Required settings:

| Variable | Description |
| --- | --- |
| `PORT` | API port. Defaults to `5000`. |
| `CLIENT_URL` | Trusted frontend origin used for CORS and reset links. |
| `MONGO_URI` | Full MongoDB connection string. Alternatively configure `MONGO_USER`, `MONGO_PASS`, `MONGO_HOST`, `MONGO_PORT`, and `MONGO_DB`. |
| `REDIS_HOST`, `REDIS_PORT` | Redis connection settings. |
| `JWT_ACCESS_SECRET` | Secret used to sign access tokens. |
| `JWT_REFRESH_SECRET` | Secret used to sign refresh tokens. |
| `EMAIL_USER`, `EMAIL_PASS` | SMTP account used by Nodemailer. |
| `FRONTEND_URL` | Frontend base URL used in password-reset emails. |

> Use strong, unique secrets in every deployed environment. Do not commit real credentials.

### Run the API

```bash
npm start
```

Development mode with automatic restarts:

```bash
npm run dev
```

Health check:

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{ "status": "ok" }
```

## API Overview

All protected endpoints require an `Authorization: Bearer <accessToken>` header unless noted otherwise.

### Authentication

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `GET` | `/api/auth` | Auth module health check | No |
| `POST` | `/api/auth/register` | Register a user and send verification email | No |
| `POST` | `/api/auth/verify-email` | Verify a registration OTP | No |
| `POST` | `/api/auth/login` | Authenticate and issue tokens | No |
| `POST` | `/api/auth/logout` | Revoke the active refresh token | Yes |
| `POST` | `/api/tokens/refresh` | Issue a new access token from a refresh token | No |

### Password Recovery

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/api/password-resets/request` | Send a password-reset link | No |
| `GET` | `/api/password-resets/verify/:token` | Validate a reset token | No |
| `POST` | `/api/password-resets/reset-password` | Reset a password with a valid token | No |
| `POST` | `/api/otp-codes/request` | Send an OTP to a user email | No |
| `POST` | `/api/otp-codes/verify` | Verify an OTP | No |
| `POST` | `/api/otp-codes/reset-password` | Reset password using OTP | No |

### Users and Profiles

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `GET` | `/api/users` | List users with pagination | Yes |
| `GET` | `/api/users/me` | Return the authenticated user | Yes |
| `POST` | `/api/profile` | Create a profile/user record | Yes |
| `GET` | `/api/profile` | Read the authenticated profile | Yes |
| `PUT` | `/api/profile` | Update the authenticated profile | Yes |
| `DELETE` | `/api/profile/:id` | Delete a user by id | Yes |

### Notifications, Logs, and Protected Routes

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `GET` | `/api/notifications` | List user notifications | Yes |
| `POST` | `/api/notifications/create` | Create a notification | Yes |
| `PATCH` | `/api/notifications/read` | Mark notifications as read | Yes |
| `DELETE` | `/api/notifications/clear` | Delete read notifications | Yes |
| `GET` | `/api/logs` | List user logs with filters and pagination | Yes |
| `POST` | `/api/logs` | Create a user log entry | Yes |
| `DELETE` | `/api/logs/cleanup` | Delete old user logs | Yes |
| `GET` | `/api/protected` | Validate protected access | Yes |
| `GET` | `/api/protected/profile` | Return protected profile payload | Yes |
| `GET` | `/api/protected/admin` | Admin-only protected route | Yes, admin role |

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the production server entrypoint. |
| `npm run dev` | Start the API with Nodemon. |
| `npm test` | Run automated tests with Node's built-in test runner. |

## Testing

```bash
npm test
```

The current automated coverage validates shared utility behavior. Before production deployment, add integration tests for MongoDB, Redis, authentication, email verification, password reset, OTP reset, notifications, and log workflows.

## Security Notes

- Keep access-token and refresh-token secrets separate.
- Restrict CORS to trusted frontend origins.
- Run MongoDB and Redis on private networks with authentication enabled.
- Use a transactional or least-privilege SMTP provider for email delivery.
- Avoid logging passwords, tokens, reset links, or OTP values in production.
- Rotate secrets immediately if they are exposed.

## Production Readiness Checklist

- [ ] Configure real MongoDB, Redis, and SMTP credentials.
- [ ] Run integration tests against an isolated test database.
- [ ] Verify token refresh, logout, reset-link, and OTP expiry behavior.
- [ ] Configure centralized log collection and alerting.
- [ ] Set up CI to run tests and syntax checks on every pull request.
- [ ] Review admin authorization and role assignment before enabling admin-only routes.

## License

MIT
