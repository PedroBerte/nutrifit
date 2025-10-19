import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Calendar, X } from "lucide-react";
import { GOAL_OPTIONS, DIFFICULTY_OPTIONS } from "@/constants/routine";

const WEEK_OPTIONS = [
  { value: 4, label: "4 semanas (1 mês)" },
  { value: 8, label: "8 semanas (2 meses)" },
  { value: 12, label: "12 semanas (3 meses)" },
  { value: 16, label: "16 semanas (4 meses)" },
  { value: 24, label: "24 semanas (6 meses)" },
];

export default function NewRoutine() {
  const navigate = useNavigate();
  const createRoutine = useCreateRoutine();

  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [weeks, setWeeks] = useState<number | undefined>(undefined);
  const [isWeeksDrawerOpen, setIsWeeksDrawerOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("O título é obrigatório");
      return;
    }

    try {
      const response = await createRoutine.mutateAsync({
        title: title.trim(),
        goal: goal || undefined,
        difficulty: difficulty || undefined,
        weeks: weeks,
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

  const selectedWeekLabel = WEEK_OPTIONS.find(
    (opt) => opt.value === weeks
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Título */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-neutral-white-01"
              >
                Título
              </label>
              <Input
                id="title"
                placeholder="Nome do treino"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
              />
            </div>

            {/* Objetivo */}
            <div className="space-y-2">
              <label
                htmlFor="goal"
                className="text-sm font-medium text-neutral-white-01"
              >
                Objetivo
              </label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um objetivo" />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nível */}
            <div className="space-y-2">
              <label
                htmlFor="difficulty"
                className="text-sm font-medium text-neutral-white-01"
              >
                Nível
              </label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um nível" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Semanas */}
            <div className="space-y-2">
              <label
                htmlFor="weeks"
                className="text-sm font-medium text-neutral-white-01"
              >
                Semanas
              </label>
              <Drawer
                open={isWeeksDrawerOpen}
                onOpenChange={setIsWeeksDrawerOpen}
              >
                <DrawerTrigger asChild className="bg-transparent">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 size-4" />
                    {selectedWeekLabel || "Selecione a duração"}
                  </Button>
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
                            weeks === option.value ? "default" : "outline"
                          }
                          className="w-full justify-start"
                          onClick={() => {
                            setWeeks(option.value);
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
            </div>

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
        </div>
      </section>
    </div>
  );
}
