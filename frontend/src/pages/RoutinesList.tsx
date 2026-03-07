import RoutineCard from "@/components/RoutineCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetMyRoutines, useImportRoutine } from "@/services/api/routine";
import { CirclePlus, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo, useRef, type ChangeEvent } from "react";
import PersonalSemPlanosTreino from "@/assets/personal/PersonalSemPlanosTreino.png";
import { useToast } from "@/contexts/ToastContext";
import { useQueryClient } from "@tanstack/react-query";
import type { RoutineImportPayload } from "@/types/routine";

export default function RoutinesList() {
  const navigate = useNavigate();
  const { data: routines, isLoading } = useGetMyRoutines();
  const importRoutine = useImportRoutine();
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");

  const filteredRoutines = useMemo(() => {
    const items = Array.isArray(routines?.data?.items) ? routines.data.items : [];
    if (!search.trim()) return items;
    return items.filter((routine) =>
      routine.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [routines, search]);

  const handleOpenImportPicker = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const payload = JSON.parse(text) as RoutineImportPayload;

      if (!payload.workouts || !Array.isArray(payload.workouts) || payload.workouts.length === 0) {
        toast.error("JSON inválido: a propriedade workouts é obrigatória.");
        return;
      }

      const response = await importRoutine.mutateAsync({ payload });
      const result = response.data;

      queryClient.invalidateQueries({ queryKey: ["getMyRoutines"] });

      const pendingCount = result?.pendingExercises?.length ?? 0;
      if (pendingCount > 0) {
        toast.warning(
          `Rotina importada com ${pendingCount} exercício(s) pendente(s). Revise no editor de treinos.`
        );
      } else {
        toast.success("Rotina importada com sucesso!");
      }

      if (result?.routineId) {
        navigate(`/routines/${result.routineId}`);
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao importar rotina.";
      toast.error(errorMessage);
    } finally {
      event.target.value = "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-1 py-4 flex-col gap-3"
    >
      <p className="font-bold text-2xl">Planos de Treinos</p>
      <div className="flex flex-1 gap-3">
        <Input
          className="border-none bg-neutral-dark-03 max-h-full"
          placeholder="Pesquisar"
          maxLength={100}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => navigate("/routines/new")}>
          <CirclePlus /> Novo
        </Button>
        <Button
          variant="outline"
          onClick={handleOpenImportPicker}
          disabled={importRoutine.isPending}
        >
          <Upload /> {importRoutine.isPending ? "Importando..." : "Importar JSON"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleImportFile}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-3"
      >
        {!isLoading && filteredRoutines.length === 0 && (
          <div className="flex flex-col w-full bg-neutral-dark-03 rounded-sm justify-center items-center py-2 gap-2">
            <p className="text-muted-foreground pt-4">
              Nenhum plano de treino encontrado
            </p>
            <img
              src={PersonalSemPlanosTreino}
              alt="Nenhum atendimento agendado"
              className="w-36 object-contain"
            />
          </div>
        )}
        {!isLoading &&
          filteredRoutines.map((routine) => (
            <RoutineCard
              key={routine.id}
              id={routine.id}
              title={routine.title}
              difficulty={routine.difficulty || ""}
              goal={routine.goal || ""}
            />
          ))}
        {isLoading && (
          <p className="text-center mt-10 text-neutral-white-03">
            Carregando planos de treino...
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
