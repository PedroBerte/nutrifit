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
import { Trash2, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";

const exerciseSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  instruction: z.string(),
  imageUrl: z.string(),
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
  const [imagePreview, setImagePreview] = useState<string>("");

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
      imageUrl: "",
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
        imageUrl: exerciseToEdit.imageUrl || "",
        isPublished: exerciseToEdit.isPublished || false,
        primaryMuscleIds: primaryIds,
        secondaryMuscleIds: secondaryIds,
      });

      if (exerciseToEdit.imageUrl) {
        setImagePreview(exerciseToEdit.imageUrl);
      }
    } else if (!open) {
      form.reset();
      setImagePreview("");
    }
  }, [exerciseToEdit, open, form, categories, muscleGroups]);

  const handleSubmit = async (data: ExerciseForm) => {
    try {
      if (isEditing) {
        await updateExercise.mutateAsync(data);
        toast.success("Exercício atualizado com sucesso!");
      } else {
        await createExercise.mutateAsync(data);
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

    if (!confirm("Tem certeza que deseja deletar este exercício?")) return;

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
      <DrawerContent>
        <DrawerHeader className="border-b">
          <DrawerTitle>
            {isEditing ? "Editar Exercício" : "Novo Exercício"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
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

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagem do Exercício</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="URL da imagem (temporário - Minio em breve)"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setImagePreview(e.target.value);
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                        {imagePreview && (
                          <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              onError={() => setImagePreview("")}
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload de imagem será implementado em breve
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                    onClick={handleDelete}
                    disabled={deleteExercise.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
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
    </Drawer>
  );
}
