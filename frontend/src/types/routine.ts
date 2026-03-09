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
  videoUrl?: string;
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

export interface ImportedExercisePayload {
  exerciseName: string;
  exerciseType?: string;
  order: number;
  targetSets: number;
  targetRepsMin?: number | null;
  targetRepsMax?: number | null;
  suggestedLoad?: number | null;
  restSeconds?: number | null;
  setType: string;
  weightUnit: string;
  notes?: string | null;
  isBisetWithPrevious?: boolean;
}

export interface ImportedWorkoutPayload {
  title: string;
  description?: string | null;
  estimatedDurationMinutes?: number | null;
  order: number;
  exerciseTemplates: ImportedExercisePayload[];
}

export interface RoutineImportPayload {
  schemaVersion: string;
  exportedAt?: string;
  workouts: ImportedWorkoutPayload[];
}

export interface ImportRoutineRequest {
  payload: RoutineImportPayload;
  routineTitle?: string;
  goal?: string;
  difficulty?: string;
  weeks?: number;
  assignToUserIds?: string[];
  expiresAt?: string;
}

export interface PendingExerciseImport {
  exerciseId: string;
  exerciseName: string;
  workoutTitle: string;
  workoutOrder: number;
  exerciseOrder: number;
}

export interface ImportRoutineResult {
  routineId: string;
  routineTitle: string;
  importedWorkouts: number;
  importedExercises: number;
  assignedUsersCount: number;
  pendingExercises: PendingExerciseImport[];
}
