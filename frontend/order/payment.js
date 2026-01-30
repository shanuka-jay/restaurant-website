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
    loadPaymentPage();
});
