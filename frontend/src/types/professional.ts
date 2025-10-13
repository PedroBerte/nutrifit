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
  id: string;
  customerId: string;
  professionalId: string;
  senderId: string;
  createdAt?: string;
  updatedAt?: string;
  status: string;
  customer: UserType;
  professional: UserType;
  sender: UserType;
  appointments: AppointmentType[];
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
