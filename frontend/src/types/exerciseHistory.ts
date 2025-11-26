export interface ExerciseHistoryType {
  exerciseId: string;
  exerciseName: string;
  imageUrl?: string;
  stats: ExerciseStats;
  sessions: ExerciseSessionHistoryItem[];
}

export interface ExerciseStats {
  totalSessions: number;
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  maxLoad: number;
  averageLoad: number;
  lastPerformed?: string;
  firstPerformed?: string;
}

export interface ExerciseSessionHistoryItem {
  sessionId: string;
  performedAt: string;
  workoutTemplateTitle: string;
  sets: SetHistoryItem[];
  sessionVolume: number;
  maxLoad: number;
  averageLoad: number;
  totalReps: number;
}

export interface SetHistoryItem {
  setNumber: number;
  load?: number;
  reps?: number;
  volume: number;
}
