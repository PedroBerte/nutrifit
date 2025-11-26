import InformationCard from "@/components/InformationCard";
import AssignedRoutineCard from "@/components/AssignedRoutineCard";
import ActiveWorkoutAlert from "@/components/ActiveWorkoutAlert";
import { useAuth } from "@/contexts/AuthContext";
import { useGetUserById } from "@/services/api/user";
import { useGetMyAssignedRoutines } from "@/services/api/routine";
import { getActiveWorkoutInfo } from "@/services/localWorkoutSession";
import { UserProfiles } from "@/types/user";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useGetBondAsCustomer } from "@/services/api/bond";
import { useState, useEffect } from "react";
import { useGetAppointmentsByBondId } from "@/services/api/appointment";
import PendingAppointmentDrawer from "@/components/PendingAppointmentDrawer";
import { Bell } from "lucide-react";
import AlunoSemPersonal from "@/assets/aluno/AlunoSemPersonal.png";

export default function Workout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userData, isLoading: isLoadingUser } = useGetUserById(user?.id);
  const { data: studentBond, isLoading: isLoadingBonds } =
    useGetBondAsCustomer();
  const { data: routinesResponse, isLoading: isLoadingRoutines } =
    useGetMyAssignedRoutines();

  // Busca appointments do bond ativo
  const { data: appointments } = useGetAppointmentsByBondId(
    studentBond?.id || ""
  );

  // Filtra appointments pendentes
  const pendingAppointment = appointments?.find((apt) => apt.status === "P");

  const [activeWorkoutInfo, setActiveWorkoutInfo] =
    useState<ReturnType<typeof getActiveWorkoutInfo>>(null);

  // Verifica localStorage periodicamente
  useEffect(() => {
    const checkActiveWorkout = () => {
      setActiveWorkoutInfo(getActiveWorkoutInfo());
    };

    checkActiveWorkout();
    const interval = setInterval(checkActiveWorkout, 1000); // Atualiza a cada segundo

    return () => clearInterval(interval);
  }, []);

  const routines = routinesResponse?.data?.items || [];

  function getBondStatus() {
    if (isLoadingUser || isLoadingBonds) return null;

    if (!studentBond) {
      return (
        <div className="flex flex-col gap-6 items-center">
          <InformationCard
            title="Nenhum vínculo encontrado!"
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
          <img
            src={AlunoSemPersonal}
            alt="Nenhum personal vinculado"
            className="object-contain w-full"
          />
        </div>
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
          {pendingAppointment ? (
            <PendingAppointmentDrawer appointment={pendingAppointment}>
              <div className="relative cursor-pointer">
                <div className="bg-primary text-white rounded-full h-12 w-12 flex items-center justify-center font-semibold">
                  {getInitials(studentBond.professional?.name)}
                </div>
                <div className="absolute -top-1 -right-1 bg-destructive text-white rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                  <Bell className="h-3 w-3" />
                </div>
              </div>
            </PendingAppointmentDrawer>
          ) : (
            <div className="bg-primary text-white rounded-full h-12 w-12 flex items-center justify-center font-semibold">
              {getInitials(studentBond.professional?.name)}
            </div>
          )}
          <div>
            <p className="font-bold text-md">Personal Responsável:</p>
            <p className="text-sm text-muted-foreground">
              {studentBond.professional?.name}
            </p>
            {pendingAppointment && (
              <p className="text-xs text-primary font-semibold mt-1">
                Nova solicitação de agendamento
              </p>
            )}
          </div>
        </div>
      )}

      {/* Alerta de treino ativo */}
      {activeWorkoutInfo && (
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="py-2"
        >
          <ActiveWorkoutAlert workoutInfo={activeWorkoutInfo} />
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
            <div className="flex flex-col flex-1 gap-6">
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mt-1">
                  Aguarde enquanto seu personal cria uma rotina de treinos para você!
                </p>
              </div>

              <div className="flex flex-1 items-center justify-center">
                <img
                  src={AlunoSemPersonal}
                  alt="Nenhum treino atribuído"
                  className="w-60 object-contain"
                />
              </div>
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
