import { CheckCircle2, Circle, Clock, Dumbbell } from "lucide-react";
import type { WorkoutType } from "@/types/workout";
import { Button } from "./ui/button";
import { useState } from "react";
import WorkoutDetailsDrawer from "./WorkoutDetailsDrawer";

interface WorkoutItemCardProps {
  workout: WorkoutType;
}

export default function WorkoutItemCard({ workout }: WorkoutItemCardProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isCompleted = !!workout.completedAt;
  const totalSets = workout.workoutSets?.length || 0;
  const completedSets =
    workout.workoutSets?.filter((set) => set.completedAt).length || 0;

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A";
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`;
  };

  return (
    <>
      <div
        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
          isCompleted
            ? "border-primary/50 bg-primary/5"
            : "border-neutral-dark-02 hover:border-primary/30"
        }`}
      >
        <div className="flex items-center gap-3 flex-1">
          {isCompleted ? (
            <CheckCircle2 size={24} className="text-primary flex-shrink-0" />
          ) : (
            <Circle size={24} className="text-muted-foreground flex-shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{workout.title}</p>
            {workout.description && (
              <p className="text-xs text-muted-foreground truncate">
                {workout.description}
              </p>
            )}

            <div className="flex gap-4 mt-1">
              {workout.expectedDuration && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={12} />
                  <span>{formatDuration(workout.expectedDuration)}</span>
                </div>
              )}
              {totalSets > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Dumbbell size={12} />
                  <span>
                    {completedSets}/{totalSets} exercícios
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Button
          size="sm"
          variant={isCompleted ? "outline" : "default"}
          onClick={() => setIsDrawerOpen(true)}
          className="ml-2"
        >
          {isCompleted ? "Ver" : "Iniciar"}
        </Button>
      </div>

      <WorkoutDetailsDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        workoutId={workout.id}
      />
    </>
  );
}
