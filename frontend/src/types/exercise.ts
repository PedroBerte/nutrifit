export interface ExerciseStep {
  id: string;
  name: string;
  order: number;
  durationSeconds?: number;
  notes?: string;
}

export interface CreateExerciseStepRequest {
  name: string;
  order: number;
  durationSeconds?: number;
  notes?: string;
}

export interface ReplaceExerciseStepsRequest {
  steps: CreateExerciseStepRequest[];
}

export interface ExerciseType {
  id: string;
  name: string;
  imageUrl?: string;
  instruction?: string;
  videoUrl?: string;
  categoryName?: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  createdByUserId?: string;
  isPublished?: boolean;
  isCustom?: boolean;
  exerciseType?: string;
  status?: string;
  isPendingReview?: boolean;
  steps?: ExerciseStep[];
}

export interface ExerciseCategory {
  id: string;
  name: string;
}

export interface MuscleGroup {
  id: string;
  name: string;
  muscles?: Muscle[];
}

export interface Muscle {
  id: string;
  name: string;
  muscleGroupName: string;
}

export interface CreateExerciseRequest {
  categoryId: string;
  name: string;
  instruction?: string;
  imageUrl?: string;
  videoUrl?: string;
  isPublished?: boolean;
  exerciseType?: string;
  primaryMuscleIds: string[];
  secondaryMuscleIds: string[];
}

export interface UpdateExerciseRequest extends CreateExerciseRequest {}
