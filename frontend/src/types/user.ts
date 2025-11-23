import type {
  CustomerProfessionalBondType,
  ProfessionalCredentialType,
  ProfessionalDetailsType,
} from "./professional";
import type { ProfileType } from "./profile";

export const UserProfiles = {
  STUDENT: "ff35132f-d761-40e6-9e05-f5ed30c0063d",
  PERSONAL: "ad07405b-cdf2-4780-8a0e-69323be32a6c",
  NUTRITIONIST: "eff474b5-ce49-42d5-84da-d9c904b721a1",
} as const;

export type UserProfiles = (typeof UserProfiles)[keyof typeof UserProfiles];

export interface UserType {
  id?: string | null;
  addressId?: string | null;
  profileId?: string | null;
  name: string;
  email: string;
  imageUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  status?: string | null;
  isAdmin?: boolean | null;
  dateOfBirth?: string | null;
  sex?: "male" | "female" | "other" | null;
  phoneNumber?: string | null;
  address?: AddressType | null;
  profile?: ProfileType | null;
  professionalCredential?: ProfessionalCredentialType | null;
  professionalDetails?: ProfessionalDetailsType | null;
  averageRating?: number | null;
  totalFeedbacks?: number | null;
}

export interface AddressType {
  id?: string | null;
  addressLine: string;
  number?: string | null;
  city: string;
  state?: string | null;
  zipCode?: string | null;
  country: string;
  addressType: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  status?: string | null;
}
