import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetUserById } from "@/services/api/user";
import { useGetBondByStudentId, useUpdateBond } from "@/services/api/bond";
import {
  useGetAppointmentsByBondId,
  useUpdateAppointment,
} from "@/services/api/appointment";
import { useGetCustomerWorkoutHistory } from "@/services/api/workoutSession";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Mail,
  Phone,
  User,
  VenusAndMars,
  ArrowLeft,
  Plus,
  MapPin,
  Video,
  X,
  Clock,
  Dumbbell,
  TrendingUp,
} from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import CreateAppointmentDrawer from "@/components/CreateAppointmentDrawer";
import { useToast } from "@/contexts/ToastContext";
import { AvatarImage } from "@/components/ui/avatar-image";

export default function StudentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("info");
  const [showUnbondDrawer, setShowUnbondDrawer] = useState(false);
  const [showCreateAppointmentDrawer, setShowCreateAppointmentDrawer] =
    useState(false);

  const { data: userData, isLoading, error } = useGetUserById(id);
  const { data: bond } = useGetBondByStudentId(id || "");
  const { data: appointments, isLoading: loadingAppointments } =
    useGetAppointmentsByBondId(bond?.id || "");
  const { data: workoutsData, isLoading: loadingWorkouts } =
    useGetCustomerWorkoutHistory(id || "");
  const { mutate: updateBond } = useUpdateBond();
  const { mutate: updateAppointment } = useUpdateAppointment();

  if (!id) {
    navigate("/students");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-neutral-white-02">Carregando perfil...</p>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500">Erro ao carregar perfil</p>
      </div>
    );
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Não informado";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const calculateAge = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getSexLabel = (sex: string | null | undefined) => {
    switch (sex) {
      case "male":
        return "Masculino";
      case "female":
        return "Feminino";
      case "other":
        return "Outro";
      default:
        return "Não informado";
    }
  };

  const handleUnbond = () => {
    if (!bond) return;

    updateBond(
      { ...bond, status: "C" },
      {
        onSuccess: () => {
          toast.success("Aluno desvinculado com sucesso!");
          setShowUnbondDrawer(false);
          setTimeout(() => navigate("/students"), 1000);
        },
        onError: () => {
          toast.error("Erro ao desvincular aluno. Tente novamente.");
        },
      }
    );
  };

  const handleCancelAppointment = (appointmentId: string) => {
    updateAppointment(
      {
        id: appointmentId,
        data: { status: "C" },
      },
      {
        onSuccess: () => {
          toast.success("Agendamento cancelado com sucesso!");
        },
        onError: () => {
          toast.error("Erro ao cancelar agendamento. Tente novamente.");
        },
      }
    );
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "P":
        return "Pendente";
      case "A":
        return "Aceito";
      case "R":
        return "Rejeitado";
      case "C":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "P":
        return "bg-yellow-500/20 text-yellow-500";
      case "A":
        return "bg-green-500/20 text-green-500";
      case "R":
        return "bg-red-500/20 text-red-500";
      case "C":
        return "bg-gray-500/20 text-gray-500";
      default:
        return "bg-neutral-dark-02 text-neutral-white-02";
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-neutral-dark-01">
      {/* Tabs */}
      <div className="flex flex-col flex-1 mt-5">
        <div className="grid w-full grid-cols-3 gap-1 p-1 mb-4 rounded-lg xs:gap-2 bg-neutral-dark-03">
          <button
            onClick={() => setActiveTab("info")}
            className={`py-1.5 xs:py-2 px-2 xs:px-4 rounded-md text-xs xs:text-sm font-medium transition-colors ${
              activeTab === "info"
                ? "bg-primary text-white"
                : "text-neutral-white-02 hover:text-neutral-white-01"
            }`}
          >
            <span className="hidden xs:inline">Informações</span>
            <span className="xs:hidden">Info</span>
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`py-1.5 xs:py-2 px-2 xs:px-4 rounded-md text-xs xs:text-sm font-medium transition-colors ${
              activeTab === "appointments"
                ? "bg-primary text-white"
                : "text-neutral-white-02 hover:text-neutral-white-01"
            }`}
          >
            Encontros
          </button>
          <button
            onClick={() => setActiveTab("workouts")}
            className={`py-1.5 xs:py-2 px-2 xs:px-4 rounded-md text-xs xs:text-sm font-medium transition-colors ${
              activeTab === "workouts"
                ? "bg-primary text-white"
                : "text-neutral-white-02 hover:text-neutral-white-01"
            }`}
          >
            Treinos
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "info" && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-1 gap-3 overflow-y-auto"
            >
              {/* User Avatar and Basic Info */}
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg xs:gap-3 bg-neutral-dark-03 xs:p-4">
                <AvatarImage
                  imageUrl={userData.imageUrl}
                  name={userData.name}
                  email={userData.email}
                  id={userData.id}
                  size="lg"
                />

                <div className="space-y-1 text-center">
                  <h2 className="text-base font-semibold xs:text-lg text-neutral-white-01">
                    {userData.name}
                  </h2>
                  <div className="flex items-center justify-center gap-1">
                    <User size={12} className="xs:w-3.5 xs:h-3.5" />
                    <span className="text-xs xs:text-sm text-neutral-white-02">Aluno</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="flex flex-col gap-2 p-3 rounded-lg xs:gap-3 xs:p-4 bg-neutral-dark-03">
                <div className="flex items-center space-x-2 text-neutral-white-01">
                  <Mail className="flex-shrink-0 w-4 h-4 xs:w-5 xs:h-5" />
                  <span className="text-xs break-all xs:text-sm">{userData.email}</span>
                </div>

                {userData.phoneNumber && (
                  <div className="flex items-center space-x-2 text-neutral-white-01">
                    <Phone className="flex-shrink-0 w-4 h-4 xs:w-5 xs:h-5" />
                    <span className="text-xs xs:text-sm">{userData.phoneNumber}</span>
                  </div>
                )}

                {userData.dateOfBirth && (
                  <div className="flex items-center space-x-2 text-neutral-white-01">
                    <Calendar className="flex-shrink-0 w-4 h-4 xs:w-5 xs:h-5" />
                    <span className="text-xs xs:text-sm">
                      {formatDate(userData.dateOfBirth)}
                      {calculateAge(userData.dateOfBirth) &&
                        ` • ${calculateAge(userData.dateOfBirth)} anos`}
                    </span>
                  </div>
                )}

                {userData.sex && (
                  <div className="flex items-center space-x-2 text-neutral-white-01">
                    <VenusAndMars className="flex-shrink-0 w-4 h-4 xs:w-5 xs:h-5" />
                    <span className="text-xs xs:text-sm">{getSexLabel(userData.sex)}</span>
                  </div>
                )}
              </div>

              {/* Address */}
              {userData.address && (
                <div className="p-3 space-y-2 rounded-lg xs:p-4 xs:space-y-3 bg-neutral-dark-03">
                  <h3 className="text-xs font-semibold xs:text-sm text-neutral-white-01">
                    Endereço
                  </h3>
                  <div className="space-y-2 text-xs xs:space-y-3 xs:text-sm">
                    <div>
                      <span className="block mb-0.5 xs:mb-1 text-[10px] xs:text-xs text-neutral-white-02">
                        CEP
                      </span>
                      <span className="text-xs xs:text-sm text-neutral-white-01">
                        {userData.address.zipCode || "Não informado"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 xs:gap-3">
                      <div>
                        <span className="block mb-0.5 xs:mb-1 text-[10px] xs:text-xs text-neutral-white-02">
                          Rua
                        </span>
                        <span className="text-xs break-words xs:text-sm text-neutral-white-01">
                          {userData.address.addressLine || "Não informado"}
                        </span>
                      </div>
                      <div>
                        <span className="block mb-0.5 xs:mb-1 text-[10px] xs:text-xs text-neutral-white-02">
                          Número
                        </span>
                        <span className="text-xs xs:text-sm text-neutral-white-01">
                          {userData.address.number || "Não informado"}
                        </span>
                      </div>
                      <div>
                        <span className="block mb-0.5 xs:mb-1 text-[10px] xs:text-xs text-neutral-white-02">
                          Estado
                        </span>
                        <span className="text-xs xs:text-sm text-neutral-white-01">
                          {userData.address.state || "Não informado"}
                        </span>
                      </div>
                      <div>
                        <span className="block mb-0.5 xs:mb-1 text-[10px] xs:text-xs text-neutral-white-02">
                          Cidade
                        </span>
                        <span className="text-xs xs:text-sm text-neutral-white-01">
                          {userData.address.city || "Não informado"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Created */}
              <div className="text-xs text-center text-neutral-white-02">
                Conta criada em {formatDate(userData.createdAt)}
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowUnbondDrawer(true)}
              >
                Desvincular
              </Button>
            </motion.div>
          )}

          {activeTab === "appointments" && (
            <motion.div
              key="appointments"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full gap-3"
            >
              <Button
                onClick={() => setShowCreateAppointmentDrawer(true)}
                className="w-full"
                disabled={!bond}
              >
                <Plus size={16} className="mr-2" />
                Novo Agendamento
              </Button>

              {loadingAppointments ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-neutral-white-02">Carregando...</p>
                </div>
              ) : !appointments || appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32">
                  <Calendar size={48} className="mb-4 text-neutral-white-02" />
                  <p className="text-center text-neutral-white-02">
                    Nenhum agendamento
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 xs:gap-3">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-3 space-y-2 rounded-lg xs:p-4 xs:space-y-3 bg-neutral-dark-03"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {appointment.type === "PR" ? (
                            <MapPin
                              size={16}
                              className="flex-shrink-0 text-primary xs:w-5 xs:h-5"
                            />
                          ) : (
                            <Video
                              size={16}
                              className="flex-shrink-0 text-primary xs:w-5 xs:h-5"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-semibold xs:text-sm">
                              {appointment.type === "PR"
                                ? "Presencial"
                                : "Online"}
                            </p>
                            <p className="text-[10px] xs:text-xs text-neutral-white-02">
                              {new Date(appointment.scheduledAt).toLocaleString(
                                "pt-BR",
                                {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                }
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center flex-shrink-0 gap-1 xs:gap-2">
                          <span
                            className={`text-[10px] xs:text-xs px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {getStatusLabel(appointment.status)}
                          </span>
                          {appointment.status === "P" && (
                            <button
                              onClick={() =>
                                handleCancelAppointment(appointment.id)
                              }
                              className="text-red-500 hover:text-red-600"
                            >
                              <X size={16} className="xs:w-[18px] xs:h-[18px]" />
                            </button>
                          )}
                        </div>
                      </div>

                      {appointment.type === "PR" && appointment.address && (
                        <div className="pt-2 text-[10px] xs:text-xs border-t text-neutral-white-02 border-neutral-dark-02">
                          <p className="truncate">
                            {appointment.address.addressLine},{" "}
                            {appointment.address.number}
                          </p>
                          <p>
                            {appointment.address.city} -{" "}
                            {appointment.address.state}
                          </p>
                          <p>CEP {appointment.address.zipCode}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "workouts" && (
            <motion.div
              key="workouts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full gap-3"
            >
              {loadingWorkouts ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-neutral-white-02">Carregando...</p>
                </div>
              ) : !workoutsData?.data || workoutsData?.data?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32">
                  <Dumbbell size={48} className="mb-4 text-neutral-white-02" />
                  <p className="text-center text-neutral-white-02">
                    Nenhum treino realizado
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 xs:gap-3">
                  {workoutsData.data?.map((workout) => (
                    <div
                      key={workout.id}
                      onClick={() =>
                        navigate(`/students/${id}/workouts/${workout.id}`)
                      }
                      className="p-3 space-y-2 transition-colors rounded-lg cursor-pointer xs:p-4 xs:space-y-3 bg-neutral-dark-03 hover:bg-neutral-dark-02/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate xs:text-lg">
                            {workout.workoutTemplateTitle}
                          </p>
                          <p className="text-[10px] xs:text-xs text-neutral-white-02">
                            {new Date(workout.startedAt).toLocaleString(
                              "pt-BR",
                              {
                                dateStyle: "short",
                                timeStyle: "short",
                              }
                            )}
                          </p>
                        </div>

                        <div className="flex flex-col items-end flex-shrink-0 gap-1">
                          <span
                            className={`text-[10px] xs:text-xs px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full ${
                              workout.status === "C"
                                ? "bg-green-500/20 text-green-500"
                                : workout.status === "IP"
                                ? "bg-blue-500/20 text-blue-500"
                                : "bg-gray-500/20 text-gray-500"
                            }`}
                          >
                            {workout.status === "C"
                              ? "Completo"
                              : workout.status === "IP"
                              ? "Em progresso"
                              : "Cancelado"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs xs:gap-3 xs:text-sm text-neutral-white-02">
                        {workout.durationMinutes && (
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="xs:w-3.5 xs:h-3.5" />
                            <span>{workout.durationMinutes} min</span>
                          </div>
                        )}

                        {workout.totalVolume && (
                          <div className="flex items-center gap-1">
                            <TrendingUp size={12} className="xs:w-3.5 xs:h-3.5" />
                            <span>{workout.totalVolume.toFixed(0)} kg</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <Dumbbell size={12} className="xs:w-3.5 xs:h-3.5" />
                          <span>
                            {workout.exercisesCompleted}/
                            {workout.totalExercises} exercícios
                          </span>
                        </div>
                      </div>

                      {workout.difficultyRating && (
                        <div className="flex items-center gap-2 pt-2 border-t border-neutral-dark-02">
                          <span className="text-[10px] xs:text-xs text-neutral-white-02">
                            Dificuldade:
                          </span>
                          <div className="flex gap-0.5 xs:gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <div
                                key={star}
                                className={`w-2 h-2 xs:w-3 xs:h-3 rounded-full ${
                                  star <= (workout.difficultyRating || 0)
                                    ? "bg-primary"
                                    : "bg-neutral-dark-02"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Drawer: Desvincular */}
      <Drawer open={showUnbondDrawer} onOpenChange={setShowUnbondDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Desvincular Aluno</DrawerTitle>
            <DrawerDescription>
              Tem certeza que deseja desvincular{" "}
              <strong>{userData?.name}</strong>?
              <br />
              Esta ação removerá todas as rotinas ativas deste aluno.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button variant="destructive" onClick={handleUnbond}>
              Sim, desvincular
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Drawer: Criar agendamento */}
      {bond && (
        <CreateAppointmentDrawer
          open={showCreateAppointmentDrawer}
          onOpenChange={setShowCreateAppointmentDrawer}
          bondId={bond.id || ""}
        />
      )}
    </div>
  );
}
