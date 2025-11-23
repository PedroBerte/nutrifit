-- Popular ProfessionalDetails para os personals existentes
-- Tags predefinidas: Emagrecimento, Hipertrofia, Funcional, Alongamento, Condicionamento, Reabilitação, etc.

DO $$
DECLARE
    v_professional RECORD;
    v_mode INT;
    v_tags TEXT[] := ARRAY[
        'Emagrecimento', 'Hipertrofia', 'Funcional', 'Alongamento', 
        'Condicionamento', 'Reabilitação', 'Iniciantes', 'Atletas',
        'Terceira Idade', 'Gestantes', 'Crossfit', 'Musculação',
        'Pilates', 'Yoga', 'Treino em Casa'
    ];
    v_tag1 TEXT;
    v_tag2 TEXT;
    v_tag3 TEXT;
    v_random FLOAT;
BEGIN
    -- Para cada personal que não tem ProfessionalDetails
    FOR v_professional IN 
        SELECT u."Id"
        FROM "Users" u
        WHERE u."ProfileId" = 'ad07405b-cdf2-4780-8a0e-69323be32a6c'
        AND NOT EXISTS (
            SELECT 1 FROM "ProfessionalDetails" pd 
            WHERE pd."ProfessionalId" = u."Id"
        )
    LOOP
        -- Determinar modalidade de atendimento (distribuição realista)
        v_random := RANDOM();
        IF v_random <= 0.40 THEN
            v_mode := 0; -- Presencial
        ELSIF v_random <= 0.70 THEN
            v_mode := 2; -- Híbrido
        ELSE
            v_mode := 1; -- Online
        END IF;

        -- Selecionar 3 tags aleatórias únicas
        WITH random_tags AS (
            SELECT unnest(v_tags) AS tag
            ORDER BY RANDOM()
            LIMIT 3
        )
        SELECT 
            ARRAY_AGG(tag) INTO v_tags
        FROM random_tags;
        
        v_tag1 := v_tags[1];
        v_tag2 := v_tags[2];
        v_tag3 := v_tags[3];

        -- Inserir ProfessionalDetails
        INSERT INTO "ProfessionalDetails" (
            "Id",
            "ProfessionalId",
            "AttendanceMode",
            "Tag1",
            "Tag2",
            "Tag3",
            "CreatedAt"
        ) VALUES (
            gen_random_uuid(),
            v_professional."Id",
            v_mode,
            v_tag1,
            v_tag2,
            v_tag3,
            NOW()
        );

        RAISE NOTICE 'Added details for professional %: % | Tags: %, %, %',
            v_professional."Id",
            CASE v_mode 
                WHEN 0 THEN 'Presencial'
                WHEN 1 THEN 'Online'
                WHEN 2 THEN 'Híbrido'
            END,
            v_tag1, v_tag2, v_tag3;
    END LOOP;

    RAISE NOTICE 'Professional details population completed!';
END $$;
