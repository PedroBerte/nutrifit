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

export interface CustomerProfessionalBondType {
  id: string | null;
  customerId: string | null;
  professionalId: string | null;
  senderId: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  status: string;
  customer: UserType | null;
  professional: UserType | null;
  sender: UserType | null;
  appointments: AppointmentType[] | null;
}

export interface AppointmentType {
  id: string | null;
  customerProfessionalBondId: string;
  date: string;
  type: number;
  location: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  status: string | null;
}
