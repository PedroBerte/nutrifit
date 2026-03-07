import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetRoutineById, useUpdateRoutine } from "@/services/api/routine";
import { useGetWorkoutTemplatesByRoutine } from "@/services/api/workoutTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Settings, FileX2, Loader2 } from "lucide-react";
import {
  GOAL_OPTIONS,
  DIFFICULTY_OPTIONS,
  getGoalLabel,
  getDifficultyLabel,
} from "@/constants/routine";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "motion/react";
import { useToast } from "@/contexts/ToastContext";

const updateRoutineSchema = z.object({
  title: z.string().max(200, "Título muito longo").optional(),
  goal: z.string().optional(),
  difficulty: z.string().optional(),
});

type UpdateRoutineFormData = z.infer<typeof updateRoutineSchema>;

export default function RoutineDetails() {
  const navigate = useNavigate();
  const { routineId } = useParams<{ routineId: string }>();
  const { data: routine, isLoading: loadingRoutine } =
    useGetRoutineById(routineId);
  const { data: templates, isLoading: loadingTemplates } =
    useGetWorkoutTemplatesByRoutine(routineId);
  const updateRoutine = useUpdateRoutine();
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] =
    useState<UpdateRoutineFormData | null>(null);
  const toast = useToast();

  const form = useForm<UpdateRoutineFormData>({
    resolver: zodResolver(updateRoutineSchema),
  });

  useEffect(() => {
    if (routine?.data) {
      const formData = {
        title: routine.data.title || "",
        goal: routine.data.goal || "",
        difficulty: routine.data.difficulty || "",
      };
      form.reset({ title: "", goal: "", difficulty: "" }, { keepDefaultValues: false });
      setOriginalData(formData); // Guarda os dados originais
      setHasChanges(false); // Reseta o estado de mudanças
    }
  }, [routine?.data, form]);

  // Observa mudanças no formulário
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!originalData) return;

      const titleChanged = !!values.title?.trim() && values.title.trim() !== originalData.title;
      const goalChanged = !!values.goal && values.goal !== originalData.goal;
      const difficultyChanged =
        !!values.difficulty && values.difficulty !== originalData.difficulty;

      // Exibe ações apenas quando houver alterações reais digitadas/selecionadas.
      const isDifferent = titleChanged || goalChanged || difficultyChanged;

      setHasChanges(isDifferent);
    });
    return () => subscription.unsubscribe();
  }, [form, originalData]);

  const handleSubmit = async (data: UpdateRoutineFormData) => {
    if (!routineId) return;

    try {
      const title = data.title?.trim() || originalData?.title || "";
      const goal = data.goal || originalData?.goal || undefined;
      const difficulty = data.difficulty || originalData?.difficulty || undefined;

      if (!title) {
        toast.error("Título é obrigatório");
        return;
      }

      const response = await updateRoutine.mutateAsync({
        routineId,
        data: {
          title,
          goal,
          difficulty,
        },
      });

      if (response.success) {
        // Atualiza os dados originais após salvar
        setOriginalData({ title, goal: goal || "", difficulty: difficulty || "" });
        form.reset({ title: "", goal: "", difficulty: "" });
        setHasChanges(false);
        toast.success("Alterações salvas com sucesso!");
      } else {
        toast.error(response.message || "Erro ao salvar alterações");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao salvar alterações";
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    form.reset({ title: "", goal: "", difficulty: "" });
    setHasChanges(false);
  };

  const handleNewWorkout = () => {
    navigate(`/routines/${routineId}/workouts/new`);
  };

  const handleEditWorkout = (workoutId: string) => {
    navigate(`/routines/${routineId}/workouts/${workoutId}`);
  };

  if (loadingRoutine) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-neutral-white-03">Carregando...</p>
      </div>
    );
  }

  if (!routine?.data) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-neutral-white-03">Rotina não encontrada</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <section className="bg-neutral-dark-01 w-full">
          <div className="mx-auto w-full bg-neutral-dark-03 p-3 rounded-sm mt-5">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-neutral-white-01">
                Editar Plano de Treino
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
                          placeholder={originalData?.title || "Nome do treino"}
                          maxLength={200}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Objetivo */}
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Objetivo</FormLabel>
                        <Select
                          value={field.value || undefined}
                          onValueChange={(value) => {
                            console.log("✏️ Goal mudou para:", value);
                            field.onChange(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={
                                  originalData?.goal
                                    ? getGoalLabel(originalData.goal)
                                    : "Selecione um objetivo"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {GOAL_OPTIONS.map((option) => {
                              return (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Nível */}
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => {
                    console.log(
                      "🎨 Renderizando Difficulty - Valor atual:",
                      field.value
                    );
                    return (
                      <FormItem>
                        <FormLabel>Nível</FormLabel>
                        <Select
                          value={field.value || undefined}
                          onValueChange={(value) => {
                            console.log("✏️ Difficulty mudou para:", value);
                            field.onChange(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={
                                  originalData?.difficulty
                                    ? getDifficultyLabel(originalData.difficulty)
                                    : "Selecione um nível"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem key={"BEG"} value={"BEG"}>
                              Iniciante
                            </SelectItem>
                            <SelectItem key={"INT"} value={"INT"}>
                              Intermediário
                            </SelectItem>
                            <SelectItem key={"ADV"} value={"ADV"}>
                              Avançado
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Botões aparecem apenas quando há mudanças */}
                {hasChanges && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-3 pt-4"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={updateRoutine.isPending}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateRoutine.isPending}
                      className="flex-1"
                    >
                      {updateRoutine.isPending ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={16} />
                          Salvando...
                        </>
                      ) : (
                        "Salvar"
                      )}
                    </Button>
                  </motion.div>
                )}
              </form>
            </Form>
          </div>
        </section>
      </motion.div>

      {/* Seção de Treinos */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <section className="bg-neutral-dark-03 w-full p-3 mt-5 rounded-sm">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-neutral-white-01">
              Treinos
            </h1>
            <Button onClick={handleNewWorkout}>
              <Plus /> Adicionar Treino
            </Button>
          </div>

          {loadingTemplates && (
            <div className="flex flex-col items-center gap-1 w-full text-neutral-white-02 text-sm p-3">
              <Spinner />
              <p className="text-center text-neutral-white-03">
                Carregando treinos...
              </p>
            </div>
          )}

          {!loadingTemplates &&
            templates?.data &&
            templates.data.length === 0 && (
              <div className="flex flex-col items-center gap-1 w-full text-neutral-white-02 text-sm p-3">
                <FileX2 />
                <p className="text-center text-neutral-white-03">
                  Nenhum treino adicionado ainda.
                </p>
              </div>
            )}

          {!loadingTemplates &&
            templates?.data &&
            templates.data.length > 0 && (
              <div className="space-y-3">
                {templates.data.map((template) => (
                  <div
                    key={template.id}
                    className="bg-neutral-dark-01 p-4 rounded-sm flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-white-01">
                        {template.title}
                      </h3>
                      {template.description && (
                        <p className="text-sm text-neutral-white-03 mt-1">
                          {template.description}
                        </p>
                      )}
                      <p className="text-xs text-neutral-white-03 mt-1">
                        {template.exerciseTemplates?.length || 0} exercícios
                        {template.estimatedDurationMinutes &&
                          ` • ${template.estimatedDurationMinutes} min`}
                      </p>
                    </div>
                    <Button
                      variant={"ghost"}
                      size="sm"
                      onClick={() => handleEditWorkout(template.id)}
                    >
                      <Settings className="size-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
        </section>
      </motion.div>
    </div>
  );
}
