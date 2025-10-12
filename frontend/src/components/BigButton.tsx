import { Users } from "lucide-react";
import React from "react";

interface BigButtonProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export function BigButton({
  title,
  description,
  icon,
  onClick,
}: BigButtonProps) {
  return (
    <div
      className="flex flex-col w-full bg-neutral-dark-03 shadow-sm rounded-sm gap-2 p-2.5"
      onClick={onClick}
    >
      <div className="space-y-1">
        <div className="flex flex-row gap-2">
          {icon}
          <p className="font-bold">{title}</p>
        </div>
        <p className="text-sm text-neutral-300">{description}</p>
      </div>
    </div>
  );
}
