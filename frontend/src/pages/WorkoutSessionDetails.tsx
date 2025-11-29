import { useNavigate, useParams } from "react-router-dom";
import { useGetWorkoutSessionById } from "@/services/api/workoutSession";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Dumbbell,
  Timer,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Minus,
} from "lucide-react";

export default function WorkoutSessionDetails() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const {
    data: sessionData,
    isLoading,
    error,
  } = useGetWorkoutSessionById(sessionId);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center h-full"
      >
        <p className="text-neutral-white-02">Carregando treino...</p>
      </motion.div>
    );
  }

  if (error || !sessionData?.data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center h-full"
      >
        <p className="text-red-500">Erro ao carregar treino</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft size={16} className="mr-2" />
          Voltar
        </Button>
      </motion.div>
    );
  }

  const session = sessionData.data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "IP":
        return "Em progresso";
      case "C":
        return "Completo";
      case "SK":
        return "Pulado";
      case "CA":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "C":
        return <CheckCircle size={16} className="text-green-500" />;
      case "SK":
        return <Minus size={16} className="text-yellow-500" />;
      case "CA":
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Timer size={16} className="text-blue-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-full bg-neutral-dark-01 p-4 gap-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-bold">{session.workoutTemplateTitle}</h1>
          <p className="text-sm text-neutral-white-02">
            {session.routineTitle}
          </p>
        </div>
      </div>

      {/* Workout Info Card */}
      <div className="bg-neutral-dark-03 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-primary" />
          <span className="text-sm">{formatDate(session.startedAt)}</span>
        </div>

        {session.durationMinutes && (
          <div className="flex items-center gap-2">
            <Timer size={18} className="text-primary" />
            <span className="text-sm">{session.durationMinutes} minutos</span>
          </div>
        )}

        {session.totalVolume && (
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            <span className="text-sm">
              Volume total: {session.totalVolume.toFixed(0)} kg
            </span>
          </div>
        )}

        {session.difficultyRating && (
          <div className="flex items-center gap-2">
            <Dumbbell size={18} className="text-primary" />
            <span className="text-sm">
              Dificuldade: {session.difficultyRating}/5
            </span>
          </div>
        )}

        {session.notes && (
          <div className="pt-2 border-t border-neutral-dark-02">
            <p className="text-xs text-neutral-white-02 mb-1">Observações</p>
            <p className="text-sm">{session.notes}</p>
          </div>
        )}
      </div>

      {/* Exercises List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Dumbbell size={20} />
          Exercícios
        </h2>

        {!session.exerciseSessions || session.exerciseSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-neutral-white-02">
            <p>Nenhum exercício registrado</p>
          </div>
        ) : (
          session.exerciseSessions.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-neutral-dark-03 rounded-lg p-4 space-y-3"
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(exercise.status)}
                    <h3 className="font-semibold">{exercise.exerciseName}</h3>
                  </div>
                  <p className="text-xs text-neutral-white-02 mt-1">
                    {getStatusLabel(exercise.status)}
                  </p>
                </div>
              </div>

              {/* Exercise Notes */}
              {exercise.notes && (
                <div className="text-sm text-neutral-white-02 bg-neutral-dark-02 p-2 rounded">
                  <p className="text-xs mb-1">Observações</p>
                  <p>{exercise.notes}</p>
                </div>
              )}

              {/* Sets Table */}
              {exercise.setSessions && exercise.setSessions.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-dark-02">
                        <th className="text-left py-2 px-2">Série</th>
                        <th className="text-center py-2 px-2">Carga (kg)</th>
                        <th className="text-center py-2 px-2">Reps</th>
                        <th className="text-center py-2 px-2">Descanso</th>
                        <th className="text-center py-2 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercise.setSessions.map((set) => (
                        <tr
                          key={set.id}
                          className={`border-b border-neutral-dark-02 ${
                            set.completed
                              ? "opacity-100"
                              : "opacity-50 line-through"
                          }`}
                        >
                          <td className="py-2 px-2">{set.setNumber}ª</td>
                          <td className="text-center py-2 px-2">
                            {set.load ? `${set.load} kg` : "-"}
                          </td>
                          <td className="text-center py-2 px-2">
                            {set.reps || "-"}
                          </td>
                          <td className="text-center py-2 px-2">
                            {set.restSeconds
                              ? `${Math.floor(set.restSeconds / 60)}:${(
                                  set.restSeconds % 60
                                )
                                  .toString()
                                  .padStart(2, "0")}`
                              : "-"}
                          </td>
                          <td className="text-center py-2 px-2">
                            {set.completed ? (
                              <CheckCircle
                                size={16}
                                className="text-green-500 inline"
                              />
                            ) : (
                              <XCircle
                                size={16}
                                className="text-red-500 inline"
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Set Notes */}
                  {exercise.setSessions.some((s) => s.notes) && (
                    <div className="mt-2 space-y-1">
                      {exercise.setSessions
                        .filter((s) => s.notes)
                        .map((set) => (
                          <p
                            key={set.id}
                            className="text-xs text-neutral-white-02"
                          >
                            <span className="font-semibold">
                              Série {set.setNumber}:
                            </span>{" "}
                            {set.notes}
                          </p>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Target Info */}
              {(exercise.targetSets ||
                exercise.targetRepsMin ||
                exercise.suggestedLoad) && (
                <div className="text-xs text-neutral-white-02 bg-neutral-dark-02 p-2 rounded">
                  <p className="font-semibold mb-1">Meta planejada</p>
                  <div className="flex gap-3">
                    {exercise.targetSets && (
                      <span>{exercise.targetSets} séries</span>
                    )}
                    {exercise.targetRepsMin && exercise.targetRepsMax && (
                      <span>
                        {exercise.targetRepsMin}-{exercise.targetRepsMax} reps
                      </span>
                    )}
                    {exercise.suggestedLoad && (
                      <span>{exercise.suggestedLoad} kg</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
