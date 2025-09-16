import type { UserType } from "./user";

export interface ProfessionalCredentialType {
  id: string | null;
  professionalId: string | null;
  status: string | null;
  type: string;
  credentialId: string;
  biography: string | null;
}

export interface ProfessionalType {
  user: UserType | null;
  credentials: ProfessionalCredentialType | null;
}
