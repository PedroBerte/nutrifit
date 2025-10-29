import { Clock, Dumbbell } from "lucide-react";
import type { WorkoutTemplateResponse } from "@/services/api/workoutTemplate";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

interface WorkoutItemCardProps {
  workout: WorkoutTemplateResponse;
}

export default function WorkoutItemCard({ workout }: WorkoutItemCardProps) {
  const navigate = useNavigate();
  const totalExercises = workout.exerciseTemplates?.length || 0;

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A";
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`;
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-dark-02 hover:border-primary/30 transition-all">
      <div className="flex items-center gap-3 flex-1">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{workout.title}</p>
          {workout.description && (
            <p className="text-xs text-muted-foreground truncate">
              {workout.description}
            </p>
          )}

          <div className="flex gap-4 mt-1">
            {workout.estimatedDurationMinutes && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={12} />
                <span>{formatDuration(workout.estimatedDurationMinutes)}</span>
              </div>
            )}
            {totalExercises > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Dumbbell size={12} />
                <span>{totalExercises} exercícios</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Button
        size="sm"
        variant="default"
        onClick={() => navigate(`/workout/session/${workout.id}`)}
        className="ml-2"
      >
        Ver
      </Button>
    </div>
  );
}
