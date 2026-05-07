-- Backfill IPE fields for existing buildings.
-- Note: energy intensity ranking is not defined yet; we use a deterministic UUID order.

WITH target AS (
  -- Step 1: Identify the buildings needing IPE backfill.
  SELECT
    id_pg,
    usage_batiment,
    surface_that_requires_heating,
    annee_de_construction,
    hauteur
  FROM batiments_bdnb
  WHERE ipe_usage IS NULL
  ORDER BY
    CASE WHEN usage_batiment = 'industrial' THEN 0 ELSE 1 END,
    id_pg -- pour tester sur les bâtiments industriels en priorité,
  LIMIT 100000 -- batch de 100k bâtiments
),
legal_entities AS (
  -- Step 2: Fetch legal entities linked to the target buildings.
  SELECT
    t.id_pg AS location_id,
    p.id_pg AS legal_entity_uuid,
    p."activitePrincipale" AS naf_code_raw,
    p."trancheEffectifs" AS nb_employees_range,
    UPPER(TRIM(p."activitePrincipale")) AS naf_code
  FROM target t
  JOIN associations_batiments_bdnb_personne_morale a
    ON a.batiments_bdnb_id_pg = t.id_pg
  JOIN personne_morale p
    ON p.id_pg = a.personne_morale_id_pg
),
entities_enriched_base AS (
  -- Step 3: Enrich entities with normalized NAF categories.
  SELECT
    le.*,
    -- Aligns with nafToCategory().
    CASE
      WHEN le.naf_code IS NULL OR le.naf_code = '' THEN NULL
      WHEN le.naf_code LIKE '00.%' OR le.naf_code = '99.00Z' THEN 'TECHNIQUES_INDETERMINEES'
      WHEN le.naf_code LIKE '01.%' OR le.naf_code LIKE '02.%' OR le.naf_code LIKE '03.%' THEN 'EXPLOITATIONS_AGRICOLES_SITES_RURAUX'
      WHEN le.naf_code LIKE '05.%' OR le.naf_code LIKE '06.%' OR le.naf_code LIKE '07.%' OR le.naf_code LIKE '08.%' OR le.naf_code LIKE '09.%' THEN 'EXTRACTION_INDUSTRIES_PRIMAIRES'
      WHEN le.naf_code LIKE '10.%' OR le.naf_code LIKE '11.%' OR le.naf_code = '12.00Z' THEN 'INDUSTRIE_AGROALIMENTAIRE_BOISSONS'
      WHEN le.naf_code LIKE '13.%' OR le.naf_code LIKE '14.%' OR le.naf_code LIKE '15.%' OR le.naf_code LIKE '16.%' OR le.naf_code LIKE '17.%' OR le.naf_code LIKE '18.%' THEN 'INDUSTRIE_MANUFACTURIERE_LEGERE'
      WHEN le.naf_code LIKE '19.%' OR le.naf_code LIKE '20.%' OR le.naf_code LIKE '21.%' OR le.naf_code LIKE '22.%' OR le.naf_code LIKE '23.%' THEN 'INDUSTRIE_LOURDE_CHIMIE_MATERIAUX'
      WHEN le.naf_code LIKE '24.%' OR le.naf_code LIKE '25.%' THEN 'METALLURGIE_TRANSFORMATION_METAUX'
      WHEN le.naf_code LIKE '26.%' OR le.naf_code LIKE '27.%' OR le.naf_code LIKE '28.%' THEN 'INDUSTRIE_EQUIPEMENTS_MACHINES'
      WHEN le.naf_code LIKE '29.%' OR le.naf_code LIKE '30.%' THEN 'INDUSTRIE_TRANSPORT_MOBILITE'
      WHEN le.naf_code LIKE '31.%' OR le.naf_code LIKE '32.%' OR le.naf_code LIKE '33.%' OR le.naf_code LIKE '34.%' THEN 'INDUSTRIE_DIVERSE_MAINTENANCE'
      WHEN le.naf_code LIKE '35.%' OR le.naf_code LIKE '36.%' OR le.naf_code LIKE '37.%' OR le.naf_code LIKE '38.%' OR le.naf_code LIKE '39.%' OR le.naf_code LIKE '40.%' THEN 'ENERGIE_EAU_ENVIRONNEMENT'
      WHEN le.naf_code LIKE '41.%' OR le.naf_code LIKE '42.%' OR le.naf_code LIKE '43.%' OR le.naf_code LIKE '44.%' THEN 'BTP_TRAVAUX'
      WHEN le.naf_code LIKE '45.%' OR le.naf_code LIKE '46.%' OR le.naf_code LIKE '47.%' OR le.naf_code LIKE '48.%' THEN 'COMMERCE_DISTRIBUTION'
      WHEN le.naf_code LIKE '49.%' OR le.naf_code LIKE '50.%' OR le.naf_code LIKE '51.%' OR le.naf_code LIKE '52.%' OR le.naf_code LIKE '53.%' THEN 'TRANSPORT_LOGISTIQUE'
      WHEN le.naf_code LIKE '55.%' OR le.naf_code LIKE '56.%' OR le.naf_code LIKE '57.%' THEN 'HOTELLERIE_RESTAURATION'
      WHEN le.naf_code LIKE '58.%' OR le.naf_code LIKE '59.%' OR le.naf_code LIKE '60.%' OR le.naf_code LIKE '61.%' OR le.naf_code LIKE '62.%' OR le.naf_code LIKE '63.%' THEN 'BUREAUX_SERVICES_NUMERIQUES'
      WHEN le.naf_code LIKE '64.%' OR le.naf_code LIKE '65.%' OR le.naf_code LIKE '66.%' OR le.naf_code LIKE '67.%' THEN 'FINANCE_IMMOBILIER'
      WHEN le.naf_code LIKE '68.%' THEN 'GESTION_IMMOBILIERE'
      WHEN le.naf_code LIKE '69.%' OR le.naf_code LIKE '70.%' OR le.naf_code LIKE '71.%' OR le.naf_code LIKE '72.%' OR le.naf_code LIKE '73.%' OR le.naf_code LIKE '74.%' OR le.naf_code LIKE '75.%' OR le.naf_code LIKE '76.%' THEN 'SERVICES_PROFESSIONNELS'
      WHEN le.naf_code LIKE '77.%' OR le.naf_code LIKE '78.%' OR le.naf_code LIKE '79.%' OR le.naf_code LIKE '80.%' OR le.naf_code LIKE '81.%' OR le.naf_code LIKE '82.%' OR le.naf_code LIKE '83.%' THEN 'SERVICES_OPERATIONNELS_SUPPORT'
      WHEN le.naf_code LIKE '86.%' OR le.naf_code LIKE '87.%' OR le.naf_code LIKE '88.%' OR le.naf_code LIKE '89.%' THEN 'SECTEUR_MEDICO_SOCIAL'
      WHEN le.naf_code LIKE '84.%' OR le.naf_code LIKE '85.%' THEN 'SECTEUR_PUBLIC'
      WHEN le.naf_code LIKE '90.%' OR le.naf_code LIKE '91.%' OR le.naf_code LIKE '92.%' OR le.naf_code LIKE '93.%' OR le.naf_code LIKE '94.%' OR le.naf_code LIKE '95.%' OR le.naf_code LIKE '96.%' THEN 'CULTURE_SPORT_SERVICES_PERSONNE'
      ELSE NULL
    END AS naf_category
  FROM legal_entities le
),
entities_enriched AS (
  -- Step 4: Derive macro usage and sector score for each entity.
  SELECT
    base.*,
    -- Aligns with mapEntrepriseToUsage()/TERTIARY_NAF_CATEGORIES.
    CASE
      WHEN base.naf_category IN (
        'EXTRACTION_INDUSTRIES_PRIMAIRES',
        'INDUSTRIE_AGROALIMENTAIRE_BOISSONS',
        'INDUSTRIE_MANUFACTURIERE_LEGERE',
        'INDUSTRIE_LOURDE_CHIMIE_MATERIAUX',
        'METALLURGIE_TRANSFORMATION_METAUX',
        'INDUSTRIE_EQUIPEMENTS_MACHINES',
        'INDUSTRIE_TRANSPORT_MOBILITE',
        'INDUSTRIE_DIVERSE_MAINTENANCE',
        'ENERGIE_EAU_ENVIRONNEMENT'
      ) THEN 'industrial'
      WHEN base.naf_category IN (
        'COMMERCE_DISTRIBUTION',
        'BUREAUX_SERVICES_NUMERIQUES',
        'SERVICES_OPERATIONNELS_SUPPORT',
        'SERVICES_PROFESSIONNELS',
        'HOTELLERIE_RESTAURATION',
        'SECTEUR_PUBLIC',
        'SECTEUR_MEDICO_SOCIAL'
      ) THEN 'tertiary'
      ELSE 'other'
    END AS macro_usage,
    (base.nb_employees_range IS NOT NULL) AS has_known_employees,
    -- Aligns with IPE_SECTOR_SCORE_BY_NAF_CATEGORY.
    CASE base.naf_category
      WHEN 'TECHNIQUES_INDETERMINEES' THEN 0
      WHEN 'EXPLOITATIONS_AGRICOLES_SITES_RURAUX' THEN 4
      WHEN 'EXTRACTION_INDUSTRIES_PRIMAIRES' THEN 7
      WHEN 'INDUSTRIE_AGROALIMENTAIRE_BOISSONS' THEN 7
      WHEN 'INDUSTRIE_MANUFACTURIERE_LEGERE' THEN 5
      WHEN 'INDUSTRIE_LOURDE_CHIMIE_MATERIAUX' THEN 8
      WHEN 'METALLURGIE_TRANSFORMATION_METAUX' THEN 7
      WHEN 'INDUSTRIE_EQUIPEMENTS_MACHINES' THEN 6
      WHEN 'INDUSTRIE_TRANSPORT_MOBILITE' THEN 6
      WHEN 'INDUSTRIE_DIVERSE_MAINTENANCE' THEN 6
      WHEN 'ENERGIE_EAU_ENVIRONNEMENT' THEN 7
      WHEN 'BTP_TRAVAUX' THEN 4
      WHEN 'COMMERCE_DISTRIBUTION' THEN 4
      WHEN 'TRANSPORT_LOGISTIQUE' THEN 4
      WHEN 'HOTELLERIE_RESTAURATION' THEN 5
      WHEN 'BUREAUX_SERVICES_NUMERIQUES' THEN 2
      WHEN 'FINANCE_IMMOBILIER' THEN 2
      WHEN 'GESTION_IMMOBILIERE' THEN 2
      WHEN 'SERVICES_PROFESSIONNELS' THEN 2
      WHEN 'SERVICES_OPERATIONNELS_SUPPORT' THEN 3
      WHEN 'SECTEUR_MEDICO_SOCIAL' THEN 6
      WHEN 'SECTEUR_PUBLIC' THEN 3
      WHEN 'CULTURE_SPORT_SERVICES_PERSONNE' THEN 4
      ELSE 0
    END AS sector_score
  FROM entities_enriched_base base
),
counts AS (
  -- Step 5: Count total entities per building.
  SELECT
    t.id_pg,
    COUNT(le.legal_entity_uuid) AS total_companies
  FROM target t
  LEFT JOIN legal_entities le ON le.location_id = t.id_pg
  GROUP BY t.id_pg
),
candidates AS (
  -- Step 6: Mark which entities are eligible as reference candidates.
  SELECT
    e.*,
    t.usage_batiment,
    -- Aligns with selectReferenceCompanyFromEntities().
    CASE
      WHEN t.usage_batiment IS NULL THEN false
      WHEN t.usage_batiment::text IN ('industrial', 'tertiary') THEN e.macro_usage = t.usage_batiment::text
      ELSE e.naf_category IS NOT NULL AND e.naf_category NOT IN ('GESTION_IMMOBILIERE', 'FINANCE_IMMOBILIER')
    END AS is_candidate,
    CASE
      WHEN t.usage_batiment::text IN ('industrial', 'tertiary') THEN 'USAGE_MATCH'
      ELSE 'OTHER_EXCLUSION'
    END AS base_reason
  FROM target t
  LEFT JOIN entities_enriched e ON e.location_id = t.id_pg
),
candidate_stats AS (
  -- Step 7: Summarize candidate availability per building.
  SELECT
    location_id,
    COUNT(*) FILTER (WHERE is_candidate) AS candidate_count,
    MAX(CASE WHEN is_candidate AND has_known_employees THEN 1 ELSE 0 END) AS has_known_employees_candidate,
    MAX(base_reason) AS base_reason
  FROM candidates
  GROUP BY location_id
),
ranked_candidates AS (
  -- Step 8: Rank candidates to select a single reference company.
  SELECT
    c.*,
    -- Prefer known employees, then deterministic UUID order.
    ROW_NUMBER() OVER (
      PARTITION BY location_id
      ORDER BY
        CASE WHEN has_known_employees THEN 1 ELSE 0 END DESC,
        -- TODO: energy intensity ranking should replace UUID ordering.
        legal_entity_uuid ASC
    ) AS rn
  FROM candidates c
  WHERE c.is_candidate
),
selected AS (
  -- Step 9: Keep the top-ranked reference company per building.
  SELECT
    location_id,
    legal_entity_uuid AS reference_company_uuid,
    naf_category,
    macro_usage,
    nb_employees_range,
    sector_score,
    has_known_employees,
    base_reason
  FROM ranked_candidates
  WHERE rn = 1
),
computed AS (
  -- Step 10: Compute IPE usage, selection reasons, and score inputs.
  SELECT
    t.id_pg,
    t.usage_batiment,
    COALESCE(c.total_companies, 0) AS total_companies,
    COALESCE(cs.candidate_count, 0) AS candidate_count,
    COALESCE(cs.has_known_employees_candidate, 0) AS has_known_employees_candidate,
    COALESCE(cs.base_reason, 'OTHER_EXCLUSION') AS base_reason,
    s.reference_company_uuid,
    s.naf_category AS reference_naf_category,
    s.macro_usage AS reference_macro_usage,
    s."nb_employees_range",
    s."sector_score",
    -- Aligns with buildIpeUpdate() effective usage selection.
    CASE
      WHEN t.usage_batiment::text IN ('residential', 'tertiary', 'industrial') THEN t.usage_batiment::text
      WHEN s.macro_usage IN ('industrial', 'tertiary') THEN s.macro_usage
      ELSE 'tertiary'
    END AS effective_usage,
    -- Aligns with IPE_USAGE_REASON.
    CASE
      WHEN t.usage_batiment::text IN ('residential', 'tertiary', 'industrial') THEN 'BUILDING_USAGE'
      WHEN s.macro_usage IN ('industrial', 'tertiary') THEN 'REFERENCE_COMPANY'
      ELSE 'FALLBACK_TERTIARY'
    END AS ipe_usage_reason,
    -- Aligns with ReferenceCompanySelectionReason.
    CASE
      WHEN t.usage_batiment IS NULL THEN 'ERROR_NO_BUILDING_USAGE'
      WHEN COALESCE(c.total_companies, 0) = 0 THEN 'ERROR_NO_COMPANY'
      WHEN t.usage_batiment::text IN ('industrial', 'tertiary') AND COALESCE(cs.candidate_count, 0) = 0 THEN 'ERROR_NO_COMPANY_MATCHING_USAGE'
      WHEN t.usage_batiment::text IN ('residential', 'other') AND COALESCE(cs.candidate_count, 0) = 0 THEN 'NO_COMPANY_AFTER_EXCLUSION'
      WHEN COALESCE(cs.candidate_count, 0) = 1 THEN COALESCE(cs.base_reason, 'OTHER_EXCLUSION')
      WHEN COALESCE(cs.base_reason, 'OTHER_EXCLUSION') = 'USAGE_MATCH' THEN
        CASE
          WHEN COALESCE(cs.has_known_employees_candidate, 0) = 1 THEN 'USAGE_MATCH_PREFERRED_KNOWN_EMPLOYEES'
          ELSE 'USAGE_MATCH_FALLBACK_ENERGY_INTENSITY'
        END
      ELSE
        CASE
          WHEN COALESCE(cs.has_known_employees_candidate, 0) = 1 THEN 'OTHER_EXCLUSION_PREFERRED_KNOWN_EMPLOYEES'
          ELSE 'OTHER_EXCLUSION_FALLBACK_ENERGY_INTENSITY'
        END
    END AS selection_reason
  FROM target t
  LEFT JOIN counts c ON c.id_pg = t.id_pg
  LEFT JOIN candidate_stats cs ON cs.location_id = t.id_pg
  LEFT JOIN selected s ON s.location_id = t.id_pg
)
UPDATE batiments_bdnb b
SET
  -- Step 11: Persist computed IPE fields to the building table.
  ipe_usage = computed.effective_usage::ipe_usage_enum,
  ipe_usage_reason = computed.ipe_usage_reason,
  entreprise_reference_uuid = computed.reference_company_uuid,
  raison_selection_entreprise_reference = computed.selection_reason,
  score_brut_ipe = (
    -- IPE raw score (aligns with getIpeRawScore() and IPE_SCORE_WEIGHTS).
    -- usage score
    (
      -- Aligns with IPE_BUILDING_USAGE_SCORE.
      CASE computed.effective_usage
        WHEN 'residential' THEN 1
        WHEN 'tertiary' THEN 3
        WHEN 'industrial' THEN 5
        ELSE 0
      END
    ) * (
      -- Aligns with IPE_SCORE_WEIGHTS.usage.
      CASE computed.effective_usage
        WHEN 'residential' THEN 0.7
        WHEN 'tertiary' THEN 0.8
        WHEN 'industrial' THEN 0.9
        ELSE 0
      END
    )
    + (
      -- Aligns with IPE_SECTOR_SCORE_BY_NAF_CATEGORY and IPE_SCORE_WEIGHTS.sector.
      COALESCE(computed.sector_score, 0)
      * CASE computed.effective_usage
          WHEN 'residential' THEN 0
          WHEN 'tertiary' THEN 0.8
          WHEN 'industrial' THEN 0.9
          ELSE 0
        END
    )
    + (
      -- Aligns with scoreSurfaceThatRequiresHeating() and IPE_SCORE_WEIGHTS.surface.
      CASE
        WHEN b.surface_that_requires_heating IS NULL THEN 0
        WHEN b.surface_that_requires_heating < 500 THEN 0
        WHEN b.surface_that_requires_heating < 1500 THEN 1
        WHEN b.surface_that_requires_heating <= 5000 THEN 2
        WHEN b.surface_that_requires_heating <= 10000 THEN 3
        ELSE 4
      END
      * CASE computed.effective_usage
          WHEN 'residential' THEN 0.7
          WHEN 'tertiary' THEN 0.6
          WHEN 'industrial' THEN 0.7
          ELSE 0
        END
    )
    + (
      -- Aligns with scoreConstructionYear() and IPE_SCORE_WEIGHTS.constructionYear.
      CASE
        WHEN b.annee_de_construction IS NULL THEN 2
        WHEN EXTRACT(YEAR FROM b.annee_de_construction) >= 2015 THEN 0
        WHEN EXTRACT(YEAR FROM b.annee_de_construction) >= 2005 THEN 1
        WHEN EXTRACT(YEAR FROM b.annee_de_construction) >= 1990 THEN 2
        WHEN EXTRACT(YEAR FROM b.annee_de_construction) >= 1975 THEN 3
        ELSE 4
      END
      * CASE computed.effective_usage
          WHEN 'residential' THEN 1
          WHEN 'tertiary' THEN 0.6
          WHEN 'industrial' THEN 0.5
          ELSE 0
        END
    )
    + (
      -- Aligns with scoreBuildingHeight() and IPE_SCORE_WEIGHTS.height.
      CASE
        WHEN b.hauteur IS NULL THEN 0
        WHEN b.hauteur <= 3 THEN 0
        WHEN b.hauteur <= 6 THEN 1
        WHEN b.hauteur <= 9 THEN 2
        ELSE 3
      END
      * CASE computed.effective_usage
          WHEN 'residential' THEN 0.3
          WHEN 'tertiary' THEN 0.4
          WHEN 'industrial' THEN 0.6
          ELSE 0
        END
    )
    + (
      -- Aligns with scoreEmployeesRange() and IPE_SCORE_WEIGHTS.employees.
      CASE
        WHEN computed.nb_employees_range IS NULL THEN 1
        WHEN computed.nb_employees_range = '1 ou 2 salariés' THEN 0
        WHEN computed.nb_employees_range = '3 à 5 salariés' THEN 0
        WHEN computed.nb_employees_range = '6 à 9 salariés' THEN 0
        WHEN computed.nb_employees_range = '10 à 19 salariés' THEN 1
        WHEN computed.nb_employees_range = '20 à 49 salariés' THEN 1
        WHEN computed.nb_employees_range = '50 à 99 salariés' THEN 2
        WHEN computed.nb_employees_range = '100 à 199 salariés' THEN 2
        WHEN computed.nb_employees_range = '200 à 249 salariés' THEN 3
        WHEN computed.nb_employees_range = '250 à 499 salariés' THEN 3
        WHEN computed.nb_employees_range = '500 à 999 salariés' THEN 3
        WHEN computed.nb_employees_range = '1 000 à 1 999 salariés' THEN 4
        WHEN computed.nb_employees_range = '2 000 à 4 999 salariés' THEN 4
        WHEN computed.nb_employees_range = '5 000 à 9 999 salariés' THEN 4
        WHEN computed.nb_employees_range = '10 000 salariés et plus' THEN 4
        WHEN computed.nb_employees_range = '0 salarié' THEN 0
        WHEN computed.nb_employees_range = 'Unité non-employeuse' THEN 0
        ELSE 1
      END
      * CASE computed.effective_usage
          WHEN 'residential' THEN 0
          WHEN 'tertiary' THEN 0.2
          WHEN 'industrial' THEN 0.3
          ELSE 0
        END
    )
  )
FROM computed
WHERE b.id_pg = computed.id_pg;
