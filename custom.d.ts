import { User } from 'src/share/models/user.model';

declare module 'express-serve-static-core' {
  interface Request {
    user?: Omit<User, 'hashedPassword'>;
  }
}
