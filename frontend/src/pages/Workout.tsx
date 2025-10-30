import InformationCard from "@/components/InformationCard";
import AssignedRoutineCard from "@/components/AssignedRoutineCard";
import ActiveWorkoutAlert from "@/components/ActiveWorkoutAlert";
import { useAuth } from "@/contexts/AuthContext";
import { useGetUserById } from "@/services/api/user";
import { useGetMyAssignedRoutines } from "@/services/api/routine";
import { useGetAllBonds } from "@/services/api/bond";
import { useGetActiveWorkoutSession } from "@/services/api/workoutSession";
import { UserProfiles } from "@/types/user";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export default function Workout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userData, isLoading: isLoadingUser } = useGetUserById(user?.id);
  const { data: bonds, isLoading: isLoadingBonds } = useGetAllBonds(
    user?.id,
    null,
    false
  );
  const { data: routinesResponse, isLoading: isLoadingRoutines } =
    useGetMyAssignedRoutines();
  const { data: activeSessionResponse } = useGetActiveWorkoutSession();

  const routines = routinesResponse?.data?.items || [];
  const activeSession = activeSessionResponse?.data;

  // Verifica se usuário tem vínculo com personal
  function getBondStatus() {
    if (isLoadingUser || isLoadingBonds) return null;

    // Sem vínculos como cliente
    if (!bonds || bonds.length === 0) {
      return (
        <InformationCard
          title="Nenhum personal encontrado!"
          description="Encontre um personal para você!"
          onClick={() => navigate("/home", { replace: true })}
        />
      );
    }

    // Verifica se tem solicitação pendente
    const hasPendingBond = bonds.some(
      (bond) =>
        bond.professional?.profileId === UserProfiles.PERSONAL &&
        bond.status === "P"
    );

    if (hasPendingBond) {
      return (
        <InformationCard
          title="Solicitação pendente"
          description="Sua solicitação ao personal está pendente."
          showButton={false}
        />
      );
    }

    // Tem vínculo ativo
    const hasActiveBond = bonds.some(
      (bond) =>
        bond.professional?.profileId === UserProfiles.PERSONAL &&
        bond.status === "A"
    );

    if (!hasActiveBond) {
      return (
        <InformationCard
          title="Vínculo inativo"
          description="Seu vínculo com o personal não está ativo."
          onClick={() => navigate("/home", { replace: true })}
        />
      );
    }

    return null;
  }

  const bondWarning = getBondStatus();

  return (
    <div className="flex flex-1 py-4 flex-col gap-4">
      <p className="font-bold text-2xl">Meus Treinos</p>

      {/* Alerta de treino ativo */}
      {activeSession && (
        <section className="py-2">
          <ActiveWorkoutAlert session={activeSession} />
        </section>
      )}

      {/* Avisos de vínculo */}
      {bondWarning && <section className="py-2">{bondWarning}</section>}

      {/* Rotinas atribuídas */}
      {!bondWarning && (
        <>
          {isLoadingRoutines && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin mr-2" />
              <span>Carregando rotinas...</span>
            </div>
          )}

          {!isLoadingRoutines && routines.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhuma rotina de treino atribuída ainda.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Peça ao seu personal para enviar uma rotina!
              </p>
            </div>
          )}

          {!isLoadingRoutines &&
            routines.length > 0 &&
            routines.map((routine) => (
              <AssignedRoutineCard key={routine.id} routine={routine} />
            ))}
        </>
      )}
    </div>
  );
}
