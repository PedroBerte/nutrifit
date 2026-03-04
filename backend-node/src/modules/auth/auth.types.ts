export interface AuthClaims {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  profile: string;
}

export interface AuthenticatedRequestUser extends AuthClaims {
  iat?: number;
  exp?: number;
}
