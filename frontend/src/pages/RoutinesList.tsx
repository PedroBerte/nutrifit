import RoutineCard from "@/components/RoutineCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetMyRoutines } from "@/services/api/routine";
import { CirclePlus } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";

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
          <p className="text-center mt-10 text-neutral-white-03">
            Nenhum plano de treino encontrado.
          </p>
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
    </motion.div>
  );
}
