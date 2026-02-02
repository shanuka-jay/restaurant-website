// Cart Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Checkout form handling
function proceedToPayment(event) {
    event.preventDefault();
    
    if (cart.length === 0) {
        alert('Your cart is empty! Please add items before checking out.');
        window.location.href = '../menu/menu.html';
        return;
    }
    
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
    
    if (!address.fullName || !address.phone || !address.address || !address.city || !address.state || !address.zipCode) {
        alert('Please fill in all required fields!');
        return;
    }
    
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(address.phone)) {
        alert('Please enter a valid phone number!');
        return;
    }
    
    if (address.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(address.email)) {
            alert('Please enter a valid email address!');
            return;
        }
    }
    
    console.log('✅ Delivery info validated:', address);
    
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

document.addEventListener('DOMContentLoaded', function() {
    loadCheckoutPage();
});
