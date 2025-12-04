import React from "react";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { GOAL_OPTIONS, DIFFICULTY_OPTIONS } from "@/constants/routine";
import { useToast } from "@/contexts/ToastContext";
import { motion } from "motion/react";

const createRoutineSchema = z.object({
  title: z
    .string()
    .min(1, "O título é obrigatório")
    .max(200, "Título muito longo"),
  goal: z.string().optional(),
  difficulty: z.string().optional(),
});

type CreateRoutineFormData = z.infer<typeof createRoutineSchema>;

export default function NewRoutine() {
  const navigate = useNavigate();
  const createRoutine = useCreateRoutine();
  const toast = useToast();

  const form = useForm<CreateRoutineFormData>({
    resolver: zodResolver(createRoutineSchema),
    defaultValues: {
      title: "",
      goal: undefined,
      difficulty: undefined,
    },
  });

  const handleSubmit = async (data: CreateRoutineFormData) => {
    try {
      const response = await createRoutine.mutateAsync({
        title: data.title.trim(),
        goal: data.goal || undefined,
        difficulty: data.difficulty || undefined,
      });

      if (response.success) {
        toast.success("Rotina criada com sucesso!");
        navigate("/routines");
      } else {
        toast.error(response.message || "Erro ao criar rotina");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao criar rotina";
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex h-full items-center"
    >
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
    </motion.div>
  );
}
