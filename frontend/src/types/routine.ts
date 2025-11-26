export interface CreateRoutineRequest {
  title: string;
  goal?: string;
  difficulty?: string;
  weeks?: number;
}

export interface UpdateRoutineRequest {
  title?: string;
  goal?: string;
  difficulty?: string;
  status?: string;
}

export interface AssignRoutineRequest {
  routineId: string;
  customerId: string;
  expiresAt?: string; // ISO date string
}

export interface RoutineType {
  id: string;
  title: string;
  goal?: string;
  difficulty?: string;
  weeks?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  personalId: string;
}

export interface CustomerBasicInfo {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  assignedAt?: string;
  expiresAt?: string; // Data de vencimento da rotina para este aluno
}

export interface RoutineCustomersResponse {
  assignedCustomers: CustomerBasicInfo[];
  availableCustomers: CustomerBasicInfo[];
}

export interface RoutineExpiryType {
  customerId: string;
  customerName: string;
  customerImageUrl?: string;
  routineId: string;
  routineTitle: string;
  expiresAt: string; // ISO date string
  daysUntilExpiry: number;
}
