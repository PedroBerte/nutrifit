import RoutineCard from "@/components/RoutineCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetMyRoutines } from "@/services/api/routine";
import { CirclePlus } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import PersonalSemPlanosTreino from "@/assets/personal/PersonalSemPlanosTreino.png";

export default function RoutinesList() {
  const navigate = useNavigate();
  const { data: routines, isLoading } = useGetMyRoutines();
  const [search, setSearch] = useState("");

  const filteredRoutines = useMemo(() => {
    if (!routines?.data?.items) return [];
    if (!search.trim()) return routines.data.items;
    return routines.data.items.filter((routine) =>
      routine.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [routines, search]);

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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => navigate("/routines/new")}>
          <CirclePlus /> Novo
        </Button>
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
              weeks={routine.weeks || 0}
            />
          ))}
        {isLoading && (
          <p className="text-center mt-10 text-neutral-white-03">
            Carregando planos de treino...
          </p>
        )}
      </motion.div>
    </motion.div >
  );
}
