export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

export interface RequestUser {
  id: number;
  email: string;
  role: string;
}
