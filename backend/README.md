# 🍽️ Bella Cucina Restaurant Backend API

A comprehensive Node.js backend API for the Bella Cucina restaurant website with SQLite database.

## 📋 Features

- ✅ User Authentication (Register, Login, JWT)
- ✅ Menu Management (CRUD operations)
- ✅ Shopping Cart
- ✅ Order Management
- ✅ Contact Form
- ✅ Admin Panel Features
- ✅ SQLite Database
- ✅ RESTful API Design
- ✅ Input Validation
- ✅ Error Handling

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Initialize the database:
```bash
npm run init-db
```

3. Seed the database with initial data:
```bash
npm run seed-db
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The API will be available at: `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── errorHandler.js      # Error handling middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── menu.js              # Menu management routes
│   ├── cart.js              # Shopping cart routes
│   ├── orders.js            # Order management routes
│   ├── contact.js           # Contact form routes
│   └── users.js             # User management routes
├── scripts/
│   ├── initDb.js            # Database initialization
│   └── seedDb.js            # Database seeding
├── database/
│   └── restaurant.db        # SQLite database (auto-generated)
├── .env                      # Environment variables
├── .gitignore
├── package.json
├── server.js                 # Main server file
└── README.md
```

## 🔐 Default Credentials

After seeding the database, you can use these credentials:

**Admin Account:**
- Email: `admin@bellacucina.com`
- Password: `admin123`

**Test Customer Account:**
- Email: `customer@example.com`
- Password: `customer123`

## 📚 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user | Yes |
| PUT | `/update` | Update user profile | Yes |
| PUT | `/change-password` | Change password | Yes |

### Menu (`/api/menu`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all menu items | No |
| GET | `/categories` | Get all categories | No |
| GET | `/:id` | Get single menu item | No |
| POST | `/` | Create menu item | Admin |
| PUT | `/:id` | Update menu item | Admin |
| DELETE | `/:id` | Delete menu item | Admin |
| POST | `/categories` | Create category | Admin |

### Cart (`/api/cart`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user's cart | Yes |
| POST | `/` | Add item to cart | Yes |
| PUT | `/:id` | Update cart item | Yes |
| DELETE | `/:id` | Remove item from cart | Yes |
| DELETE | `/` | Clear entire cart | Yes |

### Orders (`/api/orders`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create new order | Yes |
| GET | `/` | Get user's orders | Yes |
| GET | `/:id` | Get single order | Yes |
| GET | `/track/:orderNumber` | Track order | No |
| GET | `/admin/all` | Get all orders | Admin |
| PUT | `/:id/status` | Update order status | Admin |
| DELETE | `/:id` | Cancel order | Yes |

### Contact (`/api/contact`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Submit contact form | No |
| GET | `/` | Get all messages | Admin |
| GET | `/:id` | Get single message | Admin |
| PUT | `/:id/status` | Update message status | Admin |
| DELETE | `/:id` | Delete message | Admin |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all users | Admin |
| GET | `/:id` | Get user by ID | Admin |
| PUT | `/:id/role` | Update user role | Admin |
| DELETE | `/:id` | Delete user | Admin |

## 🔑 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📝 Request Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1-555-123-4567",
  "password": "password123"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Add to Cart
```bash
POST /api/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "menuItemId": "carbonara",
  "quantity": 2
}
```

### Create Order
```bash
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-123-4567",
  "address": "123 Main Street",
  "city": "San Francisco",
  "state": "CA",
  "zipCode": "94102",
  "deliveryNotes": "Ring the doorbell",
  "paymentMethod": "credit",
  "items": [
    {
      "menuItemId": "carbonara",
      "quantity": 2
    }
  ]
}
```

### Create Menu Item (Admin)
```bash
POST /api/menu
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "id": "new-dish",
  "name": "New Dish",
  "category": "Pasta",
  "price": 25.99,
  "description": "A delicious new pasta dish",
  "image": "https://example.com/image.jpg",
  "ingredients": ["pasta", "sauce", "cheese"],
  "isAvailable": true
}
```

## 🗄️ Database Schema

### Users
- id (INTEGER, PRIMARY KEY)
- firstName (TEXT)
- lastName (TEXT)
- email (TEXT, UNIQUE)
- phone (TEXT)
- password (TEXT, hashed)
- role (TEXT: 'customer' or 'admin')
- createdAt (DATETIME)
- updatedAt (DATETIME)

### Categories
- id (INTEGER, PRIMARY KEY)
- name (TEXT, UNIQUE)
- description (TEXT)
- displayOrder (INTEGER)
- createdAt (DATETIME)

### Menu Items
- id (TEXT, PRIMARY KEY)
- name (TEXT)
- category (TEXT)
- price (REAL)
- description (TEXT)
- image (TEXT)
- ingredients (TEXT, JSON)
- isAvailable (INTEGER, 0 or 1)
- createdAt (DATETIME)
- updatedAt (DATETIME)

### Cart
- id (INTEGER, PRIMARY KEY)
- userId (INTEGER, FOREIGN KEY)
- menuItemId (TEXT, FOREIGN KEY)
- quantity (INTEGER)
- createdAt (DATETIME)
- updatedAt (DATETIME)

### Orders
- id (INTEGER, PRIMARY KEY)
- orderNumber (TEXT, UNIQUE)
- userId (INTEGER, FOREIGN KEY)
- fullName (TEXT)
- email (TEXT)
- phone (TEXT)
- address (TEXT)
- city (TEXT)
- state (TEXT)
- zipCode (TEXT)
- deliveryNotes (TEXT)
- subtotal (REAL)
- deliveryFee (REAL)
- tax (REAL)
- total (REAL)
- paymentMethod (TEXT)
- status (TEXT: 'pending', 'preparing', 'on_the_way', 'delivered', 'cancelled')
- createdAt (DATETIME)
- updatedAt (DATETIME)

### Order Items
- id (INTEGER, PRIMARY KEY)
- orderId (INTEGER, FOREIGN KEY)
- menuItemId (TEXT, FOREIGN KEY)
- name (TEXT)
- price (REAL)
- quantity (INTEGER)
- subtotal (REAL)

### Contact Messages
- id (INTEGER, PRIMARY KEY)
- firstName (TEXT)
- lastName (TEXT)
- email (TEXT)
- phone (TEXT)
- inquiryType (TEXT)
- message (TEXT)
- status (TEXT: 'new', 'read', 'replied', 'archived')
- createdAt (DATETIME)

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with express-validator
- SQL injection protection with parameterized queries
- CORS configuration
- Role-based access control (RBAC)

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
DB_PATH=./database/restaurant.db
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

## 🧪 Testing

You can test the API using tools like:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code extension)

## 📦 Dependencies

- **express**: Web framework
- **sqlite3**: SQLite database driver
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variables
- **express-validator**: Input validation
- **uuid**: Generate unique IDs

## 🚧 Future Enhancements

- [ ] Image upload for menu items
- [ ] Email notifications
- [ ] Payment gateway integration
- [ ] Real-time order tracking
- [ ] Restaurant reservation system
- [ ] Review and rating system
- [ ] Loyalty points program

## 📄 License

MIT License

## 👥 Support

For support, email support@bellacucina.com or create an issue in the repository.
