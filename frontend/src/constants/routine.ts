// Códigos de Objetivo
export const ROUTINE_GOAL = {
  HYPERTROPHY: "HYP",
  WEIGHT_LOSS: "WLS",
  DEFINITION: "DEF",
  CONDITIONING: "CON",
  STRENGTH: "STR",
  ENDURANCE: "END",
} as const;

export type RoutineGoalCode = (typeof ROUTINE_GOAL)[keyof typeof ROUTINE_GOAL];

// Códigos de Dificuldade
export const ROUTINE_DIFFICULTY = {
  BEGINNER: "BEG",
  INTERMEDIATE: "INT",
  ADVANCED: "ADV",
} as const;

export type RoutineDifficultyCode =
  (typeof ROUTINE_DIFFICULTY)[keyof typeof ROUTINE_DIFFICULTY];

// Labels de Objetivo
export const ROUTINE_GOAL_LABELS: Record<RoutineGoalCode, string> = {
  [ROUTINE_GOAL.HYPERTROPHY]: "Hipertrofia",
  [ROUTINE_GOAL.WEIGHT_LOSS]: "Emagrecimento",
  [ROUTINE_GOAL.DEFINITION]: "Definição",
  [ROUTINE_GOAL.CONDITIONING]: "Condicionamento",
  [ROUTINE_GOAL.STRENGTH]: "Força",
  [ROUTINE_GOAL.ENDURANCE]: "Resistência",
};

// Labels de Dificuldade
export const ROUTINE_DIFFICULTY_LABELS: Record<RoutineDifficultyCode, string> =
  {
    [ROUTINE_DIFFICULTY.BEGINNER]: "Iniciante",
    [ROUTINE_DIFFICULTY.INTERMEDIATE]: "Intermediário",
    [ROUTINE_DIFFICULTY.ADVANCED]: "Avançado",
  };

// Opções para Select de Objetivo
export const GOAL_OPTIONS = Object.entries(ROUTINE_GOAL_LABELS).map(
  ([code, label]) => ({
    value: code,
    label,
  })
);

// Opções para Select de Dificuldade
export const DIFFICULTY_OPTIONS = Object.entries(ROUTINE_DIFFICULTY_LABELS).map(
  ([code, label]) => ({
    value: code,
    label,
  })
);

// Funções helper
export function getGoalLabel(code?: string | null): string {
  if (!code) return "";
  return ROUTINE_GOAL_LABELS[code as RoutineGoalCode] || code;
}

export function getDifficultyLabel(code?: string | null): string {
  if (!code) return "";
  return ROUTINE_DIFFICULTY_LABELS[code as RoutineDifficultyCode] || code;
}
