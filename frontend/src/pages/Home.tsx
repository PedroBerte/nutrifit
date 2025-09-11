import ProfessionalCard from "@/components/ProfessionalCard";
import { Input } from "@/components/ui/input";
import { useGetAllProfessionals } from "@/services/api/professional";
import type { RootState } from "@/store";
import { useSelector } from "react-redux";

export default function Home() {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const { data, isLoading, error } = useGetAllProfessionals();

  return (
    <div className="px-2 py-4 flex flex-col gap-4">
      <Input
        placeholder="Pesquisar"
        className="border-none bg-neutral-dark-03"
      />

      {isLoading && <p>Carregando profissionais...</p>}

      {data?.map((professional) => (
        <ProfessionalCard
          key={professional.user?.id}
          subtitle="Personal Trainer"
          name={professional.user?.name}
          description={professional.credentials?.biography || "Sem descrição"}
        />
      ))}
    </div>
  );
}
