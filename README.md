# Stock Forum

A full-stack web application that allows users to list stocks, comment on them, and rank them with likes or dislikes. Users can also reply to comments and rank comments with likes or dislikes.

## Features

- User authentication (register, login, logout)
- Create, view, and delete stocks
- Like/dislike stocks
- Comment on stocks
- Reply to comments
- Like/dislike comments
- User profiles

## Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

## Installation

### Clone the repository

```bash
git clone <repository-url>
cd stock-forum
```

### Backend Setup

1. Install dependencies:

```bash
cd server
npm install
```

2. Create a `.env` file in the server directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stock-forum
JWT_SECRET=your-secret-key
```

3. Start the server:

```bash
npm run dev
```

The server will run on http://localhost:5000

### Frontend Setup

1. Open a new terminal and install dependencies:

```bash
cd client
npm install
```

2. Start the React application:

```bash
npm start
```

The frontend will run on http://localhost:3000

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Stocks

- `GET /api/stocks` - Get all stocks
- `GET /api/stocks/:id` - Get a single stock
- `POST /api/stocks` - Create a new stock (protected)
- `PUT /api/stocks/:id` - Update a stock (protected)
- `DELETE /api/stocks/:id` - Delete a stock (protected)
- `POST /api/stocks/:id/like` - Like a stock (protected)
- `POST /api/stocks/:id/dislike` - Dislike a stock (protected)

### Comments

- `GET /api/comments/stock/:stockId` - Get all comments for a stock
- `POST /api/comments` - Create a new comment (protected)
- `PUT /api/comments/:id` - Update a comment (protected)
- `DELETE /api/comments/:id` - Delete a comment (protected)
- `POST /api/comments/:id/like` - Like a comment (protected)
- `POST /api/comments/:id/dislike` - Dislike a comment (protected)

## Project Structure

```
stock-forum/
├── client/                 # Frontend React application
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components
│       ├── context/        # React context for state management
│       ├── pages/          # Page components
│       ├── services/       # API service functions
│       └── utils/          # Utility functions
├── server/                 # Backend Node.js/Express application
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   └── routes/             # API routes
└── README.md
```

## License

MIT
