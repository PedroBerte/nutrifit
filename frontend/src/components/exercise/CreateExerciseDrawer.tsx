import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateExercise,
  useUpdateExercise,
  useGetExerciseCategories,
  useGetMuscleGroups,
  useDeleteExercise,
  useGetExerciseSteps,
  useReplaceExerciseSteps,
} from "@/services/api/exercise";
import type { ExerciseType } from "@/types/exercise";
import { ExerciseStepsDrawer } from "./ExerciseStepsDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/contexts/ToastContext";
import { Trash2, Loader2, ListOrdered, Plus, GripVertical, Timer } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ExerciseMediaUploader } from "./ExerciseMediaUploader";

const exerciseSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  exerciseType: z.enum(["Standard", "Mobilidade"]),
  instruction: z.string(),
  videoUrl: z.string(),
  isPublished: z.boolean(),
  primaryMuscleIds: z
    .array(z.string())
    .min(1, "Selecione pelo menos um músculo primário"),
  secondaryMuscleIds: z.array(z.string()),
});

type ExerciseForm = z.infer<typeof exerciseSchema>;

const stepItemSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  order: z.number().int().min(1),
  durationSeconds: z.number().int().min(1).optional(),
  notes: z.string().optional(),
});
const stepsFormSchema = z.object({ steps: z.array(stepItemSchema) });
type StepsForm = z.infer<typeof stepsFormSchema>;

interface CreateExerciseDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  exerciseToEdit?: ExerciseType | null;
}

export function CreateExerciseDrawer({
  open,
  onOpenChange,
  onSuccess,
  exerciseToEdit,
}: CreateExerciseDrawerProps) {
  const toast = useToast();
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStepsDrawer, setShowStepsDrawer] = useState(false);

  const { data: categories } = useGetExerciseCategories();
  const { data: muscleGroups } = useGetMuscleGroups();
  const muscleGroupsList = Array.isArray(muscleGroups?.data)
    ? muscleGroups.data
    : [];
  const createExercise = useCreateExercise();
  const updateExercise = useUpdateExercise(exerciseToEdit?.id || "");
  const deleteExercise = useDeleteExercise();

  const isEditing = !!exerciseToEdit;

  // ── Steps inline (Mobilidade type) ──────────────────────────────────
  const exerciseId = exerciseToEdit?.id ?? "";
  const { data: stepsData, isLoading: stepsLoading } = useGetExerciseSteps(
    isEditing && exerciseId ? exerciseId : null
  );
  const replaceSteps = useReplaceExerciseSteps(exerciseId);
  const stepsForm = useForm<StepsForm>({
    resolver: zodResolver(stepsFormSchema),
    defaultValues: { steps: [] },
  });
  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control: stepsForm.control,
    name: "steps",
  });

  useEffect(() => {
    if (isEditing && open && stepsData?.data) {
      stepsForm.reset({
        steps: stepsData.data.map((s) => ({
          name: s.name,
          order: s.order,
          durationSeconds: s.durationSeconds,
          notes: s.notes ?? "",
        })),
      });
    }
    if (!open) stepsForm.reset({ steps: [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, open, stepsData]);

  const handleSaveSteps = async (data: StepsForm) => {
    try {
      await replaceSteps.mutateAsync({
        steps: data.steps.map((s, i) => ({
          name: s.name,
          order: i + 1,
          durationSeconds:
            s.durationSeconds != null && !isNaN(s.durationSeconds)
              ? s.durationSeconds
              : undefined,
          notes: s.notes || undefined,
        })),
      });
      toast.success("Steps salvos!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao salvar steps");
    }
  };

  const formatStepDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    if (s === 0) return `${m}min`;
    return `${m}min ${s}s`;
  };
  // ────────────────────────────────────────────────────────────────────

  const form = useForm<ExerciseForm>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      exerciseType: "Standard" as const,
      instruction: "",
      videoUrl: "",
      isPublished: false,
      primaryMuscleIds: [],
      secondaryMuscleIds: [],
    },
  });
  const watchedExerciseType = form.watch("exerciseType");

  // Preencher formulário ao editar
  useEffect(() => {
    if (exerciseToEdit && open) {
      // Buscar IDs dos músculos pelo nome (seria melhor ter os IDs no backend)
      const primaryIds: string[] = [];
      const secondaryIds: string[] = [];

      muscleGroups?.data?.forEach((group) => {
        group.muscles?.forEach((muscle) => {
          if (exerciseToEdit.primaryMuscles?.includes(muscle.name)) {
            primaryIds.push(muscle.id);
          }
          if (exerciseToEdit.secondaryMuscles?.includes(muscle.name)) {
            secondaryIds.push(muscle.id);
          }
        });
      });

      // Buscar ID da categoria pelo nome
      const categoryId =
        categories?.data?.find(
          (cat) => cat.name === exerciseToEdit.categoryName
        )?.id || "";

      form.reset({
        name: exerciseToEdit.name,
        categoryId,
        instruction: exerciseToEdit.instruction || "",
        videoUrl: exerciseToEdit.videoUrl || "",
        isPublished: exerciseToEdit.isPublished || false,
        primaryMuscleIds: primaryIds,
        secondaryMuscleIds: secondaryIds,
        exerciseType: (exerciseToEdit.exerciseType as "Standard" | "Mobilidade") ?? "Standard",
      });

      setUploadedMediaUrl(exerciseToEdit.videoUrl || null);
    } else if (!open) {
      form.reset();
      setUploadedMediaUrl(null);
    }
  }, [exerciseToEdit, open, form, categories, muscleGroups]);

  const handleSubmit = async (data: ExerciseForm) => {
    try {
      // Usar a URL da mídia carregada (se houver) ou manter vazio
      const exerciseData = {
        ...data,
        imageUrl: uploadedMediaUrl || "",
      };

      if (isEditing) {
        await updateExercise.mutateAsync(exerciseData);
        toast.success("Exercício atualizado com sucesso!");
      } else {
        await createExercise.mutateAsync(exerciseData);
        toast.success("Exercício criado com sucesso!");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Erro ao salvar exercício:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao salvar exercício";
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!exerciseToEdit?.id) return;

    try {
      await deleteExercise.mutateAsync(exerciseToEdit.id);
      toast.success("Exercício deletado com sucesso!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Erro ao deletar exercício:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao deletar exercício";
      toast.error(errorMessage);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const toggleMuscle = (muscleId: string, isPrimary: boolean) => {
    const field = isPrimary ? "primaryMuscleIds" : "secondaryMuscleIds";
    const currentIds = form.getValues(field);

    if (currentIds.includes(muscleId)) {
      form.setValue(
        field,
        currentIds.filter((id) => id !== muscleId)
      );
    } else {
      form.setValue(field, [...currentIds, muscleId]);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] flex flex-col">
        <DrawerHeader className="border-b flex-shrink-0">
          <DrawerTitle>
            {isEditing ? "Editar Exercício" : "Novo Exercício"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="p-4 flex-1 overflow-y-auto min-h-0">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Exercício *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Supino reto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.data?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exerciseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de exercício</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Standard">Padrão (séries e repetições)</SelectItem>
                        <SelectItem value="Mobilidade">Mobilidade / Alongamento (timer por step)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instruction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instruções</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva como executar o exercício..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Upload de Mídia do Exercício */}
              {isEditing && exerciseToEdit?.id && (
                <div className="space-y-2">
                  <Label>Imagem/GIF do Exercício</Label>
                  <ExerciseMediaUploader
                    exerciseId={exerciseToEdit.id}
                    currentMediaUrl={uploadedMediaUrl || undefined}
                    onMediaChange={(url) => {
                      setUploadedMediaUrl(url);
                      form.setValue("videoUrl", url || "");
                    }}
                    disabled={
                      createExercise.isPending || updateExercise.isPending
                    }
                  />
                </div>
              )}

              {!isEditing && (
                <div className="rounded-md border border-dashed p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    💡 Crie o exercício primeiro, depois você poderá adicionar
                    imagens/GIFs editando-o
                  </p>
                </div>
              )}

              {isEditing && watchedExerciseType !== "Mobilidade" && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowStepsDrawer(true)}
                >
                  <ListOrdered className="h-4 w-4 mr-2" />
                  Editar steps / sequência de movimentos
                </Button>
              )}

              {isEditing && watchedExerciseType === "Mobilidade" && (
                <div className="space-y-3 rounded-lg border border-dashed p-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <ListOrdered className="h-4 w-4" />
                      Steps / Sequência de movimentos
                    </Label>
                    {(() => {
                      const total = stepsForm
                        .watch("steps")
                        .reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0);
                      return total > 0 ? (
                        <span className="text-xs text-muted-foreground">
                          Total: {formatStepDuration(total)}
                        </span>
                      ) : null;
                    })()}
                  </div>

                  {stepsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {stepFields.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-3">
                          Nenhum step ainda. Adicione abaixo.
                        </p>
                      )}

                      {stepFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="rounded-lg border bg-card p-3 space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-xs font-semibold text-muted-foreground w-5">
                              {index + 1}.
                            </span>
                            <Input
                              placeholder="Nome do movimento"
                              {...stepsForm.register(`steps.${index}.name`)}
                              className="flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => removeStep(index)}
                              className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex gap-2 pl-7">
                            <div className="flex items-center gap-1.5 flex-1">
                              <Timer className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <Input
                                type="number"
                                min={1}
                                placeholder="Duração (seg)"
                                {...stepsForm.register(
                                  `steps.${index}.durationSeconds`,
                                  { valueAsNumber: true }
                                )}
                                className="h-8 text-sm"
                              />
                            </div>
                            <Textarea
                              placeholder="Notas opcionais..."
                              rows={1}
                              {...stepsForm.register(`steps.${index}.notes`)}
                              className="flex-[2] h-8 min-h-8 resize-none text-sm py-1.5"
                            />
                          </div>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          appendStep({
                            name: "",
                            order: stepFields.length + 1,
                            durationSeconds: undefined,
                            notes: "",
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar step
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        className="w-full"
                        disabled={replaceSteps.isPending}
                        onClick={stepsForm.handleSubmit(handleSaveSteps)}
                      >
                        {replaceSteps.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          "Salvar steps"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <Label>Músculos Primários *</Label>
                {muscleGroupsList.map((group) => (
                  <div key={group.id} className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {group.name}
                    </p>
                    <div className="grid grid-cols-2 gap-2 pl-4">
                      {group.muscles?.map((muscle) => (
                        <div
                          key={muscle.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`primary-${muscle.id}`}
                            checked={form
                              .watch("primaryMuscleIds")
                              .includes(muscle.id)}
                            onCheckedChange={() =>
                              toggleMuscle(muscle.id, true)
                            }
                          />
                          <label
                            htmlFor={`primary-${muscle.id}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {muscle.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {form.formState.errors.primaryMuscleIds && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.primaryMuscleIds.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Músculos Secundários</Label>
                {muscleGroupsList.map((group) => (
                  <div key={group.id} className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {group.name}
                    </p>
                    <div className="grid grid-cols-2 gap-2 pl-4">
                      {group.muscles?.map((muscle) => (
                        <div
                          key={muscle.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`secondary-${muscle.id}`}
                            checked={form
                              .watch("secondaryMuscleIds")
                              .includes(muscle.id)}
                            onCheckedChange={() =>
                              toggleMuscle(muscle.id, false)
                            }
                          />
                          <label
                            htmlFor={`secondary-${muscle.id}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {muscle.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Publicar exercício</FormLabel>
                      <FormDescription>
                        Outros usuários poderão ver e usar este exercício
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4 border-t">
                {isEditing && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={deleteExercise.isPending}
                    className="flex-1"
                  >
                    {/* <Trash2 className="mr-2 h-4 w-4" /> */}
                    Deletar
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    createExercise.isPending || updateExercise.isPending
                  }
                >
                  {createExercise.isPending || updateExercise.isPending
                    ? "Salvando..."
                    : isEditing
                    ? "Atualizar"
                    : "Criar"}
                </Button>
              </div>

            </form>
          </Form>
        </div>
      </DrawerContent>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar o exercício "{exerciseToEdit?.name}
              "? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteExercise.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteExercise.isPending}
            >
              {deleteExercise.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ExerciseStepsDrawer
        open={showStepsDrawer}
        onOpenChange={setShowStepsDrawer}
        exercise={exerciseToEdit ?? null}
      />
    </Drawer>
  );
}
