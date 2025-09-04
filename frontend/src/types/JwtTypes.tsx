export type JwtType = {
  sub?: string;
  email?: string;
  name?: string;
  iat?: number;
  exp?: number;
  roles?: string[];
  tenantId?: string;
};
