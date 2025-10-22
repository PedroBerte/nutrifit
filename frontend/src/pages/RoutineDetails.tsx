import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetRoutineById, useUpdateRoutine } from "@/services/api/routine";
import { useGetWorkoutsByRoutine } from "@/services/api/workout";
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
import { Calendar, Plus, Edit, Settings, FileX2 } from "lucide-react";
import { GOAL_OPTIONS, DIFFICULTY_OPTIONS } from "@/constants/routine";
import { Spinner } from "@/components/ui/spinner";

const WEEK_OPTIONS = [
  { value: 4, label: "4 semanas (1 mês)" },
  { value: 8, label: "8 semanas (2 meses)" },
  { value: 12, label: "12 semanas (3 meses)" },
  { value: 16, label: "16 semanas (4 meses)" },
  { value: 24, label: "24 semanas (6 meses)" },
];

const updateRoutineSchema = z.object({
  title: z
    .string()
    .min(1, "O título é obrigatório")
    .max(200, "Título muito longo"),
  goal: z.string().optional(),
  difficulty: z.string().optional(),
  weeks: z.number().optional(),
});

type UpdateRoutineFormData = z.infer<typeof updateRoutineSchema>;

export default function RoutineDetails() {
  const navigate = useNavigate();
  const { routineId } = useParams<{ routineId: string }>();
  const { data: routine, isLoading: loadingRoutine } =
    useGetRoutineById(routineId);
  const { data: workouts, isLoading: loadingWorkouts } =
    useGetWorkoutsByRoutine(routineId);
  const updateRoutine = useUpdateRoutine();
  const [isWeeksDrawerOpen, setIsWeeksDrawerOpen] = useState(false);

  const form = useForm<UpdateRoutineFormData>({
    resolver: zodResolver(updateRoutineSchema),
    defaultValues: {
      title: "",
      goal: "",
      difficulty: "",
      weeks: undefined,
    },
  });

  useEffect(() => {
    if (routine?.data) {
      form.reset({
        title: routine.data.title || "",
        goal: routine.data.goal || "",
        difficulty: routine.data.difficulty || "",
        weeks: routine.data.weeks || undefined,
      });
    }
  }, [routine]);

  const handleSubmit = async (data: UpdateRoutineFormData) => {
    if (!routineId) return;

    try {
      const response = await updateRoutine.mutateAsync({
        routineId,
        data: {
          title: data.title.trim(),
          goal: data.goal || "",
          difficulty: data.difficulty || "",
          weeks: data.weeks,
        },
      });

      if (response.success) {
        alert("Rotina atualizada com sucesso!");
      } else {
        alert(response.message || "Erro ao atualizar rotina");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao atualizar rotina";
      alert(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleNewWorkout = () => {
    navigate(`/routines/${routineId}/workouts/new`);
  };

  const handleEditWorkout = (workoutId: string) => {
    navigate(`/routines/${routineId}/workouts/${workoutId}`);
  };

  const selectedWeeks = form.watch("weeks");
  const selectedWeekLabel = WEEK_OPTIONS.find(
    (opt) => opt.value === selectedWeeks
  )?.label;

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
                        placeholder="Nome do treino"
                        maxLength={200}
                        {...field}
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um objetivo" />
                        </SelectTrigger>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nível */}
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger value={field.value} className="w-full">
                          <SelectValue placeholder="Selecione um nível" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DIFFICULTY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Semanas */}
              <FormField
                control={form.control}
                name="weeks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semanas</FormLabel>
                    <Drawer
                      open={isWeeksDrawerOpen}
                      onOpenChange={setIsWeeksDrawerOpen}
                    >
                      <DrawerTrigger asChild className="bg-transparent">
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 size-4" />
                            {selectedWeekLabel || "Selecione a duração"}
                          </Button>
                        </FormControl>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Selecione a duração</DrawerTitle>
                        </DrawerHeader>
                        <div className="p-4 space-y-2">
                          {WEEK_OPTIONS.map((option) => (
                            <DrawerClose asChild key={option.value}>
                              <Button
                                type="button"
                                variant={
                                  selectedWeeks === option.value
                                    ? "default"
                                    : "outline"
                                }
                                className="w-full justify-start"
                                onClick={() => {
                                  field.onChange(option.value);
                                  setIsWeeksDrawerOpen(false);
                                }}
                              >
                                {option.label}
                              </Button>
                            </DrawerClose>
                          ))}
                        </div>
                      </DrawerContent>
                    </Drawer>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Botões de ação */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  className="flex-1 bg-primary-green-01 hover:bg-primary-green-02"
                  onClick={handleCancel}
                  disabled={updateRoutine.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateRoutine.isPending}
                  className="flex-1"
                >
                  {updateRoutine.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </section>

      {/* Seção de Treinos */}
      <section className="bg-neutral-dark-03 w-full p-3 mt-5 rounded-sm">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-white-01">
            Treinos
          </h1>
          <Button onClick={handleNewWorkout}>
            <Plus /> Adicionar Treino
          </Button>
        </div>

        {loadingWorkouts && (
          <div className="flex flex-col items-center gap-1 w-full text-neutral-white-02 text-sm p-3">
            <Spinner />
            <p className="text-center text-neutral-white-03">
              Carregando treinos...
            </p>
          </div>
        )}

        {!loadingWorkouts && workouts?.data && workouts.data.length === 0 && (
          <div className="flex flex-col items-center gap-1 w-full text-neutral-white-02 text-sm p-3">
            <FileX2 />
            <p className="text-center text-neutral-white-03">
              Nenhum treino adicionado ainda.
            </p>
          </div>
        )}

        {!loadingWorkouts && workouts?.data && workouts.data.length > 0 && (
          <div className="space-y-3">
            {workouts.data.map((workout) => (
              <div
                key={workout.id}
                className="bg-neutral-dark-01 p-4 rounded-sm flex items-center justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-neutral-white-01">
                    {workout.title}
                  </h3>
                  {workout.description && (
                    <p className="text-sm text-neutral-white-03 mt-1">
                      {workout.description}
                    </p>
                  )}
                </div>
                <Button
                  variant={"ghost"}
                  size="sm"
                  onClick={() => handleEditWorkout(workout.id)}
                >
                  <Settings className="size-5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
