import React, { useState, useMemo } from "react";
import { useGetExercises } from "@/services/api/exercise";
import type { ExerciseType } from "@/types/exercise";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Plus, Search, X, ChevronDown, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CreateExerciseDrawer } from "./CreateExerciseDrawer";
import { motion, AnimatePresence } from "motion/react";

interface ExerciseDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExerciseSelect: (
    exerciseId: string,
    exerciseName: string,
    exercisevideoUrl?: string
  ) => void;
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
  const [exerciseToEdit, setExerciseToEdit] = useState<ExerciseType | null>(
    null
  );
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [pressedExerciseId, setPressedExerciseId] = useState<string | null>(
    null
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const { data: exercises, isLoading: exercisesLoading } = useGetExercises();

  // Extrai categorias e músculos únicos dos exercícios
  const { categories, muscles } = useMemo(() => {
    if (!exercises?.data) return { categories: [], muscles: [] };

    const categoriesSet = new Set<string>();
    const musclesSet = new Set<string>();

    exercises.data.forEach((exercise: ExerciseType) => {
      if (exercise.categoryName) categoriesSet.add(exercise.categoryName);
      exercise.primaryMuscles?.forEach((muscle) => musclesSet.add(muscle));
    });

    return {
      categories: Array.from(categoriesSet).sort(),
      muscles: Array.from(musclesSet).sort(),
    };
  }, [exercises?.data]);

  const filteredExercises = useMemo(() => {
    if (!exercises?.data) return [];

    return exercises.data.filter((exercise: ExerciseType) => {
      // Filtro de busca
      const matchesSearch = exercise.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Filtro de categoria
      const matchesCategory =
        selectedCategories.length === 0 ||
        (exercise.categoryName &&
          selectedCategories.includes(exercise.categoryName));

      // Filtro de músculos
      const matchesMuscles =
        selectedMuscles.length === 0 ||
        exercise.primaryMuscles?.some((muscle) =>
          selectedMuscles.includes(muscle)
        );

      return matchesSearch && matchesCategory && matchesMuscles;
    });
  }, [exercises?.data, searchTerm, selectedCategories, selectedMuscles]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscle)
        ? prev.filter((m) => m !== muscle)
        : [...prev, muscle]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedMuscles([]);
    setSearchTerm("");
  };

  const activeFiltersCount =
    selectedCategories.length + selectedMuscles.length;

  const handlePressStart = (exercise: ExerciseType) => {
    // Só permite editar exercícios customizados do próprio usuário
    if (!exercise.isCustom) return;

    console.log("🔵 Long press iniciado para:", exercise.name);
    setPressedExerciseId(exercise.id);
    const timer = setTimeout(() => {
      setExerciseToEdit(exercise);
      setCreateDrawerOpen(true);
      setPressedExerciseId(null);

      if (onLongPress) {
        onLongPress(exercise);
      }
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
      onExerciseSelect(exercise.id, exercise.name, exercise.videoUrl);
    }
  };

  const handleCreateSuccess = () => {
    setCreateDrawerOpen(false);
    setExerciseToEdit(null);
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b flex-shrink-0">
            <DrawerTitle>Exercícios</DrawerTitle>
          </DrawerHeader>

          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {/* Botão Adicionar Exercício */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setExerciseToEdit(null);
                setCreateDrawerOpen(true);
              }}
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

            {/* Filtros Colapsáveis */}
            <div className="space-y-2">
              {/* Header de Filtros - Clicável */}
              <button
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                className="w-full flex items-center justify-between px-3 py-2 bg-neutral-dark-02/50 hover:bg-neutral-dark-03 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Filtros</span>
                  {activeFiltersCount > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-primary rounded-full text-primary-foreground">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAllFilters();
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Limpar
                    </button>
                  )}
                  <motion.div
                    animate={{ rotate: isFiltersExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} className="text-muted-foreground" />
                  </motion.div>
                </div>
              </button>

              {/* Conteúdo dos Filtros - Colapsável */}
              <AnimatePresence>
                {isFiltersExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 py-2 space-y-3">
                      {/* Filtro por Categoria */}
                      {categories.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Categoria
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                              <motion.button
                                key={category}
                                onClick={() => toggleCategory(category)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                                  selectedCategories.includes(category)
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-neutral-dark-02 text-foreground hover:bg-neutral-dark-01"
                                }`}
                                whileTap={{ scale: 0.95 }}
                              >
                                {category}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Filtro por Músculo */}
                      {muscles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Grupo Muscular
                          </p>
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {muscles.map((muscle) => (
                              <motion.button
                                key={muscle}
                                onClick={() => toggleMuscle(muscle)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                                  selectedMuscles.includes(muscle)
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-neutral-dark-02 text-foreground hover:bg-neutral-dark-01"
                                }`}
                                whileTap={{ scale: 0.95 }}
                              >
                                {muscle}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Contador de Resultados */}
            {filteredExercises && (
              <p className="text-xs text-muted-foreground text-center">
                {filteredExercises.length} exercício
                {filteredExercises.length !== 1 ? "s" : ""} encontrado
                {filteredExercises.length !== 1 ? "s" : ""}
              </p>
            )}

            {/* Lista de Exercícios */}
            <div className="space-y-2 pb-4">
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
                      {/* Thumbnail da imagem/GIF */}
                      {exercise.videoUrl && (
                        <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted mr-3">
                          <img
                            src={exercise.videoUrl}
                            alt={exercise.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      )}

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

            <p className="text-xs text-center text-muted-foreground">
              Mantenha pressionado um exercício personalizado para editar
            </p>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Drawer de Criação/Edição */}
      <CreateExerciseDrawer
        open={createDrawerOpen}
        onOpenChange={(isOpen) => {
          setCreateDrawerOpen(isOpen);
          if (!isOpen) {
            setExerciseToEdit(null);
          }
        }}
        onSuccess={handleCreateSuccess}
        exerciseToEdit={exerciseToEdit}
      />
    </>
  );
}
