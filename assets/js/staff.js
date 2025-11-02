document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.Role !== 'Staff') {
        window.location.href = '../index.html';
        return;
    }

    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            document.getElementById(tabId).classList.add('active');

            // Load data for the selected tab
            loadTabData(tabId);
        });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = '../index.html';
    });

    // Load initial data
    loadTabData('recordSale');
    loadProductsForSale();

    // Setup real-time updates
    setupRealtimeListeners();

    // Sale form submission
    document.getElementById('saleForm').addEventListener('submit', handleSaleSubmit);
});

async function loadTabData(tabId) {
    switch (tabId) {
        case 'viewProducts':
            await loadProducts();
            break;
        case 'salesHistory':
            await loadSalesHistory();
            break;
        case 'notifications':
            await loadNotifications();
            break;
    }
}

async function loadProductsForSale() {
    try {
        const products = await productsAPI.getAll();
        const select = document.getElementById('saleProduct');
        select.innerHTML = '<option value="">Select Product</option>';

        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.ProductID;
            option.textContent = `${product.ProductName} (Stock: ${product.QuantityInStock})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading products for sale:', error);
    }
}

async function loadProducts() {
    try {
        const products = await productsAPI.getAll();
        const tbody = document.querySelector('#productsTable tbody');
        tbody.innerHTML = '';

        products.forEach(product => {
            const row = `
                <tr>
                    <td data-label="ID">${product.ProductID}</td>
                    <td data-label="Name">${product.ProductName}</td>
                    <td data-label="Stock">${product.QuantityInStock}</td>
                    <td data-label="Price">$${product.UnitPrice}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function loadSalesHistory() {
    try {
        const sales = await salesAPI.getAll();
        const tbody = document.querySelector('#salesTable tbody');
        tbody.innerHTML = '';

        sales.forEach(sale => {
            const row = `
                <tr>
                    <td data-label="ID">${sale.SaleID}</td>
                    <td data-label="Product">${sale.ProductName}</td>
                    <td data-label="Quantity">${sale.QuantitySold}</td>
                    <td data-label="Price">$${sale.SalePrice}</td>
                    <td data-label="Date">${new Date(sale.SaleDate).toLocaleDateString()}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error loading sales history:', error);
    }
}

async function loadNotifications() {
    try {
        const notifications = await notificationsAPI.getAll();
        const container = document.getElementById('notificationList');
        container.innerHTML = '';

        notifications.forEach(notification => {
            const div = document.createElement('div');
            div.className = `notification ${notification.IsRead ? 'read' : 'unread'}`;
            div.innerHTML = `
                <h4>${notification.ProductName}</h4>
                <p>${notification.Message}</p>
                <small>${new Date(notification.CreatedAt).toLocaleString()}</small>
                ${!notification.IsRead ? '<button onclick="markAsRead(' + notification.NotificationID + ')">Mark as Read</button>' : ''}
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

async function handleSaleSubmit(e) {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('user'));
    const formData = new FormData(e.target);
    const sale = {
        productID: formData.get('ProductID'),
        quantitySold: parseInt(formData.get('QuantitySold'), 10),
        salePrice: parseFloat(formData.get('SalePrice')),
        userID: user.UserID,
    };

    try {
        await salesAPI.create(sale);
        alert('Sale recorded successfully!');
        e.target.reset();
        loadProductsForSale();
        loadNotifications();
    } catch (error) {
        console.error('Error recording sale:', error);
        alert('Error recording sale');
    }
}

async function markAsRead(notificationId) {
    try {
        await notificationsAPI.markAsRead(notificationId);
        loadNotifications();
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

function setupRealtimeListeners() {
    console.log('Setting up real-time listeners for staff...');

    const collections = [
        'products',
        'sales',
        'notifications'
    ];

    collections.forEach(collection => {
        const channel = `databases.inventory-db.collections.${collection}.documents`;
        appwriteClient.subscribe(channel, response => {
            console.log(`Real-time event from ${collection}:`, response.events);

            // A change occurred, reload the currently active tab and product dropdown
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) {
                loadTabData(activeTab.dataset.tab);
            }
            loadProductsForSale(); // Always keep the sale dropdown fresh
        });
    });
}
