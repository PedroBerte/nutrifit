import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Dumbbell, ListOrdered, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetMyExercises } from "@/services/api/exercise";
import { CreateExerciseDrawer } from "@/components/exercise/CreateExerciseDrawer";
import { ExerciseStepsDrawer } from "@/components/exercise/ExerciseStepsDrawer";
import type { ExerciseType } from "@/types/exercise";

export default function MyExercises() {
  const { data, isLoading } = useGetMyExercises();
  const exercises: ExerciseType[] = data?.data ?? [];

  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<ExerciseType | null>(null);
  const [stepsDrawerExercise, setStepsDrawerExercise] = useState<ExerciseType | null>(null);

  const openEdit = (exercise: ExerciseType) => {
    setExerciseToEdit(exercise);
    setCreateDrawerOpen(true);
  };

  const openSteps = (exercise: ExerciseType) => {
    setStepsDrawerExercise(exercise);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pt-6 pb-24 space-y-4 max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meus exercícios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Exercícios personalizados criados por você
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setExerciseToEdit(null);
            setCreateDrawerOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : exercises.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Dumbbell className="h-12 w-12 text-muted-foreground/40" />
          <div>
            <p className="font-medium">Nenhum exercício ainda</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crie um exercício personalizado para começar
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setExerciseToEdit(null);
              setCreateDrawerOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar exercício
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="rounded-xl border bg-card p-4 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{exercise.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {exercise.categoryName}
                  {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
                    <> · {exercise.primaryMuscles.slice(0, 2).join(", ")}</>
                  )}
                </p>
                {exercise.steps && exercise.steps.length > 0 && (
                  <span className="inline-flex items-center gap-1 mt-1.5 text-xs text-primary">
                    <ListOrdered className="h-3 w-3" />
                    {exercise.steps.length} step{exercise.steps.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  title="Editar steps"
                  onClick={() => openSteps(exercise)}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  title="Editar exercício"
                  onClick={() => openEdit(exercise)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateExerciseDrawer
        open={createDrawerOpen}
        onOpenChange={setCreateDrawerOpen}
        exerciseToEdit={exerciseToEdit}
        onSuccess={() => {
          setCreateDrawerOpen(false);
          setExerciseToEdit(null);
        }}
      />

      <ExerciseStepsDrawer
        open={!!stepsDrawerExercise}
        onOpenChange={(open) => {
          if (!open) setStepsDrawerExercise(null);
        }}
        exercise={stepsDrawerExercise}
      />
    </motion.div>
  );
}
