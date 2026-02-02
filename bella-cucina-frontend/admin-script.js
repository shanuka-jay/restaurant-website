// ============================================
// ADMIN PANEL JAVASCRIPT
// ============================================

let currentEditingItem = null;
let uploadedImageFile = null;

// Check admin access on load
document.addEventListener('DOMContentLoaded', async function() {
    await checkAdminAccess();
    await loadMenuItems();
    setupImageUpload();
});

// Check if user is admin
async function checkAdminAccess() {
    try {
        const response = await API.auth.getUser();
        if (response.data.role !== 'admin') {
            showNotification('Access denied. Admin only.', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    } catch (error) {
        showNotification('Please login as admin', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
}

// ============================================
// TAB SWITCHING
// ============================================

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Show selected tab
    switch(tabName) {
        case 'menu':
            document.getElementById('menuTab').classList.add('active');
            loadMenuItems();
            break;
        case 'orders':
            document.getElementById('ordersTab').classList.add('active');
            loadOrders();
            break;
        case 'messages':
            document.getElementById('messagesTab').classList.add('active');
            loadMessages();
            break;
    }
}

// ============================================
// MENU ITEMS MANAGEMENT
// ============================================

// Load all menu items
async function loadMenuItems() {
    try {
        const response = await API.menu.getAll();
        const menuItems = response.data;

        const grid = document.getElementById('adminMenuGrid');
        grid.innerHTML = menuItems.map(item => `
            <div class="admin-menu-item">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <div class="admin-menu-item-content">
                    <div class="category">${item.category}</div>
                    <h3>${item.name}</h3>
                    <div class="price">$${item.price.toFixed(2)}</div>
                    <span class="status-badge ${item.isAvailable ? 'status-available' : 'status-unavailable'}">
                        ${item.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    <div class="admin-menu-item-actions" style="margin-top: 15px;">
                        <button class="btn btn-ghost btn-small" onclick='editMenuItem(${JSON.stringify(item)})'>Edit</button>
                        <button class="btn btn-primary btn-small" onclick="deleteMenuItem('${item.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading menu items:', error);
        showNotification('Error loading menu items', 'error');
    }
}

// Open add modal
function openAddModal() {
    currentEditingItem = null;
    document.getElementById('modalTitle').textContent = 'Add Menu Item';
    document.getElementById('menuItemForm').reset();
    document.getElementById('editingItemId').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imageUrl').value = '';
    uploadedImageFile = null;
    document.getElementById('menuModal').classList.add('active');
}

// Edit menu item
function editMenuItem(item) {
    currentEditingItem = item;
    document.getElementById('modalTitle').textContent = 'Edit Menu Item';
    document.getElementById('editingItemId').value = item.id;
    document.getElementById('itemId').value = item.id;
    document.getElementById('itemId').disabled = true; // Can't change ID when editing
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemDescription').value = item.description;
    document.getElementById('itemIngredients').value = item.ingredients ? item.ingredients.join('\n') : '';
    document.getElementById('itemAvailable').checked = item.isAvailable;
    document.getElementById('imageUrl').value = item.image;
    
    // Show current image
    const preview = document.getElementById('imagePreview');
    preview.src = item.image;
    preview.style.display = 'block';
    
    document.getElementById('menuModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('menuModal').classList.remove('active');
    document.getElementById('menuItemForm').reset();
    document.getElementById('itemId').disabled = false;
    uploadedImageFile = null;
}

// Save menu item (create or update)
async function saveMenuItem(event) {
    event.preventDefault();

    try {
        const itemId = document.getElementById('editingItemId').value || document.getElementById('itemId').value;
        const isEditing = document.getElementById('editingItemId').value !== '';

        // Upload image if new one selected
        let imageUrl = document.getElementById('imageUrl').value;
        if (uploadedImageFile) {
            const uploadedUrl = await uploadImage(uploadedImageFile);
            if (uploadedUrl) {
                imageUrl = uploadedUrl;
            }
        }

        // Prepare data
        const ingredients = document.getElementById('itemIngredients').value
            .split('\n')
            .map(i => i.trim())
            .filter(i => i.length > 0);

        const data = {
            id: itemId,
            name: document.getElementById('itemName').value,
            category: document.getElementById('itemCategory').value,
            price: parseFloat(document.getElementById('itemPrice').value),
            description: document.getElementById('itemDescription').value,
            ingredients: ingredients,
            image: imageUrl,
            isAvailable: document.getElementById('itemAvailable').checked
        };

        // Create or update
        if (isEditing) {
            await API.menu.update(itemId, data);
            showNotification('Menu item updated successfully!');
        } else {
            await API.menu.create(data);
            showNotification('Menu item created successfully!');
        }

        closeModal();
        await loadMenuItems();

    } catch (error) {
        console.error('Error saving menu item:', error);
        showNotification(error.message || 'Error saving menu item', 'error');
    }
}

// Delete menu item
async function deleteMenuItem(itemId) {
    if (!confirm('Are you sure you want to delete this menu item?')) {
        return;
    }

    try {
        await API.menu.delete(itemId);
        showNotification('Menu item deleted successfully!');
        await loadMenuItems();
    } catch (error) {
        console.error('Error deleting menu item:', error);
        showNotification('Error deleting menu item', 'error');
    }
}

// ============================================
// IMAGE UPLOAD
// ============================================

// Setup drag and drop for image upload
function setupImageUpload() {
    const uploadArea = document.getElementById('imageUploadArea');

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageFile(file);
        }
    });
}

// Handle image selection
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleImageFile(file);
    }
}

// Handle image file
function handleImageFile(file) {
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size must be less than 5MB', 'error');
        return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file', 'error');
        return;
    }

    uploadedImageFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('imagePreview');
        preview.src = e.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Upload image to server
async function uploadImage(file) {
    try {
        const formData = new FormData();
        formData.append('image', file);

        const token = API.getToken();
        const response = await fetch(`${API_CONFIG.BASE_URL}/upload/menu-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }

        return data.data.url;

    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Error uploading image', 'error');
        return null;
    }
}

// ============================================
// ORDERS MANAGEMENT
// ============================================

// Load all orders
async function loadOrders() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/orders/admin/all`, {
            headers: {
                'Authorization': `Bearer ${API.getToken()}`
            }
        });

        const data = await response.json();
        const orders = data.data;

        const table = document.getElementById('adminOrdersTable');
        
        if (orders.length === 0) {
            table.innerHTML = '<p style="padding: 40px; text-align: center;">No orders yet</p>';
            return;
        }

        table.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            <td><strong>${order.orderNumber}</strong></td>
                            <td>${order.fullName}<br><small>${order.email}</small></td>
                            <td>${order.items.length} items</td>
                            <td>$${order.total.toFixed(2)}</td>
                            <td>
                                <select onchange="updateOrderStatus(${order.id}, this.value)" style="padding: 5px;">
                                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
                                    <option value="on_the_way" ${order.status === 'on_the_way' ? 'selected' : ''}>On the Way</option>
                                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                            </td>
                            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button class="btn btn-ghost btn-small" onclick="viewOrderDetails(${order.id})">View</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Error loading orders', 'error');
    }
}

// Update order status
async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API.getToken()}`
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) throw new Error('Failed to update status');

        showNotification('Order status updated');

    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('Error updating order status', 'error');
    }
}

// View order details
async function viewOrderDetails(orderId) {
    alert('Order details view - Coming soon!');
    // Implement a modal to show full order details
}

// ============================================
// CONTACT MESSAGES
// ============================================

// Load contact messages
async function loadMessages() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/contact`, {
            headers: {
                'Authorization': `Bearer ${API.getToken()}`
            }
        });

        const data = await response.json();
        const messages = data.data;

        const table = document.getElementById('adminMessagesTable');
        
        if (messages.length === 0) {
            table.innerHTML = '<p style="padding: 40px; text-align: center;">No messages yet</p>';
            return;
        }

        table.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Type</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${messages.map(msg => `
                        <tr>
                            <td>${msg.firstName} ${msg.lastName}</td>
                            <td>${msg.email}</td>
                            <td>${msg.inquiryType}</td>
                            <td>${msg.message.substring(0, 100)}${msg.message.length > 100 ? '...' : ''}</td>
                            <td>
                                <select onchange="updateMessageStatus(${msg.id}, this.value)" style="padding: 5px;">
                                    <option value="new" ${msg.status === 'new' ? 'selected' : ''}>New</option>
                                    <option value="read" ${msg.status === 'read' ? 'selected' : ''}>Read</option>
                                    <option value="replied" ${msg.status === 'replied' ? 'selected' : ''}>Replied</option>
                                    <option value="archived" ${msg.status === 'archived' ? 'selected' : ''}>Archived</option>
                                </select>
                            </td>
                            <td>${new Date(msg.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button class="btn btn-ghost btn-small" onclick="deleteMessage(${msg.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

    } catch (error) {
        console.error('Error loading messages:', error);
        showNotification('Error loading messages', 'error');
    }
}

// Update message status
async function updateMessageStatus(messageId, status) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/contact/${messageId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API.getToken()}`
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) throw new Error('Failed to update status');

        showNotification('Message status updated');

    } catch (error) {
        console.error('Error updating message status:', error);
        showNotification('Error updating message status', 'error');
    }
}

// Delete message
async function deleteMessage(messageId) {
    if (!confirm('Are you sure you want to delete this message?')) {
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/contact/${messageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${API.getToken()}`
            }
        });

        if (!response.ok) throw new Error('Failed to delete message');

        showNotification('Message deleted');
        await loadMessages();

    } catch (error) {
        console.error('Error deleting message:', error);
        showNotification('Error deleting message', 'error');
    }
}
