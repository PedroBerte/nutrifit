import InformationCard from "@/components/InformationCard";
import AssignedRoutineCard from "@/components/AssignedRoutineCard";
import ActiveWorkoutAlert from "@/components/ActiveWorkoutAlert";
import { useAuth } from "@/contexts/AuthContext";
import { useGetUserById } from "@/services/api/user";
import { useGetMyAssignedRoutines } from "@/services/api/routine";
import { useGetActiveWorkoutSession } from "@/services/api/workoutSession";
import { UserProfiles } from "@/types/user";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useGetBondAsCustomer } from "@/services/api/bond";

export default function Workout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userData, isLoading: isLoadingUser } = useGetUserById(user?.id);
  const { data: studentBond, isLoading: isLoadingBonds } =
    useGetBondAsCustomer();
  const { data: routinesResponse, isLoading: isLoadingRoutines } =
    useGetMyAssignedRoutines();
  const { data: activeSessionResponse } = useGetActiveWorkoutSession();

  const routines = routinesResponse?.data?.items || [];
  const activeSession = activeSessionResponse?.data;

  function getBondStatus() {
    if (isLoadingUser || isLoadingBonds) return null;

    if (!studentBond) {
      return (
        <InformationCard
          title="Nenhum personal encontrado!"
          description="Encontre um personal para você!"
        >
          <Button
            className="w-full"
            type="button"
            onClick={() => {
              navigate("/ProfessionalsList", { replace: true });
            }}
          >
            Encontrar Personal
          </Button>
        </InformationCard>
      );
    }

    const hasPendingBond = studentBond.status === "P";

    if (hasPendingBond) {
      return (
        <InformationCard
          title="Solicitação pendente"
          description="Sua solicitação ao personal está pendente."
        />
      );
    }

    const hasActiveBond = studentBond.status === "A";

    if (!hasActiveBond) {
      return (
        <InformationCard
          title="Vínculo inativo"
          description="Seu vínculo com o personal não está ativo."
        />
      );
    }

    return null;
  }

  const bondWarning = getBondStatus();

  function getInitials(name?: string) {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }

  return (
    <div className="flex flex-1 py-4 flex-col gap-4">
      <p className="font-bold text-2xl">Meus Treinos</p>

      {studentBond && (
        <div className="flex gap-2 mt-2">
          <div className="bg-primary text-white rounded-full h-12 w-12 flex items-center justify-center font-semibold">
            {getInitials(studentBond.professional?.name)}
          </div>
          <div>
            <p className="font-bold text-md">Personal Responsável:</p>
            <p className="text-sm text-muted-foreground">
              {studentBond.professional?.name}
            </p>
          </div>
        </div>
      )}

      {/* Alerta de treino ativo */}
      {activeSession && (
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="py-2"
        >
          <ActiveWorkoutAlert session={activeSession} />
        </motion.section>
      )}

      {/* Avisos de vínculo */}
      {bondWarning && (
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="py-2 mt-2 flex w-full justify-center"
        >
          {bondWarning}
        </motion.section>
      )}

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
