export interface ExerciseType {
  id: string;
  name: string;
  url?: string;
  instruction?: string;
  categoryName?: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
}
