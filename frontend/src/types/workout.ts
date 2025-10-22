export interface CreateWorkoutRequest {
  title: string;
  description?: string;
  expectedDuration?: number;
}

export interface UpdateWorkoutRequest {
  title?: string;
  description?: string;
  expectedDuration?: number;
  status?: string;
  totalVolume?: number;
}

export interface WorkoutType {
  id: string;
  routineId: string;
  title: string;
  description?: string;
  expectedDuration?: number;
  status: string;
  totalVolume?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateWorkoutSetRequest {
  exerciseId: string;
  maxSets: number;
  order: number;
  field?: string;
  description?: string;
  expectedSets?: number;
}

export interface WorkoutSetType {
  id: string;
  workoutId: string;
  exerciseId: string;
  exerciseName: string;
  maxSets: number;
  order: number;
  field?: string;
  description?: string;
  expectedSets?: number;
}
