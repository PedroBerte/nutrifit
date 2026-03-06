import { useGetMySelfManagedWorkoutSessions } from "@/services/api/selfManagedWorkout";
import { useGetWorkoutHistory } from "@/services/api/workoutSession";
import { useAuth } from "@/contexts/AuthContext";
import { useGetUserById } from "@/services/api/user";
import { UserProfiles } from "@/types/user";
import { Loader2, Dumbbell, CheckCircle, Clock } from "lucide-react";
import { motion } from "motion/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SelfManagedWorkoutHistory() {
  const { user } = useAuth();
  const { data: userData } = useGetUserById(user?.id);

  const currentProfile = (userData?.profile?.id ?? user?.profile) as
    | UserProfiles
    | undefined;
  const isSelfManaged = currentProfile === UserProfiles.SELF_MANAGED;

  const {
    data: selfManagedSessions,
    isLoading: isLoadingSelfManaged,
    isError: isErrorSelfManaged,
  } = useGetMySelfManagedWorkoutSessions(isSelfManaged);

  const {
    data: regularHistory,
    isLoading: isLoadingRegular,
    isError: isErrorRegular,
  } = useGetWorkoutHistory();

  const isLoading = isSelfManaged ? isLoadingSelfManaged : isLoadingRegular;
  const isError = isSelfManaged ? isErrorSelfManaged : isErrorRegular;

  // Sort newest first
  const sortedSelfManaged = [...(selfManagedSessions ?? [])].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );
  const finishedSelfManaged = sortedSelfManaged.filter((s) => s.status === "finished");

  const regularItems = regularHistory?.data?.items ?? [];
  const finishedRegular = [...regularItems]
    .filter((item) => item.status === "C")
    .sort(
      (a, b) =>
        new Date(b.completedAt ?? b.startedAt).getTime() -
        new Date(a.completedAt ?? a.startedAt).getTime()
    );

  const totalFinished = isSelfManaged
    ? finishedSelfManaged.length
    : finishedRegular.length;

  return (
    <div className="flex flex-col py-4 gap-4">
      <div className="flex items-center justify-between">
        <p className="font-bold text-2xl">Histórico de Treinos</p>
        {totalFinished > 0 && (
          <span className="text-sm text-neutral-white-02">
            {totalFinished} {totalFinished === 1 ? "sessão" : "sessões"}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin mr-2" />
          <span>Carregando histórico...</span>
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center py-12 text-red-400 text-sm">
          Erro ao carregar histórico. Tente novamente.
        </div>
      )}

      {!isLoading && !isError && totalFinished === 0 && (
        <motion.div
          className="flex flex-col flex-1 items-center justify-center py-16 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col items-center gap-4 max-w-sm text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <Dumbbell className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-neutral-white-01">
              Nenhum treino concluído
            </h3>
            <p className="text-sm text-neutral-white-02 leading-relaxed">
              Quando você finalizar um treino ele aparecerá aqui.
            </p>
          </div>
        </motion.div>
      )}

      {!isLoading && !isError && totalFinished > 0 && (
        <motion.div
          className="flex flex-col gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {isSelfManaged &&
            finishedSelfManaged.map((session) => (
              <div
                key={session.id}
                className="rounded-lg border border-neutral-dark-02 p-4 bg-neutral-dark-03 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <p className="font-semibold text-neutral-white-01 truncate">
                      {session.titleSnapshot}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                    {session.exercises.length} exerc.
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-neutral-white-02">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span>
                    {format(
                      new Date(session.finishedAt ?? session.startedAt),
                      "dd 'de' MMM 'de' yyyy",
                      { locale: ptBR }
                    )}
                  </span>
                </div>

                {session.notes && (
                  <p className="text-sm text-neutral-white-02 italic line-clamp-2">
                    {session.notes}
                  </p>
                )}

                {session.exercises.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-neutral-dark-02">
                    {session.exercises.slice(0, 4).map((ex, i) => (
                      <p key={i} className="text-sm text-neutral-white-02">
                        {i + 1}. {ex.name} — {ex.completedSets}×{ex.completedReps}
                      </p>
                    ))}
                    {session.exercises.length > 4 && (
                      <p className="text-xs text-muted-foreground">
                        +{session.exercises.length - 4} exercícios
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}

          {!isSelfManaged &&
            finishedRegular.map((session) => (
              <div
                key={session.id}
                className="rounded-lg border border-neutral-dark-02 p-4 bg-neutral-dark-03 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <p className="font-semibold text-neutral-white-01 truncate">
                      {session.workoutTemplateTitle}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                    {session.exercisesCompleted}/{session.totalExercises} exerc.
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-neutral-white-02">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span>
                    {format(
                      new Date(session.completedAt ?? session.startedAt),
                      "dd 'de' MMM 'de' yyyy",
                      { locale: ptBR }
                    )}
                  </span>
                </div>

                {session.durationMinutes != null && (
                  <p className="text-sm text-neutral-white-02">
                    Duração: {session.durationMinutes} min
                  </p>
                )}
              </div>
            ))}
        </motion.div>
      )}
    </div>
  );
}
