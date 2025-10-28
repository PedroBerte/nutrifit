import RoutineCard from "@/components/RoutineCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetMyRoutines } from "@/services/api/routine";
import { CirclePlus } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function RoutinesList() {
  const navigate = useNavigate();
  const { data: routines, isLoading } = useGetMyRoutines();

  return (
    <div className="flex flex-1 py-4 flex-col gap-3">
      <p className="font-bold text-2xl">Planos de Treinos</p>
      <div className="flex flex-1 gap-3">
        <Input
          className="border-none bg-neutral-dark-03 max-h-full"
          placeholder="Pesquisar"
        />
        <Button onClick={() => navigate("/routines/new")}>
          <CirclePlus /> Novo
        </Button>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        {!isLoading &&
          routines?.data?.items &&
          routines.data.items.length === 0 && (
            <p className="text-center mt-10 text-neutral-white-03">
              Nenhum plano de treino encontrado.
            </p>
          )}
        {!isLoading &&
          routines?.data?.items &&
          routines.data.items.map((routine) => (
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
    </div>
  );
}
