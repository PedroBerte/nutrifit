import { Info } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";

interface InformationCardProps {
  onClick?: () => void;
  title: string;
  description: string;
  showButton?: boolean;
}

export default function InformationCard({
  onClick,
  title,
  description,
  showButton = true,
}: InformationCardProps) {
  return (
    <div>
      <div className="flex gap-3 bg-neutral-dark-02 w-min p-4 rounded-sm mb-4">
        <Info />
        <div>
          <p className="font-bold text-sm text-nowrap">{title}</p>
          <p className="text-sm text-nowrap">{description}</p>
        </div>
      </div>
      {showButton && (
        <Button className="w-full" onClick={onClick && onClick}>
          Encontrar Personal
        </Button>
      )}
    </div>
  );
}
