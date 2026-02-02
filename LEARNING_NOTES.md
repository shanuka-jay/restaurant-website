# 📚 Project Learning Notes - Restaurant Website

## What I Learned From This Project

### 🎯 Backend Development (Node.js + Express + SQLite)

#### 1. **RESTful API Design**

- Built a complete REST API with proper HTTP methods (GET, POST, PUT)
- Organized routes into separate modules (auth, menu, orders, payments)
- Used Express.js middleware for routing and request handling
- Implemented CORS for cross-origin resource sharing

**Key Endpoints Created:**

```

POST   /api/orders               - Create order
GET    /api/orders/:id           - Get order details
GET    /api/orders/user/:userId  - Get user's orders

POST   /api/payments             - Process payment
GET    /api/payments/order/:id   - Get payment by order
```

**Note:** Authentication endpoints (register, login, profile) were already implemented by team.

#### 2. **Database Design & Management**

- Learned SQLite database setup and schema design
- Worked with 5 tables: `users`, `menu_items`, `orders`, `order_items`, `payments`
- Used foreign keys for relationships between tables
- Implemented transactions for order creation (ensuring data consistency)
- Used prepared statements to prevent SQL injection

**Database Schema (My Part):**

- One-to-many: Orders → Order Items
- One-to-one: Orders → Payments

#### 3. **API Controllers & Business Logic**

- Created menu.controller.js - Menu item management
- Created order.controller.js - Order processing with transactions
- Created payment.controller.js - Payment processing
- Implemented proper error handling in all controllers
- Used async/await for database operations
- Implemented try-catch blocks for async operations
- Created proper error responses with status codes
- Validated required fields before database operations
- Added console logging for debugging

---

### 🌐 Frontend-Backend Integration

#### 1. **API Integration with Fetch**

- Connected frontend JavaScript to backend API using `fetch()`
- Handled async/await for API calls
- Parsed JSON responses from server
- Implemented error handling for failed requests

**Example Pattern:**

```javascript
async function loadMenuFromAPI() {
  try {
    const response = await fetch("http://localhost:3000/api/menu");
    const data = await response.json();
    if (data.success) {
      // Process data
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
```

#### 2. **Data Mapping & Transformation**

- Learned to map backend data structure to frontend format
- Handled different data types (JSON arrays vs comma-separated strings)
- Created dual-key storage system for flexible data access
- Normalized image URLs and field names

**Key Learning:** Backend `image_url` → Frontend `image` property mapping

#### 3. **LocalStorage Management**

- Used localStorage for cart persistence
- Stored user session data (order ID, transaction ID)
- Learned about data serialization (JSON.stringify/parse)
- Implemented cart synchronization across pages

#### 4. **Complete Order Flow Implementation**

```
Menu → Product Details → Cart → Checkout → Payment → Order Success
  ↓         ↓              ↓        ↓          ↓           ↓
 API      API          Storage   Form    POST API    GET API
```

---

### 💻 Code Organization & Best Practices

#### 1. **DRY Principle (Don't Repeat Yourself)**

- Identified duplicate functions across 6+ files
- Created `utils.js` for common functions
- Reduced code duplication by ~60%
- Made maintenance easier with centralized utilities

**Before:** Same functions in menu.js, product.js, cart.js, checkout.js, payment.js
**After:** Common functions in utils.js, page-specific logic in individual files

#### 2. **Modular Architecture**

**Backend Structure:**

```
backend/
  ├── server.js              # Main server
  ├── controllers/           # Business logic
  │   ├── auth.controller.js
  │   ├── menu.controller.js
  │   ├── order.controller.js
  │   └── payment.controller.js
  ├── routes/                # API endpoints
  └── database/              # SQLite DB
```

**Frontend Structure:**

```
frontend/
  ├── js/
  │   └── utils.js          # Common utilities
  ├── menu/                 # Menu page
  ├── product/              # Product details
  ├── order/                # Cart, checkout, payment
  └── home/                 # Landing page
```

#### 3. **Debugging Strategies**

- Used `console.log()` extensively for debugging
- Checked browser DevTools Console for errors
- Used browser Network tab to inspect API calls
- Fixed issues step-by-step (ingredients parsing, ID mapping, duplicate variables)

---

### 🐛 Problem Solving Experience

#### Major Issues Fixed:

1. **Product Details Not Loading**
   - Problem: Ingredients JSON parse error
   - Solution: Implemented flexible parsing (JSON + CSV fallback)

2. **Cart Showing Empty**
   - Problem: ID type mismatch (string vs number)
   - Solution: Consistent numeric ID storage, parseInt() for comparisons

3. **Menu Links Wrong**
   - Problem: Name-based keys instead of database IDs
   - Solution: Updated all links to use numeric IDs (1, 2, 4, 5...)

4. **Duplicate Variable Declarations**
   - Problem: Same variables declared in HTML inline scripts and JS files
   - Solution: Removed inline scripts, used only external JS files

5. **Remove from Cart Not Working**
   - Problem: onclick passing string ID, function comparing with number
   - Solution: Added parseInt() conversion in comparison functions

---

### 🔧 Technical Skills Gained

**Backend:**

- ✅ Node.js & Express.js server setup
- ✅ SQLite database operations (CRUD)
- ✅ RESTful API design patterns
- ✅ CORS configuration
- ✅ Transaction management
- ✅ Prepared statements

**Frontend:**

- ✅ Fetch API for HTTP requests
- ✅ Async/await for asynchronous operations
- ✅ LocalStorage API
- ✅ DOM manipulation
- ✅ Event handling
- ✅ Form validation

**Integration:**

- ✅ JSON data exchange
- ✅ Error handling across layers
- ✅ State management (cart, user session)
- ✅ Data transformation & mapping

**Tools & Workflow:**

- ✅ VS Code for development
- ✅ Browser DevTools for debugging
- ✅ Git for version control (file structure)
- ✅ NPM for package management

---

### 📈 Key Takeaways

1. **Full-Stack Understanding:** Learned how frontend and backend communicate
2. **API Design:** Understood RESTful principles and best practices
3. **Database Relationships:** Learned to design normalized schemas with foreign keys
4. **Error Handling:** Always validate data and handle edge cases
5. **Code Organization:** Modular code is easier to maintain and debug
6. **Transactions:** Use database transactions for multi-table operations
7. **Debugging Skills:** Console logging and DevTools are essential
8. **Data Consistency:** Ensure data integrity across related tables

---

### 🎓 Technologies Mastered

| Technology   | Purpose         | Proficiency |
| ------------ | --------------- | ----------- |
| Node.js      | Backend runtime | ⭐⭐⭐⭐    |
| Express.js   | Web framework   | ⭐⭐⭐⭐    |
| SQLite3      | Database        | ⭐⭐⭐⭐    |
| JavaScript   | Frontend logic  | ⭐⭐⭐⭐⭐  |
| Fetch API    | HTTP requests   | ⭐⭐⭐⭐    |
| REST API     | API design      | ⭐⭐⭐⭐    |
| LocalStorage | Client storage  | ⭐⭐⭐⭐    |

---

### 🎬 Project Resources

**Video Tutorial/Demo:**
[Restaurant Website Project Walkthrough](https://drive.google.com/file/d/1As0ry9Qr6izseV3v1-aJaGMU7bXU-kDL/view)

**Technologies Documentation:**

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [MDN Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Bcrypt NPM Package](https://www.npmjs.com/package/bcrypt)

---

### 🚀 Next Steps for Improvement

1. **Add User Authentication UI** - Currently using hardcoded user_id
2. **Complete User Authentication UI** - Connect login/register pages to backend
3. **Real Payment Gateway** - Integrate Stripe/PayPal
4. **Order Status Updates** - Real-time order tracking
5. **Image Upload** - Allow admin to upload menu item images
6. **Search Functionality** - Search menu items by name
7. **User Profile Page** - View order history, saved addresses

---

## 🎯 Conclusion

This project taught me how to build a complete full-stack web application from scratch. The most valuable lesson was understanding how frontend and backend work together, and the importance of clean, organized code. I now feel confident building REST APIs, working with databases, and integrating frontend interfaces with backend services.

**Total Development Time:** Multiple sessions over several days
**Lines of Code:** ~3000+ lines (Backend + Frontend)
**Coffee Consumed:** ☕☕☕☕ (Too many to count!)

---

**Date Completed:** February 2, 2026
**Project Status:** ✅ Fully Functional
