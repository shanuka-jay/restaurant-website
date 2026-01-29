// Food data
const foodData = {
    carbonara: {
        name: 'Spaghetti Carbonara',
        category: 'Pasta',
        price: 22,
        image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
        description: 'A classic Roman pasta dish that combines simple ingredients to create an incredibly rich and creamy sauce. Our Carbonara features perfectly al dente spaghetti tossed with crispy guanciale (Italian cured pork jowl), farm-fresh eggs, aged Pecorino Romano cheese, and freshly cracked black pepper. The heat from the pasta creates a silky, luxurious coating that clings to every strand.',
        ingredients: ['Spaghetti pasta', 'Guanciale (Italian pork jowl)', 'Fresh eggs', 'Pecorino Romano cheese', 'Black pepper', 'Sea salt']
    },
    lasagna: {
        name: 'Lasagna Bolognese',
        category: 'Pasta',
        price: 24,
        image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800',
        description: 'Layers upon layers of tender pasta sheets, slow-cooked Bolognese sauce, creamy béchamel, and Parmigiano-Reggiano cheese. Our traditional recipe follows the authentic Bologna style, with a meat sauce that simmers for hours to develop deep, complex flavors.',
        ingredients: ['Fresh pasta sheets', 'Ground beef and pork', 'San Marzano tomatoes', 'Béchamel sauce', 'Parmigiano-Reggiano', 'Onions, carrots, celery', 'Red wine', 'Fresh herbs']
    },
    margherita: {
        name: 'Margherita Pizza',
        category: 'Pizza',
        price: 18,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
        description: 'The queen of pizzas! A perfect harmony of flavors featuring our hand-stretched dough topped with San Marzano tomato sauce, fresh mozzarella di bufala, fragrant basil leaves, and a drizzle of extra virgin olive oil. Baked in our wood-fired oven at 900°F for that perfect char and chew.',
        ingredients: ['Hand-stretched pizza dough', 'San Marzano tomatoes', 'Fresh mozzarella di bufala', 'Fresh basil', 'Extra virgin olive oil', 'Sea salt']
    },
    quattro: {
        name: 'Quattro Formaggi Pizza',
        category: 'Pizza',
        price: 20,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
        description: 'A cheese lover\'s dream! This white pizza features four premium Italian cheeses: creamy mozzarella, sharp gorgonzola, nutty fontina, and aged Parmigiano-Reggiano. Each cheese is carefully selected to create a perfect balance of flavors and textures.',
        ingredients: ['Pizza dough', 'Mozzarella cheese', 'Gorgonzola cheese', 'Fontina cheese', 'Parmigiano-Reggiano', 'Olive oil', 'Fresh herbs']
    },
    risotto: {
        name: 'Mushroom Risotto',
        category: 'Main Course',
        price: 24,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
        description: 'Creamy Arborio rice slowly cooked to perfection with porcini mushrooms, white wine, and vegetable stock. Finished with Parmigiano-Reggiano, butter, and a drizzle of white truffle oil for an earthy, luxurious experience. Each grain is perfectly al dente while the dish maintains its signature creamy texture.',
        ingredients: ['Arborio rice', 'Porcini mushrooms', 'Mixed mushrooms', 'White wine', 'Vegetable stock', 'Parmigiano-Reggiano', 'Butter', 'White truffle oil', 'Shallots', 'Parsley']
    },
    ossobuco: {
        name: 'Osso Buco',
        category: 'Main Course',
        price: 32,
        image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800',
        description: 'A Milanese masterpiece featuring tender veal shanks braised for hours until the meat falls off the bone. Slow-cooked with white wine, aromatics, and vegetables, then topped with fresh gremolata (lemon zest, garlic, and parsley). Traditionally served with creamy saffron risotto.',
        ingredients: ['Veal shanks', 'White wine', 'Tomatoes', 'Carrots, celery, onions', 'Beef stock', 'Lemon zest', 'Fresh parsley', 'Garlic', 'Olive oil']
    },
    tiramisu: {
        name: 'Tiramisu',
        category: 'Dessert',
        price: 12,
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800',
        description: 'The classic Italian pick-me-up! Layers of espresso-soaked ladyfinger cookies and rich mascarpone cream, dusted with premium cocoa powder. Our recipe stays true to the traditional Venetian style, creating the perfect balance of coffee, cream, and sweetness.',
        ingredients: ['Ladyfinger cookies', 'Mascarpone cheese', 'Espresso', 'Eggs', 'Sugar', 'Cocoa powder', 'Marsala wine']
    },
    pannacotta: {
        name: 'Panna Cotta',
        category: 'Dessert',
        price: 10,
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
        description: 'A silky-smooth Italian dessert that melts in your mouth. Our vanilla-infused cream is gently set with gelatin and served with a vibrant berry compote made from fresh seasonal berries. Light, elegant, and the perfect ending to your meal.',
        ingredients: ['Heavy cream', 'Vanilla bean', 'Sugar', 'Gelatin', 'Fresh mixed berries', 'Mint leaves']
    }
};

// Cart Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentQuantity = 1;

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    // Initialize counters
    document.querySelectorAll('.stat-number').forEach(counter => {
        observer.observe(counter);
    });
});

// Update cart count in navigation
function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartBadge = document.getElementById('cartCount');
    if (cartBadge) {
        cartBadge.textContent = cartCount;
        cartBadge.style.display = cartCount > 0 ? 'flex' : 'none';
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Add to Cart
function addToCart(foodId) {
    const food = foodData[foodId];
    if (!food) return;

    const existingItem = cart.find(item => item.id === foodId);
    
    if (existingItem) {
        existingItem.quantity += currentQuantity;
    } else {
        cart.push({
            id: foodId,
            name: food.name,
            price: food.price,
            image: food.image,
            quantity: currentQuantity
        });
    }
    
    saveCart();
    
    // Show success message
    showNotification(`Added ${currentQuantity} x ${food.name} to cart!`);
    
    // Reset quantity
    currentQuantity = 1;
    const quantityElement = document.getElementById('quantityValue');
    if (quantityElement) {
        quantityElement.textContent = '1';
    }
}

// Show notification
function showNotification(message) {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Remove from cart
function removeFromCart(foodId) {
    cart = cart.filter(item => item.id !== foodId);
    saveCart();
    loadCartPage();
}

// Update cart item quantity
function updateCartQuantity(foodId, change) {
    const item = cart.find(item => item.id === foodId);
    if (item) {
        item.quantity = Math.max(1, item.quantity + change);
        saveCart();
        loadCartPage();
    }
}

// Load cart page
function loadCartPage() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cartItemsContainer || !cartSummary) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;">🛒</div>
                <h3 style="font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 15px;">Your cart is empty</h3>
                <p style="color: var(--text-gray); margin-bottom: 30px;">Add some delicious items to get started!</p>
                <a href="menu.html" class="btn btn-primary">Browse Menu</a>
            </div>
        `;
        cartSummary.innerHTML = '';
        return;
    }
    
    // Display cart items
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', -1)">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
                </div>
                <button class="btn-remove" onclick="removeFromCart('${item.id}')">Remove</button>
            </div>
            <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal >= 30 ? 0 : 5;
    const tax = subtotal * 0.0875; // 8.75% tax
    const total = subtotal + deliveryFee + tax;
    
    // Display summary
    cartSummary.innerHTML = `
        <h3>Order Summary</h3>
        <div class="summary-row">
            <span>Subtotal</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Delivery Fee</span>
            <span>${deliveryFee === 0 ? 'FREE' : '$' + deliveryFee.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Tax (8.75%)</span>
            <span>$${tax.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
        </div>
        ${subtotal < 30 ? '<p class="delivery-notice">Add $' + (30 - subtotal).toFixed(2) + ' more for free delivery!</p>' : ''}
        <a href="checkout.html" class="btn btn-primary" style="width: 100%; margin-top: 20px;">Proceed to Checkout</a>
        <a href="menu.html" class="btn btn-ghost" style="width: 100%; margin-top: 10px;">Continue Shopping</a>
    `;
}

// Navbar Scroll Effect
window.addEventListener('scroll', function() {
    const nav = document.getElementById('nav');
    if (nav && window.scrollY > 100) {
        nav.classList.add('scrolled');
    } else if (nav) {
        nav.classList.remove('scrolled');
    }
});

// Stats Counter Animation
function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString() + '+';
        }
    };

    updateCounter();
}

// Intersection Observer for Counter
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.textContent === '0') {
            animateCounter(entry.target);
        }
    });
}, { threshold: 0.5 });

// Menu Filter Function
function filterMenu(category) {
    const items = document.querySelectorAll('.menu-item');
    const buttons = document.querySelectorAll('.category-btn');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    items.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Contact Form Submit
function handleSubmit(event) {
    event.preventDefault();
    showNotification('Thank you for your message! We will get back to you soon.');
    event.target.reset();
}

// Auth Form Submit
function handleAuthSubmit(event) {
    event.preventDefault();
    showNotification('Login successful! Welcome to Bella Cucina.');
    event.target.reset();
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Toggle Auth Form
function toggleAuthForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm && signupForm) {
        if (loginForm.style.display === 'none') {
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
        } else {
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
        }
    }
}

// Update Quantity (for individual product pages)
function updateQuantity(change) {
    currentQuantity = Math.max(1, currentQuantity + change);
    const quantityElement = document.getElementById('quantityValue');
    if (quantityElement) {
        quantityElement.textContent = currentQuantity;
    }
}

// Get URL parameter
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Load product details if on product page
document.addEventListener('DOMContentLoaded', function() {
    const foodId = getUrlParameter('id');
    if (foodId && foodData[foodId]) {
        loadProductDetails(foodId);
    }
    
    // Load cart page if on cart page
    if (window.location.pathname.includes('cart.html')) {
        loadCartPage();
    }
});

// Load product details function
function loadProductDetails(foodId) {
    const food = foodData[foodId];
    if (!food) return;

    document.title = `${food.name} - Bella Cucina`;

    const heroTitle = document.getElementById('foodDetailTitle');
    if (heroTitle) {
        heroTitle.textContent = food.name;
    }

    const contentContainer = document.getElementById('foodDetailContent');
    if (contentContainer) {
        contentContainer.innerHTML = `
            <div class="food-image-container">
                <img src="${food.image}" alt="${food.name}">
            </div>
            <div class="food-details">
                <div class="food-category">${food.category}</div>
                <h2 class="food-title">${food.name}</h2>
                <div class="food-price">$${food.price}</div>
                <p class="food-description">${food.description}</p>
                
                <div class="food-ingredients">
                    <h3>Ingredients</h3>
                    <ul>
                        ${food.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                    </ul>
                </div>

                <div class="quantity-selector">
                    <label>Quantity:</label>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(-1)">-</button>
                        <span class="quantity-value" id="quantityValue">1</span>
                        <button class="quantity-btn" onclick="updateQuantity(1)">+</button>
                    </div>
                </div>

                <button class="btn btn-primary add-to-cart-btn" onclick="addToCart('${foodId}')">
                    Add to Cart - $${food.price}
                </button>

                <a href="menu.html" class="btn btn-ghost" style="width: 100%; margin-top: 15px; text-align: center;">
                    ← Back to Menu
                </a>
            </div>
        `;
    }

    currentQuantity = 1;
}

// Checkout form handling
function proceedToPayment(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const address = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zipCode: formData.get('zipCode'),
        deliveryNotes: formData.get('deliveryNotes')
    };
    
    localStorage.setItem('deliveryAddress', JSON.stringify(address));
    window.location.href = 'payment.html';
}

// Load checkout page
function loadCheckoutPage() {
    const savedAddress = JSON.parse(localStorage.getItem('deliveryAddress'));
    
    if (savedAddress) {
        document.getElementById('fullName').value = savedAddress.fullName || '';
        document.getElementById('email').value = savedAddress.email || '';
        document.getElementById('phone').value = savedAddress.phone || '';
        document.getElementById('address').value = savedAddress.address || '';
        document.getElementById('city').value = savedAddress.city || '';
        document.getElementById('state').value = savedAddress.state || '';
        document.getElementById('zipCode').value = savedAddress.zipCode || '';
        document.getElementById('deliveryNotes').value = savedAddress.deliveryNotes || '';
    }
    
    updateCheckoutSummary();
}

// Update checkout summary
function updateCheckoutSummary() {
    const summaryContainer = document.getElementById('checkoutSummary');
    if (!summaryContainer) return;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal >= 30 ? 0 : 5;
    const tax = subtotal * 0.0875;
    const total = subtotal + deliveryFee + tax;
    
    summaryContainer.innerHTML = `
        <h3>Order Summary</h3>
        <div class="checkout-items">
            ${cart.map(item => `
                <div class="checkout-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="checkout-item-info">
                        <h4>${item.name}</h4>
                        <p>Quantity: ${item.quantity}</p>
                    </div>
                    <div class="checkout-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            `).join('')}
        </div>
        <div class="summary-row">
            <span>Subtotal</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Delivery Fee</span>
            <span>${deliveryFee === 0 ? 'FREE' : '$' + deliveryFee.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Tax (8.75%)</span>
            <span>$${tax.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
        </div>
    `;
}

// Load payment page
function loadPaymentPage() {
    const address = JSON.parse(localStorage.getItem('deliveryAddress'));
    const addressDisplay = document.getElementById('deliveryAddressDisplay');
    
    if (addressDisplay && address) {
        addressDisplay.innerHTML = `
            <h4>Delivery Address</h4>
            <p>${address.fullName}</p>
            <p>${address.address}</p>
            <p>${address.city}, ${address.state} ${address.zipCode}</p>
            <p>Phone: ${address.phone}</p>
            <p>Email: ${address.email}</p>
            ${address.deliveryNotes ? `<p><em>Notes: ${address.deliveryNotes}</em></p>` : ''}
            <a href="checkout.html" style="color: var(--primary-gold); text-decoration: none; font-size: 14px;">Edit Address</a>
        `;
    }
    
    updateCheckoutSummary();
}

// Process payment
function processPayment(event) {
    event.preventDefault();
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;
    
    // Simulate payment processing
    setTimeout(() => {
        // Clear cart
        cart = [];
        localStorage.removeItem('cart');
        localStorage.removeItem('deliveryAddress');
        
        // Redirect to success page
        window.location.href = 'order-success.html';
    }, 2000);
}

// Initialize pages based on current page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('checkout.html')) {
        loadCheckoutPage();
    } else if (window.location.pathname.includes('payment.html')) {
        loadPaymentPage();
    }
});
