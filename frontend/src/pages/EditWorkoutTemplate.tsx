import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetWorkoutTemplateById,
  useUpdateWorkoutTemplate,
  useDeleteWorkoutTemplate,
  useAddExerciseToTemplate,
  useUpdateExerciseTemplate,
  useRemoveExerciseFromTemplate,
  useReorderExercises,
  type ExerciseTemplateRequest,
  type ExerciseTemplateResponse,
} from "@/services/api/workoutTemplate";
import { useGetExercises, useUpdateExerciseMedia } from "@/services/api/exercise";
import { useUploadExerciseMedia } from "@/services/api/storage";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Plus,
  Trash2,
  GripVertical,
  Loader2,
  Edit,
  AlertTriangle,
  ImageIcon,
  Video,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useToast } from "@/contexts/ToastContext";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Schema para editar template
const updateTemplateSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  estimatedDurationMinutes: z.number().min(1, "Duração deve ser maior que 0"),
});

type UpdateTemplateForm = z.infer<typeof updateTemplateSchema>;

// Schema para configurar exercício
const exerciseConfigSchema = z.object({
  targetSets: z.string().min(1, "Número de séries é obrigatório"),
  targetRepsMin: z.string().optional(),
  targetRepsMax: z.string().optional(),
  suggestedLoad: z.string().optional(),
  restSeconds: z.string().optional(),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

type ExerciseConfigForm = z.infer<typeof exerciseConfigSchema>;

// Componente para item arrastável
interface SortableExerciseItemProps {
  exerciseTemplate: ExerciseTemplateResponse;
  onEdit: (ex: ExerciseTemplateResponse) => void;
  onRemove: (ex: ExerciseTemplateResponse) => void;
  formatSummary: (ex: ExerciseTemplateResponse) => string;
}

function SortableExerciseItem({
  exerciseTemplate,
  onEdit,
  onRemove,
  formatSummary,
}: SortableExerciseItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exerciseTemplate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 xs:gap-3 p-2 xs:p-3 bg-neutral-dark-01 rounded-lg ${
        isDragging ? "shadow-lg ring-2 ring-primary" : ""
      }`}
    >
      {/* Grip para arrastar - sempre visível */}
      <button
        type="button"
        className="touch-none p-1 xs:p-1.5 rounded hover:bg-neutral-dark-03 cursor-grab active:cursor-grabbing flex-shrink-0"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 xs:h-5 xs:w-5 text-muted-foreground" />
      </button>

      {/* Thumbnail da imagem/GIF do exercício - oculta em telas pequenas */}
      {exerciseTemplate.exerciseImageUrl && (
        <div className="hidden xs:flex flex-shrink-0 w-10 h-10 xs:w-12 xs:h-12 rounded-md overflow-hidden bg-muted">
          <img
            src={exerciseTemplate.exerciseImageUrl}
            alt={exerciseTemplate.exerciseName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Informações do exercício */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm xs:text-base truncate">
          {exerciseTemplate.exerciseName}
        </p>
        <p className="text-xs xs:text-sm text-muted-foreground truncate">
          {formatSummary(exerciseTemplate)}
        </p>
        {exerciseTemplate.notes && (
          <p className="text-[10px] xs:text-xs text-muted-foreground mt-0.5 xs:mt-1 truncate">
            {exerciseTemplate.notes}
          </p>
        )}
      </div>

      {/* Botões de ação - vertical */}
      <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 xs:h-8 xs:w-8"
          onClick={() => onEdit(exerciseTemplate)}
        >
          <Edit className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 xs:h-8 xs:w-8 text-destructive hover:text-destructive"
          onClick={() => onRemove(exerciseTemplate)}
        >
          <Trash2 className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
        </Button>
      </div>
    </div>
  );
}

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
  const [exerciseToRemove, setExerciseToRemove] =
    useState<ExerciseTemplateResponse | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [localExercises, setLocalExercises] = useState<ExerciseTemplateResponse[]>([]);

  const { data: templateResponse, isLoading: loadingTemplate } =
    useGetWorkoutTemplateById(templateId);
  const { data: exercises, isLoading: exercisesLoading } = useGetExercises();
  const updateTemplate = useUpdateWorkoutTemplate();
  const deleteTemplate = useDeleteWorkoutTemplate();
  const addExercise = useAddExerciseToTemplate();
  const updateExercise = useUpdateExerciseTemplate();
  const removeExercise = useRemoveExerciseFromTemplate();
  const reorderExercises = useReorderExercises();
  const updateExerciseMedia = useUpdateExerciseMedia();
  const uploadExerciseMedia = useUploadExerciseMedia();

  const template = templateResponse?.data;

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

  // Sincroniza exercícios locais com os do template
  useEffect(() => {
    if (template?.exerciseTemplates) {
      setLocalExercises([...template.exerciseTemplates].sort((a, b) => a.order - b.order));
    }
  }, [template?.exerciseTemplates]);

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
      targetSets: "3",
      targetRepsMin: "",
      targetRepsMax: "",
      suggestedLoad: "",
      restSeconds: "60",
      notes: "",
      imageUrl: "",
      videoUrl: "",
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

  const handleExerciseSelect = (
    exerciseId: string,
    exerciseName: string,
    exerciseVideoUrl?: string,
    exerciseImageUrl?: string
  ) => {
    setSelectedExercise({ id: exerciseId, name: exerciseName });
    setEditingExerciseTemplate(null);
    setExerciseDrawerOpen(false);
    setConfigDrawerOpen(true);
    exerciseForm.reset({
      targetSets: "3",
      targetRepsMin: "",
      targetRepsMax: "",
      suggestedLoad: "",
      restSeconds: "60",
      notes: "",
      imageUrl: exerciseImageUrl || "",
      videoUrl: exerciseVideoUrl || "",
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
      targetSets: String(exerciseTemplate.targetSets ?? ""),
      targetRepsMin:
        exerciseTemplate.targetRepsMin != null
          ? String(exerciseTemplate.targetRepsMin)
          : "",
      targetRepsMax:
        exerciseTemplate.targetRepsMax != null
          ? String(exerciseTemplate.targetRepsMax)
          : "",
      suggestedLoad:
        exerciseTemplate.suggestedLoad != null
          ? String(exerciseTemplate.suggestedLoad)
          : "",
      restSeconds:
        exerciseTemplate.restSeconds != null
          ? String(exerciseTemplate.restSeconds)
          : "",
      notes: exerciseTemplate.notes || "",
      imageUrl: exerciseTemplate.exerciseImageUrl || "",
      videoUrl: exerciseTemplate.exerciseVideoUrl || "",
    });
  };

  const handleExerciseConfig = async (data: ExerciseConfigForm) => {
    if (!templateId || !selectedExercise) return;

    // Converte strings vazias para undefined e garante números
    const toNumber = (val: string | number | undefined) => {
      if (val === "" || val === undefined) return undefined;
      const num = typeof val === "string" ? parseFloat(val) : val;
      return isNaN(num) ? undefined : num;
    };

    const payload = {
      targetSets: toNumber(data.targetSets) ?? 1,
      targetRepsMin: toNumber(data.targetRepsMin),
      targetRepsMax: toNumber(data.targetRepsMax),
      suggestedLoad: toNumber(data.suggestedLoad),
      restSeconds: toNumber(data.restSeconds),
      notes: data.notes || undefined,
    };

    try {
      // Atualizar mídia do exercício se houver alteração
      const currentImageUrl = editingExerciseTemplate?.exerciseImageUrl || "";
      const currentVideoUrl = editingExerciseTemplate?.exerciseVideoUrl || "";
      
      if (data.imageUrl !== currentImageUrl || data.videoUrl !== currentVideoUrl) {
        await updateExerciseMedia.mutateAsync({
          exerciseId: selectedExercise.id,
          data: {
            imageUrl: data.imageUrl || undefined,
            videoUrl: data.videoUrl || undefined,
          },
        });
      }

      if (editingExerciseTemplate) {
        // Atualizar exercício existente
        await updateExercise.mutateAsync({
          exerciseTemplateId: editingExerciseTemplate.id,
          data: payload,
        });
      } else {
        // Adicionar novo exercício
        const currentExercisesCount = template?.exerciseTemplates?.length || 0;
        await addExercise.mutateAsync({
          templateId,
          data: {
            exerciseId: selectedExercise.id,
            order: currentExercisesCount,
            ...payload,
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

  const handleRemoveExercise = async () => {
    if (!exerciseToRemove) return;

    try {
      await removeExercise.mutateAsync(exerciseToRemove.id);
      toast.success("Exercício removido com sucesso");
    } catch (error) {
      console.error("Erro ao remover exercício:", error);
      toast.error("Erro ao remover exercício");
    } finally {
      setExerciseToRemove(null);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateId) return;

    try {
      await deleteTemplate.mutateAsync(templateId);
      toast.success("Treino deletado com sucesso!");
      navigate(`/routines/${routineId}`);
    } catch (error) {
      console.error("Erro ao deletar template:", error);
      toast.error("Erro ao deletar treino");
    } finally {
      setShowDeleteDialog(false);
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

  // Handler para quando o drag termina
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id || !templateId) return;

    const oldIndex = localExercises.findIndex(ex => ex.id === active.id);
    const newIndex = localExercises.findIndex(ex => ex.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Atualiza estado local imediatamente (optimistic update)
    const newExercises = arrayMove(localExercises, oldIndex, newIndex);
    setLocalExercises(newExercises);

    // Envia para a API
    try {
      await reorderExercises.mutateAsync({
        templateId,
        exerciseTemplateIds: newExercises.map(ex => ex.id),
      });
    } catch (error) {
      console.error("Erro ao reordenar exercícios:", error);
      toast.error("Erro ao reordenar exercícios");
      // Reverte em caso de erro
      if (template?.exerciseTemplates) {
        setLocalExercises([...template.exerciseTemplates].sort((a, b) => a.order - b.order));
      }
    }
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto mt-2"
    >
      <Form {...templateForm}>
        <form
          onSubmit={templateForm.handleSubmit(handleSubmit)}
          className="space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <section className="bg-neutral-dark-01 w-full">
              <div className="mx-auto w-full bg-neutral-dark-03 p-4 space-y-4 rounded-sm mt-5">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                  <h1 className="text-2xl font-semibold text-neutral-white-01">
                    Editar treino
                  </h1>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => setShowDeleteDialog(true)}
                    title="Deletar treino"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <section className="bg-neutral-dark-01 w-full">
              <div className="mx-auto w-full bg-neutral-dark-03 p-3 rounded-sm mt-5">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                  <h1 className="text-2xl font-semibold text-neutral-white-01">
                    Exercícios
                  </h1>
                </div>
                <div className="space-y-3">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={localExercises.map(ex => ex.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {localExercises.map((exerciseTemplate) => (
                        <SortableExerciseItem
                          key={exerciseTemplate.id}
                          exerciseTemplate={exerciseTemplate}
                          formatSummary={formatExerciseSummary}
                          onEdit={handleEditExerciseTemplate}
                          onRemove={setExerciseToRemove}
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
        <DrawerContent className="max-h-[85vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle>
              {editingExerciseTemplate ? "Editar" : "Configurar"}:{" "}
              {selectedExercise?.name}
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
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
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
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value)}
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
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value)}
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
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
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
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
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
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={addExercise.isPending || updateExercise.isPending || updateExerciseMedia.isPending}
                  >
                    {editingExerciseTemplate ? "Atualizar" : "Adicionar"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Dialog de Confirmação de Remoção de Exercício */}
      <Dialog
        open={!!exerciseToRemove}
        onOpenChange={(open) => !open && setExerciseToRemove(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Exercício</DialogTitle>
            <DialogDescription>
              Deseja realmente remover o exercício{" "}
              <strong>{exerciseToRemove?.exerciseName}</strong> do treino?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExerciseToRemove(null)}
              disabled={removeExercise.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveExercise}
              disabled={removeExercise.isPending}
            >
              {removeExercise.isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Removendo...
                </>
              ) : (
                "Remover"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Deleção do Treino */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Deletar Treino
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar o treino{" "}
              <strong>{template?.title}</strong>?
              <br />
              <br />
              Todos os exercícios configurados serão perdidos. Esta ação não
              pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteTemplate.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTemplate}
              disabled={deleteTemplate.isPending}
            >
              {deleteTemplate.isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Deletando...
                </>
              ) : (
                "Deletar Treino"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
