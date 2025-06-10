function iniciarSesion() {
      const email = document.getElementById('email').value;
      if (!email) {
        alert('Por favor ingresá tu correo electrónico.');
      } else {
        alert('Inicio de sesión exitoso con: ' + email);
        // Aquí podrías redirigir o continuar con la lógica de autenticación
      }
    }