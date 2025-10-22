import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateRoutine } from "@/services/api/routine";
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
import { Calendar } from "lucide-react";
import { GOAL_OPTIONS, DIFFICULTY_OPTIONS } from "@/constants/routine";

const WEEK_OPTIONS = [
  { value: 4, label: "4 semanas (1 mês)" },
  { value: 8, label: "8 semanas (2 meses)" },
  { value: 12, label: "12 semanas (3 meses)" },
  { value: 16, label: "16 semanas (4 meses)" },
  { value: 24, label: "24 semanas (6 meses)" },
];

const createRoutineSchema = z.object({
  title: z
    .string()
    .min(1, "O título é obrigatório")
    .max(200, "Título muito longo"),
  goal: z.string().optional(),
  difficulty: z.string().optional(),
  weeks: z.number().optional(),
});

type CreateRoutineFormData = z.infer<typeof createRoutineSchema>;

export default function NewRoutine() {
  const navigate = useNavigate();
  const createRoutine = useCreateRoutine();
  const [isWeeksDrawerOpen, setIsWeeksDrawerOpen] = useState(false);

  const form = useForm<CreateRoutineFormData>({
    resolver: zodResolver(createRoutineSchema),
    defaultValues: {
      title: "",
      goal: undefined,
      difficulty: undefined,
      weeks: undefined,
    },
  });

  const handleSubmit = async (data: CreateRoutineFormData) => {
    try {
      const response = await createRoutine.mutateAsync({
        title: data.title.trim(),
        goal: data.goal || undefined,
        difficulty: data.difficulty || undefined,
        weeks: data.weeks,
      });

      if (response.success) {
        alert("Rotina criada com sucesso!");
        navigate("/routines");
      } else {
        alert(response.message || "Erro ao criar rotina");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao criar rotina";
      alert(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const selectedWeeks = form.watch("weeks");
  const selectedWeekLabel = WEEK_OPTIONS.find(
    (opt) => opt.value === selectedWeeks
  )?.label;

  return (
    <div className="flex h-full items-center">
      <section className="bg-neutral-dark-01 w-full">
        <div className="mx-auto w-full bg-neutral-dark-03 p-3 rounded-sm mt-5">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-neutral-white-01">
              Novo Plano de Treino
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um objetivo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GOAL_OPTIONS.map((option) => (
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

              {/* Nível */}
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
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
                  disabled={createRoutine.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createRoutine.isPending}
                  className="flex-1"
                >
                  {createRoutine.isPending ? "Criando..." : "Criar"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </section>
    </div>
  );
}
