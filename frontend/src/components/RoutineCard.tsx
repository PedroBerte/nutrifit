import {
  BookText,
  Calendar,
  ChartColumnBig,
  Copy,
  Send,
  Target,
} from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { getDifficultyLabel, getGoalLabel } from "@/constants/routine";

interface RoutineCardProps {
  title: string;
  difficulty: string;
  goal: string;
  weeks: number;
}

export default function RoutineCard({
  title,
  difficulty,
  goal,
  weeks,
}: RoutineCardProps) {
  return (
    <div className="w-full bg-neutral-dark-03 rounded-sm p-4 space-y-4">
      <p className="text-2xl font-bold">{title}</p>
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
        <section className="flex gap-2">
          <Calendar />
          <p className="font-bold">Semanas: </p>
          <p>{weeks} semanas</p>
        </section>
      </article>
      <article className="flex justify-end gap-2 pt-3">
        <Button className="bg-secondary">
          <Copy />
          Clonar
        </Button>
        <Button className="bg-secondary">
          <BookText />
          Detalhes
        </Button>
        <Button>
          <Send />
          Enviar
        </Button>
      </article>
    </div>
  );
}
