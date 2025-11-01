import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateWorkoutTemplate,
  type ExerciseTemplateRequest,
} from "@/services/api/workoutTemplate";
import { useGetExercises } from "@/services/api/exercise";
import type { ExerciseType } from "@/types/exercise";
import { ExerciseDrawer } from "@/components/exercise/ExerciseDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

const createTemplateSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  estimatedDurationMinutes: z.number().min(1, "Duração deve ser maior que 0"),
});

type CreateTemplateForm = z.infer<typeof createTemplateSchema>;

const exerciseConfigSchema = z.object({
  targetSets: z.number().min(1, "Número de séries deve ser maior que 0"),
  targetRepsMin: z.number().optional(),
  targetRepsMax: z.number().optional(),
  suggestedLoad: z.number().optional(),
  restSeconds: z.number().optional(),
  notes: z.string().optional(),
});

type ExerciseConfigForm = z.infer<typeof exerciseConfigSchema>;

interface ConfiguredExercise extends ExerciseTemplateRequest {
  exerciseName: string;
}

export function NewWorkoutTemplate() {
  const navigate = useNavigate();
  const { routineId } = useParams<{ routineId: string }>();
  const toast = useToast();

  const [exerciseDrawerOpen, setExerciseDrawerOpen] = useState(false);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [configuredExercises, setConfiguredExercises] = useState<
    ConfiguredExercise[]
  >([]);

  const { data: exercises, isLoading: exercisesLoading } = useGetExercises();
  const createTemplate = useCreateWorkoutTemplate();

  const templateForm = useForm<CreateTemplateForm>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      title: "",
      description: "",
      estimatedDurationMinutes: 60,
    },
  });

  const exerciseForm = useForm<ExerciseConfigForm>({
    resolver: zodResolver(exerciseConfigSchema),
    defaultValues: {
      targetSets: 3,
      targetRepsMin: undefined,
      targetRepsMax: undefined,
      suggestedLoad: undefined,
      restSeconds: 60,
      notes: "",
    },
  });

  const handleExerciseSelect = (exerciseId: string, exerciseName: string) => {
    setSelectedExercise({ id: exerciseId, name: exerciseName });
    setExerciseDrawerOpen(false);
    setConfigDrawerOpen(true);
    exerciseForm.reset();
  };

  const handleExerciseConfig = (data: ExerciseConfigForm) => {
    if (!selectedExercise) return;

    const configured: ConfiguredExercise = {
      exerciseId: selectedExercise.id,
      exerciseName: selectedExercise.name,
      order: configuredExercises.length,
      targetSets: data.targetSets,
      targetRepsMin: data.targetRepsMin,
      targetRepsMax: data.targetRepsMax,
      suggestedLoad: data.suggestedLoad,
      restSeconds: data.restSeconds,
      notes: data.notes,
    };

    setConfiguredExercises((prev) => [...prev, configured]);
    setConfigDrawerOpen(false);
    setSelectedExercise(null);
  };

  const removeExercise = (index: number) => {
    setConfiguredExercises((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.map((ex, i) => ({ ...ex, order: i }));
    });
  };

  const handleSubmit = async (formData: CreateTemplateForm) => {
    if (!routineId) return;

    try {
      await createTemplate.mutateAsync({
        routineId,
        data: {
          title: formData.title,
          description: formData.description,
          estimatedDurationMinutes: formData.estimatedDurationMinutes,
          order: 0,
          exerciseTemplates: configuredExercises,
        },
      });
      toast.success("Treino criado com sucesso!");
      navigate(`/routines/${routineId}`);
    } catch (error: any) {
      console.error("Erro ao criar template:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao criar treino";
      toast.error(errorMessage);
    }
  };

  const formatExerciseSummary = (ex: ConfiguredExercise) => {
    const parts: string[] = [];
    parts.push(`${ex.targetSets} séries`);

    if (ex.targetRepsMin && ex.targetRepsMax) {
      parts.push(`${ex.targetRepsMin}-${ex.targetRepsMax} reps`);
    } else if (ex.targetRepsMin) {
      parts.push(`${ex.targetRepsMin}+ reps`);
    }

    if (ex.suggestedLoad) {
      parts.push(`${ex.suggestedLoad}kg`);
    }

    if (ex.restSeconds) {
      parts.push(`${ex.restSeconds}s descanso`);
    }

    return parts.join(" • ");
  };

  return (
    <div className="container mx-auto p-3 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Novo Treino</h1>
        <p className="text-muted-foreground">
          Crie um novo treino para sua rotina
        </p>
      </div>

      <Form {...templateForm}>
        <form
          onSubmit={templateForm.handleSubmit(handleSubmit)}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Informações do Treino</CardTitle>
              <CardDescription>
                Configure os detalhes básicos do treino
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={templateForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Treino A - Peito e Tríceps"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={templateForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o objetivo deste treino..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={templateForm.control}
                name="estimatedDurationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração Estimada (minutos)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exercícios</CardTitle>
              <CardDescription>
                Adicione e configure os exercícios do template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {configuredExercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <div className="flex-1">
                      <p className="font-medium">{exercise.exerciseName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatExerciseSummary(exercise)}
                      </p>
                      {exercise.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {exercise.notes}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExercise(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setExerciseDrawerOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Exercício
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={
                configuredExercises.length === 0 || createTemplate.isPending
              }
            >
              {createTemplate.isPending ? "Criando..." : "Criar Template"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Drawer 1: Seleção de Exercício */}
      <ExerciseDrawer
        open={exerciseDrawerOpen}
        onOpenChange={setExerciseDrawerOpen}
        onExerciseSelect={handleExerciseSelect}
        selectedExerciseIds={configuredExercises.map((ex) => ex.exerciseId)}
      />

      {/* Drawer 2: Configuração do Exercício */}
      <Drawer open={configDrawerOpen} onOpenChange={setConfigDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Configurar: {selectedExercise?.name}</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <Form {...exerciseForm}>
              <form
                onSubmit={exerciseForm.handleSubmit(handleExerciseConfig)}
                className="space-y-4"
              >
                <FormField
                  control={exerciseForm.control}
                  name="targetSets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Séries *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={exerciseForm.control}
                    name="targetRepsMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reps Mínimas</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="8"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined
                              )
                            }
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={exerciseForm.control}
                    name="targetRepsMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reps Máximas</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="12"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined
                              )
                            }
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={exerciseForm.control}
                  name="suggestedLoad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carga Sugerida (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="20"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
                            )
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={exerciseForm.control}
                  name="restSeconds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descanso (segundos)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="60"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined
                            )
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={exerciseForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Foco em execução lenta, contrair no topo..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <DrawerClose asChild>
                    <Button type="button" variant="outline" className="flex-1">
                      Cancelar
                    </Button>
                  </DrawerClose>
                  <Button type="submit" className="flex-1">
                    Adicionar
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
