import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { useGetAllBonds } from "@/services/api/bond";
import { useAssignRoutine } from "@/services/api/routine";
import type { RootState } from "@/store";
import { useSelector } from "react-redux";
import { Loader2, UserCheck, CheckCircle, Circle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/contexts/ToastContext";

interface AssignRoutineDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routineId: string;
  routineTitle: string;
}

export default function AssignRoutineDrawer({
  open,
  onOpenChange,
  routineId,
  routineTitle,
}: AssignRoutineDrawerProps) {
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const toast = useToast();

  // Buscar vínculos do personal (alunos)
  const { data: bonds, isLoading } = useGetAllBonds(null, userId, false);

  const assignMutation = useAssignRoutine();

  // Toggle seleção de aluno
  const toggleCustomer = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  // Enviar atribuições
  const handleAssign = async () => {
    if (selectedCustomers.length === 0) {
      toast.warning("Selecione pelo menos um aluno");
      return;
    }

    try {
      // Enviar cada atribuição individualmente (API não suporta bulk)
      const promises = selectedCustomers.map((customerId) =>
        assignMutation.mutateAsync({
          routineId,
          customerId,
        })
      );

      await Promise.all(promises);

      // Invalidar queries relacionadas para atualizar listas
      queryClient.invalidateQueries({ queryKey: ["getMyRoutines"] });
      queryClient.invalidateQueries({
        queryKey: ["getRoutineById", routineId],
      });

      toast.success(
        `Rotina "${routineTitle}" atribuída com sucesso a ${selectedCustomers.length} aluno(s)!`
      );
      setSelectedCustomers([]);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao atribuir rotina:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro desconhecido ao atribuir rotina.";
      toast.error(errorMessage);
    }
  };

  // Filtrar apenas alunos (customers) com status ativo
  const activeCustomers = bonds?.filter(
    (bond) => bond.status === "A" && bond.customer
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Enviar Rotina para Alunos</SheetTitle>
          <SheetDescription>
            Selecione os alunos que receberão a rotina "{routineTitle}"
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin" />
              <span className="ml-2">Carregando alunos...</span>
            </div>
          )}

          {!isLoading && activeCustomers && activeCustomers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <UserCheck size={48} className="mb-2 opacity-50" />
              <p>Você ainda não possui alunos vinculados.</p>
              <p className="text-sm mt-1">
                Convide alunos para poder atribuir rotinas.
              </p>
            </div>
          )}

          {!isLoading &&
            activeCustomers &&
            activeCustomers.map((bond) => {
              const customer = bond.customer;
              if (!customer || !customer.id) return null;

              const isSelected = selectedCustomers.includes(customer.id);

              return (
                <div
                  key={bond.id}
                  onClick={() => toggleCustomer(customer.id!)}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {isSelected ? (
                    <CheckCircle className="text-primary" size={24} />
                  ) : (
                    <Circle className="text-muted-foreground" size={24} />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.email}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>

        <SheetFooter className="border-t pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCustomers([]);
              onOpenChange(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAssign}
            disabled={
              selectedCustomers.length === 0 || assignMutation.isPending
            }
          >
            {assignMutation.isPending ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Enviando...
              </>
            ) : (
              <>Enviar para {selectedCustomers.length} aluno(s)</>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
