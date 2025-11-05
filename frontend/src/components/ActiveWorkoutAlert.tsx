import { useNavigate } from "react-router-dom";
import { Clock, Dumbbell, Play } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "motion/react";

interface ActiveWorkoutAlertProps {
  workoutInfo: {
    workoutTemplateId: string;
    workoutTemplateTitle: string;
    startedAt: string;
    totalVolume: number;
    totalSets: number;
  };
}

export default function ActiveWorkoutAlert({
  workoutInfo,
}: ActiveWorkoutAlertProps) {
  const navigate = useNavigate();

  const formatTime = (startedAt: string) => {
    const start = new Date(startedAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / 60000);

    if (diffMinutes < 60) return `${diffMinutes}min`;
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-lg p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <p className="font-bold text-sm">Treino em Andamento</p>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatTime(workoutInfo.startedAt)} atrás
        </span>
      </div>

      <div>
        <p className="font-semibold">{workoutInfo.workoutTemplateTitle}</p>
        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>Em progresso</span>
          </div>
          {workoutInfo.totalVolume > 0 && (
            <div className="flex items-center gap-1">
              <Dumbbell size={14} />
              <span>{workoutInfo.totalVolume.toFixed(0)} kg</span>
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={() =>
          navigate(`/workout/session/${workoutInfo.workoutTemplateId}`)
        }
        className="w-full"
        size="sm"
      >
        <Play size={16} className="mr-2" />
        Continuar Treino
      </Button>
    </motion.div>
  );
}
