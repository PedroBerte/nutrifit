import { Apple, CircleUser, Dumbbell } from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";

/*
  BottomBar fixa na parte inferior da viewport.
  - Usa position: fixed para ignorar o fluxo do scroll do conteúdo.
  - Área clicável com NavLink para permitir active styles no futuro.
  - Largura responsiva: max-w-md para não ficar gigante em telas maiores.
  - Safe area paddings para iOS (env(safe-area-inset-bottom)).
*/
export default function BottomBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[calc(env(safe-area-inset-bottom)+0.5rem)]"
      aria-label="Navegação principal"
    >
      <div className="flex w-full max-w-md mx-auto items-center justify-around bg-neutral-dark-02/90 backdrop-blur rounded-2xl px-4 py-2 shadow-lg">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
              isActive ? "text-primary" : "text-neutral-white-01"
            }`
          }
        >
          <Dumbbell size={28} />
          <span className="text-[10px] font-medium">Treino</span>
        </NavLink>
        <button
          type="button"
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-neutral-white-01 opacity-60 cursor-not-allowed"
          aria-disabled
        >
          <Apple size={28} />
          <span className="text-[10px] font-medium">Dieta</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-neutral-white-01 opacity-60 cursor-not-allowed"
          aria-disabled
        >
          <CircleUser size={28} />
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </div>
    </nav>
  );
}
