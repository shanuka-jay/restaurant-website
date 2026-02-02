// Order success page specific code (uses utils.js for common functions)

// Load order details from backend
async function loadOrderDetails() {
  const orderId = localStorage.getItem("lastOrderId");
  const transactionId = localStorage.getItem("transactionId");

  if (!orderId) {
    console.error("❌ No order ID found");
    const orderNumberSpan = document.getElementById("orderNumber");
    if (orderNumberSpan) {
      orderNumberSpan.textContent = Math.floor(100000 + Math.random() * 900000);
    }
    return;
  }

  try {
    console.log("🔄 Fetching order details for ID:", orderId);

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
    const data = await response.json();

    if (data.success) {
      const order = data.order;

      console.log("✅ Order loaded:", order);

      const orderNumberSpan = document.getElementById("orderNumber");
      if (orderNumberSpan) {
        orderNumberSpan.textContent = `#${order.id}`;
      }

      const orderStatusSpan = document.getElementById("orderStatus");
      if (orderStatusSpan) {
        orderStatusSpan.textContent = order.status.toUpperCase();
        orderStatusSpan.className = `status-badge ${order.status}`;
      }

      const deliveryInfoDiv = document.getElementById("deliveryInfo");
      if (deliveryInfoDiv) {
        deliveryInfoDiv.innerHTML = `
                    <p style="margin: 10px 0;"><strong>Name:</strong> ${order.delivery_name}</p>
                    <p style="margin: 10px 0;"><strong>Phone:</strong> ${order.delivery_phone}</p>
                    ${order.delivery_email ? `<p style="margin: 10px 0;"><strong>Email:</strong> ${order.delivery_email}</p>` : ""}
                    <p style="margin: 10px 0;"><strong>Address:</strong> ${order.delivery_address}</p>
                    <p style="margin: 10px 0;"><strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}</p>
                `;
      }

      const orderItemsDiv = document.getElementById("orderItems");
      if (orderItemsDiv && order.items) {
        orderItemsDiv.innerHTML = order.items
          .map(
            (item) => `
                        <div style="display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid var(--light-gray);">
                            <img src="${item.image_url}" alt="${item.name}" 
                                 style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
                            <div style="flex: 1;">
                                <h4 style="font-family: 'Playfair Display', serif; margin-bottom: 5px; color: var(--dark-gray);">${item.name}</h4>
                                <p style="color: var(--text-gray); font-size: 14px;">Quantity: ${item.quantity} × $${parseFloat(item.price).toFixed(2)}</p>
                            </div>
                            <div style="font-weight: 600; color: var(--dark-gray); font-size: 18px;">
                                $${(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </div>
                        </div>
                    `,
          )
          .join("");
      }

      const orderSummaryDiv = document.getElementById("orderSummary");
      if (orderSummaryDiv) {
        const subtotal = order.items.reduce(
          (sum, item) => sum + parseFloat(item.price) * item.quantity,
          0,
        );
        const deliveryFee = subtotal >= 30 ? 0 : 5;
        const tax = subtotal * 0.0875;

        orderSummaryDiv.innerHTML = `
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; color: var(--text-gray);">
                        <span>Subtotal</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; color: var(--text-gray);">
                        <span>Delivery Fee</span>
                        <span>${deliveryFee === 0 ? "FREE" : "$" + deliveryFee.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; color: var(--text-gray);">
                        <span>Tax (8.75%)</span>
                        <span>$${tax.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 15px 0; margin-top: 10px; border-top: 2px solid var(--primary-gold); font-weight: 600; font-size: 18px; color: var(--dark-gray);">
                        <span>Total</span>
                        <span style="color: var(--primary-gold);">$${order.total_amount.toFixed(2)}</span>
                    </div>
                `;
      }
    } else {
      console.error("❌ Failed to load order:", data.error);
      const orderNumberSpan = document.getElementById("orderNumber");
      if (orderNumberSpan) {
        orderNumberSpan.textContent = `#${orderId}`;
      }
    }
  } catch (error) {
    console.error("❌ Error loading order:", error);
    const orderNumberSpan = document.getElementById("orderNumber");
    if (orderNumberSpan) {
      orderNumberSpan.textContent = `#${orderId}`;
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadOrderDetails();
});
