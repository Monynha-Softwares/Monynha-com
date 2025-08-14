-- Migration: enhance homepage feature rows with multilingual descriptions,
-- emojis and URLs.
--
-- This script adds additional columns to the `homepage_features_rows` table if
-- they are not present, and updates the existing four feature entries with
-- personalised copy and metadata.  The `title` column is used as the unique
-- identifier for each row.

BEGIN;

-- 1. Add new columns if they don't already exist
ALTER TABLE homepage_features_rows
    ADD COLUMN IF NOT EXISTS description_pt TEXT;

ALTER TABLE homepage_features_rows
    ADD COLUMN IF NOT EXISTS description_es TEXT;

ALTER TABLE homepage_features_rows
    ADD COLUMN IF NOT EXISTS description_fr TEXT;

ALTER TABLE homepage_features_rows
    ADD COLUMN IF NOT EXISTS emoji TEXT;

ALTER TABLE homepage_features_rows
    ADD COLUMN IF NOT EXISTS url TEXT;

-- 2. Update the feature rows with improved copy and metadata
UPDATE homepage_features_rows
SET
    description        = 'Core platform for building, running, and deploying applications.',
    description_pt     = 'Plataforma central para construir, executar e publicar aplicações.',
    description_es     = 'Plataforma central para crear, ejecutar y publicar aplicaciones.',
    description_fr     = 'Plateforme centrale pour créer, exécuter et déployer des applications.',
    emoji              = '🖥️🚀',
    url                = 'https://monynha.online'
WHERE title = 'Monynha Online';

UPDATE homepage_features_rows
SET
    description        = 'Community‑curated platform that preserves the internet’s best gems.',
    description_pt     = 'Plataforma de curadoria coletiva que preserva as melhores joias da internet.',
    description_es     = 'Plataforma de curaduría colectiva que preserva las mejores joyas de internet.',
    description_fr     = 'Plateforme de curation collective qui préserve les meilleures pépites du web.',
    emoji              = '🎬✨',
    url                = 'https://monynha.fun'
WHERE title = 'Monynha Fun';

UPDATE homepage_features_rows
SET
    description        = 'Our lab for experiments, deep dives, and cutting‑edge research.',
    description_pt     = 'Nosso laboratório para experimentos, artigos e pesquisa de ponta.',
    description_es     = 'Nuestro laboratorio para experimentos, artículos y investigación de punta.',
    description_fr     = 'Notre laboratoire pour les expériences, les articles et la recherche de pointe.',
    emoji              = '🧪🔬',
    url                = 'https://monynha.tech'
WHERE title = 'Monynha Tech';

UPDATE homepage_features_rows
SET
    description        = 'Identity and accounts hub with enterprise‑grade integrations.',
    description_pt     = 'Hub de identidade e contas com integrações corporativas.',
    description_es     = 'Centro de identidad y cuentas con integraciones de nivel empresarial.',
    description_fr     = 'Centre d’identité et de comptes avec des intégrations de niveau entreprise.',
    emoji              = '🛡️🔗',
    url                = 'https://monynha.me'
WHERE title = 'Monynha Me';

COMMIT;
