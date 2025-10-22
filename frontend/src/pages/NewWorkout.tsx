import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateWorkout, useCreateWorkoutSet } from "@/services/api/workout";
import { useGetExercises } from "@/services/api/exercise";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, X, Dumbbell, ClipboardPlus } from "lucide-react";

const createWorkoutSchema = z.object({
  title: z
    .string()
    .min(1, "O título é obrigatório")
    .max(200, "Título muito longo"),
  description: z.string().max(1000, "Descrição muito longa").optional(),
  expectedDuration: z
    .number()
    .min(1, "Duração deve ser maior que 0")
    .optional(),
});

type CreateWorkoutFormData = z.infer<typeof createWorkoutSchema>;

interface SelectedExercise {
  id: string;
  name: string;
}

export default function NewWorkout() {
  const navigate = useNavigate();
  const { routineId } = useParams<{ routineId: string }>();
  const createWorkout = useCreateWorkout();
  const createWorkoutSet = useCreateWorkoutSet();
  const { data: exercises, isLoading: loadingExercises } = useGetExercises();

  const [isExerciseDrawerOpen, setIsExerciseDrawerOpen] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<
    SelectedExercise[]
  >([]);

  const form = useForm<CreateWorkoutFormData>({
    resolver: zodResolver(createWorkoutSchema),
    defaultValues: {
      title: "",
      description: "",
      expectedDuration: undefined,
    },
  });

  const handleAddExercise = (exerciseId: string, exerciseName: string) => {
    if (!selectedExercises.find((e) => e.id === exerciseId)) {
      setSelectedExercises([
        ...selectedExercises,
        { id: exerciseId, name: exerciseName },
      ]);
    }
    setIsExerciseDrawerOpen(false);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter((e) => e.id !== exerciseId));
  };

  const handleSubmit = async (data: CreateWorkoutFormData) => {
    if (!routineId) {
      alert("ID da rotina não encontrado");
      return;
    }

    try {
      // Criar o treino
      const response = await createWorkout.mutateAsync({
        routineId,
        data: {
          title: data.title.trim(),
          description: data.description?.trim() || undefined,
          expectedDuration: data.expectedDuration,
        },
      });

      if (!response.success || !response.data) {
        alert(response.message || "Erro ao criar treino");
        return;
      }

      const workoutId = response.data.id;

      // Adicionar exercícios ao treino (por enquanto apenas estrutura básica)
      // Você pode implementar a lógica completa depois
      for (let i = 0; i < selectedExercises.length; i++) {
        const exercise = selectedExercises[i];
        await createWorkoutSet.mutateAsync({
          workoutId,
          data: {
            exerciseId: exercise.id,
            maxSets: 3, // Valor padrão temporário
            order: i + 1,
            expectedSets: 3, // Valor padrão temporário
          },
        });
      }

      alert("Treino criado com sucesso!");
      navigate(`/routines/${routineId}`);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao criar treino";
      alert(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="flex items-center">
      <section className="bg-neutral-dark-01 w-full h-full">
        <div className="mx-auto w-full bg-neutral-dark-03 p-3 rounded-sm mt-5 h-full">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-neutral-white-01">
              Cadastro de Treino
            </h1>
          </div>

          {/* Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Título */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome do treino"
                        maxLength={200}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Descrição */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o treino"
                        maxLength={1000}
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duração Esperada */}
              <FormField
                control={form.control}
                name="expectedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração Esperada (minutos - Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 60"
                        min={1}
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Exercícios */}
              <div className="space-y-2 pt-3">
                {/* Botão para adicionar exercício */}
                <Drawer
                  open={isExerciseDrawerOpen}
                  onOpenChange={setIsExerciseDrawerOpen}
                >
                  <div className="flex items-center justify-between">
                    <label className="text-lg font-medium text-neutral-white-01">
                      Exercícios
                    </label>
                    <DrawerTrigger asChild>
                      <Button type="button" size="sm">
                        <Plus className="size-4" />
                        Adicionar Exercício
                      </Button>
                    </DrawerTrigger>
                  </div>

                  {/* Lista de exercícios selecionados */}
                  <div className="flex flex-col gap-2 h-full bg-neutral-dark-01 p-3 rounded-sm">
                    {selectedExercises.length === 0 && (
                      <div className="flex items-center flex-col h-full py-5 justify-center">
                        <ClipboardPlus className="size-5 text-neutral-white-02" />
                        <p className="text-center text-sm text-neutral-white-02">
                          Adicione exercícios ao treino do aluno!
                        </p>
                      </div>
                    )}

                    {selectedExercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex items-center justify-between bg-neutral-dark-03 p-3 rounded-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Dumbbell className="size-4" />
                          <span className="text-neutral-white-01">
                            {exercise.name}
                          </span>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveExercise(exercise.id)}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Selecione um Exercício</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                      {loadingExercises && (
                        <p className="text-center text-neutral-white-03">
                          Carregando exercícios...
                        </p>
                      )}

                      {!loadingExercises &&
                        exercises?.data &&
                        exercises.data.items.length === 0 && (
                          <p className="text-center text-neutral-white-03">
                            Nenhum exercício encontrado
                          </p>
                        )}

                      {!loadingExercises &&
                        exercises?.data?.items &&
                        exercises.data.items.map((exercise) => (
                          <Button
                            key={exercise.id}
                            type="button"
                            variant={
                              selectedExercises.find(
                                (e) => e.id === exercise.id
                              )
                                ? "outline"
                                : "default"
                            }
                            className="w-full justify-start"
                            onClick={() =>
                              handleAddExercise(exercise.id, exercise.name)
                            }
                          >
                            <Dumbbell className="mr-2 size-4" />
                            {exercise.name}
                          </Button>
                        ))}
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  className="flex-1 bg-primary-green-01 hover:bg-primary-green-02"
                  onClick={handleCancel}
                  disabled={createWorkout.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createWorkout.isPending || createWorkoutSet.isPending
                  }
                  className="flex-1"
                >
                  {createWorkout.isPending || createWorkoutSet.isPending
                    ? "Criando..."
                    : "Criar"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </section>
    </div>
  );
}
