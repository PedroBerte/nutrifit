import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { useGetAllUsers } from "@/services/api/user";
import type { UserType } from "@/types/user";
import type { ColumnDef } from "@tanstack/react-table";
import React from "react";

export default function Students() {
  const { data, isLoading } = useGetAllUsers();

  const columns: ColumnDef<UserType>[] = [
    {
      accessorKey: "student",
      header: "Aluno",
    },
    {
      accessorKey: "appointment",
      header: "Consulta",
    },
    {
      accessorKey: "options",
      header: "Opções",
    },
  ];

  return (
    <div className="flex flex-1 py-4 flex-col gap-3">
      <p className="font-bold text-2xl">Alunos</p>
      <Input
        className="border-none bg-neutral-dark-03"
        placeholder="Pesquisar"
      />
      <DataTable
        columns={columns}
        data={new Array(10).fill({
          student: "Pedro Henrique",
          appointment: "10/10/2024",
          options: "Ver mais",
        })}
      />
    </div>
  );
}
