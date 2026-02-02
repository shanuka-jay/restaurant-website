// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Load order details from backend
async function loadOrderDetails() {
    const orderId = localStorage.getItem('lastOrderId');
    const transactionId = localStorage.getItem('transactionId');
    
    if (!orderId) {
        console.error('❌ No order ID found');
        const orderNumberSpan = document.getElementById('orderNumber');
        if (orderNumberSpan) {
            orderNumberSpan.textContent = Math.floor(100000 + Math.random() * 900000);
        }
        return;
    }
    
    try {
        console.log('🔄 Fetching order details for ID:', orderId);
        
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
        const data = await response.json();
        
        if (data.success) {
            const order = data.order;
            
            console.log('✅ Order loaded:', order);
            
            const orderNumberSpan = document.getElementById('orderNumber');
            if (orderNumberSpan) {
                orderNumberSpan.textContent = `#${order.id}`;
            }
            
            const orderStatusSpan = document.getElementById('orderStatus');
            if (orderStatusSpan) {
                orderStatusSpan.textContent = order.status.toUpperCase();
                orderStatusSpan.className = `status-badge ${order.status}`;
            }
            
            const deliveryInfoDiv = document.getElementById('deliveryInfo');
            if (deliveryInfoDiv) {
                deliveryInfoDiv.innerHTML = `
                    <h3>Delivery Information</h3>
                    <p><strong>Name:</strong> ${order.delivery_name}</p>
                    <p><strong>Phone:</strong> ${order.delivery_phone}</p>
                    ${order.delivery_email ? `<p><strong>Email:</strong> ${order.delivery_email}</p>` : ''}
                    <p><strong>Address:</strong> ${order.delivery_address}</p>
                    <p><strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}</p>
                `;
            }
            
            const orderItemsDiv = document.getElementById('orderItems');
            if (orderItemsDiv && order.items) {
                orderItemsDiv.innerHTML = `
                    <h3>Order Items</h3>
                    ${order.items.map(item => `
                        <div class="order-item">
                            <img src="${item.image_url}" alt="${item.name}">
                            <div class="item-details">
                                <h4>${item.name}</h4>
                                <p>Quantity: ${item.quantity} × $${item.price}</p>
                                <p class="item-category">${item.category}</p>
                            </div>
                            <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                    `).join('')}
                `;
            }
            
            const orderTotalSpan = document.getElementById('orderTotal');
            if (orderTotalSpan) {
                orderTotalSpan.textContent = `$${order.total_amount.toFixed(2)}`;
            }
            
            const transactionIdSpan = document.getElementById('transactionId');
            if (transactionIdSpan && transactionId) {
                transactionIdSpan.textContent = transactionId;
            }
            
            const deliveryTimeSpan = document.getElementById('deliveryTime');
            if (deliveryTimeSpan) {
                const orderDate = new Date(order.created_at);
                const estimatedTime = new Date(orderDate.getTime() + 45 * 60000);
                deliveryTimeSpan.textContent = estimatedTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            }
            
        } else {
            console.error('❌ Failed to load order:', data.error);
            const orderNumberSpan = document.getElementById('orderNumber');
            if (orderNumberSpan) {
                orderNumberSpan.textContent = `#${orderId}`;
            }
        }
        
    } catch (error) {
        console.error('❌ Error loading order:', error);
        const orderNumberSpan = document.getElementById('orderNumber');
        if (orderNumberSpan) {
            orderNumberSpan.textContent = `#${orderId}`;
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadOrderDetails();
});
