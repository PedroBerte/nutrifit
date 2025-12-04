import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDeleteBond, useUpdateBond } from "@/services/api/bond";
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
  X,
} from "lucide-react";
import type { CustomerProfessionalBondType } from "@/types/professional";
import {
  useCreateBond,
  useGetBondsSent,
  useGetBondAsCustomer,
} from "@/services/api/bond";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "@/contexts/ToastContext";
import { useGetProfessionalFeedbacks } from "@/services/api/feedback";
import { AvatarImage } from "@/components/ui/avatar-image";
import {
  addFavorite,
  removeFavorite,
  useCheckFavorite,
} from "@/services/api/favorite";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";

export default function Professional() {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showUnbondDialog, setShowUnbondDialog] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const { mutate: deleteBond, isPending: isDeleting } = useDeleteBond();
  const updateBondMutation = useUpdateBond();
  const { user, logout } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: bondsSent, refetch: refetchBondsSent } = useGetBondsSent();
  const { data: activeBond, refetch: refetchActiveBond } =
    useGetBondAsCustomer();
  const { mutate: createProposal } = useCreateBond();
  const { data: feedbacks } = useGetProfessionalFeedbacks(id);
  const { data: isFavoriteData, refetch: refetchFavorite } =
    useCheckFavorite(id);

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
  const hasActiveBond =
    activeBond?.professionalId === id && activeBond?.status === "A";

  // Verifica se já tem vínculo ativo com OUTRO profissional
  const hasAnyActiveBond =
    activeBond?.status === "A" && activeBond?.professionalId !== id;

  // Garante que bondsSent é um array
  const bondsSentArray = Array.isArray(bondsSent) ? bondsSent : [];

  // Verifica se já enviou proposta pendente
  const hasPendingProposal = bondsSentArray.some(
    (bond) => bond.professionalId === id && bond.status === "P"
  );

  // Pega o bond pendente para cancelar
  const pendingBond = bondsSentArray.find(
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
    // ou se já existe uma proposta pendente
    if (
      isSending ||
      alreadySentProposal ||
      hasPendingProposal ||
      hasActiveBond ||
      hasAnyActiveBond
    )
      return;

    setIsSending(true);
    setAlreadySentProposal(true); // Previne cliques duplos imediatamente

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
        // Atualizar a lista de bonds enviados para refletir a nova proposta
        refetchBondsSent();
      },
      onError: () => {
        setAlreadySentProposal(false); // Restaura para permitir nova tentativa
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
    <div className="flex flex-col flex-1 h-full bg-neutral-dark-01">
      <div className="flex flex-col flex-1 gap-3 mt-6 overflow-y-auto">
        {/* User Avatar and Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col items-center gap-3 p-4 rounded-lg bg-neutral-dark-03"
        >
          {/* Botão de Favorito no topo direito */}
          <motion.button
            className="absolute z-10 top-3 right-3"
            onClick={handleFavoriteClick}
            disabled={isTogglingFavorite}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            <Bookmark
              className={`w-5 h-5 transition-all ${
                isFavorite
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

          <div className="space-y-2 text-center">
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
            <div className="flex justify-center w-full mt-3">
              <a
                href={`https://wa.me/55${userData.phoneNumber.replace(
                  /\D/g,
                  ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 space-x-2 text-green-400 transition-colors border rounded-lg shadow bg-green-500/10 border-green-500/30 hover:bg-green-500/20 group"
              >
                <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">
                  WhatsApp: {userData.phoneNumber}
                </span>
              </a>
            </div>
          )}
        </motion.div>

        <Button
          onClick={() => id && sendProposal(id)}
          disabled={
            hasActiveBond ||
            hasAnyActiveBond ||
            hasPendingProposal ||
            alreadySentProposal ||
            isSending
          }
        >
          {hasActiveBond
            ? "Seu Personal"
            : hasAnyActiveBond
            ? "Você já tem um Personal"
            : hasPendingProposal || alreadySentProposal
            ? "Proposta Pendente"
            : "Enviar Proposta"}
        </Button>

        {/* Botões de ação quando há vínculo ativo */}
        {hasActiveBond && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-primary/30 hover:border-primary hover:bg-primary/10"
              onClick={() => setShowFeedbackModal(true)}
            >
              <Star className="w-4 h-4" />
              <span className="hidden xs:inline">Avaliar</span>
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
              onClick={() => setShowUnbondDialog(true)}
              disabled={updateBondMutation.isPending}
            >
              <X className="w-4 h-4" />
              <span className="hidden xs:inline">Cancelar vínculo</span>
              <span className="xs:hidden">Desvincular</span>
            </Button>
          </div>
        )}

        {alreadySentProposal && (
          <>
            <Button
              variant="outline"
              className="text-red-500 border-red-500 hover:bg-red-500/10 focus:ring-red-500"
              onClick={() => setShowCancelDialog(true)}
              disabled={isDeleting}
            >
              Cancelar proposta
            </Button>

            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-red-500">
                    Cancelar proposta?
                  </DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja cancelar sua proposta para{" "}
                    <strong>{userData.name}</strong>?<br />
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
                          queryClient.invalidateQueries({
                            queryKey: ["getBondsSent"],
                          });
                        },
                        onError: () => {
                          toast.error(
                            "Erro ao cancelar proposta. Tente novamente."
                          );
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

        <div className="overflow-hidden rounded-lg bg-neutral-dark-03">
          <button
            onClick={() => toggleSection("personalInfo")}
            className="flex items-center justify-between w-full p-4 transition-colors hover:bg-neutral-dark-03"
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
          <div className="overflow-hidden rounded-lg bg-neutral-dark-03">
            <button
              onClick={() => toggleSection("credentials")}
              className="flex items-center justify-between w-full p-4 transition-colors hover:bg-neutral-dark-03"
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
                        <span className="block mb-1 text-xs text-neutral-white-02">
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
                          <span className="block mb-1 text-xs text-neutral-white-02">
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
          <div className="overflow-hidden rounded-lg bg-neutral-dark-03">
            <button
              onClick={() => toggleSection("address")}
              className="flex items-center justify-between w-full p-4 transition-colors hover:bg-neutral-dark-03"
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
                        <span className="block mb-1 text-xs text-neutral-white-02">
                          CEP:
                        </span>
                        <span className="text-sm text-neutral-white-01">
                          {userData.address.zipCode || "Não informado"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="block mb-1 text-xs text-neutral-white-02">
                            Rua
                          </span>
                          <span className="text-sm text-neutral-white-01">
                            {userData.address.addressLine || "Não informado"}
                          </span>
                        </div>
                        <div>
                          <span className="block mb-1 text-xs text-neutral-white-02">
                            Número
                          </span>
                          <span className="text-sm text-neutral-white-01">
                            {userData.address.number || "Não informado"}
                          </span>
                        </div>
                        <div>
                          <span className="block mb-1 text-xs text-neutral-white-02">
                            Estado
                          </span>
                          <span className="text-sm text-neutral-white-01">
                            {userData.address.state || "Não informado"}
                          </span>
                        </div>
                        <div>
                          <span className="block mb-1 text-xs text-neutral-white-02">
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
            className="p-4 bg-neutral-dark-03 rounded-xl"
          >
            <h3 className="mb-4 text-lg font-semibold">Avaliações</h3>
            <div className="space-y-4 overflow-y-auto max-h-96">
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
                    <p className="text-sm leading-relaxed text-gray-400">
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
          className="text-xs text-center text-neutral-white-02"
        >
          Conta criada em {formatDate(userData.createdAt)}
        </motion.div>
      </div>

      {/* Unbind Confirmation Dialog */}
      <Dialog open={showUnbondDialog} onOpenChange={setShowUnbondDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-500">
              Cancelar vínculo?
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja se desvincular de{" "}
              <strong>{userData.name}</strong>?
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
              disabled={updateBondMutation.isPending}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!activeBond) return;
                updateBondMutation.mutate(
                  { ...activeBond, status: "C" },
                  {
                    onSuccess: () => {
                      toast.success("Vínculo cancelado com sucesso!");
                      setShowUnbondDialog(false);
                      // Invalida e refaz as queries para atualizar a UI imediatamente
                      queryClient.invalidateQueries({
                        queryKey: ["getBondAsCustomer"],
                      });
                      queryClient.invalidateQueries({
                        queryKey: ["getBondsSent"],
                      });
                      refetchActiveBond();
                      refetchBondsSent();
                    },
                    onError: () => {
                      toast.error("Erro ao cancelar vínculo. Tente novamente.");
                    },
                  }
                );
              }}
              disabled={updateBondMutation.isPending}
            >
              {updateBondMutation.isPending
                ? "Cancelando..."
                : "Sim, desvincular"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Modal */}
      {userData && user && user.id && userData.id && (
        <FeedbackModal
          open={showFeedbackModal}
          onOpenChange={setShowFeedbackModal}
          professionalId={userData.id}
          professionalName={userData.name}
          professionalImageUrl={userData.imageUrl || undefined}
          customerId={user.id}
        />
      )}
    </div>
  );
}
