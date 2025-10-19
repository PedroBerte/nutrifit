import RoutineCard from "@/components/RoutineCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetMyRoutines } from "@/services/api/routine";
import { CirclePlus } from "lucide-react";
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
      {!isLoading &&
        Array.isArray(routines?.data) &&
        routines.data.length === 0 && (
          <p className="text-center mt-10 text-neutral-white-03">
            Nenhum plano de treino encontrado.
          </p>
        )}
      {!isLoading &&
        Array.isArray(routines?.data) &&
        routines.data.map((routine) => (
          <RoutineCard
            key={routine.id}
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
    </div>
  );
}
