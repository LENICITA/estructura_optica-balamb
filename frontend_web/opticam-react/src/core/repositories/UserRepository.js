// src/core/repositories/UserRepository.js
import { StorageRepository } from './StorageRepository';
import { UserModel } from '../../shared/types/UserModel';

export class UserRepository extends StorageRepository {
  constructor() {
    super();
    this.USER_KEY = 'user';
  }

  async getUser() {
    try {
      const userData = await this.getItem(this.USER_KEY);
      if (!userData) return null;
      if (typeof UserModel?.fromJSON === 'function') {
        return UserModel.fromJSON(userData);
      }
      console.error('UserModel.fromJSON no es una función');
      return null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  }

  async saveUser(user) {
    try {
      const userToSave = user instanceof UserModel ? user : UserModel.fromJSON(user);
      await this.saveItem(this.USER_KEY, userToSave);
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  }

  async removeUser() {
    await this.removeItem(this.USER_KEY);
  }

  async getCurrentUser() {
    return this.getUser();
  }

  async isAuthenticated() {
    const token = await this.getToken();
    const user = await this.getUser();
    return !!(token && user);
  }

  async clearSession() {
    await this.removeToken();
    await this.removeUser();
  }
}