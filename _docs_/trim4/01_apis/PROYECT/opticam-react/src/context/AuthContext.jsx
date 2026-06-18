import React, { createContext, useState, useContext, useEffect } from 'react';
import { hashSHA256 } from '../utils/encryption';

const AuthContext = createContext();
const API_URL = 'http://localhost:3001';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('1. Intentando login con:', email);
      const hashedPassword = await hashSHA256(password);
      console.log('2. Contraseña hasheada:', hashedPassword);
      
      const response = await fetch(`${API_URL}/usuarios?email=${email}&password=${hashedPassword}`);
      const users = await response.json();
      console.log('3. Usuarios encontrados:', users);
      
      if (users.length === 1) {
        const userData = users[0];
        console.log('4. Usuario encontrado:', userData);
        
        // Obtener el rol del usuario desde roles_usuarios
        let rol = 'cliente';
        try {
          const rolesResponse = await fetch(`${API_URL}/roles_usuarios?id_usuario=${userData.id}`);
          const userRoles = await rolesResponse.json();
          console.log('5. Roles del usuario:', userRoles);
          
          if (userRoles.length > 0) {
            const rolResponse = await fetch(`${API_URL}/roles/${userRoles[0].id_rol}`);
            const rolData = await rolResponse.json();
            rol = rolData.name.toLowerCase();
            console.log('6. Rol asignado:', rol);
          }
        } catch (rolError) {
          console.warn('Error obteniendo rol:', rolError);
        }
        
        // Forzar admin por email (por si acaso)
        if (email === 'admin@gmail.com') {
          rol = 'admin';
          console.log('7. Rol forzado a admin por email');
        }
        
        const userWithRole = { 
          id: userData.id, 
          name: userData.name, 
          email: userData.email, 
          rol: rol,
          telefono: userData.telefono,
          direccion: userData.direccion
        };
        
        const token = btoa(JSON.stringify({ 
          userId: userData.id, 
          email, 
          rol, 
          exp: Date.now() + 86400000 
        }));
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userWithRole));
        setUser(userWithRole);
        
        console.log('8. Login exitoso - Usuario:', userWithRole);
        return { success: true, user: userWithRole, rol };
      }
      
      console.log('9. No se encontraron usuarios con esas credenciales');
      return { success: false, message: 'Correo o contraseña incorrectos' };
    } catch (error) {
      console.error('10. Error en login:', error);
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Registrando usuario:', userData.email);
      
      // Verificar si el email ya existe
      const checkResponse = await fetch(`${API_URL}/usuarios?email=${userData.email}`);
      const existing = await checkResponse.json();
      if (existing.length > 0) {
        return { success: false, message: 'El email ya está registrado' };
      }
      
      // Encriptar contraseña
      const hashedPassword = await hashSHA256(userData.password);
      
      // Crear nuevo usuario
      const newUser = {
        name: userData.name,
        email: userData.email,
        telefono: userData.telefono || '',
        fecha_nacimiento: userData.fechaNacimiento || '',
        documento: userData.documento || '',
        ciudad: userData.ciudad || '',
        direccion: userData.direccion || '',
        fecha_registro: new Date().toISOString(),
        password: hashedPassword,
        estado: 'activo'
      };
      
      const response = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      
      if (!response.ok) {
        throw new Error('Error al crear usuario');
      }
      
      const createdUser = await response.json();
      
      // Asignar rol de cliente (id_rol = 2)
      await fetch(`${API_URL}/roles_usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_rol: 2, id_usuario: createdUser.id })
      });
      
      console.log('Usuario registrado exitosamente:', createdUser);
      return { success: true, message: 'Usuario registrado exitosamente' };
    } catch (error) {
      console.error('Error en register:', error);
      return { success: false, message: 'Error al registrar usuario' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    console.log('Sesión cerrada');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};