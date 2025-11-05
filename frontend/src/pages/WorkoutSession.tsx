import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetWorkoutTemplateById } from "@/services/api/workoutTemplate";
import { useCompleteWorkoutSession } from "@/services/api/workoutSession";
import {
  getLocalWorkout,
  saveLocalWorkout,
  clearLocalWorkout,
  addSetToExercise,
  updateExerciseNotes,
  calculateTotalVolume,
  getTotalSets,
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
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { motion, AnimatePresence } from "motion/react";

export default function WorkoutSession() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [localWorkout, setLocalWorkout] = useState<LocalWorkoutSession | null>(
    null
  );
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
      </div>

      {/* Lista de Exercícios */}
      <div className="flex-1 p-2 space-y-4">
        {localWorkout.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onRegisterSet={handleRegisterSet}
            onUpdateNotes={handleUpdateExerciseNotes}
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
}

function ExerciseCard({
  exercise,
  onRegisterSet,
  onUpdateNotes,
}: ExerciseCardProps) {
  const [newSetData, setNewSetData] = useState<{
    load?: number;
    reps?: number;
  }>({});

  const nextSetNumber = exercise.sets.length + 1;

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

        {/* Séries já registradas */}
        {exercise.sets.map((set) => (
          <SetRow key={set.id} set={set} />
        ))}

        {/* Nova série */}
        <div className="grid grid-cols-5 gap-2 items-center">
          <span className="text-sm font-bold">{nextSetNumber}</span>
          <span className="text-sm text-muted-foreground">
            {exercise.suggestedLoad
              ? `${exercise.suggestedLoad}kg x ${exercise.targetRepsMin || ""}`
              : "-"}
          </span>
          <Input
            type="number"
            placeholder="kg"
            className="h-8 text-sm"
            value={newSetData.load || ""}
            onChange={(e) =>
              setNewSetData((prev) => ({
                ...prev,
                load: parseFloat(e.target.value) || undefined,
              }))
            }
          />
          <Input
            type="number"
            placeholder="reps"
            className="h-8 text-sm"
            value={newSetData.reps || ""}
            onChange={(e) =>
              setNewSetData((prev) => ({
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
              onRegisterSet(
                exercise.id,
                newSetData.load,
                newSetData.reps,
                exercise.restSeconds
              );
              setNewSetData({});
            }}
          >
            <Check size={16} />
          </Button>
        </div>
      </div>

      {/* Botão Adicionar Série */}
      <Button variant="outline" size="sm" className="w-full">
        <Plus size={16} className="mr-2" />
        Adicionar Série
      </Button>
    </div>
  );
}

// Componente de Linha de Série
interface SetRowProps {
  set: LocalSetSession;
}

function SetRow({ set }: SetRowProps) {
  return (
    <div className="grid grid-cols-5 gap-2 items-center">
      <span className="text-sm font-bold">{set.setNumber}</span>
      <span className="text-sm text-muted-foreground">-</span>
      <span className="text-sm font-mono">{set.load || "-"}kg</span>
      <span className="text-sm font-mono">{set.reps || "-"}</span>
      <div className="flex justify-center">
        {set.completed ? (
          <Check size={16} className="text-green-500" />
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </div>
    </div>
  );
}
