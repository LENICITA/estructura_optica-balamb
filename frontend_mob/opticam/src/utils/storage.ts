// src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Guardar token
export const saveToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (error) {
    console.error('Error al guardar token:', error);
  }
};

// Obtener token
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Error al obtener token:', error);
    return null;
  }
};

// Eliminar token (logout)
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
  } catch (error) {
    console.error('Error al eliminar token:', error);
  }
};

// Guardar datos del usuario
export const saveUser = async (user: any) => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Error al guardar usuario:', error);
  }
};

// Obtener datos del usuario
export const getUser = async (): Promise<any | null> => {
  try {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
};

// Eliminar datos del usuario (logout)
export const removeUser = async () => {
  try {
    await AsyncStorage.removeItem('user');
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
  }
};