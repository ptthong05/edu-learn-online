# Installation Guide

## System Requirements

| Software | Minimum Version |
|----------|----------------|
| Node.js | v18.0+ |
| npm | v9.0+ |
| Git | Any |

## Clone the Project

```bash
git clone <repository-url>
cd edu-learn-project
```

## Backend Setup

```bash
cd backend
npm install
```

### Environment Configuration

Create `.env` in the `backend/` directory:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
```

### Start Backend

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Backend runs at: `http://localhost:5000`

## Frontend Setup

```bash
cd frontend
npm install
```

### Environment Configuration

Create `.env.local` in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Start Frontend

```bash
npm run dev
```

Frontend runs at: `http://localhost:3000`

## Database

- Uses **SQLite** – no additional installation required
- Database file: `backend/database.sqlite`
- Auto-initialized on first backend startup
