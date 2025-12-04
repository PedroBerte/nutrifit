import { Button } from "@/components/ui/button";
import { GripVertical, Edit, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface SortableExerciseData {
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseImageUrl?: string;
  targetSets: number;
  targetRepsMin?: number;
  targetRepsMax?: number;
  suggestedLoad?: number;
  restSeconds?: number;
  notes?: string;
  order: number;
}

interface SortableExerciseItemProps<T extends SortableExerciseData> {
  exercise: T;
  onEdit: (exercise: T) => void;
  onRemove: (exercise: T) => void;
  formatSummary: (exercise: T) => string;
}

export function SortableExerciseItem<T extends SortableExerciseData>({
  exercise,
  onEdit,
  onRemove,
  formatSummary,
}: SortableExerciseItemProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 xs:gap-3 p-2 xs:p-3 bg-neutral-dark-01 rounded-lg ${
        isDragging ? "shadow-lg ring-2 ring-primary" : ""
      }`}
    >
      {/* Grip para arrastar */}
      <button
        type="button"
        className="touch-none p-1 xs:p-1.5 rounded hover:bg-neutral-dark-03 cursor-grab active:cursor-grabbing flex-shrink-0"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 xs:h-5 xs:w-5 text-muted-foreground" />
      </button>

      {/* Thumbnail da imagem/GIF do exercício - oculta em telas pequenas */}
      {exercise.exerciseImageUrl && (
        <div className="hidden xs:flex flex-shrink-0 w-10 h-10 xs:w-12 xs:h-12 rounded-md overflow-hidden bg-muted">
          <img
            src={exercise.exerciseImageUrl}
            alt={exercise.exerciseName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Informações do exercício */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm xs:text-base truncate">
          {exercise.exerciseName}
        </p>
        <p className="text-xs xs:text-sm text-muted-foreground truncate">
          {formatSummary(exercise)}
        </p>
        {exercise.notes && (
          <p className="text-[10px] xs:text-xs text-muted-foreground mt-0.5 xs:mt-1 truncate">
            {exercise.notes}
          </p>
        )}
      </div>

      {/* Botões de ação - vertical */}
      <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 xs:h-8 xs:w-8"
          onClick={() => onEdit(exercise)}
        >
          <Edit className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 xs:h-8 xs:w-8 text-destructive hover:text-destructive"
          onClick={() => onRemove(exercise)}
        >
          <Trash2 className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
        </Button>
      </div>
    </div>
  );
}
