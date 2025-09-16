import ProfessionalCard from "@/components/ProfessionalCard";
import { Input } from "@/components/ui/input";
import { useGetAllUsers } from "@/services/api/user";
import type { RootState } from "@/store";
import { useSelector } from "react-redux";

export default function Home() {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const { data, isLoading, error } = useGetAllUsers(false, false, true);

  return (
    <div className="flex flex-col gap-4 mt-4">
      <Input
        placeholder="Pesquisar"
        className="border-none bg-neutral-dark-03"
      />

      {isLoading && <p>Carregando profissionais...</p>}

      {data?.map((professional) => (
        <ProfessionalCard
          key={professional?.id}
          subtitle="Personal Trainer"
          name={professional?.name}
          description={
            professional?.professionalCredential?.biography || "Sem descrição"
          }
        />
      ))}
    </div>
  );
}
