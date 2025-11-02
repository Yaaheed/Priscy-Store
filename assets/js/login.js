document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await usersAPI.login({ username: username, password: password });

            if (response.success) {
                // Store user info in localStorage
                localStorage.setItem('user', JSON.stringify(response.user));

                // Redirect based on role
                if (response.user.Role === 'Admin') {
                    window.location.href = 'admin-dashboard.html';
                } else if (response.user.Role === 'Staff') {
                    window.location.href = 'staff-dashboard.html';
                }
            } else {
                errorMessage.textContent = response.message;
            }
        } catch (error) {
            errorMessage.textContent = 'Login failed. Please try again.';
            console.error('Login error:', error);
        }
    });
});
