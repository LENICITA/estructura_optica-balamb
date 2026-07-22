import { useEffect, useState } from 'react';
import { User } from '../../domain/entities/User';
import { GetUserLocalUseCase } from '../../domain/useCases/userLocal/GetUserLocal';

export const useUserLocal = () => {

  const [user, setUser] = useState<User>()
  useEffect(() => {
    getUserSession();
  }, []);

  const getUserSession = async () => {
    const user = await GetUserLocalUseCase();
    setUser(user);
  };

  return {
    user,
    getUserSession
  }
}