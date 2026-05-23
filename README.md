# DevPulse 🚀

> A collaborative issue tracking backend system for software teams to report bugs, suggest features, and manage issue workflows efficiently.

---

### 🌐 Live URL

Add your live backend URL here:

```bash
https://dev-pulse-assi-2.vercel.app

```

---

### 📌 Features

- User Authentication with JWT
- Role-based Authorization (Contributor & Maintainer)
- Secure Password Hashing using bcrypt
- Create, Update, Delete & Manage Issues
- Issue Workflow Status Management
- Protected Routes using Middleware
- PostgreSQL Database Integration
- Raw SQL Queries using pg
- Structured Modular Architecture
- Error Handling & Validation
- RESTful API Design

---

### 👥 User Roles

**Contributor**
-Register & Login
-Create Issues
-View All Issues
-View Single Issue
**Maintainer**
-All Contributor Permissions
-Update Any Issue
-Delete Any Issue
-Change Issue Status
-Access Internal Metrics

---

### 🛠️ Tech Stack

| Technology   | Usage                 |
| ------------ | --------------------- |
| Node.js      | Backend Runtime       |
| Express.js   | Server Framework      |
| TypeScript   | Type Safety           |
| PostgreSQL   | Database              |
| pg           | PostgreSQL Driver     |
| bcrypt       | Password Hashing      |
| jsonwebtoken | JWT Authentication    |
| dotenv       | Environment Variables |
| cors         | Cross-Origin Support  |

---

##⚙️ Installation & Setup

### 1️⃣ Clone Repository

```
git clone https://github.com/your-username/devpulse.git
```

### 2️⃣ Navigate to Project

```
cd devpulse
```

###3️⃣ Install Dependencies

```
npm install
```

###4️⃣ Create .env File

```
PORT=5000


DATABASE_URL=your_postgresql_database_url

JWT_SECRET=your_secret_key

```

###5️⃣ Run Development Server

```
npm run dev

```

---

## 🗄️ Database Schema Summary

###Users Table

| Column     | Description              |
| ---------- | ------------------------ |
| id         | Unique user ID           |
| name       | Full name                |
| email      | Unique email             |
| password   | Encrypted password       |
| role       | contributor / maintainer |
| created_at | Account creation time    |
| updated_at | Last update time         |

---

## Issues Table

| Column      | Description                   |
| ----------- | ----------------------------- |
| id          | Unique issue ID               |
| title       | Issue title                   |
| description | Issue details                 |
| type        | bug / feature_request         |
| status      | open / in_progress / resolved |
| reporter_id | User who created the issue    |
| created_at  | Creation timestamp            |
| updated_at  | Update timestamp              |

---

## 📡 API Endpoints

---

### 🔐 Auth Routes

| Method | Endpoint           | Description       |
| ------ | ------------------ | ----------------- |
| POST   | `/api/auth/signup` | Register new user |
| POST   | `/api/auth/login`  | Login user        |

---

### 👤 User Routes

| Method | Endpoint        | Description     |
| ------ | --------------- | --------------- |
| GET    | `/api/auth`     | Get all users   |
| GET    | `/api/auth/:id` | Get single user |
| PATCH  | `/api/auth/:id` | Update user     |
| DELETE | `/api/auth/:id` | Delete user     |

---

### 🐞 Issue Routes

| Method | Endpoint          | Description      |
| ------ | ----------------- | ---------------- |
| POST   | `/api/issues`     | Create issue     |
| GET    | `/api/issues`     | Get all issues   |
| GET    | `/api/issues/:id` | Get single issue |
| PATCH  | `/api/issues/:id` | Update issue     |
| DELETE | `/api/issues/:id` | Delete issue     |

---

## 🗂️ Project Structure

src/
│
├── config/

├── db/
├── middlewares/
├── modules/
│ ├── auth/
│ ├── user/
│ └── issue/
│
├── app.ts
└── server.ts

## 🚀 Future Improvements

-Pagination & filtering for issues
-Advanced search system
-Admin metrics dashboard
-Refresh token system
-API rate limiting
-Swagger documentation

##👨‍💻 Author

Developed by Yasin 🚀
