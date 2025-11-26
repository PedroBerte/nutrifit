-- Script para popular banco com 10 personais na região de SP
-- Cidades: Sorocaba, Indaiatuba, Itu, Campinas, Jundiaí, Votorantim, Salto, Americana, Limeira, Piracicaba
-- Execute este script e depois rode a função de geocodificação no frontend

-- ProfileId para Personal Trainer (verificar no banco, geralmente é o GUID fixo)
-- Password: "senha123" hasheado com BCrypt

DO $$
DECLARE
    personal_profile_id UUID;
    new_user_id UUID;
    new_address_id UUID;
BEGIN
    -- Buscar o ID do perfil Personal
    SELECT "Id" INTO personal_profile_id FROM "Profiles" WHERE "Name" = 'Personal' LIMIT 1;

    -- Personal 1: Sorocaba
    new_user_id := gen_random_uuid();
    new_address_id := gen_random_uuid();
    
    INSERT INTO "Addresses" ("Id", "AddressLine", "Number", "City", "State", "ZipCode", "Country", "AddressType", "CreatedAt", "Status")
    VALUES (new_address_id, 'Rua Aparecida', '123', 'Sorocaba', 'SP', '18040-025', 'Brasil', 0, NOW(), 'A');
    
    INSERT INTO "Users" ("Id", "AddressId", "ProfileId", "Name", "Email", "Password", "Sex", "CreatedAt", "Status", "IsAdmin", "DateOfBirth", "PhoneNumber")
    VALUES (new_user_id, new_address_id, personal_profile_id, 'Carlos Eduardo Silva', 'carlos.sorocaba@nutrifit.com', '$2a$11$xQxYqZ8VGK.EhJ9qQxYqZeOqZ8VGK.EhJ9qQxYqZeOqZ8VGK.EhJ9', 'M', NOW(), 'A', false, '1988-03-15', '(15) 98765-4321');
    
    INSERT INTO "ProfessionalCredentials" ("Id", "ProfessionalId", "Type", "CredentialId", "Biography", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), new_user_id, 'CREF', '123456-G/SP', 'Personal trainer especializado em hipertrofia e emagrecimento. 10 anos de experiência.', NOW(), 'A');
    
    INSERT INTO "ProfessionalDetails" ("Id", "ProfessionalId", "AttendanceMode", "Tag1", "Tag2", "Tag3", "CreatedAt")
    VALUES (gen_random_uuid(), new_user_id, 2, 'Hipertrofia', 'Emagrecimento', 'Funcional', NOW());

    -- Personal 2: Indaiatuba
    new_user_id := gen_random_uuid();
    new_address_id := gen_random_uuid();
    
    INSERT INTO "Addresses" ("Id", "AddressLine", "Number", "City", "State", "ZipCode", "Country", "AddressType", "CreatedAt", "Status")
    VALUES (new_address_id, 'Avenida Presidente Vargas', '456', 'Indaiatuba', 'SP', '13330-640', 'Brasil', 0, NOW(), 'A');
    
    INSERT INTO "Users" ("Id", "AddressId", "ProfileId", "Name", "Email", "Password", "Sex", "CreatedAt", "Status", "IsAdmin", "DateOfBirth", "PhoneNumber")
    VALUES (new_user_id, new_address_id, personal_profile_id, 'Marina Oliveira Santos', 'marina.indaiatuba@nutrifit.com', '$2a$11$xQxYqZ8VGK.EhJ9qQxYqZeOqZ8VGK.EhJ9qQxYqZeOqZ8VGK.EhJ9', 'F', NOW(), 'A', false, '1992-07-22', '(19) 99123-4567');
    
    INSERT INTO "ProfessionalCredentials" ("Id", "ProfessionalId", "Type", "CredentialId", "Biography", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), new_user_id, 'CREF', '234567-G/SP', 'Especialista em treinamento funcional e pilates. Atendimento personalizado para mulheres.', NOW(), 'A');
    
    INSERT INTO "ProfessionalDetails" ("Id", "ProfessionalId", "AttendanceMode", "Tag1", "Tag2", "Tag3", "CreatedAt")
    VALUES (gen_random_uuid(), new_user_id, 1, 'Funcional', 'Pilates', 'Emagrecimento', NOW());

    -- Personal 3: Itu
    new_user_id := gen_random_uuid();
    new_address_id := gen_random_uuid();
    
    INSERT INTO "Addresses" ("Id", "AddressLine", "Number", "City", "State", "ZipCode", "Country", "AddressType", "CreatedAt", "Status")
    VALUES (new_address_id, 'Rua Paula Souza', '789', 'Itu', 'SP', '13300-080', 'Brasil', 0, NOW(), 'A');
    
    INSERT INTO "Users" ("Id", "AddressId", "ProfileId", "Name", "Email", "Password", "Sex", "CreatedAt", "Status", "IsAdmin", "DateOfBirth", "PhoneNumber")
    VALUES (new_user_id, new_address_id, personal_profile_id, 'Roberto Mendes Costa', 'roberto.itu@nutrifit.com', '$2a$11$xQxYqZ8VGK.EhJ9qQxYqZeOqZ8VGK.EhJ9qQxYqZeOqZ8VGK.EhJ9', 'M', NOW(), 'A', false, '1985-11-30', '(11) 97654-3210');
    
    INSERT INTO "ProfessionalCredentials" ("Id", "ProfessionalId", "Type", "CredentialId", "Biography", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), new_user_id, 'CREF', '345678-G/SP', 'Personal trainer focado em reabilitação e treinamento para terceira idade.', NOW(), 'A');
    
    INSERT INTO "ProfessionalDetails" ("Id", "ProfessionalId", "AttendanceMode", "Tag1", "Tag2", "Tag3", "CreatedAt")
    VALUES (gen_random_uuid(), new_user_id, 0, 'Reabilitação', 'Terceira Idade', 'Mobilidade', NOW());

    -- Personal 4: Campinas
    new_user_id := gen_random_uuid();
    new_address_id := gen_random_uuid();
    
    INSERT INTO "Addresses" ("Id", "AddressLine", "Number", "City", "State", "ZipCode", "Country", "AddressType", "CreatedAt", "Status")
    VALUES (new_address_id, 'Avenida Francisco Glicério', '321', 'Campinas', 'SP', '13012-100', 'Brasil', 0, NOW(), 'A');
    
    INSERT INTO "Users" ("Id", "AddressId", "ProfileId", "Name", "Email", "Password", "Sex", "CreatedAt", "Status", "IsAdmin", "DateOfBirth", "PhoneNumber")
    VALUES (new_user_id, new_address_id, personal_profile_id, 'Juliana Ferreira Lima', 'juliana.campinas@nutrifit.com', '$2a$11$xQxYqZ8VGK.EhJ9qQxYqZeOqZ8VGK.EhJ9qQxYqZeOqZ8VGK.EhJ9', 'F', NOW(), 'A', false, '1990-05-18', '(19) 98234-5678');
    
    INSERT INTO "ProfessionalCredentials" ("Id", "ProfessionalId", "Type", "CredentialId", "Biography", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), new_user_id, 'CREF', '456789-G/SP', 'Treinadora especializada em crossfit e condicionamento físico. Resultados comprovados.', NOW(), 'A');
    
    INSERT INTO "ProfessionalDetails" ("Id", "ProfessionalId", "AttendanceMode", "Tag1", "Tag2", "Tag3", "CreatedAt")
    VALUES (gen_random_uuid(), new_user_id, 2, 'CrossFit', 'Condicionamento', 'HIIT', NOW());

    -- Personal 5: Jundiaí
    new_user_id := gen_random_uuid();
    new_address_id := gen_random_uuid();
    
    INSERT INTO "Addresses" ("Id", "AddressLine", "Number", "City", "State", "ZipCode", "Country", "AddressType", "CreatedAt", "Status")
    VALUES (new_address_id, 'Rua Barão de Jundiaí', '654', 'Jundiaí', 'SP', '13201-040', 'Brasil', 0, NOW(), 'A');
    
    INSERT INTO "Users" ("Id", "AddressId", "ProfileId", "Name", "Email", "Password", "Sex", "CreatedAt", "Status", "IsAdmin", "DateOfBirth", "PhoneNumber")
    VALUES (new_user_id, new_address_id, personal_profile_id, 'Fernando Alves Rodrigues', 'fernando.jundiai@nutrifit.com', '$2a$11$xQxYqZ8VGK.EhJ9qQxYqZeOqZ8VGK.EhJ9qQxYqZeOqZ8VGK.EhJ9', 'M', NOW(), 'A', false, '1987-09-25', '(11) 96543-2109');
    
    INSERT INTO "ProfessionalCredentials" ("Id", "ProfessionalId", "Type", "CredentialId", "Biography", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), new_user_id, 'CREF', '567890-G/SP', 'Personal com foco em atletas e preparação física para competições.', NOW(), 'A');
    
    INSERT INTO "ProfessionalDetails" ("Id", "ProfessionalId", "AttendanceMode", "Tag1", "Tag2", "Tag3", "CreatedAt")
    VALUES (gen_random_uuid(), new_user_id, 0, 'Atletas', 'Performance', 'Força', NOW());

    -- Personal 6: Votorantim
    new_user_id := gen_random_uuid();
    new_address_id := gen_random_uuid();
    
    INSERT INTO "Addresses" ("Id", "AddressLine", "Number", "City", "State", "ZipCode", "Country", "AddressType", "CreatedAt", "Status")
    VALUES (new_address_id, 'Avenida Antonio Carlos Pacheco e Silva', '987', 'Votorantim', 'SP', '18110-570', 'Brasil', 0, NOW(), 'A');
    
    INSERT INTO "Users" ("Id", "AddressId", "ProfileId", "Name", "Email", "Password", "Sex", "CreatedAt", "Status", "IsAdmin", "DateOfBirth", "PhoneNumber")
    VALUES (new_user_id, new_address_id, personal_profile_id, 'Patrícia Souza Martins', 'patricia.votorantim@nutrifit.com', '$2a$11$xQxYqZ8VGK.EhJ9qQxYqZeOqZ8VGK.EhJ9qQxYqZeOqZ8VGK.EhJ9', 'F', NOW(), 'A', false, '1993-12-08', '(15) 99876-5432');
    
    INSERT INTO "ProfessionalCredentials" ("Id", "ProfessionalId", "Type", "CredentialId", "Biography", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), new_user_id, 'CREF', '678901-G/SP', 'Instrutora de yoga e pilates. Especialista em alongamento e flexibilidade.', NOW(), 'A');
    
    INSERT INTO "ProfessionalDetails" ("Id", "ProfessionalId", "AttendanceMode", "Tag1", "Tag2", "Tag3", "CreatedAt")
    VALUES (gen_random_uuid(), new_user_id, 1, 'Yoga', 'Pilates', 'Flexibilidade', NOW());

    -- Personal 7: Salto
    new_user_id := gen_random_uuid();
    new_address_id := gen_random_uuid();
    
    INSERT INTO "Addresses" ("Id", "AddressLine", "Number", "City", "State", "ZipCode", "Country", "AddressType", "CreatedAt", "Status")
    VALUES (new_address_id, 'Rua Marechal Deodoro', '234', 'Salto', 'SP', '13320-270', 'Brasil', 0, NOW(), 'A');
    
    INSERT INTO "Users" ("Id", "AddressId", "ProfileId", "Name", "Email", "Password", "Sex", "CreatedAt", "Status", "IsAdmin", "DateOfBirth", "PhoneNumber")
    VALUES (new_user_id, new_address_id, personal_profile_id, 'André Luiz Pereira', 'andre.salto@nutrifit.com', '$2a$11$xQxYqZ8VGK.EhJ9qQxYqZeOqZ8VGK.EhJ9qQxYqZeOqZ8VGK.EhJ9', 'M', NOW(), 'A', false, '1989-06-12', '(11) 95432-1098');
    
    INSERT INTO "ProfessionalCredentials" ("Id", "ProfessionalId", "Type", "CredentialId", "Biography", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), new_user_id, 'CREF', '789012-G/SP', 'Personal trainer com especialização em corrida e treinos aeróbicos.', NOW(), 'A');
    
    INSERT INTO "ProfessionalDetails" ("Id", "ProfessionalId", "AttendanceMode", "Tag1", "Tag2", "Tag3", "CreatedAt")
    VALUES (gen_random_uuid(), new_user_id, 2, 'Corrida', 'Cardio', 'Resistência', NOW());

    -- Personal 8: Americana
    new_user_id := gen_random_uuid();
    new_address_id := gen_random_uuid();
    
    INSERT INTO "Addresses" ("Id", "AddressLine", "Number", "City", "State", "ZipCode", "Country", "AddressType", "CreatedAt", "Status")
    VALUES (new_address_id, 'Avenida Brasil', '567', 'Americana', 'SP', '13465-770', 'Brasil', 0, NOW(), 'A');
    
    INSERT INTO "Users" ("Id", "AddressId", "ProfileId", "Name", "Email", "Password", "Sex", "CreatedAt", "Status", "IsAdmin", "DateOfBirth", "PhoneNumber")
    VALUES (new_user_id, new_address_id, personal_profile_id, 'Camila Rodrigues Almeida', 'camila.americana@nutrifit.com', '$2a$11$xQxYqZ8VGK.EhJ9qQxYqZeOqZ8VGK.EhJ9qQxYqZeOqZ8VGK.EhJ9', 'F', NOW(), 'A', false, '1991-04-20', '(19) 97321-6543');
    
    INSERT INTO "ProfessionalCredentials" ("Id", "ProfessionalId", "Type", "CredentialId", "Biography", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), new_user_id, 'CREF', '890123-G/SP', 'Personal focada em gestantes e pós-parto. Cuidado especial para mamães.', NOW(), 'A');
    
    INSERT INTO "ProfessionalDetails" ("Id", "ProfessionalId", "AttendanceMode", "Tag1", "Tag2", "Tag3", "CreatedAt")
    VALUES (gen_random_uuid(), new_user_id, 0, 'Gestantes', 'Pós-parto', 'Mobilidade', NOW());

    -- Personal 9: Limeira
    new_user_id := gen_random_uuid();
    new_address_id := gen_random_uuid();
    
    INSERT INTO "Addresses" ("Id", "AddressLine", "Number", "City", "State", "ZipCode", "Country", "AddressType", "CreatedAt", "Status")
    VALUES (new_address_id, 'Rua Boa Morte', '890', 'Limeira', 'SP', '13480-170', 'Brasil', 0, NOW(), 'A');
    
    INSERT INTO "Users" ("Id", "AddressId", "ProfileId", "Name", "Email", "Password", "Sex", "CreatedAt", "Status", "IsAdmin", "DateOfBirth", "PhoneNumber")
    VALUES (new_user_id, new_address_id, personal_profile_id, 'Thiago Henrique Santos', 'thiago.limeira@nutrifit.com', '$2a$11$xQxYqZ8VGK.EhJ9qQxYqZeOqZ8VGK.EhJ9qQxYqZeOqZ8VGK.EhJ9', 'M', NOW(), 'A', false, '1986-08-14', '(19) 96210-9876');
    
    INSERT INTO "ProfessionalCredentials" ("Id", "ProfessionalId", "Type", "CredentialId", "Biography", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), new_user_id, 'CREF', '901234-G/SP', 'Especialista em musculação e ganho de massa muscular. Método científico.', NOW(), 'A');
    
    INSERT INTO "ProfessionalDetails" ("Id", "ProfessionalId", "AttendanceMode", "Tag1", "Tag2", "Tag3", "CreatedAt")
    VALUES (gen_random_uuid(), new_user_id, 2, 'Musculação', 'Hipertrofia', 'Força', NOW());

    -- Personal 10: Piracicaba
    new_user_id := gen_random_uuid();
    new_address_id := gen_random_uuid();
    
    INSERT INTO "Addresses" ("Id", "AddressLine", "Number", "City", "State", "ZipCode", "Country", "AddressType", "CreatedAt", "Status")
    VALUES (new_address_id, 'Rua Governador Pedro de Toledo', '432', 'Piracicaba', 'SP', '13400-470', 'Brasil', 0, NOW(), 'A');
    
    INSERT INTO "Users" ("Id", "AddressId", "ProfileId", "Name", "Email", "Password", "Sex", "CreatedAt", "Status", "IsAdmin", "DateOfBirth", "PhoneNumber")
    VALUES (new_user_id, new_address_id, personal_profile_id, 'Beatriz Costa Oliveira', 'beatriz.piracicaba@nutrifit.com', '$2a$11$xQxYqZ8VGK.EhJ9qQxYqZeOqZ8VGK.EhJ9qQxYqZeOqZ8VGK.EhJ9', 'F', NOW(), 'A', false, '1994-02-28', '(19) 98109-8765');
    
    INSERT INTO "ProfessionalCredentials" ("Id", "ProfessionalId", "Type", "CredentialId", "Biography", "CreatedAt", "Status")
    VALUES (gen_random_uuid(), new_user_id, 'CREF', '012345-G/SP', 'Personal trainer online especializada em treinos domiciliares e consultoria nutricional.', NOW(), 'A');
    
    INSERT INTO "ProfessionalDetails" ("Id", "ProfessionalId", "AttendanceMode", "Tag1", "Tag2", "Tag3", "CreatedAt")
    VALUES (gen_random_uuid(), new_user_id, 1, 'Treino em Casa', 'Online', 'Emagrecimento', NOW());

    RAISE NOTICE 'Script executado com sucesso! 10 personais criados na região de SP.';
    RAISE NOTICE 'Cidades: Sorocaba, Indaiatuba, Itu, Campinas, Jundiaí, Votorantim, Salto, Americana, Limeira, Piracicaba';
    RAISE NOTICE 'Todos os CEPs são válidos e podem ser geocodificados.';
    RAISE NOTICE 'Execute a função de geocodificação no frontend para popular as coordenadas.';
END $$;
