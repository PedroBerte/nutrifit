-- Script para popular exercÃ­cios de musculaÃ§Ã£o no NutriFit
-- Execute este script no DBeaver

DO $$
DECLARE
    -- IDs das categorias
    cardio_id UUID;
    strength_id UUID;
    flexibility_id UUID;
    functional_id UUID;
    
    -- IDs dos grupos musculares
    peito_id UUID;
    costas_id UUID;
    ombros_id UUID;
    bracos_id UUID;
    pernas_id UUID;
    core_id UUID;
    
    -- IDs dos mÃºsculos
    peitoral_maior_id UUID;
    peitoral_menor_id UUID;
    latissimo_id UUID;
    romboides_id UUID;
    trapezio_id UUID;
    deltoide_anterior_id UUID;
    deltoide_lateral_id UUID;
    deltoide_posterior_id UUID;
    biceps_id UUID;
    triceps_id UUID;
    antebracos_id UUID;
    quadriceps_id UUID;
    isquiotibiais_id UUID;
    gluteos_id UUID;
    panturrilhas_id UUID;
    abdominais_id UUID;
    obliquos_id UUID;
    lombar_id UUID;
    
    -- IDs dos exercÃ­cios
    exercise_id UUID;
    
BEGIN
    -- Buscar IDs das categorias
    SELECT id INTO cardio_id FROM "ExerciseCategory" WHERE name = 'Cardio' LIMIT 1;
    SELECT id INTO strength_id FROM "ExerciseCategory" WHERE name = 'Strength' LIMIT 1;
    SELECT id INTO flexibility_id FROM "ExerciseCategory" WHERE name = 'Flexibility' LIMIT 1;
    SELECT id INTO functional_id FROM "ExerciseCategory" WHERE name = 'Functional' LIMIT 1;
    
    -- Buscar IDs dos grupos musculares
    SELECT id INTO peito_id FROM "MuscleGroup" WHERE name = 'Chest' LIMIT 1;
    SELECT id INTO costas_id FROM "MuscleGroup" WHERE name = 'Back' LIMIT 1;
    SELECT id INTO ombros_id FROM "MuscleGroup" WHERE name = 'Shoulders' LIMIT 1;
    SELECT id INTO bracos_id FROM "MuscleGroup" WHERE name = 'Arms' LIMIT 1;
    SELECT id INTO pernas_id FROM "MuscleGroup" WHERE name = 'Legs' LIMIT 1;
    SELECT id INTO core_id FROM "MuscleGroup" WHERE name = 'Core' LIMIT 1;
    
    -- Buscar IDs dos mÃºsculos
    SELECT id INTO peitoral_maior_id FROM "Muscle" WHERE name = 'Pectoralis Major' LIMIT 1;
    SELECT id INTO peitoral_menor_id FROM "Muscle" WHERE name = 'Pectoralis Minor' LIMIT 1;
    SELECT id INTO latissimo_id FROM "Muscle" WHERE name = 'LatÃ­ssimo do Dorso' LIMIT 1;
    SELECT id INTO romboides_id FROM "Muscle" WHERE name = 'Rhomboids' LIMIT 1;
    SELECT id INTO trapezio_id FROM "Muscle" WHERE name = 'TrapÃ©zio' LIMIT 1;
    SELECT id INTO deltoide_anterior_id FROM "Muscle" WHERE name = 'Anterior Deltoid' LIMIT 1;
    SELECT id INTO deltoide_lateral_id FROM "Muscle" WHERE name = 'Lateral Deltoid' LIMIT 1;
    SELECT id INTO deltoide_posterior_id FROM "Muscle" WHERE name = 'Posterior Deltoid' LIMIT 1;
    SELECT id INTO biceps_id FROM "Muscle" WHERE name = 'BÃ­ceps' LIMIT 1;
    SELECT id INTO triceps_id FROM "Muscle" WHERE name = 'TrÃ­ceps' LIMIT 1;
    SELECT id INTO antebracos_id FROM "Muscle" WHERE name = 'Brachialis' LIMIT 1;
    SELECT id INTO quadriceps_id FROM "Muscle" WHERE name = 'QuadrÃ­ceps' LIMIT 1;
    SELECT id INTO isquiotibiais_id FROM "Muscle" WHERE name = 'Hamstrings' LIMIT 1;
    SELECT id INTO gluteos_id FROM "Muscle" WHERE name = 'Glutes' LIMIT 1;
    SELECT id INTO panturrilhas_id FROM "Muscle" WHERE name = 'Calves' LIMIT 1;
    SELECT id INTO abdominais_id FROM "Muscle" WHERE name = 'Rectus Abdominis' LIMIT 1;
    SELECT id INTO obliquos_id FROM "Muscle" WHERE name = 'OblÃ­quos' LIMIT 1;
    SELECT id INTO lombar_id FROM "Muscle" WHERE name = 'Transverse Abdominis' LIMIT 1;

    -- Reforça mapeamentos com nomes do seed atual (backend-node)
    SELECT id INTO cardio_id FROM "ExerciseCategory" WHERE name = 'Cardio' LIMIT 1;
    SELECT id INTO strength_id FROM "ExerciseCategory" WHERE name = 'Strength' LIMIT 1;
    SELECT id INTO flexibility_id FROM "ExerciseCategory" WHERE name = 'Flexibility' LIMIT 1;
    SELECT id INTO functional_id FROM "ExerciseCategory" WHERE name = 'Functional' LIMIT 1;

    SELECT id INTO peito_id FROM "MuscleGroup" WHERE name = 'Chest' LIMIT 1;
    SELECT id INTO costas_id FROM "MuscleGroup" WHERE name = 'Back' LIMIT 1;
    SELECT id INTO ombros_id FROM "MuscleGroup" WHERE name = 'Shoulders' LIMIT 1;
    SELECT id INTO bracos_id FROM "MuscleGroup" WHERE name = 'Arms' LIMIT 1;
    SELECT id INTO pernas_id FROM "MuscleGroup" WHERE name = 'Legs' LIMIT 1;
    SELECT id INTO core_id FROM "MuscleGroup" WHERE name = 'Core' LIMIT 1;

    SELECT id INTO peitoral_maior_id FROM "Muscle" WHERE name = 'Pectoralis Major' LIMIT 1;
    SELECT id INTO peitoral_menor_id FROM "Muscle" WHERE name = 'Pectoralis Minor' LIMIT 1;
    SELECT id INTO latissimo_id FROM "Muscle" WHERE name = 'Latissimus Dorsi' LIMIT 1;
    SELECT id INTO romboides_id FROM "Muscle" WHERE name = 'Rhomboids' LIMIT 1;
    SELECT id INTO trapezio_id FROM "Muscle" WHERE name = 'Trapezius' LIMIT 1;
    SELECT id INTO deltoide_anterior_id FROM "Muscle" WHERE name = 'Anterior Deltoid' LIMIT 1;
    SELECT id INTO deltoide_lateral_id FROM "Muscle" WHERE name = 'Lateral Deltoid' LIMIT 1;
    SELECT id INTO deltoide_posterior_id FROM "Muscle" WHERE name = 'Posterior Deltoid' LIMIT 1;
    SELECT id INTO biceps_id FROM "Muscle" WHERE name = 'Biceps Brachii' LIMIT 1;
    SELECT id INTO triceps_id FROM "Muscle" WHERE name = 'Triceps Brachii' LIMIT 1;
    SELECT id INTO antebracos_id FROM "Muscle" WHERE name = 'Brachialis' LIMIT 1;
    SELECT id INTO quadriceps_id FROM "Muscle" WHERE name = 'Quadriceps' LIMIT 1;
    SELECT id INTO isquiotibiais_id FROM "Muscle" WHERE name = 'Hamstrings' LIMIT 1;
    SELECT id INTO gluteos_id FROM "Muscle" WHERE name = 'Glutes' LIMIT 1;
    SELECT id INTO panturrilhas_id FROM "Muscle" WHERE name = 'Calves' LIMIT 1;
    SELECT id INTO abdominais_id FROM "Muscle" WHERE name = 'Rectus Abdominis' LIMIT 1;
    SELECT id INTO obliquos_id FROM "Muscle" WHERE name = 'Obliques' LIMIT 1;
    SELECT id INTO lombar_id FROM "Muscle" WHERE name = 'Transverse Abdominis' LIMIT 1;

    -- ========================================
    -- EXERCÃCIOS DE PEITO
    -- ========================================
    
    -- Supino Declinado
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Supino Declinado', 'Deitado em banco declinado, desÃ§a a barra atÃ© o peito inferior e empurre para cima.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), peitoral_maior_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), triceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), deltoide_anterior_id, exercise_id, NOW(), 'A');
    
    -- Crucifixo Reto
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Crucifixo Reto', 'Com halteres, abra os braÃ§os em arco atÃ© sentir alongamento no peito, depois feche.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), peitoral_maior_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), deltoide_anterior_id, exercise_id, NOW(), 'A');
    
    -- Crucifixo Inclinado
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Crucifixo Inclinado', 'Em banco inclinado 30-45Â°, execute movimento de crucifixo com halteres.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), peitoral_maior_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), peitoral_menor_id, exercise_id, NOW(), 'A');
    
    -- FlexÃ£o de BraÃ§o
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'FlexÃ£o de BraÃ§o', 'Corpo em prancha, desÃ§a atÃ© peito prÃ³ximo ao chÃ£o e empurre de volta.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), peitoral_maior_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), triceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), deltoide_anterior_id, exercise_id, NOW(), 'A');
    
    -- Cross Over
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Cross Over', 'Com cabos, cruze os braÃ§os na frente do corpo contraindo o peito.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), peitoral_maior_id, exercise_id, NOW(), 'A');

    -- ========================================
    -- EXERCÃCIOS DE COSTAS
    -- ========================================
    
    -- Remada Curvada
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Remada Curvada', 'Inclinado para frente, puxe a barra atÃ© o abdÃ´men mantendo costas retas.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), latissimo_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), romboides_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), trapezio_id, exercise_id, NOW(), 'A');
    
    -- Puxada Frontal
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Puxada Frontal', 'Sentado, puxe a barra para baixo atÃ© a frente do peito.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), latissimo_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), biceps_id, exercise_id, NOW(), 'A');
    
    -- Puxada Costas (Posterior)
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Puxada Posterior', 'Sentado, puxe a barra para trÃ¡s da nuca.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), latissimo_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), trapezio_id, exercise_id, NOW(), 'A');
    
    -- Remada Baixa
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Remada Baixa', 'Sentado, puxe cabo atÃ© o abdÃ´men mantendo costas retas.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), latissimo_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), romboides_id, exercise_id, NOW(), 'A');
    
    -- Remada Unilateral com Halter
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Remada Unilateral', 'Apoiado no banco, puxe halter atÃ© lateral do tronco.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), latissimo_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), romboides_id, exercise_id, NOW(), 'A');
    
    -- Encolhimento (TrapÃ©zio)
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Encolhimento', 'Com halteres ou barra, eleve os ombros contraindo o trapÃ©zio.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), trapezio_id, exercise_id, NOW(), 'A');
    
    -- Pullover
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Pullover', 'Deitado, com halter, leve peso acima da cabeÃ§a e retorne em arco.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), latissimo_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), peitoral_maior_id, exercise_id, NOW(), 'A');

    -- ========================================
    -- EXERCÃCIOS DE OMBROS
    -- ========================================
    
    -- Desenvolvimento Militar
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Desenvolvimento Militar', 'Sentado ou em pÃ©, empurre barra acima da cabeÃ§a.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), deltoide_anterior_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), deltoide_lateral_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), triceps_id, exercise_id, NOW(), 'A');
    
    -- ElevaÃ§Ã£o Frontal
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'ElevaÃ§Ã£o Frontal', 'Com halteres ou barra, eleve peso Ã  frente atÃ© altura dos ombros.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), deltoide_anterior_id, exercise_id, NOW(), 'A');
    
    -- Remada Alta
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Remada Alta', 'Puxe barra verticalmente atÃ© prÃ³ximo ao queixo com cotovelos altos.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), deltoide_lateral_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), trapezio_id, exercise_id, NOW(), 'A');
    
    -- Crucifixo Invertido
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Crucifixo Invertido', 'Inclinado para frente, abra halteres lateralmente trabalhando deltoide posterior.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), deltoide_posterior_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), romboides_id, exercise_id, NOW(), 'A');

    -- ========================================
    -- EXERCÃCIOS DE BRAÃ‡OS
    -- ========================================
    
    -- Rosca Alternada
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Rosca Alternada', 'Alterne braÃ§os ao curvar halteres atÃ© os ombros.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), biceps_id, exercise_id, NOW(), 'A');
    
    -- Rosca Martelo
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Rosca Martelo', 'Com halteres em posiÃ§Ã£o neutra, curve atÃ© os ombros.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), biceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), antebracos_id, exercise_id, NOW(), 'A');
    
    -- Rosca Scott
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Rosca Scott', 'Apoiado no banco Scott, curve barra ou halteres isolando bÃ­ceps.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), biceps_id, exercise_id, NOW(), 'A');
    
    -- TrÃ­ceps Testa
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'TrÃ­ceps Testa', 'Deitado, desÃ§a barra em direÃ§Ã£o Ã  testa e estenda braÃ§os.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), triceps_id, exercise_id, NOW(), 'A');
    
    -- TrÃ­ceps Corda
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'TrÃ­ceps Corda', 'No cabo, empurre corda para baixo separando as pontas.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), triceps_id, exercise_id, NOW(), 'A');
    
    -- TrÃ­ceps FrancÃªs
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'TrÃ­ceps FrancÃªs', 'Sentado ou em pÃ©, desÃ§a halter atrÃ¡s da cabeÃ§a e estenda.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), triceps_id, exercise_id, NOW(), 'A');
    
    -- Rosca Inversa
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Rosca Inversa', 'Com pegada pronada, curve barra trabalhando antebraÃ§os.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), antebracos_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), biceps_id, exercise_id, NOW(), 'A');

    -- ========================================
    -- EXERCÃCIOS DE PERNAS
    -- ========================================
    
    -- Agachamento Frontal
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Agachamento Frontal', 'Com barra na frente dos ombros, agache mantendo tronco ereto.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');
    
    -- Leg Press
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Leg Press', 'Na mÃ¡quina, empurre plataforma com os pÃ©s.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');
    
    -- Cadeira Extensora
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Cadeira Extensora', 'Sentado, estenda pernas contra resistÃªncia.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    
    -- Mesa Flexora
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Mesa Flexora', 'Deitado de bruÃ§os, flexione pernas contra resistÃªncia.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), isquiotibiais_id, exercise_id, NOW(), 'A');
    
    -- Stiff
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Stiff', 'Com pernas semiflexionadas, desÃ§a barra mantendo costas retas.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), isquiotibiais_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), lombar_id, exercise_id, NOW(), 'A');
    
    -- Agachamento SumÃ´
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Agachamento SumÃ´', 'PÃ©s afastados, pontas para fora, agache profundamente.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');
    
    -- ElevaÃ§Ã£o PÃ©lvica
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'ElevaÃ§Ã£o PÃ©lvica', 'Deitado, eleve quadril contraindo glÃºteos.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), isquiotibiais_id, exercise_id, NOW(), 'A');
    
    -- Panturrilha em PÃ©
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Panturrilha em PÃ©', 'Na mÃ¡quina, eleve calcanhar contraindo panturrilhas.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), panturrilhas_id, exercise_id, NOW(), 'A');
    
    -- Panturrilha Sentado
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Panturrilha Sentado', 'Sentado, eleve calcanhar com peso nos joelhos.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), panturrilhas_id, exercise_id, NOW(), 'A');

    -- ========================================
    -- EXERCÃCIOS DE CORE/ABDÃ”MEN
    -- ========================================
    
    -- Abdominal Supra
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Abdominal Supra', 'Deitado, eleve tronco contraindo abdÃ´men superior.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');
    
    -- Abdominal Infra
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Abdominal Infra', 'Deitado, eleve pernas contraindo abdÃ´men inferior.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');
    
    -- Abdominal OblÃ­quo
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Abdominal OblÃ­quo', 'Deitado, leve cotovelo ao joelho oposto alternadamente.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), obliquos_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');
    
    -- Prancha Lateral
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Prancha Lateral', 'De lado, apoiado no antebraÃ§o, mantenha corpo alinhado.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), obliquos_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');
    
    -- Abdominal Canivete
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Abdominal Canivete', 'Deitado, leve tronco e pernas simultaneamente.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');
    
    -- Bicicleta no Ar
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Bicicleta no Ar', 'Simule pedalar no ar alternando cotovelos com joelhos.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), obliquos_id, exercise_id, NOW(), 'A');
    
    -- Prancha com ElevaÃ§Ã£o de Perna
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'Prancha com ElevaÃ§Ã£o de Perna', 'Em prancha, alterne elevaÃ§Ã£o de pernas mantendo core estÃ¡vel.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');
    
    -- HiperextensÃ£o Lombar
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, strength_id, 'HiperextensÃ£o Lombar', 'Na mÃ¡quina especÃ­fica, estenda tronco trabalhando lombar.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), lombar_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');

    -- ========================================
    -- EXERCÃCIOS FUNCIONAIS
    -- ========================================
    
    -- Burpee
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, functional_id, 'Burpee', 'Agache, prancha, flexÃ£o, salto vertical em sequÃªncia.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), peitoral_maior_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');
    
    -- Mountain Climber
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, functional_id, 'Mountain Climber', 'Em prancha, alterne joelhos ao peito rapidamente.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    
    -- Kettlebell Swing
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, functional_id, 'Kettlebell Swing', 'Balance kettlebell entre pernas e eleve atÃ© altura dos ombros.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), isquiotibiais_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), lombar_id, exercise_id, NOW(), 'A');
    
    -- Turkish Get-Up
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, functional_id, 'Turkish Get-Up', 'De deitado atÃ© em pÃ© segurando kettlebell acima da cabeÃ§a.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), deltoide_anterior_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    
    -- Box Jump
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, functional_id, 'Box Jump', 'Salte sobre caixa aterrissando suavemente.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), panturrilhas_id, exercise_id, NOW(), 'A');
    
    -- Farmer's Walk
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, functional_id, 'Farmer''s Walk', 'Caminhe segurando pesos pesados nas mÃ£os.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), antebracos_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), trapezio_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');

    -- ========================================
    -- EXERCÃCIOS DE CARDIO
    -- ========================================
    
    -- Corrida
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, cardio_id, 'Corrida', 'Corrida em esteira ou ao ar livre com ritmo constante.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), panturrilhas_id, exercise_id, NOW(), 'A');
    
    -- Bicicleta ErgomÃ©trica
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, cardio_id, 'Bicicleta ErgomÃ©trica', 'Pedale em ritmo constante ajustando resistÃªncia conforme necessÃ¡rio.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');
    
    -- ElÃ­ptico
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, cardio_id, 'ElÃ­ptico', 'Movimento circular simulando corrida sem impacto.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');
    
    -- Pular Corda
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercise" (id, "categoryId", name, instruction, "isPublished", "createdAt", status)
    VALUES (exercise_id, cardio_id, 'Pular Corda', 'Saltos consecutivos com corda mantendo ritmo constante.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), panturrilhas_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscle" (id, "muscleId", "exerciseId", "createdAt", status)
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');

    RAISE NOTICE 'Script executado com sucesso! % novos exercÃ­cios adicionados.', 45;
END $$;




