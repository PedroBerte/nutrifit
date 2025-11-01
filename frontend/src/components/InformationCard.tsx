import { Info } from "lucide-react";
import React from "react";

interface InformationCardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export default function InformationCard({
  title,
  description,
  children,
}: InformationCardProps) {
  return (
    <div>
      <div className="flex gap-3 bg-neutral-dark-02 p-4 rounded-sm mb-4 ">
        <Info />
        <div>
          <p className="font-bold text-sm text-nowrap">{title}</p>
          <p className="text-sm text-nowrap">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
