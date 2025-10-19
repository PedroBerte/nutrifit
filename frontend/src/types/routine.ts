export interface CreateRoutineRequest {
  title: string;
  goal?: string;
  weeks?: number;
  difficulty?: string;
}

export interface UpdateRoutineRequest {
  title?: string;
  goal?: string;
  weeks?: number;
  difficulty?: string;
  status?: string;
}

export interface AssignRoutineRequest {
  routineId: string;
  customerId: string;
}

export interface RoutineType {
  id: string;
  title: string;
  goal?: string;
  weeks?: number;
  difficulty?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  personalId: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
