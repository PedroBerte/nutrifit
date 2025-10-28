import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { useGetWorkoutById, useCompleteWorkout } from "@/services/api/workout";
import { Loader2, CheckCircle2, Dumbbell } from "lucide-react";
import { useState } from "react";

interface WorkoutDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutId: string;
}

export default function WorkoutDetailsDrawer({
  open,
  onOpenChange,
  workoutId,
}: WorkoutDetailsDrawerProps) {
  const { data: workoutResponse, isLoading } = useGetWorkoutById(
    open ? workoutId : null
  );
  const completeWorkoutMutation = useCompleteWorkout();
  const [notes, setNotes] = useState("");

  const workout = workoutResponse?.data;

  const handleComplete = async () => {
    try {
      await completeWorkoutMutation.mutateAsync({
        workoutId,
        data: { notes },
      });
      alert("✅ Treino completado com sucesso!");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao completar treino:", error);
      alert(
        `❌ ${error?.response?.data?.message || "Erro ao completar treino"}`
      );
    }
  };

  const isCompleted = !!workout?.completedAt;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle>{workout?.title || "Treino"}</SheetTitle>
          <SheetDescription>
            {workout?.description || "Detalhes do treino"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin" />
              <span className="ml-2">Carregando treino...</span>
            </div>
          )}

          {!isLoading && workout && (
            <>
              {isCompleted && (
                <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary rounded-lg">
                  <CheckCircle2 className="text-primary" size={20} />
                  <div>
                    <p className="font-semibold text-sm">Treino Completado</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(workout.completedAt!).toLocaleDateString(
                        "pt-BR",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Dumbbell size={18} />
                  Exercícios ({workout.workoutSets?.length || 0})
                </h3>

                {workout.workoutSets && workout.workoutSets.length > 0 ? (
                  workout.workoutSets.map((set, index) => (
                    <div
                      key={set.id}
                      className="p-3 bg-neutral-dark-02 rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">
                          {index + 1}. {set.exercise?.name || "Exercício"}
                        </p>
                        {set.completedAt && (
                          <CheckCircle2 size={16} className="text-primary" />
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>
                          <span className="font-medium">Séries:</span>{" "}
                          {set.maxSets}
                        </p>
                        {set.expectedSets && (
                          <p>
                            <span className="font-medium">
                              Repetições esperadas:
                            </span>{" "}
                            {set.expectedSets}
                          </p>
                        )}
                        {set.field && (
                          <p>
                            <span className="font-medium">Campo:</span>{" "}
                            {set.field}
                          </p>
                        )}
                        {set.description && (
                          <p>
                            <span className="font-medium">Observações:</span>{" "}
                            {set.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-center text-muted-foreground py-4">
                    Nenhum exercício cadastrado neste treino.
                  </p>
                )}
              </div>

              {!isCompleted && (
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium">
                    Observações (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Como foi o treino? Alguma dificuldade?"
                    className="w-full p-3 bg-neutral-dark-02 rounded-lg border border-neutral-dark-01 focus:border-primary outline-none resize-none"
                    rows={3}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <SheetFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {!isCompleted && workout && (
            <Button
              onClick={handleComplete}
              disabled={completeWorkoutMutation.isPending}
            >
              {completeWorkoutMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Completando...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} className="mr-2" />
                  Completar Treino
                </>
              )}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
