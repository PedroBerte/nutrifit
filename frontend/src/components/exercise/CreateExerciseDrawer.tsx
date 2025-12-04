import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateExercise,
  useUpdateExercise,
  useGetExerciseCategories,
  useGetMuscleGroups,
  useDeleteExercise,
} from "@/services/api/exercise";
import type { ExerciseType } from "@/types/exercise";
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
import { Trash2, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ExerciseMediaUploader } from "./ExerciseMediaUploader";

const exerciseSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  instruction: z.string(),
  videoUrl: z.string(),
  isPublished: z.boolean(),
  primaryMuscleIds: z
    .array(z.string())
    .min(1, "Selecione pelo menos um músculo primário"),
  secondaryMuscleIds: z.array(z.string()),
});

type ExerciseForm = z.infer<typeof exerciseSchema>;

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

  const { data: categories } = useGetExerciseCategories();
  const { data: muscleGroups } = useGetMuscleGroups();
  const createExercise = useCreateExercise();
  const updateExercise = useUpdateExercise(exerciseToEdit?.id || "");
  const deleteExercise = useDeleteExercise();

  const isEditing = !!exerciseToEdit;

  const form = useForm<ExerciseForm>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      instruction: "",
      videoUrl: "",
      isPublished: false,
      primaryMuscleIds: [],
      secondaryMuscleIds: [],
    },
  });

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

              <div className="space-y-3">
                <Label>Músculos Primários *</Label>
                {muscleGroups?.data?.map((group) => (
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
                {muscleGroups?.data?.map((group) => (
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
    </Drawer>
  );
}
