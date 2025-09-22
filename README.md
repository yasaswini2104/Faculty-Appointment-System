# Faculty Appointment Scheduling System

A comprehensive web application for managing faculty appointments with authentication, scheduling, availability tracking, calendar integration, and real-time notifications.

Built with **React, JavaScript, Vite, TailwindCSS, Node.js, Express, and MongoDB**.

---

## Features

* User Authentication with Role-Based Access Control (Student, Faculty, Admin)
* Faculty Directory with Profiles
* Appointment Scheduling, Rescheduling, and Cancellation
* Faculty Availability Management with Conflict Prevention
* Real-time Notifications via Email and In-App Alerts
* Calendar Integration (Google Calendar / Outlook)
* Minutes of Meeting (MoM) Management
* Responsive and Mobile-Friendly Web Interface

---

## Project Scope

The system is designed to:

* Provide secure login for students, faculty, and administrators
* Allow students to search faculty, view availability, and book/reschedule appointments
* Enable faculty to manage availability, set office hours, and approve/reschedule appointments
* Prevent double bookings and scheduling conflicts
* Allow administrators to monitor system usage, manage accounts, and generate reports
* Send automated notifications and reminders via email and app notifications
* Record and manage Minutes of Meetings (MoM) for better documentation

**Not included in the initial version**:

* AI-based scheduling optimization
* Dedicated mobile app (only responsive web app provided)
* Offline functionality
* Payment processing

---

## Project Structure

* **Frontend**: React + JavaScript + TailwindCSS (Vite)
* **Backend**: Node.js + Express
* **Database**: MongoDB

---

## Setup Instructions

### Prerequisites

* Node.js (v14 or higher)
* MongoDB Atlas account (or local MongoDB)
* Git

### Backend Setup

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

1. Create a `.env` file in the root directory using `.env.example`:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   PORT=5000
   ```

2. Install dependencies and start the server:

   ```sh
   npm install
   node server/server.js
   ```

### Frontend Setup

1. Create a `.env` file in the root directory:

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

2. Install frontend dependencies and run the dev server:

   ```sh
   npm install
   npm run dev
   ```

---

## API Endpoints

### Authentication

* `POST /api/users/login` → User login
* `POST /api/users` → Register new user
* `GET /api/users/profile` → Get profile
* `PUT /api/users/profile` → Update profile

### Faculty

* `GET /api/users/faculty` → Get all faculty
* `GET /api/users/faculty/:id` → Get faculty by ID

### Availability

* `POST /api/availability` → Create availability
* `GET /api/availability/me` → Get my availability
* `GET /api/availability/faculty/:id` → Get faculty availability
* `PUT /api/availability/:id` → Update availability
* `DELETE /api/availability/:id` → Delete availability

### Appointments

* `POST /api/appointments` → Create appointment
* `GET /api/appointments/me` → Get my appointments
* `GET /api/appointments/:id` → Get appointment by ID
* `PUT /api/appointments/:id` → Update appointment status

### Notifications

* `GET /api/notifications` → Get notifications
* `PUT /api/notifications/:id` → Mark as read
* `PUT /api/notifications/read-all` → Mark all as read

---

## Non-Functional Requirements

* Response time: <3 seconds under normal load
* Uptime: 99.9% (excluding scheduled maintenance)
* Scalability: Supports 500+ concurrent users
* Security: MFA for faculty/admin, role-based access, and encrypted storage
* Accessibility: WCAG-compliant responsive web interface
* Notifications: Sent at least 30 minutes before an appointment
* Future ready: Designed for AI-based scheduling and mobile app integration

---

## Deployment

* Frontend can be deployed on **Vercel, Netlify, or GitHub Pages**
* Backend can be deployed on **Render, Railway, or any Node.js hosting service**
* Database hosted on **MongoDB Atlas**
