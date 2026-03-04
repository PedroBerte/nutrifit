import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Profiles
  const profiles = [
    { id: "00000000-0000-0000-0000-000000000001", name: "Student" },
    { id: "00000000-0000-0000-0000-000000000002", name: "Personal" },
    { id: "00000000-0000-0000-0000-000000000003", name: "Nutritionist" },
    { id: "00000000-0000-0000-0000-000000000004", name: "SelfManaged" },
  ];
  for (const p of profiles) {
    await prisma.profile.upsert({ where: { id: p.id }, update: {}, create: { ...p, status: "A" } });
  }

  // Exercise categories
  const categories = [
    { id: "10000000-0000-0000-0000-000000000001", name: "Cardio" },
    { id: "10000000-0000-0000-0000-000000000002", name: "Strength" },
    { id: "10000000-0000-0000-0000-000000000003", name: "Flexibility" },
    { id: "10000000-0000-0000-0000-000000000004", name: "Functional" },
  ];
  for (const c of categories) {
    await prisma.exerciseCategory.upsert({ where: { id: c.id }, update: {}, create: { ...c, status: "A" } });
  }

  // Muscle groups and muscles
  const muscleGroups = [
    { id: "20000000-0000-0000-0000-000000000001", name: "Chest", muscles: ["Pectoralis Major", "Pectoralis Minor"] },
    { id: "20000000-0000-0000-0000-000000000002", name: "Back", muscles: ["Latissimus Dorsi", "Trapezius", "Rhomboids"] },
    { id: "20000000-0000-0000-0000-000000000003", name: "Shoulders", muscles: ["Anterior Deltoid", "Lateral Deltoid", "Posterior Deltoid"] },
    { id: "20000000-0000-0000-0000-000000000004", name: "Arms", muscles: ["Biceps Brachii", "Triceps Brachii", "Brachialis"] },
    { id: "20000000-0000-0000-0000-000000000005", name: "Core", muscles: ["Rectus Abdominis", "Obliques", "Transverse Abdominis"] },
    { id: "20000000-0000-0000-0000-000000000006", name: "Legs", muscles: ["Quadriceps", "Hamstrings", "Glutes", "Calves"] },
  ];

  let muscleIndex = 1;
  for (const mg of muscleGroups) {
    await prisma.muscleGroup.upsert({ where: { id: mg.id }, update: {}, create: { id: mg.id, name: mg.name, status: "A" } });
    for (const muscleName of mg.muscles) {
      const muscleId = `30000000-0000-0000-${String(muscleIndex).padStart(4, "0")}-000000000001`;
      await prisma.muscle.upsert({
        where: { id: muscleId },
        update: {},
        create: { id: muscleId, name: muscleName, muscleGroupId: mg.id, status: "A" },
      });
      muscleIndex++;
    }
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
