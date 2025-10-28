import {
  ChartColumnBig,
  Target,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { getDifficultyLabel, getGoalLabel } from "@/constants/routine";
import type { RoutineType } from "@/types/routine";
import { useGetWorkoutsByRoutine } from "@/services/api/workout";
import WorkoutItemCard from "./WorkoutItemCard";

interface AssignedRoutineCardProps {
  routine: RoutineType;
}

export default function AssignedRoutineCard({
  routine,
}: AssignedRoutineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: workoutsResponse, isLoading } = useGetWorkoutsByRoutine(
    isExpanded ? routine.id : null
  );

  const workouts = workoutsResponse?.data || [];

  return (
    <div className="w-full bg-neutral-dark-03 rounded-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xl font-bold">{routine.title}</p>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-neutral-dark-02 rounded-full transition-colors"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <article className="space-y-2">
        {routine.difficulty && (
          <section className="flex gap-2 items-center">
            <ChartColumnBig size={18} />
            <p className="font-bold text-sm">Dificuldade:</p>
            <p className="text-sm">{getDifficultyLabel(routine.difficulty)}</p>
          </section>
        )}
        {routine.goal && (
          <section className="flex gap-2 items-center">
            <Target size={18} />
            <p className="font-bold text-sm">Objetivo:</p>
            <p className="text-sm">{getGoalLabel(routine.goal)}</p>
          </section>
        )}
        {routine.weeks && (
          <section className="flex gap-2 items-center">
            <Calendar size={18} />
            <p className="font-bold text-sm">Duração:</p>
            <p className="text-sm">{routine.weeks} semanas</p>
          </section>
        )}
      </article>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-neutral-dark-02 space-y-3">
          {isLoading && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Carregando treinos...
            </p>
          )}

          {!isLoading && workouts.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Nenhum treino cadastrado nesta rotina ainda.
            </p>
          )}

          {!isLoading &&
            workouts.map((workout) => (
              <WorkoutItemCard key={workout.id} workout={workout} />
            ))}
        </div>
      )}
    </div>
  );
}
