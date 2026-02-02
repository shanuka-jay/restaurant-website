// ============================================
// BELLA CUCINA - Frontend JavaScript
// Integrated with Backend API
// ============================================

// Cart Management (using API)
let cart = [];
let currentUser = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in
    await checkAuthStatus();
    
    // Load menu items from API
    if (window.location.pathname.includes('menu.html') || window.location.pathname.includes('index.html')) {
        await loadMenuFromAPI();
    }
    
    // Load product details if on product page
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (productId && window.location.pathname.includes('product.html')) {
        await loadProductDetails(productId);
    }
    
    // Load cart if on cart page
    if (window.location.pathname.includes('cart.html')) {
        await loadCartPage();
    }
    
    // Load checkout if on checkout page
    if (window.location.pathname.includes('checkout.html')) {
        loadCheckoutPage();
    }
    
    // Load payment if on payment page
    if (window.location.pathname.includes('payment.html')) {
        loadPaymentPage();
    }
    
    // Update cart count
    await updateCartCount();
    
    // Initialize counters
    document.querySelectorAll('.stat-number').forEach(counter => {
        observer.observe(counter);
    });
    
    // Initialize navbar scroll
    initNavbarScroll();
});

// ============================================
// AUTHENTICATION
// ============================================

// Check if user is logged in
async function checkAuthStatus() {
    const token = API.getToken();
    
    if (token) {
        try {
            const response = await API.auth.getUser();
            currentUser = response.data;
            updateUIForLoggedInUser();
        } catch (error) {
            console.error('Auth check failed:', error);
            API.removeToken();
            currentUser = null;
        }
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const authContainer = document.getElementById('authContainer');
    if (!authContainer) return;

    if (currentUser) {
        authContainer.innerHTML = `
            <span class="user-name">Hello, ${currentUser.firstName}</span>
            ${currentUser.role === 'admin' ? '<a href="admin.html" class="btn-admin" style="padding: 6px 12px; margin-right: 8px;">Admin</a>' : ''}
            <button class="btn-logout" onclick="logout()">Logout</button>
        `;
    } else {
        authContainer.innerHTML = `<a href="login.html" class="auth-icon" title="Login">👤</a>`;
    }
}

// Logout
function logout() {
    API.removeToken();
    currentUser = null;
    showNotification('Logged out successfully');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// View my orders
async function viewMyOrders() {
    window.location.href = 'my-orders.html';
}

// ============================================
// MENU & PRODUCTS
// ============================================

// Load menu items from API
async function loadMenuFromAPI() {
    try {
        const response = await API.menu.getAll();
        const menuItems = response.data;
        
        // Update menu grid if it exists
        const menuGrid = document.getElementById('menuGrid');
        if (menuGrid) {
            displayMenuItems(menuItems, menuGrid);
        }
        
        // Update home page featured items if on index page
        if (window.location.pathname.includes('index.html')) {
            updateFeaturedItems(menuItems);
        }
        
    } catch (error) {
        console.error('Error loading menu:', error);
        showNotification('Error loading menu items', 'error');
    }
}

// Display menu items in grid
function displayMenuItems(items, container) {
    container.innerHTML = items.map(item => `
        <a href="product.html?id=${item.id}" class="menu-item" data-category="${getCategorySlug(item.category)}" style="text-decoration: none; color: inherit;">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/400x250?text=No+Image'">
            <div class="menu-item-content">
                <h3>${item.name}</h3>
                <p>${item.description.substring(0, 100)}...</p>
                <div class="price">$${item.price.toFixed(2)}</div>
                ${!item.isAvailable ? '<div class="unavailable-badge">Unavailable</div>' : ''}
            </div>
        </a>
    `).join('');
}

// Get category slug for filtering
function getCategorySlug(category) {
    return category.toLowerCase().replace(' ', '-');
}

// Update featured items on home page
function updateFeaturedItems(items) {
    const featuredContainer = document.querySelector('.menu-grid');
    if (!featuredContainer) return;
    
    // Get first 6 items
    const featuredItems = items.slice(0, 6);
    displayMenuItems(featuredItems, featuredContainer);
}

// Load single product details
async function loadProductDetails(productId) {
    try {
        const response = await API.menu.getById(productId);
        const item = response.data;
        
        // Update page title
        document.title = `${item.name} - Bella Cucina`;
        
        // Update hero title
        const heroTitle = document.getElementById('foodDetailTitle');
        if (heroTitle) {
            heroTitle.textContent = item.name;
        }
        
        // Update content
        const contentContainer = document.getElementById('foodDetailContent');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="food-image-container">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/800x500?text=No+Image'">
                </div>
                <div class="food-details">
                    <div class="food-category">${item.category}</div>
                    <h2 class="food-title">${item.name}</h2>
                    <div class="food-price">$${item.price.toFixed(2)}</div>
                    ${!item.isAvailable ? '<div class="unavailable-notice">Currently Unavailable</div>' : ''}
                    <p class="food-description">${item.description}</p>
                    
                    ${item.ingredients && item.ingredients.length > 0 ? `
                        <div class="food-ingredients">
                            <h3>Ingredients</h3>
                            <ul>
                                ${item.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${item.isAvailable ? `
                        <div class="quantity-selector">
                            <label>Quantity:</label>
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="updateQuantity(-1)">-</button>
                                <span class="quantity-value" id="quantityValue">1</span>
                                <button class="quantity-btn" onclick="updateQuantity(1)">+</button>
                            </div>
                        </div>

                        <button class="btn btn-primary add-to-cart-btn" onclick="addToCartFromProduct('${item.id}')">
                            Add to Cart - $${item.price.toFixed(2)}
                        </button>
                    ` : ''}

                    <a href="menu.html" class="btn btn-ghost" style="width: 100%; margin-top: 15px; text-align: center;">
                        ← Back to Menu
                    </a>
                </div>
            `;
        }
        
        // Reset quantity
        window.currentQuantity = 1;
        
    } catch (error) {
        console.error('Error loading product:', error);
        showNotification('Error loading product details', 'error');
    }
}

// Update quantity for product page
let currentQuantity = 1;
function updateQuantity(change) {
    currentQuantity = Math.max(1, currentQuantity + change);
    const quantityElement = document.getElementById('quantityValue');
    if (quantityElement) {
        quantityElement.textContent = currentQuantity;
    }
}

// ============================================
// CART MANAGEMENT - FIXED
// ============================================

// Update cart count
async function updateCartCount() {
    try {
        // Check if user is logged in
        if (!API.getToken()) {
            // Use local storage cart for non-logged in users
            const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
            const count = localCart.reduce((sum, item) => sum + item.quantity, 0);
            updateCartBadge(count);
            return;
        }
        
        // Get cart from API
        const response = await API.cart.get();
        const count = response.data.summary.itemCount;
        updateCartBadge(count);
        
    } catch (error) {
        console.error('Error updating cart count:', error);
        // Fallback to local cart
        const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
        const count = localCart.reduce((sum, item) => sum + item.quantity, 0);
        updateCartBadge(count);
    }
}

// Update cart badge display
function updateCartBadge(count) {
    const cartBadge = document.getElementById('cartCount');
    if (cartBadge) {
        cartBadge.textContent = count;
        cartBadge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Add to cart from product page
async function addToCartFromProduct(productId) {
    await addToCart(productId, currentQuantity);
    currentQuantity = 1;
    const quantityElement = document.getElementById('quantityValue');
    if (quantityElement) {
        quantityElement.textContent = '1';
    }
}

// Add to cart (works for both logged in and guest users)
async function addToCart(menuItemId, quantity = 1) {
    try {
        // Check if user is logged in
        if (!API.getToken()) {
            // Add to local storage for guest users
            addToLocalCart(menuItemId, quantity);
            showNotification(`Added to cart! Please login to checkout.`);
            await updateCartCount();
            return;
        }
        
        // Add to API cart for logged in users
        await API.cart.add({ menuItemId, quantity });
        
        // Get item name for notification
        const response = await API.menu.getById(menuItemId);
        showNotification(`Added ${quantity} x ${response.data.name} to cart!`);
        
        await updateCartCount();
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding to cart. Please try again.', 'error');
    }
}

// Add to local cart (for guest users)
function addToLocalCart(menuItemId, quantity) {
    let localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
    
    const existingItem = localCart.find(item => item.menuItemId === menuItemId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        localCart.push({ menuItemId, quantity });
    }
    
    localStorage.setItem('localCart', JSON.stringify(localCart));
}

// Load cart page - FIXED
async function loadCartPage() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cartItemsContainer || !cartSummary) return;
    
    try {
        // Check if user is logged in
        if (!API.getToken()) {
            displayGuestCartMessage(cartItemsContainer, cartSummary);
            return;
        }
        
        const response = await API.cart.get();
        const cartData = response.data;
        
        if (cartData.items.length === 0) {
            displayEmptyCart(cartItemsContainer, cartSummary);
            return;
        }
        
        // Display cart items
        displayCartItems(cartData.items, cartItemsContainer);
        
        // Display summary
        displayCartSummary(cartData.summary, cartSummary);
        
    } catch (error) {
        console.error('Error loading cart:', error);
        showNotification('Error loading cart', 'error');
    }
}

// Display guest cart message
function displayGuestCartMessage(itemsContainer, summaryContainer) {
    itemsContainer.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 64px; margin-bottom: 20px;">🔒</div>
            <h3 style="font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 15px;">Please Login</h3>
            <p style="color: var(--text-gray); margin-bottom: 30px;">You need to login to view your cart and place orders.</p>
            <a href="login.html" class="btn btn-primary">Login / Sign Up</a>
        </div>
    `;
    summaryContainer.innerHTML = '';
}

// Display empty cart
function displayEmptyCart(itemsContainer, summaryContainer) {
    itemsContainer.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 64px; margin-bottom: 20px;">🛒</div>
            <h3 style="font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 15px;">Your cart is empty</h3>
            <p style="color: var(--text-gray); margin-bottom: 30px;">Add some delicious items to get started!</p>
            <a href="menu.html" class="btn btn-primary">Browse Menu</a>
        </div>
    `;
    summaryContainer.innerHTML = '';
}

// Display cart items - FIXED with proper event handlers
function displayCartItems(items, container) {
    container.innerHTML = items.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/100?text=No+Image'">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <button class="btn-remove" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
            <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
}

// Display cart summary
function displayCartSummary(summary, container) {
    const deliveryNotice = summary.subtotal < 30 
        ? `<p class="delivery-notice">Add $${(30 - summary.subtotal).toFixed(2)} more for free delivery!</p>` 
        : '';
    
    container.innerHTML = `
        <h3>Order Summary</h3>
        <div class="summary-row">
            <span>Subtotal</span>
            <span>$${summary.subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Delivery Fee</span>
            <span>${summary.deliveryFee === 0 ? 'FREE' : '$' + summary.deliveryFee.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Tax (8.75%)</span>
            <span>$${summary.tax.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
            <span>Total</span>
            <span>$${summary.total.toFixed(2)}</span>
        </div>
        ${deliveryNotice}
        <a href="checkout.html" class="btn btn-primary" style="width: 100%; margin-top: 20px;">Proceed to Checkout</a>
        <a href="menu.html" class="btn btn-ghost" style="width: 100%; margin-top: 10px;">Continue Shopping</a>
    `;
}

// Update cart item quantity - FIXED
async function updateCartItemQuantity(cartItemId, newQuantity) {
    if (newQuantity < 1) {
        await removeFromCart(cartItemId);
        return;
    }

    try {
        if (API.getToken()) {
            // Logged-in user
            await API.cart.update(cartItemId, { quantity: newQuantity });
        } else {
            // Guest user
            let localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
            const item = localCart.find(i => i.menuItemId === cartItemId);
            if (!item) return;
            item.quantity = newQuantity;
            localStorage.setItem('localCart', JSON.stringify(localCart));
        }

        await loadCartPage();
        await updateCartCount();
    } catch (error) {
        console.error('Error updating cart:', error);
        showNotification('Error updating cart', 'error');
    }
}

// Remove from cart - FIXED
async function removeFromCart(cartItemId) {
    try {
        if (API.getToken()) {
            await API.cart.remove(cartItemId);
        } else {
            let localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
            localCart = localCart.filter(i => i.menuItemId !== cartItemId);
            localStorage.setItem('localCart', JSON.stringify(localCart));
        }

        showNotification('Item removed from cart');
        await loadCartPage();
        await updateCartCount();
    } catch (error) {
        console.error('Error removing from cart:', error);
        showNotification('Error removing item', 'error');
    }
}

// ============================================
// CHECKOUT & ORDERS
// ============================================

// Load checkout page
function loadCheckoutPage() {
    const savedAddress = JSON.parse(localStorage.getItem('deliveryAddress') || '{}');
    
    if (savedAddress.fullName) {
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
async function updateCheckoutSummary() {
    const summaryContainer = document.getElementById('checkoutSummary');
    if (!summaryContainer) return;
    
    try {
        const response = await API.cart.get();
        const cartData = response.data;
        
        summaryContainer.innerHTML = `
            <h3>Order Summary</h3>
            <div class="checkout-items">
                ${cartData.items.map(item => `
                    <div class="checkout-item">
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60?text=No+Image'">
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
                <span>$${cartData.summary.subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Delivery Fee</span>
                <span>${cartData.summary.deliveryFee === 0 ? 'FREE' : '$' + cartData.summary.deliveryFee.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Tax (8.75%)</span>
                <span>$${cartData.summary.tax.toFixed(2)}</span>
            </div>
            <div class="summary-row total">
                <span>Total</span>
                <span>$${cartData.summary.total.toFixed(2)}</span>
            </div>
        `;
    } catch (error) {
        console.error('Error loading checkout summary:', error);
    }
}

// Proceed to payment
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

// Load payment page
function loadPaymentPage() {
    const address = JSON.parse(localStorage.getItem('deliveryAddress') || '{}');
    const addressDisplay = document.getElementById('deliveryAddressDisplay');
    
    if (addressDisplay && address.fullName) {
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

// Process payment and create order
async function processPayment(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;
    
    try {
        // Get delivery address
        const address = JSON.parse(localStorage.getItem('deliveryAddress'));
        
        if (!address || !address.fullName) {
            throw new Error('Delivery address not found');
        }
        
        // Get payment method
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        
        // Get cart items
        const cartResponse = await API.cart.get();
        const items = cartResponse.data.items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity
        }));
        
        // Create order
        const orderData = {
            ...address,
            paymentMethod,
            items
        };
        
        const response = await API.orders.create(orderData);
        
        // Store order number
        localStorage.setItem('lastOrderNumber', response.data.orderNumber);
        
        // Clear stored address
        localStorage.removeItem('deliveryAddress');
        
        // Redirect to success page
        window.location.href = 'order-success.html';
        
    } catch (error) {
        console.error('Error processing payment:', error);
        showNotification('Error processing order. Please try again.', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// ============================================
// CONTACT FORM - FIXED
// ============================================

// Handle contact form submission - FIXED
async function handleSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone') || '',
        inquiryType: formData.get('inquiryType'),
        message: formData.get('message')
    };
    
    try {
        await API.contact.submit(data);
        showNotification('Thank you for your message! We will get back to you soon.');
        event.target.reset();
    } catch (error) {
        console.error('Error submitting contact form:', error);
        showNotification('Error sending message. Please try again.', 'error');
    }
}

// ============================================
// AUTH FORMS
// ============================================

// Handle auth form submission
async function handleAuthSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const isLogin = event.target.closest('#loginForm') !== null;
    
    try {
        if (isLogin) {
            // Login
            const data = {
                email: formData.get('email'),
                password: formData.get('password')
            };
            
            const response = await API.auth.login(data);
            API.setToken(response.token);
            currentUser = response.data;
            
            showNotification('Login successful! Welcome back.');
            
            // Migrate local cart to server if exists
            await migrateLocalCart();
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } else {
            // Register
            const data = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                password: formData.get('password')
            };
            
            const response = await API.auth.register(data);
            API.setToken(response.token);
            currentUser = response.data;
            
            showNotification('Registration successful! Welcome to Bella Cucina.');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    } catch (error) {
        console.error('Auth error:', error);
        showNotification(error.message || 'Authentication failed. Please try again.', 'error');
    }
}

// Migrate local cart to server after login
async function migrateLocalCart() {
    const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
    
    if (localCart.length > 0) {
        try {
            for (const item of localCart) {
                await API.cart.add(item);
            }
            localStorage.removeItem('localCart');
            await updateCartCount();
        } catch (error) {
            console.error('Error migrating cart:', error);
        }
    }
}

// Toggle auth form
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

// ============================================
// MENU FILTERING
// ============================================

// Filter menu by category
function filterMenu(category) {
    const items = document.querySelectorAll('.menu-item');
    const buttons = document.querySelectorAll('.category-btn');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    items.forEach(item => {
        const itemCategory = item.dataset.category;
        if (category === 'all' || itemCategory === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// ============================================
// UI UTILITIES
// ============================================

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
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

// Navbar scroll effect
function initNavbarScroll() {
    window.addEventListener('scroll', function() {
        const nav = document.getElementById('nav');
        if (nav && window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else if (nav) {
            nav.classList.remove('scrolled');
        }
    });
}

// Stats counter animation
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

// ============================================
// ADD CUSTOM STYLES FOR NEW ELEMENTS
// ============================================

// Add styles for user dropdown menu
const style = document.createElement('style');
style.textContent = `
    .user-dropdown-menu {
        position: fixed;
        top: 70px;
        right: 40px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 5px 30px rgba(0,0,0,0.2);
        padding: 20px;
        min-width: 220px;
        z-index: 10000;
        animation: fadeIn 0.2s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .user-dropdown-menu .user-info {
        padding-bottom: 15px;
        border-bottom: 1px solid #E8E8E8;
        margin-bottom: 15px;
    }
    
    .user-dropdown-menu .user-info strong {
        display: block;
        font-size: 16px;
        margin-bottom: 5px;
        color: var(--dark-gray);
    }
    
    .user-dropdown-menu .user-info span {
        font-size: 14px;
        color: var(--text-gray);
    }
    
    .user-dropdown-menu a {
        display: block;
        padding: 10px;
        color: var(--dark-gray);
        text-decoration: none;
        border-radius: 4px;
        transition: background 0.2s;
    }
    
    .user-dropdown-menu a:hover {
        background: var(--light-gray);
        color: var(--primary-gold);
    }
    
    .notification.error {
        background: #e74c3c;
    }
    
    .unavailable-badge {
        background: #e74c3c;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        display: inline-block;
        margin-top: 10px;
    }
    
    .unavailable-notice {
        background: #fff3cd;
        color: #856404;
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 20px;
        text-align: center;
    }
    
    .btn-admin {
        background: var(--primary-gold);
        color: white;
        border: none;
        border-radius: 6px;
        text-decoration: none;
        display: inline-block;
    }
    
    .btn-admin:hover {
        background: #c2921d;
    }
`;
document.head.appendChild(style);