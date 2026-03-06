import InformationCard from "@/components/InformationCard";
import AssignedRoutineCard from "@/components/AssignedRoutineCard";
import ActiveWorkoutAlert from "@/components/ActiveWorkoutAlert";
import { useAuth } from "@/contexts/AuthContext";
import { useGetUserById } from "@/services/api/user";
import { useGetMyAssignedRoutines, useGetMyRoutines } from "@/services/api/routine";
import { getActiveWorkoutInfo } from "@/services/localWorkoutSession";
import { UserProfiles } from "@/types/user";
import { Loader2, Dumbbell, UserPlus, Clock, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useGetBondAsCustomer } from "@/services/api/bond";
import { useState, useEffect } from "react";
import { useGetCustomerPendingAppointments } from "@/services/api/appointment";
import { Bell } from "lucide-react";
import AlunoSemPersonal from "@/assets/aluno/AlunoSemPersonal.png";
import { AvatarImage } from "@/components/ui/avatar-image";
import { cn } from "@/lib/utils";
import { useUpdateUser } from "@/services/api/user";
import { toast } from "sonner";
import {
  useGetMySelfManagedWorkouts,
  useStartSelfManagedWorkoutSession,
} from "@/services/api/selfManagedWorkout";

export default function Workout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userData, isLoading: isLoadingUser } = useGetUserById(user?.id);
  const { data: studentBond, isLoading: isLoadingBonds } =
    useGetBondAsCustomer();
  const { data: assignedRoutinesResponse, isLoading: isLoadingAssignedRoutines } =
    useGetMyAssignedRoutines();
  const { data: myRoutinesResponse, isLoading: isLoadingMyRoutines } =
    useGetMyRoutines();
  const updateUserMutation = useUpdateUser();

  // Busca appointments pendentes do usuário
  const { data: pendingAppointments } = useGetCustomerPendingAppointments();

  const [activeWorkoutInfo, setActiveWorkoutInfo] =
    useState<ReturnType<typeof getActiveWorkoutInfo>>(null);

  // Verifica localStorage periodicamente
  useEffect(() => {
    const checkActiveWorkout = () => {
      setActiveWorkoutInfo(getActiveWorkoutInfo());
    };

    checkActiveWorkout();
    const interval = setInterval(checkActiveWorkout, 5000); // Atualiza a cada segundo

    return () => clearInterval(interval);
  }, []);

  const rawProfileValue =
    typeof user?.raw?.profile === "string" ? user.raw.profile.toLowerCase() : "";
  const isSelfManagedUser =
    userData?.profileId === UserProfiles.SELF_MANAGED ||
    user?.profile === UserProfiles.SELF_MANAGED ||
    rawProfileValue === "selfmanaged";

  const routines = isSelfManagedUser
    ? myRoutinesResponse?.data?.items || []
    : assignedRoutinesResponse?.data?.items || [];

  const validRoutines = routines.filter((routine) => Boolean(routine?.id));

  const isLoadingRoutines = isSelfManagedUser
    ? isLoadingMyRoutines
    : isLoadingAssignedRoutines;
  const {
    data: selfManagedWorkouts,
    isLoading: isLoadingSelfManagedWorkouts,
  } = useGetMySelfManagedWorkouts(isSelfManagedUser);
  const startSelfManagedSession = useStartSelfManagedWorkoutSession();

  async function activateSelfManagedMode() {
    if (!userData?.id) return;

    try {
      const payload = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        profileId: UserProfiles.SELF_MANAGED,
        ...(userData.imageUrl ? { imageUrl: userData.imageUrl } : {}),
      };

      await updateUserMutation.mutateAsync(payload);
      toast.success("Modo auto gerido ativado com sucesso!");
    } catch {
      toast.error("Não foi possível ativar o modo auto gerido.");
    }
  }

  async function handleStartSelfManagedWorkout(workoutTemplateId: string) {
    try {
      const session = await startSelfManagedSession.mutateAsync({
        workoutTemplateId,
      });

      toast.success("Sessão iniciada!");
      navigate(`/workout/self-managed/session/${session.id}`);
    } catch {
      toast.error("Não foi possível iniciar a sessão desse treino.");
    }
  }

  function getBondStatus() {
    if (isLoadingUser || isLoadingBonds) return null;

    if (isSelfManagedUser) {
      return null;
    }

    if (!studentBond) {
      return (
        <motion.div 
          className="flex flex-col flex-1 items-center justify-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col items-center gap-4 xs:gap-6 max-w-sm text-center">
            {/* Ícone */}
            <div className="flex items-center justify-center w-16 h-16 xs:w-20 xs:h-20 rounded-full bg-primary/10">
              <UserPlus className="w-8 h-8 xs:w-10 xs:h-10 text-primary" />
            </div>
            
            {/* Título e descrição */}
            <div className="space-y-2">
              <h3 className="text-lg xs:text-xl font-bold text-neutral-white-01">
                Encontre seu Personal
              </h3>
              <p className="text-xs xs:text-sm text-neutral-white-02 leading-relaxed">
                Para começar a treinar, você precisa se vincular a um personal trainer. 
                Ele criará rotinas personalizadas para você!
              </p>
            </div>

            {/* Benefícios */}
            <div className="w-full space-y-2 xs:space-y-3 py-3 xs:py-4">
              <div className="flex items-center gap-2 xs:gap-3 text-left">
                <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4 xs:w-5 xs:h-5 text-green-400" />
                </div>
                <span className="text-xs xs:text-sm text-neutral-white-02">Treinos personalizados</span>
              </div>
              <div className="flex items-center gap-2 xs:gap-3 text-left">
                <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 xs:w-5 xs:h-5 text-blue-400" />
                </div>
                <span className="text-xs xs:text-sm text-neutral-white-02">Acompanhamento contínuo</span>
              </div>
            </div>

            {/* Botão */}
            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate("/ProfessionalsList", { replace: true })}
            >
              <Search className="w-4 h-4 mr-2" />
              Encontrar Personal
            </Button>

            <Button
              className="w-full"
              size="lg"
              variant="outline"
              onClick={activateSelfManagedMode}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending
                ? "Ativando modo auto gerido..."
                : "Quero ser usuário auto gerido"}
            </Button>
          </div>

          {/* Imagem ilustrativa */}
          <img
            src={AlunoSemPersonal}
            alt="Encontre um personal"
            className="w-52 xs:w-72 object-contain mt-6 xs:mt-8 opacity-80"
          />
        </motion.div>
      );
    }

    const hasPendingBond = studentBond.status === "P";

    if (hasPendingBond) {
      return (
        <motion.div 
          className="flex flex-col flex-1 items-center justify-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col items-center gap-4 xs:gap-6 max-w-sm text-center">
            {/* Ícone animado */}
            <div className="relative">
              <div className="flex items-center justify-center w-16 h-16 xs:w-20 xs:h-20 rounded-full bg-yellow-500/10">
                <Clock className="w-8 h-8 xs:w-10 xs:h-10 text-yellow-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 xs:w-5 xs:h-5 bg-yellow-500 rounded-full animate-pulse" />
            </div>
            
            {/* Título e descrição */}
            <div className="space-y-2">
              <h3 className="text-lg xs:text-xl font-bold text-neutral-white-01">
                Aguardando Aprovação
              </h3>
              <p className="text-xs xs:text-sm text-neutral-white-02 leading-relaxed">
                Sua solicitação foi enviada! Aguarde o personal aceitar seu pedido de vínculo 
                para começar a receber seus treinos.
              </p>
            </div>

            {/* Card do professional pendente */}
            {studentBond.professional && (
              <div className="w-full p-3 xs:p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-center gap-3">
                  <AvatarImage
                    imageUrl={studentBond.professional.imageUrl}
                    name={studentBond.professional.name}
                    size="md"
                  />
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-sm xs:text-base text-yellow-200 truncate">
                      {studentBond.professional.name}
                    </p>
                    <p className="text-xs text-yellow-300/70">
                      Solicitação pendente
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botão */}
            <Button
              variant="outline"
              className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              onClick={() => navigate("/profile", { replace: true })}
            >
              Verificar Status
            </Button>
          </div>

          {/* Imagem ilustrativa */}
          <img
            src={AlunoSemPersonal}
            alt="Aguardando aprovação"
            className="w-52 xs:w-72 object-contain mt-6 xs:mt-8 opacity-60"
          />
        </motion.div>
      );
    }

    const hasActiveBond = studentBond.status === "A";

    if (!hasActiveBond) {
      return (
        <motion.div 
          className="flex flex-col flex-1 items-center justify-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col items-center gap-4 xs:gap-6 max-w-sm text-center">
            {/* Ícone */}
            <div className="flex items-center justify-center w-16 h-16 xs:w-20 xs:h-20 rounded-full bg-red-500/10">
              <UserPlus className="w-8 h-8 xs:w-10 xs:h-10 text-red-400" />
            </div>
            
            {/* Título e descrição */}
            <div className="space-y-2">
              <h3 className="text-lg xs:text-xl font-bold text-neutral-white-01">
                Vínculo Inativo
              </h3>
              <p className="text-xs xs:text-sm text-neutral-white-02 leading-relaxed">
                Seu vínculo anterior não está mais ativo. 
                Encontre um novo personal para continuar evoluindo!
              </p>
            </div>

            {/* Botão */}
            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate("/ProfessionalsList", { replace: true })}
            >
              <Search className="w-4 h-4 mr-2" />
              Encontrar Novo Personal
            </Button>
          </div>

          {/* Imagem ilustrativa */}
          <img
            src={AlunoSemPersonal}
            alt="Vínculo inativo"
            className="w-52 xs:w-72 object-contain mt-6 xs:mt-8 opacity-60"
          />
        </motion.div>
      );
    }

    return null;
  }

  const bondWarning = getBondStatus();

  return (
    <div className="flex flex-1 py-4 flex-col gap-4">
      <p className="font-bold text-2xl">Meus Treinos</p>

      {studentBond && studentBond.status === "A" && !isSelfManagedUser && (
        <div className="flex gap-3 mt-2 items-start">
          <div
            className={cn(
              pendingAppointments &&
                pendingAppointments.length > 0 &&
                "cursor-pointer"
            )}
            onClick={() => {
              if (pendingAppointments && pendingAppointments.length > 0) {
                navigate("/appointments");
              }
            }}
          >
            <AvatarImage
              imageUrl={studentBond.professional?.imageUrl}
              name={studentBond.professional?.name}
              email={studentBond.professional?.email}
              id={studentBond.professional?.id}
              size="md"
              showBadge={pendingAppointments && pendingAppointments.length > 0}
              badgeContent={
                <div className="bg-destructive text-white rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                  <Bell className="h-3 w-3" />
                </div>
              }
            />
          </div>
          <div className="flex-1">
            <p className="font-bold text-md">Personal Responsável</p>
            <p className="text-sm text-muted-foreground">
              {studentBond.professional?.name}
            </p>
            {pendingAppointments && pendingAppointments.length > 0 && (
              <p
                className="text-xs text-primary font-semibold mt-1 cursor-pointer hover:underline"
                onClick={() => {
                  if (pendingAppointments && pendingAppointments.length > 0) {
                    navigate("/appointments");
                  }
                }}
              >
                {pendingAppointments.length === 1
                  ? "Nova solicitação de agendamento"
                  : `${pendingAppointments.length} solicitações de agendamento`}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/professional/${studentBond.professional?.id}`)}
            className="self-start"
          >
            Ver Perfil
          </Button>
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
        <div className="flex flex-col flex-1">
          {bondWarning}
        </div>
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

          {!isLoadingRoutines && validRoutines.length === 0 && (
            <motion.div 
              className="flex flex-col flex-1 items-center justify-center px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex flex-col items-center gap-4 xs:gap-6 max-w-sm text-center">
                {/* Ícone */}
                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 xs:w-20 xs:h-20 rounded-full bg-primary/10">
                    <Dumbbell className="w-8 h-8 xs:w-10 xs:h-10 text-primary" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 xs:w-7 xs:h-7 bg-neutral-dark-03 rounded-full flex items-center justify-center border-2 border-primary/30">
                    <Clock className="w-3 h-3 xs:w-4 xs:h-4 text-primary" />
                  </div>
                </div>
                
                {/* Título e descrição */}
                <div className="space-y-2">
                  <h3 className="text-lg xs:text-xl font-bold text-neutral-white-01">
                    {isSelfManagedUser ? "Modo Auto Gerido Ativo" : "Aguardando Rotinas"}
                  </h3>
                  <p className="text-xs xs:text-sm text-neutral-white-02 leading-relaxed">
                    {isSelfManagedUser
                      ? "Você optou por treinar sem personal no momento. Quando quiser, você pode procurar um profissional novamente."
                      : "Seu personal está preparando treinos especialmente para você! Em breve suas rotinas aparecerão aqui."}
                  </p>
                </div>

                {/* Dica */}
                <div className="w-full p-3 xs:p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs xs:text-sm text-neutral-white-02">
                    💡 <span className="font-medium text-primary">Dica:</span>{" "}
                    {isSelfManagedUser
                      ? "para receber treinos personalizados, vincule-se a um personal quando desejar."
                      : "Enquanto isso, você pode conversar com seu personal pelo WhatsApp para alinhar seus objetivos!"}
                  </p>
                </div>

                {/* Botão para ver perfil do personal */}
                {studentBond?.professional && !isSelfManagedUser && (
                  <Button
                    variant="outline"
                    className="w-full border-primary/30 hover:border-primary hover:bg-primary/10"
                    onClick={() => navigate(`/professional/${studentBond.professional?.id}`)}
                  >
                    Ver Perfil do Personal
                  </Button>
                )}

                {isSelfManagedUser && (
                  <Button
                    variant="outline"
                    className="w-full border-primary/30 hover:border-primary hover:bg-primary/10"
                    onClick={() => navigate("/routines")}
                  >
                    Criar treino no
                  </Button>
                )}

                {isSelfManagedUser && (
                  <Button
                    variant="outline"
                    className="w-full border-primary/30 hover:border-primary hover:bg-primary/10"
                    onClick={() => navigate("/ProfessionalsList", { replace: true })}
                  >
                    Encontrar Personal
                  </Button>
                )}
              </div>

              {/* Imagem ilustrativa */}
              <img
                src={AlunoSemPersonal}
                alt="Aguardando rotinas"
                className="w-52 xs:w-72 object-contain mt-6 xs:mt-8 opacity-70"
              />
            </motion.div>
          )}

          {!isLoadingRoutines &&
            validRoutines.length > 0 &&
            validRoutines.map((routine) => (
              <AssignedRoutineCard key={routine.id} routine={routine} />
            ))}

          {isSelfManagedUser && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mt-4">
                <p className="font-bold text-lg">Meus treinos auto geridos</p>
                <Button size="sm" onClick={() => navigate("/routines")}>
                  Ir para rotinas
                </Button>
              </div>

              {isLoadingSelfManagedWorkouts && (
                <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                  Carregando treinos auto geridos...
                </div>
              )}

              {!isLoadingSelfManagedWorkouts &&
                (selfManagedWorkouts?.length ?? 0) === 0 && (
                  <div className="rounded-sm border border-neutral-dark-02 p-4 text-sm text-muted-foreground">
                    Você ainda não criou nenhum treino auto gerido.
                  </div>
                )}

              {!isLoadingSelfManagedWorkouts &&
                (selfManagedWorkouts?.length ?? 0) > 0 &&
                selfManagedWorkouts?.map((workout) => (
                  <div
                    key={workout.id}
                    className="rounded-sm border border-neutral-dark-02 p-4 bg-neutral-dark-03"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-neutral-white-01">{workout.title}</p>
                        {workout.notes && (
                          <p className="text-sm text-neutral-white-02 mt-1">{workout.notes}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {workout.exercises.length} exercícios
                      </span>
                    </div>

                    <div className="mt-3 space-y-1">
                      {workout.exercises.slice(0, 5).map((exercise, index) => (
                        <p key={`${workout.id}-${index}`} className="text-sm text-neutral-white-02">
                          {index + 1}. {exercise.name} — {exercise.sets}x{exercise.reps}
                        </p>
                      ))}

                      {workout.exercises.length > 5 && (
                        <p className="text-xs text-muted-foreground">
                          +{workout.exercises.length - 5} exercícios
                        </p>
                      )}
                    </div>

                    <Button
                      className="w-full mt-4"
                      onClick={() => handleStartSelfManagedWorkout(workout.id)}
                      disabled={startSelfManagedSession.isPending}
                    >
                      {startSelfManagedSession.isPending
                        ? "Iniciando sessão..."
                        : "Iniciar treino"}
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
