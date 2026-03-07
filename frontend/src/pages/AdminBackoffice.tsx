import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { PaginationInfo } from "@/types/api";
import {
  useAdminBonds,
  useAdminDashboard,
  useAdminExercises,
  useAdminRoutines,
  useAdminUpdateBondStatus,
  useAdminUpdateUserAdmin,
  useAdminUpdateUserStatus,
  useAdminUsers,
  useAdminWorkouts,
} from "@/services/api/admin";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function StatusBadge({ value }: { value: string }) {
  const normalized = value.toUpperCase();
  const styleMap: Record<string, string> = {
    A: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    I: "bg-zinc-500/15 text-zinc-300 border-zinc-500/40",
    P: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    C: "bg-red-500/15 text-red-300 border-red-500/40",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
        styleMap[normalized] ?? "bg-slate-500/20 text-slate-200 border-slate-500/40"
      }`}
    >
      {normalized}
    </span>
  );
}

export default function AdminBackoffice() {
  const [userSearch, setUserSearch] = useState("");
  const [usersPage, setUsersPage] = useState(1);
  const [bondsPage, setBondsPage] = useState(1);
  const [bondsSearch, setBondsSearch] = useState("");

  const { data: dashboard, isLoading: loadingDashboard } = useAdminDashboard();
  const { data: usersData, isLoading: loadingUsers } = useAdminUsers({
    page: usersPage,
    pageSize: 10,
    search: userSearch,
  });
  const { data: bondsData, isLoading: loadingBonds } = useAdminBonds({
    page: bondsPage,
    pageSize: 10,
    search: bondsSearch,
  });
  const { data: exercisesData, isLoading: loadingExercises } = useAdminExercises({
    page: 1,
    pageSize: 20,
  });
  const { data: workoutsData, isLoading: loadingWorkouts } = useAdminWorkouts({
    page: 1,
    pageSize: 20,
  });
  const { data: routinesData, isLoading: loadingRoutines } = useAdminRoutines({
    page: 1,
    pageSize: 20,
  });

  const updateUserStatusMutation = useAdminUpdateUserStatus();
  const updateUserAdminMutation = useAdminUpdateUserAdmin();
  const updateBondStatusMutation = useAdminUpdateBondStatus();

  const users = usersData?.items ?? [];
  const usersPagination = usersData?.pagination;
  const bonds = bondsData?.items ?? [];
  const bondsPagination = bondsData?.pagination;
  const exercises = exercisesData?.items ?? [];
  const workouts = workoutsData?.items ?? [];
  const routines = routinesData?.items ?? [];

  const handleUserStatus = async (userId: string, status: "A" | "I") => {
    try {
      await updateUserStatusMutation.mutateAsync({ userId, status });
      toast.success("Status do usuário atualizado.");
    } catch {
      toast.error("Não foi possível atualizar o status do usuário.");
    }
  };

  const handleUserAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      await updateUserAdminMutation.mutateAsync({ userId, isAdmin });
      toast.success("Permissão de admin atualizada.");
    } catch {
      toast.error("Não foi possível atualizar a permissão de admin.");
    }
  };

  const handleBondStatus = async (bondId: string, status: "A" | "P" | "C" | "I") => {
    try {
      await updateBondStatusMutation.mutateAsync({ bondId, status });
      toast.success("Status do vínculo atualizado.");
    } catch {
      toast.error("Não foi possível atualizar o vínculo.");
    }
  };

  const handleUserSearchChange = (value: string) => {
    setUsersPage(1);
    setUserSearch(value);
  };

  const handleBondSearchChange = (value: string) => {
    setBondsPage(1);
    setBondsSearch(value);
  };

  return (
    <div className="py-4 space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-neutral-white-01">Backoffice Admin</h1>
          <p className="text-sm text-neutral-white-02">
            Gestão de usuários, vínculos e catálogos principais.
          </p>
        </div>
      </motion.div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {loadingDashboard ? (
          <p className="text-sm text-neutral-white-02">Carregando indicadores...</p>
        ) : (
          <>
            <div className="rounded-xl border border-neutral-white-01/10 bg-neutral-dark-03 p-4">
              <p className="text-xs text-neutral-white-02">Usuários</p>
              <p className="text-2xl font-bold">{dashboard?.totalUsers ?? 0}</p>
              <p className="text-xs text-neutral-white-02">Admins: {dashboard?.totalAdmins ?? 0}</p>
            </div>
            <div className="rounded-xl border border-neutral-white-01/10 bg-neutral-dark-03 p-4">
              <p className="text-xs text-neutral-white-02">Vínculos</p>
              <p className="text-2xl font-bold">{dashboard?.totalBonds ?? 0}</p>
              <p className="text-xs text-neutral-white-02">
                Ativos: {dashboard?.totalActiveBonds ?? 0} | Pendentes: {dashboard?.totalPendingBonds ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-white-01/10 bg-neutral-dark-03 p-4">
              <p className="text-xs text-neutral-white-02">Exercícios</p>
              <p className="text-2xl font-bold">{dashboard?.totalExercises ?? 0}</p>
            </div>
            <div className="rounded-xl border border-neutral-white-01/10 bg-neutral-dark-03 p-4">
              <p className="text-xs text-neutral-white-02">Treinos e Rotinas</p>
              <p className="text-2xl font-bold">
                {(dashboard?.totalWorkoutTemplates ?? 0) + (dashboard?.totalRoutines ?? 0)}
              </p>
              <p className="text-xs text-neutral-white-02">
                Treinos: {dashboard?.totalWorkoutTemplates ?? 0} | Rotinas: {dashboard?.totalRoutines ?? 0}
              </p>
            </div>
          </>
        )}
      </section>

      <section className="rounded-xl border border-neutral-white-01/10 bg-neutral-dark-03 p-4 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Gerenciar usuários</h2>
          <Input
            value={userSearch}
            onChange={(e) => handleUserSearchChange(e.target.value)}
            placeholder="Buscar por nome ou email"
            className="sm:max-w-sm"
          />
        </div>

        {loadingUsers ? (
          <p className="text-sm text-neutral-white-02">Carregando usuários...</p>
        ) : (
          <>
          <div className="space-y-2">
            {users.map((item) => (
              <div key={item.id} className="rounded-lg border border-neutral-white-01/10 p-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-neutral-white-02">{item.email}</p>
                    <p className="text-xs text-neutral-white-02">
                      Perfil: {item.profile} | Criado em {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge value={item.status} />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUserStatus(item.id, item.status === "A" ? "I" : "A")}
                      disabled={updateUserStatusMutation.isPending}
                    >
                      {item.status === "A" ? "Inativar" : "Ativar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUserAdmin(item.id, !item.isAdmin)}
                      disabled={updateUserAdminMutation.isPending}
                    >
                      {item.isAdmin ? "Remover admin" : "Tornar admin"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <PaginationControls
            pagination={usersPagination}
            onPrev={() => setUsersPage((prev) => Math.max(1, prev - 1))}
            onNext={() => setUsersPage((prev) => prev + 1)}
          />
          </>
        )}
      </section>

      <section className="rounded-xl border border-neutral-white-01/10 bg-neutral-dark-03 p-4 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Gerenciar vínculos</h2>
          <Input
            value={bondsSearch}
            onChange={(e) => handleBondSearchChange(e.target.value)}
            placeholder="Buscar vínculo por cliente/profissional"
            className="sm:max-w-sm"
          />
        </div>
        {loadingBonds ? (
          <p className="text-sm text-neutral-white-02">Carregando vínculos...</p>
        ) : (
          <>
          <div className="space-y-2">
            {bonds.map((item) => (
              <div key={item.id} className="rounded-lg border border-neutral-white-01/10 p-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-sm">
                      {item.customer.name} {'->'} {item.professional.name}
                    </p>
                    <p className="text-xs text-neutral-white-02">Enviado por: {item.sender.name}</p>
                    <p className="text-xs text-neutral-white-02">Criado em {formatDate(item.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge value={item.status} />
                    <Button size="sm" variant="outline" onClick={() => handleBondStatus(item.id, "A")}>
                      A
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBondStatus(item.id, "P")}>
                      P
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBondStatus(item.id, "C")}>
                      C
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBondStatus(item.id, "I")}>
                      I
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <PaginationControls
            pagination={bondsPagination}
            onPrev={() => setBondsPage((prev) => Math.max(1, prev - 1))}
            onNext={() => setBondsPage((prev) => prev + 1)}
          />
          </>
        )}
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-neutral-white-01/10 bg-neutral-dark-03 p-4 space-y-2">
          <h2 className="text-lg font-semibold">Exercícios</h2>
          {loadingExercises ? (
            <p className="text-sm text-neutral-white-02">Carregando exercícios...</p>
          ) : (
            exercises.slice(0, 20).map((item) => (
              <div key={item.id} className="rounded-md border border-neutral-white-01/10 p-2">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-neutral-white-02">{item.category}</p>
              </div>
            ))
          )}
        </div>

        <div className="rounded-xl border border-neutral-white-01/10 bg-neutral-dark-03 p-4 space-y-2">
          <h2 className="text-lg font-semibold">Treinos</h2>
          {loadingWorkouts ? (
            <p className="text-sm text-neutral-white-02">Carregando treinos...</p>
          ) : (
            workouts.slice(0, 20).map((item) => (
              <div key={item.id} className="rounded-md border border-neutral-white-01/10 p-2">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-neutral-white-02">Rotina: {item.routine}</p>
              </div>
            ))
          )}
        </div>

        <div className="rounded-xl border border-neutral-white-01/10 bg-neutral-dark-03 p-4 space-y-2">
          <h2 className="text-lg font-semibold">Rotinas</h2>
          {loadingRoutines ? (
            <p className="text-sm text-neutral-white-02">Carregando rotinas...</p>
          ) : (
            routines.slice(0, 20).map((item) => (
              <div key={item.id} className="rounded-md border border-neutral-white-01/10 p-2">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-neutral-white-02">Personal: {item.personal}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function PaginationControls({
  pagination,
  onPrev,
  onNext,
}: {
  pagination?: PaginationInfo;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (!pagination) return null;

  const isFirstPage = pagination.currentPage <= 1;
  const isLastPage = pagination.currentPage >= pagination.totalPages;

  return (
    <div className="flex items-center justify-between border-t border-neutral-white-01/10 pt-3">
      <p className="text-xs text-neutral-white-02">
        Página {pagination.currentPage} de {pagination.totalPages} ({pagination.totalCount} itens)
      </p>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" disabled={isFirstPage} onClick={onPrev}>
          Anterior
        </Button>
        <Button size="sm" variant="outline" disabled={isLastPage} onClick={onNext}>
          Próxima
        </Button>
      </div>
    </div>
  );
}
