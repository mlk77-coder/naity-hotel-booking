# Naity Hotel Booking Platform

A full-stack hotel booking platform with React frontend and Node.js/Express/MySQL backend.

## Project Structure

```
naity-hotel-booking/
├── app/                    # React frontend application
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
│
└── naity-backend/         # Node.js/Express backend
    ├── routes/            # API route handlers
    ├── middleware/        # Authentication & validation
    ├── config/            # Database configuration
    └── index.js           # Main server file
```

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS + shadcn/ui components
- React Router for navigation

### Backend
- Node.js with Express
- MySQL database
- JWT authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd naity-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with your configuration:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=naitagfz_db
JWT_SECRET=your_jwt_secret
PORT=3000
```

4. Import the database schema (see `naity-backend/complete-database-setup.sql`)

5. Start the backend server:
```bash
npm start
```

Backend will run on http://localhost:3000

### Frontend Setup

1. Navigate to app directory:
```bash
cd app
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on http://localhost:8080

## Admin Access

Default admin credentials:
- Email: admin@naitagfz.com
- Password: Admin@Naity2024

## API Documentation

The backend provides RESTful APIs for:
- User authentication & management
- Hotel listings & details
- Room management
- Booking operations
- Admin panel operations
- Contact messages
- API company integrations

## Features

- Hotel search and filtering
- Room availability checking
- Secure booking system
- User authentication
- Admin dashboard
- Hotel manager panel
- Partner management
- Multi-language support (English/Arabic)

## License

Proprietary - All rights reserved
