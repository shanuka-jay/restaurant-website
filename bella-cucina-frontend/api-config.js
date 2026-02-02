// API Configuration
// This file should be placed in the frontend root directory

const API_CONFIG = {
    BASE_URL: 'http://localhost:5000/api',
    ENDPOINTS: {
        // Auth
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        GET_USER: '/auth/me',
        UPDATE_PROFILE: '/auth/update',
        CHANGE_PASSWORD: '/auth/change-password',
        
        // Menu
        MENU_ITEMS: '/menu',
        MENU_ITEM: (id) => `/menu/${id}`,
        CATEGORIES: '/menu/categories',
        
        // Cart
        CART: '/cart',
        CART_ITEM: (id) => `/cart/${id}`,
        
        // Orders
        ORDERS: '/orders',
        ORDER: (id) => `/orders/${id}`,
        TRACK_ORDER: (orderNumber) => `/orders/track/${orderNumber}`,
        
        // Contact
        CONTACT: '/contact',
        
        // Upload
        UPLOAD_IMAGE: '/upload/menu-image',
        DELETE_IMAGE: (filename) => `/upload/menu-image/${filename}`,
    }
};

// API Helper Functions
const API = {
    // Helper to get token from localStorage
    getToken: () => localStorage.getItem('token'),
    
    // Helper to set token
    setToken: (token) => localStorage.setItem('token', token),
    
    // Helper to remove token
    removeToken: () => localStorage.removeItem('token'),
    
    // Generic request function
    async request(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const token = this.getToken();
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // GET request
    get: (endpoint) => API.request(endpoint, { method: 'GET' }),
    
    // POST request
    post: (endpoint, body) => API.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
    }),
    
    // PUT request
    put: (endpoint, body) => API.request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body)
    }),
    
    // DELETE request
    delete: (endpoint) => API.request(endpoint, { method: 'DELETE' }),
    
    // Auth API calls
    auth: {
        register: (data) => API.post(API_CONFIG.ENDPOINTS.REGISTER, data),
        login: (data) => API.post(API_CONFIG.ENDPOINTS.LOGIN, data),
        getUser: () => API.get(API_CONFIG.ENDPOINTS.GET_USER),
        updateProfile: (data) => API.put(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, data),
        changePassword: (data) => API.put(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, data),
    },
    
    // Menu API calls
    menu: {
        getAll: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return API.get(`${API_CONFIG.ENDPOINTS.MENU_ITEMS}${query ? '?' + query : ''}`);
        },
        getById: (id) => API.get(API_CONFIG.ENDPOINTS.MENU_ITEM(id)),
        getCategories: () => API.get(API_CONFIG.ENDPOINTS.CATEGORIES),
        create: (data) => API.post(API_CONFIG.ENDPOINTS.MENU_ITEMS, data),
        update: (id, data) => API.put(API_CONFIG.ENDPOINTS.MENU_ITEM(id), data),
        delete: (id) => API.delete(API_CONFIG.ENDPOINTS.MENU_ITEM(id)),
    },
    
    // Cart API calls
    cart: {
        get: () => API.get(API_CONFIG.ENDPOINTS.CART),
        add: (data) => API.post(API_CONFIG.ENDPOINTS.CART, data),
        update: (id, data) => API.put(API_CONFIG.ENDPOINTS.CART_ITEM(id), data),
        remove: (id) => API.delete(API_CONFIG.ENDPOINTS.CART_ITEM(id)),
        clear: () => API.delete(API_CONFIG.ENDPOINTS.CART),
    },
    
    // Orders API calls
    orders: {
        create: (data) => API.post(API_CONFIG.ENDPOINTS.ORDERS, data),
        getAll: () => API.get(API_CONFIG.ENDPOINTS.ORDERS),
        getById: (id) => API.get(API_CONFIG.ENDPOINTS.ORDER(id)),
        track: (orderNumber) => API.get(API_CONFIG.ENDPOINTS.TRACK_ORDER(orderNumber)),
        cancel: (id) => API.delete(API_CONFIG.ENDPOINTS.ORDER(id)),
    },
    
    // Contact API calls
    contact: {
        submit: (data) => API.post(API_CONFIG.ENDPOINTS.CONTACT, data),
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, API };
}
