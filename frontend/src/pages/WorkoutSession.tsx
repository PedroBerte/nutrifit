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
  ChevronLeft,
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
      setLocalWorkout(existingWorkout);
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
      const inProgressExercise = localWorkout.exercises.find(
        (ex) => ex.status === "IP"
      );

      if (inProgressExercise) {
        setExpandedExerciseIds(new Set([inProgressExercise.id]));
        setCurrentExerciseId(inProgressExercise.id);
      } else {
        const notStartedExercise = localWorkout.exercises.find(
          (ex) => ex.status === "SK"
        );
        if (notStartedExercise) {
          setExpandedExerciseIds(new Set([notStartedExercise.id]));
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
      className="flex flex-1 flex-col"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-neutral-dark-02 p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-neutral-dark-02 rounded-full"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">{template.title}</h1>
          <Button onClick={handleCompleteSession} size="sm">
            Concluir
          </Button>
        </div>

        {/* Timer e Resumo */}
        <div className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span className="font-mono font-bold">
              {formatTime(workoutTimer)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Dumbbell size={16} />
            <span>{calculateTotalVolume(localWorkout).toFixed(1)} kg</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{getTotalSets(localWorkout)} séries</span>
          </div>
        </div>

        {/* Timer de descanso */}
        {restTimer !== null && restTimer > 0 && (
          <div className="mt-3 p-3 bg-primary/10 rounded-lg flex items-center justify-between">
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
              className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-3"
            >
              <GripVertical size={20} className="text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-500">
                  Dica: Arraste as séries para a esquerda para deletá-las
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs"
                onClick={() => {
                  setShowSwipeHint(false);
                  localStorage.setItem("hasSeenSwipeHint", "true");
                }}
              >
                Entendi
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lista de Exercícios */}
      <div className="flex-1 p-2 space-y-4">
        {localWorkout.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onRegisterSet={handleRegisterSet}
            onUpdateNotes={handleUpdateExerciseNotes}
            onAddSet={handleAddSet}
          />
        ))}

        {/* Botão Cancelar no final */}
        <div className="pt-4">
          <Button
            variant="destructive"
            onClick={() => setShowCancelConfirm(true)}
            className="w-full"
          >
            Cancelar Treino
          </Button>
        </div>
      </div>

      {/* Sheet de confirmação de cancelamento */}
      <Sheet open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <SheetContent side="bottom" className="max-h-[80vh]">
          <SheetHeader>
            <div className="flex items-center gap-2 text-yellow-500 mb-2">
              <AlertTriangle size={24} />
              <SheetTitle>Cancelar Treino?</SheetTitle>
            </div>
            <SheetDescription>
              Tem certeza que deseja cancelar este treino?
              <br />
              Todo o progresso será perdido.
            </SheetDescription>
          </SheetHeader>

          <SheetFooter className="gap-2 sm:gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Continuar Treino
            </Button>
            <Button variant="destructive" onClick={handleCancelSession}>
              Sim, cancelar treino
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
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
}

function ExerciseCard({
  exercise,
  onRegisterSet,
  onUpdateNotes,
  onAddSet,
}: ExerciseCardProps) {
  return (
    <div className="bg-neutral-dark-03 rounded-lg p-4 space-y-4">
      {/* Cabeçalho do Exercício */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-lg">{exercise.exerciseName}</h3>
          {exercise.restSeconds && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Timer size={14} />
              Tempo de Descanso: {exercise.restSeconds}s
            </p>
          )}
        </div>
      </div>

      {/* Campo de Notas */}
      <Textarea
        placeholder="Adicionar notas aqui..."
        value={exercise.notes || ""}
        onChange={(e) => onUpdateNotes(exercise.id, e.target.value)}
        className="min-h-[60px]"
      />

      {/* Tabela de Séries */}
      <div className="space-y-2">
        <div className="grid grid-cols-5 gap-2 text-xs font-bold text-muted-foreground">
          <span>SÉRIE</span>
          <span>ANTERIOR</span>
          <span>KG</span>
          <span>REPS</span>
          <span className="text-center">✓</span>
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

      {/* Botão Adicionar Série */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => onAddSet(exercise.id, exercise.restSeconds)}
      >
        <Plus size={16} className="mr-2" />
        Adicionar Série
      </Button>
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
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(_, info) => {
          setIsDragging(false);
          // Se arrastou mais de 80px para a esquerda, deleta
          if (info.offset.x < -80) {
            handleDelete();
          }
        }}
        className="relative"
      >
        {/* Fundo vermelho com ícone de lixeira */}
        <motion.div
          className="absolute inset-0 bg-red-500/20 rounded flex items-center justify-end pr-4"
          animate={
            isDragging ? { backgroundColor: "rgba(239, 68, 68, 0.3)" } : {}
          }
        >
          <motion.div
            animate={
              isDragging
                ? {
                    scale: [1, 1.2, 1],
                    transition: { repeat: Infinity, duration: 0.6 },
                  }
                : {}
            }
          >
            <Trash2 size={16} className="text-red-500" />
          </motion.div>
        </motion.div>

        {/* Conteúdo da série */}
        <motion.div
          className="grid grid-cols-5 gap-2 items-center bg-neutral-dark-03 relative z-10"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-1">
            <GripVertical size={14} className="text-muted-foreground/30" />
            <span className="text-sm font-bold">{set.setNumber}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {set.previousLoad && set.previousReps
              ? `${set.previousLoad}kg x ${set.previousReps}`
              : "-"}
          </span>
          <span className="text-sm font-mono">{set.load || "-"}kg</span>
          <span className="text-sm font-mono">{set.reps || "-"}</span>
          <div className="flex justify-center gap-1">
            <Check size={16} className="text-green-500" />
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => {
                setEditData({ load: set.load, reps: set.reps });
                setIsEditing(true);
              }}
            >
              <Edit2 size={12} />
            </Button>
          </div>
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
      drag="x"
      dragConstraints={{ left: -100, right: 0 }}
      dragElastic={0.2}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false);
        // Se arrastou mais de 80px para a esquerda, deleta
        if (info.offset.x < -80) {
          handleDelete();
        }
      }}
      className="relative"
    >
      {/* Fundo vermelho com ícone de lixeira */}
      <motion.div
        className="absolute inset-0 bg-red-500/20 rounded flex items-center justify-end pr-4"
        animate={
          isDragging ? { backgroundColor: "rgba(239, 68, 68, 0.3)" } : {}
        }
      >
        <motion.div
          animate={
            isDragging
              ? {
                  scale: [1, 1.2, 1],
                  transition: { repeat: Infinity, duration: 0.6 },
                }
              : {}
          }
        >
          <Trash2 size={16} className="text-red-500" />
        </motion.div>
      </motion.div>

      {/* Conteúdo da série */}
      <motion.div
        className="grid grid-cols-5 gap-2 items-center bg-neutral-dark-03 relative z-10"
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-1">
          <GripVertical size={14} className="text-muted-foreground/30" />
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
          className="h-8 text-sm"
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
          className="h-8 text-sm"
          value={editData.reps || ""}
          onChange={(e) =>
            setEditData((prev) => ({
              ...prev,
              reps: parseInt(e.target.value) || undefined,
            }))
          }
        />
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-full p-0"
          onClick={() => {
            // Atualiza a série existente com os dados preenchidos
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

            updatedWorkout.exercises[exerciseIndex].sets[setIndex] = {
              ...set,
              load: finalLoad,
              reps: finalReps,
              completed: true,
              completedAt: new Date().toISOString(),
            };

            saveLocalWorkout(updatedWorkout);
            setIsEditing(false); // Sai do modo de edição
            // Força re-render do componente pai
            window.dispatchEvent(new Event("storage"));
          }}
        >
          <Check size={16} />
        </Button>
      </motion.div>
    </motion.div>
  );
}
