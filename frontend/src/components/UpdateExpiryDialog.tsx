import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { useToast } from "@/contexts/ToastContext";
import { api } from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";

interface UpdateExpiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routineId: string;
  customerId: string;
  customerName: string;
  routineTitle: string;
  currentExpiryDate: string;
}

export default function UpdateExpiryDialog({
  open,
  onOpenChange,
  routineId,
  customerId,
  customerName,
  routineTitle,
  currentExpiryDate,
}: UpdateExpiryDialogProps) {
  const [newExpiryDate, setNewExpiryDate] = useState<Date | undefined>(
    currentExpiryDate ? new Date(currentExpiryDate) : undefined
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  // Atualizar a data quando o dialog abrir com um novo customer
  useEffect(() => {
    if (open && currentExpiryDate) {
      setNewExpiryDate(new Date(currentExpiryDate));
    }
  }, [open, currentExpiryDate]);

  const handleUpdateExpiry = async () => {
    if (!newExpiryDate) return;

    setIsUpdating(true);
    try {
      await api.put(`/routine/${routineId}/customer/${customerId}/expiry`, {
        expiresAt: newExpiryDate.toISOString(),
      });

      toast.success("Data de vencimento atualizada com sucesso!");

      // Invalidar queries para atualizar as listas
      queryClient.invalidateQueries({ queryKey: ["getRoutinesNearExpiry"] });
      queryClient.invalidateQueries({
        queryKey: ["getRoutineCustomers", routineId],
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao atualizar data:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao atualizar data de vencimento.";
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar Data de Vencimento</DialogTitle>
          <DialogDescription>
            Atualize a data de vencimento do treino "{routineTitle}" para o
            aluno <strong>{customerName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <Calendar
            className="border rounded-md"
            mode="single"
            selected={newExpiryDate}
            onSelect={setNewExpiryDate}
            disabled={(date) => date < new Date()}
            captionLayout="dropdown"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateExpiry}
            disabled={!newExpiryDate || isUpdating}
          >
            {isUpdating ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
