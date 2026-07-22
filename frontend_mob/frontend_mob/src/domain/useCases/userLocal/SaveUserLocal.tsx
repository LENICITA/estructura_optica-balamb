import { UserLocalRepositoryImp } from '../../../data/repositories/UserLocalRepository';
import { User } from '../../entities/User';

const { save } = new UserLocalRepositoryImp();

export const SaveUserUseCase = async(user: User) => {
  return await save(user);
}