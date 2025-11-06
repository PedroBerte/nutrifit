import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetUserById } from "@/services/api/user";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Mail,
  Phone,
  User,
  VenusAndMars,
  ArrowLeft,
  Users,
} from "lucide-react";
import genericPerson from "@/assets/generic-person.svg";

export default function StudentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");

  const { data: userData, isLoading, error } = useGetUserById(id);

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
            </motion.div>
          )}

          {activeTab === "appointments" && (
            <motion.div
              key="appointments"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center h-full"
            >
              <Users size={48} className="text-neutral-white-02 mb-4" />
              <p className="text-neutral-white-02 text-center">
                Funcionalidade de encontros em breve
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
