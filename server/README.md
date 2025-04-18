
# Faculty Appointment Scheduling System

A comprehensive web application for faculty appointment scheduling with authentication, appointment management, and notification system.

## Features

- User Authentication (Student, Faculty, Admin roles)
- Faculty Directory
- Appointment Scheduling
- Faculty Availability Management
- Real-time Notifications
- Dashboard views for each user role

## Project Structure

- Frontend: React with TypeScript and ShadCN UI components
- Backend: Node.js with Express and MongoDB

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- Git

### Backend Setup

1. Create a `.env` file in the root directory using the `.env.example` as a template:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PORT=4000
```

2. Install backend dependencies and start the server:
```bash
npm install
node server/server.js
```

### Frontend Setup

1. Create a `.env` file in the root directory:
```
VITE_API_URL=http://localhost:4000/api
```

2. Install frontend dependencies and start the development server:
```bash
npm install
npm run dev
```

## API Endpoints

### Authentication
- POST /api/users/login - User login
- POST /api/users - Register new user
- GET /api/users/profile - Get user profile
- PUT /api/users/profile - Update user profile

### Faculty
- GET /api/users/faculty - Get all faculty
- GET /api/users/faculty/:id - Get faculty by ID

### Availability
- POST /api/availability - Create availability
- GET /api/availability/me - Get my availability
- GET /api/availability/faculty/:id - Get faculty availability
- PUT /api/availability/:id - Update availability
- DELETE /api/availability/:id - Delete availability

### Appointments
- POST /api/appointments - Create appointment
- GET /api/appointments/me - Get my appointments
- GET /api/appointments/:id - Get appointment by ID
- PUT /api/appointments/:id - Update appointment status

### Notifications
- GET /api/notifications - Get my notifications
- PUT /api/notifications/:id - Mark notification as read
- PUT /api/notifications/read-all - Mark all notifications as read

## Database Models

### User
- name: String
- email: String (unique)
- password: String (hashed)
- role: String (student, faculty, admin)
- department: String (for faculty)
- position: String (for faculty)
- bio: String (for faculty)
- profileImage: String

### Availability
- faculty: ObjectId (ref: User)
- dayOfWeek: String
- startTime: String
- endTime: String
- isRecurring: Boolean
- date: Date (for non-recurring)

### Appointment
- student: ObjectId (ref: User)
- faculty: ObjectId (ref: User)
- date: Date
- startTime: String
- endTime: String
- status: String (pending, approved, rejected, canceled, completed)
- reason: String
- notes: String

### Notification
- recipient: ObjectId (ref: User)
- sender: ObjectId (ref: User)
- type: String
- content: String
- read: Boolean
- relatedAppointment: ObjectId (ref: Appointment)
