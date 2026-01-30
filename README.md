# 🍽️ Bella Cucina - Restaurant Website

## Project Description

A responsive restaurant website built using **HTML, CSS, JavaScript, and LocalStorage**.  
Features include menu browsing, shopping cart, checkout, and order processing - all working with client-side storage.

---

## 📁 Project Structure

```txt
restaurant-website/
│
├── frontend/
│   ├── auth/              # Login & Signup pages
│   ├── menu/              # Menu browsing
│   ├── product/           # Product details
│   ├── order/             # Services, Cart, Checkout, Payment, Order Success
│   ├── home/              # Home page
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   └── assets/            # Images & Icons
│
├── backend/               # Backend folder structure (ready for implementation)
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   └── database/
│
└── README.md
```

---

## 🚀 Features

- **Home Page**: Hero section with restaurant showcase
- **Authentication**: Login & Signup pages
- **Menu Browsing**: Filter items by category (Pasta, Pizza, Mains, Desserts)
- **Product Details**: View detailed information about each dish
- **Shopping Cart**: Add/remove items, update quantities (stored in LocalStorage)
- **Checkout**: Enter delivery information
- **Payment**: Process orders (simulation)
- **Order Success**: Confirmation page

---

## 🛠️ Technologies Used

- HTML5
- CSS3 (Flexbox, Grid, Custom Properties)
- Vanilla JavaScript
- LocalStorage for data persistence

---

## 📦 How to Run

Simply open `frontend/home/index.html` in your browser, or use a local server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js http-server
npx http-server frontend -p 8080
```

Then visit `http://localhost:8080/home/index.html`

---

## 📝 Important Notes

- All data is stored in browser LocalStorage
- Cart persists between sessions
- Backend folder structure is ready for future implementation
- All navigation paths work with the new organized structure

---

## 👥 Team Members

- Shanuka (Leader): Home & Login/Signup Pages
- Dinesh: Menu & Product Pages
- Ashini: About & Contact Pages
- Savindu: Services Pages (Cart, Checkout, Payment)

---

## 📄 License

This project is for educational purposes.
