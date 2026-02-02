// API Configuration
const API_BASE_URL = "http://localhost:3000/api";

// Cart Management Functions
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Save cart to localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// Update cart count badge
function updateCartCount() {
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartBadge = document.getElementById("cartCount");
  if (cartBadge) {
    cartBadge.textContent = cartCount;
    cartBadge.style.display = cartCount > 0 ? "flex" : "none";
  }
}

// Menu Data Storage
let foodData = {};

// Load Menu from API
async function loadMenuFromAPI() {
  try {
    console.log("🔄 Loading menu from API...");
    const response = await fetch(`${API_BASE_URL}/menu`);
    const data = await response.json();

    if (data.success) {
      console.log("✅ Menu loaded:", data.items.length, "items");

      // Store menu items with dual keys (name-based and ID-based)
      data.items.forEach((item) => {
        // Create name-based key (for backward compatibility)
        const nameKey = item.name.toLowerCase().replace(/\s+/g, "");

        // Map API response to frontend format
        const mappedItem = {
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          description: item.description,
          ingredients: item.ingredients,
          image: item.image_url, // Map image_url to image
          image_url: item.image_url,
        };

        // Store with both keys
        foodData[nameKey] = mappedItem;
        foodData[item.id] = mappedItem;

        console.log(
          `📝 Stored: ${item.name} (ID: ${item.id}) - Image: ${item.image_url}`,
        );
      });

      return foodData;
    } else {
      console.error("❌ Failed to load menu:", data.error);
      return null;
    }
  } catch (error) {
    console.error("❌ Error loading menu:", error);
    return null;
  }
}

// Parse ingredients (handles both JSON arrays and comma-separated strings)
function parseIngredients(ingredients) {
  if (!ingredients) return [];

  if (typeof ingredients === "string") {
    try {
      // Try parsing as JSON first
      return JSON.parse(ingredients);
    } catch (e) {
      // If JSON parse fails, treat as comma-separated string
      return ingredients.split(",").map((ing) => ing.trim());
    }
  }

  return ingredients;
}

// Format price
function formatPrice(price) {
  return `$${parseFloat(price).toFixed(2)}`;
}

// Initialize cart on page load
document.addEventListener("DOMContentLoaded", function () {
  updateCartCount();
});
