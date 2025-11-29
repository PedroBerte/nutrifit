-- Script para popular exercícios de musculação no NutriFit
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
    
    -- IDs dos músculos
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
    
    -- IDs dos exercícios
    exercise_id UUID;
    
BEGIN
    -- Buscar IDs das categorias
    SELECT "Id" INTO cardio_id FROM "ExerciseCategories" WHERE "Name" = 'Cardio' LIMIT 1;
    SELECT "Id" INTO strength_id FROM "ExerciseCategories" WHERE "Name" = 'Força' LIMIT 1;
    SELECT "Id" INTO flexibility_id FROM "ExerciseCategories" WHERE "Name" = 'Flexibilidade' LIMIT 1;
    SELECT "Id" INTO functional_id FROM "ExerciseCategories" WHERE "Name" = 'Funcional' LIMIT 1;
    
    -- Buscar IDs dos grupos musculares
    SELECT "Id" INTO peito_id FROM "MuscleGroups" WHERE "Name" = 'Peito' LIMIT 1;
    SELECT "Id" INTO costas_id FROM "MuscleGroups" WHERE "Name" = 'Costas' LIMIT 1;
    SELECT "Id" INTO ombros_id FROM "MuscleGroups" WHERE "Name" = 'Ombros' LIMIT 1;
    SELECT "Id" INTO bracos_id FROM "MuscleGroups" WHERE "Name" = 'Braços' LIMIT 1;
    SELECT "Id" INTO pernas_id FROM "MuscleGroups" WHERE "Name" = 'Pernas' LIMIT 1;
    SELECT "Id" INTO core_id FROM "MuscleGroups" WHERE "Name" = 'Core' LIMIT 1;
    
    -- Buscar IDs dos músculos
    SELECT "Id" INTO peitoral_maior_id FROM "Muscles" WHERE "Name" = 'Peitoral Maior' LIMIT 1;
    SELECT "Id" INTO peitoral_menor_id FROM "Muscles" WHERE "Name" = 'Peitoral Menor' LIMIT 1;
    SELECT "Id" INTO latissimo_id FROM "Muscles" WHERE "Name" = 'Latíssimo do Dorso' LIMIT 1;
    SELECT "Id" INTO romboides_id FROM "Muscles" WHERE "Name" = 'Romboides' LIMIT 1;
    SELECT "Id" INTO trapezio_id FROM "Muscles" WHERE "Name" = 'Trapézio' LIMIT 1;
    SELECT "Id" INTO deltoide_anterior_id FROM "Muscles" WHERE "Name" = 'Deltoide Anterior' LIMIT 1;
    SELECT "Id" INTO deltoide_lateral_id FROM "Muscles" WHERE "Name" = 'Deltoide Lateral' LIMIT 1;
    SELECT "Id" INTO deltoide_posterior_id FROM "Muscles" WHERE "Name" = 'Deltoide Posterior' LIMIT 1;
    SELECT "Id" INTO biceps_id FROM "Muscles" WHERE "Name" = 'Bíceps' LIMIT 1;
    SELECT "Id" INTO triceps_id FROM "Muscles" WHERE "Name" = 'Tríceps' LIMIT 1;
    SELECT "Id" INTO antebracos_id FROM "Muscles" WHERE "Name" = 'Antebraços' LIMIT 1;
    SELECT "Id" INTO quadriceps_id FROM "Muscles" WHERE "Name" = 'Quadríceps' LIMIT 1;
    SELECT "Id" INTO isquiotibiais_id FROM "Muscles" WHERE "Name" = 'Isquiotibiais' LIMIT 1;
    SELECT "Id" INTO gluteos_id FROM "Muscles" WHERE "Name" = 'Glúteos' LIMIT 1;
    SELECT "Id" INTO panturrilhas_id FROM "Muscles" WHERE "Name" = 'Panturrilhas' LIMIT 1;
    SELECT "Id" INTO abdominais_id FROM "Muscles" WHERE "Name" = 'Abdominais' LIMIT 1;
    SELECT "Id" INTO obliquos_id FROM "Muscles" WHERE "Name" = 'Oblíquos' LIMIT 1;
    SELECT "Id" INTO lombar_id FROM "Muscles" WHERE "Name" = 'Lombar' LIMIT 1;

    -- ========================================
    -- EXERCÍCIOS DE PEITO
    -- ========================================
    
    -- Supino Declinado
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Supino Declinado', 'Deitado em banco declinado, desça a barra até o peito inferior e empurre para cima.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), peitoral_maior_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), triceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), deltoide_anterior_id, exercise_id, NOW(), 'A');
    
    -- Crucifixo Reto
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Crucifixo Reto', 'Com halteres, abra os braços em arco até sentir alongamento no peito, depois feche.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), peitoral_maior_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), deltoide_anterior_id, exercise_id, NOW(), 'A');
    
    -- Crucifixo Inclinado
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Crucifixo Inclinado', 'Em banco inclinado 30-45°, execute movimento de crucifixo com halteres.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), peitoral_maior_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), peitoral_menor_id, exercise_id, NOW(), 'A');
    
    -- Flexão de Braço
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Flexão de Braço', 'Corpo em prancha, desça até peito próximo ao chão e empurre de volta.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), peitoral_maior_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), triceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), deltoide_anterior_id, exercise_id, NOW(), 'A');
    
    -- Cross Over
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Cross Over', 'Com cabos, cruze os braços na frente do corpo contraindo o peito.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), peitoral_maior_id, exercise_id, NOW(), 'A');

    -- ========================================
    -- EXERCÍCIOS DE COSTAS
    -- ========================================
    
    -- Remada Curvada
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Remada Curvada', 'Inclinado para frente, puxe a barra até o abdômen mantendo costas retas.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), latissimo_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), romboides_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), trapezio_id, exercise_id, NOW(), 'A');
    
    -- Puxada Frontal
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Puxada Frontal', 'Sentado, puxe a barra para baixo até a frente do peito.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), latissimo_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), biceps_id, exercise_id, NOW(), 'A');
    
    -- Puxada Costas (Posterior)
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Puxada Posterior', 'Sentado, puxe a barra para trás da nuca.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), latissimo_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), trapezio_id, exercise_id, NOW(), 'A');
    
    -- Remada Baixa
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Remada Baixa', 'Sentado, puxe cabo até o abdômen mantendo costas retas.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), latissimo_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), romboides_id, exercise_id, NOW(), 'A');
    
    -- Remada Unilateral com Halter
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Remada Unilateral', 'Apoiado no banco, puxe halter até lateral do tronco.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), latissimo_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), romboides_id, exercise_id, NOW(), 'A');
    
    -- Encolhimento (Trapézio)
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Encolhimento', 'Com halteres ou barra, eleve os ombros contraindo o trapézio.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), trapezio_id, exercise_id, NOW(), 'A');
    
    -- Pullover
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Pullover', 'Deitado, com halter, leve peso acima da cabeça e retorne em arco.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), latissimo_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), peitoral_maior_id, exercise_id, NOW(), 'A');

    -- ========================================
    -- EXERCÍCIOS DE OMBROS
    -- ========================================
    
    -- Desenvolvimento Militar
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Desenvolvimento Militar', 'Sentado ou em pé, empurre barra acima da cabeça.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), deltoide_anterior_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), deltoide_lateral_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), triceps_id, exercise_id, NOW(), 'A');
    
    -- Elevação Frontal
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Elevação Frontal', 'Com halteres ou barra, eleve peso à frente até altura dos ombros.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), deltoide_anterior_id, exercise_id, NOW(), 'A');
    
    -- Remada Alta
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Remada Alta', 'Puxe barra verticalmente até próximo ao queixo com cotovelos altos.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), deltoide_lateral_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), trapezio_id, exercise_id, NOW(), 'A');
    
    -- Crucifixo Invertido
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Crucifixo Invertido', 'Inclinado para frente, abra halteres lateralmente trabalhando deltoide posterior.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), deltoide_posterior_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), romboides_id, exercise_id, NOW(), 'A');

    -- ========================================
    -- EXERCÍCIOS DE BRAÇOS
    -- ========================================
    
    -- Rosca Alternada
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Rosca Alternada', 'Alterne braços ao curvar halteres até os ombros.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), biceps_id, exercise_id, NOW(), 'A');
    
    -- Rosca Martelo
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Rosca Martelo', 'Com halteres em posição neutra, curve até os ombros.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), biceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), antebracos_id, exercise_id, NOW(), 'A');
    
    -- Rosca Scott
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Rosca Scott', 'Apoiado no banco Scott, curve barra ou halteres isolando bíceps.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), biceps_id, exercise_id, NOW(), 'A');
    
    -- Tríceps Testa
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Tríceps Testa', 'Deitado, desça barra em direção à testa e estenda braços.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), triceps_id, exercise_id, NOW(), 'A');
    
    -- Tríceps Corda
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Tríceps Corda', 'No cabo, empurre corda para baixo separando as pontas.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), triceps_id, exercise_id, NOW(), 'A');
    
    -- Tríceps Francês
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Tríceps Francês', 'Sentado ou em pé, desça halter atrás da cabeça e estenda.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), triceps_id, exercise_id, NOW(), 'A');
    
    -- Rosca Inversa
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Rosca Inversa', 'Com pegada pronada, curve barra trabalhando antebraços.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), antebracos_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), biceps_id, exercise_id, NOW(), 'A');

    -- ========================================
    -- EXERCÍCIOS DE PERNAS
    -- ========================================
    
    -- Agachamento Frontal
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Agachamento Frontal', 'Com barra na frente dos ombros, agache mantendo tronco ereto.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');
    
    -- Leg Press
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Leg Press', 'Na máquina, empurre plataforma com os pés.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');
    
    -- Cadeira Extensora
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Cadeira Extensora', 'Sentado, estenda pernas contra resistência.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    
    -- Mesa Flexora
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Mesa Flexora', 'Deitado de bruços, flexione pernas contra resistência.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), isquiotibiais_id, exercise_id, NOW(), 'A');
    
    -- Stiff
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Stiff', 'Com pernas semiflexionadas, desça barra mantendo costas retas.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), isquiotibiais_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), lombar_id, exercise_id, NOW(), 'A');
    
    -- Agachamento Sumô
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Agachamento Sumô', 'Pés afastados, pontas para fora, agache profundamente.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');
    
    -- Elevação Pélvica
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Elevação Pélvica', 'Deitado, eleve quadril contraindo glúteos.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), isquiotibiais_id, exercise_id, NOW(), 'A');
    
    -- Panturrilha em Pé
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Panturrilha em Pé', 'Na máquina, eleve calcanhar contraindo panturrilhas.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), panturrilhas_id, exercise_id, NOW(), 'A');
    
    -- Panturrilha Sentado
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Panturrilha Sentado', 'Sentado, eleve calcanhar com peso nos joelhos.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), panturrilhas_id, exercise_id, NOW(), 'A');

    -- ========================================
    -- EXERCÍCIOS DE CORE/ABDÔMEN
    -- ========================================
    
    -- Abdominal Supra
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Abdominal Supra', 'Deitado, eleve tronco contraindo abdômen superior.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');
    
    -- Abdominal Infra
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Abdominal Infra', 'Deitado, eleve pernas contraindo abdômen inferior.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');
    
    -- Abdominal Oblíquo
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Abdominal Oblíquo', 'Deitado, leve cotovelo ao joelho oposto alternadamente.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), obliquos_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');
    
    -- Prancha Lateral
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Prancha Lateral', 'De lado, apoiado no antebraço, mantenha corpo alinhado.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), obliquos_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');
    
    -- Abdominal Canivete
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Abdominal Canivete', 'Deitado, leve tronco e pernas simultaneamente.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');
    
    -- Bicicleta no Ar
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Bicicleta no Ar', 'Simule pedalar no ar alternando cotovelos com joelhos.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), obliquos_id, exercise_id, NOW(), 'A');
    
    -- Prancha com Elevação de Perna
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Prancha com Elevação de Perna', 'Em prancha, alterne elevação de pernas mantendo core estável.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');
    
    -- Hiperextensão Lombar
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, strength_id, 'Hiperextensão Lombar', 'Na máquina específica, estenda tronco trabalhando lombar.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), lombar_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');

    -- ========================================
    -- EXERCÍCIOS FUNCIONAIS
    -- ========================================
    
    -- Burpee
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, functional_id, 'Burpee', 'Agache, prancha, flexão, salto vertical em sequência.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), peitoral_maior_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');
    
    -- Mountain Climber
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, functional_id, 'Mountain Climber', 'Em prancha, alterne joelhos ao peito rapidamente.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    
    -- Kettlebell Swing
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, functional_id, 'Kettlebell Swing', 'Balance kettlebell entre pernas e eleve até altura dos ombros.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), isquiotibiais_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), lombar_id, exercise_id, NOW(), 'A');
    
    -- Turkish Get-Up
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, functional_id, 'Turkish Get-Up', 'De deitado até em pé segurando kettlebell acima da cabeça.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), deltoide_anterior_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    
    -- Box Jump
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, functional_id, 'Box Jump', 'Salte sobre caixa aterrissando suavemente.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), panturrilhas_id, exercise_id, NOW(), 'A');
    
    -- Farmer's Walk
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, functional_id, 'Farmer''s Walk', 'Caminhe segurando pesos pesados nas mãos.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), antebracos_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), trapezio_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), abdominais_id, exercise_id, NOW(), 'A');

    -- ========================================
    -- EXERCÍCIOS DE CARDIO
    -- ========================================
    
    -- Corrida
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, cardio_id, 'Corrida', 'Corrida em esteira ou ao ar livre com ritmo constante.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), panturrilhas_id, exercise_id, NOW(), 'A');
    
    -- Bicicleta Ergométrica
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, cardio_id, 'Bicicleta Ergométrica', 'Pedale em ritmo constante ajustando resistência conforme necessário.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');
    
    -- Elíptico
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, cardio_id, 'Elíptico', 'Movimento circular simulando corrida sem impacto.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), gluteos_id, exercise_id, NOW(), 'A');
    
    -- Pular Corda
    exercise_id := gen_random_uuid();
    INSERT INTO "Exercises" ("Id", "CategoryId", "Name", "Instruction", "IsPublished", "CreatedAt", "Status")
    VALUES (exercise_id, cardio_id, 'Pular Corda', 'Saltos consecutivos com corda mantendo ritmo constante.', true, NOW(), 'A');
    INSERT INTO "ExercisePrimaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), panturrilhas_id, exercise_id, NOW(), 'A');
    INSERT INTO "ExerciseSecondaryMuscles" ("Id", "MuscleId", "ExerciseId", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), quadriceps_id, exercise_id, NOW(), 'A');

    RAISE NOTICE 'Script executado com sucesso! % novos exercícios adicionados.', 45;
END $$;
