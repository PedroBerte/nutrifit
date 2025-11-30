import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetWorkoutTemplateById } from "@/services/api/workoutTemplate";
import {
  useCompleteWorkoutSession,
  type PreviousSetData,
} from "@/services/api/workoutSession";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import {
  getLocalWorkout,
  saveLocalWorkout,
  clearLocalWorkout,
  addSetToExercise,
  updateExerciseNotes,
  calculateTotalVolume,
  getTotalSets,
  initializeExerciseSets,
  deleteSetFromExercise,
  type LocalWorkoutSession,
  type LocalExerciseSession,
  type LocalSetSession,
} from "@/services/localWorkoutSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  Plus,
  Check,
  Timer,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  PlayCircle,
  AlertTriangle,
  Edit2,
  Trash2,
  GripVertical,
  HelpCircle,
  ChartBar,
  Video,
  X,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { motion, AnimatePresence } from "motion/react";

export default function WorkoutSession() {
  const navigate = useNavigate();
  const toast = useToast();

  const { templateId } = useParams<{ templateId: string }>();
  const [localWorkout, setLocalWorkout] = useState<LocalWorkoutSession | null>(
    null
  );
  const [, forceUpdate] = useState(0); // Para forçar re-render
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [isWorkoutTimerRunning, setIsWorkoutTimerRunning] = useState(false);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [expandedExerciseIds, setExpandedExerciseIds] = useState<Set<string>>(
    new Set<string>()
  );
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(
    null
  );
  const [showSwipeHint, setShowSwipeHint] = useState(() => {
    // Mostra a dica apenas se nunca foi vista
    return !localStorage.getItem("hasSeenSwipeHint");
  });
  const [showEditSwipeHint, setShowEditSwipeHint] = useState(false);
  const [showHelpSheet, setShowHelpSheet] = useState(false);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);

  // Queries
  const { data: templateData } = useGetWorkoutTemplateById(templateId);
  const completeSession = useCompleteWorkoutSession();

  const template = templateData?.data;

  // Inicializa workout do localStorage ou cria novo
  useEffect(() => {
    if (!template) return;

    const existingWorkout = getLocalWorkout();

    // Se já existe um workout no localStorage e é do mesmo template
    if (existingWorkout && existingWorkout.workoutTemplateId === template.id) {
      // Atualiza os exercícios com dados mais recentes do template (como exerciseUrl)
      const updatedExercises = existingWorkout.exercises.map((localEx) => {
        const templateEx = template.exerciseTemplates?.find(
          (te) => te.id === localEx.exerciseTemplateId
        );
        
        if (templateEx) {
          return {
            ...localEx,
            exerciseUrl: templateEx.exerciseUrl, // Atualiza com URL do template
            exerciseName: templateEx.exerciseName, // Atualiza nome se mudou
          };
        }
        
        return localEx;
      });

      setLocalWorkout({ ...existingWorkout, exercises: updatedExercises });
      // Calcula tempo decorrido
      const startedAt = new Date(existingWorkout.startedAt);
      const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      setWorkoutTimer(elapsed);
      setIsWorkoutTimerRunning(true);
    } else {
      // Cria novo workout local
      const newWorkout: LocalWorkoutSession = {
        workoutTemplateId: template.id,
        workoutTemplateTitle: template.title,
        routineId: template.routineId,
        startedAt: new Date().toISOString(),
        exercises:
          template.exerciseTemplates?.map((et) => ({
            id: crypto.randomUUID(),
            exerciseTemplateId: et.id,
            exerciseId: et.exerciseId,
            exerciseName: et.exerciseName,
            exerciseUrl: et.exerciseUrl,
            order: et.order,
            status: "IP",
            sets: [],
            targetSets: et.targetSets,
            targetRepsMin: et.targetRepsMin,
            targetRepsMax: et.targetRepsMax,
            suggestedLoad: et.suggestedLoad,
            restSeconds: et.restSeconds,
          })) || [],
      };

      saveLocalWorkout(newWorkout);
      setLocalWorkout(newWorkout);
      setIsWorkoutTimerRunning(true);
    }
  }, [template]);

  // Inicializa séries com histórico após criar o workout
  useEffect(() => {
    if (!localWorkout) return;

    // Verifica se algum exercício ainda não tem séries inicializadas
    const exercisesNeedingInit = localWorkout.exercises.filter(
      (ex) => ex.sets.length === 0
    );

    if (exercisesNeedingInit.length === 0) return;

    // Busca histórico e inicializa séries para cada exercício
    const initializeAllExercises = async () => {
      let updatedWorkout = localWorkout;

      for (const exercise of exercisesNeedingInit) {
        try {
          // Busca histórico do exercício via API
          const response = await api.get<ApiResponse<PreviousSetData[]>>(
            `/workoutSession/exercise/${exercise.exerciseId}/previous`
          );

          const previousSets = response.data.data || [];

          // Inicializa séries com histórico
          updatedWorkout = initializeExerciseSets(
            updatedWorkout,
            exercise.id,
            previousSets,
            exercise.targetSets
          );
        } catch (error) {
          console.error(
            `Erro ao buscar histórico do exercício ${exercise.exerciseName}`,
            error
          );
          // Em caso de erro, inicializa com targetSets
          updatedWorkout = initializeExerciseSets(
            updatedWorkout,
            exercise.id,
            [],
            exercise.targetSets
          );
        }
      }

      setLocalWorkout(updatedWorkout);
    };

    initializeAllExercises();
  }, [localWorkout?.workoutTemplateId]); // Só roda quando o workout é criado

  useEffect(() => {
    if (localWorkout?.exercises && expandedExerciseIds.size === 0) {
      // Encontra o último exercício com todas as séries completadas
      let lastCompletedIndex = -1;

      for (let i = 0; i < localWorkout.exercises.length; i++) {
        const exercise = localWorkout.exercises[i];
        const allSetsCompleted =
          exercise.sets.length > 0 &&
          exercise.sets.every((set) => set.completed);

        if (allSetsCompleted) {
          lastCompletedIndex = i;
        }
      }

      // O exercício atual é o próximo após o último completado
      const currentExerciseIndex = lastCompletedIndex + 1;

      // Se o índice é válido, expande esse exercício
      if (currentExerciseIndex < localWorkout.exercises.length) {
        const currentExercise = localWorkout.exercises[currentExerciseIndex];
        setExpandedExerciseIds(new Set([currentExercise.id]));
        setCurrentExerciseId(currentExercise.id);
      } else {
        // Se todos estão completos, expande o primeiro
        const firstExercise = localWorkout.exercises[0];
        if (firstExercise) {
          setExpandedExerciseIds(new Set([firstExercise.id]));
          setCurrentExerciseId(firstExercise.id);
        }
      }
    }
  }, [localWorkout?.exercises]);

  // Timer do treino
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkoutTimerRunning) {
      interval = setInterval(() => {
        setWorkoutTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutTimerRunning]);

  // Timer de descanso
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRestTimerRunning && restTimer !== null && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev === null || prev <= 1) {
            setIsRestTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRestTimerRunning, restTimer]);

  // Listener para mudanças no localStorage (quando SetRow atualiza)
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedWorkout = getLocalWorkout();
      if (updatedWorkout) {
        setLocalWorkout(updatedWorkout);
        forceUpdate((n) => n + 1);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Esconde a dica de swipe após 8 segundos
  useEffect(() => {
    if (showSwipeHint) {
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
        localStorage.setItem("hasSeenSwipeHint", "true");
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeHint]);

  // Esconde a dica de edição após 10 segundos
  useEffect(() => {
    if (showEditSwipeHint) {
      const timer = setTimeout(() => {
        setShowEditSwipeHint(false);
        localStorage.setItem("hasSeenEditSwipeHint", "true");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showEditSwipeHint]);

  // Monitora quando uma série é completada pela primeira vez
  useEffect(() => {
    if (!localWorkout) return;

    const hasCompletedSet = localWorkout.exercises.some((exercise) =>
      exercise.sets.some((set) => set.completed)
    );

    const hasSeenEditHint = localStorage.getItem("hasSeenEditSwipeHint");

    // Se tem pelo menos uma série completada e nunca viu a dica de edição
    if (hasCompletedSet && !hasSeenEditHint && !showEditSwipeHint) {
      // Espera 1 segundo após completar para mostrar a dica
      const timer = setTimeout(() => {
        setShowEditSwipeHint(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [localWorkout]);

  const handleCompleteSession = async () => {
    if (!localWorkout) return;

    try {
      const completedAt = new Date().toISOString();
      const durationMinutes = Math.floor(workoutTimer / 60);

      // Prepara dados para enviar ao backend
      const payload = {
        workoutTemplateId: localWorkout.workoutTemplateId,
        startedAt: localWorkout.startedAt,
        completedAt,
        durationMinutes,
        notes: localWorkout.notes,
        exerciseSessions: localWorkout.exercises.map((exercise) => ({
          exerciseTemplateId: exercise.exerciseTemplateId,
          exerciseId: exercise.exerciseId,
          order: exercise.order,
          startedAt: exercise.startedAt,
          completedAt: exercise.completedAt || completedAt,
          status: exercise.sets.length > 0 ? "C" : "SK", // Se tem séries, completou, senão pulou
          notes: exercise.notes,
          sets: exercise.sets.map((set) => ({
            setNumber: set.setNumber,
            load: set.load,
            reps: set.reps,
            restSeconds: set.restSeconds,
            completed: set.completed,
            notes: set.notes,
            startedAt: set.startedAt,
            completedAt: set.completedAt,
          })),
        })),
      };

      await completeSession.mutateAsync(payload);
      clearLocalWorkout();
      setIsWorkoutTimerRunning(false);
      setShowCompleteConfirm(false);
      toast.success("Treino concluído com sucesso!");
      navigate("/workout");
    } catch (error: any) {
      console.error("Erro ao concluir treino", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao concluir treino";
      toast.error(errorMessage);
    }
  };

  const handleCancelSession = () => {
    clearLocalWorkout();
    setIsWorkoutTimerRunning(false);
    toast.info("Treino cancelado");
    navigate("/workout");
    setShowCancelDialog(false);
  };

  const handleRegisterSet = (
    exerciseId: string,
    load?: number,
    reps?: number,
    restSeconds?: number
  ) => {
    if (!localWorkout) return;

    const updatedWorkout = addSetToExercise(localWorkout, exerciseId, {
      load,
      reps,
      restSeconds,
      completed: true,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    setLocalWorkout(updatedWorkout);

    // Inicia timer de descanso se definido
    if (restSeconds && restSeconds > 0) {
      setRestTimer(restSeconds);
      setIsRestTimerRunning(true);
    }
  };

  const handleUpdateExerciseNotes = (exerciseId: string, notes: string) => {
    if (!localWorkout) return;
    const updatedWorkout = updateExerciseNotes(localWorkout, exerciseId, notes);
    setLocalWorkout(updatedWorkout);
  };

  const handleAddSet = (exerciseId: string, restSeconds?: number) => {
    if (!localWorkout) return;

    const updatedWorkout = addSetToExercise(localWorkout, exerciseId, {
      load: undefined,
      reps: undefined,
      restSeconds,
      completed: false, // NÃO completada
      startedAt: new Date().toISOString(),
    });

    setLocalWorkout(updatedWorkout);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (!template || !localWorkout) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>Carregando treino...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-1 flex-col mt-4"
    >
      {/* Header */}
      <div className="sticky rounded-lg top-0 z-10 bg-primary/30 backdrop-blur-sm border-b border-neutral-dark-02/30">
        {/* Header principal - clicável */}
        <div
          className="px-4 pt-3 pb-3 cursor-pointer hover:bg-neutral-dark-02/30 transition-colors"
          onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{template.title}</h1>
            <div className="flex items-center gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHelpSheet(true);
                }}
                variant="ghost"
                size="sm"
              >
                <HelpCircle className="size-5" />
              </Button>
            </div>
          </div>

          {/* Indicador sutil de expansão */}
          <div className="flex justify-center mt-3">
            <motion.div
              animate={{
                opacity: isHeaderExpanded ? 0 : 0.5,
              }}
              transition={{
                duration: 0.3,
              }}
              className="flex gap-1"
            >
              <div className="h-1 w-1 bg-muted-foreground rounded-full" />
              <div className="h-1 w-1 bg-muted-foreground rounded-full" />
              <div className="h-1 w-1 bg-muted-foreground rounded-full" />
            </motion.div>
          </div>
        </div>

        {/* Conteúdo expandido */}
        <AnimatePresence initial={false}>
          {isHeaderExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden border-t border-neutral-dark-02/30"
            >
              <div className="px-4 py-4 space-y-3">
                {/* Estatísticas detalhadas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-dark-03 backdrop-blur-sm rounded-lg p-3 border border-primary/20">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock size={14} />
                      <span className="text-xs font-medium">Tempo Total</span>
                    </div>
                    <p className="text-lg font-bold font-mono text-foreground">
                      {formatTime(workoutTimer)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {Math.floor(workoutTimer / 60)} minutos
                    </p>
                  </div>

                  <div className="bg-neutral-dark-03 backdrop-blur-sm rounded-lg p-3 border border-primary/20">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Dumbbell size={14} />
                      <span className="text-xs font-medium">Carga Total</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {calculateTotalVolume(localWorkout).toFixed(1)} kg
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Volume levantado
                    </p>
                  </div>

                  <div className="bg-neutral-dark-03 backdrop-blur-sm rounded-lg p-3 border border-primary/20">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <CheckCircle2 size={14} />
                      <span className="text-xs font-medium">Séries Totais</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {getTotalSets(localWorkout)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Séries completadas
                    </p>
                  </div>

                  <div className="bg-neutral-dark-03 backdrop-blur-sm rounded-lg p-3 border border-primary/20">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Dumbbell size={14} />
                      <span className="text-xs font-medium">Exercícios</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {
                        localWorkout.exercises.filter((ex) =>
                          ex.sets.some((s) => s.completed)
                        ).length
                      }
                      /{localWorkout.exercises.length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Exercícios iniciados
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer de descanso */}
        {restTimer !== null && restTimer > 0 && (
          <div className="mx-4 mb-3 p-3 bg-primary/10 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer size={20} className="text-primary" />
              <span className="font-bold text-lg">{formatTime(restTimer)}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsRestTimerRunning(!isRestTimerRunning);
              }}
            >
              {isRestTimerRunning ? <Pause size={16} /> : <Play size={16} />}
            </Button>
          </div>
        )}

        {/* Dica de swipe - aparece apenas na primeira vez */}
        <AnimatePresence>
          {showSwipeHint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-4 mb-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
            >
              <div className="flex items-start gap-3 mb-2">
                <GripVertical
                  size={20}
                  className="text-blue-500 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-blue-500 mb-1">
                    Dica: Use gestos nas séries
                  </p>
                  <div className="space-y-1 text-xs text-blue-400">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">→</span>
                      <span>Arraste para direita para confirmar série</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">←</span>
                      <span>Arraste para esquerda para deletar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">→</span>
                      <span>Série completa? Arraste direita para editar</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs flex-shrink-0"
                  onClick={() => {
                    setShowSwipeHint(false);
                    localStorage.setItem("hasSeenSwipeHint", "true");
                  }}
                >
                  Entendi
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dica de edição - aparece após completar a primeira série */}
        <AnimatePresence>
          {showEditSwipeHint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-4 mb-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <Check
                  size={20}
                  className="text-green-500 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-green-500 mb-1">
                    Boa! Série concluída ✓
                  </p>
                  <p className="text-xs text-green-400">
                    Precisa editar? Arraste a série completada para a direita
                    (→) e ela voltará ao modo editável!
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs flex-shrink-0"
                  onClick={() => {
                    setShowEditSwipeHint(false);
                    localStorage.setItem("hasSeenEditSwipeHint", "true");
                  }}
                >
                  OK
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lista de Exercícios */}
      <div className="flex-1 py-4 gap-4 flex flex-col">
        {localWorkout.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onRegisterSet={handleRegisterSet}
            onUpdateNotes={handleUpdateExerciseNotes}
            onAddSet={handleAddSet}
            isExpanded={expandedExerciseIds.has(exercise.id)}
            navigate={navigate}
          />
        ))}

        {/* Botão Cancelar no final */}
        <div className="flex w-full pt-2 gap-4 justify-between items-center ">
          <Button
            variant="outline"
            onClick={() => setShowCancelConfirm(true)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button onClick={() => setShowCompleteConfirm(true)} className="flex-1">
            Concluir
          </Button>
        </div>
      </div>

      {/* Drawer de confirmação de cancelamento */}
      <Drawer open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DrawerContent>
          <DrawerHeader>
            <div className="flex items-center gap-2 text-yellow-500 mb-3">
              <AlertTriangle size={24} />
              <DrawerTitle>Cancelar Treino?</DrawerTitle>
            </div>
            <DrawerDescription>
              Tem certeza que deseja cancelar este treino?
              <br />
              Todo o progresso será perdido.
            </DrawerDescription>
          </DrawerHeader>

          <DrawerFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(false)}
            >
              Continuar Treino
            </Button>
            <Button variant="destructive" onClick={handleCancelSession}>
              Sim, cancelar treino
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Drawer de confirmação de conclusão */}
      <Drawer open={showCompleteConfirm} onOpenChange={setShowCompleteConfirm}>
        <DrawerContent>
          <DrawerHeader>
            <div className="flex items-center gap-2 text-green-500 mb-2">
              <CheckCircle2 size={24} />
              <DrawerTitle>Concluir Treino?</DrawerTitle>
            </div>
            <DrawerDescription>
              Tem certeza que deseja finalizar este treino?
              <br />
              Seus dados serão salvos e você poderá visualizar o histórico.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 py-4 space-y-3">
            <div className="bg-neutral-dark-02 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Duração</span>
                <span className="font-bold">
                  {Math.floor(workoutTimer / 60)}min {workoutTimer % 60}s
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Volume Total</span>
                <span className="font-bold">
                  {localWorkout ? calculateTotalVolume(localWorkout) : 0} kg
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Séries Totais</span>
                <span className="font-bold">
                  {localWorkout ? getTotalSets(localWorkout) : 0}
                </span>
              </div>
            </div>
          </div>

          <DrawerFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCompleteConfirm(false)}
            >
              Continuar Treino
            </Button>
            <Button onClick={handleCompleteSession} className="bg-green-600 hover:bg-green-700">
              Sim, finalizar treino
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Drawer de Ajuda */}
      <Drawer open={showHelpSheet} onOpenChange={setShowHelpSheet}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Como usar os gestos</DrawerTitle>
            <DrawerDescription>
              Aprenda a usar os gestos para gerenciar suas séries
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 max-h-[60vh]">
            {/* Confirmar Série */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Check size={24} className="text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-green-500 mb-1">
                  Confirmar Série →
                </h3>
                <p className="text-sm text-muted-foreground">
                  Preencha kg e reps, depois arraste a série para a{" "}
                  <span className="font-bold text-green-400">direita</span> para
                  confirmar e completar.
                </p>
              </div>
            </div>

            {/* Editar Série */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Edit2 size={24} className="text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-500 mb-1">
                  Editar Série Completa →
                </h3>
                <p className="text-sm text-muted-foreground">
                  Série já confirmada? Arraste para a{" "}
                  <span className="font-bold text-blue-400">direita</span>{" "}
                  novamente para voltar ao modo de edição.
                </p>
              </div>
            </div>

            {/* Deletar Série */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-500 mb-1">Deletar Série ←</h3>
                <p className="text-sm text-muted-foreground">
                  Arraste a série para a{" "}
                  <span className="font-bold text-red-400">esquerda</span> para
                  removê-la permanentemente.
                </p>
              </div>
            </div>

            {/* Dica Visual */}
            <div className="p-4 bg-neutral-dark-02 rounded-lg border border-neutral-dark-03">
              <div className="flex items-center gap-2 mb-2">
                <GripVertical size={18} className="text-muted-foreground" />
                <p className="text-sm font-bold">Dica Visual</p>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                Ao arrastar, você verá fundos coloridos aparecerem indicando a
                ação que será executada. Solte quando o fundo estiver visível!
              </p>
            </div>
          </div>

          <DrawerFooter className="border-t pt-4">
            <Button onClick={() => setShowHelpSheet(false)} className="w-full">
              Entendi, vamos treinar!
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </motion.div>
  );
}

// Componente do Card de Exercício
interface ExerciseCardProps {
  exercise: LocalExerciseSession;
  onRegisterSet: (
    exerciseId: string,
    load?: number,
    reps?: number,
    restSeconds?: number
  ) => void;
  onUpdateNotes: (exerciseId: string, notes: string) => void;
  onAddSet: (exerciseId: string, restSeconds?: number) => void;
  isExpanded: boolean;
  navigate: (path: string) => void;
}

function ExerciseCard({
  exercise,
  onRegisterSet,
  onUpdateNotes,
  onAddSet,
  isExpanded,
  navigate,
}: ExerciseCardProps) {
  const [exerciseRestTimer, setExerciseRestTimer] = useState(0);
  const [isExerciseRestRunning, setIsExerciseRestRunning] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(!isExpanded);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Timer de descanso do exercício
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isExerciseRestRunning && exerciseRestTimer > 0) {
      interval = setInterval(() => {
        setExerciseRestTimer((prev) => {
          if (prev <= 1) {
            setIsExerciseRestRunning(false);
            // Vibra quando o timer termina
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200]); // Padrão de vibração: vibra-pausa-vibra
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isExerciseRestRunning, exerciseRestTimer]);

  // Listener para iniciar o timer de descanso automaticamente
  useEffect(() => {
    const handleStartRestTimer = (event: CustomEvent) => {
      if (event.detail.exerciseId === exercise.id) {
        startRestTimer();
      }
    };

    window.addEventListener(
      "startRestTimer",
      handleStartRestTimer as EventListener
    );
    return () =>
      window.removeEventListener(
        "startRestTimer",
        handleStartRestTimer as EventListener
      );
  }, [exercise.id, exercise.restSeconds]);

  const startRestTimer = () => {
    if (exercise.restSeconds) {
      setExerciseRestTimer(exercise.restSeconds);
      setIsExerciseRestRunning(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Verifica se todas as séries foram completadas
  const allSetsCompleted =
    exercise.sets.length > 0 && exercise.sets.every((set) => set.completed);
  const completedSetsCount = exercise.sets.filter(
    (set) => set.completed
  ).length;

  // Debug log temporário
  console.log(`[${exercise.exerciseName}] exerciseUrl:`, exercise.exerciseUrl, '| disabled:', !exercise.exerciseUrl);

  return (
    <div className="bg-neutral-dark-03 rounded-lg overflow-hidden">
      {/* Cabeçalho do Exercício - Clicável para colapsar */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-dark-02/50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 90 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight
              size={20}
              className="text-muted-foreground flex-shrink-0"
            />
          </motion.div>

          <div className="flex-1 min-w-0 group relative">
            <h3
              className={`font-bold text-lg ${
                isCollapsed ? "truncate" : ""
              } group-hover:text-primary transition-colors`}
              title={exercise.exerciseName}
            >
              {exercise.exerciseName}
            </h3>
            {isCollapsed && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {completedSetsCount}/{exercise.sets.length} séries
              </p>
            )}
          </div>
        </div>

        {/* Timer de descanso - Retângulo com tempo - Apenas quando expandido */}
        {!isCollapsed && exercise.restSeconds && (
          <Button
            size="sm"
            variant="ghost"
            className={`h-auto px-3 py-1.5 rounded border transition-all flex-shrink-0 ${
              exerciseRestTimer > 0
                ? "bg-primary/10 border-primary hover:bg-primary/20"
                : "bg-neutral-dark-01 border-neutral-dark-03"
            }`}
            onClick={(e) => {
              e.stopPropagation(); // Previne colapsar ao clicar no timer
              if (exerciseRestTimer > 0) {
                setExerciseRestTimer(0);
                setIsExerciseRestRunning(false);
              } else {
                startRestTimer();
              }
            }}
          >
            <span
              className={`text-sm font-mono font-bold ${
                exerciseRestTimer > 0 ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {exerciseRestTimer > 0
                ? formatTime(exerciseRestTimer)
                : `${exercise.restSeconds}s`}
            </span>
            <span className="ml-2">
              {exerciseRestTimer > 0 ? (
                <Trash2 size={14} />
              ) : (
                <Play size={14} />
              )}
            </span>
          </Button>
        )}
      </div>

      {/* Conteúdo colapsável */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Tabela de Séries */}
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-xs font-bold text-muted-foreground">
                  <span>SÉRIE</span>
                  <span>ANTERIOR</span>
                  <span className="text-center">KG</span>
                  <span className="text-center">REPS</span>
                </div>

                {/* Séries (completadas e pendentes) */}
                <AnimatePresence mode="popLayout">
                  {exercise.sets.map((set) => (
                    <SetRow
                      key={set.id}
                      set={set}
                      onRegisterSet={onRegisterSet}
                      exerciseId={exercise.id}
                      restSeconds={exercise.restSeconds}
                    />
                  ))}
                </AnimatePresence>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="flex-1 w-full mt-[-16px]"
                onClick={() => onAddSet(exercise.id, exercise.restSeconds)}
              >
                <Plus size={16} className="mr-1" />
                Adicionar Série
              </Button>

              {/* Botões de ação */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 px-3"
                  onClick={() => setShowVideoModal(true)}
                  disabled={!exercise.exerciseUrl}
                >
                  <Video size={16} />
                  <span>Vídeo</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 px-3"
                  onClick={() =>
                    navigate(`/exercise/${exercise.exerciseId}/history`)
                  }
                >
                  <ChartBar size={16} />
                  <span>Evolução</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 px-3"
                  onClick={() => setShowNotes(!showNotes)}
                >
                  <Edit2 size={16} />
                  <span>Notas</span>
                </Button>
              </div>

              {/* Campo de Notas - Animado */}
              <AnimatePresence>
                {showNotes && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Textarea
                      placeholder="Adicionar notas aqui..."
                      value={exercise.notes || ""}
                      onChange={(e) =>
                        onUpdateNotes(exercise.id, e.target.value)
                      }
                      className="min-h-[60px]"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Vídeo do YouTube */}
      <Drawer open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DrawerContent>
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <DrawerTitle>{exercise.exerciseName}</DrawerTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVideoModal(false)}
              >
                <X size={20} />
              </Button>
            </div>
            <DrawerDescription>
              Assista ao vídeo demonstrativo do exercício
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-4">
            <div className="relative w-full pb-[56.25%] bg-neutral-dark-02 rounded-lg overflow-hidden">
              {exercise.exerciseUrl && (
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={
                    exercise.exerciseUrl.includes('youtube.com/watch?v=')
                      ? exercise.exerciseUrl.replace('watch?v=', 'embed/')
                      : exercise.exerciseUrl.includes('youtu.be/')
                      ? exercise.exerciseUrl.replace('youtu.be/', 'youtube.com/embed/')
                      : exercise.exerciseUrl
                  }
                  title={exercise.exerciseName}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>

          <DrawerFooter>
            <Button onClick={() => setShowVideoModal(false)}>Fechar</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

// Componente de Linha de Série
interface SetRowProps {
  set: LocalSetSession;
  exerciseId: string;
  restSeconds?: number;
  onRegisterSet: (
    exerciseId: string,
    load?: number,
    reps?: number,
    restSeconds?: number
  ) => void;
}

function SetRow({ set, exerciseId, restSeconds, onRegisterSet }: SetRowProps) {
  const [editData, setEditData] = useState<{
    load?: number;
    reps?: number;
  }>({
    load: set.load,
    reps: set.reps,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const handleDelete = () => {
    const updatedWorkout = getLocalWorkout();
    if (!updatedWorkout) return;

    const updatedWorkoutAfterDelete = deleteSetFromExercise(
      updatedWorkout,
      exerciseId,
      set.id
    );

    saveLocalWorkout(updatedWorkoutAfterDelete);
    window.dispatchEvent(new Event("storage"));
  };

  // Se a série já foi completada e não está em modo de edição, mostra os dados finais
  if (set.completed && !isEditing) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
        className="relative overflow-hidden isolate"
      >
        {/* Fundo vermelho (esquerda) - deletar */}
        <motion.div
          className="absolute inset-0 bg-red-500/20 rounded flex items-center justify-end pr-4 pointer-events-none -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: isDragging && dragOffset < -20 ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Trash2 size={16} className="text-red-500" />
        </motion.div>

        {/* Fundo azul (direita) - editar */}
        <motion.div
          className="absolute inset-0 bg-blue-500/20 rounded flex items-center justify-start pl-4 pointer-events-none -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: isDragging && dragOffset > 20 ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Edit2 size={16} className="text-blue-500" />
        </motion.div>

        {/* Conteúdo da série */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragStart={() => setIsDragging(true)}
          onDrag={(_, info) => setDragOffset(info.offset.x)}
          onDragEnd={(_, info) => {
            setIsDragging(false);
            setDragOffset(0);
            // Se arrastou mais de 80px para a esquerda, deleta
            if (info.offset.x < -80) {
              handleDelete();
            }
            // Se arrastou mais de 80px para a direita, volta para modo editável
            else if (info.offset.x > 80) {
              setEditData({ load: set.load, reps: set.reps });
              setIsEditing(true);
            }
          }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="grid grid-cols-4 gap-2 items-center bg-neutral-dark-03 relative z-10 py-4"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-1.5">
            <GripVertical size={18} className="text-muted-foreground/60" />
            <span className="text-sm font-bold">{set.setNumber}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {set.previousLoad && set.previousReps
              ? `${set.previousLoad}kg x ${set.previousReps}`
              : "-"}
          </span>
          <span className="text-sm font-mono font-bold text-green-500 text-center">
            {set.load || "-"}kg
          </span>
          <span className="text-sm font-mono font-bold text-green-500 text-center">
            {set.reps || "-"}
          </span>
        </motion.div>
      </motion.div>
    );
  }

  // Se não foi completada ou está em modo de edição, mostra inputs editáveis
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
      className="relative overflow-hidden isolate"
    >
      {/* Fundo vermelho (esquerda) com ícone de lixeira */}
      <motion.div
        className="absolute inset-0 bg-red-500/20 rounded flex items-center justify-end pr-4 pointer-events-none -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: isDragging && dragOffset < -20 ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <Trash2 size={16} className="text-red-500" />
      </motion.div>

      {/* Fundo verde (direita) com ícone de check */}
      <motion.div
        className="absolute inset-0 bg-green-500/20 rounded flex items-center justify-start pl-4 pointer-events-none -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: isDragging && dragOffset > 20 ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <Check size={20} className="text-green-500" />
      </motion.div>

      {/* Conteúdo da série */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDrag={(_, info) => setDragOffset(info.offset.x)}
        onDragEnd={(_, info) => {
          setIsDragging(false);
          setDragOffset(0);
          // Se arrastou mais de 80px para a esquerda, deleta
          if (info.offset.x < -80) {
            handleDelete();
          }
          // Se arrastou mais de 80px para a direita, completa
          else if (info.offset.x > 80) {
            // Atualiza a série com os dados preenchidos e marca como completa
            const updatedWorkout = getLocalWorkout();
            if (!updatedWorkout) return;

            const exerciseIndex = updatedWorkout.exercises.findIndex(
              (ex) => ex.id === exerciseId
            );
            if (exerciseIndex === -1) return;

            const setIndex = updatedWorkout.exercises[
              exerciseIndex
            ].sets.findIndex((s) => s.id === set.id);
            if (setIndex === -1) return;

            // Se ambos os campos estiverem vazios, usa os valores anteriores
            const finalLoad = editData.load || set.previousLoad;
            const finalReps = editData.reps || set.previousReps;

            // Verifica se já estava completada (vindo de edição)
            const wasAlreadyCompleted = set.completed;

            updatedWorkout.exercises[exerciseIndex].sets[setIndex] = {
              ...set,
              load: finalLoad,
              reps: finalReps,
              completed: true,
              completedAt: new Date().toISOString(),
            };

            saveLocalWorkout(updatedWorkout);
            setIsEditing(false);
            window.dispatchEvent(new Event("storage"));

            // Inicia o timer de descanso automaticamente apenas se for nova conclusão
            if (!wasAlreadyCompleted && restSeconds && restSeconds > 0) {
              window.dispatchEvent(
                new CustomEvent("startRestTimer", {
                  detail: { exerciseId },
                })
              );
            }
          }
        }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="grid grid-cols-4 gap-2 items-center bg-neutral-dark-03 relative z-10 py-4"
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-1.5">
          <GripVertical size={18} className="text-muted-foreground/60" />
          <span className="text-sm font-bold">{set.setNumber}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {set.previousLoad && set.previousReps
            ? `${set.previousLoad}kg x ${set.previousReps}`
            : "-"}
        </span>
        <Input
          type="number"
          placeholder={set.previousLoad ? `${set.previousLoad}kg` : "kg"}
          className="h-8 text-sm text-center"
          value={editData.load || ""}
          onChange={(e) =>
            setEditData((prev) => ({
              ...prev,
              load: parseFloat(e.target.value) || undefined,
            }))
          }
        />
        <Input
          type="number"
          placeholder={set.previousReps ? `${set.previousReps}` : "reps"}
          className="h-8 text-sm text-center"
          value={editData.reps || ""}
          onChange={(e) =>
            setEditData((prev) => ({
              ...prev,
              reps: parseInt(e.target.value) || undefined,
            }))
          }
        />
      </motion.div>
    </motion.div>
  );
}
