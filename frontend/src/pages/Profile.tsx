import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useGetUserById } from "@/services/api/user";
import { Button } from "@/components/ui/button";
import { UserProfiles } from "@/types/user";
import { UpdateProfileDrawer } from "@/components/profile/UpdateProfileDrawer";
import { ProfileImageUpload } from "@/components/profile/ProfileImageUpload";
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
  Award,
  Home,
  FileText,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Profile() {
  const { user, logout } = useAuth();
  const {
    data: userData,
    isLoading,
    error,
    refetch,
  } = useGetUserById(user?.id);
  const [isUpdateDrawerOpen, setIsUpdateDrawerOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-neutral-white-02">Carregando perfil...</p>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
          <User className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-red-500">Erro ao carregar perfil</p>
      </div>
    );
  }

  const getProfileBadge = () => {
    const badges: Record<string, { icon: React.ReactElement; label: string; color: string }> = {
      [UserProfiles.NUTRITIONIST]: {
        icon: <Apple className="w-4 h-4" />,
        label: "Nutricionista",
        color: "bg-green-500/10 text-green-400 border-green-500/20",
      },
      [UserProfiles.PERSONAL]: {
        icon: <Dumbbell className="w-4 h-4" />,
        label: "Personal Trainer",
        color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      },
      [UserProfiles.STUDENT]: {
        icon: <User className="w-4 h-4" />,
        label: "Aluno",
        color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      },
    };

    const profileId = userData.profile?.id || UserProfiles.STUDENT;
    const badge = badges[profileId] || badges[UserProfiles.STUDENT];

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${badge.color}`}
      >
        {badge.icon}
        {badge.label}
      </div>
    );
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

  return (
    <div className="min-h-screen bg-neutral-dark-01">
      {/* Header com gradiente */}
      <div className="relative pb-24 pt-6 px-4">
        <motion.div
          className="max-w-4xl mx-auto flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-neutral-white-01">
            Meu Perfil
          </h1>
          <Button
            size="sm"
            variant="outline"
            className="border-primary/30 hover:border-primary hover:bg-primary/10"
            onClick={() => setIsUpdateDrawerOpen(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </motion.div>

        {/* Card de perfil flutuante */}
        <motion.div
          className="max-w-4xl mx-auto mt-6 bg-neutral-dark-03 rounded-2xl shadow-xl border border-neutral-white-01/5 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Banner top - mais suave e com gradiente radial */}
          <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark-03 via-transparent to-transparent" />
          </div>

          {/* Conteúdo do perfil */}
          <div className="px-6 pb-6 -mt-16">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
              {/* Avatar */}
              <div className="relative">
                <ProfileImageUpload user={userData} onImageUpdate={() => refetch()} />
              </div>

              {/* Info principal */}
              <div className="flex-1 space-y-3 pb-2">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-white-01">
                    {userData.name}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {userData.profile?.id !== UserProfiles.STUDENT && getProfileBadge()}
                  {userData.professionalCredential && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium bg-amber-500/10 text-amber-400 border-amber-500/20">
                      <Award className="w-4 h-4" />
                      {userData.professionalCredential.type === "CRN" ? "CRN" : "CREF"} {userData.professionalCredential.credentialId}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Drawer de edição */}
      {userData && (
        <UpdateProfileDrawer
          open={isUpdateDrawerOpen}
          onOpenChange={setIsUpdateDrawerOpen}
          userData={userData}
          onSuccess={() => refetch()}
        />
      )}

      {/* Conteúdo principal */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 pb-8">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Informações de Contato */}
          <motion.div
            className="bg-neutral-dark-03 rounded-xl p-5 border border-neutral-white-01/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-neutral-white-01">Contato</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-neutral-white-02 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-white-02 mb-0.5">Email</p>
                  <p className="text-sm text-neutral-white-01 break-all">
                    {userData.email}
                  </p>
                </div>
              </div>
              {userData.phoneNumber && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-neutral-white-02 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-white-02 mb-0.5">
                      Telefone
                    </p>
                    <p className="text-sm text-neutral-white-01">
                      {userData.phoneNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Informações Pessoais */}
          <motion.div
            className="bg-neutral-dark-03 rounded-xl p-5 border border-neutral-white-01/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-neutral-white-01">
                Dados Pessoais
              </h3>
            </div>
            <div className="space-y-3">
              {userData.dateOfBirth && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-neutral-white-02 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-neutral-white-02 mb-0.5">
                      Nascimento
                    </p>
                    <p className="text-sm text-neutral-white-01">
                      {formatDate(userData.dateOfBirth)}
                      {calculateAge(userData.dateOfBirth) &&
                        ` • ${calculateAge(userData.dateOfBirth)} anos`}
                    </p>
                  </div>
                </div>
              )}
              {userData.sex && (
                <div className="flex items-start gap-3">
                  <VenusAndMars className="w-4 h-4 text-neutral-white-02 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-neutral-white-02 mb-0.5">Sexo</p>
                    <p className="text-sm text-neutral-white-01">
                      {getSexLabel(userData.sex)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Endereço */}
          {userData.address && (
            <motion.div
              className="bg-neutral-dark-03 rounded-xl p-5 border border-neutral-white-01/5 md:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Home className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-neutral-white-01">
                  Endereço
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-neutral-white-02 mb-1">CEP</p>
                  <p className="text-sm text-neutral-white-01">
                    {userData.address.zipCode || "—"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-neutral-white-02 mb-1">Rua</p>
                  <p className="text-sm text-neutral-white-01">
                    {userData.address.addressLine || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-white-02 mb-1">Número</p>
                  <p className="text-sm text-neutral-white-01">
                    {userData.address.number || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-white-02 mb-1">Cidade</p>
                  <p className="text-sm text-neutral-white-01">
                    {userData.address.city || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-white-02 mb-1">Estado</p>
                  <p className="text-sm text-neutral-white-01">
                    {userData.address.state || "—"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Credenciais Profissionais */}
          {userData.professionalCredential?.biography && (
            <motion.div
              className="bg-neutral-dark-03 rounded-xl p-5 border border-neutral-white-01/5 md:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-neutral-white-01">
                  Sobre mim
                </h3>
              </div>
              <p className="text-sm text-neutral-white-02 leading-relaxed">
                {userData.professionalCredential.biography}
              </p>
            </motion.div>
          )}
        </div>

        {/* Footer info & logout */}
        <motion.div
          className="mt-6 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-xs text-center text-neutral-white-02">
            Membro desde {formatDate(userData.createdAt)}
          </p>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da conta
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
