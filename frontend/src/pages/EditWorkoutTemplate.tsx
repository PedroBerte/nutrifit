import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetWorkoutTemplateById,
  useUpdateWorkoutTemplate,
  useAddExerciseToTemplate,
  useUpdateExerciseTemplate,
  useRemoveExerciseFromTemplate,
  type ExerciseTemplateRequest,
  type ExerciseTemplateResponse,
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
import { Plus, Trash2, GripVertical, Loader2, Edit } from "lucide-react";
import { motion } from "motion/react";
import { useToast } from "@/contexts/ToastContext";

// Schema para editar template
const updateTemplateSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  estimatedDurationMinutes: z.number().min(1, "Duração deve ser maior que 0"),
});

type UpdateTemplateForm = z.infer<typeof updateTemplateSchema>;

// Schema para configurar exercício
const exerciseConfigSchema = z.object({
  targetSets: z.number().min(1, "Número de séries deve ser maior que 0"),
  targetRepsMin: z.number().optional(),
  targetRepsMax: z.number().optional(),
  suggestedLoad: z.number().optional(),
  restSeconds: z.number().optional(),
  notes: z.string().optional(),
});

type ExerciseConfigForm = z.infer<typeof exerciseConfigSchema>;

export function EditWorkoutTemplate() {
  const navigate = useNavigate();
  const toast = useToast();
  const { routineId, templateId } = useParams<{
    routineId: string;
    templateId: string;
  }>();

  const [exerciseDrawerOpen, setExerciseDrawerOpen] = useState(false);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editingExerciseTemplate, setEditingExerciseTemplate] =
    useState<ExerciseTemplateResponse | null>(null);

  const { data: templateResponse, isLoading: loadingTemplate } =
    useGetWorkoutTemplateById(templateId);
  const { data: exercises, isLoading: exercisesLoading } = useGetExercises();
  const updateTemplate = useUpdateWorkoutTemplate();
  const addExercise = useAddExerciseToTemplate();
  const updateExercise = useUpdateExerciseTemplate();
  const removeExercise = useRemoveExerciseFromTemplate();

  const template = templateResponse?.data;

  const templateForm = useForm<UpdateTemplateForm>({
    resolver: zodResolver(updateTemplateSchema),
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

  // Carregar dados do template no form
  useEffect(() => {
    if (template) {
      templateForm.reset({
        title: template.title,
        description: template.description || "",
        estimatedDurationMinutes: template.estimatedDurationMinutes || 60,
      });
    }
  }, [template]);

  const handleExerciseSelect = (exerciseId: string, exerciseName: string) => {
    setSelectedExercise({ id: exerciseId, name: exerciseName });
    setEditingExerciseTemplate(null);
    setExerciseDrawerOpen(false);
    setConfigDrawerOpen(true);
    exerciseForm.reset({
      targetSets: 3,
      targetRepsMin: undefined,
      targetRepsMax: undefined,
      suggestedLoad: undefined,
      restSeconds: 60,
      notes: "",
    });
  };

  const handleEditExerciseTemplate = (
    exerciseTemplate: ExerciseTemplateResponse
  ) => {
    setEditingExerciseTemplate(exerciseTemplate);
    setSelectedExercise({
      id: exerciseTemplate.exerciseId,
      name: exerciseTemplate.exerciseName,
    });
    setConfigDrawerOpen(true);
    exerciseForm.reset({
      targetSets: exerciseTemplate.targetSets,
      targetRepsMin: exerciseTemplate.targetRepsMin,
      targetRepsMax: exerciseTemplate.targetRepsMax,
      suggestedLoad: exerciseTemplate.suggestedLoad,
      restSeconds: exerciseTemplate.restSeconds,
      notes: exerciseTemplate.notes || "",
    });
  };

  const handleExerciseConfig = async (data: ExerciseConfigForm) => {
    if (!templateId) return;

    try {
      if (editingExerciseTemplate) {
        // Atualizar exercício existente
        await updateExercise.mutateAsync({
          exerciseTemplateId: editingExerciseTemplate.id,
          data: {
            targetSets: data.targetSets,
            targetRepsMin: data.targetRepsMin,
            targetRepsMax: data.targetRepsMax,
            suggestedLoad: data.suggestedLoad,
            restSeconds: data.restSeconds,
            notes: data.notes,
          },
        });
      } else if (selectedExercise) {
        // Adicionar novo exercício
        const currentExercisesCount = template?.exerciseTemplates?.length || 0;
        await addExercise.mutateAsync({
          templateId,
          data: {
            exerciseId: selectedExercise.id,
            order: currentExercisesCount,
            targetSets: data.targetSets,
            targetRepsMin: data.targetRepsMin,
            targetRepsMax: data.targetRepsMax,
            suggestedLoad: data.suggestedLoad,
            restSeconds: data.restSeconds,
            notes: data.notes,
          },
        });
      }

      setConfigDrawerOpen(false);
      setSelectedExercise(null);
      setEditingExerciseTemplate(null);
    } catch (error) {
      console.error("Erro ao salvar exercício:", error);
      toast.error("Erro ao salvar exercício");
    }
  };

  const handleRemoveExercise = async (exerciseTemplateId: string) => {
    if (!confirm("Deseja realmente remover este exercício?")) return;

    try {
      await removeExercise.mutateAsync(exerciseTemplateId);
    } catch (error) {
      console.error("Erro ao remover exercício:", error);
      toast.error("Erro ao remover exercício");
    }
  };

  const handleSubmit = async (data: UpdateTemplateForm) => {
    if (!templateId) return;

    try {
      await updateTemplate.mutateAsync({
        templateId,
        data: {
          title: data.title,
          description: data.description,
          estimatedDurationMinutes: data.estimatedDurationMinutes,
        },
      });
      toast.success("Template atualizado com sucesso!");
      navigate(`/routines/${routineId}`);
    } catch (error) {
      console.error("Erro ao atualizar template:", error);
      toast.error("Erro ao atualizar template");
    }
  };

  const formatExerciseSummary = (ex: ExerciseTemplateResponse) => {
    const parts: string[] = [];
    parts.push(`${ex.targetSets} séries`);

    if (ex.targetRepsMin && ex.targetRepsMax) {
      parts.push(`${ex.targetRepsMin}-${ex.targetRepsMax}`);
    } else if (ex.targetRepsMin) {
      parts.push(`${ex.targetRepsMin}+ reps`);
    }

    if (ex.suggestedLoad) {
      parts.push(`${ex.suggestedLoad}kg`);
    }

    if (ex.restSeconds) {
      parts.push(`${ex.restSeconds}s`);
    }

    return parts.join(" • ");
  };

  if (loadingTemplate) {
    return (
      <div className="container mx-auto p-6 max-w-4xl flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Carregando template...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <p className="text-center text-muted-foreground">
          Template não encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 mt-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Editar Treino</h1>
        <p className="text-muted-foreground">
          Edite as informações e exercícios do treino
        </p>
      </div>

      <Form {...templateForm}>
        <form
          onSubmit={templateForm.handleSubmit(handleSubmit)}
          className="space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-none">
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Exercícios</CardTitle>
                <CardDescription>
                  Gerencie os exercícios do template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {template.exerciseTemplates?.map((exerciseTemplate) => (
                    <div
                      key={exerciseTemplate.id}
                      className="flex items-center gap-3 p-3 bg-neutral-dark-01 rounded-lg"
                    >
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                      <div className="flex-1">
                        <p className="font-medium">
                          {exerciseTemplate.exerciseName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatExerciseSummary(exerciseTemplate)}
                        </p>
                        {exerciseTemplate.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {exerciseTemplate.notes}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleEditExerciseTemplate(exerciseTemplate)
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleRemoveExercise(exerciseTemplate.id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    className="w-full bg-transparent"
                    onClick={() => setExerciseDrawerOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Exercício
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="flex gap-3">
            <Button
              type="button"
              className="flex-1 bg-transparent"
              onClick={() => navigate(`/routines/${routineId}`)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={updateTemplate.isPending}
            >
              {updateTemplate.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Drawer 1: Seleção de Exercício */}
      <ExerciseDrawer
        open={exerciseDrawerOpen}
        onOpenChange={setExerciseDrawerOpen}
        onExerciseSelect={handleExerciseSelect}
        selectedExerciseIds={
          template.exerciseTemplates?.map((ex) => ex.exerciseId) || []
        }
      />

      {/* Drawer 2: Configuração do Exercício */}
      <Drawer open={configDrawerOpen} onOpenChange={setConfigDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {editingExerciseTemplate ? "Editar" : "Configurar"}:{" "}
              {selectedExercise?.name}
            </DrawerTitle>
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
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={addExercise.isPending || updateExercise.isPending}
                  >
                    {editingExerciseTemplate ? "Atualizar" : "Adicionar"}
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
