import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Users,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useGetBondAsCustomer, useUpdateBond } from "@/services/api/bond";
import { AvatarImage } from "@/components/ui/avatar-image";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";

export default function Profile() {
    const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    data: userData,
    isLoading,
    error,
    refetch,
  } = useGetUserById(user?.id);
  const {
    data: studentBond,
    isLoading: loadingBond,
    refetch: refetchBond,
  } = useGetBondAsCustomer();
  const updateBondMutation = useUpdateBond();
  const [isUpdateDrawerOpen, setIsUpdateDrawerOpen] = useState(false);
  const [showUnbondDialog, setShowUnbondDialog] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

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
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10">
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

  const handleUnbond = async () => {
    if (!studentBond) return;

    try {
      await updateBondMutation.mutateAsync({
        ...studentBond,
        status: "C",
      });

      toast.success("Vínculo cancelado com sucesso!");
      setShowUnbondDialog(false);
      refetchBond();
    } catch (error) {
      toast.error("Erro ao cancelar vínculo. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen pt-2 bg-neutral-dark-01">
      {/* Header com gradiente */}
      <motion.div
        className="flex items-center justify-between max-w-4xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-xl xs:text-2xl font-bold text-neutral-white-01">
          Meu Perfil
        </h1>
        <Button
          size="sm"
          variant="outline"
          className="border-primary/30 hover:border-primary hover:bg-primary/10"
          onClick={() => setIsUpdateDrawerOpen(true)}
        >
          <Edit className="w-4 h-4" />
          <span className="hidden xs:inline">Editar</span>
        </Button>
      </motion.div>

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
      <div className="max-w-4xl pb-8 mx-auto">
        <div className="grid gap-3 xs:gap-4 md:grid-cols-2">

          {/* Card de perfil */}
          <motion.div
            className="w-full max-w-4xl mx-auto mt-4 xs:mt-6 overflow-hidden border shadow-xl bg-neutral-dark-03 rounded-xl xs:rounded-2xl border-neutral-white-01/5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Banner top - mais suave e com gradiente radial */}
            <div className="relative h-16 xs:h-24 overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5">
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark-03 via-transparent to-transparent" />
            </div>

            {/* Conteúdo do perfil */}
            <div className="px-4 xs:px-6 pb-4 xs:pb-6 -mt-12 xs:-mt-16">
              <div className="flex flex-col items-start gap-4 xs:gap-6 sm:flex-row sm:items-end">
                {/* Avatar */}
                <div className="relative">
                  <ProfileImageUpload user={userData} onImageUpdate={() => refetch()} />
                </div>

                {/* Info principal */}
                <div className="flex-1 pb-2 space-y-2 xs:space-y-3 min-w-0">
                  <div>
                    <h2 className="text-xl xs:text-2xl font-bold text-neutral-white-01 truncate">
                      {userData.name}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-1.5 xs:gap-2">
                    {userData.profile?.id !== UserProfiles.STUDENT && getProfileBadge()}
                    {userData.professionalCredential && (
                      <div className="inline-flex items-center gap-1 xs:gap-1.5 px-2 xs:px-3 py-1 xs:py-1.5 rounded-full border text-[10px] xs:text-xs font-medium bg-amber-500/10 text-amber-400 border-amber-500/20">
                        <Award className="w-3 h-3 xs:w-4 xs:h-4" />
                        <span className="hidden xs:inline">{userData.professionalCredential.type === "CRN" ? "CRN" : "CREF"}</span> {userData.professionalCredential.credentialId}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bond Management Section - Only for Students */}
          {userData.profile?.id === UserProfiles.STUDENT && (
            <motion.div
              className="p-4 xs:p-5 border bg-neutral-dark-03 rounded-xl border-neutral-white-01/5 md:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-3 xs:mb-4">
                <div className="flex items-center justify-center w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-primary/10">
                  <Users className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm xs:text-base text-neutral-white-01">
                  Vínculos
                </h3>
              </div>

              {loadingBond ? (
                <p className="py-4 text-sm text-center text-neutral-white-02">
                  Carregando vínculo...
                </p>
              ) : studentBond && studentBond.status === "P" && studentBond.professional ? (
                <div
                  className="relative p-4 overflow-hidden transition border rounded-lg cursor-pointer bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20"
                  onClick={() => {
                    if (studentBond.professional?.id) {
                      navigate(`/professional/${studentBond.professional.id}`);
                    }
                  }}
                  title={`Ver perfil de ${studentBond.professional?.name ?? "Profissional"}`}
                >
                  <div className="flex items-center gap-3">
                    <AvatarImage
                      imageUrl={studentBond.professional.imageUrl}
                      name={studentBond.professional.name}
                      size="lg"
                    />
                    <div>
                      <h4 className="font-semibold text-yellow-700 truncate">
                        {studentBond.professional.name}
                      </h4>
                      <p className="mt-1 text-xs text-yellow-700">
                        Proposta de vínculo pendente
                      </p>
                      {studentBond.createdAt && (
                        <p className="mt-1 text-xs text-yellow-700">
                          Enviada em {new Date(studentBond.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : studentBond && studentBond.status === "A" && studentBond.professional ? (
                <div className="relative p-3 xs:p-4 overflow-hidden border rounded-lg bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-primary/20">
                  <div className="absolute inset-0 opacity-50 bg-gradient-to-br from-primary/5 to-transparent" />
                  <div className="relative flex flex-col items-start gap-3">
                    <div 
                      className="flex items-start w-full gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate(`/professional/${studentBond.professional?.id}`)}
                    >
                      <div className="flex-shrink-0">
                        <AvatarImage
                          imageUrl={studentBond.professional.imageUrl}
                          name={studentBond.professional.name}
                          size="md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm xs:text-base truncate text-neutral-white-01">
                          {studentBond.professional.name}
                        </h4>
                        <p className="overflow-hidden text-xs xs:text-sm truncate text-neutral-white-02">
                          {studentBond.professional.email}
                        </p>
                        {studentBond.professional.professionalCredential && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5 xs:mt-2">
                            <span className="px-1.5 xs:px-2 py-0.5 xs:py-1 text-[10px] xs:text-xs border rounded-md bg-amber-500/10 text-amber-400 border-amber-500/20">
                              {studentBond.professional.professionalCredential.type === "CRN" ? "CRN" : "CREF"}{" "}
                              {studentBond.professional.professionalCredential.credentialId}
                            </span>
                          </div>
                        )}
                        {studentBond.createdAt && (
                          <p className="mt-1.5 xs:mt-2 text-[10px] xs:text-xs text-neutral-white-02">
                            Vínculo desde{" "}
                            {new Date(studentBond.createdAt).toLocaleDateString(
                              "pt-BR"
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap w-full gap-2 pt-2 border-t border-neutral-white-01/10">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/professional/${studentBond.professional?.id}`)}
                        className="flex-1 text-xs xs:text-sm border-primary/30 hover:border-primary hover:bg-primary/10"
                      >
                        <User className="w-3 h-3 xs:w-4 xs:h-4" />
                        <span className="hidden xs:inline">Ver perfil</span>
                        <span className="xs:hidden">Perfil</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFeedbackModal(true)}
                        className="flex-1 text-xs xs:text-sm border-primary/30 hover:border-primary hover:bg-primary/10"
                      >
                        Avaliar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowUnbondDialog(true)}
                        disabled={updateBondMutation.isPending}
                        className="flex-1 text-xs xs:text-sm text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
                      >
                        <X className="w-3 h-3 xs:w-4 xs:h-4" />
                        <span className="hidden xs:inline">Cancelar</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="py-4 text-sm text-center text-neutral-white-02">
                  Nenhum vínculo ativo no momento
                </p>
              )}
            </motion.div>
          )}

          {/* Informações de Contato */}
          <motion.div
            className="p-4 xs:p-5 border bg-neutral-dark-03 rounded-xl border-neutral-white-01/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3 xs:mb-4">
              <div className="flex items-center justify-center w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-primary/10">
                <Mail className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm xs:text-base text-neutral-white-01">Contato</h3>
            </div>
            <div className="space-y-2 xs:space-y-3">
              <div className="flex items-start gap-2 xs:gap-3">
                <Mail className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-neutral-white-02 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] xs:text-xs text-neutral-white-02 mb-0.5">Email</p>
                  <p className="text-xs xs:text-sm break-all text-neutral-white-01">
                    {userData.email}
                  </p>
                </div>
              </div>
              {userData.phoneNumber && (
                <div className="flex items-start gap-2 xs:gap-3">
                  <Phone className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-neutral-white-02 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] xs:text-xs text-neutral-white-02 mb-0.5">
                      Telefone
                    </p>
                    <p className="text-xs xs:text-sm text-neutral-white-01">
                      {userData.phoneNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>



          {/* Informações Pessoais */}
          <motion.div
            className="p-4 xs:p-5 border bg-neutral-dark-03 rounded-xl border-neutral-white-01/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <div className="flex items-center gap-2 mb-3 xs:mb-4">
              <div className="flex items-center justify-center w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-primary/10">
                <User className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm xs:text-base text-neutral-white-01">
                Dados Pessoais
              </h3>
            </div>
            <div className="space-y-2 xs:space-y-3">
              {userData.dateOfBirth && (
                <div className="flex items-start gap-2 xs:gap-3">
                  <Calendar className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-neutral-white-02 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] xs:text-xs text-neutral-white-02 mb-0.5">
                      Nascimento
                    </p>
                    <p className="text-xs xs:text-sm text-neutral-white-01">
                      {formatDate(userData.dateOfBirth)}
                      {calculateAge(userData.dateOfBirth) &&
                        ` • ${calculateAge(userData.dateOfBirth)} anos`}
                    </p>
                  </div>
                </div>
              )}
              {userData.sex && (
                <div className="flex items-start gap-2 xs:gap-3">
                  <VenusAndMars className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-neutral-white-02 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] xs:text-xs text-neutral-white-02 mb-0.5">Sexo</p>
                    <p className="text-xs xs:text-sm text-neutral-white-01">
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
              className="p-4 xs:p-5 border bg-neutral-dark-03 rounded-xl border-neutral-white-01/5 md:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3 xs:mb-4">
                <div className="flex items-center justify-center w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-primary/10">
                  <Home className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm xs:text-base text-neutral-white-01">
                  Endereço
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 xs:gap-4 sm:grid-cols-4">
                <div>
                  <p className="mb-0.5 xs:mb-1 text-[10px] xs:text-xs text-neutral-white-02">CEP</p>
                  <p className="text-xs xs:text-sm text-neutral-white-01">
                    {userData.address.zipCode || "—"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="mb-0.5 xs:mb-1 text-[10px] xs:text-xs text-neutral-white-02">Rua</p>
                  <p className="text-xs xs:text-sm text-neutral-white-01 truncate">
                    {userData.address.addressLine || "—"}
                  </p>
                </div>
                <div>
                  <p className="mb-0.5 xs:mb-1 text-[10px] xs:text-xs text-neutral-white-02">Número</p>
                  <p className="text-xs xs:text-sm text-neutral-white-01">
                    {userData.address.number || "—"}
                  </p>
                </div>
                <div>
                  <p className="mb-0.5 xs:mb-1 text-[10px] xs:text-xs text-neutral-white-02">Cidade</p>
                  <p className="text-xs xs:text-sm text-neutral-white-01">
                    {userData.address.city || "—"}
                  </p>
                </div>
                <div>
                  <p className="mb-0.5 xs:mb-1 text-[10px] xs:text-xs text-neutral-white-02">Estado</p>
                  <p className="text-xs xs:text-sm text-neutral-white-01">
                    {userData.address.state || "—"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Credenciais Profissionais */}
          {userData.professionalCredential?.biography && (
            <motion.div
              className="p-4 xs:p-5 border bg-neutral-dark-03 rounded-xl border-neutral-white-01/5 md:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <div className="flex items-center gap-2 mb-3 xs:mb-4">
                <div className="flex items-center justify-center w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-primary/10">
                  <FileText className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm xs:text-base text-neutral-white-01">
                  Sobre mim
                </h3>
              </div>
              <p className="text-xs xs:text-sm leading-relaxed text-neutral-white-02">
                {userData.professionalCredential.biography}
              </p>
            </motion.div>
          )}


        </div>

        {/* Footer info & logout */}
        <motion.div
          className="mt-4 xs:mt-6 space-y-3 xs:space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-[10px] xs:text-xs text-center text-neutral-white-02">
            Membro desde {formatDate(userData.createdAt)}
          </p>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da conta</span>
          </Button>
        </motion.div>
      </div>

      {/* Unbind Confirmation Dialog */}
      <Dialog open={showUnbondDialog} onOpenChange={setShowUnbondDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar desvinculação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja se desvincular de{" "}
              <strong>{studentBond?.professional?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Ao desvincular, você perderá acesso às rotinas criadas por este
              profissional e ele não poderá mais gerenciar seu treinamento.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUnbondDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnbond}
              disabled={updateBondMutation.isPending}
            >
              {updateBondMutation.isPending
                ? "Desvinculando..."
                : "Desvincular"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Modal */}
      {studentBond?.professional && (
        <FeedbackModal
          open={showFeedbackModal}
          onOpenChange={setShowFeedbackModal}
          professionalId={studentBond.professionalId!}
          professionalName={studentBond.professional.name}
          professionalImageUrl={studentBond.professional.imageUrl || undefined}
          customerId={user?.id || ""}
        />
      )}
    </div>
  );
}
