import { UserLocalRepositoryImp } from '../../../data/repositories/UserLocalRepository';

const { remove } = new UserLocalRepositoryImp();

export const RemoveUserLocalUseCase = async () => {
  return await remove();
}
