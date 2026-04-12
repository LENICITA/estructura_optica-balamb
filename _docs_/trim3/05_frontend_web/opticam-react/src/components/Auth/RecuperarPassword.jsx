import React, { useState } from 'react';

function RecuperarPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!email) {
      setError('❌ Ingresa tu correo electrónico');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const nuevaPassword = Math.random().toString(36).slice(-8);
      setMessage(`✅ ¡Contraseña restablecida con éxito! Nueva contraseña: ${nuevaPassword}`);
      setEmail('');
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', padding: '1rem' }}>
      <div style={{ maxWidth: '28rem', width: '100%', backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#B90F0F', color: 'white', textAlign: 'center', padding: '1.5rem' }}>
          <i className="fa-solid fa-lock" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></i>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Restablecer contraseña</h2>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <p style={{ color: '#6b7280', textAlign: 'center', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Ingresa tu correo electrónico y te enviaremos las instrucciones para una nueva contraseña.
          </p>
          
          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}
          
          {message && (
            <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', whiteSpace: 'pre-line' }}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#374151', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email</label>
              <input 
                type="email" 
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.75rem', outline: 'none' }}
                placeholder="Ingrese su email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              style={{ width: '100%', backgroundColor: '#B90F0F', color: 'white', padding: '0.75rem', borderRadius: '0.75rem', fontWeight: '600', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
              disabled={loading}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#8a0b0b'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#B90F0F'}
            >
              {loading ? 'Procesando...' : 'Continuar'}
            </button>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <a href="/login" style={{ color: '#B90F0F', fontSize: '0.875rem', textDecoration: 'none' }}>← Volver al inicio de sesión</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecuperarPassword;
