import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
  useAssignRoutine,
  useUnassignRoutine,
  useGetRoutineCustomers,
} from "@/services/api/routine";
import {
  Loader2,
  UserCheck,
  CheckCircle,
  Circle,
  UserMinus,
  Users,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/contexts/ToastContext";
import type { CustomerBasicInfo } from "@/types/routine";

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
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customerToUnassign, setCustomerToUnassign] =
    useState<CustomerBasicInfo | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  // Buscar alunos atribuídos e disponíveis
  const { data: customersData, isLoading } = useGetRoutineCustomers(routineId);

  const assignMutation = useAssignRoutine();
  const unassignMutation = useUnassignRoutine();

  // Toggle seleção de aluno disponível
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
      queryClient.invalidateQueries({
        queryKey: ["getRoutineCustomers", routineId],
      });

      toast.success(
        `Rotina "${routineTitle}" atribuída com sucesso a ${selectedCustomers.length} aluno(s)!`
      );
      setSelectedCustomers([]);
    } catch (error: any) {
      console.error("Erro ao atribuir rotina:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro desconhecido ao atribuir rotina.";
      toast.error(errorMessage);
    }
  };

  // Confirmar desatribuição
  const handleUnassignConfirm = async () => {
    if (!customerToUnassign) return;

    try {
      await unassignMutation.mutateAsync({
        routineId,
        customerId: customerToUnassign.id,
      });

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["getMyRoutines"] });
      queryClient.invalidateQueries({
        queryKey: ["getRoutineById", routineId],
      });
      queryClient.invalidateQueries({
        queryKey: ["getRoutineCustomers", routineId],
      });

      toast.success(
        `Rotina removida de ${customerToUnassign.name} com sucesso!`
      );
      setCustomerToUnassign(null);
    } catch (error: any) {
      console.error("Erro ao desatribuir rotina:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro desconhecido ao remover atribuição.";
      toast.error(errorMessage);
    }
  };

  const assignedCustomers = customersData?.data?.assignedCustomers || [];
  const availableCustomers = customersData?.data?.availableCustomers || [];

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Gerenciar Alunos da Rotina</DrawerTitle>
            <DrawerDescription>
              Atribua ou remova alunos da rotina "{routineTitle}"
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 max-h-[60vh]">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin" />
                <span className="ml-2">Carregando alunos...</span>
              </div>
            )}

            {!isLoading && (
              <>
                {/* Seção de Alunos Atribuídos */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={20} className="text-primary" />
                    <h3 className="font-semibold text-lg">
                      Alunos Atribuídos ({assignedCustomers.length})
                    </h3>
                  </div>

                  {assignedCustomers.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      Nenhum aluno atribuído ainda.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {assignedCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5"
                        >
                          {customer.imageUrl ? (
                            <img
                              src={customer.imageUrl}
                              alt={customer.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <UserCheck size={20} className="text-primary" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-semibold">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {customer.email}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setCustomerToUnassign(customer)}
                          >
                            <UserMinus size={18} />
                            Remover
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Seção de Alunos Disponíveis */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <UserCheck size={20} className="text-muted-foreground" />
                    <h3 className="font-semibold text-lg">
                      Alunos Disponíveis ({availableCustomers.length})
                    </h3>
                  </div>

                  {availableCustomers.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      {assignedCustomers.length > 0
                        ? "Todos os seus alunos já estão atribuídos a esta rotina."
                        : "Você não possui outros alunos vinculados."}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {availableCustomers.map((customer) => {
                        const isSelected = selectedCustomers.includes(
                          customer.id
                        );

                        return (
                          <div
                            key={customer.id}
                            onClick={() => toggleCustomer(customer.id)}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelected
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            {isSelected ? (
                              <CheckCircle
                                className="text-primary flex-shrink-0"
                                size={24}
                              />
                            ) : (
                              <Circle
                                className="text-muted-foreground flex-shrink-0"
                                size={24}
                              />
                            )}
                            {customer.imageUrl ? (
                              <img
                                src={customer.imageUrl}
                                alt={customer.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <UserCheck
                                  size={20}
                                  className="text-muted-foreground"
                                />
                              </div>
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
                  )}
                </div>
              </>
            )}
          </div>

          <DrawerFooter className="border-t pt-4">
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCustomers([]);
                  onOpenChange(false);
                }}
                className="flex-1"
              >
                Fechar
              </Button>
              {availableCustomers.length > 0 && (
                <Button
                  onClick={handleAssign}
                  disabled={
                    selectedCustomers.length === 0 || assignMutation.isPending
                  }
                  className="flex-1"
                >
                  {assignMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Atribuindo...
                    </>
                  ) : (
                    <>Atribuir para {selectedCustomers.length} aluno(s)</>
                  )}
                </Button>
              )}
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Dialog de Confirmação de Desatribuição */}
      <Dialog
        open={!!customerToUnassign}
        onOpenChange={(open) => !open && setCustomerToUnassign(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Remoção</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja remover a rotina "{routineTitle}" do
              aluno <strong>{customerToUnassign?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCustomerToUnassign(null)}
              disabled={unassignMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnassignConfirm}
              disabled={unassignMutation.isPending}
            >
              {unassignMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Removendo...
                </>
              ) : (
                "Confirmar Remoção"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
