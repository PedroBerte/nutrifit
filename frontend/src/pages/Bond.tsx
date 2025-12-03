import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { useGetMyBonds, useUpdateBond } from "@/services/api/bond";
import type { CustomerProfessionalBondType } from "@/types/professional";
import { Check, X, UserPlus } from "lucide-react";
import React, { useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import { motion } from "motion/react";
import InviteStudentDrawer from "@/components/InviteStudentDrawer";
import { AvatarImage } from "@/components/ui/avatar-image";
import { useQueryClient } from "@tanstack/react-query";

import PersonalSemVinculo from "@/assets/personal/PersonalSemVinculo.png";

export default function Bond() {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useGetMyBonds();
  const { mutate: updateBond, isPending: isUpdating } = useUpdateBond();
  const toast = useToast();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInviteDrawerOpen, setIsInviteDrawerOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    bond: CustomerProfessionalBondType;
    action: "accept" | "reject" | "cancel";
  } | null>(null);

  // Garantir que data é um array
  const bonds = Array.isArray(data) ? data : [];
  const activeBonds = bonds.filter((bond) => bond.status === "A");
  const pendingBonds = bonds.filter((bond) => bond.status === "P");

  const openDrawer = (
    bond: CustomerProfessionalBondType,
    action: "accept" | "reject" | "cancel"
  ) => {
    setPendingAction({ bond, action });
    setIsDrawerOpen(true);
  };

  const executeAction = async () => {
    if (!pendingAction) return;

    const { bond, action } = pendingAction;
    let newStatus = "";

    switch (action) {
      case "accept":
        newStatus = "A";
        break;
      case "reject":
        newStatus = "R";
        break;
      case "cancel":
        newStatus = "C";
        break;
    }

    updateBond(
      { ...bond, status: newStatus },
      {
        onSuccess: () => {
          switch (action) {
            case "accept":
              toast.success("Vínculo aceito com sucesso!");
              break;
            case "reject":
              toast.error("Vínculo rejeitado com sucesso!");
              break;
            case "cancel":
              toast.info("Vínculo cancelado com sucesso!");
              break;
          }
          // Invalida e refaz as queries imediatamente
          queryClient.invalidateQueries({ queryKey: ["getMyBonds"] });
          queryClient.invalidateQueries({ queryKey: ["getActiveStudents"] });
          refetch();
          setIsDrawerOpen(false);
          setPendingAction(null);
        },
        onError: () => {
          toast.error("Erro ao executar ação. Tente novamente.");
        },
      }
    );
  };

  const cancelAction = () => {
    setIsDrawerOpen(false);
    setPendingAction(null);
  };

  const getActionText = () => {
    if (!pendingAction) return "";

    switch (pendingAction.action) {
      case "accept":
        return "aceitar";
      case "reject":
        return "rejeitar";
      case "cancel":
        return "cancelar";
      default:
        return "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-1 py-4 flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <p className="font-bold text-2xl">Vínculos</p>
        <Button onClick={() => setIsInviteDrawerOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Convidar Aluno
        </Button>
      </div>
      <p className="font-bold">Vínculos ativos</p>
      <section className="bg-neutral-dark-03 rounded-sm p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner className="size-6 text-primary" />
          </div>
        ) : activeBonds.length > 0 ? (
          activeBonds.map((bond) => (
            <div
              key={bond.id}
              className="flex flex-row items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <AvatarImage
                  imageUrl={bond.customer?.imageUrl}
                  name={bond.customer?.name || "Aluno"}
                  email={bond.customer?.email}
                  id={bond.customerId}
                  size="sm"
                />
                <div className="flex flex-col gap-0.5">
                  <p className="font-medium">{bond?.customer?.name}</p>
                  <p className="text-xs text-neutral-dark-02">
                    {bond.createdAt &&
                      new Date(bond.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <button
                className="bg-red-600 text-white px-2 py-2 rounded-md hover:bg-red-700 transition-colors"
                onClick={() => openDrawer(bond, "cancel")}
                disabled={isUpdating}
              >
                <X size={18} />
              </button>
            </div>
          ))
        ) : (
          <div>Nenhum vínculo ativo.</div>
        )}
      </section>
      <p className="font-bold">Vínculos solicitados</p>

      <section className="bg-neutral-dark-03 rounded-sm p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner className="size-6 text-primary" />
          </div>
        ) : pendingBonds.length > 0 ? (
          pendingBonds.map((bond) => (
            <div
              key={bond.id}
              className="flex flex-row items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <AvatarImage
                  imageUrl={bond.customer?.imageUrl}
                  name={bond.customer?.name || "Aluno"}
                  email={bond.customer?.email}
                  id={bond.customerId}
                  size="sm"
                />
                <div className="flex flex-col gap-0.5">
                  <p className="font-medium">{bond?.customer?.name}</p>
                  <p className="text-xs text-neutral-dark-02">
                    {bond.createdAt &&
                      new Date(bond.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="bg-red-600 text-white px-2 py-2 rounded-md hover:bg-red-700 transition-colors"
                  onClick={() => openDrawer(bond, "reject")}
                  disabled={isUpdating}
                >
                  <X size={18} />
                </button>
                <button
                  className="bg-green-600 text-white px-2 py-2 rounded-md hover:bg-green-700 transition-colors"
                  onClick={() => openDrawer(bond, "accept")}
                  disabled={isUpdating}
                >
                  <Check size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col w-full bg-neutral-dark-03 rounded-sm justify-center items-center py-5 gap-2">
            <div>Nenhum vínculo solicitado.</div>
            <img
              src={PersonalSemVinculo}
              alt="Nenhum vínculo encontrado"
              className="w-64 object-contain"
            />
          </div>
        )}
      </section>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Confirmar ação</DrawerTitle>
            <DrawerDescription>
              {pendingAction && (
                <>
                  Tem certeza que deseja <strong>{getActionText()}</strong> o
                  vínculo com{" "}
                  <strong>{pendingAction?.bond?.customer?.name}</strong>?
                </>
              )}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button onClick={executeAction} variant="default">
              Sim, {getActionText()}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" onClick={cancelAction}>
                Cancelar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <InviteStudentDrawer
        open={isInviteDrawerOpen}
        onOpenChange={setIsInviteDrawerOpen}
      />
    </motion.div>
  );
}
