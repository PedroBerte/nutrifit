import { BigButton } from "@/components/BigButton";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  Check,
  Dumbbell,
  Users,
  Edit,
  Clock,
  ClockFading,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useGetRoutinesNearExpiry } from "@/services/api/routine";
import type { RoutineExpiryType } from "@/types/routine";
import PersonalSemAtendimento from "@/assets/personal/PersonalSemAtendimento.png";
import PersonalSemTreinosPertoValidade from "@/assets/personal/PersonalSemTreinosPertoValidade.png";
import type { JSX } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import UpdateExpiryDialog from "@/components/UpdateExpiryDialog";
import { AvatarImage } from "@/components/ui/avatar-image";

export default function PersonalHome() {
  const { user } = useAuth();
  const { data: expiringRoutines } = useGetRoutinesNearExpiry(15);
  const navigate = useNavigate();

  const [customerToUpdate, setCustomerToUpdate] = useState<{
    routineId: string;
    customerId: string;
    customerName: string;
    routineTitle: string;
    expiresAt: string;
  } | null>(null);

  const handleOpenDialog = (item: RoutineExpiryType, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomerToUpdate({
      routineId: item.routineId,
      customerId: item.customerId,
      customerName: item.customerName,
      routineTitle: item.routineTitle,
      expiresAt: item.expiresAt,
    });
  };

  const WorkoutToDueCard = (item: RoutineExpiryType): JSX.Element => {
    return (
      <div
        key={item.customerId}
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/routines/${item.routineId}`);
        }}
        className="flex flex-row items-center w-full bg-neutral-dark-03 rounded-md p-3 gap-3"
      >
        <div className="flex flex-col flex-1 gap-2">
          <p className="font-bold">
            Em {item.daysUntilExpiry}{" "}
            {item.daysUntilExpiry === 1 ? "dia" : "dias"}
          </p>
          <div className="flex flex-row items-center gap-3 border border-border w-full rounded-md p-3">
            <>
              <AvatarImage
                imageUrl={item.customerImageUrl}
                name={item.customerName}
                id={item.customerId}
                size="md"
              />
              <div className="flex flex-col flex-1">
                <p className="font-semibold">{item.customerName}</p>
                <p className="text-sm text-muted-foreground">
                  {item.routineTitle}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Ver rotina</p>
              </div>
            </>
            <Button onClick={(e) => handleOpenDialog(item, e)}>
              <ClockFading size={16} />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-1 py-2 flex-col gap-4">
      <p>Bem vindo(a), {user && user.name}.</p>
      <motion.div
        className="grid grid-cols-2 grid-rows-2 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0 }}
      >
        <BigButton
          title="Alunos"
          icon={<Users size={22} />}
          description="Seus alunos"
          onClick={() => {
            navigate("/students");
          }}
        />
        <BigButton
          title="Treinos"
          icon={<Dumbbell size={22} />}
          description="Seus planos de treinos"
          onClick={() => {
            navigate("/routines");
          }}
        />
        <BigButton
          title="Agenda"
          icon={<Calendar size={22} />}
          description="Sua agenda"
          onClick={() => {
            navigate("/agenda");
          }}
        />
        <BigButton
          title="Vínculos"
          icon={<Check size={22} />}
          description="Seus vínculos"
          onClick={() => {
            navigate("/bond");
          }}
        />
      </motion.div>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-2"
      >
        <p className="font-bold">Próximos Atendimentos</p>
        <div className="flex flex-col w-full bg-neutral-dark-03 rounded-sm justify-center items-center py-5 gap-2">
          <img
            src={PersonalSemAtendimento}
            alt="Nenhum atendimento agendado"
            className="w-30 object-contain"
          />
          <p className="text-muted-foreground font-medium text-sm">
            Nenhum atendimento agendado.
          </p>
        </div>
      </motion.section>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="space-y-2"
      >
        <p className="font-bold">Treinos próximos da validade</p>
        <div className="flex flex-col w-full bg-neutral-dark-03 rounded-sm justify-center items-center gap-2">
          {expiringRoutines?.data && expiringRoutines.data.length > 0 ? (
            expiringRoutines.data.map((item) => {
              return WorkoutToDueCard(item);
            })
          ) : (
            <div className="flex flex-col w-full bg-neutral-dark-03 rounded-sm justify-center items-center gap-2 py-2">
              <img
                src={PersonalSemTreinosPertoValidade}
                alt="Nenhum treino próximo da validade"
                className="w-30 object-contain"
              />
              <p className="text-muted-foreground font-medium text-sm">
                Nenhum treino próximo da validade.
              </p>
            </div>
          )}
          <div></div>
        </div>
      </motion.section>

      {/* Dialog para alterar data de vencimento */}
      <UpdateExpiryDialog
        open={!!customerToUpdate}
        onOpenChange={(open) => {
          if (!open) {
            setCustomerToUpdate(null);
          }
        }}
        routineId={customerToUpdate?.routineId || ""}
        customerId={customerToUpdate?.customerId || ""}
        customerName={customerToUpdate?.customerName || ""}
        routineTitle={customerToUpdate?.routineTitle || ""}
        currentExpiryDate={customerToUpdate?.expiresAt || ""}
      />
    </div>
  );
}
