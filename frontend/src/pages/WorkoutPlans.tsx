import { Input } from "@/components/ui/input";

export default function WorkoutPlans() {
  return (
    <div className="flex flex-1 py-4 flex-col gap-3">
      <p className="font-bold text-2xl">Planos de Treinos</p>
      <Input
        className="border-none bg-neutral-dark-03"
        placeholder="Pesquisar"
      />
    </div>
  );
}
