import { Clock, Dumbbell, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
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
import { useCancelWorkoutSession } from "@/services/api/workoutSession";
import { useActiveWorkout } from "@/contexts/ActiveWorkoutContext";
import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import { motion, AnimatePresence } from "motion/react";

interface WorkoutItemCardProps {
  workout: WorkoutTemplateResponse;
}

export default function WorkoutItemCard({ workout }: WorkoutItemCardProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const { activeSession, cancelWorkout } = useActiveWorkout();
  const cancelSession = useCancelWorkoutSession();

  const [showDiscardSheet, setShowDiscardSheet] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const totalExercises = workout.exerciseTemplates?.length || 0;

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A";
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`;
  };

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleStartWorkout = () => {
    // Se tem treino ativo e não é o mesmo template
    if (activeSession && activeSession.workoutTemplateId !== workout.id) {
      setShowDiscardSheet(true);
    } else if (
      activeSession &&
      activeSession.workoutTemplateId === workout.id
    ) {
      // É o mesmo treino ativo, continua
      navigate(`/workout/session/${workout.id}?sessionId=${activeSession.id}`);
    } else {
      // Sem treino ativo, inicia novo
      navigate(`/workout/session/${workout.id}`);
    }
  };

  const handleDiscardAndStart = async () => {
    if (!activeSession) return;

    setIsCanceling(true);
    try {
      await cancelSession.mutateAsync(activeSession.id);
      // Força limpeza via contexto também
      cancelWorkout();
      toast.info("Treino anterior cancelado");
      setShowDiscardSheet(false);
      
      // Aguarda um pouco para garantir que o estado foi limpo
      setTimeout(() => {
        navigate(`/workout/session/${workout.id}`);
      }, 100);
    } catch (error: any) {
      console.error("Erro ao cancelar treino", error);
      toast.error("Erro ao cancelar treino anterior");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleContinueCurrent = () => {
    if (!activeSession) return;
    setShowDiscardSheet(false);
    navigate(
      `/workout/session/${activeSession.workoutTemplateId}?sessionId=${activeSession.id}`
    );
  };

  return (
    <>
      <div className="rounded-lg border border-neutral-dark-02 hover:border-primary/30 transition-all overflow-hidden">
        <div 
          className="flex items-center justify-between p-3 cursor-pointer"
          onClick={handleCardClick}
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{workout.title}</p>
              {workout.description && !isExpanded && (
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

          <div className="ml-2 text-muted-foreground">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-neutral-dark-02"
            >
              <div className="p-3 space-y-3">
                {workout.description && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Descrição
                    </p>
                    <p className="text-sm text-neutral-white-01">
                      {workout.description}
                    </p>
                  </div>
                )}

                {workout.exerciseTemplates && workout.exerciseTemplates.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      Exercícios ({workout.exerciseTemplates.length})
                    </p>
                    <div className="space-y-2">
                      {workout.exerciseTemplates.map((exercise, index) => (
                        <div
                          key={exercise.id || index}
                          className="flex items-start gap-2 text-sm bg-neutral-dark-03 p-2 rounded"
                        >
                          <span className="text-primary font-semibold min-w-[20px]">
                            {index + 1}.
                          </span>
                          <div className="flex-1">
                            <p className="font-medium">
                              {exercise.exerciseName || "Exercício"}
                            </p>
                            {(exercise.targetSets || exercise.targetRepsMin || exercise.restSeconds) && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {exercise.targetSets && `${exercise.targetSets} séries`}
                                {exercise.targetSets && (exercise.targetRepsMin || exercise.targetRepsMax) && " • "}
                                {(exercise.targetRepsMin || exercise.targetRepsMax) && (
                                  <>
                                    {exercise.targetRepsMin}
                                    {exercise.targetRepsMax && exercise.targetRepsMin !== exercise.targetRepsMax && `-${exercise.targetRepsMax}`}
                                    {" reps"}
                                  </>
                                )}
                                {(exercise.targetSets || exercise.targetRepsMin) && exercise.restSeconds && " • "}
                                {exercise.restSeconds && `${exercise.restSeconds}s descanso`}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  size="default"
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartWorkout();
                  }}
                  className="w-full"
                >
                  {activeSession && activeSession.workoutTemplateId === workout.id
                    ? "Continuar Treino"
                    : "Iniciar Treino"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
              <strong>{activeSession?.workoutTemplateTitle}</strong>
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
