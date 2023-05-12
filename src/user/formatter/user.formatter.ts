import { User } from 'src/share/models/user.model';

export const UserFormatter = (item: any): Omit<User, 'hashedPassword'> => {
  const user = {
    userId: item.PK.S.slice(1),
    username: item.Username.S,
    profileImg: item.ProfileImage.S,
  };

  return user;
};
