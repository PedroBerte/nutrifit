import { useAuth } from "@/contexts/AuthContext";
import { useGetUserById } from "@/services/api/user";
import { useGetMyAssignedRoutines, useGetMyRoutines } from "@/services/api/routine";
import { useGetWorkoutHistory } from "@/services/api/workoutSession";
import { useGetWorkoutTemplatesByRoutine } from "@/services/api/workoutTemplate";
import { UserProfiles } from "@/types/user";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  Dumbbell,
  Flame,
  Check,
  PlayCircle,
  Clock,
  Calendar,
  ChevronRight,
  Zap,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import type { WorkoutSessionSummaryResponse } from "@/services/api/workoutSession";

const WEEKDAYS_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function getWeekDays(): Date[] {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getTodayIndex(): number {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 ? 6 : d - 1; // Mon=0 … Sun=6
}

function getStreak(sessions: WorkoutSessionSummaryResponse[]): number {
  const completedDates = sessions
    .filter((s) => s.status === "C")
    .map((s) => {
      const d = new Date(s.startedAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    });

  const unique = [...new Set(completedDates)].sort((a, b) => b - a);
  if (!unique.length) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Streak must include today or yesterday to be active
  if (unique[0] !== today.getTime() && unique[0] !== yesterday.getTime()) return 0;

  let streak = 0;
  let check = unique[0];
  for (const ms of unique) {
    if (ms === check) {
      streak++;
      check = check - 86_400_000;
    } else {
      break;
    }
  }
  return streak;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function StudentHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: userData } = useGetUserById(user?.id);
  const { data: historyData } = useGetWorkoutHistory(1, 60);
  const { data: assignedRoutinesData } = useGetMyAssignedRoutines(1, 1);
  const { data: myRoutinesData } = useGetMyRoutines(1, 1);

  const currentProfile = (userData?.profile?.id ?? user?.profile) as UserProfiles | undefined;
  const isSelfManaged = currentProfile === UserProfiles.SELF_MANAGED;

  const activeRoutine = isSelfManaged
    ? myRoutinesData?.data?.items?.[0] ?? null
    : assignedRoutinesData?.data?.items?.[0] ?? null;
  const { data: templatesData } = useGetWorkoutTemplatesByRoutine(
    activeRoutine?.id
  );

  const sessions = useMemo(
    () => historyData?.data?.items ?? [],
    [historyData]
  );

  const templates = useMemo(
    () =>
      (templatesData?.data ?? []).slice().sort((a, b) => a.order - b.order),
    [templatesData]
  );

  const templatesWithExercises = useMemo(
    () => templates.filter((t) => (t.exerciseTemplates?.length ?? 0) > 0),
    [templates]
  );

  const weekDays = useMemo(() => getWeekDays(), []);
  const todayIndex = useMemo(() => getTodayIndex(), []);

  const trainedDays = useMemo(() => {
    const completed = sessions.filter((s) => s.status === "C");
    return weekDays.map((day) =>
      completed.some((s) => isSameDay(new Date(s.startedAt), day))
    );
  }, [sessions, weekDays]);

  const streak = useMemo(() => getStreak(sessions), [sessions]);
  const weeklyCount = trainedDays.filter(Boolean).length;

  const templatesPool = templatesWithExercises.length > 0 ? templatesWithExercises : templates;
  const todayTemplate =
    templatesPool.length > 0 ? templatesPool[todayIndex % templatesPool.length] : null;

  const todayTrained = trainedDays[todayIndex];

  const firstName =
    (userData?.name ?? user?.name ?? "Atleta").split(" ")[0];

  const todayDate = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-6 py-4 max-w-2xl mx-auto"
    >
      {/* ── Greeting ─────────────────────────────────────── */}
      <div className="flex flex-col gap-0.5">
        <p className="text-neutral-white-02 text-sm capitalize">{todayDate}</p>
        <h1 className="text-2xl font-bold text-neutral-white-01">
          {getGreeting()}, {firstName}! 👋
        </h1>
        {streak > 0 && (
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-1.5 mt-1"
          >
            <Flame size={15} className="text-orange-400" />
            <span className="text-sm text-orange-400 font-semibold">
              {streak} dia{streak !== 1 ? "s" : ""} em sequência
            </span>
          </motion.div>
        )}
      </div>

      {/* ── Weekly Calendar ──────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-neutral-white-02 uppercase tracking-widest">
            Esta Semana
          </h2>
          <span className="text-xs font-semibold text-primary">
            {weeklyCount} de 7 dias
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, new Date());
            const isFuture = day > new Date() && !isToday;
            const trained = trainedDays[i];

            return (
              <motion.div
                key={i}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05 + i * 0.04, type: "spring", stiffness: 300 }}
                className="flex flex-col items-center gap-1.5"
              >
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase",
                    isToday ? "text-primary" : "text-neutral-white-02/60"
                  )}
                >
                  {WEEKDAYS_SHORT[i]}
                </span>

                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                    isToday && "ring-2 ring-primary ring-offset-2 ring-offset-neutral-dark-01",
                    trained && "bg-primary shadow-lg shadow-primary/30",
                    !trained && !isFuture && "bg-white/5",
                    isFuture && "bg-white/[0.03]"
                  )}
                >
                  {trained ? (
                    <Check size={14} className="text-white" strokeWidth={3} />
                  ) : (
                    <span
                      className={cn(
                        "text-xs font-bold",
                        isToday ? "text-primary" : "text-neutral-white-02/30"
                      )}
                    >
                      {day.getDate()}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Today's Workout ──────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold text-neutral-white-02 uppercase tracking-widest mb-3">
          Treino de Hoje
        </h2>

        {todayTrained ? (
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="rounded-2xl bg-primary/10 border border-primary/25 p-4 flex items-center gap-4"
          >
            <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Check size={20} className="text-primary" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-neutral-white-01 font-bold">
                Treino concluído! 🎉
              </p>
              <p className="text-neutral-white-02 text-sm mt-0.5">
                Missão cumprida. Descanse e hidrate-se!
              </p>
            </div>
          </motion.div>
        ) : activeRoutine && todayTemplate ? (
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="rounded-2xl bg-neutral-dark-03 border border-white/[0.06] overflow-hidden"
          >
            {/* accent stripe */}
            <div className="h-[3px] bg-gradient-to-r from-primary via-emerald-400 to-primary/40" />

            <div className="p-4 flex flex-col gap-3">
              {/* Title row */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-neutral-white-02/60 uppercase tracking-wider truncate mb-0.5">
                    {activeRoutine.title}
                  </p>
                  <h3 className="text-neutral-white-01 font-bold text-xl leading-tight">
                    {todayTemplate.title}
                  </h3>
                </div>
                <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Dumbbell size={19} className="text-primary" />
                </div>
              </div>

              {/* Meta chips */}
              <div className="flex items-center gap-3">
                {todayTemplate.estimatedDurationMinutes ? (
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-neutral-white-02/60" />
                    <span className="text-xs text-neutral-white-02/60">
                      {todayTemplate.estimatedDurationMinutes} min
                    </span>
                  </div>
                ) : null}
                {todayTemplate.exerciseTemplates.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Zap size={12} className="text-neutral-white-02/60" />
                    <span className="text-xs text-neutral-white-02/60">
                      {todayTemplate.exerciseTemplates.length} exercício
                      {todayTemplate.exerciseTemplates.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* Exercise pill list */}
              {todayTemplate.exerciseTemplates.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {todayTemplate.exerciseTemplates.slice(0, 5).map((ex) => (
                    <span
                      key={ex.id}
                      className="text-[11px] bg-white/[0.06] text-neutral-white-02/70 px-2.5 py-1 rounded-full border border-white/[0.06]"
                    >
                      {ex.exerciseName}
                    </span>
                  ))}
                  {todayTemplate.exerciseTemplates.length > 5 && (
                    <span className="text-[11px] bg-white/[0.06] text-neutral-white-02/70 px-2.5 py-1 rounded-full border border-white/[0.06]">
                      +{todayTemplate.exerciseTemplates.length - 5}
                    </span>
                  )}
                </div>
              )}

              {/* CTA */}
              <button
                onClick={() =>
                  navigate(`/workout/session/${todayTemplate.id}`)
                }
                className="mt-1 w-full bg-primary hover:bg-primary/90 active:scale-[0.97] transition-all text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                <PlayCircle size={18} />
                Iniciar Treino
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="rounded-2xl bg-neutral-dark-03 border border-white/[0.06] p-6 flex flex-col items-center gap-3 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center">
              <Calendar size={22} className="text-neutral-white-02/50" />
            </div>
            <div>
              <p className="text-neutral-white-01 font-semibold">
                Nenhuma rotina ativa
              </p>
              <p className="text-neutral-white-02/60 text-sm mt-1">
                Peça ao seu personal para te atribuir uma rotina
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Quick Links ──────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => navigate("/workout")}
          className="flex items-center justify-between bg-neutral-dark-03 border border-white/[0.06] rounded-xl px-4 py-3 hover:border-white/10 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Dumbbell size={15} className="text-primary" />
            </div>
            <span className="text-sm font-medium text-neutral-white-01">
              Todos os treinos
            </span>
          </div>
          <ChevronRight size={15} className="text-neutral-white-02/40" />
        </button>

        <button
          onClick={() => navigate("/workout/history")}
          className="flex items-center justify-between bg-neutral-dark-03 border border-white/[0.06] rounded-xl px-4 py-3 hover:border-white/10 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <TrendingUp size={15} className="text-neutral-white-02" />
            </div>
            <span className="text-sm font-medium text-neutral-white-01">
              Histórico de treinos
            </span>
          </div>
          <ChevronRight size={15} className="text-neutral-white-02/40" />
        </button>
      </div>
    </motion.div>
  );
}
