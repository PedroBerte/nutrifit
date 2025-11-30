import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDeleteBond } from "@/services/api/bond";
import { useAuth } from "@/contexts/AuthContext";
import { useGetUserById } from "@/services/api/user";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
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
  Star,
  ChevronDown,
  ChevronUp,
  Bookmark,
  MessageCircle,
} from "lucide-react";
import type { CustomerProfessionalBondType } from "@/types/professional";
import { useCreateBond, useGetBondsSent, useGetBondAsCustomer } from "@/services/api/bond";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "@/contexts/ToastContext";
import { useGetProfessionalFeedbacks } from "@/services/api/feedback";
import { AvatarImage } from "@/components/ui/avatar-image";
import { addFavorite, removeFavorite, useCheckFavorite } from "@/services/api/favorite";

export default function Professional() {
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const { mutate: deleteBond, isPending: isDeleting } = useDeleteBond();
  const { user, logout } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: bondsSent } = useGetBondsSent();
  const { data: activeBond } = useGetBondAsCustomer();
  const { mutate: createProposal } = useCreateBond();
  const { data: feedbacks } = useGetProfessionalFeedbacks(id);
  const { data: isFavoriteData, refetch: refetchFavorite } = useCheckFavorite(id);

  const [expandedSections, setExpandedSections] = useState({
    personalInfo: true,
    credentials: false,
    address: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!id) navigate("/home");

  // Verifica se já existe vínculo ativo com este professional
  const hasActiveBond = activeBond?.professionalId === id && activeBond?.status === "A";

  // Verifica se já tem vínculo ativo com OUTRO profissional
  const hasAnyActiveBond = activeBond?.status === "A" && activeBond?.professionalId !== id;

  // Verifica se já enviou proposta pendente
  const hasPendingProposal = bondsSent
    ? bondsSent?.some(
      (bond) => bond.professionalId === id && bond.status === "P"
    ) ?? false
    : false;

  // Pega o bond pendente para cancelar
  const pendingBond = bondsSent?.find(
    (bond) => bond.professionalId === id && bond.status === "P"
  );

  const [alreadySentProposal, setAlreadySentProposal] =
    useState(hasPendingProposal);
  const [isSending, setIsSending] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Usa o valor do hook, não precisa de state local
  const isFavorite = isFavoriteData ?? false;

  useEffect(() => {
    setAlreadySentProposal(hasPendingProposal);
  }, [hasPendingProposal]);

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
    // Não permite enviar proposta se já tem vínculo ativo (com este ou outro profissional)
    if (isSending || alreadySentProposal || hasActiveBond || hasAnyActiveBond) return;

    setIsSending(true);

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
    };

    createProposal(newProposal, {
      onSuccess: () => {
        setAlreadySentProposal(true);
        setIsSending(false);
        toast.success("Proposta enviada com sucesso!");
      },
      onError: () => {
        setIsSending(false);
        toast.error("Ocorreu um erro ao enviar a proposta.");
      },
    });
  };

  const handleFavoriteClick = async () => {
    if (isTogglingFavorite || !id) return;

    setIsTogglingFavorite(true);

    try {
      if (isFavorite) {
        await removeFavorite(id);
        toast.success("Removido dos favoritos!");
      } else {
        await addFavorite(id);
        toast.success("Adicionado aos favoritos!");
      }
      // Atualiza o status do favorito
      refetchFavorite();
      // Invalida o cache da lista de profissionais para atualizar isFavorite
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (error) {
      console.error("Erro ao alterar favorito:", error);
      toast.error("Erro ao alterar favorito");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-neutral-dark-01">
      <div className="flex-1 mt-6 overflow-y-auto flex gap-3 flex-col">
        {/* User Avatar and Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 bg-neutral-dark-03 p-4 rounded-lg relative"
        >
          {/* Botão de Favorito no topo direito */}
          <motion.button
            className="absolute top-3 right-3 z-10"
            onClick={handleFavoriteClick}
            disabled={isTogglingFavorite}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            <Bookmark
              className={`w-5 h-5 transition-all ${isFavorite
                ? "fill-primary text-primary"
                : "text-gray-400 hover:text-gray-300"
                }`}
            />
          </motion.button>

          <AvatarImage
            imageUrl={userData.imageUrl}
            name={userData.name}
            email={userData.email}
            id={userData.id}
            size="xl"
          />

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

          {/* Seção de Contato */}
          {userData.phoneNumber && (
            <div className="mt-3 w-full flex justify-center">
              <a
                href={`https://wa.me/55${userData.phoneNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-colors group shadow"
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">WhatsApp: {userData.phoneNumber}</span>
              </a>
            </div>
          )}
        </motion.div>

        <Button
          onClick={() => id && sendProposal(id)}
          disabled={hasActiveBond || hasAnyActiveBond || alreadySentProposal || isSending}
        >
          {hasActiveBond
            ? "Seu Personal"
            : hasAnyActiveBond
              ? "Você já tem um Personal"
              : alreadySentProposal
                ? "Proposta Pendente"
                : "Enviar Proposta"}
        </Button>

        {alreadySentProposal && (
          <>
            <Button
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500/10 focus:ring-red-500"
              onClick={() => setShowCancelDialog(true)}
              disabled={isDeleting}
            >
              Cancelar proposta
            </Button>

            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-red-500">Cancelar proposta?</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja cancelar sua proposta para <strong>{userData.name}</strong>?<br />
                    Esta ação não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelDialog(false)}
                    disabled={isDeleting}
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (!pendingBond?.id) return;
                      deleteBond(pendingBond.id, {
                        onSuccess: () => {
                          toast.success("Proposta cancelada com sucesso!");
                          setShowCancelDialog(false);
                          setAlreadySentProposal(false);
                          queryClient.invalidateQueries({ queryKey: ["getBondsSent"] });
                        },
                        onError: () => {
                          toast.error("Erro ao cancelar proposta. Tente novamente.");
                        },
                      });
                    }}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Cancelando..." : "Sim, cancelar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}

        <div className="bg-neutral-dark-03 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("personalInfo")}
            className="w-full p-4 flex items-center justify-between hover:bg-neutral-dark-02 transition-colors"
          >
            <h3 className="text-lg font-semibold text-neutral-white-01">
              Informações Pessoais
            </h3>
            {expandedSections.personalInfo ? (
              <ChevronUp className="w-5 h-5 text-neutral-white-02" />
            ) : (
              <ChevronDown className="w-5 h-5 text-neutral-white-02" />
            )}
          </button>


          <AnimatePresence>
            {expandedSections.personalInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-3 p-4 pt-0">
                  <div className="flex items-center space-x-2 text-neutral-white-01">
                    <Mail className="w-5 h-5" />
                    <span className="text-sm">{userData.email}</span>
                  </div>



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
                      <span className="text-sm">
                        {getSexLabel(userData.sex)}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {userData.professionalCredential && (
          <div className="bg-neutral-dark-03 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("credentials")}
              className="w-full p-4 flex items-center justify-between hover:bg-neutral-dark-02 transition-colors"
            >
              <h3 className="text-lg font-semibold text-neutral-white-01">
                Credenciais
              </h3>
              {expandedSections.credentials ? (
                <ChevronUp className="w-5 h-5 text-neutral-white-02" />
              ) : (
                <ChevronDown className="w-5 h-5 text-neutral-white-02" />
              )}
            </button>
            <AnimatePresence>
              {expandedSections.credentials && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 space-y-3">
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-neutral-white-02 block mb-1">
                          {userData.professionalCredential.type === "CRN"
                            ? "CRN"
                            : "CREF"}
                        </span>
                        <p className="text-sm text-neutral-white-01">
                          {userData.professionalCredential.credentialId}
                        </p>
                      </div>

                      {/* {userData.professionalCredential.biography && (
                        <div className="mt-3">
                          <span className="text-xs text-neutral-white-02 block mb-1">
                            Biografia
                          </span>
                          <p className="text-sm text-neutral-white-01">
                            {userData.professionalCredential.biography}
                          </p>
                        </div>
                      )} */}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {userData.address && (
          <div className="bg-neutral-dark-03 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("address")}
              className="w-full p-4 flex items-center justify-between hover:bg-neutral-dark-02 transition-colors"
            >
              <h3 className="text-lg font-semibold text-neutral-white-01">
                Endereço
              </h3>
              {expandedSections.address ? (
                <ChevronUp className="w-5 h-5 text-neutral-white-02" />
              ) : (
                <ChevronDown className="w-5 h-5 text-neutral-white-02" />
              )}
            </button>
            <AnimatePresence>
              {expandedSections.address && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 space-y-3">
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
                            Rua
                          </span>
                          <span className="text-sm text-neutral-white-01">
                            {userData.address.addressLine || "Não informado"}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-neutral-white-02 block mb-1">
                            Número
                          </span>
                          <span className="text-sm text-neutral-white-01">
                            {userData.address.number || "Não informado"}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-neutral-white-02 block mb-1">
                            Estado
                          </span>
                          <span className="text-sm text-neutral-white-01">
                            {userData.address.state || "Não informado"}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-neutral-white-02 block mb-1">
                            Cidade
                          </span>
                          <span className="text-sm text-neutral-white-01">
                            {userData.address.city || "Não informado"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Seção de Avaliações */}
        {feedbacks && feedbacks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-dark-03 rounded-xl p-4"
          >
            <h3 className="text-lg font-semibold mb-4">Avaliações</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    {feedback.customerName && (
                      <span className="text-sm font-semibold text-neutral-white-01">
                        {feedback.customerName}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(feedback.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  {feedback.testimony && (
                    <p className="text-sm text-gray-400 leading-relaxed">
                      "{feedback.testimony}"
                    </p>
                  )}
                </div>
              ))}
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
      </div>
    </div>
  );
}
