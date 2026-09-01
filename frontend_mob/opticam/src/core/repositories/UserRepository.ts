// src/core/repositories/UserRepository.ts
import { StorageRepository } from './StorageRepository';
import { UserModel } from '../models/UserModel';

export class UserRepository extends StorageRepository {
  private readonly USER_KEY = 'user';

  async getUser(): Promise<UserModel | null> {
    try {
      const userData = await this.getItem<any>(this.USER_KEY);
      if (!userData) return null;
      if (typeof UserModel?.fromJSON === 'function') {
        return UserModel.fromJSON(userData);
      }
      console.error(' UserModel.fromJSON no es una función');
      return null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  }

  async saveUser(user: UserModel | any): Promise<void> {
    try {
      const userToSave = user instanceof UserModel ? user : UserModel.fromJSON(user);
      await this.saveItem(this.USER_KEY, userToSave);
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  }

  async removeUser(): Promise<void> {
    await this.removeItem(this.USER_KEY);
  }

  async getCurrentUser(): Promise<UserModel | null> {
    return this.getUser();
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    const user = await this.getUser();
    return !!(token && user);
  }

  async clearSession(): Promise<void> {
    await this.removeToken();
    await this.removeUser();
  }
}