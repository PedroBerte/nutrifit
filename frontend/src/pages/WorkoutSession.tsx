import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  useStartWorkoutSession,
  useGetWorkoutSessionById,
  useCompleteWorkoutSession,
  useCancelWorkoutSession,
  useStartExerciseSession,
  useRegisterSet,
  useUpdateSet,
  useDeleteSet,
  type ExerciseSessionResponse,
  type SetSessionResponse,
} from "@/services/api/workoutSession";
import { useGetWorkoutTemplateById } from "@/services/api/workoutTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  Clock,
  Dumbbell,
  Plus,
  Trash2,
  Check,
  Timer,
  Play,
  Pause,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { motion } from "motion/react";

export default function WorkoutSession() {
  const { templateId } = useParams<{ templateId: string }>();
  const [searchParams] = useSearchParams();
  const existingSessionId = searchParams.get("sessionId");
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [sessionId, setSessionId] = useState<string | null>(
    existingSessionId || null
  );
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [isWorkoutTimerRunning, setIsWorkoutTimerRunning] = useState(false);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false);
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(
    null
  );

  // Queries
  const { data: templateData } = useGetWorkoutTemplateById(templateId);
  const { data: sessionData, refetch: refetchSession } =
    useGetWorkoutSessionById(sessionId);

  // Mutations
  const startSession = useStartWorkoutSession();
  const completeSession = useCompleteWorkoutSession();
  const cancelSession = useCancelWorkoutSession();
  const startExercise = useStartExerciseSession();
  const registerSet = useRegisterSet();
  const updateSet = useUpdateSet();
  const deleteSet = useDeleteSet();

  const template = templateData?.data;
  const session = sessionData?.data;

  // Inicializa ExerciseSessions quando sessão é criada
  useEffect(() => {
    if (session && template && session.exerciseSessions?.length === 0) {
      // Auto-inicializa todos os exercícios do template
      const initExercises = async () => {
        for (const exerciseTemplate of template.exerciseTemplates || []) {
          try {
            await startExercise.mutateAsync({
              sessionId: session.id,
              data: { exerciseTemplateId: exerciseTemplate.id },
            });
          } catch (error) {
            console.error("Erro ao inicializar exercício", error);
          }
        }
        refetchSession();
      };
      initExercises();
    }
  }, [session?.id, template?.id]);

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
            // Descanso finalizado
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRestTimerRunning, restTimer]);

  // Iniciar sessão de treino
  useEffect(() => {
    // Se já tem sessionId (vindo da URL), não tenta criar uma nova
    if (existingSessionId) {
      setIsWorkoutTimerRunning(true);
      return;
    }

    // Só cria nova sessão se não existe
    if (templateId && !sessionId) {
      handleStartSession();
    }
  }, [templateId, existingSessionId]);

  const handleStartSession = async () => {
    if (!templateId) return;

    try {
      const response = await startSession.mutateAsync({
        workoutTemplateId: templateId,
      });
      if (response.success && response.data) {
        setSessionId(response.data.toString());
        setIsWorkoutTimerRunning(true);
      }
    } catch (error: any) {
      console.error("Erro ao iniciar treino", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao iniciar treino";

      // Em vez de mostrar erro e voltar, mostra toast informativo
      toast.info("Este treino já foi iniciado anteriormente");

      // Tenta buscar o treino ativo e redirecionar
      navigate("/workout", { replace: true });
    }
  };

  const handleCompleteSession = async () => {
    if (!sessionId) return;

    try {
      await completeSession.mutateAsync({
        sessionId,
        data: {},
      });
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

  const handleCancelSession = async () => {
    if (!sessionId) return;

    if (!confirm("Tem certeza que deseja cancelar este treino?")) return;

    try {
      await cancelSession.mutateAsync(sessionId);
      setIsWorkoutTimerRunning(false);
      toast.info("Treino cancelado");
      navigate("/workout");
    } catch (error: any) {
      console.error("Erro ao cancelar treino", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao cancelar treino";
      toast.error(errorMessage);
    }
  };

  const handleStartExercise = async (exerciseTemplateId: string) => {
    if (!sessionId) return;

    try {
      const response = await startExercise.mutateAsync({
        sessionId,
        data: { exerciseTemplateId },
      });
      if (response.success && response.data) {
        setCurrentExerciseId(response.data.toString());
        refetchSession();
      }
    } catch (error) {
      console.error("Erro ao iniciar exercício", error);
    }
  };

  const handleRegisterSet = async (
    exerciseSessionId: string,
    setNumber: number,
    load?: number,
    reps?: number,
    restSeconds?: number
  ) => {
    try {
      await registerSet.mutateAsync({
        exerciseId: exerciseSessionId,
        data: {
          setNumber,
          load,
          reps,
          restSeconds,
          completed: true,
        },
      });

      // Inicia timer de descanso se definido
      if (restSeconds && restSeconds > 0) {
        setRestTimer(restSeconds);
        setIsRestTimerRunning(true);
      }

      refetchSession();
    } catch (error) {
      console.error("Erro ao registrar série", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const calculateTotalVolume = () => {
    if (!session?.exerciseSessions) return 0;
    return session.exerciseSessions.reduce((total, exercise) => {
      const exerciseVolume =
        exercise.setSessions?.reduce(
          (sum, set) => sum + (set.load || 0) * (set.reps || 0),
          0
        ) || 0;
      return total + exerciseVolume;
    }, 0);
  };

  const getTotalSets = () => {
    if (!session?.exerciseSessions) return 0;
    return session.exerciseSessions.reduce(
      (total, exercise) => total + (exercise.setSessions?.length || 0),
      0
    );
  };

  if (!template || !session) {
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
            <span>{calculateTotalVolume().toFixed(1)} kg</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{getTotalSets()} séries</span>
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
        {session.exerciseSessions && session.exerciseSessions.length > 0 ? (
          session.exerciseSessions.map((exerciseSession, index) => (
            <ExerciseCard
              key={exerciseSession.id}
              exerciseSession={exerciseSession}
              onStartExercise={handleStartExercise}
              onRegisterSet={handleRegisterSet}
              isActive={currentExerciseId === exerciseSession.id}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando exercícios...</p>
          </div>
        )}

        {/* Botão Cancelar no final */}
        <div className="pt-4">
          <Button
            variant="destructive"
            onClick={handleCancelSession}
            className="w-full"
          >
            Cancelar Treino
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Componente do Card de Exercício
interface ExerciseCardProps {
  exerciseSession: ExerciseSessionResponse;
  onStartExercise: (exerciseTemplateId: string) => void;
  onRegisterSet: (
    exerciseSessionId: string,
    setNumber: number,
    load?: number,
    reps?: number,
    restSeconds?: number
  ) => void;
  isActive: boolean;
}

function ExerciseCard({
  exerciseSession,
  onStartExercise,
  onRegisterSet,
  isActive,
}: ExerciseCardProps) {
  const [notes, setNotes] = useState(exerciseSession.notes || "");
  const [newSetData, setNewSetData] = useState<{
    load?: number;
    reps?: number;
  }>({});

  const nextSetNumber = (exerciseSession.setSessions?.length || 0) + 1;
  const restSeconds = exerciseSession.restSeconds;

  return (
    <div
      className={`bg-neutral-dark-03 rounded-lg p-4 space-y-4 ${
        isActive ? "ring-2 ring-primary" : ""
      }`}
    >
      {/* Cabeçalho do Exercício */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-lg">{exerciseSession.exerciseName}</h3>
          {restSeconds && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Timer size={14} />
              Tempo de Descanso: {restSeconds}s
            </p>
          )}
        </div>
        {exerciseSession.status === "IP" && (
          <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
            Em andamento
          </span>
        )}
      </div>

      {/* Campo de Notas */}
      <Textarea
        placeholder="Adicionar notas aqui..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
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
        {exerciseSession.setSessions?.map((set) => (
          <SetRow key={set.id} set={set} />
        ))}

        {/* Nova série */}
        {exerciseSession.status === "IP" && (
          <div className="grid grid-cols-5 gap-2 items-center">
            <span className="text-sm font-bold">{nextSetNumber}</span>
            <span className="text-sm text-muted-foreground">
              {exerciseSession.suggestedLoad
                ? `${exerciseSession.suggestedLoad}kg x ${
                    exerciseSession.targetRepsMin || ""
                  }`
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
                  exerciseSession.id,
                  nextSetNumber,
                  newSetData.load,
                  newSetData.reps,
                  restSeconds
                );
                setNewSetData({});
              }}
            >
              <Check size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* Botão Adicionar Série */}
      {exerciseSession.status === "IP" && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            // Só inicia o exercício se ainda não foi iniciado
            if (!isActive) {
              onStartExercise(exerciseSession.exerciseTemplateId);
            }
          }}
        >
          <Plus size={16} className="mr-2" />
          Adicionar Série
        </Button>
      )}
    </div>
  );
}

// Componente de Linha de Série
interface SetRowProps {
  set: SetSessionResponse;
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
