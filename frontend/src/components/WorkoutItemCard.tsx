import { Clock, Dumbbell, AlertTriangle } from "lucide-react";
import type { WorkoutTemplateResponse } from "@/services/api/workoutTemplate";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { useNavigate } from "react-router-dom";
import {
  getActiveWorkoutInfo,
  clearLocalWorkout,
} from "@/services/localWorkoutSession";
import { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";

interface WorkoutItemCardProps {
  workout: WorkoutTemplateResponse;
}

export default function WorkoutItemCard({ workout }: WorkoutItemCardProps) {
  const navigate = useNavigate();
  const toast = useToast();

  const [activeWorkoutInfo, setActiveWorkoutInfo] =
    useState<ReturnType<typeof getActiveWorkoutInfo>>(null);
  const [showDiscardSheet, setShowDiscardSheet] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Verifica localStorage a cada render
  useEffect(() => {
    setActiveWorkoutInfo(getActiveWorkoutInfo());
  }, []);

  const totalExercises = workout.exerciseTemplates?.length || 0;

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A";
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`;
  };

  const handleViewClick = () => {
    // Se tem treino ativo e não é o mesmo template
    if (
      activeWorkoutInfo &&
      activeWorkoutInfo.workoutTemplateId !== workout.id
    ) {
      setShowDiscardSheet(true);
    } else if (
      activeWorkoutInfo &&
      activeWorkoutInfo.workoutTemplateId === workout.id
    ) {
      // É o mesmo treino ativo, continua
      navigate(`/workout/session/${workout.id}`);
    } else {
      // Sem treino ativo, inicia novo
      navigate(`/workout/session/${workout.id}`);
    }
  };

  const handleDiscardAndStart = async () => {
    if (!activeWorkoutInfo) return;

    setIsCanceling(true);
    try {
      clearLocalWorkout();
      toast.info("Treino anterior cancelado");
      setShowDiscardSheet(false);
      // Inicia novo treino
      navigate(`/workout/session/${workout.id}`);
    } catch (error: any) {
      console.error("Erro ao cancelar treino", error);
      toast.error("Erro ao cancelar treino anterior");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleContinueCurrent = () => {
    if (!activeWorkoutInfo) return;
    setShowDiscardSheet(false);
    navigate(`/workout/session/${activeWorkoutInfo.workoutTemplateId}`);
  };

  return (
    <>
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
                  <span>
                    {formatDuration(workout.estimatedDurationMinutes)}
                  </span>
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
          onClick={handleViewClick}
          className="ml-2"
        >
          Ver
        </Button>
      </div>

      {/* Sheet de confirmação */}
      <Sheet open={showDiscardSheet} onOpenChange={setShowDiscardSheet}>
        <SheetContent side="bottom" className="max-h-[80vh]">
          <SheetHeader>
            <div className="flex items-center gap-2 text-yellow-500 mb-2">
              <AlertTriangle size={24} />
              <SheetTitle>Treino em Andamento</SheetTitle>
            </div>
            <SheetDescription>
              Você já tem um treino em andamento:{" "}
              <strong>{activeWorkoutInfo?.workoutTemplateTitle}</strong>
              <br />
              <br />O que você deseja fazer?
            </SheetDescription>
          </SheetHeader>

          <SheetFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={handleContinueCurrent}
              className="flex-1"
            >
              Continuar Treino Atual
            </Button>
            <Button
              variant="destructive"
              onClick={handleDiscardAndStart}
              disabled={isCanceling}
              className="flex-1"
            >
              {isCanceling ? "Cancelando..." : "Descartar e Iniciar Novo"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
