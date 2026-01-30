// Remove from cart
function removeFromCart(foodId) {
  cart = cart.filter((item) => item.id !== foodId);
  saveCart();
  loadCartPage();
}

// Update cart item quantity
function updateCartQuantity(foodId, change) {
  const item = cart.find((item) => item.id === foodId);
  if (item) {
    item.quantity = Math.max(1, item.quantity + change);
    saveCart();
    loadCartPage();
  }
}

// Load cart page
function loadCartPage() {
  const cartItemsContainer = document.getElementById("cartItems");
  const cartSummary = document.getElementById("cartSummary");

  if (!cartItemsContainer || !cartSummary) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;">🛒</div>
                <h3 style="font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 15px;">Your cart is empty</h3>
                <p style="color: var(--text-gray); margin-bottom: 30px;">Add some delicious items to get started!</p>
                <a href="../menu/menu.html" class="btn btn-primary">Browse Menu</a>
            </div>
        `;
    cartSummary.innerHTML = "";
    return;
  }

  // Display cart items
  cartItemsContainer.innerHTML = cart
    .map(
      (item) => `
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
    `,
    )
    .join("");

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
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
            <span>${deliveryFee === 0 ? "FREE" : "$" + deliveryFee.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Tax (8.75%)</span>
            <span>$${tax.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
        </div>
        ${subtotal < 30 ? '<p class="delivery-notice">Add $' + (30 - subtotal).toFixed(2) + " more for free delivery!</p>" : ""}
        <a href="checkout.html" class="btn btn-primary" style="width: 100%; margin-top: 20px;">Proceed to Checkout</a>
        <a href="../menu/menu.html" class="btn btn-ghost" style="width: 100%; margin-top: 10px;">Continue Shopping</a>
    `;
}

document.addEventListener("DOMContentLoaded", function () {
  loadCartPage();
});
