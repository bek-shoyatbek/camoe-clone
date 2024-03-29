export interface JwtPayload {
  userId: string;
  role: 'user' | 'celebrity';
}
