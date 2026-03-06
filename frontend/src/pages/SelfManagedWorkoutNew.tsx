import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateSelfManagedWorkout } from "@/services/api/selfManagedWorkout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

interface ExerciseFormItem {
  name: string;
  sets: string;
  reps: string;
}

export default function SelfManagedWorkoutNew() {
  const navigate = useNavigate();
  const createWorkout = useCreateSelfManagedWorkout();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<ExerciseFormItem[]>([
    { name: "", sets: "3", reps: "10" },
  ]);

  function updateExercise(index: number, key: keyof ExerciseFormItem, value: string) {
    setExercises((prev) =>
      prev.map((exercise, currentIndex) =>
        currentIndex === index ? { ...exercise, [key]: value } : exercise
      )
    );
  }

  function addExercise() {
    setExercises((prev) => [...prev, { name: "", sets: "3", reps: "10" }]);
  }

  function removeExercise(index: number) {
    setExercises((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (title.trim().length < 2) {
      toast.error("O título precisa ter pelo menos 2 caracteres.");
      return;
    }

    const normalizedExercises = exercises
      .map((exercise) => ({
        name: exercise.name.trim(),
        sets: Number(exercise.sets),
        reps: Number(exercise.reps),
      }))
      .filter((exercise) => exercise.name.length > 0);

    if (normalizedExercises.length === 0) {
      toast.error("Adicione pelo menos 1 exercício válido.");
      return;
    }

    if (
      normalizedExercises.some(
        (exercise) =>
          Number.isNaN(exercise.sets) ||
          Number.isNaN(exercise.reps) ||
          exercise.sets < 1 ||
          exercise.reps < 1
      )
    ) {
      toast.error("Séries e repetições devem ser números maiores que zero.");
      return;
    }

    try {
      await createWorkout.mutateAsync({
        title: title.trim(),
        notes: notes.trim() || undefined,
        exercises: normalizedExercises,
      });

      toast.success("Treino criado com sucesso!");
      navigate("/workout");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível criar o treino.";
      toast.error(errorMessage);
    }
  }

  return (
    <div className="py-4 space-y-4">
      <h1 className="text-2xl font-bold">Criar Treino Auto Gerido</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-neutral-dark-03 rounded-sm p-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex: Treino A - Superior"
            maxLength={120}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Observações (opcional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={500}
            placeholder="Anotações sobre o treino"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Exercícios</Label>
            <Button type="button" variant="outline" size="sm" onClick={addExercise}>
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>

          {exercises.map((exercise, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end border border-neutral-dark-02 rounded-sm p-3">
              <div className="col-span-12 md:col-span-6 space-y-1">
                <Label>Nome</Label>
                <Input
                  value={exercise.name}
                  onChange={(event) => updateExercise(index, "name", event.target.value)}
                  placeholder="Ex: Supino reto"
                />
              </div>

              <div className="col-span-5 md:col-span-2 space-y-1">
                <Label>Séries</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={exercise.sets}
                  onChange={(event) => updateExercise(index, "sets", event.target.value)}
                />
              </div>

              <div className="col-span-5 md:col-span-2 space-y-1">
                <Label>Reps</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={exercise.reps}
                  onChange={(event) => updateExercise(index, "reps", event.target.value)}
                />
              </div>

              <div className="col-span-2 md:col-span-2 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeExercise(index)}
                  disabled={exercises.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/workout")}
            disabled={createWorkout.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={createWorkout.isPending}>
            {createWorkout.isPending ? "Criando..." : "Criar treino"}
          </Button>
        </div>
      </form>
    </div>
  );
}
