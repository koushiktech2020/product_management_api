# Product Management API

A Node.js REST API for managing products, built with Express.js, MongoDB, and JWT authentication.

## Features

- MongoDB database connection with Mongoose
- User authentication with JWT (register, login, logout, logout-all)
- JWT middleware for token validation from cookies
- Token generation utility functions
- User profile management and password change
- Product CRUD operations with user-based access control
- Business logic services with helper functions
- Organized route structure with separate auth and product routes
- Mongoose models for User and Product
- Secure password hashing with bcrypt
- CORS support
- Environment-based configuration

## Project Structure

```
product_management_api/
├── controllers/          # Request handlers
│   ├── userController.js     # Auth controllers
│   └── productController.js  # Product CRUD controllers
├── services/            # Business logic
│   ├── userService.js        # Auth services
│   └── productService.js     # Product services
├── models/              # Database models
│   ├── User.js              # User schema
│   └── Product.js           # Product schema
├── routes/              # API routes
│   ├── userRoutes.js        # Auth routes (/api/auth/*)
│   └── productRoutes.js     # Product routes (/api/products/*)
├── middleware/          # Custom middleware
│   └── authenticateToken.js # JWT validation
├── helpers/             # Utility functions
│   └── pipelineHelpers.js   # MongoDB aggregation helpers
├── utils/               # Core utilities
│   ├── connectDB.js         # Database connection
│   └── generateToken.js     # JWT token generation
├── app.js               # Express app setup
├── index.js             # Server entry point
└── README.md
```

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd product_management_api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:

   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/product_management
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_123456789
   JWT_EXPIRES_IN=7d
   ```

4. Start the server:

   ```bash
   npm start
   ```

   For development with auto-restart:

   ```bash
   npm run dev
   ```

## Usage

The API will be available at `http://localhost:5000` (or the port specified in your `.env` file).

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user (clear cookie)
- `POST /api/auth/logout-all` - Logout from all devices (requires auth)
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)
- `PUT /api/auth/change-password` - Change password (requires auth)

### Product Endpoints (Require Authentication)

- `GET /api/products` - Get all products for logged-in user (with pagination, search, filtering)
- `GET /api/products/:id` - Get single product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/stats` - Get product statistics for user

### Query Parameters for GET /api/products:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search in name/description
- `category` - Filter by category
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort order (asc/desc, default: desc)

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Usage Examples

### Authentication

**Register a new user:**

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login:**

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Products (Require Authentication)

**Create a product:**

```bash
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Laptop",
  "description": "Gaming laptop",
  "price": 1200,
  "category": "Electronics",
  "stock": 10
}
```

**Get products with search and pagination:**

```bash
GET /api/products?page=1&limit=5&search=laptop&category=electronics&sortBy=price&sortOrder=asc
Authorization: Bearer <token>
```

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (not implemented yet)

## License

ISC

## Author

koushik
