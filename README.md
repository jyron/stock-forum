# Stock Forum

A full-stack web application for discussing and rating stocks. Users can create, view, like/dislike stocks, and comment on them.

## Features

- **Stock Management**: Create, view, update, and delete stocks
- **User Authentication**: Register, login, and logout functionality
- **Stock Rating**: Like and dislike stocks
- **Comments**: Add comments to stocks with nested replies
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend

- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend

- React.js with React Router
- Axios for API calls
- Context API for state management

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd stock-forum
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup

Create a `.env` file in the `server` directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stock-forum
JWT_SECRET=your-secret-key-change-this-in-production
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# If using MongoDB locally
mongod
```

### 5. Run the application

#### Option 1: Run both frontend and backend together (from root directory)

```bash
npm run dev
```

#### Option 2: Run separately

```bash
# Terminal 1 - Start backend server
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm start
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Stocks

- `GET /api/stocks` - Get all stocks
- `GET /api/stocks/:id` - Get stock by ID
- `GET /api/stocks/symbol/:symbol` - Get stock by symbol
- `POST /api/stocks` - Create new stock (protected)
- `PUT /api/stocks/:id` - Update stock (protected)
- `DELETE /api/stocks/:id` - Delete stock (protected)
- `POST /api/stocks/:id/like` - Like a stock
- `POST /api/stocks/:id/dislike` - Dislike a stock

### Comments

- `GET /api/comments/stock/:stockId` - Get comments for a stock
- `POST /api/comments` - Create new comment
- `PUT /api/comments/:id` - Update comment (protected)
- `DELETE /api/comments/:id` - Delete comment (protected)
- `POST /api/comments/:id/like` - Like a comment
- `POST /api/comments/:id/dislike` - Dislike a comment

## Usage

1. **Register/Login**: Create an account or login to access full features
2. **Browse Stocks**: View all stocks on the home page with prices, likes, and comment counts
3. **Add Stocks**: Click "Add Stock" to create a new stock entry
4. **View Details**: Click "View" on any stock to see detailed information
5. **Rate Stocks**: Like or dislike stocks to show your opinion
6. **Comment**: Add comments and replies to discuss stocks
7. **Manage**: Edit or delete your own stocks and comments

## Project Structure

```
stock-forum/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context (Auth)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   └── utils/          # Utility functions
│   └── package.json
├── server/                 # Express backend
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── package.json
└── package.json           # Root package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
