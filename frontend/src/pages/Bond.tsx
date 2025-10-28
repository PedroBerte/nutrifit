import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
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
import { useGetAllBonds, useUpdateBond } from "@/services/api/bond";
import type { CustomerProfessionalBondType } from "@/types/professional";
import { Check, X } from "lucide-react";
import React, { useState } from "react";
import { useToast } from "@/contexts/ToastContext";

export default function Bond() {
  const { data, isLoading, refetch } = useGetAllBonds();
  const { mutate: updateBond } = useUpdateBond();
  const toast = useToast();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    bond: CustomerProfessionalBondType;
    action: "accept" | "reject" | "cancel";
  } | null>(null);

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

    switch (action) {
      case "accept":
        updateBond({ ...bond, status: "A" });
        toast.success("Vínculo aceito com sucesso!");
        break;
      case "reject":
        updateBond({ ...bond, status: "R" });
        toast.error("Vínculo rejeitado com sucesso!");
        break;
      case "cancel":
        updateBond({ ...bond, status: "C" });
        toast.info("Vínculo cancelado com sucesso!");
        break;
    }

    setTimeout(async () => {
      await refetch();
    }, 1000);

    setIsDrawerOpen(false);
    setPendingAction(null);
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
    <div className="flex flex-1 py-4 flex-col gap-3">
      <p className="font-bold text-2xl">Vínculos</p>
      <p className="font-bold">Vínculos ativos:</p>
      <section className="bg-neutral-dark-03 rounded-sm p-4 space-y-3">
        {data && data.filter((bond) => bond.status === "A").length > 0 ? (
          data.map(
            (bond) =>
              bond.status === "A" && (
                <div className="flex flex-row justify-between ">
                  <div key={bond.id} className="flex flex-col gap-1">
                    <p>{bond?.customer?.name}</p>
                    <p className="text-xs text-neutral-dark-02">
                      {bond.createdAt &&
                        new Date(bond.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      className="bg-red-600 text-white px-2 py-2 rounded-md"
                      onClick={() => openDrawer(bond, "cancel")}
                    >
                      <X />
                    </button>
                  </div>
                </div>
              )
          )
        ) : (
          <div>Nenhum vínculo ativo.</div>
        )}
      </section>
      <p className="font-bold">Vínculos solicitados:</p>

      <section className="bg-neutral-dark-03 rounded-sm p-4 space-y-3">
        {data && data.filter((x) => x.status === "P").length > 0 ? (
          data.map(
            (bond) =>
              bond.status === "P" && (
                <div className="flex flex-row justify-between">
                  <div key={bond.id} className="flex flex-col gap-1">
                    <p>{bond?.customer?.name}</p>
                    <p className="text-xs text-neutral-dark-02">
                      {bond.createdAt &&
                        new Date(bond.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      className="bg-red-600 text-white px-2 py-2 rounded-md"
                      onClick={() => openDrawer(bond, "reject")}
                    >
                      <X />
                    </button>
                    <button
                      className="bg-green-600 text-white px-2 py-2 rounded-md"
                      onClick={() => openDrawer(bond, "accept")}
                    >
                      <Check />
                    </button>
                  </div>
                </div>
              )
          )
        ) : (
          <div>Nenhum vínculo ativo.</div>
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
    </div>
  );
}
