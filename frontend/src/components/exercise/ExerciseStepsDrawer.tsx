import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetExerciseSteps,
  useReplaceExerciseSteps,
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
  DrawerDescription,
} from "@/components/ui/drawer";
import { useToast } from "@/contexts/ToastContext";
import { Loader2, Plus, Trash2, GripVertical, Timer, ListOrdered } from "lucide-react";

const stepSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  order: z.number().int().min(1),
  durationSeconds: z.number().int().min(1).optional(),
  notes: z.string().optional(),
});

const stepsFormSchema = z.object({
  steps: z.array(stepSchema),
});

type StepsForm = z.infer<typeof stepsFormSchema>;

interface ExerciseStepsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: ExerciseType | null;
}

export function ExerciseStepsDrawer({
  open,
  onOpenChange,
  exercise,
}: ExerciseStepsDrawerProps) {
  const toast = useToast();
  const exerciseId = exercise?.id ?? "";

  const { data: stepsData, isLoading } = useGetExerciseSteps(exerciseId || null);
  const replaceSteps = useReplaceExerciseSteps(exerciseId);

  const form = useForm<StepsForm>({
    resolver: zodResolver(stepsFormSchema),
    defaultValues: { steps: [] },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  // Populate form when steps load
  useEffect(() => {
    if (open && stepsData?.data) {
      const loaded = stepsData.data.map((s) => ({
        name: s.name,
        order: s.order,
        durationSeconds: s.durationSeconds,
        notes: s.notes ?? "",
      }));
      form.reset({ steps: loaded });
    }
    if (!open) {
      form.reset({ steps: [] });
    }
  }, [open, stepsData]);

  const handleSave = async (data: StepsForm) => {
    try {
      const steps = data.steps.map((s, i) => ({
        name: s.name,
        order: i + 1,
        durationSeconds: s.durationSeconds != null && !isNaN(s.durationSeconds) ? s.durationSeconds : undefined,
        notes: s.notes || undefined,
      }));
      await replaceSteps.mutateAsync({ steps });
      toast.success("Steps salvos com sucesso!");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "Erro ao salvar steps"
      );
    }
  };

  const addStep = () => {
    append({
      name: "",
      order: fields.length + 1,
      durationSeconds: undefined,
      notes: "",
    });
  };

  const totalDuration = form.watch("steps").reduce((sum, s) => {
    return sum + (s.durationSeconds ?? 0);
  }, 0);

  const formatDuration = (secs: number) => {
    if (secs === 0) return null;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    if (s === 0) return `${m}min`;
    return `${m}min ${s}s`;
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92dvh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <ListOrdered className="h-5 w-5" />
            Steps — {exercise?.name}
          </DrawerTitle>
          <DrawerDescription>
            Sequência de movimentos que compõem este exercício. Cada step pode
            ter um tempo e uma nota.
            {totalDuration > 0 && (
              <span className="ml-2 font-medium text-foreground">
                · Total: {formatDuration(totalDuration)}
              </span>
            )}
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-3">
              {fields.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-6">
                  Nenhum step ainda. Adicione abaixo.
                </p>
              )}

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border bg-card p-3 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-xs font-semibold text-muted-foreground w-5">
                      {index + 1}.
                    </span>
                    <Input
                      placeholder="Nome do movimento (ex: Joelho pra frente — perna esq.)"
                      {...form.register(`steps.${index}.name`)}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
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
                        {...form.register(`steps.${index}.durationSeconds`, {
                          valueAsNumber: true,
                        })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <Textarea
                      placeholder="Notas opcionais..."
                      rows={1}
                      {...form.register(`steps.${index}.notes`)}
                      className="flex-[2] h-8 min-h-8 resize-none text-sm py-1.5"
                    />
                  </div>

                  {form.formState.errors.steps?.[index]?.name && (
                    <p className="text-xs text-destructive pl-7">
                      {form.formState.errors.steps[index]?.name?.message}
                    </p>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addStep}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar step
              </Button>

              <div className="flex gap-3 pt-2 border-t">
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
                  disabled={replaceSteps.isPending}
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
            </form>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
