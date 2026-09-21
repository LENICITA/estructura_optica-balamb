// src/core/repositories/StorageRepository.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageRepository {
  async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  }

  async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('token', token);
        } catch (error) {
          console.error('Error al guardar token:', error);
        }
      }

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('token');
    } catch (error) {
      console.error('Error al eliminar token:', error);
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error al obtener ${key}:`, error);
      return null;
    }
  }

  async saveItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error al guardar ${key}:`, error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error al eliminar ${key}:`, error);
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error al limpiar storage:', error);
    }
  }

private static instance: StorageRepository;

  public static getInstance(): StorageRepository {
    if (!StorageRepository.instance) {
      StorageRepository.instance = new StorageRepository();
    }
    return StorageRepository.instance;
  }
}
