import { User } from 'src/share/models/user.model';

export const UserFormatter = (item: any): User => {
  const user: User = {
    userId: item.PK.S.slice(1),
    username: item.Username.S,
    profileImg: item.ProfileImage.S,
    hashedPassword: item.HashedPassword.S,
  };

  return user;
};
