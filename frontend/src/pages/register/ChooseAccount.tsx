import { Button } from "@/components/ui/button";
import { Leaf, Apple, Dumbbell } from "lucide-react";
import { useRegisterForm } from "@/contexts/forms/RegisterFormContext";

export default function ChooseAccount() {
  const { setAccountType } = useRegisterForm();

  return (
    <div className="flex flex-1 items-center justify-center flex-col gap-2 mb-8">
      <div className="flex items-center flex-col">
        <p className="text-neutral-white-01 font-bold">
          Olá! Vimos que você é novo por aqui...
        </p>
        <p className="text-neutral-white-01 font-light text-sm">
          Qual a sua modalidade?
        </p>
      </div>
      <div className="flex gap-4 mt-4">
        <Button
          className="w-20 h-20"
          onClick={() => setAccountType("nutritionist")}
        >
          <div className="w-20 h-20 flex flex-col items-center justify-center gap-1">
            <Apple className="!w-7 !h-7" />
            <p>Nutri</p>
          </div>
        </Button>
        <Button className="w-20 h-20" onClick={() => setAccountType("student")}>
          <div className="w-20 h-20 flex flex-col items-center justify-center gap-1">
            <Leaf className="!w-7 !h-7" />
            <p>Aluno</p>
          </div>
        </Button>
        <Button
          className="w-20 h-20"
          onClick={() => setAccountType("personal")}
        >
          <div className="w-20 h-20 flex flex-col items-center justify-center gap-1">
            <Dumbbell className="!w-7 !h-7" />
            <p>Personal</p>
          </div>
        </Button>
      </div>
    </div>
  );
}
