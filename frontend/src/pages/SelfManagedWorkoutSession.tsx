import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useFinishSelfManagedWorkoutSession,
  useGetSelfManagedWorkoutSession,
} from "@/services/api/selfManagedWorkout";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

interface ExerciseCompletionForm {
  name: string;
  completedSets: string;
  completedReps: string;
}

export default function SelfManagedWorkoutSession() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const { data: session, isLoading } = useGetSelfManagedWorkoutSession(sessionId);
  const finishSession = useFinishSelfManagedWorkoutSession();

  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<ExerciseCompletionForm[]>([]);

  useEffect(() => {
    if (!session) return;

    setNotes(session.notes ?? "");
    setExercises(
      session.exercises.map((exercise) => ({
        name: exercise.name,
        completedSets: String(exercise.completedSets || exercise.plannedSets || 0),
        completedReps: String(exercise.completedReps || exercise.plannedReps || 0),
      }))
    );
  }, [session]);

  const isFinished = session?.status === "finished";

  const totalExercises = useMemo(() => exercises.length, [exercises.length]);

  function updateExercise(index: number, key: "completedSets" | "completedReps", value: string) {
    setExercises((prev) =>
      prev.map((exercise, currentIndex) =>
        currentIndex === index ? { ...exercise, [key]: value } : exercise
      )
    );
  }

  async function handleFinishSession() {
    if (!sessionId || !session) return;

    const payloadExercises = exercises.map((exercise) => ({
      name: exercise.name,
      completedSets: Number(exercise.completedSets),
      completedReps: Number(exercise.completedReps),
    }));

    if (
      payloadExercises.some(
        (exercise) =>
          Number.isNaN(exercise.completedSets) ||
          Number.isNaN(exercise.completedReps) ||
          exercise.completedSets < 0 ||
          exercise.completedReps < 0
      )
    ) {
      toast.error("Preencha séries e repetições com números válidos.");
      return;
    }

    try {
      await finishSession.mutateAsync({
        sessionId,
        payload: {
          notes: notes.trim() || undefined,
          exercises: payloadExercises,
        },
      });

      toast.success("Sessão concluída com sucesso!");
      navigate("/workout");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível concluir a sessão.";
      toast.error(errorMessage);
    }
  }

  if (isLoading) {
    return (
      <div className="py-6 text-sm text-muted-foreground">Carregando sessão...</div>
    );
  }

  if (!session) {
    return (
      <div className="py-6 space-y-3">
        <p className="text-sm text-muted-foreground">Sessão não encontrada.</p>
        <Button variant="outline" onClick={() => navigate("/workout")}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Sessão Auto Gerida</h1>
        <p className="text-sm text-muted-foreground mt-1">{session.titleSnapshot}</p>
      </div>

      <div className="bg-neutral-dark-03 rounded-sm p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-white-02">Exercícios: {totalExercises}</p>
          <p className="text-xs text-muted-foreground">
            Status: {isFinished ? "Concluída" : "Em andamento"}
          </p>
        </div>

        <div className="space-y-3">
          {exercises.map((exercise, index) => {
            const planned = session.exercises[index];

            return (
              <div key={`${exercise.name}-${index}`} className="border border-neutral-dark-02 rounded-sm p-3 space-y-2">
                <div>
                  <p className="font-semibold text-sm">{exercise.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Planejado: {planned?.plannedSets ?? 0}x{planned?.plannedReps ?? 0}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Séries feitas</Label>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      value={exercise.completedSets}
                      onChange={(event) => updateExercise(index, "completedSets", event.target.value)}
                      disabled={isFinished}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Reps feitas</Label>
                    <Input
                      type="number"
                      min={0}
                      max={200}
                      value={exercise.completedReps}
                      onChange={(event) => updateExercise(index, "completedReps", event.target.value)}
                      disabled={isFinished}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <Label>Observações da sessão</Label>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={500}
            placeholder="Como foi seu treino hoje?"
            disabled={isFinished}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => navigate("/workout")}>Voltar</Button>
          {!isFinished && (
            <Button
              className="flex-1"
              onClick={handleFinishSession}
              disabled={finishSession.isPending}
            >
              {finishSession.isPending ? "Concluindo..." : "Concluir sessão"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
