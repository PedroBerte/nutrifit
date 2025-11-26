-- Script para criar vínculo entre cliente e profissional
-- Cliente: 78071270-d8f0-431c-abd5-edf60aa286bf
-- Profissional: 04df4f7b-b9b1-4280-a059-7bbb631d3403

INSERT INTO "CustomerProfessionalBonds" (
    "Id",
    "CustomerId",
    "ProfessionalId",
    "SenderId",
    "CreatedAt",
    "UpdatedAt",
    "Status"
)
VALUES (
    gen_random_uuid(),                              -- Id gerado automaticamente
    '78071270-d8f0-431c-abd5-edf60aa286bf',        -- CustomerId
    '04df4f7b-b9b1-4280-a059-7bbb631d3403',        -- ProfessionalId
    '04df4f7b-b9b1-4280-a059-7bbb631d3403',        -- SenderId (profissional enviou o convite)
    NOW(),                                          -- CreatedAt
    NULL,                                           -- UpdatedAt
    'Accepted'                                      -- Status (Pending, Accepted, Rejected)
);

-- Para verificar se foi criado:
-- SELECT * FROM "CustomerProfessionalBonds" WHERE "CustomerId" = '78071270-d8f0-431c-abd5-edf60aa286bf';
