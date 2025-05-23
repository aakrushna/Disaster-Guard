# DisasterGuard - Disaster Management Website

A comprehensive disaster management website built with the MERN stack (MongoDB, Express, React, Node.js) and Vite.

## Features

- Beautiful and responsive UI
- Information about different types of disasters
- Disaster preparedness resources
- Emergency response coordination
- Contact information
- User authentication and authorization
- Interactive maps for disaster zones
- Real-time disaster reporting and tracking

## Tech Stack

### Frontend
- React (with Vite)
- React Router for navigation
- CSS for styling
- Font Awesome for icons
- Google Maps API for mapping features

### Backend
- Node.js
- Express
- MongoDB Atlas for database
- JWT for authentication
- Mongoose for database modeling

## Project Structure

```
disaster-management/
├── client/                 # Frontend React application
│   ├── public/             # Public assets
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/          # Page components
│       ├── styles/         # CSS styles
│       ├── context/        # React Context providers
│       ├── services/       # API services
│       ├── App.jsx         # Main App component
│       └── main.jsx        # Entry point
├── server/                 # Backend Node.js/Express application
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── config/            # Configuration files
│   ├── .env               # Environment variables (not in git)
│   ├── .env.example       # Example environment variables
│   └── index.js           # Server entry point
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. Create a new cluster:
   - Click "Build a Cluster"
   - Choose the FREE tier
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. Set up database access:
   - Go to "Database Access" under Security
   - Click "Add New Database User"
   - Create a username and password
   - Set user privileges to "Read and Write to any database"
   - Save the credentials

4. Configure network access:
   - Go to "Network Access" under Security
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Confirm

5. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user's password
   - Replace `<dbname>` with your preferred database name

6. Create a `.env` file in the server directory using the template from `.env.example`:
   ```
   MONGODB_URI=your_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/disaster-management.git
   cd disaster-management
   ```

2. Install server dependencies
   ```
   cd server
   npm install
   ```

3. Install client dependencies
   ```
   cd ../client
   npm install
   ```

4. Set up environment variables:
   - Copy `.env.example` to `.env` in the server directory
   - Update the variables with your MongoDB Atlas URI and other configurations

### Running the Application

1. Start the backend server
   ```
   cd server
   npm run dev
   ```

2. Start the frontend development server
   ```
   cd client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Replace the placeholder values with your actual configuration values.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 