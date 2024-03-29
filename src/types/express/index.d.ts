import { JwtPayload } from 'src/interfaces/jwt-payload.interface';

declare global {
  namespace Express {
    export interface Request {
      user: JwtPayload;
    }
  }
}
