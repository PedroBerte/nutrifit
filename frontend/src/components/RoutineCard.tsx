import { BookText, ChartColumnBig, Send, Target, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { getDifficultyLabel, getGoalLabel } from "@/constants/routine";
import AssignRoutineDrawer from "./AssignRoutineDrawer";
import { useDeleteRoutine } from "@/services/api/routine";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/contexts/ToastContext";
import { Loader2 } from "lucide-react";

interface RoutineCardProps {
  id: string;
  title: string;
  difficulty: string;
  goal: string;
}

export default function RoutineCard({
  id,
  title,
  difficulty,
  goal,
}: RoutineCardProps) {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();

  const deleteMutation = useDeleteRoutine();

  const handleDetails = () => {
    navigate(`/routines/${id}`);
  };

  const handleSend = () => {
    setIsDrawerOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(id);

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["getMyRoutines"] });

      toast.success(`Rotina "${title}" excluída com sucesso!`);
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Erro ao excluir rotina:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao excluir rotina.";
      toast.error(errorMessage);
    }
  };

  return (
    <div
      className="w-full bg-neutral-dark-03 rounded-sm p-4 space-y-4 cursor-pointer hover:bg-neutral-dark-02/50 transition-colors"
      onClick={() => handleDetails()}
    >
      <div className="flex justify-between items-center">
        <p className="text-2xl font-bold">{title}</p>
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground hover:text-destructive hover:border-destructive"
          onClick={(e) => {
            setIsDeleteDialogOpen(true);
            e.stopPropagation();
          }}
          type="button"
        >
          <Trash2 size={16} />
        </Button>
      </div>
      <article className="space-y-2">
        <section className="flex gap-2">
          <ChartColumnBig />
          <p className="font-bold">Dificuldade: </p>
          <p>{getDifficultyLabel(difficulty)}</p>
        </section>
        <section className="flex gap-2">
          <Target />
          <p className="font-bold">Objetivo: </p>
          <p>{getGoalLabel(goal)}</p>
        </section>
      </article>
      <article className="flex justify-end gap-2 pt-3">
        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleDetails();
          }}
        >
          <BookText />
          Detalhes
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleSend();
          }}
        >
          <Send />
          Atribuir
        </Button>
      </article>

      <AssignRoutineDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        routineId={id}
        routineTitle={title}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir a rotina{" "}
              <strong>"{title}"</strong>?
              <br />
              <br />
              Esta ação irá desativar a rotina e todas as suas atribuições,
              treinos e sessões relacionadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Excluindo...
                </>
              ) : (
                "Confirmar Exclusão"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
