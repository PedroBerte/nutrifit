import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetUserById } from "@/services/api/user";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserProfiles } from "@/types/user";
import {
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  LogOut,
  Dumbbell,
  Apple,
  Edit,
  VenusAndMars,
} from "lucide-react";
import type { CustomerProfessionalBondType } from "@/types/professional";
import { useCreateBond, useGetBondsSent } from "@/services/api/bond";
import { motion } from "motion/react";

export default function Professional() {
  const { user, logout } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: bondsSent } = useGetBondsSent();
  const { mutate: createProposal } = useCreateBond();

  if (!id) navigate("/home");

  const alreadySentProposal = bondsSent
    ? bondsSent?.some((bond) => bond.professionalId === id) ?? false
    : false;

  const { data: userData, isLoading, error } = useGetUserById(id);

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

  const getProfileName = () => {
    switch (userData.profile?.id) {
      case UserProfiles.NUTRITIONIST:
        return "Nutricionista";
      case UserProfiles.PERSONAL:
        return "Personal Trainer";
      case UserProfiles.STUDENT:
        return "Estudante";
      default:
        return "Usuário";
    }
  };

  const getProfileIcon = () => {
    switch (userData.profile?.id) {
      case UserProfiles.NUTRITIONIST:
        return <Apple className="w-5 h-5" />;
      case UserProfiles.PERSONAL:
        return <Dumbbell className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Não informado";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const calculateAge = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    const birthDate = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      return age - 1;
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

  const sendProposal = async (professionalId: string) => {
    var newProposal: CustomerProfessionalBondType = {
      id: null,
      customerId: user?.id || "",
      professionalId: professionalId,
      senderId: user?.id || "",
      createdAt: null,
      updatedAt: null,
      status: "P",
      customer: null,
      professional: null,
      sender: null,
      appointments: null,
    };

    await createProposal(newProposal);
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-neutral-dark-01">
      <div className="flex-1 mt-6 overflow-y-auto flex gap-3 flex-col">
        {/* User Avatar and Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 bg-neutral-dark-03 p-4 rounded-lg"
        >
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {userData.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold text-neutral-white-01">
              {userData.name}
            </h2>
            {userData.professionalCredential ? (
              <p className="text-xs text-neutral-white-02">
                {userData.professionalCredential.biography}
              </p>
            ) : (
              <div className="flex items-center justify-center gap-1 mt-1">
                {getProfileIcon()}
                <span className="text-sm text-neutral-white-02">
                  {getProfileName()}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 bg-neutral-dark-03 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 text-neutral-white-01">
            <Mail className="w-5 h-5" />
            <span className="text-sm">{userData.email}</span>
          </div>

          {userData.phoneNumber && (
            <div className="flex items-center space-x-2 text-neutral-white-01">
              <Phone className="w-5 h-5" />
              <span className="text-sm">{userData.phoneNumber}</span>
            </div>
          )}

          {userData.dateOfBirth && (
            <div className="flex items-center space-x-2 text-neutral-white-01">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">
                {formatDate(userData.dateOfBirth)}
                {calculateAge(userData.dateOfBirth) &&
                  ` • ${calculateAge(userData.dateOfBirth)} anos`}
              </span>
            </div>
          )}

          {userData.sex && (
            <div className="flex items-center space-x-2 text-neutral-white-01">
              <VenusAndMars className="w-5 h-5" />
              <span className="text-sm">{getSexLabel(userData.sex)}</span>
            </div>
          )}
        </motion.div>

        {userData.professionalCredential && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-dark-03 rounded-lg p-4 space-y-3"
          >
            <div className="space-y-2">
              <div>
                <span className="text-xs text-neutral-white-02 block mb-1">
                  {userData.professionalCredential.type === "CRN"
                    ? "CRN"
                    : "CREF"}
                  :
                </span>
                <p className="text-sm text-neutral-white-01">
                  {userData.professionalCredential.credentialId}
                </p>
              </div>

              {userData.professionalCredential.biography && (
                <div className="mt-3">
                  <span className="text-xs text-neutral-white-02 block mb-1">
                    Biografia:
                  </span>
                  <p className="text-sm text-neutral-white-01">
                    {userData.professionalCredential.biography}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {userData.address && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-dark-03 rounded-lg p-4 space-y-3"
          >
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
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-neutral-white-02 text-center"
        >
          Conta criada em {formatDate(userData.createdAt)}
        </motion.div>

        <Button
          onClick={() => id && sendProposal(id)}
          disabled={alreadySentProposal}
        >
          {alreadySentProposal ? "Proposta Enviada" : "Enviar Proposta"}
        </Button>
      </div>
    </div>
  );
}
