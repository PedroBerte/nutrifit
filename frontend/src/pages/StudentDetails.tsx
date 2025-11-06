import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetUserById } from "@/services/api/user";
import { useGetBondByStudentId, useUpdateBond } from "@/services/api/bond";
import {
  useGetAppointmentsByBondId,
  useUpdateAppointment,
} from "@/services/api/appointment";
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
import genericPerson from "@/assets/generic-person.svg";
import { useToast } from "@/contexts/ToastContext";

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
          toast.success("Consulta cancelada com sucesso!");
        },
        onError: () => {
          toast.error("Erro ao cancelar consulta. Tente novamente.");
        },
      }
    );
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "P":
        return "Pendente";
      case "A":
        return "Aceita";
      case "R":
        return "Rejeitada";
      case "C":
        return "Cancelada";
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
    <div className="flex flex-1 flex-col h-full bg-neutral-dark-01">
      {/* Tabs */}
      <div className="flex-1 flex flex-col mt-5">
        <div className="grid w-full grid-cols-2 gap-2 bg-neutral-dark-03 p-1 rounded-lg mb-4">
          <button
            onClick={() => setActiveTab("info")}
            className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "info"
                ? "bg-primary text-white"
                : "text-neutral-white-02 hover:text-neutral-white-01"
            }`}
          >
            Informações
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "appointments"
                ? "bg-primary text-white"
                : "text-neutral-white-02 hover:text-neutral-white-01"
            }`}
          >
            Encontros
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
              className="flex-1 overflow-y-auto flex flex-col gap-3"
            >
              {/* User Avatar and Basic Info */}
              <div className="flex flex-col items-center gap-3 bg-neutral-dark-03 p-4 rounded-lg">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-dark-02">
                  <img
                    src={genericPerson}
                    alt={userData.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="text-center space-y-1">
                  <h2 className="text-lg font-semibold text-neutral-white-01">
                    {userData.name}
                  </h2>
                  <div className="flex items-center justify-center gap-1">
                    <User size={14} />
                    <span className="text-sm text-neutral-white-02">Aluno</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="flex flex-col gap-3 bg-neutral-dark-03 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-neutral-white-01">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm break-all">{userData.email}</span>
                </div>

                {userData.phoneNumber && (
                  <div className="flex items-center space-x-2 text-neutral-white-01">
                    <Phone className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{userData.phoneNumber}</span>
                  </div>
                )}

                {userData.dateOfBirth && (
                  <div className="flex items-center space-x-2 text-neutral-white-01">
                    <Calendar className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">
                      {formatDate(userData.dateOfBirth)}
                      {calculateAge(userData.dateOfBirth) &&
                        ` • ${calculateAge(userData.dateOfBirth)} anos`}
                    </span>
                  </div>
                )}

                {userData.sex && (
                  <div className="flex items-center space-x-2 text-neutral-white-01">
                    <VenusAndMars className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{getSexLabel(userData.sex)}</span>
                  </div>
                )}
              </div>

              {/* Address */}
              {userData.address && (
                <div className="bg-neutral-dark-03 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-sm text-neutral-white-01">
                    Endereço
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-xs text-neutral-white-02 block mb-1">
                        CEP:
                      </span>
                      <span className="text-sm text-neutral-white-01">
                        {userData.address.zipCode || "Não informado"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-neutral-white-02 block mb-1">
                          Rua:
                        </span>
                        <span className="text-sm text-neutral-white-01">
                          {userData.address.addressLine || "Não informado"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-neutral-white-02 block mb-1">
                          Número:
                        </span>
                        <span className="text-sm text-neutral-white-01">
                          {userData.address.number || "Não informado"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-neutral-white-02 block mb-1">
                          Estado:
                        </span>
                        <span className="text-sm text-neutral-white-01">
                          {userData.address.state || "Não informado"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-neutral-white-02 block mb-1">
                          Cidade:
                        </span>
                        <span className="text-sm text-neutral-white-01">
                          {userData.address.city || "Não informado"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Created */}
              <div className="text-xs text-neutral-white-02 text-center">
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
              className="flex flex-col gap-3 h-full"
            >
              <Button
                onClick={() => setShowCreateAppointmentDrawer(true)}
                className="w-full"
                disabled={!bond}
              >
                <Plus size={16} className="mr-2" />
                Nova Consulta
              </Button>

              {loadingAppointments ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-neutral-white-02">Carregando...</p>
                </div>
              ) : !appointments || appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32">
                  <Calendar size={48} className="text-neutral-white-02 mb-4" />
                  <p className="text-neutral-white-02 text-center">
                    Nenhuma consulta agendada
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-neutral-dark-03 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {appointment.type === "PR" ? (
                            <MapPin
                              size={20}
                              className="text-primary flex-shrink-0"
                            />
                          ) : (
                            <Video
                              size={20}
                              className="text-primary flex-shrink-0"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-sm">
                              {appointment.type === "PR"
                                ? "Presencial"
                                : "Online"}
                            </p>
                            <p className="text-xs text-neutral-white-02">
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

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
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
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      </div>

                      {appointment.type === "PR" && appointment.address && (
                        <div className="text-xs text-neutral-white-02 pt-2 border-t border-neutral-dark-02">
                          <p>
                            {appointment.address.addressLine},{" "}
                            {appointment.address.number}
                          </p>
                          <p>
                            {appointment.address.city} -{" "}
                            {appointment.address.state}
                          </p>
                          <p>CEP: {appointment.address.zipCode}</p>
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

      {/* Drawer: Criar Consulta */}
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
