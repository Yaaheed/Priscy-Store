// API Base URL
const API_BASE = 'http://localhost:3000/api';

// Generic API functions
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Products API
const productsAPI = {
    getAll: () => apiRequest('/products'),
    create: (product) => apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(product),
    }),
    update: (id, product) => apiRequest(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(product),
    }),
    updateStock: (id, stock) => apiRequest(`/products/${id}/stock`, {
        method: 'PUT',
        body: JSON.stringify({ QuantityInStock: stock }),
    }),
    delete: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),
};

// Sales API
const salesAPI = {
    getAll: () => apiRequest('/sales'),
    create: (sale) => apiRequest('/sales', {
        method: 'POST',
        body: JSON.stringify(sale),
    }),
    update: (id, sale) => apiRequest(`/sales/${id}`, {
        method: 'PUT',
        body: JSON.stringify(sale),
    }),
    delete: (id) => apiRequest(`/sales/${id}`, { method: 'DELETE' }),
};

// Purchases API
const purchasesAPI = {
    getAll: () => apiRequest('/purchases'),
    create: (purchase) => apiRequest('/purchases', {
        method: 'POST',
        body: JSON.stringify(purchase),
    }),
    updateStatus: (id, status) => apiRequest(`/purchases/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ Status: status }),
    }),
    delete: (id) => apiRequest(`/purchases/${id}`, { method: 'DELETE' }),
};

// Notifications API
const notificationsAPI = {
    getAll: () => apiRequest('/notifications'),
    markAsRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),
    delete: (id) => apiRequest(`/notifications/${id}`, { method: 'DELETE' }),
};

// Users API
const usersAPI = {
    login: (credentials) => apiRequest('/users/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),
    getAll: () => apiRequest('/users'),
    create: (user) => apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(user),
    }),
    update: (id, user) => apiRequest(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(user),
    }),
    delete: (id) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
};

// Categories API (assuming similar structure)
const categoriesAPI = {
    getAll: () => apiRequest('/categories'),
    create: (category) => apiRequest('/categories', {
        method: 'POST',
        body: JSON.stringify(category),
    }),
    update: (id, category) => apiRequest(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(category),
    }),
    delete: (id) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),
};

// Suppliers API
const suppliersAPI = {
    getAll: () => apiRequest('/suppliers'),
    create: (supplier) => apiRequest('/suppliers', {
        method: 'POST',
        body: JSON.stringify(supplier),
    }),
    update: (id, supplier) => apiRequest(`/suppliers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(supplier),
    }),
    delete: (id) => apiRequest(`/suppliers/${id}`, { method: 'DELETE' }),
};
