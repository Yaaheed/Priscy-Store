document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('password-toggle');
    const loginButton = document.getElementById('loginButton');

    passwordToggle.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        // Change icon based on type
        passwordToggle.textContent = type === 'password' ? '👁️' : '🙈';
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Show loading spinner
        loginButton.innerHTML = '<span class="button-text">Logging in...</span><div class="spinner"></div>';
        loginButton.disabled = true;
        errorMessage.textContent = '';

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
            // Use a more specific message if available from the API response
            errorMessage.textContent = error.message || 'Login failed. Please try again.';
            console.error('Login error:', error);
        } finally {
            // Restore button
            loginButton.innerHTML = '<span class="button-text">Login</span>';
            loginButton.disabled = false;
        }
    });
});
