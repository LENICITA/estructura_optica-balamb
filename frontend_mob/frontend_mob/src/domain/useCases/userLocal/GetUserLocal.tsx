import { UserLocalRepositoryImp } from '../../../data/repositories/UserLocalRepository';

const { getUser } = new UserLocalRepositoryImp();

export const GetUserLocalUseCase = async() => {
  return await getUser();
}