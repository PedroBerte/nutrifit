import ProfessionalCard from "@/components/ProfessionalCard";
import { Input } from "@/components/ui/input";
import { useGetAllUsers } from "@/services/api/user";
import { motion } from "motion/react";

export default function ProfessionalsList() {
  const { data, isLoading } = useGetAllUsers(false, false, true);

  return (
    <motion.div
      className="flex flex-1 flex-col gap-4 mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Input
        placeholder="Pesquisar"
        className="border-none bg-neutral-dark-03"
      />

      {isLoading && <p>Carregando profissionais...</p>}

      {data?.map((professional) => {
        if (professional.id) {
          return (
            <ProfessionalCard
              id={professional.id}
              key={professional.id}
              subtitle="Personal Trainer"
              name={professional.name}
              description={
                professional.professionalCredential?.biography ||
                "Sem descrição"
              }
            />
          );
        }
      })}
    </motion.div>
  );
}
