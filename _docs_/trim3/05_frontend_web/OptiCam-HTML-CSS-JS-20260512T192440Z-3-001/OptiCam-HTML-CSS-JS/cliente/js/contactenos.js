// contacto.js - Manejo del formulario de contacto PQRS
(function() {
  // Esperar a que el DOM esté completamente cargado
  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pqrsForm');
    const feedback = document.getElementById('formFeedback');
    
    // Verificar que el formulario existe en la página
    if (!form) {
      console.warn('No se encontró el formulario con id "pqrsForm"');
      return;
    }
    
    // Manejar el envío del formulario
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Obtener valores de los campos
      const nombre = document.getElementById('nombre').value.trim();
      const email = document.getElementById('email').value.trim();
      const telefono = document.getElementById('telefono').value.trim();
      const mensaje = document.getElementById('mensaje').value.trim();
      
      // Validación básica
      if (!nombre || !email) {
        mostrarFeedback('❌ Por favor completa los campos obligatorios (Nombre y Email).', '#dc2626');
        return;
      }
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        mostrarFeedback('❌ Por favor ingresa un email válido.', '#dc2626');
        return;
      }
      
      // Aquí puedes agregar la lógica para enviar los datos a tu servidor
      // Ejemplo con fetch:
      /*
      fetch('/api/contacto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, email, telefono, mensaje })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          mostrarFeedback('✅ ¡Mensaje enviado! Te contactaremos pronto.', '#10b981');
          form.reset();
        } else {
          mostrarFeedback('❌ Error al enviar. Intenta nuevamente.', '#dc2626');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        mostrarFeedback('❌ Error de conexión. Intenta más tarde.', '#dc2626');
      });
      */
      
      // Simulación de envío exitoso (demo)
      mostrarFeedback('✅ ¡Mensaje enviado! Te contactaremos pronto.', '#10b981');
      form.reset();
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        if (feedback) {
          feedback.textContent = '';
        }
      }, 5000);
    });
    
    // Función auxiliar para mostrar mensajes de feedback
    function mostrarFeedback(mensaje, color) {
      if (feedback) {
        feedback.textContent = mensaje;
        feedback.style.color = color;
      }
    }
  });
})();