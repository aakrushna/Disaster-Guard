# Disaster Management Backend API

This is the backend API for the Disaster Management application. It provides endpoints for user authentication, disaster reporting, and geospatial queries.

## Features

- User authentication (register, login, profile management)
- Disaster reporting and management
- Geospatial queries for disasters within a radius
- Disaster statistics and analytics

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- GeoJSON for geospatial data

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user profile (protected)
- `PUT /api/auth/me` - Update user profile (protected)

### Disasters

- `GET /api/disasters` - Get all disasters (with optional filters)
- `GET /api/disasters/stats` - Get disaster statistics
- `GET /api/disasters/radius/:lat/:lng/:distance` - Get disasters within a radius (in km)
- `GET /api/disasters/:id` - Get a single disaster
- `POST /api/disasters` - Create a new disaster report (protected)
- `PUT /api/disasters/:id` - Update a disaster (protected)
- `DELETE /api/disasters/:id` - Delete a disaster (protected)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

3. Seed the database with sample data:
   ```
   npm run data:import
   ```

4. Start the server:
   ```
   npm run dev
   ```

## Sample Users

After running the seeder, you can use these accounts:

- Admin: admin@example.com / password123
- User: john@example.com / password123
- User: jane@example.com / password123 