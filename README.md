# Product Management API

A Node.js REST API for managing products, built with Express.js, MongoDB, and JWT authentication.

## Features

- User authentication with JWT
- JWT middleware for token validation from cookies
- Token generation utility functions
- Product CRUD operations (planned)
- Mongoose models for User and Product
- Secure password hashing with bcrypt
- CORS support
- Environment-based configuration

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

### Current Endpoints

- `GET /` - Welcome message

### Planned Endpoints

- Authentication: `/api/auth/login`, `/api/auth/register`
- Products: `/api/products` (CRUD operations)

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (not implemented yet)

## License

ISC

## Author

koushik
