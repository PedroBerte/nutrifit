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

export interface CompleteWorkoutRequest {
  notes?: string;
}

export interface CreateWorkoutFeedbackRequest {
  value?: number;
  description?: string;
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
  workoutFeedbackId?: string;
  workoutFeedback?: WorkoutFeedbackType;
  workoutSets?: WorkoutSetType[];
}

export interface WorkoutFeedbackType {
  id: string;
  value?: number;
  description?: string;
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

export interface UpdateWorkoutSetRequest {
  maxSets?: number;
  order?: number;
  field?: string;
  description?: string;
  expectedSets?: number;
}

export interface WorkoutSetType {
  id: string;
  workoutId: string;
  exerciseId: string;
  maxSets: number;
  order: number;
  field?: string;
  description?: string;
  expectedSets?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
  exercise?: {
    id: string;
    name: string;
    description?: string;
  };
  workoutExercises?: WorkoutExerciseType[];
}

export interface CreateWorkoutExerciseRequest {
  load?: number;
  expectedRepetitions?: number;
}

export interface UpdateWorkoutExerciseRequest {
  load?: number;
  expectedRepetitions?: number;
}

export interface WorkoutExerciseType {
  id: string;
  workoutSetId: string;
  load?: number;
  expectedRepetitions?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}
