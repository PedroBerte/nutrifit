import InformationCard from "@/components/InformationCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useGetUserById } from "@/services/api/user";
import { UserProfiles } from "@/types/user";
import { Info } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Workout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: userData, isLoading, error } = useGetUserById(user?.id);

  console.log("User Data:", userData);

  function getBondStatus() {
    if (userData?.customerProfessionalBonds?.length === 0) {
      return (
        <InformationCard
          title="Nenhum personal encontrado!"
          description="Encontre um personal para você!"
          onClick={() => navigate("home")}
        />
      );
    }

    if (
      userData?.customerProfessionalBonds &&
      userData.customerProfessionalBonds.find(
        (x) =>
          x.professional.profile === (UserProfiles.PERSONAL as any) &&
          x.status === "P"
      )
    ) {
      return (
        <InformationCard
          title="Solicitação pendente"
          description="Sua solicitação ao personal está pendente."
          showButton={false}
        />
      );
    }
  }

  return (
    <div className="flex flex-1 justify-center items-center py-4 flex-col">
      <p className="text-white font-bold text-2xl">Treinos</p>
      <section className="py-5">{getBondStatus()}</section>
    </div>
  );
}
