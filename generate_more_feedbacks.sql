-- Generate additional feedbacks for existing personals
-- Distribution: 60% rate 5, 25% rate 4, 12% rate 3, 3% rate 1-2

DO $$
DECLARE
    v_bond RECORD;
    v_rate INT;
    v_random FLOAT;
    v_testimony TEXT;
    v_testimonies_5 TEXT[] := ARRAY[
        'Excelente profissional! Superou todas as minhas expectativas e me ajudou a alcançar meus objetivos.',
        'Muito dedicado e atencioso. Os treinos são desafiadores mas sempre adaptados ao meu nível.',
        'Melhor personal que já tive! Resultados visíveis em pouco tempo e sempre motivador.',
        'Profissional excepcional! Conhecimento técnico impecável e sempre disponível para tirar dúvidas.',
        'Transformou completamente minha relação com o exercício. Recomendo de olhos fechados!',
        'Super competente e sempre preocupado com minha evolução. Vale cada centavo!',
        'Treinos personalizados que realmente funcionam. Já indiquei para vários amigos!',
        'Profissionalismo nota 10! Sempre pontual, preparado e motivador.',
        'Consegui resultados que nunca imaginei ser possível. Gratidão por todo suporte!',
        'Excelente didática e paciência. Me sinto seguro executando todos os exercícios.',
        'Personal incrível! Combina conhecimento técnico com empatia e motivação.',
        'Melhor investimento que fiz na minha saúde. Resultados surpreendentes!',
        'Profissional diferenciado! Sempre atualizado com as melhores práticas de treino.',
        'Superou minhas expectativas! Treinos eficientes e sempre variados.',
        'Nota 1000! Me ajudou não só fisicamente mas também mentalmente.'
    ];
    v_testimonies_4 TEXT[] := ARRAY[
        'Muito bom profissional, treinos bem planejados. Recomendo!',
        'Ótimo personal, só gostaria de mais variedade nos treinos às vezes.',
        'Profissional competente e atencioso. Estou vendo bons resultados.',
        'Treinos eficientes e bem explicados. Muito satisfeito!',
        'Bom profissional, sempre disposto a ajudar e adaptar os treinos.',
        'Gostei bastante do trabalho. Poderia ser um pouco mais pontual.',
        'Conhecimento técnico muito bom. Os treinos são desafiadores.',
        'Profissional dedicado e atencioso. Recomendo!',
        'Muito bom! Só sinto falta de mais acompanhamento nutricional integrado.',
        'Ótimos resultados até agora. Continuarei com o trabalho.',
        'Profissional sério e comprometido. Treinos bem estruturados.',
        'Gostei muito! Apenas gostaria de mais flexibilidade nos horários.',
        'Bom trabalho! Poderia melhorar a comunicação fora dos treinos.'
    ];
    v_testimonies_3 TEXT[] := ARRAY[
        'Profissional Ok, mas esperava um pouco mais de personalização nos treinos.',
        'Bom atendimento, mas os resultados poderiam ser melhores.',
        'Treinos razoáveis. Falta um pouco mais de motivação durante as sessões.',
        'Competente, mas sinto que poderia ser mais atencioso às minhas limitações.',
        'Atendimento adequado, mas esperava mais inovação nos treinos.',
        'Profissional correto, mas a comunicação poderia melhorar.',
        'Treinos ok, mas falta acompanhamento mais próximo da evolução.',
        'Razoável. Os treinos são bons mas poderia ser mais flexível com horários.',
        'Atende bem, mas sinto que falta mais personalização para meu caso específico.',
        'Profissional competente, mas esperava resultados mais rápidos.'
    ];
    v_testimonies_low TEXT[] := ARRAY[
        'Não atendeu minhas expectativas. Pouca atenção durante os treinos.',
        'Esperava muito mais pelo valor cobrado. Treinos repetitivos.',
        'Falta comprometimento e pontualidade. Não recomendo.',
        'Não vi os resultados prometidos. Vou procurar outro profissional.',
        'Atendimento deixou a desejar. Falta de profissionalismo em alguns momentos.',
        'Não consegui me adaptar à metodologia. Poderia ser mais atencioso.',
        'Treinos muito genéricos, não senti evolução significativa.',
        'Esperava mais dedicação e acompanhamento personalizado.'
    ];
    v_feedback_count INT := 0;
BEGIN
    -- Generate feedbacks for existing bonds that don't have feedbacks yet
    FOR v_bond IN 
        SELECT cpb."CustomerId", cpb."ProfessionalId", cpb."Id" as bond_id
        FROM "CustomerProfessionalBonds" cpb
        WHERE cpb."Status" = 'Accepted'
        AND NOT EXISTS (
            SELECT 1 FROM "CustomerFeedbacks" cf 
            WHERE cf."CustomerId" = cpb."CustomerId" 
            AND cf."ProfessionalId" = cpb."ProfessionalId"
        )
        ORDER BY RANDOM()
        LIMIT 30  -- Generate up to 30 additional feedbacks
    LOOP
        -- Determine rate based on distribution
        v_random := RANDOM();
        
        IF v_random <= 0.60 THEN
            v_rate := 5;
            v_testimony := v_testimonies_5[1 + FLOOR(RANDOM() * array_length(v_testimonies_5, 1))];
        ELSIF v_random <= 0.85 THEN
            v_rate := 4;
            v_testimony := v_testimonies_4[1 + FLOOR(RANDOM() * array_length(v_testimonies_4, 1))];
        ELSIF v_random <= 0.97 THEN
            v_rate := 3;
            v_testimony := v_testimonies_3[1 + FLOOR(RANDOM() * array_length(v_testimonies_3, 1))];
        ELSE
            v_rate := 1 + FLOOR(RANDOM() * 2); -- 1 or 2
            v_testimony := v_testimonies_low[1 + FLOOR(RANDOM() * array_length(v_testimonies_low, 1))];
        END IF;

        -- Insert customer feedback
        INSERT INTO "CustomerFeedbacks" (
            "Id",
            "CustomerId",
            "ProfessionalId",
            "Rate",
            "Testimony",
            "Type",
            "CreatedAt"
        ) VALUES (
            gen_random_uuid(),
            v_bond."CustomerId",
            v_bond."ProfessionalId",
            v_rate,
            v_testimony,
            'Professional',
            NOW() - (RANDOM() * INTERVAL '60 days')
        );

        v_feedback_count := v_feedback_count + 1;
    END LOOP;

    RAISE NOTICE 'Generated % additional feedbacks', v_feedback_count;
    
    -- Show summary statistics
    RAISE NOTICE '=== FEEDBACK STATISTICS ===';
    
    FOR v_bond IN
        SELECT 
            u."Name" as professional_name,
            COUNT(*) as total_feedbacks,
            ROUND(AVG(cf."Rate")::numeric, 2) as avg_rate,
            COUNT(CASE WHEN cf."Rate" = 5 THEN 1 END) as rate_5,
            COUNT(CASE WHEN cf."Rate" = 4 THEN 1 END) as rate_4,
            COUNT(CASE WHEN cf."Rate" = 3 THEN 1 END) as rate_3,
            COUNT(CASE WHEN cf."Rate" <= 2 THEN 1 END) as rate_low
        FROM "CustomerFeedbacks" cf
        JOIN "Users" u ON u."Id" = cf."ProfessionalId"
        GROUP BY u."Id", u."Name"
        ORDER BY avg_rate DESC, total_feedbacks DESC
    LOOP
        RAISE NOTICE 'Personal: % | Feedbacks: % | Avg: % | 5★: % | 4★: % | 3★: % | ≤2★: %',
            v_bond.professional_name,
            v_bond.total_feedbacks,
            v_bond.avg_rate,
            v_bond.rate_5,
            v_bond.rate_4,
            v_bond.rate_3,
            v_bond.rate_low;
    END LOOP;
    
END $$;
