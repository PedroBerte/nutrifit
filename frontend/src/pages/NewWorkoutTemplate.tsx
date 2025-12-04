import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateWorkoutTemplate,
  type ExerciseTemplateRequest,
} from "@/services/api/workoutTemplate";
import { useUpdateExerciseMedia } from "@/services/api/exercise";
import { ExerciseDrawer } from "@/components/exercise/ExerciseDrawer";
import {
  SortableExerciseItem,
  type SortableExerciseData,
} from "@/components/exercise/SortableExerciseItem";
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
import { Plus, ImageIcon, Video, Upload } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { motion } from "motion/react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

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
  imageUrl: z.string().optional(),
  videoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

type ExerciseConfigForm = z.infer<typeof exerciseConfigSchema>;

interface ConfiguredExercise extends SortableExerciseData {
  // Herda todos os campos de SortableExerciseData
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
    imageUrl?: string;
  } | null>(null);
  const [configuredExercises, setConfiguredExercises] = useState<
    ConfiguredExercise[]
  >([]);
  const [editingExercise, setEditingExercise] = useState<ConfiguredExercise | null>(null);

  const createTemplate = useCreateWorkoutTemplate();
  const updateExerciseMedia = useUpdateExerciseMedia();

  // Sensores para drag and drop (suporta touch e mouse)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      imageUrl: "",
      videoUrl: "",
    },
  });

  const handleExerciseSelect = (
    exerciseId: string,
    exerciseName: string,
    exerciseVideoUrl?: string,
    exerciseImageUrl?: string
  ) => {
    setSelectedExercise({
      id: exerciseId,
      name: exerciseName,
      imageUrl: exerciseImageUrl,
    });
    setEditingExercise(null);
    setExerciseDrawerOpen(false);
    setConfigDrawerOpen(true);
    exerciseForm.reset({
      targetSets: 3,
      targetRepsMin: undefined,
      targetRepsMax: undefined,
      suggestedLoad: undefined,
      restSeconds: 60,
      notes: "",
      imageUrl: exerciseImageUrl || "",
      videoUrl: exerciseVideoUrl || "",
    });
  };

  const handleEditExercise = (exercise: ConfiguredExercise) => {
    setEditingExercise(exercise);
    setSelectedExercise({
      id: exercise.exerciseId,
      name: exercise.exerciseName,
      imageUrl: exercise.exerciseImageUrl,
    });
    setConfigDrawerOpen(true);
    exerciseForm.reset({
      targetSets: exercise.targetSets,
      targetRepsMin: exercise.targetRepsMin,
      targetRepsMax: exercise.targetRepsMax,
      suggestedLoad: exercise.suggestedLoad,
      restSeconds: exercise.restSeconds,
      notes: exercise.notes || "",
      imageUrl: exercise.exerciseImageUrl || "",
      videoUrl: "",
    });
  };

  const handleExerciseConfig = async (data: ExerciseConfigForm) => {
    if (!selectedExercise) return;

    try {
      // Atualizar mídia do exercício se houver alteração
      const currentImageUrl = editingExercise?.exerciseImageUrl || selectedExercise.imageUrl || "";
      
      if (data.imageUrl && data.imageUrl !== currentImageUrl) {
        await updateExerciseMedia.mutateAsync({
          exerciseId: selectedExercise.id,
          data: {
            imageUrl: data.imageUrl || undefined,
            videoUrl: data.videoUrl || undefined,
          },
        });
      }

      if (editingExercise) {
      // Atualizar exercício existente
        setConfiguredExercises((prev) =>
          prev.map((ex) =>
            ex.id === editingExercise.id
              ? {
                  ...ex,
                  targetSets: data.targetSets,
                  targetRepsMin: data.targetRepsMin,
                  targetRepsMax: data.targetRepsMax,
                  suggestedLoad: data.suggestedLoad,
                  restSeconds: data.restSeconds,
                  notes: data.notes,
                  exerciseImageUrl: data.imageUrl || ex.exerciseImageUrl,
                }
              : ex
          )
        );
      } else {
        // Adicionar novo exercício
        const configured: ConfiguredExercise = {
          id: crypto.randomUUID(), // ID único para drag-and-drop
          exerciseId: selectedExercise.id,
          exerciseName: selectedExercise.name,
          exerciseImageUrl: data.imageUrl || selectedExercise.imageUrl,
          order: configuredExercises.length,
          targetSets: data.targetSets,
          targetRepsMin: data.targetRepsMin,
          targetRepsMax: data.targetRepsMax,
          suggestedLoad: data.suggestedLoad,
          restSeconds: data.restSeconds,
          notes: data.notes,
        };
        setConfiguredExercises((prev) => [...prev, configured]);
      }

      setConfigDrawerOpen(false);
      setSelectedExercise(null);
      setEditingExercise(null);
    } catch (error) {
      console.error("Erro ao salvar exercício:", error);
      toast.error("Erro ao salvar exercício");
    }
  };

  const removeExercise = (exercise: ConfiguredExercise) => {
    setConfiguredExercises((prev) => {
      const updated = prev.filter((ex) => ex.id !== exercise.id);
      return updated.map((ex, i) => ({ ...ex, order: i }));
    });
  };

  // Handler para quando o drag termina
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = configuredExercises.findIndex(ex => ex.id === active.id);
    const newIndex = configuredExercises.findIndex(ex => ex.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    setConfiguredExercises((prev) => {
      const newExercises = arrayMove(prev, oldIndex, newIndex);
      return newExercises.map((ex, i) => ({ ...ex, order: i }));
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto p-3 max-w-4xl"
    >
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
          <section className="bg-neutral-dark-01 w-full">
            <div className="mx-auto w-full bg-neutral-dark-03 p-4 space-y-4 rounded-sm">
              {/* Header */}
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-neutral-white-01">
                  Informações do Treino
                </h2>
              </div>
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
            </div>
          </section>

          <section className="bg-neutral-dark-01 w-full">
            <div className="mx-auto w-full bg-neutral-dark-03 p-3 rounded-sm">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-white-01">
                  Exercícios
                </h2>
              </div>
              <div className="space-y-3">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={configuredExercises.map(ex => ex.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {configuredExercises.map((exercise) => (
                      <SortableExerciseItem
                        key={exercise.id}
                        exercise={exercise}
                        formatSummary={formatExerciseSummary}
                        onEdit={handleEditExercise}
                        onRemove={removeExercise}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

                <Button
                  type="button"
                  className="w-full bg-transparent"
                  onClick={() => setExerciseDrawerOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Exercício
                </Button>
              </div>
            </div>
          </section>

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
        <DrawerContent className="max-h-[85vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle>
              {editingExercise ? "Editar" : "Configurar"}: {selectedExercise?.name}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 flex-1 overflow-y-auto min-h-0">
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

                {/* Seção de Mídia */}
                <div className="border-t border-neutral-dark-03 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-neutral-white-01 mb-3 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Mídia do Exercício
                  </h4>
                  
                  <div className="space-y-4">
                    <FormField
                      control={exerciseForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Upload className="h-3.5 w-3.5" />
                            URL da Imagem/GIF
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://exemplo.com/imagem.gif"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Cole a URL de uma imagem ou GIF demonstrando o exercício
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={exerciseForm.control}
                      name="videoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Video className="h-3.5 w-3.5" />
                            URL do Vídeo (YouTube)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://youtube.com/watch?v=..."
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Cole o link de um vídeo do YouTube
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <DrawerClose asChild>
                    <Button type="button" variant="outline" className="flex-1">
                      Cancelar
                    </Button>
                  </DrawerClose>
                  <Button type="submit" className="flex-1">
                    {editingExercise ? "Atualizar" : "Adicionar"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DrawerContent>
      </Drawer>
    </motion.div>
  );
}

