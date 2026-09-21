// src/core/repositories/StorageRepository.js
export class StorageRepository {
  // ===== TOKEN =====

  async getToken() {
    try {
      const token = localStorage.getItem('token');
      return token;
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  }

  async saveToken(token) {
    try {
      localStorage.setItem('token', token);
    } catch (error) {
      console.error('Error al guardar token:', error);
    }
  }

  async removeToken() {
    try {
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Error al eliminar token:', error);
    }
  }

  // ===== ITEMS GENÉRICOS =====

  async getItem(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error al obtener ${key}:`, error);
      return null;
    }
  }

  async saveItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error al guardar ${key}:`, error);
    }
  }

  async removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error al eliminar ${key}:`, error);
    }
  }

  async clearAll() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error al limpiar storage:', error);
    }
  }

  // ===== SINGLETON =====

  static getInstance() {
    if (!StorageRepository.instance) {
      StorageRepository.instance = new StorageRepository();
    }
    return StorageRepository.instance;
  }
}