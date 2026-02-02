// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Authentication token storage
let authToken = localStorage.getItem('authToken');

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    };

    // Add auth token if available
    if (authToken) {
        defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Load menu items from API
async function loadMenuItems() {
    try {
        const response = await apiCall('/menu');
        return response.data;
    } catch (error) {
        console.error('Error loading menu:', error);
        // Fallback to localStorage or hardcoded data
        return null;
    }
}

// Cart Management (now syncs with backend if authenticated)
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentQuantity = 1;

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    checkAuthStatus();
    
    // Initialize counters
    document.querySelectorAll('.stat-number').forEach(counter => {
        if (typeof observer !== 'undefined') {
            observer.observe(counter);
        }
    });

    // Load menu from API if on menu page
    if (window.location.pathname.includes('menu.html')) {
        loadMenuFromAPI();
    }
});

// Check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (token && user.email) {
        // User is logged in
        updateAuthUI(true, user);
        syncCartWithBackend();
    } else {
        updateAuthUI(false);
    }
}

// Update auth UI
function updateAuthUI(isLoggedIn, user = null) {
    const authIcon = document.querySelector('.nav-auth a[href="login.html"]');
    if (authIcon && isLoggedIn && user) {
        authIcon.innerHTML = `👤 ${user.firstName}`;
        authIcon.href = '#';
        authIcon.onclick = (e) => {
            e.preventDefault();
            showUserMenu();
        };
    }
}

// Show user menu dropdown
function showUserMenu() {
    // Simple implementation - can be enhanced with proper dropdown
    const menu = confirm('Profile Options:\n\nOK - View Profile\nCancel - Logout');
    if (menu) {
        window.location.href = 'profile.html';
    } else {
        logout();
    }
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    authToken = null;
    window.location.href = 'index.html';
}

// Sync cart with backend
async function syncCartWithBackend() {
    if (!authToken) return;

    try {
        const response = await apiCall('/cart');
        if (response.success && response.data.items) {
            // Merge backend cart with local cart
            cart = response.data.items.map(item => ({
                id: item.menu_item_id,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: item.quantity
            }));
            saveCart();
        }
    } catch (error) {
        console.error('Error syncing cart:', error);
    }
}

// Update cart count in navigation
function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartBadge = document.getElementById('cartCount');
    if (cartBadge) {
        cartBadge.textContent = cartCount;
        cartBadge.style.display = cartCount > 0 ? 'flex' : 'none';
    }
}

// Save cart to localStorage and backend
async function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    // Sync with backend if authenticated
    if (authToken) {
        try {
            // Clear backend cart first
            await apiCall('/cart', { method: 'DELETE' });
            
            // Add all items to backend cart
            for (const item of cart) {
                await apiCall('/cart', {
                    method: 'POST',
                    body: JSON.stringify({
                        menuItemId: item.id,
                        quantity: item.quantity
                    })
                });
            }
        } catch (error) {
            console.error('Error syncing cart with backend:', error);
        }
    }
}

// Add to Cart
function addToCart(foodId) {
    // Check if we have menu data
    const menuItem = cart.find(item => item.id === foodId);
    
    if (!menuItem) {
        // Try to get from API or fallback data
        loadMenuItemDetails(foodId).then(food => {
            if (food) {
                addToCartHelper(foodId, food);
            }
        });
    } else {
        addToCartHelper(foodId, menuItem);
    }
}

async function loadMenuItemDetails(foodId) {
    try {
        const response = await apiCall(`/menu/${foodId}`);
        return response.data;
    } catch (error) {
        console.error('Error loading menu item:', error);
        return null;
    }
}

function addToCartHelper(foodId, food) {
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

// Authentication form handling
async function handleAuthSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const isLogin = form.closest('#loginForm') !== null;
    
    const formData = new FormData(form);
    
    try {
        if (isLogin) {
            // Login
            const response = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: formData.get('email'),
                    password: formData.get('password')
                })
            });

            if (response.success) {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                authToken = response.data.token;
                
                showNotification('Login successful!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        } else {
            // Sign up
            const response = await apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    password: formData.get('password')
                })
            });

            if (response.success) {
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                authToken = response.data.token;
                
                showNotification('Account created successfully!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        }
    } catch (error) {
        showNotification(`Error: ${error.message}`);
    }
}

// Contact form handling
async function handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        const response = await apiCall('/contact', {
            method: 'POST',
            body: JSON.stringify({
                firstName: formData.get('firstName') || form.querySelector('[name="firstName"]').value,
                lastName: formData.get('lastName') || form.querySelector('[name="lastName"]').value,
                email: formData.get('email') || form.querySelector('[name="email"]').value,
                phone: formData.get('phone') || form.querySelector('[name="phone"]')?.value,
                inquiryType: formData.get('inquiryType') || form.querySelector('[name="inquiryType"]').value,
                message: formData.get('message') || form.querySelector('[name="message"]').value
            })
        });

        if (response.success) {
            showNotification('Message sent successfully! We will contact you soon.');
            form.reset();
        }
    } catch (error) {
        showNotification(`Error: ${error.message}`);
    }
}

// Checkout form handling
async function proceedToPayment(event) {
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

// Process payment and create order
async function processPayment(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;
    
    try {
        const address = JSON.parse(localStorage.getItem('deliveryAddress') || '{}');
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'credit';
        
        const orderData = {
            ...address,
            paymentMethod,
            items: cart.map(item => ({
                id: item.id,
                quantity: item.quantity
            }))
        };

        const response = await apiCall('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });

        if (response.success) {
            // Clear cart
            cart = [];
            localStorage.removeItem('cart');
            localStorage.removeItem('deliveryAddress');
            
            // Store order number for success page
            localStorage.setItem('lastOrderNumber', response.data.orderNumber);
            
            // Redirect to success page
            window.location.href = 'order-success.html';
        }
    } catch (error) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        showNotification(`Error: ${error.message}`);
    }
}

// Load order number on success page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('order-success.html')) {
        const orderNumber = localStorage.getItem('lastOrderNumber');
        const orderNumberElement = document.getElementById('orderNumber');
        if (orderNumberElement && orderNumber) {
            orderNumberElement.textContent = orderNumber;
            localStorage.removeItem('lastOrderNumber');
        }
    }
});
