// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Cart Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

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

// Process payment and create order
async function processPayment(event) {
    event.preventDefault();
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        window.location.href = '../menu/menu.html';
        return;
    }
    
    const deliveryInfo = JSON.parse(localStorage.getItem('deliveryAddress'));
    
    if (!deliveryInfo) {
        alert('Please provide delivery information!');
        window.location.href = 'checkout.html';
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.0875;
    const deliveryFee = subtotal >= 30 ? 0 : 5;
    const total = subtotal + tax + deliveryFee;
    
    const paymentMethodInput = document.querySelector('input[name="paymentMethod"]:checked');
    if (!paymentMethodInput) {
        alert('Please select a payment method!');
        return;
    }
    const paymentMethod = paymentMethodInput.value;
    
    let cardLast4 = null;
    if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber')?.value;
        if (!cardNumber) {
            alert('Please enter card details!');
            return;
        }
        cardLast4 = cardNumber.slice(-4);
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;
    
    try {
        console.log('🔄 Creating order...');
        
        const orderResponse = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: 1,
                items: cart.map(item => ({
                    menu_item_id: parseInt(item.id),
                    quantity: item.quantity,
                    price: item.price
                })),
                total_amount: total,
                delivery_name: deliveryInfo.fullName,
                delivery_phone: deliveryInfo.phone,
                delivery_email: deliveryInfo.email || '',
                delivery_address: `${deliveryInfo.address}, ${deliveryInfo.city}, ${deliveryInfo.state} ${deliveryInfo.zipCode}`,
                payment_method: paymentMethod
            })
        });
        
        const orderData = await orderResponse.json();
        
        if (!orderData.success) {
            throw new Error(orderData.error || 'Failed to create order');
        }
        
        console.log('✅ Order created:', orderData.order.id);
        
        const orderId = orderData.order.id;
        
        console.log('🔄 Processing payment...');
        
        const paymentResponse = await fetch(`${API_BASE_URL}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                order_id: orderId,
                amount: total,
                payment_method: paymentMethod,
                card_last4: cardLast4
            })
        });
        
        const paymentData = await paymentResponse.json();
        
        if (!paymentData.success) {
            throw new Error(paymentData.error || 'Payment failed');
        }
        
        console.log('✅ Payment processed:', paymentData.payment.transaction_id);
        
        localStorage.setItem('lastOrderId', orderId);
        localStorage.setItem('transactionId', paymentData.payment.transaction_id);
        localStorage.removeItem('cart');
        localStorage.removeItem('deliveryAddress');
        
        window.location.href = 'order-success.html';
        
    } catch (error) {
        console.error('❌ Payment error:', error);
        alert('Payment failed: ' + error.message + '\nPlease try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
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
