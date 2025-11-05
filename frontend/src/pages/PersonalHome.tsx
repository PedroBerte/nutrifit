import { BigButton } from "@/components/BigButton";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, CalendarX2, Check, Dumbbell, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useGetMyRoutines } from "@/services/api/routine";
import type { RoutineType } from "@/types/routine";

export default function PersonalHome() {
  const { user } = useAuth();
  const { data: routines } = useGetMyRoutines(1, 5);
  const navigate = useNavigate();
  console.log(routines);

  const getRoutineDueDate = (routine: RoutineType): Date => {
    const createdAt = new Date(routine.createdAt);
    const weeks = routine.weeks || 0;
    const expiryDate = new Date(createdAt);
    expiryDate.setDate(createdAt.getDate() + weeks * 7);
    return expiryDate;
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
          onClick={() => {}}
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
        <p className="font-bold">Próximos Atendimentos:</p>
        <div className="flex flex-col w-full bg-neutral-dark-03 rounded-sm justify-center items-center py-5 gap-2">
          <CalendarX2 color="green" />
          <div>Nenhum atendimento agendado.</div>
        </div>
      </motion.section>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="space-y-2"
      >
        <p className="font-bold">Treinos próximos da validade:</p>
        <div className="flex flex-col w-full bg-neutral-dark-03 rounded-sm justify-center items-center">
          {routines?.data && routines.data.items.length > 0 ? (
            routines.data.items.map((routine) => {
              return (
                <div
                  key={routine.id}
                  className="flex flex-col w-full bg-neutral-dark-03 rounded-sm p-4 gap-2"
                >
                  <p>
                    Vence em{" "}
                    {Math.max(
                      0,
                      Math.ceil(
                        (getRoutineDueDate(routine).getTime() - Date.now()) /
                          (1000 * 60 * 60 * 24)
                      )
                    )}{" "}
                    dias
                  </p>
                  <div className="border border-border w-full rounded-sm p-3">
                    <strong>{routine.title}</strong>
                    <p>
                      Criado em:{" "}
                      {new Date(routine.createdAt).toLocaleDateString("pt-br")}{" "}
                      - Vence em:{" "}
                      {getRoutineDueDate(routine).toLocaleDateString("pt-br")}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-5 space-y-2">
              <CalendarX2 color="green" />
              <div>Nenhum treino próximo da validade.</div>
            </div>
          )}
          <div></div>
        </div>
      </motion.section>
    </div>
  );
}
