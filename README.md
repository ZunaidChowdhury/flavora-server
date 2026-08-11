# ⚙️ Flavora — REST API Backend

The backend engine powering Flavora, a recipe sharing and community cookbook platform. It is built as a robust Express + TypeScript application utilizing Prisma ORM and PostgreSQL.

---

## ⚡ Features

- **🔑 JWT Authentication**: Token-based login and registration routes with role validation (`USER` / `ADMIN`).
- **📖 API Documentation**: Fully mapped path references and request models inside [`API.md`](./API.md).
- **📂 Database Integration**: Prisma schema with automated PostgreSQL schema migrations.
- **👁️ Access Control**: Custom middlewares (`verifyToken`, `verifyUser`, `verifyAdmin`) securing recipe manipulation, deletion, and visibility.
- **✨ Seeding**: Single-command execution database seeder creating initial categories, users, reviews, and featured recipes.
- **☁️ Serverless Compatibility**: Out-of-the-box configuration with `vercel.json` deployment rules.

---

## 🛠️ Technology Stack

- **Server**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database ORM**: [Prisma ORM](https://www.prisma.io/)
- **Database**: PostgreSQL (Supabase / Local)
- **Encryption**: [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- **Authentication**: JWT (JSON Web Tokens)

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) and a PostgreSQL instance running.

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/flavora_db?schema=public"
JWT_SECRET="your-jwt-secure-secret-key"
JWT_EXPIRES_IN="7d"
ADMIN_EMAIL="someone@something.com"
CORS_ORIGIN="http://localhost:3000"
```

### 3. Installation
Install the project dependencies:
```bash
npm install
```

### 4. Database Setup
Push the database schema and generate the Prisma Client:
```bash
npx prisma db push
```

*(Optional)* Run the seed script to load mock users and recipes:
```bash
npm run seed
```

### 5. Running Locally
Run the server in development mode with auto-reload:
```bash
npm run dev
```
The server will boot at [http://localhost:5000](http://localhost:5000).

---

## 📂 API Reference

For detailed documentation on endpoints, payloads, and response envelopes, read:
👉 **[Flavora API Reference Guide (`API.md`)](./API.md)**

---

## ☁️ Deployment

This backend is ready for serverless deployment on **Vercel** out-of-the-box using the configured `vercel.json`.
For deployment steps, please read **`deployment_guide.md`** inside your project artifacts.
