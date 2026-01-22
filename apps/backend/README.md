# Habit Tracker Backend API

Node.js + Express + Prisma + PostgreSQL backend for the Habit Tracker application.

## 🚀 Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Language**: TypeScript

## 📁 Project Structure

```
apps/backend/
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Database migrations
│   └── seed.ts            # Test data seeder
├── src/
│   ├── config/            # Configuration (env, database)
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── validators/        # Zod schemas
│   ├── utils/             # Helper functions
│   ├── types/             # TypeScript types
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
└── package.json
```

## 🛠️ Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm 9+

### Installation

1. **Navigate to backend directory**:
   ```bash
   cd apps/backend
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables** (edit `.env`):
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/habit_tracker?schema=public"
   JWT_SECRET=your-super-secret-jwt-key-change-this
   PORT=3000
   NODE_ENV=development
   ```

4. **Install dependencies** (from root):
   ```bash
   cd ../..  # Go to root
   npm install
   ```

5. **Generate Prisma Client**:
   ```bash
   cd apps/backend
   npm run generate
   ```

6. **Run database migrations**:
   ```bash
   npm run migrate
   ```

7. **Seed database with test data** (optional):
   ```bash
   npm run seed
   ```

## 🏃 Running the Server

### Development Mode

```bash
npm run dev
```

Server will start on `http://localhost:3000` with hot-reload.

### Production Mode

```bash
npm run build
npm start
```

## 📡 API Endpoints

### Health Check

```
GET /api/health
```

### Authentication

```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
GET    /api/auth/me            - Get current user (protected)
POST   /api/auth/logout        - Logout user (protected)
PATCH  /api/auth/profile       - Update profile (protected)
POST   /api/auth/change-password - Change password (protected)
```

### Habits

```
POST   /api/habits             - Create habit (protected)
GET    /api/habits             - Get all habits (protected)
GET    /api/habits/:id         - Get single habit (protected)
PATCH  /api/habits/:id         - Update habit (protected)
DELETE /api/habits/:id         - Delete habit (protected)
GET    /api/habits/:id/stats   - Get habit statistics (protected)
```

### Completions

```
POST   /api/completions                    - Mark habit complete (protected)
DELETE /api/completions/:habitId/:date     - Unmark completion (protected)
GET    /api/completions                    - Get completions (protected)
GET    /api/completions/calendar/:year/:month - Get monthly calendar (protected)
```

## 🧪 Testing

Test credentials (after running seed):
- **Email**: test@example.com
- **Password**: Test1234

### Example API Calls

**Register**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Test1234","name":"John Doe"}'
```

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
```

**Create Habit** (requires token):
```bash
curl -X POST http://localhost:3000/api/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"Morning Run","monthlyGoal":20,"color":"#6C63FF","icon":"🏃"}'
```

## 🗄️ Database

### View Database

```bash
npm run studio
```

Opens Prisma Studio at `http://localhost:5555` to view/edit data.

### Create Migration

```bash
npm run migrate
```

### Reset Database

```bash
npx prisma migrate reset
```

This will:
1. Drop the database
2. Create a new database
3. Run all migrations
4. Run seed script

## 🔐 Security Features

- **bcrypt**: Password hashing (10 salt rounds)
- **JWT**: Stateless authentication (7-day expiry)
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes
- **Input Validation**: Zod schemas on all endpoints

## 📊 Database Schema

### Users
- Email/password authentication
- User preferences (step goal, reminder time, theme)
- Account status flags

### Habits
- Title, monthly goal (1-31 days)
- Color and icon for UI
- Notification settings
- Soft delete (archivedAt)

### Completions
- Links habits to completion dates
- Unique constraint: one completion per habit per day
- Used for streak calculations

## 🚨 Error Handling

All errors return standardized format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {} // Optional, only in development
  }
}
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret for JWT signing | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:8081 |

## 🏗️ Development

### Code Structure

- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic and database operations
- **Validators**: Zod schemas for input validation
- **Middleware**: Authentication, validation, error handling
- **Utils**: Helper functions (errors, async wrapper, responses)

### Adding New Endpoints

1. Create service in `src/services/`
2. Create validator in `src/validators/`
3. Create controller in `src/controllers/`
4. Add routes in `src/routes/`
5. Update route index

## 🐛 Troubleshooting

**Database connection errors**:
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists

**Migration errors**:
- Reset database: `npx prisma migrate reset`
- Regenerate client: `npm run generate`

**Port already in use**:
- Change PORT in .env
- Or kill process: `lsof -ti:3000 | xargs kill`

## 📚 Resources

- [Express.js Docs](https://expressjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Zod Docs](https://zod.dev/)

---

Built with ❤️ using Node.js and TypeScript
