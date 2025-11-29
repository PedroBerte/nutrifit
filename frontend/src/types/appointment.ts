export interface AppointmentType {
  id: string;
  customerProfessionalBondId: string;
  scheduledAt: string;
  type: "PR" | "ON"; // PR = Presencial, ON = Online
  addressId?: string;
  createdAt: string;
  updatedAt?: string;
  status: "P" | "A" | "R" | "C"; // P = Pendente, A = Aceito, R = Rejeitado, C = Cancelado
  address?: {
    id: string;
    addressLine: string;
    number?: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
    addressType: number;
  };
  customerProfessionalBond?: {
    id: string;
    customerId: string;
    professionalId: string;
    professional?: {
      id: string;
      name: string;
      email: string;
      imageUrl?: string;
    };
    customer?: {
      id: string;
      name: string;
      email: string;
      imageUrl?: string;
    };
  };
}

export interface CreateAppointmentRequest {
  customerProfessionalBondId: string;
  scheduledAt: string;
  type: "PR" | "ON";
  address?: {
    zipCode: string;
    addressLine: string;
    number: string;
    city: string;
    state: string;
    country?: string;
    type?: string;
  };
}

export interface UpdateAppointmentRequest {
  status: string;
  scheduledAt?: string;
}
