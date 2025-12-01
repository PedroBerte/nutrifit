import { useGetBondAsCustomer } from "@/services/api/bond";
import { useDeleteBond } from "@/services/api/bond";
import { motion } from "motion/react";
import { Users, X } from "lucide-react";
import { AvatarImage } from "@/components/ui/avatar-image";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FeedbackButton } from "@/components/feedback";
import PersonalSemVinculo from "@/assets/personal/PersonalSemVinculo.png";
import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";


export default function MyProfessionals() {
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const { mutate: deleteBond, isPending: isDeleting } = useDeleteBond();
    const [cancelError, setCancelError] = useState<string | null>(null);
    const { data: bond, isLoading } = useGetBondAsCustomer();
    const navigate = useNavigate();

    return (
        <motion.div
            className="flex flex-1 flex-col gap-6 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="flex items-center gap-2 mb-2">
                <h2 className="font-semibold text-neutral-white-01 text-lg">Meus profissionais</h2>
            </div>

            {isLoading ? (
                <div className="text-center text-neutral-white-02 py-8">Carregando...</div>
            ) : !bond || (bond.status !== "A" && bond.status !== "P") ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <img
                        src={PersonalSemVinculo}
                        alt="Nenhum vínculo encontrado"
                        className="w-64 object-contain mb-4"
                    />
                    <p className="text-neutral-white-02 text-center text-base">Nenhum vínculo ativo no momento.</p>
                    <p className="text-neutral-white-02 text-center text-sm">Encontre um profissional para começar seu acompanhamento personalizado.</p>
                    <Button
                        variant="default"
                        size="lg"
                        className="mt-2"
                        onClick={() => navigate("/professionalsList")}
                    >
                        Encontrar profissionais
                    </Button>
                </div>
            ) : bond.status === "P" ? (
                <div className="relative bg-neutral-dark-03 rounded-lg p-6 border border-amber-500/30 overflow-hidden max-w-2xl w-full mx-auto">
                    <div className="flex flex-wrap gap-4 items-center w-full">
                        {bond.professional && (
                            <AvatarImage
                                imageUrl={bond.professional.imageUrl}
                                name={bond.professional.name}
                                size="xl"
                            />
                        )}
                        <div className="flex-1 min-w-0 break-words">
                            <h3 className="font-semibold text-neutral-white-01 text-lg truncate">
                                {bond.professional?.name}
                            </h3>
                            <p className="text-sm text-amber-500 font-semibold break-words">
                                Proposta de vínculo pendente
                            </p>
                            {bond.createdAt && (
                                <p className="text-xs text-neutral-white-02 mt-2 break-words">
                                    Enviada em {new Date(bond.createdAt).toLocaleDateString("pt-BR")}
                                </p>
                            )}
                            <div className="flex gap-2 mt-4 flex-wrap">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary"
                                    onClick={() => {
                                        if (bond.professional) {
                                            navigate(`/professional/${bond.professional.id}`);
                                        }
                                    }}
                                >
                                    Ver perfil
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-colors group shadow"
                                    onClick={() => setShowCancelDialog(true)}
                                    disabled={isDeleting}
                                >
                                    <X className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium">Cancelar proposta</span>
                                </Button>
                                {/* Cancel Proposal Dialog */}
                                {showCancelDialog && (
                                    <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle className="text-red-500">Cancelar proposta?</DialogTitle>
                                                <DialogDescription>
                                                    Tem certeza que deseja cancelar sua proposta para <strong>{bond.professional?.name}</strong>?<br />
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
                                                        if (!bond.id) return;
                                                        deleteBond(bond.id, {
                                                            onSuccess: () => {
                                                                setShowCancelDialog(false);
                                                                setCancelError(null);
                                                                window.location.reload();
                                                            },
                                                            onError: () => {
                                                                setCancelError("Erro ao cancelar proposta. Tente novamente.");
                                                            },
                                                        });
                                                    }}
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? "Cancelando..." : "Sim, cancelar"}
                                                </Button>
                                            </DialogFooter>
                                            {cancelError && (
                                                <p className="text-xs text-red-500 mt-2">{cancelError}</p>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : bond.status === "A" ? (
                <div className="relative bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-lg p-6 border border-primary/20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />
                    <div className="relative flex flex-col items-start gap-4">
                        <div className="flex gap-4 items-center w-full">
                            {bond.professional && (
                                <AvatarImage
                                    imageUrl={bond.professional.imageUrl}
                                    name={bond.professional.name}
                                    size="xl"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-neutral-white-01 text-lg truncate">
                                    {bond.professional?.name}
                                </h3>
                                <p className="text-sm text-neutral-white-02 truncate overflow-hidden">
                                    {bond.professional?.email}
                                </p>
                                {bond.professional?.professionalCredential && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-md border border-amber-500/20">
                                            {bond.professional.professionalCredential?.type === "CRN" ? "CRN" : "CREF"} {bond.professional.professionalCredential?.credentialId}
                                        </span>
                                    </div>
                                )}
                                {bond.createdAt && (
                                    <p className="text-xs text-neutral-white-02 mt-2">
                                        Vínculo desde {new Date(bond.createdAt).toLocaleDateString("pt-BR")}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full pt-2 border-t border-neutral-white-01/10">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (bond.professional) {
                                        navigate(`/professional/${bond.professional.id}`);
                                    }
                                }}
                                className="flex-1 border-primary/30 hover:border-primary hover:bg-primary/10"
                            >
                                Ver perfil
                            </Button>
                            {/* Botão de avaliar */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50"
                                asChild
                            >
                                <FeedbackButton
                                    professionalId={bond.professional?.id ?? ""}
                                    professionalName={bond.professional?.name ?? ""}
                                    professionalImageUrl={bond.professional?.imageUrl ?? undefined}
                                    customerId={bond.customerId ?? ""}
                                    variant="outline"
                                    size="sm"
                                />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                                disabled
                            >
                                <X className="h-4 w-4 mr-1" />
                                Cancelar vínculo
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}
        </motion.div>
    );
}
