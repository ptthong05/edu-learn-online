# Project Structure

## Overview

```
edu-learn-project/
├── backend/             # Node.js + Express server
│   ├── index.js         # Main entry, all API routes defined here
│   ├── db.js            # SQLite database initialization & schema
│   ├── middleware.js     # JWT authentication middleware
│   ├── emailService.js  # Email sending service
│   ├── migrations/      # Database migrations
│   ├── uploads/         # Uploaded files (images, documents)
│   └── .env             # Environment variables
│
└── frontend/            # Next.js 14 App Router
    └── src/
        ├── app/
        │   ├── (auth)/          # Login, Register pages
        │   ├── (client)/        # User-facing pages
        │   │   ├── page.tsx     # Homepage
        │   │   ├── courses/     # Course listing & detail
        │   │   ├── blog/        # Blog pages
        │   │   ├── cart/        # Shopping cart
        │   │   ├── checkout/    # Payment checkout
        │   │   ├── combos/      # Course combo packages
        │   │   └── tai-khoan/   # Account page
        │   ├── admin/           # Admin area
        │   │   ├── page.tsx     # Dashboard
        │   │   ├── courses/     # Course management
        │   │   ├── users/       # User management
        │   │   ├── orders/      # Order management
        │   │   ├── coupons/     # Coupon management
        │   │   ├── affiliates/  # Affiliate management
        │   │   ├── blogs/       # Blog management
        │   │   └── site-settings/ # Site configuration
        │   └── api/             # Next.js API routes (proxy)
        ├── components/
        │   ├── client/
        │   │   └── layout/
        │   │       ├── Header.tsx
        │   │       └── Footer.tsx
        │   └── ui/              # Shared UI components
        ├── lib/
        │   ├── hooks/           # Custom React hooks
        │   ├── utils/           # Utility functions
        │   └── useSiteSettings.ts # Hook for site settings
        └── types/               # TypeScript type definitions
```

## Technology Stack

### Frontend
| Library | Purpose |
|---------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Static type checking |
| Tailwind CSS | Utility-first styling |
| React Hook Form | Form state management |

### Backend
| Library | Purpose |
|---------|---------|
| Express.js 5 | HTTP server & routing |
| SQLite + sqlite3 | Embedded database |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| multer | File upload handling |
| nodemailer | Email sending |
| cors | Cross-Origin Resource Sharing |
| dotenv | Environment variable management |
