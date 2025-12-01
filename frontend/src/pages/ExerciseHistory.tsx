import { useNavigate, useParams } from "react-router-dom";
import { useGetExerciseHistory } from "@/services/api/workoutSession";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  TrendingUp,
  Dumbbell,
  BarChart3,
  Activity,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts";

export default function ExerciseHistory() {
  const navigate = useNavigate();
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const { data: historyData, isLoading } = useGetExerciseHistory(exerciseId);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState<
    number | null
  >(null);

  const history = historyData?.data;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 gap-4">
        <Activity size={64} className="text-muted-foreground opacity-50" />
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">
            Nenhum histórico encontrado
          </h2>
          <p className="text-muted-foreground mb-4">
            Você ainda não realizou este exercício.
          </p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ChevronLeft size={16} className="mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-1 flex-col pb-6 pt-4"
    >
      {/* Header Fixo Simplificado */}
      <div className="sticky top-0 z-10 px-4 pt-4 pb-3">
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-lg border border-primary/20 backdrop-blur-sm overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-primary/20"
              >
                <ChevronLeft size={18} />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold truncate">
                  {history.exerciseName}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {history.stats.totalSessions} sessões • {history.stats.totalSets} séries
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Grid horizontal compacto */}
      <div className="px-4 pt-4 pb-2">
        <div className="grid grid-cols-2 gap-3">
          <StatsCard
            icon={<Dumbbell size={14} />}
            label="Carga Máxima"
            value={`${history.stats.maxLoad.toFixed(1)} kg`}
            color="text-primary"
            bgColor="bg-primary/10"
          />
          <StatsCard
            icon={<Flame size={14} />}
            label="Volume Total"
            value={`${(history.stats.totalVolume / 1000).toFixed(1)}t`}
            color="text-orange-500"
            bgColor="bg-orange-500/10"
          />
        </div>
      </div>

      {/* Chart de Evolução */}
      <div className="px-4 pt-4 pb-4">
        <div className="bg-neutral-dark-03 rounded-lg border border-neutral-dark-02 overflow-hidden">
          <div className="p-4 pb-3 border-b border-neutral-dark-02">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-primary" size={18} />
              <h2 className="text-base font-bold">Evolução de Carga</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Acompanhe sua progressão ao longo do tempo
            </p>
          </div>
          <div className="p-4 pt-2">
            <LoadProgressionChart sessions={history.sessions} />
          </div>
        </div>
      </div>

      {/* Histórico de Sessões */}
      <div className="px-4 pt-2">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="text-primary" size={18} />
          <h2 className="text-base font-bold">Histórico Detalhado</h2>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {history.sessions.map((session, index) => (
              <SessionCard
                key={session.sessionId}
                session={session}
                isExpanded={selectedSessionIndex === index}
                onToggle={() =>
                  setSelectedSessionIndex(
                    selectedSessionIndex === index ? null : index
                  )
                }
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// Componente de Card de Estatística
interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}

function StatsCard({ icon, label, value, color, bgColor }: StatsCardProps) {
  return (
    <div className={`${bgColor} rounded-lg p-3 border border-neutral-dark-02`}>
      <div className={`flex items-center gap-2 ${color} mb-1.5`}>
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

// Componente de Gráfico com Recharts
interface LoadProgressionChartProps {
  sessions: Array<{
    performedAt: string;
    maxLoad: number;
    averageLoad: number;
    sessionVolume: number;
  }>;
}

function LoadProgressionChart({ sessions }: LoadProgressionChartProps) {
  // Inverte para mostrar do mais antigo ao mais recente
  const sortedSessions = [...sessions].reverse().slice(-15); // Últimas 15 sessões

  // Prepara dados para o gráfico
  const chartData = sortedSessions.map((session, index) => ({
    name: format(new Date(session.performedAt), "dd/MM", { locale: ptBR }),
    fullDate: format(new Date(session.performedAt), "dd 'de' MMMM", {
      locale: ptBR,
    }),
    maxLoad: Number(session.maxLoad.toFixed(1)),
    averageLoad: Number(session.averageLoad.toFixed(1)),
    volume: Number((session.sessionVolume / 1000).toFixed(2)), // em toneladas
    index: index + 1,
  }));

  const maxLoad = Math.max(...chartData.map((d) => d.maxLoad));
  const maxVolume = Math.max(...chartData.map((d) => d.volume));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-dark-01 border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-bold mb-2">
            {payload[0].payload.fullDate}
          </p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span className="text-muted-foreground">Carga Máx</span>
              <span className="font-bold">{payload[0].value} kg</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-green-500" />
              <span className="text-muted-foreground">Carga Média</span>
              <span className="font-bold">{payload[1].value} kg</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-orange-500" />
              <span className="text-muted-foreground">Volume</span>
              <span className="font-bold">{payload[2].value}t</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart
          data={chartData}
          margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#888", fontSize: 12 }}
            tickLine={{ stroke: "#555" }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: "#888", fontSize: 12 }}
            tickLine={{ stroke: "#555" }}
            label={{
              value: "Carga (kg)",
              angle: -90,
              position: "insideLeft",
              fill: "#888",
              fontSize: 12,
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#888", fontSize: 12 }}
            tickLine={{ stroke: "#555" }}
            label={{
              value: "Volume (t)",
              angle: 90,
              position: "insideRight",
              fill: "#888",
              fontSize: 12,
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
            iconType="square"
          />
          <Bar
            yAxisId="left"
            dataKey="maxLoad"
            fill="hsl(var(--primary))"
            name="Máxima"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            yAxisId="left"
            dataKey="averageLoad"
            fill="#22c55e"
            name="Média"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="volume"
            stroke="#f97316"
            strokeWidth={2}
            name="Volume Total"
            dot={{ fill: "#f97316", r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Info adicional */}
      <div className="flex items-center justify-between pt-2 border-t text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Média Geral</p>
          <p className="font-bold">
            {(
              chartData.reduce((acc, d) => acc + d.averageLoad, 0) /
              chartData.length
            ).toFixed(1)}{" "}
            kg
          </p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-xs">Recorde</p>
          <p className="font-bold text-primary">{maxLoad.toFixed(1)} kg</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-xs">Volume Máx</p>
          <p className="font-bold text-orange-500">{maxVolume.toFixed(2)}t</p>
        </div>
      </div>
    </div>
  );
}

// Componente de Card de Sessão
interface SessionCardProps {
  session: {
    sessionId: string;
    performedAt: string;
    workoutTemplateTitle: string;
    sets: Array<{
      setNumber: number;
      load?: number;
      reps?: number;
      volume: number;
    }>;
    sessionVolume: number;
    maxLoad: number;
    totalReps: number;
  };
  isExpanded: boolean;
  onToggle: () => void;
}

function SessionCard({ session, isExpanded, onToggle }: SessionCardProps) {
  const sessionDate = new Date(session.performedAt);
  const isRecent = Date.now() - sessionDate.getTime() < 7 * 24 * 60 * 60 * 1000; // 7 dias

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-dark-03 rounded-lg overflow-hidden border border-neutral-dark-02"
    >
      {/* Header - Clicável */}
      <div
        className="p-4 cursor-pointer hover:bg-neutral-dark-03/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold">{session.workoutTemplateTitle}</h3>
              {isRecent && (
                <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full">
                  Recente
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {format(sessionDate, "EEEE, dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </p>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft size={20} className="rotate-90" />
          </motion.div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Séries</p>
            <p className="font-bold">{session.sets.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Carga Máx</p>
            <p className="font-bold text-primary">
              {session.maxLoad.toFixed(1)} kg
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Volume</p>
            <p className="font-bold">{session.sessionVolume.toFixed(0)} kg</p>
          </div>
        </div>
      </div>

      {/* Detalhes Expandidos */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-neutral-dark-02"
          >
            <div className="p-4 space-y-2">
              <h4 className="text-sm font-bold mb-3">Detalhes das Séries</h4>

              {/* Tabela de séries */}
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-xs font-bold text-muted-foreground pb-2 border-b border-neutral-dark-02">
                  <span>SÉRIE</span>
                  <span className="text-center">KG</span>
                  <span className="text-center">REPS</span>
                  <span className="text-right">VOLUME</span>
                </div>

                {session.sets.map((set) => (
                  <div
                    key={set.setNumber}
                    className="grid grid-cols-4 gap-2 text-sm py-2 border-b border-neutral-dark-02/50 last:border-0"
                  >
                    <span className="font-bold">#{set.setNumber}</span>
                    <span className="text-center font-mono">
                      {set.load?.toFixed(1) || "-"}
                    </span>
                    <span className="text-center font-mono">
                      {set.reps || "-"}
                    </span>
                    <span className="text-right font-mono text-primary">
                      {set.volume.toFixed(0)} kg
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="pt-3 mt-2 border-t border-neutral-dark-02">
                <div className="flex justify-between text-sm">
                  <span className="font-bold">TOTAL</span>
                  <div className="flex gap-4">
                    <span className="text-muted-foreground">
                      {session.totalReps} reps
                    </span>
                    <span className="font-bold text-primary">
                      {session.sessionVolume.toFixed(0)} kg
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
