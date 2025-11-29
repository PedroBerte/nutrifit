export interface ExerciseType {
  id: string;
  name: string;
  url?: string;
  instruction?: string;
  videoUrl?: string;
  categoryName?: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  createdByUserId?: string;
  isPublished?: boolean;
  isCustom?: boolean;
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
  videoUrl?: string;
  isPublished?: boolean;
  primaryMuscleIds: string[];
  secondaryMuscleIds: string[];
}

export interface UpdateExerciseRequest extends CreateExerciseRequest {}
