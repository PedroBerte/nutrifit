export function toLegacyExercise(exercise: any, userId?: string) {
  return {
    id: exercise.id,
    name: exercise.name,
    imageUrl: exercise.imageUrl,
    instruction: exercise.instruction,
    videoUrl: exercise.videoUrl,
    categoryName: exercise.category?.name,
    primaryMuscles: exercise.primaryMuscles?.map((m: any) => m.muscle?.name).filter(Boolean) ?? [],
    secondaryMuscles: exercise.secondaryMuscles?.map((m: any) => m.muscle?.name).filter(Boolean) ?? [],
    createdByUserId: exercise.createdByUserId,
    isPublished: exercise.isPublished,
    isCustom: !!userId && exercise.createdByUserId === userId,
  };
}
