-- Migration: update personalised site copy with multilingual support.
--
-- This script creates (if necessary) and populates a simple table `site_copy` that
-- stores key/value pairs for various languages.  The primary key is `key` and
-- four language columns (`value_en`, `value_pt`, `value_es`, `value_fr`).
-- The texts below reflect a more personalised tone for Monynha Softwares.

BEGIN;

-- 1. Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_copy (
    key TEXT PRIMARY KEY,
    value_en TEXT NOT NULL,
    value_pt TEXT NOT NULL,
    value_es TEXT NOT NULL,
    value_fr TEXT NOT NULL
);

-- 2. Upsert personalised copy
INSERT INTO site_copy (key, value_en, value_pt, value_es, value_fr)
VALUES
    (
        'slogan',
        'Monynha Softwares: Technology with Pride, Diversity, and Resistance',
        'Monynha Softwares: Tecnologia com Orgulho, Diversidade e Resistência',
        'Monynha Softwares: Tecnología con Orgullo, Diversidad y Resistencia',
        'Monynha Softwares : Technologie avec Fierté, Diversité et Résistance'
    ),
    (
        'title',
        'Building the Future of Technology',
        'Construindo o Futuro da Tecnologia',
        'Construyendo el Futuro de la Tecnología',
        'Construire l’Avenir de la Technologie'
    ),
    (
        'subtitle',
        'Democratizing innovation through inclusive, accessible solutions that empower diverse communities and promote social equity.',
        'Democratizando a inovação com soluções inclusivas e acessíveis que capacitam comunidades diversas e promovem equidade social.',
        'Democratizando la innovación mediante soluciones inclusivas y accesibles que empoderan a comunidades diversas y promueven la equidad social.',
        'Démocratiser l’innovation grâce à des solutions inclusives et accessibles qui autonomisent des communautés diverses et favorisent l’équité sociale.'
    )
ON CONFLICT (key) DO UPDATE
SET
    value_en = EXCLUDED.value_en,
    value_pt = EXCLUDED.value_pt,
    value_es = EXCLUDED.value_es,
    value_fr = EXCLUDED.value_fr;

COMMIT;
