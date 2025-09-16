import React from "react";
import GenericPersonSvg from "@/assets/generic-person.svg";
import Verified from "@/assets/verified.svg";

type ProfessionalCardProps = {
  subtitle: string;
  name?: string;
  description?: string;
};

export default function ProfessionalCard({
  subtitle,
  name,
  description,
}: ProfessionalCardProps) {
  return (
    <div className="bg-neutral-dark-03 p-4 rounded-xl">
      <div className="flex gap-3">
        <img src={GenericPersonSvg} alt="" />
        <div className="overflow-hidden text-ellipsis">
          <p className="text-sm font-semibold">{subtitle}</p>
          <div className="flex gap-1">
            <img src={Verified} alt="" />
            <p className="text-lg font-semibold">{name}</p>
          </div>
          <p className="text-xs text-gray-500 line-clamp-3 text-ellipsis max-w-[250px]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
