import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetWorkoutTemplateById } from "@/services/api/workoutTemplate";
import {
  useCompleteWorkoutSession,
  type PreviousSetData,
} from "@/services/api/workoutSession";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { useGetExerciseSteps } from "@/services/api/exercise";
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
  ListOrdered,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { motion, AnimatePresence } from "motion/react";

export default function WorkoutSession() {
  const navigate = useNavigate();
  const toast = useToast();

  const { templateId } = useParams<{ templateId: string }>();
  const [localWorkout, setLocalWorkout] = useState<LocalWorkoutSession | null>(
    () => getLocalWorkout()
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
  const {
    data: templateData,
    isLoading: isLoadingTemplate,
    isError: isTemplateError,
  } = useGetWorkoutTemplateById(templateId);
  const completeSession = useCompleteWorkoutSession();

  const template = templateData?.data;

  // Inicializa workout do localStorage ou cria novo
  useEffect(() => {
    if (!template) return;

    const existingWorkout = getLocalWorkout();

    // Se já existe um workout no localStorage e é do mesmo template
    if (existingWorkout && existingWorkout.workoutTemplateId === template.id) {
      // Atualiza os exercícios com dados mais recentes do template (como mídia)
      const updatedExercises = existingWorkout.exercises.map((localEx) => {
        const templateEx = template.exerciseTemplates?.find(
          (te) => te.id === localEx.exerciseTemplateId
        );
        
        if (templateEx) {
          return {
            ...localEx,
            exerciseImageUrl: templateEx.exerciseImageUrl, // Atualiza com URL do template
            exerciseVideoUrl: templateEx.exerciseVideoUrl, // Atualiza com URL do template
            exerciseName: templateEx.exerciseName, // Atualiza nome se mudou
            isBisetWithPrevious: templateEx.isBisetWithPrevious ?? false,
            setType: templateEx.setType ?? "Reps",
            weightUnit: templateEx.weightUnit ?? "kg",
            targetDurationSeconds: templateEx.targetDurationSeconds,
            targetCalories: templateEx.targetCalories,
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
            exerciseImageUrl: et.exerciseImageUrl,
            exerciseVideoUrl: et.exerciseVideoUrl,
            order: et.order,
            status: "IP",
            sets: [],
            targetSets: et.targetSets,
            targetRepsMin: et.targetRepsMin,
            targetRepsMax: et.targetRepsMax,
            suggestedLoad: et.suggestedLoad,
            restSeconds: et.restSeconds,
            setType: et.setType ?? "Reps",
            weightUnit: et.weightUnit ?? "kg",
            isBisetWithPrevious: et.isBisetWithPrevious ?? false,
            targetDurationSeconds: et.targetDurationSeconds,
            targetCalories: et.targetCalories,
            exerciseType: et.exerciseType ?? "Standard",
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
            `/workoutsession/exercise/${exercise.exerciseId}/previous`
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
      const groups = groupExercises(localWorkout.exercises);
      let lastCompletedGroupIndex = -1;

      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        let groupComplete = false;
        if (group.type === "single") {
          const ex = group.exercise;
          groupComplete = ex.sets.length > 0 && ex.sets.every((s) => s.completed);
        } else {
          const { first, second } = group;
          groupComplete =
            first.sets.length > 0 && first.sets.every((s) => s.completed) &&
            second.sets.length > 0 && second.sets.every((s) => s.completed);
        }
        if (groupComplete) lastCompletedGroupIndex = i;
      }

      const currentGroupIndex = lastCompletedGroupIndex + 1;
      if (currentGroupIndex < groups.length) {
        const currentGroup = groups[currentGroupIndex];
        const keyId = currentGroup.type === "single" ? currentGroup.exercise.id : currentGroup.first.id;
        setExpandedExerciseIds(new Set([keyId]));
        setCurrentExerciseId(keyId);
      } else {
        const firstGroup = groups[0];
        if (firstGroup) {
          const keyId = firstGroup.type === "single" ? firstGroup.exercise.id : firstGroup.first.id;
          setExpandedExerciseIds(new Set([keyId]));
          setCurrentExerciseId(keyId);
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
            durationSeconds: set.durationSeconds,
            calories: set.calories,
            completed: set.completed,
            notes: set.notes,
            startedAt: set.startedAt,
            completedAt: set.completedAt,
          })),
        })),
      };

      await completeSession.mutateAsync(payload);
      clearLocalWorkout();
      // Limpa sessionStorage de retorno para sessão
      sessionStorage.removeItem('returnToWorkoutSession');
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
    // Limpa sessionStorage de retorno para sessão
    sessionStorage.removeItem('returnToWorkoutSession');
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

  const handleAddBisetRound = (firstExerciseId: string, secondExerciseId: string, restSeconds?: number) => {
    if (!localWorkout) return;
    let updatedWorkout = addSetToExercise(localWorkout, firstExerciseId, {
      load: undefined, reps: undefined, restSeconds: undefined, completed: false, startedAt: new Date().toISOString(),
    });
    updatedWorkout = addSetToExercise(updatedWorkout, secondExerciseId, {
      load: undefined, reps: undefined, restSeconds, completed: false, startedAt: new Date().toISOString(),
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

  if (isLoadingTemplate && !template && !localWorkout) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>Carregando treino...</p>
      </div>
    );
  }

  if (!template) {
    const canRecoverLocalWorkout =
      !!localWorkout &&
      !!templateId &&
      localWorkout.workoutTemplateId === templateId;

    const handleEmergencyCancel = () => {
      clearLocalWorkout();
      sessionStorage.removeItem("returnToWorkoutSession");
      toast.info("Treino local cancelado");
      navigate("/workout", { replace: true });
    };

    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md rounded-lg border border-neutral-dark-02 p-4 space-y-3">
          <h2 className="text-lg font-semibold">Não foi possível abrir este treino</h2>
          <p className="text-sm text-muted-foreground">
            O treino em andamento ficou indisponível. Você pode cancelar o treino local para destravar a navegação.
          </p>

          <div className="flex flex-col gap-2">
            {canRecoverLocalWorkout && (
              <Button variant="destructive" onClick={handleEmergencyCancel}>
                Cancelar treino em andamento
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate("/workout", { replace: true })}>
              Ir para Início de Treinos
            </Button>
            <Button variant="ghost" onClick={() => navigate("/home", { replace: true })}>
              Ir para Home
            </Button>
          </div>

          {isTemplateError && (
            <p className="text-xs text-muted-foreground">
              Dica: isso pode acontecer quando a rotina/template foi removido enquanto havia uma sessão aberta.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!localWorkout) {
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
          className="px-4 pt-3 pb-3 cursor-pointer hover:bg-neutral-dark-03/30 transition-colors"
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
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-blue-500/20">
                      <HelpCircle size={12} className="text-blue-400" />
                      <span>Toque no <strong>?</strong> no topo para ver o tutorial completo</span>
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
                  <p className="text-xs text-green-400 mt-2 pt-2 border-t border-green-500/20 flex items-center gap-1">
                    <HelpCircle size={12} />
                    <span>Toque no <strong>?</strong> no topo para ver todos os gestos</span>
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
        {localWorkout.exercises.length === 0 && (
          <div className="rounded-lg border border-neutral-dark-02 p-4 text-center bg-neutral-dark-03">
            <p className="font-semibold text-neutral-white-01">Este treino ainda não possui exercícios</p>
            <p className="text-sm text-neutral-white-02 mt-1">
              Adicione exercícios no template para iniciar uma sessão completa.
            </p>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => navigate("/routines")}
            >
              Ir para rotinas
            </Button>
          </div>
        )}

        {groupExercises(localWorkout.exercises).map((group) =>
          group.type === "single" ? (
            group.exercise.exerciseType === "Mobilidade" ? (
              <MobilityCircuitCard
                key={group.exercise.id}
                exercise={group.exercise}
              />
            ) : (
              <ExerciseCard
                key={group.exercise.id}
                exercise={group.exercise}
                onRegisterSet={handleRegisterSet}
                onUpdateNotes={handleUpdateExerciseNotes}
                onAddSet={handleAddSet}
                isExpanded={expandedExerciseIds.has(group.exercise.id)}
                navigate={navigate}
                templateId={templateId}
              />
            )
          ) : (
            <BisetCard
              key={group.first.id}
              first={group.first}
              second={group.second}
              onRegisterSet={handleRegisterSet}
              onUpdateNotes={handleUpdateExerciseNotes}
              onAddBisetRound={handleAddBisetRound}
              isExpanded={expandedExerciseIds.has(group.first.id)}
              navigate={navigate}
              templateId={templateId}
            />
          )
        )}

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
            <div className="rounded-lg p-4 space-y-3 border border-border">
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

            {/* Exercícios com diferença de séries */}
            {localWorkout && (() => {
              const exercisesWithDiff = localWorkout.exercises.filter(ex => {
                const target = ex.targetSets || 0;
                const completed = ex.sets.filter(s => s.completed).length;
                return target > 0 && completed !== target;
              });
              
              if (exercisesWithDiff.length === 0) return null;
              
              return (
                <div className="space-y-2">
                  {exercisesWithDiff.map(ex => {
                    const target = ex.targetSets || 0;
                    const completed = ex.sets.filter(s => s.completed).length;
                    const diff = completed - target;
                    const isExtra = diff > 0;
                    
                    return (
                      <div 
                        key={ex.id} 
                        className={`flex items-center justify-between p-2 rounded-lg border ${
                          isExtra 
                            ? 'border-green-500/30 text-green-500' 
                            : 'border-yellow-500/30 text-yellow-500'
                        }`}
                      >
                        <span className="text-sm truncate flex-1 mr-2">{ex.exerciseName}</span>
                        <span className="text-xs font-medium whitespace-nowrap">
                          {isExtra ? `+${diff} série${diff > 1 ? 's' : ''}` : `${diff} série${Math.abs(diff) > 1 ? 's' : ''}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
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
            <div className="p-4 rounded-lg border border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <GripVertical size={18} className="text-primary" />
                <p className="text-sm font-bold">Dica Visual</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
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

      {/* Balão flutuante de timer */}
      <FloatingTimer />
    </motion.div>
  );
}

// Componente do Card de Exercício
// ─── Helpers de agrupamento de biset ────────────────────────────────────────

type ExerciseGroup =
  | { type: "single"; exercise: LocalExerciseSession }
  | { type: "biset"; first: LocalExerciseSession; second: LocalExerciseSession };

function groupExercises(exercises: LocalExerciseSession[]): ExerciseGroup[] {
  const groups: ExerciseGroup[] = [];
  let i = 0;
  while (i < exercises.length) {
    const current = exercises[i];
    const next = exercises[i + 1];
    if (next?.isBisetWithPrevious) {
      groups.push({ type: "biset", first: current, second: next });
      i += 2;
    } else {
      groups.push({ type: "single", exercise: current });
      i++;
    }
  }
  return groups;
}

// ─── ExerciseCard ────────────────────────────────────────────────────────────

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
  templateId?: string;
  isBiset?: boolean;
}

function ExerciseCard({
  exercise,
  onRegisterSet,
  onUpdateNotes,
  onAddSet,
  isExpanded,
  navigate,
  templateId,
  isBiset = false,
}: ExerciseCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(!isExpanded);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const { data: stepsData } = useGetExerciseSteps(exercise.exerciseId);
  const steps = stepsData?.data ?? [];

  // Verifica se todas as séries foram completadas
  const allSetsCompleted =
    exercise.sets.length > 0 && exercise.sets.every((set) => set.completed);
  const completedSetsCount = exercise.sets.filter(
    (set) => set.completed
  ).length;

  return (
    <div className={`bg-neutral-dark-03 rounded-lg overflow-hidden ${isBiset ? "border-l-2 border-primary" : ""}`}>
      {/* Cabeçalho do Exercício - Clicável para colapsar */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-dark-03/50 transition-colors"
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
            <p className="text-xs text-muted-foreground mt-0.5">
              {completedSetsCount} de {exercise.targetSets || exercise.sets.length} séries
            </p>
          </div>
        </div>

        {/* Indicador de descanso - apenas mostra o valor configurado */}
        {!isCollapsed && exercise.restSeconds && (
          <button
            className="flex items-center gap-1.5 h-auto px-2 py-1 rounded border border-neutral-dark-03 bg-neutral-dark-01 text-muted-foreground flex-shrink-0 hover:border-primary/50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(
                new CustomEvent("startRestTimer", {
                  detail: { exerciseId: exercise.id, duration: exercise.restSeconds, label: exercise.exerciseName },
                })
              );
            }}
            title="Iniciar timer de descanso"
          >
            <Clock size={12} />
            <span className="text-xs font-mono">{exercise.restSeconds}s</span>
          </button>
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
                <div className="grid grid-cols-[1fr_0.95fr_1.05fr] xs:grid-cols-[auto_1fr_0.95fr_1.05fr] gap-1 xs:gap-2 text-[10px] xs:text-xs font-bold text-muted-foreground">
                  <span className="hidden xs:block">SÉRIE</span>
                  <span>ANTERIOR</span>
                  <span className="text-center">
                    {exercise.setType === "Time" ? "SEG" : exercise.setType === "Calories" ? "CAL" : (exercise.weightUnit ?? "KG").toUpperCase()}
                  </span>
                  <span className="text-center">
                    {exercise.setType === "Time" || exercise.setType === "Calories" ? "" : "REPS"}
                  </span>
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
                      targetRepsMin={exercise.targetRepsMin}
                      targetRepsMax={exercise.targetRepsMax}
                      targetSets={exercise.targetSets}
                      setType={exercise.setType}
                      weightUnit={exercise.weightUnit}
                      targetDurationSeconds={exercise.targetDurationSeconds}
                      targetCalories={exercise.targetCalories}
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
                  className="flex-shrink-0 px-2 xs:px-3"
                  onClick={() => setShowVideoModal(true)}
                  disabled={!exercise.exerciseVideoUrl}
                >
                  <Video size={16} />
                  <span className="hidden xs:inline">Vídeo</span>
                </Button>
                {steps.length > 0 && (
                  <Button
                    variant={showSteps ? "secondary" : "outline"}
                    size="sm"
                    className="flex-shrink-0 px-2 xs:px-3"
                    onClick={() => setShowSteps(!showSteps)}
                  >
                    <ListOrdered size={16} />
                    <span className="hidden xs:inline">Steps</span>
                    <span className="ml-1 text-xs">({steps.length})</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 px-2 xs:px-3"
                  onClick={() => {
                    // Armazena o templateId para voltar para a sessão ao invés de /workout
                    if (templateId) {
                      sessionStorage.setItem('returnToWorkoutSession', templateId);
                    }
                    navigate(`/exercise/${exercise.exerciseId}/history`);
                  }}
                >
                  <ChartBar size={16} />
                  <span className="hidden xs:inline">Evolução</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 px-2 xs:px-3"
                  onClick={() => setShowNotes(!showNotes)}
                >
                  <Edit2 size={16} />
                  <span className="hidden xs:inline">Notas</span>
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

              {/* Steps - Animado */}
              <AnimatePresence>
                {showSteps && steps.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-lg border border-border bg-neutral-dark-01 divide-y divide-border">
                      {steps.map((step, idx) => (
                        <div key={step.id} className="flex items-start gap-3 px-3 py-2">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{step.name}</p>
                            {step.durationSeconds && (
                              <p className="text-xs text-muted-foreground">{step.durationSeconds}s</p>
                            )}
                            {step.notes && (
                              <p className="text-xs text-muted-foreground italic">{step.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
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
              {exercise.exerciseVideoUrl && (
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={
                    exercise.exerciseVideoUrl.includes('youtube.com/watch?v=')
                      ? exercise.exerciseVideoUrl.replace('watch?v=', 'embed/')
                      : exercise.exerciseVideoUrl.includes('youtu.be/')
                      ? exercise.exerciseVideoUrl.replace('youtu.be/', 'youtube.com/embed/')
                      : exercise.exerciseVideoUrl
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

// ─── MobilityCircuitCard ────────────────────────────────────────────────────
function MobilityCircuitCard({
  exercise,
  isBiset = false,
}: {
  exercise: LocalExerciseSession;
  isBiset?: boolean;
}) {
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [stepTimer, setStepTimer] = useState(0);
  const [stepDuration, setStepDuration] = useState(0); // full duration for progress bar
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const { data: stepsData } = useGetExerciseSteps(exercise.exerciseId);
  const steps = stepsData?.data ?? [];

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const goToStep = (index: number) => {
    const step = steps[index];
    if (!step) return;
    const dur = step.durationSeconds ?? 60;
    setActiveStepIndex(index);
    setStepTimer(dur);
    setStepDuration(dur);
    setIsTimerRunning(true);
  };

  const handleStepDone = (currentIndex: number) => {
    setIsTimerRunning(false);
    setCompletedSteps((prev) => new Set([...prev, currentIndex]));
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    const next = currentIndex + 1;
    if (next < steps.length) {
      const dur = steps[next].durationSeconds ?? 60;
      setActiveStepIndex(next);
      setStepTimer(dur);
      setStepDuration(dur);
      setIsTimerRunning(true);
    } else {
      setActiveStepIndex(-1);
      setStepTimer(0);
    }
  };

  useEffect(() => {
    if (!isTimerRunning || stepTimer <= 0) return;
    const interval = setInterval(() => {
      setStepTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleStepDone(activeStepIndex);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, activeStepIndex]);

  const totalCircuitDuration = steps.reduce((acc, s) => acc + (s.durationSeconds ?? 60), 0);
  const allDone = steps.length > 0 && completedSteps.size >= steps.length;
  const activeStep = activeStepIndex >= 0 ? steps[activeStepIndex] : null;
  const isStarted = activeStepIndex >= 0 || completedSteps.size > 0;
  const timerProgress = stepDuration > 0 ? (stepDuration - stepTimer) / stepDuration : 0;

  return (
    <div className={`bg-neutral-dark-03 rounded-xl overflow-hidden ${isBiset ? "border-l-2 border-primary" : ""}`}>
      {/* Title bar */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base">{exercise.exerciseName}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {completedSteps.size}/{steps.length} steps · {fmt(totalCircuitDuration)} total
          </p>
        </div>
        {isStarted && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Reiniciar circuito"
            onClick={() => {
              setCompletedSteps(new Set());
              setActiveStepIndex(-1);
              setIsTimerRunning(false);
              setStepTimer(0);
              setStepDuration(0);
            }}
          >
            <RotateCcw size={16} />
          </Button>
        )}
      </div>

      <div className="px-4 pb-4 space-y-3">
        {/* Main display */}
        {allDone ? (
          <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-6 text-center space-y-1">
            <p className="text-3xl">✅</p>
            <p className="font-bold text-green-400 text-lg">Circuito completo!</p>
            <p className="text-xs text-muted-foreground">{steps.length} steps · {fmt(totalCircuitDuration)}</p>
          </div>
        ) : activeStep ? (
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-5 space-y-3">
            {/* Step info */}
            <div className="text-center space-y-0.5">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                Step {activeStepIndex + 1} de {steps.length}
              </p>
              <p className="text-xl font-bold leading-snug">{activeStep.name}</p>
              {activeStep.notes && (
                <p className="text-xs text-muted-foreground italic">{activeStep.notes}</p>
              )}
            </div>

            {/* Big countdown */}
            <p className={`text-center text-7xl font-mono font-bold tabular-nums leading-none ${
              isTimerRunning ? "text-primary" : "text-muted-foreground"
            }`}>
              {fmt(stepTimer)}
            </p>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-primary/10 overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full origin-left"
                animate={{ scaleX: timerProgress }}
                transition={{ duration: 0.4, ease: "linear" }}
                style={{ transformOrigin: "left" }}
              />
            </div>

            {/* Next up */}
            {steps[activeStepIndex + 1] && (
              <p className="text-center text-xs text-muted-foreground">
                A seguir →{" "}
                <span className="font-semibold text-foreground/80">
                  {steps[activeStepIndex + 1].name}
                </span>
                {steps[activeStepIndex + 1].durationSeconds && (
                  <span className="ml-1 opacity-60">({fmt(steps[activeStepIndex + 1].durationSeconds!)})</span>
                )}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-6 text-center space-y-1">
            <p className="text-sm text-muted-foreground">Toque em Iniciar para começar</p>
            <p className="text-xs text-muted-foreground opacity-60">
              {steps.length} steps · {fmt(totalCircuitDuration)}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={isTimerRunning ? "secondary" : "default"}
            className="flex-1"
            onClick={() => {
              if (activeStepIndex < 0) goToStep(0);
              else setIsTimerRunning(!isTimerRunning);
            }}
            disabled={allDone && activeStepIndex < 0}
          >
            {isTimerRunning
              ? <><Pause size={18} className="mr-2" />Pausar</>
              : <><Play size={18} className="mr-2" />{!isStarted ? "Iniciar" : "Continuar"}</>}
          </Button>
          {isStarted && activeStep && (
            <Button
              variant="outline"
              size="icon"
              title="Pular step"
              onClick={() => handleStepDone(activeStepIndex)}
            >
              <ChevronRight size={18} />
            </Button>
          )}
        </div>

        {/* Steps list */}
        <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
          {steps.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            const isDone = completedSteps.has(idx);
            return (
              <button
                key={step.id}
                type="button"
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? "bg-primary/10"
                    : isDone
                    ? "opacity-40"
                    : "hover:bg-neutral-dark-01"
                }`}
                onClick={() => goToStep(idx)}
              >
                <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                  isDone
                    ? "bg-green-500/20 text-green-400"
                    : isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary"
                }`}>
                  {isDone ? "✓" : idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{step.name}</p>
                  {step.notes && (
                    <p className="text-xs text-muted-foreground truncate italic">{step.notes}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0 font-mono">
                  {step.durationSeconds ? fmt(step.durationSeconds) : "—"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── BisetCard ───────────────────────────────────────────────────────────────

interface BisetCardProps {
  first: LocalExerciseSession;
  second: LocalExerciseSession;
  onRegisterSet: (exerciseId: string, load?: number, reps?: number, restSeconds?: number) => void;
  onUpdateNotes: (exerciseId: string, notes: string) => void;
  onAddBisetRound: (firstExerciseId: string, secondExerciseId: string, restSeconds?: number) => void;
  isExpanded: boolean;
  navigate: (path: string) => void;
  templateId?: string;
}

function BisetCard({
  first,
  second,
  onRegisterSet,
  onUpdateNotes,
  onAddBisetRound,
  isExpanded,
  navigate,
  templateId,
}: BisetCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(!isExpanded);
  const [showVideoModal, setShowVideoModal] = useState<"first" | "second" | null>(null);
  const [showNotesFirst, setShowNotesFirst] = useState(false);
  const [showNotesSecond, setShowNotesSecond] = useState(false);

  const restSeconds = second.restSeconds ?? first.restSeconds;

  const completedRounds = Math.min(
    first.sets.filter((s) => s.completed).length,
    second.sets.filter((s) => s.completed).length
  );
  const targetRounds = first.targetSets ?? Math.max(first.sets.length, second.sets.length);

  const renderExerciseSection = (exercise: LocalExerciseSession, isFirst: boolean) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className={`w-1 h-3 rounded-full ${isFirst ? "bg-primary" : "bg-primary/50"}`} />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide truncate">
          {exercise.exerciseName}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_0.95fr_1.05fr] xs:grid-cols-[auto_1fr_0.95fr_1.05fr] gap-1 xs:gap-2 text-[10px] xs:text-xs font-bold text-muted-foreground">
        <span className="hidden xs:block">SÉRIE</span>
        <span>ANTERIOR</span>
        <span className="text-center">
          {exercise.setType === "Time" ? "SEG" : exercise.setType === "Calories" ? "CAL" : (exercise.weightUnit ?? "KG").toUpperCase()}
        </span>
        <span className="text-center">
          {exercise.setType === "Time" || exercise.setType === "Calories" ? "" : "REPS"}
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        {exercise.sets.map((set) => (
          <SetRow
            key={set.id}
            set={set}
            onRegisterSet={onRegisterSet}
            exerciseId={exercise.id}
            restSeconds={isFirst ? undefined : restSeconds}
            targetRepsMin={exercise.targetRepsMin}
            targetRepsMax={exercise.targetRepsMax}
            targetSets={exercise.targetSets}
            setType={exercise.setType}
            weightUnit={exercise.weightUnit}
            targetDurationSeconds={exercise.targetDurationSeconds}
            targetCalories={exercise.targetCalories}
          />
        ))}
      </AnimatePresence>
    </div>
  );

  const renderActionButtons = (exercise: LocalExerciseSession, isFirst: boolean) => (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide truncate">
        {exercise.exerciseName}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0 px-2 xs:px-3"
          onClick={() => setShowVideoModal(isFirst ? "first" : "second")}
          disabled={!exercise.exerciseVideoUrl}
        >
          <Video size={16} />
          <span className="hidden xs:inline">Vídeo</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0 px-2 xs:px-3"
          onClick={() => {
            if (templateId) sessionStorage.setItem("returnToWorkoutSession", templateId);
            navigate(`/exercise/${exercise.exerciseId}/history`);
          }}
        >
          <ChartBar size={16} />
          <span className="hidden xs:inline">Evolução</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0 px-2 xs:px-3"
          onClick={() => isFirst ? setShowNotesFirst((v) => !v) : setShowNotesSecond((v) => !v)}
        >
          <Edit2 size={16} />
          <span className="hidden xs:inline">Notas</span>
        </Button>
      </div>
      <AnimatePresence>
        {(isFirst ? showNotesFirst : showNotesSecond) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Textarea
              placeholder="Adicionar notas aqui..."
              value={exercise.notes || ""}
              onChange={(e) => onUpdateNotes(exercise.id, e.target.value)}
              className="min-h-[60px]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="bg-neutral-dark-03 rounded-lg overflow-hidden border-l-2 border-primary">
      {/* Cabeçalho */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-dark-03/50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <motion.div animate={{ rotate: isCollapsed ? 0 : 90 }} transition={{ duration: 0.2 }}>
            <ChevronRight size={20} className="text-muted-foreground flex-shrink-0" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <h3 className={`font-bold text-base ${isCollapsed ? "truncate" : ""}`} style={{ maxWidth: "40%" }}>
                {first.exerciseName}
              </h3>
              <span className="text-primary font-bold flex-shrink-0 px-0.5">+</span>
              <h3 className={`font-bold text-base ${isCollapsed ? "truncate" : ""}`} style={{ maxWidth: "40%" }}>
                {second.exerciseName}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">biset</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-xs text-muted-foreground">
                {completedRounds} de {targetRounds} rodadas
              </span>
            </div>
          </div>
        </div>

        {/* Indicador de descanso */}
        {!isCollapsed && restSeconds && (
          <button
            className="flex items-center gap-1.5 h-auto px-2 py-1 rounded border border-neutral-dark-03 bg-neutral-dark-01 text-muted-foreground flex-shrink-0 hover:border-primary/50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(
                new CustomEvent("startRestTimer", {
                  detail: { exerciseId: second.id, duration: restSeconds, label: `${first.exerciseName} + ${second.exerciseName}` },
                })
              );
            }}
            title="Iniciar timer de descanso"
          >
            <Clock size={12} />
            <span className="text-xs font-mono">{restSeconds}s</span>
          </button>
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
            <div className="px-4 pb-4 space-y-4">
              {/* Sets do primeiro exercício */}
              {renderExerciseSection(first, true)}

              {/* Divisor com ícone de biset */}
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-primary/20" />
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/60 flex-shrink-0">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <div className="h-px flex-1 bg-primary/20" />
              </div>

              {/* Sets do segundo exercício */}
              {renderExerciseSection(second, false)}

              {/* Botão adicionar rodada */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onAddBisetRound(first.id, second.id, restSeconds)}
              >
                <Plus size={16} className="mr-1" />
                Adicionar Rodada
              </Button>

              {/* Botões de ação por exercício */}
              {renderActionButtons(first, true)}
              {renderActionButtons(second, false)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de vídeo - primeiro exercício */}
      <Drawer open={showVideoModal === "first"} onOpenChange={(open) => !open && setShowVideoModal(null)}>
        <DrawerContent>
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <DrawerTitle>{first.exerciseName}</DrawerTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowVideoModal(null)}><X size={20} /></Button>
            </div>
            <DrawerDescription>Assista ao vídeo demonstrativo do exercício</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <div className="relative w-full pb-[56.25%] bg-neutral-dark-02 rounded-lg overflow-hidden">
              {first.exerciseVideoUrl && (
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={
                    first.exerciseVideoUrl.includes("youtube.com/watch?v=")
                      ? first.exerciseVideoUrl.replace("watch?v=", "embed/")
                      : first.exerciseVideoUrl.includes("youtu.be/")
                      ? first.exerciseVideoUrl.replace("youtu.be/", "youtube.com/embed/")
                      : first.exerciseVideoUrl
                  }
                  title={first.exerciseName}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
          <DrawerFooter><Button onClick={() => setShowVideoModal(null)}>Fechar</Button></DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Modal de vídeo - segundo exercício */}
      <Drawer open={showVideoModal === "second"} onOpenChange={(open) => !open && setShowVideoModal(null)}>
        <DrawerContent>
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <DrawerTitle>{second.exerciseName}</DrawerTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowVideoModal(null)}><X size={20} /></Button>
            </div>
            <DrawerDescription>Assista ao vídeo demonstrativo do exercício</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <div className="relative w-full pb-[56.25%] bg-neutral-dark-02 rounded-lg overflow-hidden">
              {second.exerciseVideoUrl && (
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={
                    second.exerciseVideoUrl.includes("youtube.com/watch?v=")
                      ? second.exerciseVideoUrl.replace("watch?v=", "embed/")
                      : second.exerciseVideoUrl.includes("youtu.be/")
                      ? second.exerciseVideoUrl.replace("youtu.be/", "youtube.com/embed/")
                      : second.exerciseVideoUrl
                  }
                  title={second.exerciseName}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
          <DrawerFooter><Button onClick={() => setShowVideoModal(null)}>Fechar</Button></DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

// ─── FloatingTimer ─────────────────────────────────────────────────────────

function FloatingTimer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [mode, setMode] = useState<"stopwatch" | "countdown">("stopwatch");
  const [countdownTarget, setCountdownTarget] = useState(30);
  const [countdownInput, setCountdownInput] = useState("30");
  const [exerciseLabel, setExerciseLabel] = useState<string | null>(null);
  const [timerKind, setTimerKind] = useState<"exercise" | "rest" | "manual">("manual");

  const isFinished = mode === "countdown" && elapsed >= countdownTarget;
  const displaySeconds =
    mode === "countdown" ? Math.max(0, countdownTarget - elapsed) : elapsed;
  const minutes = Math.floor(displaySeconds / 60);
  const secs = displaySeconds % 60;
  const timeStr = `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setElapsed((prev) => {
        if (mode === "countdown" && prev >= countdownTarget) {
          setIsRunning(false);
          if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
          return countdownTarget;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, mode, countdownTarget]);

  useEffect(() => {
    const handleExercise = (e: Event) => {
      const { duration, label } = (e as CustomEvent<{ duration: number; label?: string }>).detail;
      setMode("countdown");
      setCountdownTarget(duration);
      setCountdownInput(String(duration));
      setElapsed(0);
      setIsRunning(true);
      setIsExpanded(true);
      setExerciseLabel(label ?? null);
      setTimerKind("exercise");
    };
    window.addEventListener("startExerciseTimer", handleExercise);
    return () => window.removeEventListener("startExerciseTimer", handleExercise);
  }, []);

  useEffect(() => {
    const handleRest = (e: Event) => {
      const { duration, label } = (e as CustomEvent<{ duration: number; label?: string }>).detail;
      if (!duration) return;
      setMode("countdown");
      setCountdownTarget(duration);
      setCountdownInput(String(duration));
      setElapsed(0);
      setIsRunning(true);
      setIsExpanded(true);
      setExerciseLabel(label ?? null);
      setTimerKind("rest");
    };
    window.addEventListener("startRestTimer", handleRest);
    return () => window.removeEventListener("startRestTimer", handleRest);
  }, []);

  const handleReset = () => {
    setElapsed(0);
    setIsRunning(false);
    setExerciseLabel(null);
    setTimerKind("manual");
  };

  const handlePlayPause = () => {
    if (isFinished) {
      setElapsed(0);
      setIsRunning(true);
    } else {
      setIsRunning((prev) => !prev);
    }
  };

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const progress =
    mode === "countdown" && countdownTarget > 0
      ? Math.min(elapsed / countdownTarget, 1)
      : 0;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="bg-neutral-900 border border-neutral-700 rounded-2xl p-4 shadow-2xl w-52"
          >
            {/* Label de contexto (exercício ou descanso) */}
            {timerKind !== "manual" && (
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  timerKind === "rest"
                    ? "bg-blue-500/15 text-blue-400"
                    : "bg-primary/15 text-primary"
                }`}>
                  {timerKind === "rest" ? "Descanso" : "Execução"}
                </span>
              </div>
            )}
            {exerciseLabel && (
              <p className="text-[10px] text-muted-foreground mb-3 text-center truncate">
                {exerciseLabel}
              </p>
            )}

            {/* Mode tabs */}
            <div className="flex gap-1 mb-4">
              <button
                onClick={() => { setMode("stopwatch"); handleReset(); }}
                className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
                  mode === "stopwatch"
                    ? "bg-primary text-primary-foreground"
                    : "bg-neutral-800 text-muted-foreground hover:text-foreground"
                }`}
              >
                Cronômetro
              </button>
              <button
                onClick={() => { setMode("countdown"); handleReset(); }}
                className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
                  mode === "countdown"
                    ? "bg-primary text-primary-foreground"
                    : "bg-neutral-800 text-muted-foreground hover:text-foreground"
                }`}
              >
                Contagem
              </button>
            </div>

            {/* Timer display */}
            <div className="relative flex items-center justify-center mb-4 h-20">
              {mode === "countdown" && (
                <svg className="absolute w-20 h-20 -rotate-90" viewBox="0 0 88 88">
                  <circle cx="44" cy="44" r={radius} fill="none" stroke="#262626" strokeWidth="5" />
                  <circle
                    cx="44"
                    cy="44"
                    r={radius}
                    fill="none"
                    stroke={isFinished ? "#ef4444" : timerKind === "rest" ? "#3b82f6" : "#22c55e"}
                    strokeWidth="5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.9s linear" }}
                  />
                </svg>
              )}
              <span
                className={`text-3xl font-mono font-bold z-10 ${
                  isFinished
                    ? "text-red-500"
                    : isRunning
                    ? "text-green-400"
                    : "text-foreground"
                }`}
              >
                {timeStr}
              </span>
            </div>

            {/* Countdown target input (only when stopped) */}
            {mode === "countdown" && !isRunning && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Meta (s):</span>
                <Input
                  type="number"
                  value={countdownInput}
                  onChange={(e) => {
                    setCountdownInput(e.target.value);
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val > 0) {
                      setCountdownTarget(val);
                      setElapsed(0);
                    }
                  }}
                  className="h-7 text-xs text-center"
                />
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleReset} className="flex-1">
                <RotateCcw size={13} />
              </Button>
              <Button size="sm" onClick={handlePlayPause} className="flex-1">
                {isRunning ? <Pause size={13} /> : <Play size={13} />}
              </Button>
            </div>

            {/* Descartar */}
            <button
              onClick={() => { handleReset(); setIsExpanded(false); }}
              className="w-full mt-2 text-[11px] text-muted-foreground hover:text-red-400 transition-colors flex items-center justify-center gap-1"
            >
              <X size={11} />
              descartar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => setIsExpanded((p) => !p)}
        whileTap={{ scale: 0.88 }}
        animate={isRunning ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={
          isRunning
            ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
            : {}
        }
        className={`w-14 h-14 rounded-full shadow-xl flex flex-col items-center justify-center gap-0.5 border-2 transition-colors ${
          isFinished
            ? "bg-red-900/80 border-red-500 text-red-400"
            : isRunning && timerKind === "rest"
            ? "bg-blue-900/80 border-blue-500 text-blue-300"
            : isRunning
            ? "bg-green-900/80 border-green-500 text-green-300"
            : isExpanded
            ? "bg-neutral-800 border-primary text-primary"
            : "bg-neutral-900 border-neutral-700 text-foreground"
        }`}
      >
        <Timer size={18} />
        <span className="text-[10px] font-mono leading-none">{timeStr}</span>
      </motion.button>
    </div>
  );
}

// ─── SetRow ──────────────────────────────────────────────────────────────────

// Componente de Linha de Série
interface SetRowProps {
  set: LocalSetSession;
  exerciseId: string;
  restSeconds?: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
  targetSets?: number;
  setType?: string;
  weightUnit?: string;
  targetDurationSeconds?: number;
  targetCalories?: number;
  onRegisterSet: (
    exerciseId: string,
    load?: number,
    reps?: number,
    restSeconds?: number
  ) => void;
}

function SetRow({ set, exerciseId, restSeconds, targetRepsMin, targetRepsMax, targetSets, setType = "Reps", weightUnit = "kg", targetDurationSeconds, targetCalories, onRegisterSet }: SetRowProps) {
  const [editData, setEditData] = useState<{
    load?: number;
    reps?: number;
    durationSeconds?: number;
    calories?: number;
  }>({
    load: set.load,
    reps: set.reps,
    durationSeconds: set.durationSeconds,
    calories: set.calories,
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
              setEditData({ load: set.load, reps: set.reps, durationSeconds: set.durationSeconds, calories: set.calories });
              setIsEditing(true);
            }
          }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="grid grid-cols-[1fr_0.95fr_1.05fr] xs:grid-cols-[auto_1fr_0.95fr_1.05fr] gap-1 xs:gap-2 items-center bg-neutral-dark-03 relative z-10 py-4"
          whileTap={{ scale: 0.98 }}
        >
          <div className="hidden xs:flex items-center gap-1.5">
            <GripVertical size={18} className="text-muted-foreground/60" />
            <span className="text-sm font-bold">{set.setNumber}</span>
          </div>
          <span className="text-xs xs:text-sm text-muted-foreground">
            {set.previousLoad && set.previousReps
              ? `${set.previousLoad}${weightUnit} x ${set.previousReps}`
              : "-"}
          </span>
          <span className="text-xs xs:text-sm font-mono font-bold text-green-500 text-center">
            {setType === "Time"
              ? set.durationSeconds ? `${set.durationSeconds}s` : "-"
              : setType === "Calories"
              ? set.calories ? `${set.calories} cal` : "-"
              : set.load ? `${set.load}${weightUnit}` : "-"}
          </span>
          <span className="text-xs xs:text-sm font-mono font-bold text-green-500 text-center">
            {setType === "Time" || setType === "Calories" ? "✓" : set.reps || "-"}
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
            const finalDurationSeconds = editData.durationSeconds || set.durationSeconds;
            const finalCalories = editData.calories || set.calories;

            // Verifica se já estava completada (vindo de edição)
            const wasAlreadyCompleted = set.completed;

            updatedWorkout.exercises[exerciseIndex].sets[setIndex] = {
              ...set,
              load: setType === "Reps" ? finalLoad : undefined,
              reps: setType === "Reps" ? finalReps : undefined,
              durationSeconds: setType === "Time" ? finalDurationSeconds : undefined,
              calories: setType === "Calories" ? finalCalories : undefined,
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
                  detail: { exerciseId, duration: restSeconds },
                })
              );
            }
          }
        }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="grid grid-cols-[1fr_0.95fr_1.05fr] xs:grid-cols-[auto_1fr_0.95fr_1.05fr] gap-1 xs:gap-2 items-center bg-neutral-dark-03 relative z-10 py-4"
        whileTap={{ scale: 0.98 }}
      >
        <div className="hidden xs:flex items-center gap-1.5">
          <GripVertical size={18} className="text-muted-foreground/60" />
          <span className="text-sm font-bold">{set.setNumber}</span>
        </div>
        <span className="text-xs xs:text-sm text-muted-foreground">
          {set.previousLoad && set.previousReps
            ? `${set.previousLoad}${weightUnit} x ${set.previousReps}`
            : "-"}
        </span>
        {setType === "Time" ? (
          <Input
            type="number"
            placeholder={targetDurationSeconds ? `${targetDurationSeconds}s` : "seg"}
            className="h-8 text-xs xs:text-sm text-center"
            value={editData.durationSeconds || ""}
            onChange={(e) =>
              setEditData((prev) => ({
                ...prev,
                durationSeconds: parseInt(e.target.value) || undefined,
              }))
            }
          />
        ) : setType === "Calories" ? (
          <Input
            type="number"
            placeholder={targetCalories ? `${targetCalories}` : "cal"}
            className="h-8 text-xs xs:text-sm text-center"
            value={editData.calories || ""}
            onChange={(e) =>
              setEditData((prev) => ({
                ...prev,
                calories: parseFloat(e.target.value) || undefined,
              }))
            }
          />
        ) : (
          <Input
            type="number"
            placeholder={set.previousLoad ? `${set.previousLoad}` : "carga"}
            className="h-8 text-xs xs:text-sm text-center"
            value={editData.load || ""}
            onChange={(e) =>
              setEditData((prev) => ({
                ...prev,
                load: parseFloat(e.target.value) || undefined,
              }))
            }
          />
        )}
        {setType === "Reps" ? (
          <Input
            type="number"
            placeholder={(() => {
              const isExtra = targetSets && set.setNumber > targetSets;
              if (isExtra) return "extra";
              const targetReps = targetRepsMax || targetRepsMin || null;
              if (set.previousReps && targetReps) return `${set.previousReps} de ${targetReps}`;
              if (set.previousReps) return `${set.previousReps}`;
              if (targetReps) return `0 de ${targetReps}`;
              return "reps";
            })()}
            className="h-8 text-xs xs:text-sm text-center"
            value={editData.reps || ""}
            onChange={(e) =>
              setEditData((prev) => ({
                ...prev,
                reps: parseInt(e.target.value) || undefined,
              }))
            }
          />
        ) : setType === "Time" ? (
          <button
            className="flex items-center justify-center w-full h-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            onClick={() => {
              const dur = editData.durationSeconds || targetDurationSeconds || 30;
              if (!editData.durationSeconds && targetDurationSeconds) {
                setEditData((prev) => ({ ...prev, durationSeconds: targetDurationSeconds }));
              }
              window.dispatchEvent(
                new CustomEvent("startExerciseTimer", {
                  detail: { duration: dur },
                })
              );
            }}
          >
            <Play size={14} />
          </button>
        ) : (
          <span className="text-xs text-muted-foreground text-center self-center">cal</span>
        )}
      </motion.div>
    </motion.div>
  );
}
