import React, { useState } from "react";
import { useGetExercises } from "@/services/api/exercise";
import type { ExerciseType } from "@/types/exercise";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CreateExerciseDrawer } from "./CreateExerciseDrawer";

interface ExerciseDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExerciseSelect: (exerciseId: string, exerciseName: string) => void;
  selectedExerciseIds?: string[];
  onLongPress?: (exercise: ExerciseType) => void;
}

export function ExerciseDrawer({
  open,
  onOpenChange,
  onExerciseSelect,
  selectedExerciseIds = [],
  onLongPress,
}: ExerciseDrawerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [pressedExerciseId, setPressedExerciseId] = useState<string | null>(
    null
  );

  const { data: exercises, isLoading: exercisesLoading } = useGetExercises();

  const filteredExercises = exercises?.data?.filter((exercise: ExerciseType) =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //   const filteredExercises = exercises?.data;

  const handlePressStart = (exercise: ExerciseType) => {
    if (!onLongPress) return;

    setPressedExerciseId(exercise.id);
    const timer = setTimeout(() => {
      onLongPress(exercise);
      setPressedExerciseId(null);
    }, 800);

    setLongPressTimer(timer);
  };

  const handlePressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setPressedExerciseId(null);
  };

  const handleExerciseClick = (exercise: ExerciseType) => {
    handlePressEnd();
    const isAdded = selectedExerciseIds.includes(exercise.id);
    if (!isAdded) {
      onExerciseSelect(exercise.id, exercise.name);
    }
  };

  const handleCreateSuccess = () => {
    setCreateDrawerOpen(false);
    // A lista será atualizada automaticamente pelo React Query
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="border-b">
            <DrawerTitle>Exercícios</DrawerTitle>
          </DrawerHeader>

          <div className="p-4 space-y-4">
            {/* Botão Adicionar Exercício */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setCreateDrawerOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Novo Exercício
            </Button>

            {/* Campo de Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar exercícios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Lista de Exercícios */}
            <div className="max-h-[50vh] overflow-y-auto space-y-2">
              {exercisesLoading ? (
                <p className="text-center text-muted-foreground py-8">
                  Carregando exercícios...
                </p>
              ) : filteredExercises && filteredExercises.length > 0 ? (
                filteredExercises.map((exercise: ExerciseType) => {
                  const isAdded = selectedExerciseIds.includes(exercise.id);
                  const isPressed = pressedExerciseId === exercise.id;

                  return (
                    <Button
                      key={exercise.id}
                      variant={isAdded ? "secondary" : "outline"}
                      className={`w-full h-max justify-start transition-all ${
                        isPressed ? "scale-95 opacity-70" : ""
                      }`}
                      onClick={() => handleExerciseClick(exercise)}
                      onTouchStart={() => handlePressStart(exercise)}
                      onTouchEnd={handlePressEnd}
                      onMouseDown={() => handlePressStart(exercise)}
                      onMouseUp={handlePressEnd}
                      onMouseLeave={handlePressEnd}
                      disabled={isAdded}
                    >
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{exercise.name}</p>
                          {exercise.isCustom && (
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                              Meu
                            </span>
                          )}
                        </div>
                        {exercise.primaryMuscles &&
                          exercise.primaryMuscles.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {exercise.primaryMuscles.join(", ")}
                            </p>
                          )}
                      </div>
                      {isAdded && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          Adicionado
                        </span>
                      )}
                    </Button>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum exercício encontrado
                </p>
              )}
            </div>

            {onLongPress && (
              <p className="text-xs text-center text-muted-foreground">
                Mantenha pressionado um exercício personalizado para editar
              </p>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Drawer de Criação */}
      <CreateExerciseDrawer
        open={createDrawerOpen}
        onOpenChange={setCreateDrawerOpen}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}
