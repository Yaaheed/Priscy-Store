document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.Role !== 'Admin') {
        window.location.href = 'index.html';
        return;
    }

    // Search terms for each tab
    let searchTerms = {
        products: '',
        categories: '',
        suppliers: '',
        users: '',
        purchases: '',
        sales: '',
        notifications: ''
    };

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
            loadTabData(tabId, searchTerms[tabId]);
        });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = '../index.html';
    });

    // Load initial data
    loadOverview();
    loadTabData('products', searchTerms.products);

    // Setup real-time updates
    setupRealtimeListeners();

    // Event listeners for buttons
    document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());
    document.getElementById('addCategoryBtn').addEventListener('click', () => openCategoryModal());
    document.getElementById('addSupplierBtn').addEventListener('click', () => openSupplierModal());
    document.getElementById('addUserBtn').addEventListener('click', () => openUserModal());
    document.getElementById('addPurchaseBtn').addEventListener('click', () => openPurchaseModal());

    // Modal close
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
        });
    });

    // Product form submission
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);

    // Category form submission
    document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);

    // Supplier form submission
    document.getElementById('supplierForm').addEventListener('submit', handleSupplierSubmit);

    // User form submission
    document.getElementById('userForm').addEventListener('submit', handleUserSubmit);

    // Purchase form submission
    document.getElementById('purchaseForm').addEventListener('submit', handlePurchaseSubmit);

    // Sale form submission
    document.getElementById('saleForm').addEventListener('submit', handleSaleSubmit);

    // Search event listeners
    document.getElementById('productsSearch').addEventListener('input', (e) => {
        searchTerms.products = e.target.value.toLowerCase();
        loadTabData('products', searchTerms.products);
    });

    document.getElementById('categoriesSearch').addEventListener('input', (e) => {
        searchTerms.categories = e.target.value.toLowerCase();
        loadTabData('categories', searchTerms.categories);
    });

    document.getElementById('suppliersSearch').addEventListener('input', (e) => {
        searchTerms.suppliers = e.target.value.toLowerCase();
        loadTabData('suppliers', searchTerms.suppliers);
    });

    document.getElementById('usersSearch').addEventListener('input', (e) => {
        searchTerms.users = e.target.value.toLowerCase();
        loadTabData('users', searchTerms.users);
    });

    document.getElementById('purchasesSearch').addEventListener('input', (e) => {
        searchTerms.purchases = e.target.value.toLowerCase();
        loadTabData('purchases', searchTerms.purchases);
    });

    document.getElementById('salesSearch').addEventListener('input', (e) => {
        searchTerms.sales = e.target.value.toLowerCase();
        loadTabData('sales', searchTerms.sales);
    });

    document.getElementById('notificationsSearch').addEventListener('input', (e) => {
        searchTerms.notifications = e.target.value.toLowerCase();
        loadTabData('notifications', searchTerms.notifications);
    });
});

async function loadOverview() {
    try {
        const products = await productsAPI.getAll();
        const sales = await salesAPI.getAll();
        const suppliers = await suppliersAPI.getAll();

        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalSales').textContent = sales.length;
        document.getElementById('totalSuppliers').textContent = suppliers.length;

        const lowStockCount = products.filter(p => p.QuantityInStock <= p.ReorderLevel).length;
        document.getElementById('lowStockCount').textContent = lowStockCount;
    } catch (error) {
        console.error('Error loading overview:', error);
    }
}

async function loadTabData(tabId, searchTerm = '') {
    switch (tabId) {
        case 'products':
            await loadProducts(searchTerm);
            break;
        case 'categories':
            await loadCategories(searchTerm);
            break;
        case 'suppliers':
            await loadSuppliers(searchTerm);
            break;
        case 'users':
            await loadUsers(searchTerm);
            break;
        case 'purchases':
            await loadPurchases(searchTerm);
            break;
        case 'sales':
            await loadSales(searchTerm);
            break;
        case 'notifications':
            await loadNotifications(searchTerm);
            break;
    }
}

async function loadProducts(searchTerm = '') {
    try {
        const products = await productsAPI.getAll();
        const filteredProducts = products.filter(product =>
            product.ProductName.toLowerCase().includes(searchTerm) ||
            product.CategoryName.toLowerCase().includes(searchTerm) ||
            product.SupplierName.toLowerCase().includes(searchTerm)
        );
        const tbody = document.querySelector('#productsTable tbody');
        tbody.innerHTML = '';

        filteredProducts.forEach((product, index) => {
            const row = document.createElement('tr');
            row.className = 'stagger-item';
            row.style.animationDelay = `${index * 0.1}s`;
            row.innerHTML = `
                <td data-label="ID">${product.ProductID}</td>
                <td data-label="Name">${product.ProductName}</td>
                <td data-label="Category">${product.CategoryName}</td>
                <td data-label="Supplier">${product.SupplierName}</td>
                <td data-label="Stock">${product.QuantityInStock}</td>
                <td data-label="Reorder Level">${product.ReorderLevel}</td>
                <td data-label="Price">$${product.UnitPrice}</td>
                <td data-label="Actions">
                    <button onclick="editProduct(${product.ProductID})" class="edit-btn">Edit</button>
                    <button onclick="deleteProduct(${product.ProductID})" class="delete-btn">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Similar functions for loading other data...

async function loadCategories(searchTerm = '') {
    try {
        const categories = await categoriesAPI.getAll();
        const filteredCategories = categories.filter(category =>
            category.CategoryName.toLowerCase().includes(searchTerm)
        );
        const tbody = document.querySelector('#categoriesTable tbody');
        tbody.innerHTML = '';

        filteredCategories.forEach((category, index) => {
            const row = document.createElement('tr');
            row.className = 'stagger-item';
            row.style.animationDelay = `${index * 0.1}s`;
            row.innerHTML = `
                <td data-label="ID">${category.CategoryID}</td>
                <td data-label="Name">${category.CategoryName}</td>
                <td data-label="Actions">
                    <button onclick="editCategory(${category.CategoryID})" class="edit-btn">Edit</button>
                    <button onclick="deleteCategory(${category.CategoryID})" class="delete-btn">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadSuppliers(searchTerm = '') {
    try {
        const suppliers = await suppliersAPI.getAll();
        const filteredSuppliers = suppliers.filter(supplier =>
            supplier.SupplierName.toLowerCase().includes(searchTerm) ||
            supplier.ContactEmail.toLowerCase().includes(searchTerm) ||
            supplier.Phone.toLowerCase().includes(searchTerm)
        );
        const tbody = document.querySelector('#suppliersTable tbody');
        tbody.innerHTML = '';

        filteredSuppliers.forEach((supplier, index) => {
            const row = document.createElement('tr');
            row.className = 'stagger-item';
            row.style.animationDelay = `${index * 0.1}s`;
            row.innerHTML = `
                <td data-label="ID">${supplier.SupplierID}</td>
                <td data-label="Name">${supplier.SupplierName}</td>
                <td data-label="Email">${supplier.ContactEmail}</td>
                <td data-label="Phone">${supplier.Phone}</td>
                <td data-label="Address">${supplier.Address}</td>
                <td data-label="Actions">
                    <button onclick="editSupplier(${supplier.SupplierID})" class="edit-btn">Edit</button>
                    <button onclick="deleteSupplier(${supplier.SupplierID})" class="delete-btn">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading suppliers:', error);
    }
}

async function loadUsers(searchTerm = '') {
    try {
        const users = await usersAPI.getAll();
        const filteredUsers = users.filter(user =>
            user.Username.toLowerCase().includes(searchTerm) ||
            user.Role.toLowerCase().includes(searchTerm)
        );
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '';

        filteredUsers.forEach((user, index) => {
            const row = document.createElement('tr');
            row.className = 'stagger-item';
            row.style.animationDelay = `${index * 0.1}s`;
            row.innerHTML = `
                <td data-label="ID">${user.UserID}</td>
                <td data-label="Username">${user.Username}</td>
                <td data-label="Role">${user.Role}</td>
                <td data-label="Actions">
                    <button onclick="editUser(${user.UserID})" class="edit-btn">Edit</button>
                    <button onclick="deleteUser(${user.UserID})" class="delete-btn">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function loadPurchases(searchTerm = '') {
    try {
        const purchases = await purchasesAPI.getAll();
        const filteredPurchases = purchases.filter(purchase =>
            purchase.ProductName.toLowerCase().includes(searchTerm) ||
            purchase.SupplierName.toLowerCase().includes(searchTerm) ||
            purchase.Status.toLowerCase().includes(searchTerm)
        );
        const tbody = document.querySelector('#purchasesTable tbody');
        tbody.innerHTML = '';

        filteredPurchases.forEach((purchase, index) => {
            const row = document.createElement('tr');
            row.className = 'stagger-item';
            row.style.animationDelay = `${index * 0.1}s`;
            row.innerHTML = `
                <td data-label="ID">${purchase.PurchaseID}</td>
                <td data-label="Product">${purchase.ProductName}</td>
                <td data-label="Supplier">${purchase.SupplierName}</td>
                <td data-label="Quantity">${purchase.QuantityPurchased}</td>
                <td data-label="Price">$${purchase.PurchasePrice}</td>
                <td data-label="Status">${purchase.Status}</td>
                <td data-label="Date">${new Date(purchase.PurchaseDate).toLocaleDateString()}</td>
                <td data-label="Actions">
                    <button onclick="editPurchase(${purchase.PurchaseID})" class="edit-btn">Edit</button>
                    <button onclick="deletePurchase(${purchase.PurchaseID})" class="delete-btn">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading purchases:', error);
    }
}

async function loadSales(searchTerm = '') {
    try {
        const sales = await salesAPI.getAll();
        const filteredSales = sales.filter(sale =>
            sale.ProductName.toLowerCase().includes(searchTerm) ||
            sale.Username.toLowerCase().includes(searchTerm)
        );
        const tbody = document.querySelector('#salesTable tbody');
        tbody.innerHTML = '';

        filteredSales.forEach((sale, index) => {
            const row = document.createElement('tr');
            row.className = 'stagger-item';
            row.style.animationDelay = `${index * 0.1}s`;
            row.innerHTML = `
                <td data-label="ID">${sale.SaleID}</td>
                <td data-label="Product">${sale.ProductName}</td>
                <td data-label="User">${sale.Username}</td>
                <td data-label="Quantity">${sale.QuantitySold}</td>
                <td data-label="Price">$${sale.SalePrice}</td>
                <td data-label="Date">${new Date(sale.SaleDate).toLocaleDateString()}</td>
                <td data-label="Actions">
                    <button onclick="editSale('${sale.SaleID}')" class="edit-btn">Edit</button>
                    <button onclick="deleteSale('${sale.SaleID}')" class="delete-btn">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading sales:', error);
    }
}

async function loadNotifications(searchTerm = '') {
    try {
        const notifications = await notificationsAPI.getAll();
        const filteredNotifications = notifications.filter(notification =>
            notification.Message.toLowerCase().includes(searchTerm)
        );
        const tbody = document.querySelector('#notificationsTable tbody');
        tbody.innerHTML = '';

        filteredNotifications.forEach((notification, index) => {
            const row = document.createElement('tr');
            row.className = 'stagger-item';
            row.style.animationDelay = `${index * 0.1}s`;
            row.innerHTML = `
                <td data-label="ID">${notification.NotificationID}</td>
                <td data-label="Message">${notification.Message}</td>
                <td data-label="Status">${notification.IsRead ? 'Read' : 'Unread'}</td>
                <td data-label="Date">${new Date(notification.CreatedAt).toLocaleDateString()}</td>
                <td data-label="Actions">
                    ${!notification.IsRead ? `<button onclick="markAsRead('${notification.NotificationID}')" class="edit-btn">Mark as Read</button>` : ''}
                    <button onclick="deleteNotification(${notification.NotificationID})" class="delete-btn">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

async function openProductModal(productId = null) {
    await populateCategoryDropdown();
    await populateSupplierDropdown();

    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('productModalTitle');

    if (productId) {
        title.textContent = 'Edit Product';
        // Load product data and populate form for editing
        try {
            // This assumes your API has a getById method, which is good practice.
            // If not, we can filter from getAll(). For now, let's use editProduct logic.
            const products = await productsAPI.getAll();
            const product = products.find(p => p.ProductID === productId);
            if (product) {
                document.getElementById('productId').value = product.ProductID;
                document.getElementById('productName').value = product.ProductName;
                document.getElementById('productCategory').value = product.CategoryID;
                document.getElementById('productSupplier').value = product.SupplierID;
                document.getElementById('productStock').value = product.QuantityInStock;
                document.getElementById('productReorder').value = product.ReorderLevel;
                document.getElementById('productPrice').value = product.UnitPrice;
            }
        } catch (error) {
            console.error('Error loading product for editing:', error);
        }
    } else {
        title.textContent = 'Add Product';
        form.reset();
        document.getElementById('productId').value = '';
    }

    modal.style.display = 'block';
}

async function handleProductSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const product = {
        ProductName: formData.get('ProductName'),
        CategoryID: formData.get('CategoryID'),
        SupplierID: formData.get('SupplierID'),
        QuantityInStock: parseInt(formData.get('QuantityInStock'), 10),
        ReorderLevel: parseInt(formData.get('ReorderLevel'), 10),
        UnitPrice: parseFloat(formData.get('UnitPrice')),
    };

    try {
        const productId = document.getElementById('productId').value;
        if (productId) {
            await productsAPI.update(productId, product);
        } else {
            await productsAPI.create(product);
        }

        document.getElementById('productModal').style.display = 'none';
        loadProducts();
        loadOverview();
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Error saving product');
    }
}

// Category functions
function openCategoryModal(categoryId = null) {
    const modal = document.getElementById('categoryModal');
    const form = document.getElementById('categoryForm');
    const title = document.getElementById('categoryModalTitle');

    if (categoryId) {
        title.textContent = 'Edit Category';
        // Load category data and populate form
    } else {
        title.textContent = 'Add Category';
        form.reset();
    }

    modal.style.display = 'block';
}

async function handleCategorySubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const category = {
        CategoryName: formData.get('CategoryName'),
    };

    try {
        const categoryId = document.getElementById('categoryId').value;
        if (categoryId) {
            await categoriesAPI.update(categoryId, category);
        } else {
            await categoriesAPI.create(category);
        }

        // Show success animation
        showSuccessMessage('Category saved successfully!');

        // Trigger confetti animation
        triggerConfetti();

        document.getElementById('categoryModal').style.display = 'none';
        loadCategories();
    } catch (error) {
        console.error('Error saving category:', error);
        alert('Error saving category');
    }
}

// Supplier functions
function openSupplierModal(supplierId = null) {
    const modal = document.getElementById('supplierModal');
    const form = document.getElementById('supplierForm');
    const title = document.getElementById('supplierModalTitle');

    if (supplierId) {
        title.textContent = 'Edit Supplier';
        // Load supplier data and populate form
    } else {
        title.textContent = 'Add Supplier';
        form.reset();
    }

    modal.style.display = 'block';
}

async function handleSupplierSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const supplier = {
        SupplierName: formData.get('SupplierName'),
        ContactEmail: formData.get('Email'),
        Phone: formData.get('Phone'),
        Address: formData.get('Address'),
    };

    try {
        const supplierId = document.getElementById('supplierId').value;
        if (supplierId) {
            await suppliersAPI.update(supplierId, supplier);
        } else {
            await suppliersAPI.create(supplier);
        }

        document.getElementById('supplierModal').style.display = 'none';
        loadSuppliers();
        loadOverview();
    } catch (error) {
        console.error('Error saving supplier:', error);
        alert('Error saving supplier');
    }
}

// User functions
function openUserModal(userId = null) {
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    const title = document.getElementById('userModalTitle');

    if (userId) {
        title.textContent = 'Edit User';
        // Load user data and populate form
    } else {
        title.textContent = 'Add User';
        form.reset();
    }

    modal.style.display = 'block';
}

async function handleUserSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const user = {
        Username: formData.get('Username'),
        Password: formData.get('Password'),
        Role: formData.get('Role'),
    };

    try {
        const userId = document.getElementById('userId').value;
        if (userId) {
            await usersAPI.update(userId, user);
        } else {
            await usersAPI.create(user);
        }

        document.getElementById('userModal').style.display = 'none';
        loadUsers();
    } catch (error) {
        console.error('Error saving user:', error);
        alert('Error saving user');
    }
}

// Purchase functions
async function openPurchaseModal(purchaseId = null) {
    await populatePurchaseProductDropdown();
    await populatePurchaseSupplierDropdown();

    const modal = document.getElementById('purchaseModal');
    const form = document.getElementById('purchaseForm');
    const title = document.getElementById('purchaseModalTitle');

    if (purchaseId) {
        title.textContent = 'Edit Purchase';
        // Load purchase data and populate form
    } else {
        title.textContent = 'Add Purchase';
        form.reset();
        document.getElementById('purchaseId').value = '';
    }

    modal.style.display = 'block';
}

async function handlePurchaseSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const purchase = {
        productID: formData.get('ProductID'),
        supplierID: formData.get('SupplierID'),
        quantityPurchased: parseInt(formData.get('QuantityPurchased'), 10),
        purchasePrice: parseFloat(formData.get('PurchasePrice')),
        // Status is handled by the backend on creation
    };

    try {
        const purchaseId = document.getElementById('purchaseId').value;
        if (purchaseId) {
            // For purchases, we typically only update the status
            await purchasesAPI.updateStatus(purchaseId, document.getElementById('purchaseStatus').value);
        } else {
            await purchasesAPI.create(purchase);
        }

        document.getElementById('purchaseModal').style.display = 'none';
        loadPurchases();
    } catch (error) {
        console.error('Error saving purchase:', error);
        alert('Error saving purchase');
    }
}

async function handleSaleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const sale = {
        ProductID: formData.get('ProductID'),
        QuantitySold: parseInt(formData.get('QuantitySold'), 10),
        SalePrice: parseFloat(formData.get('SalePrice')),
    };

    try {
        const saleId = document.getElementById('saleId').value;
        if (saleId) {
            await salesAPI.update(saleId, sale);
        }
        // Creating sales is not a feature for admin, only editing

        document.getElementById('saleModal').style.display = 'none';
        loadSales();
        loadOverview();
    } catch (error) {
        console.error('Error saving sale:', error);
        alert('Error saving sale');
    }
}

// Functions for editing and deleting products, and similar for other entities...

async function editProduct(productId) {
    try {
        // The logic to populate the form is now inside openProductModal
        // We just need to call it with the ID.
        // const product = await productsAPI.getById(productId); // This call is not standard in your api.js
        // document.getElementById('productId').value = product.ProductID;
        // ... and so on
        openProductModal(productId);
    } catch (error) {
        console.error('Error loading product:', error);
    }
}

async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await productsAPI.delete(productId);
            loadProducts();
            loadOverview();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product');
        }
    }
}

async function editCategory(categoryId) {
    try {
        const categories = await categoriesAPI.getAll();
        const category = categories.find(c => c.CategoryID === categoryId);

        if (category) {
            document.getElementById('categoryId').value = category.CategoryID;
            document.getElementById('categoryName').value = category.CategoryName;
        }

        openCategoryModal(category.CategoryID);
    } catch (error) {
        console.error('Error loading category:', error);
    }
}

async function deleteCategory(categoryId) {
    if (confirm('Are you sure you want to delete this category?')) {
        try {
            await categoriesAPI.delete(categoryId);
            loadCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Error deleting category');
        }
    }
}

async function editSupplier(supplierId) {
    try {
        const suppliers = await suppliersAPI.getAll();
        const supplier = suppliers.find(s => s.SupplierID === supplierId);

        if (supplier) {
            document.getElementById('supplierId').value = supplier.SupplierID;
            document.getElementById('supplierName').value = supplier.SupplierName;
            document.getElementById('supplierEmail').value = supplier.ContactEmail;
            document.getElementById('supplierPhone').value = supplier.Phone;
            document.getElementById('supplierAddress').value = supplier.Address;
        }
        openSupplierModal(supplierId);
    } catch (error) {
        console.error('Error loading supplier:', error);
    }
}

async function deleteSupplier(supplierId) {
    if (confirm('Are you sure you want to delete this supplier?')) {
        try {
            await suppliersAPI.delete(supplierId);
            loadSuppliers();
            loadOverview();
        } catch (error) {
            console.error('Error deleting supplier:', error);
            alert('Error deleting supplier');
        }
    }
}

async function editUser(userId) {
    try {
        const users = await usersAPI.getAll();
        const user = users.find(u => u.UserID === userId);

        if (user) {
            document.getElementById('userId').value = user.UserID;
            document.getElementById('userUsername').value = user.Username;
            // Password field should likely be left blank for security
            document.getElementById('userRole').value = user.Role;
        }
        openUserModal(userId);
    } catch (error) {
        console.error('Error loading user:', error);
    }
}

async function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            await usersAPI.delete(userId);
            loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user');
        }
    }
}

async function editPurchase(purchaseId) {
    try {
        await openPurchaseModal(); // To populate dropdowns
        const purchases = await purchasesAPI.getAll();
        const purchase = purchases.find(p => p.PurchaseID === purchaseId);

        if (purchase) {
            document.getElementById('purchaseId').value = purchase.PurchaseID;
            document.getElementById('purchaseProduct').value = purchase.ProductID;
            document.getElementById('purchaseSupplier').value = purchase.SupplierID;
            document.getElementById('purchaseQuantity').value = purchase.QuantityPurchased;
            document.getElementById('purchasePrice').value = purchase.PurchasePrice;
            document.getElementById('purchaseStatus').value = purchase.Status;
        }
        openPurchaseModal(purchaseId);
    } catch (error) {
        console.error('Error loading purchase:', error);
    }
}

async function deletePurchase(purchaseId) {
    if (confirm('Are you sure you want to delete this purchase?')) {
        try {
            await purchasesAPI.delete(purchaseId);
            loadPurchases();
        } catch (error) {
            console.error('Error deleting purchase:', error);
            alert('Error deleting purchase');
        }
    }
}

async function editSale(saleId) {
    try {
        await populateSaleProductDropdown();
        const sales = await salesAPI.getAll();
        const sale = sales.find(s => s.SaleID === saleId);

        if (sale) {
            document.getElementById('saleId').value = sale.SaleID;
            document.getElementById('saleProduct').value = sale.ProductID;
            document.getElementById('saleQuantity').value = sale.QuantitySold;
            document.getElementById('salePrice').value = sale.SalePrice;
        }

        const modal = document.getElementById('saleModal');
        const title = document.getElementById('saleModalTitle');
        title.textContent = 'Edit Sale';
        modal.style.display = 'block';

    } catch (error) {
        console.error('Error loading sale:', error);
    }
}

async function deleteSale(saleId) {
    if (confirm('Are you sure you want to delete this sale?')) {
        try {
            await salesAPI.delete(saleId); // This now works
            loadSales();
            loadOverview();
        } catch (error) {
            console.error('Error deleting sale:', error);
            alert('Error deleting sale');
        }
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

async function deleteNotification(notificationId) {
    if (confirm('Are you sure you want to delete this notification?')) {
        try {
            await notificationsAPI.delete(notificationId);
            loadNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
            alert('Error deleting notification');
        }
    }
}

// Animation helper functions
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

function triggerConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti';

    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.animationDelay = Math.random() * 3 + 's';
        piece.style.background = ['var(--primary-color)', 'var(--success-color)', 'var(--warning-color)', 'var(--danger-color)'][Math.floor(Math.random() * 4)];
        confettiContainer.appendChild(piece);
    }

    document.body.appendChild(confettiContainer);

    setTimeout(() => {
        confettiContainer.remove();
    }, 3000);
}

// Dropdown population functions
async function populateCategoryDropdown() {
    try {
        const categories = await categoriesAPI.getAll();
        const select = document.getElementById('productCategory');
        select.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.CategoryID;
            option.textContent = category.CategoryName;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error populating categories:', error);
    }
}

async function populateSupplierDropdown() {
    try {
        const suppliers = await suppliersAPI.getAll();
        const select = document.getElementById('productSupplier');
        select.innerHTML = '<option value="">Select Supplier</option>';
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.SupplierID;
            option.textContent = supplier.SupplierName;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error populating suppliers:', error);
    }
}

async function populatePurchaseProductDropdown() {
    try {
        const products = await productsAPI.getAll();
        const select = document.getElementById('purchaseProduct');
        select.innerHTML = '<option value="">Select Product</option>';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.ProductID;
            option.textContent = product.ProductName;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error populating products for purchase:', error);
    }
}

async function populatePurchaseSupplierDropdown() {
    // This reuses the supplier dropdown logic, but for the purchase form
    const suppliers = await suppliersAPI.getAll();
    const select = document.getElementById('purchaseSupplier');
    select.innerHTML = '<option value="">Select Supplier</option>';
    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier.SupplierID;
        option.textContent = supplier.SupplierName;
        select.appendChild(option);
    });
}

async function populateSaleProductDropdown() {
    try {
        const products = await productsAPI.getAll();
        const select = document.getElementById('saleProduct');
        select.innerHTML = '<option value="">Select Product</option>';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.ProductID;
            option.textContent = product.ProductName;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error populating products for sale:', error);
    }
}

function setupRealtimeListeners() {
    console.log('Setting up real-time listeners...');

    const collections = [
        'products', 
        'categories', 
        'suppliers', 
        'users', 
        'purchases', 
        'sales', 
        'notifications'
    ];

    collections.forEach(collection => {
        const channel = `databases.inventory-db.collections.${collection}.documents`;
        appwriteClient.subscribe(channel, response => {
            console.log(`Real-time event from ${collection}:`, response.events);
            
            // A change occurred, reload the overview and the currently active tab
            loadOverview();
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) {
                loadTabData(activeTab.dataset.tab);
            }
        });
    });
}
