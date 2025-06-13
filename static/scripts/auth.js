// Archivo: static/scripts/auth.js

class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordValidation();
        this.setupFormValidation();
        this.hideNotification();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        const registerPassword = document.getElementById('registerPassword');
        const confirmPassword = document.getElementById('confirmPassword');

        if (registerPassword) {
            registerPassword.addEventListener('input', () => this.validatePassword());
        }

        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => this.validatePasswordMatch());
        }

        const registerEmail = document.getElementById('registerEmail');
        const username = document.getElementById('username');

        if (registerEmail) {
            registerEmail.addEventListener('blur', () => this.validateEmail());
        }

        if (username) {
            username.addEventListener('blur', () => this.validateUsername());
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showNotification('Por favor completa todos los campos', 'error');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.showNotification('¡Inicio de sesión exitoso!', 'success');
                sessionStorage.setItem('user', JSON.stringify(data.user));
                setTimeout(() => {
                    window.location.href = '/feed';
                }, 1500);
            } else {
                this.showNotification(data.error || 'Error al iniciar sesión', 'error');
                this.clearLoginErrors();
                
                if (data.error.includes('Email') || data.error.includes('contraseña')) {
                    document.getElementById('loginEmailError').textContent = 'Email o contraseña incorrectos';
                    document.getElementById('loginPasswordError').textContent = 'Email o contraseña incorrectos';
                }
            }
        } catch (error) {
            this.showNotification('Error de conexión. Intenta nuevamente.', 'error');
            console.error('Error en login:', error);
        } finally {
            this.showLoading(false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();

        if (!this.validateRegisterForm()) return;

        const formData = new FormData(e.target);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            username: formData.get('username'),
            password: formData.get('password'),
            skills: formData.get('skills')
        };

        this.showLoading(true);

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showNotification('¡Cuenta creada exitosamente!', 'success');
                sessionStorage.setItem('user', JSON.stringify(data.user));
                setTimeout(() => {
                    window.location.href = '/feed';
                }, 1500);
            } else {
                this.showNotification(data.error || 'Error al crear la cuenta', 'error');
                this.handleRegisterErrors(data.error);
            }
        } catch (error) {
            this.showNotification('Error de conexión. Intenta nuevamente.', 'error');
            console.error('Error en registro:', error);
        } finally {
            this.showLoading(false);
        }
    }

    validateRegisterForm() {
        let isValid = true;
        this.clearRegisterErrors();

        const firstName = document.getElementById('firstName').value.trim();
        if (!firstName) {
            document.getElementById('firstNameError').textContent = 'El nombre es requerido';
            isValid = false;
        }

        const lastName = document.getElementById('lastName').value.trim();
        if (!lastName) {
            document.getElementById('lastNameError').textContent = 'El apellido es requerido';
            isValid = false;
        }

        const email = document.getElementById('registerEmail').value.trim();
        if (!email) {
            document.getElementById('registerEmailError').textContent = 'El email es requerido';
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            document.getElementById('registerEmailError').textContent = 'El email no es válido';
            isValid = false;
        }

        const username = document.getElementById('username').value.trim();
        if (!username) {
            document.getElementById('usernameError').textContent = 'El nombre de usuario es requerido';
            isValid = false;
        } else if (username.length < 3) {
            document.getElementById('usernameError').textContent = 'Debe tener al menos 3 caracteres';
            isValid = false;
        }

        const password = document.getElementById('registerPassword').value;
        if (!password) {
            document.getElementById('registerPasswordError').textContent = 'La contraseña es requerida';
            isValid = false;
        } else if (password.length < 6) {
            document.getElementById('registerPasswordError').textContent = 'La contraseña debe tener al menos 6 caracteres';
            this.showNotification('La contraseña debe tener al menos 6 caracteres.', 'error');
            isValid = false;
        }

        const confirmPassword = document.getElementById('confirmPassword').value;
        if (!confirmPassword) {
            document.getElementById('confirmPasswordError').textContent = 'Confirma tu contraseña';
            isValid = false;
        } else if (password !== confirmPassword) {
            document.getElementById('confirmPasswordError').textContent = 'Las contraseñas no coinciden';
            this.showNotification('Las contraseñas ingresadas no coinciden.', 'error');
            isValid = false;
        }

        const acceptTerms = document.getElementById('acceptTerms').checked;
        if (!acceptTerms) {
            this.showNotification('Debes aceptar los términos y condiciones', 'error');
            isValid = false;
        }

        return isValid;
    }

    validatePassword() {
        const password = document.getElementById('registerPassword').value;
        const strengthIndicator = document.getElementById('passwordStrength');
        if (!strengthIndicator) return;

        let strength = 0;
        let strengthText = '';
        let strengthClass = '';

        if (password.length >= 6) strength++;
        if (password.match(/[a-z]/)) strength++;
        if (password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;

        switch (strength) {
            case 0:
            case 1:
                strengthText = 'Muy débil'; strengthClass = 'very-weak'; break;
            case 2:
                strengthText = 'Débil'; strengthClass = 'weak'; break;
            case 3:
                strengthText = 'Regular'; strengthClass = 'regular'; break;
            case 4:
                strengthText = 'Fuerte'; strengthClass = 'strong'; break;
            case 5:
                strengthText = 'Muy fuerte'; strengthClass = 'very-strong'; break;
        }

        strengthIndicator.innerHTML = `
            <div class="password-strength-bar ${strengthClass}">
                <div class="strength-fill"></div>
            </div>
            <span class="strength-text">${strengthText}</span>
        `;
    }

    validatePasswordMatch() {
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorElement = document.getElementById('confirmPasswordError');

        if (confirmPassword && password !== confirmPassword) {
            errorElement.textContent = 'Las contraseñas no coinciden';
        } else {
            errorElement.textContent = '';
        }
    }

    validateEmail() {
        const email = document.getElementById('registerEmail').value.trim();
        const errorElement = document.getElementById('registerEmailError');
        errorElement.textContent = (!this.isValidEmail(email)) ? 'El formato del email no es válido' : '';
    }

    validateUsername() {
        const username = document.getElementById('username').value.trim();
        const errorElement = document.getElementById('usernameError');

        if (username && username.length < 3) {
            errorElement.textContent = 'Debe tener al menos 3 caracteres';
        } else if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
            errorElement.textContent = 'Solo letras, números y guiones bajos';
        } else {
            errorElement.textContent = '';
        }
    }

    setupPasswordValidation() {
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            input.addEventListener('input', () => {
                if (input.id === 'registerPassword') this.validatePassword();
                if (input.id === 'confirmPassword') this.validatePasswordMatch();
            });
        });
    }

    setupFormValidation() {
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateInput(input));
            input.addEventListener('input', () => this.clearInputError(input));
        });
    }

    validateInput(input) {
        const value = input.value.trim();
        const errorElement = document.getElementById(input.id + 'Error');
        if (!errorElement) return;

        if (input.hasAttribute('required') && !value) {
            errorElement.textContent = 'Este campo es requerido';
        } else if (input.type === 'email' && value && !this.isValidEmail(value)) {
            errorElement.textContent = 'Email inválido';
        } else {
            errorElement.textContent = '';
        }
    }

    clearInputError(input) {
        const errorElement = document.getElementById(input.id + 'Error');
        if (errorElement && input.value.trim()) {
            errorElement.textContent = '';
        }
    }

    handleRegisterErrors(error) {
        this.clearRegisterErrors();
        if (error.includes('email') && error.includes('registrado')) {
            document.getElementById('registerEmailError').textContent = 'Este email ya está registrado';
        } else if (error.includes('usuario') && error.includes('uso')) {
            document.getElementById('usernameError').textContent = 'Este nombre de usuario ya está en uso';
        }
    }

    clearLoginErrors() {
        ['loginEmailError', 'loginPasswordError'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '';
        });
    }

    clearRegisterErrors() {
        [
            'firstNameError', 'lastNameError', 'registerEmailError',
            'usernameError', 'registerPasswordError', 'confirmPasswordError'
        ].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '';
        });
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = show ? 'flex' : 'none';
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (!notification) return;

        const messageEl = notification.querySelector('.notification-message');
        const iconEl = notification.querySelector('.notification-icon');

        messageEl.textContent = message;
        iconEl.textContent = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }[type] || 'ℹ️';
        notification.className = `notification ${type}`;
        notification.style.display = 'flex';

        setTimeout(() => this.hideNotification(), 5000);
    }

    hideNotification() {
        const notification = document.getElementById('notification');
        if (notification) notification.style.display = 'none';
    }
}

function showLogin() {
    document.getElementById('login-form').classList.add('active');
    document.getElementById('register-form').classList.remove('active');
}

function showRegister() {
    document.getElementById('register-form').classList.add('active');
    document.getElementById('login-form').classList.remove('active');
}

window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'register') {
        showRegister();
    } else {
        showLogin();
    }
});

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentElement.querySelector('.password-toggle-icon');
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '🙈';
    } else {
        input.type = 'password';
        icon.textContent = '👁️';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
<<<<<<< HEAD
=======

const revealElements = document.querySelectorAll('.feature-card, .testimonial-card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      entry.target.style.transition = 'all 0.6s ease';
    }
  });
}, { threshold: 0.1 });

revealElements.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  observer.observe(el);
});
>>>>>>> 1cf77825cf5b286f786019df67d531ea529e2590
