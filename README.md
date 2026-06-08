# ⚡ Primetrade – Scalable REST API with Auth & RBAC

> Backend Developer Intern Assignment | Built with Node.js, Express, Prisma, PostgreSQL & React.js

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express.js |
| ORM | Prisma v6 |
| Database | PostgreSQL |
| Auth | JWT + bcryptjs |
| Validation | express-validator |
| API Docs | Swagger UI (OpenAPI 3.0) |
| Frontend | React.js + React Router |
| HTTP Client | Axios |

---

## 📁 Project Structure

```
Primetrade/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # DB schema (User, Task)
│   │   └── seed.js            # Demo data seeder
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js    # Prisma client
│   │   │   └── swagger.js     # Swagger config
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── task.controller.js
│   │   │   └── admin.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js    # JWT + RBAC
│   │   │   ├── validate.middleware.js
│   │   │   ├── validators.js
│   │   │   └── error.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── task.routes.js
│   │   │   └── admin.routes.js
│   │   └── app.js
│   ├── server.js
│   └── .env
└── frontend/
    └── src/
        ├── context/AuthContext.js
        ├── services/api.js
        ├── pages/ (Login, Register, Dashboard, Tasks, AdminPanel)
        └── components/ (Layout, Sidebar, ProtectedRoute)
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js >= 18
- PostgreSQL running locally (or use a cloud DB like Neon/Supabase)

### Backend

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env → set your DATABASE_URL

# 3. Run database migrations
npx prisma migrate dev --name init

# 4. Seed demo data
npm run db:seed

# 5. Start dev server
npm run dev
```

**Server running on:** `http://localhost:5000`
**Swagger Docs:** `http://localhost:5000/api-docs`

### Frontend

```bash
cd frontend
npm install
npm start
```

**App running on:** `http://localhost:3000`

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@primetrade.ai | Admin123 |
| User | john@example.com | User1234 |

---

## 📡 API Endpoints (v1)

### Auth (`/api/v1/auth`)
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Login & get JWT |
| GET | `/me` | ✅ | Get current user |

### Tasks (`/api/v1/tasks`)
| Method | Route | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/` | ✅ | USER/ADMIN | List tasks (paginated, filtered) |
| GET | `/:id` | ✅ | USER/ADMIN | Get task by ID |
| POST | `/` | ✅ | USER/ADMIN | Create task |
| PUT | `/:id` | ✅ | USER/ADMIN | Update task |
| DELETE | `/:id` | ✅ | USER/ADMIN | Delete task |

> Users see only their own tasks. Admins see all tasks.

### Admin (`/api/v1/admin`)
| Method | Route | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/stats` | ✅ | ADMIN | Dashboard statistics |
| GET | `/users` | ✅ | ADMIN | List all users |
| DELETE | `/users/:id` | ✅ | ADMIN | Delete a user |
| PATCH | `/users/:id/role` | ✅ | ADMIN | Update user role |

---

## 🛡️ Security Features

- **Password Hashing**: bcryptjs with salt rounds = 12
- **JWT Auth**: Signed tokens with 7-day expiry
- **Rate Limiting**: 100 req/15min globally; 10 req/15min on auth routes
- **Helmet**: HTTP security headers
- **CORS**: Configured to allow only the frontend origin
- **Input Validation**: express-validator on all endpoints
- **Role Guards**: Middleware-enforced USER/ADMIN separation

---

## 📊 Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(USER)   // USER | ADMIN
  tasks     Task[]
}

model Task {
  id          String     @id @default(uuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)     // TODO | IN_PROGRESS | DONE
  priority    Priority   @default(MEDIUM)   // LOW | MEDIUM | HIGH
  dueDate     DateTime?
  userId      String
  user        User       @relation(...)
}
```

---

## 📈 Scalability Notes

1. **API Versioning** – All routes under `/api/v1/` enable future `/api/v2/` without breaking changes.
2. **Modular Architecture** – Controllers, routes, and middleware are separated for easy addition of new modules (e.g., products, notes).
3. **Caching** – Redis can be added to cache `GET /tasks` and admin stats for high-traffic scenarios.
4. **Horizontal Scaling** – Stateless JWT auth means multiple backend instances can run behind a load balancer (e.g., Nginx, AWS ALB) without session stickiness.
5. **Database Connection Pooling** – Prisma supports PgBouncer for managing connection pools under load.
6. **Docker** – Add a `Dockerfile` per service and `docker-compose.yml` to containerize backend + PostgreSQL + Redis.
7. **Microservices** – Auth service can be extracted as a separate microservice; tasks can become its own service behind an API gateway.

---

## 📖 API Documentation

Swagger UI: **http://localhost:5000/api-docs**

All endpoints are documented with:
- Request body schemas
- Response schemas
- Authentication requirements
- Error codes

---

*Built for the Primetrade.ai Backend Developer Intern Assignment*
