DO $$ BEGIN
 CREATE TYPE "public"."niveau_alea" AS ENUM('Faible', 'Moyen', 'Fort');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_energie_chauffage_appoint" AS ENUM('electricite', 'bois', 'gaz', 'fioul', 'charbon', 'gpl/butane/propane', 'reseau de chaleur');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."periode_construction_dpe" AS ENUM('avant 1948', '1948-1974', '1975-1977', '1978-1982', '1983-1988', '1989-2000', '2001-2005', '2006-2012', '2013-2021', 'après 2021');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_installation_ecs" AS ENUM('individuel', 'collectif');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."periode_construction_max" AS ENUM('AVANT_1949', 'DE_1949_A_1960', 'DE_1961_A_1974', 'DE_1975_A_1993', 'DE_1994_A_2000', 'DE_2001_A_2010', 'APRES_2010');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."materiaux_structure_mur" AS ENUM('autre_materiau_innovant_recent', 'autre_materiau_non_repertorie', 'autre_materiau_traditionnel_ancien', 'brique_terre_cuite_alveolaire', 'beton_cellulaire', 'cloison_platre', 'inconnu', 'monomur_terre_cuite', 'murs_bois_rondin', 'murs_blocs_beton_creux', 'murs_blocs_beton_pleins', 'murs_briques', 'murs_briques_creuses', 'murs_briques_doubles_lame_air', 'murs_briques_simples', 'murs_beton', 'murs_beton_banche', 'murs_beton_machefer', 'murs_ossature_bois_remplissage_2001_2005', 'murs_ossature_bois_remplissage_lt_2001', 'murs_ossature_bois_remplissage_ge_2006', 'murs_ossature_bois_tout_venant', 'murs_ossature_bois_sans_remplissage', 'murs_pan_bois_tout_venant', 'murs_pan_bois_sans_remplissage', 'murs_pierre', 'murs_pierre_taille_moellons_tout_venant', 'murs_pierre_taille_moellons_constitue', 'murs_pise_beton_terre', 'murs_sandwich_beton_isolant');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_association_pro_contact_externe_status" AS ENUM('NEW', 'IN_PROGRESS', 'CLOSED_WON', 'CLOSED_LOST', 'ARCHIVED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_association_pro_contact_externe" AS ENUM('SEARCHED', 'NONE', 'PHONE', 'MAIL', 'BOTH');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_batiment_dpe" AS ENUM('appartement', 'immeuble', 'maison');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."usage_batiment_enum" AS ENUM('residential', 'tertiary', 'industrial', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."origine_inscription_plateforme_client_enum" AS ENUM('Formulaire Onboarding Client');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."hs_pipeline_client_stage_enum" AS ENUM('2060166390', '3205209275', '2060166391', '2060167357', '2060167358', '2151154926', '2151154927', '2151154928', '2060167359');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_de_compte_enum" AS ENUM('Gestionnaire de copropriété ou syndic', 'Gestionnaire Immobilier', 'Santé', 'Hôtellerie_restauration', 'Propriétaire/Gestionnaire d''un établissement d''enseignement', 'Architecte/BET', 'Bureau d''étude', 'Professionnel du bâtiment', 'Autre', 'Prescripteur', 'Propriétaire exploitant', 'collectivité_publique', 'Compte démo 👀');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_de_poste_enum" AS ENUM('gestionnaire_actifs_immobilier', 'Architecte', 'directeur_responsable_technique', 'directeur_responsable_site', 'directeur_general_services', 'assistance_maitrise_ouvrage_interne', 'directeur_responsable_patrimoine', 'directeur_responsable_immobilier', 'responsable_travaux', 'directeur_clientele_syndic', 'directeur_responsable_maintenance', 'energy_manager', 'responsable_transition_energetique', 'AssetManager', 'responsable_RSE_ESG', 'analyste_immobilier', 'gestionnaire_copropriété / Syndic', 'Autre');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."origine_inscription_plateforme_contact_enum" AS ENUM('Formulaire Onboarding Client', 'Formulaire Onboarding Pro', 'Invitation par un Admin Pro');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."hs_pipeline_contact_stage_enum" AS ENUM('4431807719', 'subscriber', 'lead', '2055750850', '2055750851', '2055488722', '2055488723', '2055488724', '2055750853', '2055488726', '2060167406', '2653357243', '2124652755', '3326173431', '3753849053', '3828956398', '3755623615', '3831923939', '3753047281', '3755650257', '3753849054', '3834108126', '3832287480', '3831923940', '3679273165', '4026735816', '4059677933', '3896721638');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."operation_creee_par" AS ENUM('pro');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."operation_phase_enum" AS ENUM('1213338842', '1890531575', '3275647202', '694365148', '2031421667', '703741912', '705801954', '761117135', '836338411', 'appointmentscheduled', '2673571023', '1896500466', '689981135', '701687530', '675694020', '1467121872', '693123278', '693324987', '698025953', '693324995', '1500858581', '693570530', '1663340755', '693570531', '693570532', '1932423400', '2221683959', '693375989', '1306715322', '697959357', '697959364', '705701620');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."etiquette_dpe" AS ENUM('A', 'B', 'C', 'D', 'E', 'F', 'G');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_generateur_ecs" AS ENUM('ballon_accumulation_electrique', 'chaudiere_bois', 'chaudiere_charbon_standard', 'chaudiere_electrique', 'chaudiere_indetermine_bt', 'chaudiere_indetermine_cond', 'chaudiere_indetermine_indetermine', 'chaudiere_indetermine_std', 'chaudiere_fioul_bt', 'chaudiere_fioul_cond', 'chaudiere_fioul_std', 'chaudiere_gaz_bt', 'chaudiere_gaz_cond', 'chaudiere_gaz_std', 'chaudiere_gpl_bt', 'chaudiere_gpl_cond', 'chaudiere_gpl_std', 'chauffe_eau_electrique_instantane', 'chauffe_eau_fioul_independant', 'chauffe_eau_gaz_independant', 'chauffe_eau_gpl_independant', 'chauffe_eau_indetermine', 'ecs_autre_indetermine', 'ecs_bois_indetermine', 'ecs_solaire', 'ecs_thermodynamique_electrique', 'production_mixte_indetermine', 'reseau_chaleur');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."legal_entity_employee_range" AS ENUM('1 ou 2 salariés', '3 à 5 salariés', '6 à 9 salariés', '10 à 19 salariés', '20 à 49 salariés', '50 à 99 salariés', '100 à 199 salariés', '200 à 249 salariés', '250 à 499 salariés', '500 à 999 salariés', '1 000 à 1 999 salariés', '2 000 à 4 999 salariés', '5 000 à 9 999 salariés', '10 000 salariés et plus', '0 salarié', 'Unité non-employeuse');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_d_energie_enum" AS ENUM('Gaz', 'Electrique', 'Fioul', 'Géothermie', 'Biomasse', 'Autres', 'reseau de chaleur');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."enrichment_status" AS ENUM('CREATED', 'IN_PROGRESS', 'CANCELED', 'CREDITS_INSUFFICIENT', 'FINISHED', 'RATE_LIMIT', 'UNKNOWN', 'FAKE_ENRICH');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."contact_externe_source" AS ENUM('pappers', 'hunter', 'hunter_group', 'societe_info');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."contact_externe_seniorite" AS ENUM('junior', 'senior', 'executive', 'MANDATAIRE', 'DIRIGEANT', 'GERANT', 'DIRECTEUR', 'RESPONSABLE', 'ASSIST', 'COLLAB', 'AUTRE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."contact_externe_type" AS ENUM('personal', 'generic');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."departements_de_france_enum" AS ENUM('1 - Ain', '2 - Aisne', '3 - Allier', '4 - Alpes de Haute-Provence', '5 - Hautes-Alpes', '6 - Alpes-Maritimes', '7 - Ardêche', '8 - Ardennes', '9 - Ariège', '10 - Aube', '11 - Aude', '12 - Aveyron', '13 - Bouches-du-Rhône', '14 - Calvados', '15 - Cantal', '16 - Charente', '17 - Charente-Maritime', '18 - Cher', '19 - Corrèze', '2A - Corse-du-Sud', '2B - Haute-Corse', '21 - Côte-d''Or', '22 - Côtes d''Armor', '23 - Creuse', '24 - Dordogne', '25 - Doubs', '26 - Drôme', '27 - Eure', '28 - Eure-et-Loir', '29 - Finistère', '30 - Gard', '31 - Haute-Garonne', '32 - Gers', '33 - Gironde', '34 - Hérault', '35 - Îlle-et-Vilaine', '36 - Indre', '37 - Indre-et-Loire', '38 - Isère', '39 - Jura', '40 - Landes', '41 - Loir-et-Cher', '42 - Loire', '43 - Haute-Loire', '44 - Loire-Atlantique', '45 - Loiret', '46 - Lot', '47 - Lot-et-Garonne', '48 - Lozère', '49 - Maine-et-Loire', '50 - Manche', '51 - Marne', '52 - Haute-Marne', '53 - Mayenne', '54 - Meurthe-et-Moselle', '55 - Meuse', '56 - Morbihan', '57 - Moselle', '58 - Nièvre', '59 - Nord', '60 - Oise', '61 - Orne', '62 - Pas-de-Calais', '63 - Puy-de-Dôme', '64 - Pyrénées-Atlantiques', '65 - Hautes-Pyrénées', '66 - Pyrénées-Orientales', '67 - Bas-Rhin', '68 - Haut-Rhin', '69 - Rhône', '70 - Haute-Saône', '71 - Saône-et-Loire', '72 - Sarthe', '73 - Savoie', '74 - Haute-Savoie', '75 - Paris', '76 - Seine-Maritime', '77 - Seine-et-Marne', '78 - Yvelines', '79 - Deux-Sèvres', '80 - Somme', '81 - Tarn', '82 - Tarn-et-Garonne', '83 - Var', '84 - Vaucluse', '85 - Vendée', '86 - Vienne', '87 - Haute-Vienne', '88 - Vosges', '89 - Yonne', '90 - Territoire-de-Belfort', '91 - Essonne', '92 - Hauts-de-Seine', '93 - Seine-Saint-Denis', '94 - Val-de-Marne', '95 - Val-d''Oise');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_vitrage" AS ENUM('double vitrage', 'simple vitrage', 'triple vitrage', 'survitrage', 'brique de verre ou polycarbonate');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."anciennete_generateur_chauffage" AS ENUM('ancien', 'neuf', 'récent(<15ans)', 'très ancien');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_de_chauffage_enum" AS ENUM('Non connu', 'Individuel', 'Collectif chaufferie', 'Collectif urbain', 'collectif', 'Autre');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_generateur_chauffage" AS ENUM('chaudiere_bois', 'chaudiere_charbon_condensation', 'chaudiere_charbon_standard', 'chaudiere_electrique', 'chaudiere_indetermine_bt', 'chaudiere_indetermine_cond', 'chaudiere_indetermine_indetermine', 'chaudiere_indetermine_std', 'chaudiere_fioul_bt', 'chaudiere_fioul_cond', 'chaudiere_fioul_std', 'chaudiere_gaz_bt', 'chaudiere_gaz_cond', 'chaudiere_gaz_std', 'chaudiere_gpl_bt', 'chaudiere_gpl_cond', 'chaudiere_gpl_std', 'chauffage_autre_indetermine', 'chauffage_bois_indetermine', 'chauffage_solaire', 'generateur_air_chaud_combustion', 'generateurs_effet_joule', 'pac_air_air', 'pac_air_eau', 'pac_eau_eau', 'pac_geothermique', 'pac_indetermine', 'poele_insert_bois', 'poele_insert_charbon', 'poele_insert_fioul', 'poele_insert_gpl', 'poele_insert_indetermine', 'radiateurs_gaz', 'reseau_chaleur');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_isolation" AS ENUM('non isole', 'isole', 'ITI', 'ITE', 'ITR', 'inconnu');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."hs_invoice_pipeline_stage_enum" AS ENUM('2151961797', '2151961798', '2151600352', '2151600353', '2151600354', '2151600355', '2151600356', '2151600357', '2151600358', '2151600359', '2151600360', '2151600361', '2151600362', '2151600363', '2484244729', '2528054478');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."ipe_usage_enum" AS ENUM('residential', 'tertiary', 'industrial');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_personne_morale_enum" AS ENUM('public', 'copro', 'tertiaire');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."mail_provider_enum" AS ENUM('google', 'microsoft');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."prestation_enum" AS ENUM('DPE', 'DPE COLLECTIF + PPT', 'AUDIT ENERGÉTIQUE', 'DTG', 'DTG + PPT', 'OPERAT', 'ISOLATION DES COMBLES', 'ISOLATION TOITURES TERRASSES', 'ISOLATION TOITURES INCLINÉES', 'ITE', 'ISOLATION PLANCHER', 'FENETRES', 'REVET RÉFLECTIF', 'CHAUDIERE HPE', 'Chaufferie - Système de récupération de chaleur', 'POMPE A CHALEUR', 'VENTILATION DOUBLE FLUX', 'VENTILATION SIMPLE FLUX', 'VENTILO CONVECTEUR', 'DESTRATIFICATION DE L''AIR', 'CALORIFUGEAGE', 'BALLON THERMODYNAMIQUE', 'POINTS SINGULIERS', 'EQUILIBRAGE', 'ROBINET THERMOSTATIQUE', 'CHAUDIÈRE BIOMASSE', 'OPTIMISEUR DE RELANCE EN CHAUFFAGE COLLECTIF', 'DÉSEMBOUAGE', 'GTB', 'GTC', 'LED', 'LUMIÈRE EXTÉRIEURE', 'PANNEAUX SOLAIRES', 'RECUP CHALEUR EAUX GRISES', 'SYSTÈMES HYDRO-ECONOMES', 'RECUP CHALEUR TOUR AERO', 'RÉNOVATION GLOBALE', 'Architecte - Rénovation Globale', 'CONTRAT ELECTRICITE', 'CONTRAT GAZ', 'Curage canalisation', 'Installation / remplacement système de désemfumage', 'Contractant Général - Rénovation Globale', 'Diagnostic - installation électrique', 'Diagnostic - sécurité incendie', 'Diagnostic - humidité / infiltration / remontées capillaires', 'Diagnostic - Amiante (DTA)', 'Diagnostic - Chaufferie', 'Diagnostic - Plomb (CREP)', 'Diagnostic - Termites/Parasites', 'Diagnostic - Structure', 'Chaudière Electrique', 'Raccordement réseau de chaleur urbain', 'Mise en conformité électrique des parties communes', 'Réfection ou mise aux normes des installations gaz', 'Installation de bornes de recharge électrique pour véhicules', 'Refection de la toiture (hors isolation)', 'Réparation ou reprise de charpente', 'Réfection ou ravalement de façades (hors ITE)', 'Réfection des balcons / garde-corps', 'Traitement des fissures structurelles', 'Traitement de l''humidité des murs', 'Étanchéité ou réfection de toitures terrasses', 'Réfection ou remplacement des colonnes montantes', 'Panneaux solaires - Leasing');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."pro_status_enum" AS ENUM('Invitation envoyée', 'Onboarding plateforme', 'inscription_plateforme_autonome', 'En attente de signature plateforme', 'Compte en attente de validation', 'Actif', 'Inactif', 'Out');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."pro_subscription_enum" AS ENUM('Free', 'Impact', 'Impaye', 'Growth', 'Pro', 'Propulse', 'Essentiel', 'Résilié');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."hs_pipeline_stage_enum" AS ENUM('2632767713', '2269458679', '694626784', '674210003', '712508645', '702310850', '1135917303', '712519380', '698849526');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."materiau_toit" AS ENUM('ARDOISES', 'AUTRES', 'TUILES', 'INDETERMINE', 'BETON', 'ZINC ALUMINIUM');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."secteur_enum" AS ENUM('resi', 'ter', 'indu', 'Résidentiel collectif', 'Autre');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_fermeture" AS ENUM('fermeture_isolee_sans_ajours', 'fermeture_sans_ajours', 'jalousie_accordeon', 'lames_orientables_metal', 'volets_ou_persiennes_ajours_fixes', 'persienne_ou_volet_pvc', 'volet_bois_epais', 'volet_bois_fin', 'volet_roulant_pvc_epais', 'volet_roulant_pvc_fin', 'absence_fermeture_baie');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."token_enum" AS ENUM('placeholder');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_ventilation" AS ENUM('extracteur_conduit_non_modifie', 'puits_canadien', 'entrees_air_hautes_basses', 'ventilation_hybride', 'hybride_entrees_hygro', 'vm_auto', 'vm_auto_post82', 'vm_auto_pre82', 'vm_double_flux_echangeur', 'vm_double_flux_sans_echangeur', 'vm_gaz_hygro', 'vm_extraction_entrees_hygro', 'vm_extraction_hygro', 'ventilation_conduit', 'ventilation_conduit_entrees_hygro', 'ouverture_fenetres');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."materiau_mur" AS ENUM('AGGLOMERE', 'AUTRES', 'BETON', 'BOIS', 'BRIQUES', 'MEULIERE', 'PIERRE', 'INDETERMINE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."type_materiaux_menuiserie" AS ENUM('autres', 'bois', 'pvc', 'métal', 'métal avec rupture de pont thermique', 'métal sans rupture de pont thermique', 'brique de verre', 'polycarbonate');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProspectionHistoriqueLeads" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pro_id_pg" uuid NOT NULL,
	"batiments_bdnb_id_pg" uuid NOT NULL,
	"contact_externe_recommande_id_pg" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_prospection_historique_leads_pro_location" UNIQUE("pro_id_pg","batiments_bdnb_id_pg")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProspectionParametres" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pro_id_pg" uuid NOT NULL,
	"contact_reception_id_pg" uuid,
	"nombre_de_leads_a_generer" integer,
	"frequence_envoi_par_semaine" integer,
	"dernier_envoi_at" timestamp,
	"usage_batiment" usage_batiment_enum[],
	"nb_personne_morale_par_batiment" real[],
	"trancheEffectifs" legal_entity_employee_range[],
	"departement" departements_de_france_enum[],
	"type_batiment_naf" text[],
	"secteur" secteur_enum[],
	"adresse" text,
	"dans_qpv" boolean,
	"nb_batiment_groupe_related" real[],
	"nombre_de_batiments" real[],
	"statut_occupation_batiment" text[],
	"date_construction" date[],
	"periode_construction_max" periode_construction_max[],
	"type_energie" type_d_energie_enum[],
	"annual_electricity_consumption" real[],
	"type_de_chauffage" type_de_chauffage_enum[],
	"classe_dpe" text[],
	"nombre_de_lots" real[],
	"nombre_de_places_de_parking" real[],
	"surface_habitable_logement" real[],
	"accessible_pmr" boolean,
	"type_vitrage" type_vitrage[],
	"type_isolation_mur_exterieur" type_isolation[],
	"type_isolation_plancher_bas" type_isolation[],
	"type_isolation_plancher_haut" type_isolation[],
	"surface_au_sol" real[],
	"surface_habitable" real[],
	"surface_that_requires_heating" real[],
	"nombre_d_etages" real[],
	"surface_vitree" real[],
	"dpe_fiabilise" boolean,
	"classe_inertie" text[],
	"nombre_de_logements" real[],
	"type_generateur_chauffage" type_generateur_chauffage[],
	"presence_climatisation" boolean,
	"type_ventilation" type_ventilation[],
	"type_generateur_ecs" type_generateur_ecs[],
	"classe_ges" text[],
	"date_etablissement_dpe" date[],
	"conso_elec_par_m2" real[],
	"ges_par_m2" real[],
	"types_personne_morale" text[],
	"activite_tertiaire" text[],
	"nombre_de_locaux" real[],
	"type_personne_morale" type_personne_morale_enum[],
	"ipe_usage_reason" text[],
	"ipe_normalized_score" real[],
	"forme_juridique" text[],
	"activite_principale" text[],
	"domaine_activite_contact" text[],
	"niveau_hierarchique_contact" text[],
	"nom" text,
	"code_postal" text,
	"departement_personne_morale" departements_de_france_enum[],
	"hauteur" real[],
	"presence_balcon" boolean,
	"plusieurs_facades_exposees" boolean,
	"type_energie_chauffage_appoint" type_energie_chauffage_appoint[],
	"chauffage_solaire" boolean,
	"ecs_solaire" boolean,
	"materiau_mur" materiau_mur[],
	"materiau_toit" materiau_toit[],
	CONSTRAINT "ProspectionParametres_pro_id_pg_unique" UNIQUE("pro_id_pg")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_batiments_externes_pro" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pro_id" varchar,
	"batiments_id" varchar,
	"pro_id_pg" uuid,
	"batiments_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_personne_morale_contact_externe" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"personne_morale_id_pg" uuid,
	"contact_externe_id_pg" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_batiments_bdnb_personne_morale" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batiments_bdnb_id_pg" uuid,
	"personne_morale_id_pg" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_pros_contact_externe" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pro_id_pg" uuid NOT NULL,
	"contact_externe_id_pg" uuid NOT NULL,
	"type_association" "type_association_pro_contact_externe" NOT NULL,
	"statut_association" "type_association_pro_contact_externe_status" DEFAULT 'NEW' NOT NULL,
	"cree_le" timestamp DEFAULT now() NOT NULL,
	"mis_a_jour_le" timestamp,
	"ajoute_par_contact_id_pg" uuid,
	CONSTRAINT "uq_associations_pros_contact_externe_pro_contact" UNIQUE("pro_id_pg","contact_externe_id_pg")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_pros_personne_morale" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pros_id_pg" uuid,
	"personne_morale_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
-- auth.users is managed by Supabase Auth, skipping creation
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "personne_morale_corrompue" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batiment_groupe_id" text,
	"nom" text,
	"raw_data" jsonb,
	"raison" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "enrichissements" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"personne_morale_id_pg" uuid NOT NULL,
	"enrichissement_id" text,
	"statut" "enrichment_status" NOT NULL,
	"contacts" text[],
	"depend_de" text[],
	"commence_le" timestamp,
	"pro_id_pg" uuid,
	"contact_id_pg" uuid,
	CONSTRAINT "enrichissements_enrichissement_id_unique" UNIQUE("enrichissement_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contact_externe" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" text,
	"prenom" text,
	"nom" text,
	"adresse_courriel" text,
	"telephone" text,
	"url_linkedin" text,
	"url_twitter" text,
	"confidence_score" real,
	"type" "contact_externe_type",
	"indisponible_pour_fullenrich" boolean DEFAULT false,
	"mail_indisponible_pour_fullenrich" boolean DEFAULT false,
	"telephone_indisponible_pour_fullenrich" boolean DEFAULT false,
	"derniere_recuperation_pour_fullenrich" timestamp,
	"source" "contact_externe_source" DEFAULT 'pappers' NOT NULL,
	"seniorite" "contact_externe_seniorite",
	"societe_info_id" text,
	"departement" text,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geom_groupe" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batiment_groupe_id" text,
	"geom_groupe" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_batiments_notes" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batiments_id" varchar,
	"notes_id" varchar,
	"batiments_id_pg" uuid,
	"notes_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_deal_financeurs" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" varchar,
	"deal_id_pg" uuid,
	"financeur_id" varchar,
	"financeur_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_deal_factures" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" varchar,
	"facture_id" varchar,
	"deal_id_pg" uuid,
	"facture_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_notes_deal" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" varchar,
	"notes_id" varchar,
	"deal_id_pg" uuid,
	"notes_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_clients_pro" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pro_id" varchar,
	"pro_id_pg" uuid,
	"client_id" varchar,
	"client_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_batiments_pro" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pro_id" varchar,
	"batiments_id" varchar,
	"pro_id_pg" uuid,
	"batiments_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_notes_pro" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pro_id" varchar,
	"pro_id_pg" uuid,
	"notes_id" varchar,
	"notes_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_batiments_favoris_pro" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pro_id_pg" uuid,
	"batiments_id_pg" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_contact_clients" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" varchar,
	"clients_id" varchar,
	"contact_id_pg" uuid,
	"clients_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_contact_batiments" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batiments_id" varchar,
	"contact_id" varchar,
	"batiments_id_pg" uuid,
	"contact_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_contact_deal" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" varchar,
	"contact_id" varchar,
	"deal_id_pg" uuid,
	"contact_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_contact_pro" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" varchar,
	"pro_id" varchar,
	"contact_id_pg" uuid,
	"pros_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_batiments_clients" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batiments_id" varchar,
	"clients_id" varchar,
	"batiments_id_pg" uuid,
	"clients_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_deal_client" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" varchar,
	"client_id" varchar,
	"deal_id_pg" uuid,
	"client_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_deal_batiments" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" varchar,
	"batiments_id" varchar,
	"deal_id_pg" uuid,
	"batiments_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_deal_pros" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" varchar,
	"pro_id" varchar,
	"deal_id_pg" uuid,
	"pro_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_deal_devis" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" varchar,
	"devis_id" varchar,
	"deal_id_pg" uuid,
	"devis_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_devis_clients" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"devis_id" varchar,
	"client_id" varchar,
	"devis_id_pg" uuid,
	"client_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_devis_batiments" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"devis_id" varchar,
	"batiments_id" varchar,
	"devis_id_pg" uuid,
	"batiments_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_devis_notes" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"devis_id" varchar,
	"notes_id" varchar,
	"devis_id_pg" uuid,
	"notes_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "associations_devis_pros" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"devis_id" varchar,
	"pro_id" varchar,
	"devis_id_pg" uuid,
	"pro_id_pg" uuid,
	"association_type_id" integer NOT NULL,
	"association_label" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hs_attachments" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar,
	"name" text,
	"url" text,
	"createdAt" timestamp,
	"updatedAt" timestamp,
	"archived" boolean DEFAULT false,
	"path" text,
	"parentFolderId" text,
	"defaultHostingUrl" text,
	"type" text,
	"size" integer,
	"extension" text,
	CONSTRAINT "hs_attachments_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clients" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar,
	"nom" text,
	"type" varchar,
	"site_web" text,
	"hubspot_owner_id" text,
	"hubspot_owner_csm_id" text,
	"adresse_de_facturation" text,
	"code_postal_de_facturation" text,
	"ville_de_facturation" text,
	"siret" text,
	"type_de_compte" "type_de_compte_enum",
	"hs_pipeline_stage" "hs_pipeline_client_stage_enum",
	"origine_inscription_plateforme" "origine_inscription_plateforme_client_enum",
	"utm_term" text,
	"utm_medium" text,
	"utm_source" text,
	"utm_content" text,
	"utm_campaign" text,
	"telephone" text,
	CONSTRAINT "clients_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contacts" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar,
	"email" text,
	"firstname" text,
	"lastname" text,
	"jobtitle" text,
	"type_de_poste" "type_de_poste_enum",
	"secteur_activite" text,
	"phone" text,
	"photo" text,
	"company" text,
	"otp" text,
	"user_id" uuid,
	"lifecyclestage" "hs_pipeline_contact_stage_enum",
	"origine_inscription_plateforme" "origine_inscription_plateforme_contact_enum",
	"utm_term" text,
	"utm_medium" text,
	"utm_source" text,
	"utm_content" text,
	"utm_campaign" text,
	"date_invitation" timestamp,
	"date_creation" timestamp DEFAULT now(),
	"derniere_connexion" timestamp,
	CONSTRAINT "contacts_id_unique" UNIQUE("id"),
	CONSTRAINT "contacts_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "financeurs" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar,
	"nom" text,
	"siret" text,
	CONSTRAINT "financeurs_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "factures" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar,
	"nom" text,
	"stage" "hs_invoice_pipeline_stage_enum",
	CONSTRAINT "factures_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "batiments" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar,
	"nom" text NOT NULL,
	"numero_de_la_rue" text,
	"nom_de_la_rue" text,
	"url_vue_rue" text,
	"code_postal__new_" text,
	"departement" "departements_de_france_enum",
	"ville" text NOT NULL,
	"source_address" text,
	"raw_bdnb" jsonb,
	"secteur" "secteur_enum",
	"nombre_de_batiments" real,
	"nombre_de_lots" real,
	"m2" real,
	"facade_area" real,
	"glazing_area" real,
	"surface_that_requires_heating" real,
	"nombre_d_etages" real,
	"pourcentage_de_surface_vitree" real,
	"hauteur" real,
	"type_d_energie" "type_d_energie_enum",
	"type_de_chauffage" "type_de_chauffage_enum",
	"consommation_electrique_par_m2" real,
	"emission_gaz_a_effet_de_serre_par_m2" real,
	"geom_groupe" jsonb,
	"annee_de_construction" date,
	"nom_du_contact_sur_site" text,
	"telephone_du_contact_sur_site" text,
	"generateur_de_chauffage" text,
	"etiquette_dpe" text,
	"echec_bdnb" boolean,
	"google_place_id" text,
	"longitude" real,
	"latitude" real,
	"hauteur_mean" real,
	"classe_inertie" text,
	"presence_balcon" boolean,
	"nb_log" real,
	"nb_log_rnc" real,
	"nb_lot_tertiaire_rnc" real,
	"nb_pdl_res_dle_elec_2020" real,
	"nb_pdl_pro_dle_elec_2020" real,
	"nb_pdl_pro_dle_gaz_2020" real,
	"nb_pdl_res_dle_gaz_2020" real,
	"classe_bilan_dpe" text,
	"arrete_2021" boolean,
	"identifiant_dpe" text,
	"emission_ges_5_usages_m2" real,
	"emission_ges_3_usages_ep_m2_arrete_2012" real,
	"type_ventilation" text,
	"type_generateur_climatisation" text,
	"type_generateur_climatisation_anciennete" text,
	"type_isolation_mur_exterieur" text,
	"u_mur_exterieur" real,
	"type_isolation_plancher_bas" text,
	"type_isolation_plancher_haut" text,
	"u_plancher_bas_final_deperditif" real,
	"u_plancher_haut_deperditif" real,
	"type_vitrage" text,
	"type_materiaux_menuiserie" text,
	"type_gaz_lame" text,
	"type_fermeture" text,
	"vitrage_vir" boolean,
	"u_baie_vitree" real,
	"facteur_solaire_baie_vitree" real,
	"conso_pro_dle_elec_2020" real,
	"conso_res_dle_elec_2020" real,
	"conso_pro_dle_gaz_2020" real,
	"conso_res_dle_gaz_2020" real,
	"id_reseau" text,
	"alea_radon" text,
	"alea_argiles" text,
	"quartier_prioritaire" boolean,
	"nom_quartier_qpv" text,
	"code_qp" text,
	CONSTRAINT "batiments_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notes" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar,
	"hs_created_by_user_id" varchar,
	"hs_attachment_ids" varchar,
	"hs_object_source" varchar,
	"hs_createdate" timestamp,
	CONSTRAINT "notes_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "deals" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar,
	"createdate" date,
	"dealname" text,
	"prestations" "prestation_enum",
	"dealstage" text,
	"amount_ttc" real,
	"financements" real,
	"cout_estime" real,
	"financement_estime" real,
	"impact_energetique_estime" real,
	"consommation_electrique_avant" real,
	"emission_gaz_a_effet_de_serre_avant" real,
	"type" text,
	"categorie_d_operation" text,
	"date_de_lancement" date,
	"date_de_lancement_previsionnelle" date,
	"date_de_fin_prevue" date,
	"commentaires_client_plateforme" text,
	"budget_disponible" real,
	"bot_brief" jsonb,
	"hubspot_owner_id" text,
	"hubspot_owner_csm_id" text,
	"budget_previsionnel" text,
	"montant_solde_a_facturer" real,
	"numero_appel_de_provision_sdc" text,
	"date_envoi_appel_de_provision_sdc" date,
	"date_expiration_appel_de_provision_sdc" date,
	"montant_d_acompte_a_facturer" real,
	"numero_appel_de_provision_acompte" text,
	"date_envoi_appel_de_provision_acompte" date,
	"date_expiration_appel_de_provision_acompte" date,
	"date_de_fermeture" timestamp,
	"signatory_email" text,
	"signatory_firstname" text,
	"signatory_lastname" text,
	"signatory_phone" text,
	"signatory_jobtitle" text,
	"operation_creee_par" "operation_creee_par",
	"issue_de_dtg" boolean DEFAULT false NOT NULL,
	CONSTRAINT "deals_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "owners" (
	"stacksync_record_id_f3zges" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar NOT NULL,
	"email" text NOT NULL,
	"firstname" text,
	"lastname" text,
	"userid" varchar,
	"createdat" timestamp,
	"updatedat" timestamp,
	"archived" boolean DEFAULT false,
	"teams" varchar[],
	CONSTRAINT "owners_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pros" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar,
	"nom" text,
	"status" "pro_status_enum",
	"compte_de_test" boolean DEFAULT false NOT NULL,
	"siren" text,
	"siret" text,
	"adresse_de_facturation" text,
	"code_postal_de_facturation" text,
	"ville_de_facturation" text,
	"mail_du_contact_principal" text,
	"description" text,
	"zones_intervention" text,
	"site_internet" text,
	"email_entreprise" text,
	"departements_d_intervention" text,
	"domaines_d_intervention" text,
	"site_web" text,
	"offres" text,
	"telephone" text,
	"eligibilite_cee" boolean,
	"contrat_partenariat_id" text,
	"contrat_partenariat_document_id" text,
	"date_signature_contrat_partenariat" date,
	"contrat_cee_id" text,
	"contrat_cee_document_id" text,
	"date_signature_contrat_cee" date,
	"signataire_id" text,
	"capital_de_l_entreprise" real,
	"lieu_d_immatriculation_rcs" text,
	"marge_negociee" real,
	"taux_cee_negociee" real,
	"abonnement_souscrit" "pro_subscription_enum",
	"credits_abonnement_restants" real,
	"site_de_calendrier" text,
	"status_interne" text DEFAULT 'NEW' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"stripe_subscription_status" text,
	"stripe_current_plan_price_id" text,
	CONSTRAINT "pros_id_unique" UNIQUE("id"),
	CONSTRAINT "uq_pro_partnership_request_yousign_id" UNIQUE("contrat_partenariat_id"),
	CONSTRAINT "uq_pro_cee_request_yousign_id" UNIQUE("contrat_cee_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "devis" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"id" varchar,
	"nom" text,
	"hs_pipeline_stage" "hs_pipeline_stage_enum",
	"date_fin_de_validite_du_devis" date,
	"montant" real,
	"montant_offre" real,
	"taux_de_tva" real,
	"requete_signature_yousign_id" varchar,
	"signataire_yousign_id" varchar,
	"raison_de_refus" text,
	"montant_financement" real,
	"signature_location" jsonb,
	CONSTRAINT "devis_id_unique" UNIQUE("id"),
	CONSTRAINT "uq_devis_sign_request_yousign_id" UNIQUE("requete_signature_yousign_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tokens" (
	"id" "token_enum" NOT NULL,
	"access_token" text NOT NULL,
	"expires_at" text NOT NULL,
	CONSTRAINT "tokens_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "personne_morale_stats" (
	"personne_morale_id_pg" uuid PRIMARY KEY NOT NULL,
	"nb_related_locations" integer DEFAULT 0 NOT NULL,
	"nb_related_pros" integer DEFAULT 0 NOT NULL,
	"last_solicitation_date" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "personne_morale" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "type_personne_morale_enum" NOT NULL,
	"denomination" text,
	"denomination_usuelle" text,
	"siret" text,
	"siren" text,
	"part_siren" text,
	"telephone" text,
	"adresse_courriel" text,
	"nb_locaux_du_groupe" real,
	"trancheEffectifs" "legal_entity_employee_range",
	"categorieEntreprise" text,
	"categorieJuridique" text,
	"activitePrincipale" text,
	"type_organisme" text,
	"forme_juridique" text,
	"delegue" boolean,
	"horaires_ouverture_interne" text,
	"google_place_id" text,
	"horaires_ouverture" jsonb,
	"note" real,
	"nombre_avis" real,
	"site_internet" text,
	"url_itineraire_maps" text,
	"statut_entreprise" text,
	"is_unavailable_for_google" boolean DEFAULT false,
	"last_fetched_at_for_google" timestamp,
	"objectif" text,
	"is_unavailable_for_pappers" boolean DEFAULT false,
	"last_fetched_at_for_pappers" timestamp,
	"is_unavailable_for_hunter" boolean DEFAULT false,
	"last_fetched_at_for_hunter" timestamp,
	"is_unavailable_for_societe_info" boolean DEFAULT false,
	"last_fetched_at_for_societe_info" timestamp,
	"syndic_principal" boolean,
	"indiceRepetition_syndic" text,
	"numero_voie" text,
	"typeVoie_syndic" text,
	"libelle_voie" text,
	"ville" text,
	"code_postal" text,
	"url_vue_rue_syndic" text,
	"aucun_contact_trouvable" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "batiments_bdnb_stats" (
	"batiments_bdnb_id_pg" uuid PRIMARY KEY NOT NULL,
	"nb_legal_entities" integer DEFAULT 0 NOT NULL,
	"nb_siren_only" integer DEFAULT 0 NOT NULL,
	"nb_siret" integer DEFAULT 0 NOT NULL,
	"nb_related_pros" integer DEFAULT 0 NOT NULL,
	"last_solicitation_date" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "batiments_bdnb" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" text,
	"code_postal__new_" text,
	"ville" text,
	"numero_de_la_rue" text,
	"nom_de_la_rue" text,
	"url_vue_rue" text,
	"departement" "departements_de_france_enum",
	"batiment_groupe_id" text,
	"raw_bdnb" jsonb,
	"google_place_id" text,
	"source_address" text,
	"secteur" "secteur_enum",
	"usage_batiment" "usage_batiment_enum",
	"ipe_usage" "ipe_usage_enum",
	"ipe_usage_reason" text,
	"score_brut_ipe" real,
	"entreprise_reference_uuid" uuid,
	"raison_selection_entreprise_reference" text,
	"nombre_de_batiments" real,
	"nombre_de_lots" real,
	"m2" real,
	"facade_area" real,
	"glazing_area" real,
	"nombre_d_etages" real,
	"pourcentage_de_surface_vitree" real,
	"hauteur" real,
	"type_d_energie" "type_d_energie_enum",
	"type_de_chauffage" "type_de_chauffage_enum",
	"consommation_electrique_par_m2" real,
	"conso_energie_estime" real,
	"emission_gaz_a_effet_de_serre_par_m2" real,
	"annee_de_construction" date,
	"etiquette_dpe" "etiquette_dpe",
	"longitude" real,
	"latitude" real,
	"hauteur_mean" real,
	"classe_inertie" text,
	"presence_balcon" boolean,
	"nb_log" real,
	"nb_log_rnc" real,
	"nb_lot_tertiaire_rnc" real,
	"nb_pdl_res_dle_elec_2020" real,
	"nb_pdl_pro_dle_elec_2020" real,
	"nb_pdl_pro_dle_gaz_2020" real,
	"nb_pdl_res_dle_gaz_2020" real,
	"classe_bilan_dpe" "etiquette_dpe",
	"arrete_2021" boolean,
	"identifiant_dpe" text,
	"emission_ges_5_usages_m2" real,
	"emission_ges_3_usages_ep_m2_arrete_2012" real,
	"type_ventilation" "type_ventilation",
	"type_generateur_climatisation" text,
	"type_generateur_climatisation_anciennete" "anciennete_generateur_chauffage",
	"type_isolation_mur_exterieur" type_isolation[],
	"u_mur_exterieur" real,
	"type_isolation_plancher_bas" type_isolation[],
	"type_isolation_plancher_haut" type_isolation[],
	"u_plancher_bas_final_deperditif" real,
	"u_plancher_haut_deperditif" real,
	"type_vitrage" "type_vitrage",
	"type_materiaux_menuiserie" type_materiaux_menuiserie[],
	"type_gaz_lame" text,
	"type_fermeture" type_fermeture[],
	"vitrage_vir" boolean,
	"u_baie_vitree" real,
	"facteur_solaire_baie_vitree" real,
	"conso_pro_dle_elec_2020" real,
	"conso_res_dle_elec_2020" real,
	"conso_pro_dle_gaz_2020" real,
	"conso_res_dle_gaz_2020" real,
	"id_reseau" text,
	"alea_radon" "niveau_alea",
	"alea_argiles" "niveau_alea",
	"quartier_prioritaire" boolean,
	"nom_quartier_qpv" text,
	"code_qp" text,
	"denomination" text,
	"l_siret" text,
	"numero_immat_principal" text,
	"periode_construction_max" "periode_construction_max",
	"nb_lot_garpark" real,
	"nb_lot_tot" real,
	"nb_locaux_open_groupe" real,
	"nb_locaux_open_total" real,
	"nb_bat_grp_hors_dep" real,
	"mat_mur_txt" materiau_mur[],
	"mat_toit_txt" materiau_toit[],
	"nb_log_batiment_groupe_ffo_bat" real,
	"nb_pdl_tot" real,
	"classe_ges_principale" "etiquette_dpe",
	"accessible_pmr" boolean,
	"dans_qpv" boolean,
	"l_annee_construction_batiment_groupe_rpls" date,
	"nb_log_batiment_groupe_rpls" real,
	"s_log_hab" real,
	"surface_habitable_logement" real,
	"type_construction" text[],
	"l_type_equipement" text,
	"geom_groupe" jsonb,
	"code_iris" text,
	"code_commune_insee" text,
	"code_epci_insee" text,
	"contient_fictive_geom_groupe" boolean,
	"l_nature" text,
	"l_nature_detaillee" text,
	"l_toponyme" text,
	"millesime_batiment_groupe_dle_reseaux_multimillesime" text,
	"nb_pdl_res_batiment_groupe_dle_reseaux_multimillesime" real,
	"nb_pdl_pro_batiment_groupe_dle_reseaux_multimillesime" real,
	"nb_pdl_tot_batiment_groupe_dle_reseaux_multimillesime" real,
	"conso_res_batiment_groupe_dle_reseaux_multimillesime" real,
	"conso_pro_batiment_groupe_dle_reseaux_multimillesime" real,
	"conso_tot_batiment_groupe_dle_reseaux_multimillesime" real,
	"type_reseau" text,
	"type_batiment_dpe" "type_batiment_dpe",
	"periode_construction_dpe" "periode_construction_dpe",
	"annee_construction_dpe" date,
	"version" real,
	"date_etablissement_dpe" date,
	"date_reception_dpe" date,
	"nombre_niveau_logement" real,
	"nombre_niveau_immeuble" real,
	"surface_habitable_immeuble" real,
	"conso_5_usages_ef_m2" real,
	"classe_emission_ges" "etiquette_dpe",
	"classe_conso_energie_arrete_2012" "etiquette_dpe",
	"classe_emission_ges_arrete_2012" "etiquette_dpe",
	"conso_3_usages_ep_m2_arrete_2012" real,
	"presence_climatisation" boolean,
	"type_generateur_chauffage" "type_generateur_chauffage",
	"type_generateur_chauffage_anciennete" "anciennete_generateur_chauffage",
	"type_energie_chauffage_appoint" "type_energie_chauffage_appoint",
	"type_generateur_chauffage_appoint" text,
	"type_generateur_chauffage_anciennete_appoint" text,
	"chauffage_solaire" boolean,
	"nb_generateur_chauffage" real,
	"nb_installation_chauffage" real,
	"type_energie_climatisation" text,
	"type_installation_ecs" "type_installation_ecs",
	"type_energie_ecs" text,
	"type_generateur_ecs" "type_generateur_ecs",
	"type_generateur_ecs_anciennete" "anciennete_generateur_chauffage",
	"type_energie_ecs_appoint" text,
	"type_generateur_ecs_appoint" text,
	"type_generateur_ecs_anciennete_appoint" text,
	"ecs_solaire" boolean,
	"nb_generateur_ecs" real,
	"nb_installation_ecs" real,
	"plusieurs_facade_exposee" boolean,
	"type_production_energie_renouvelable" text,
	"epaisseur_lame" real,
	"surface_vitree_nord" real,
	"surface_vitree_sud" real,
	"surface_vitree_ouest" real,
	"surface_vitree_est" real,
	"surface_vitree_horizontal" real,
	"traversant" text,
	"uw" real,
	"l_orientation_baie_vitree" text,
	"epaisseur_isolation_mur_exterieur_estim" real,
	"materiaux_structure_mur_exterieur" "materiaux_structure_mur",
	"epaisseur_structure_mur_exterieur" text,
	"surface_mur_totale" real,
	"surface_mur_exterieur" real,
	"surface_mur_deperditif" real,
	"l_local_non_chauffe_mur" text,
	"local_non_chauffe_principal_mur" text,
	"l_orientation_mur_exterieur" text,
	"type_plancher_bas_deperditif" text,
	"surface_plancher_bas_totale" real,
	"surface_plancher_bas_deperditif" real,
	"u_plancher_bas_brut_deperditif" real,
	"l_local_non_chauffe_plancher_bas" text,
	"local_non_chauffe_principal_plancher_bas" text,
	"type_adjacence_principal_plancher_bas" text,
	"type_plancher_haut_deperditif" text,
	"surface_plancher_haut_totale" real,
	"surface_plancher_haut_deperditif" real,
	"l_local_non_chauffe_plancher_haut" text,
	"local_non_chauffe_principal_plancher_haut" text,
	"type_adjacence_principal_plancher_haut" text,
	"type_porte" text,
	"surface_porte" real,
	"u_porte" real,
	"deperdition_mur" real,
	"deperdition_baie_vitree" real,
	"deperdition_plancher_bas" real,
	"deperdition_plancher_haut" real,
	"deperdition_pont_thermique" real,
	"deperdition_porte" real,
	"millesime_batiment_groupe_dle_elec_multimillesime" date,
	"nb_pdl_tot_batiment_groupe_dle_elec_multimillesime" real,
	"conso_tot_batiment_groupe_dle_elec_multimillesime" real,
	"cle_interop_adr_principale_ban" text,
	"nb_adresse_valid_ban" real,
	"fiabilite_cr_adr_niv_1" text,
	"fiabilite_cr_adr_niv_2" text,
	"id_reseau_bdnb" text,
	"reseau_en_construction" boolean,
	"indicateur_distance_au_reseau" text,
	"l_nature_batiment_groupe_bdtopo_zoac" text,
	"l_nature_detaillee_batiment_groupe_bdtopo_zoac" text,
	"l_toponyme_batiment_groupe_bdtopo_zoac" text,
	"fiabilite_emprise_sol" text,
	"fiabilite_hauteur" text,
	"fiabilite_adresse" real,
	"croisement_geospx_reussi" boolean,
	"max_hauteur" real,
	"altitude_sol_mean" real,
	"trancheEffectifsUniteLegale" text,
	"anneeEffectifsUniteLegale" date,
	"surface_that_requires_heating" real,
	"annual_electricity_consumption" real,
	"annual_electricity_cost" real
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mail_connections" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" "mail_provider_enum" NOT NULL,
	"email" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"scope" text NOT NULL,
	"access_token_encrypted" text NOT NULL,
	"refresh_token_encrypted" text NOT NULL,
	"token_expires_at" timestamp,
	"last_validated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_mail_connections_user_provider" UNIQUE("user_id","provider"),
	CONSTRAINT "uq_mail_connections_provider_email" UNIQUE("provider","email"),
	CONSTRAINT "uq_mail_connections_provider_account_id" UNIQUE("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "simulated_locations" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"street_number" text,
	"street_name" text,
	"street_view_url" text,
	"zipcode" text,
	"city" text,
	"raw_bdnb" jsonb,
	"sector" "secteur_enum",
	"building_count" real,
	"units_count" real,
	"m2" real,
	"storeys_count" real,
	"glazing_surface_percentage" real,
	"height" real,
	"energy_type" "type_d_energie_enum",
	"heating_system" "type_de_chauffage_enum",
	"electricity_consumption_per_m2" real,
	"greenhouse_gas_emissions_per_m2" real,
	"geom_group" jsonb,
	"creation_date" date,
	"heating_type" text,
	"dpe_label" text,
	"account_name" text,
	"building_name" text,
	"operation_simulated_by" text,
	"most_profitable_operation" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "snapshot_public_location_bdnb_raw" (
	"id_pg" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"index" integer,
	"batiment_groupe_id" text,
	"numero_immat_principal" text,
	"periode_construction_max" text,
	"l_annee_construction" text,
	"nb_lot_garpark" real,
	"nb_lot_tot" real,
	"nb_log" real,
	"nb_lot_tertiaire" real,
	"l_nom_copro" text,
	"l_siret" text,
	"copro_dans_pvd" real,
	"personne_id" text,
	"nb_locaux_open_groupe" real,
	"siren" text,
	"forme_juridique" text,
	"denomination" text,
	"code_postal" text,
	"libelle_commune" text,
	"nb_locaux_open_total" real,
	"usage_principal_bdnb_open" text,
	"x" real,
	"y" real,
	"nb_bat_grp" real,
	"nb_bat_grp_hors_dep" real,
	"nb_niveau" real,
	"annee_construction" text,
	"usage_niveau_1_txt" text,
	"mat_mur_txt" text,
	"mat_toit_txt" text,
	"nb_log_batiment_groupe_ffo_bat" real,
	"millesime" text,
	"nb_pdl_res" real,
	"nb_pdl_pro" real,
	"nb_pdl_tot" real,
	"conso_res" real,
	"conso_pro" real,
	"conso_tot" real,
	"rpls_open" real,
	"nb_classe_ener_a" real,
	"nb_classe_ener_b" real,
	"nb_classe_ener_c" real,
	"nb_classe_ener_d" real,
	"nb_classe_ener_e" real,
	"nb_classe_ener_f" real,
	"nb_classe_ener_g" real,
	"nb_classe_ener_nc" real,
	"classe_ener_principale" text,
	"nb_classe_ges_a" real,
	"nb_classe_ges_b" real,
	"nb_classe_ges_c" real,
	"nb_classe_ges_d" real,
	"nb_classe_ges_e" real,
	"nb_classe_ges_f" real,
	"nb_classe_ges_g" real,
	"nb_classe_ges_nc" real,
	"classe_ges_principale" text,
	"accessible_pmr" real,
	"dans_qpv" real,
	"l_annee_construction_batiment_groupe_rpls" text,
	"nb_log_batiment_groupe_rpls" real,
	"s_log_hab" real,
	"type_construction" text,
	"l_type_equipement" text,
	"code_iris" text,
	"code_commune_insee" text,
	"code_epci_insee" text,
	"contient_fictive_geom_groupe" real,
	"l_nature" text,
	"l_nature_detaillee" text,
	"l_toponyme" text,
	"millesime_batiment_groupe_dle_reseaux_multimillesime" text,
	"nb_pdl_res_batiment_groupe_dle_reseaux_multimillesime" real,
	"nb_pdl_pro_batiment_groupe_dle_reseaux_multimillesime" real,
	"nb_pdl_tot_batiment_groupe_dle_reseaux_multimillesime" real,
	"conso_res_batiment_groupe_dle_reseaux_multimillesime" real,
	"conso_pro_batiment_groupe_dle_reseaux_multimillesime" real,
	"conso_tot_batiment_groupe_dle_reseaux_multimillesime" real,
	"s_geom_groupe" real,
	"identifiant_reseau" text,
	"type_reseau" text,
	"identifiant_dpe" text,
	"arrete_2021" real,
	"type_dpe" text,
	"type_batiment_dpe" text,
	"periode_construction_dpe" text,
	"annee_construction_dpe" text,
	"version" text,
	"date_etablissement_dpe" text,
	"date_reception_dpe" text,
	"nombre_niveau_logement" real,
	"nombre_niveau_immeuble" real,
	"surface_habitable_immeuble" real,
	"surface_habitable_logement" real,
	"conso_5_usages_ep_m2" real,
	"conso_5_usages_ef_m2" real,
	"emission_ges_5_usages_m2" real,
	"classe_bilan_dpe" text,
	"classe_emission_ges" text,
	"classe_conso_energie_arrete_2012" text,
	"classe_emission_ges_arrete_2012" text,
	"conso_3_usages_ep_m2_arrete_2012" real,
	"emission_ges_3_usages_ep_m2_arrete_2012" real,
	"type_installation_chauffage" text,
	"type_energie_chauffage" text,
	"type_generateur_chauffage" text,
	"type_generateur_chauffage_anciennete" text,
	"type_energie_chauffage_appoint" text,
	"type_generateur_chauffage_appoint" text,
	"type_generateur_chauffage_anciennete_appoint" text,
	"chauffage_solaire" real,
	"nb_generateur_chauffage" real,
	"nb_installation_chauffage" real,
	"type_energie_climatisation" text,
	"type_generateur_climatisation" text,
	"type_generateur_climatisation_anciennete" text,
	"type_installation_ecs" text,
	"type_energie_ecs" text,
	"type_generateur_ecs" text,
	"type_generateur_ecs_anciennete" text,
	"type_energie_ecs_appoint" text,
	"type_generateur_ecs_appoint" text,
	"type_generateur_ecs_anciennete_appoint" text,
	"ecs_solaire" real,
	"nb_generateur_ecs" real,
	"nb_installation_ecs" real,
	"plusieurs_facade_exposee" real,
	"type_ventilation" text,
	"type_production_energie_renouvelable" text,
	"type_vitrage" text,
	"type_materiaux_menuiserie" text,
	"type_gaz_lame" text,
	"type_fermeture" text,
	"epaisseur_lame" real,
	"vitrage_vir" real,
	"surface_vitree_nord" real,
	"surface_vitree_sud" real,
	"surface_vitree_ouest" real,
	"surface_vitree_est" real,
	"surface_vitree_horizontal" real,
	"traversant" text,
	"u_baie_vitree" real,
	"uw" real,
	"facteur_solaire_baie_vitree" real,
	"presence_balcon" real,
	"l_orientation_baie_vitree" text,
	"pourcentage_surface_baie_vitree_exterieur" real,
	"type_isolation_mur_exterieur" text,
	"epaisseur_isolation_mur_exterieur_estim" real,
	"materiaux_structure_mur_exterieur" text,
	"epaisseur_structure_mur_exterieur" text,
	"surface_mur_totale" real,
	"surface_mur_exterieur" real,
	"surface_mur_deperditif" real,
	"u_mur_exterieur" real,
	"l_local_non_chauffe_mur" text,
	"local_non_chauffe_principal_mur" text,
	"l_orientation_mur_exterieur" text,
	"type_isolation_plancher_bas" text,
	"type_plancher_bas_deperditif" text,
	"surface_plancher_bas_totale" real,
	"surface_plancher_bas_deperditif" real,
	"u_plancher_bas_final_deperditif" real,
	"u_plancher_bas_brut_deperditif" real,
	"l_local_non_chauffe_plancher_bas" text,
	"local_non_chauffe_principal_plancher_bas" text,
	"type_adjacence_principal_plancher_bas" text,
	"type_isolation_plancher_haut" text,
	"type_plancher_haut_deperditif" text,
	"surface_plancher_haut_totale" real,
	"surface_plancher_haut_deperditif" real,
	"u_plancher_haut_deperditif" real,
	"l_local_non_chauffe_plancher_haut" text,
	"local_non_chauffe_principal_plancher_haut" text,
	"type_adjacence_principal_plancher_haut" text,
	"type_porte" text,
	"surface_porte" real,
	"u_porte" real,
	"classe_inertie" text,
	"deperdition_mur" real,
	"deperdition_baie_vitree" real,
	"deperdition_plancher_bas" real,
	"deperdition_plancher_haut" real,
	"deperdition_pont_thermique" real,
	"deperdition_porte" real,
	"millesime_batiment_groupe_dle_elec_multimillesime" text,
	"nb_pdl_res_batiment_groupe_dle_elec_multimillesime" real,
	"nb_pdl_pro_batiment_groupe_dle_elec_multimillesime" real,
	"nb_pdl_tot_batiment_groupe_dle_elec_multimillesime" real,
	"conso_res_batiment_groupe_dle_elec_multimillesime" real,
	"conso_pro_batiment_groupe_dle_elec_multimillesime" real,
	"conso_tot_batiment_groupe_dle_elec_multimillesime" real,
	"alea_argiles" text,
	"nb_classe_bilan_dpe_a" real,
	"nb_classe_bilan_dpe_b" real,
	"nb_classe_bilan_dpe_c" real,
	"nb_classe_bilan_dpe_d" real,
	"nb_classe_bilan_dpe_e" real,
	"nb_classe_bilan_dpe_f" real,
	"nb_classe_bilan_dpe_g" real,
	"nb_classe_conso_energie_arrete_2012_a" real,
	"nb_classe_conso_energie_arrete_2012_b" real,
	"nb_classe_conso_energie_arrete_2012_c" real,
	"nb_classe_conso_energie_arrete_2012_d" real,
	"nb_classe_conso_energie_arrete_2012_e" real,
	"nb_classe_conso_energie_arrete_2012_f" real,
	"nb_classe_conso_energie_arrete_2012_g" real,
	"nb_classe_conso_energie_arrete_2012_nc" real,
	"cle_interop_adr_principale_ban" text,
	"libelle_adr_principale_ban" text,
	"nb_adresse_valid_ban" real,
	"fiabilite_cr_adr_niv_1" text,
	"fiabilite_cr_adr_niv_2" text,
	"nom_quartier" text,
	"id_reseau" text,
	"id_reseau_bdnb" text,
	"reseau_en_construction" real,
	"indicateur_distance_au_reseau" text,
	"l_nature_batiment_groupe_bdtopo_zoac" text,
	"l_nature_detaillee_batiment_groupe_bdtopo_zoac" text,
	"l_toponyme_batiment_groupe_bdtopo_zoac" text,
	"fiabilite_emprise_sol" text,
	"fiabilite_hauteur" text,
	"fiabilite_adresse" real,
	"croisement_geospx_reussi" real,
	"alea_radon" text,
	"l_nature_batiment_groupe_bdtopo_bat" text,
	"l_usage_1" text,
	"l_usage_2" text,
	"l_etat" text,
	"hauteur_mean" real,
	"max_hauteur" real,
	"altitude_sol_mean" real,
	"trancheEffectifsUniteLegale" text,
	"anneeEffectifsUniteLegale" text,
	"categorieEntreprise" text,
	"anneeCategorieEntreprise" text,
	"etatAdministratifUniteLegale" text,
	"denominationUniteLegale" text,
	"categorieJuridiqueUniteLegale" text,
	"activitePrincipaleUniteLegale" text,
	"nomenclatureActivitePrincipaleUniteLegale" text,
	"economieSocialeSolidaireUniteLegale" text,
	"in_sirene" text,
	"nom" text,
	"siret" text,
	"telephone" text,
	"adresse_courriel" text,
	"type_organisme" text,
	"denominationUsuelle_syndic" text,
	"syndic_nom" text,
	"syndic_siret" text,
	"siret_syndic" text,
	"syndic_commune" text,
	"syndic_principal" text,
	"numeroVoie_syndic" real,
	"indiceRepetition_syndic" text,
	"libelleCommune_syndic" text,
	"codePostal_syndic" text,
	"libelleVoie_syndic" text,
	"typeVoie_syndic" text,
	"siren_1" text,
	"nb_locaux_du_groupe_1" real,
	"denomination_1" text,
	"forme_juridique_1" text,
	"code_postal_1" text,
	"part_siren_1" text,
	"trancheEffectifs_1" text,
	"categorieEntreprise_1" text,
	"categorieJuridique_1" text,
	"activitePrincipale_1" text,
	"nom_1" text,
	"telephone_1" text,
	"adresse_courriel_1" text,
	"type_organisme_1" text,
	"delegué_1" boolean,
	"siren_2" text,
	"nb_locaux_du_groupe_2" real,
	"denomination_2" text,
	"forme_juridique_2" text,
	"code_postal_2" text,
	"part_siren_2" text,
	"trancheEffectifs_2" text,
	"categorieEntreprise_2" text,
	"categorieJuridique_2" text,
	"activitePrincipale_2" text,
	"nom_2" text,
	"telephone_2" text,
	"adresse_courriel_2" text,
	"type_organisme_2" text,
	"delegué_2" boolean,
	"siren_3" text,
	"nb_locaux_du_groupe_3" real,
	"denomination_3" text,
	"forme_juridique_3" text,
	"code_postal_3" text,
	"part_siren_3" text,
	"trancheEffectifs_3" text,
	"categorieEntreprise_3" text,
	"categorieJuridique_3" text,
	"activitePrincipale_3" text,
	"nom_3" text,
	"telephone_3" text,
	"adresse_courriel_3" text,
	"type_organisme_3" text,
	"delegué_3" boolean,
	"import_en_echec" text,
	"name" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProspectionHistoriqueLeads" ADD CONSTRAINT "ProspectionHistoriqueLeads_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProspectionHistoriqueLeads" ADD CONSTRAINT "ProspectionHistoriqueLeads_batiments_bdnb_id_pg_batiments_bdnb_id_pg_fk" FOREIGN KEY ("batiments_bdnb_id_pg") REFERENCES "public"."batiments_bdnb"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProspectionHistoriqueLeads" ADD CONSTRAINT "ProspectionHistoriqueLeads_contact_externe_recommande_id_pg_contact_externe_id_pg_fk" FOREIGN KEY ("contact_externe_recommande_id_pg") REFERENCES "public"."contact_externe"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProspectionParametres" ADD CONSTRAINT "ProspectionParametres_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProspectionParametres" ADD CONSTRAINT "ProspectionParametres_contact_reception_id_pg_contacts_id_pg_fk" FOREIGN KEY ("contact_reception_id_pg") REFERENCES "public"."contacts"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_externes_pro" ADD CONSTRAINT "associations_batiments_externes_pro_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_externes_pro" ADD CONSTRAINT "associations_batiments_externes_pro_batiments_id_pg_batiments_bdnb_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments_bdnb"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_personne_morale_contact_externe" ADD CONSTRAINT "associations_personne_morale_contact_externe_personne_morale_id_pg_personne_morale_id_pg_fk" FOREIGN KEY ("personne_morale_id_pg") REFERENCES "public"."personne_morale"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_personne_morale_contact_externe" ADD CONSTRAINT "associations_personne_morale_contact_externe_contact_externe_id_pg_contact_externe_id_pg_fk" FOREIGN KEY ("contact_externe_id_pg") REFERENCES "public"."contact_externe"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_bdnb_personne_morale" ADD CONSTRAINT "associations_batiments_bdnb_personne_morale_batiments_bdnb_id_pg_batiments_bdnb_id_pg_fk" FOREIGN KEY ("batiments_bdnb_id_pg") REFERENCES "public"."batiments_bdnb"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_bdnb_personne_morale" ADD CONSTRAINT "associations_batiments_bdnb_personne_morale_personne_morale_id_pg_personne_morale_id_pg_fk" FOREIGN KEY ("personne_morale_id_pg") REFERENCES "public"."personne_morale"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_pros_contact_externe" ADD CONSTRAINT "associations_pros_contact_externe_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_pros_contact_externe" ADD CONSTRAINT "associations_pros_contact_externe_contact_externe_id_pg_contact_externe_id_pg_fk" FOREIGN KEY ("contact_externe_id_pg") REFERENCES "public"."contact_externe"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_pros_contact_externe" ADD CONSTRAINT "associations_pros_contact_externe_ajoute_par_contact_id_pg_contacts_id_pg_fk" FOREIGN KEY ("ajoute_par_contact_id_pg") REFERENCES "public"."contacts"("id_pg") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_pros_personne_morale" ADD CONSTRAINT "associations_pros_personne_morale_pros_id_pg_pros_id_pg_fk" FOREIGN KEY ("pros_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_pros_personne_morale" ADD CONSTRAINT "associations_pros_personne_morale_personne_morale_id_pg_personne_morale_id_pg_fk" FOREIGN KEY ("personne_morale_id_pg") REFERENCES "public"."personne_morale"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enrichissements" ADD CONSTRAINT "enrichissements_personne_morale_id_pg_personne_morale_id_pg_fk" FOREIGN KEY ("personne_morale_id_pg") REFERENCES "public"."personne_morale"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enrichissements" ADD CONSTRAINT "enrichissements_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "enrichissements" ADD CONSTRAINT "enrichissements_contact_id_pg_contacts_id_pg_fk" FOREIGN KEY ("contact_id_pg") REFERENCES "public"."contacts"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_notes" ADD CONSTRAINT "associations_batiments_notes_batiments_id_pg_batiments_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_notes" ADD CONSTRAINT "associations_batiments_notes_notes_id_pg_notes_id_pg_fk" FOREIGN KEY ("notes_id_pg") REFERENCES "public"."notes"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_financeurs" ADD CONSTRAINT "associations_deal_financeurs_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_financeurs" ADD CONSTRAINT "associations_deal_financeurs_financeur_id_pg_financeurs_id_pg_fk" FOREIGN KEY ("financeur_id_pg") REFERENCES "public"."financeurs"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_factures" ADD CONSTRAINT "associations_deal_factures_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_factures" ADD CONSTRAINT "associations_deal_factures_facture_id_pg_factures_id_pg_fk" FOREIGN KEY ("facture_id_pg") REFERENCES "public"."factures"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_notes_deal" ADD CONSTRAINT "associations_notes_deal_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_notes_deal" ADD CONSTRAINT "associations_notes_deal_notes_id_pg_notes_id_pg_fk" FOREIGN KEY ("notes_id_pg") REFERENCES "public"."notes"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_clients_pro" ADD CONSTRAINT "associations_clients_pro_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_clients_pro" ADD CONSTRAINT "associations_clients_pro_client_id_pg_clients_id_pg_fk" FOREIGN KEY ("client_id_pg") REFERENCES "public"."clients"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_pro" ADD CONSTRAINT "associations_batiments_pro_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_pro" ADD CONSTRAINT "associations_batiments_pro_batiments_id_pg_batiments_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_notes_pro" ADD CONSTRAINT "associations_notes_pro_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_notes_pro" ADD CONSTRAINT "associations_notes_pro_notes_id_pg_notes_id_pg_fk" FOREIGN KEY ("notes_id_pg") REFERENCES "public"."notes"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_favoris_pro" ADD CONSTRAINT "associations_batiments_favoris_pro_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_favoris_pro" ADD CONSTRAINT "associations_batiments_favoris_pro_batiments_id_pg_batiments_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_clients" ADD CONSTRAINT "associations_contact_clients_contact_id_pg_contacts_id_pg_fk" FOREIGN KEY ("contact_id_pg") REFERENCES "public"."contacts"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_clients" ADD CONSTRAINT "associations_contact_clients_clients_id_pg_clients_id_pg_fk" FOREIGN KEY ("clients_id_pg") REFERENCES "public"."clients"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_batiments" ADD CONSTRAINT "associations_contact_batiments_batiments_id_pg_batiments_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_batiments" ADD CONSTRAINT "associations_contact_batiments_contact_id_pg_contacts_id_pg_fk" FOREIGN KEY ("contact_id_pg") REFERENCES "public"."contacts"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_deal" ADD CONSTRAINT "associations_contact_deal_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_deal" ADD CONSTRAINT "associations_contact_deal_contact_id_pg_contacts_id_pg_fk" FOREIGN KEY ("contact_id_pg") REFERENCES "public"."contacts"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_pro" ADD CONSTRAINT "associations_contact_pro_contact_id_pg_contacts_id_pg_fk" FOREIGN KEY ("contact_id_pg") REFERENCES "public"."contacts"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_contact_pro" ADD CONSTRAINT "associations_contact_pro_pros_id_pg_pros_id_pg_fk" FOREIGN KEY ("pros_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_clients" ADD CONSTRAINT "associations_batiments_clients_batiments_id_pg_batiments_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_batiments_clients" ADD CONSTRAINT "associations_batiments_clients_clients_id_pg_clients_id_pg_fk" FOREIGN KEY ("clients_id_pg") REFERENCES "public"."clients"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_client" ADD CONSTRAINT "associations_deal_client_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_client" ADD CONSTRAINT "associations_deal_client_client_id_pg_clients_id_pg_fk" FOREIGN KEY ("client_id_pg") REFERENCES "public"."clients"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_batiments" ADD CONSTRAINT "associations_deal_batiments_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_batiments" ADD CONSTRAINT "associations_deal_batiments_batiments_id_pg_batiments_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_pros" ADD CONSTRAINT "associations_deal_pros_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_pros" ADD CONSTRAINT "associations_deal_pros_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_devis" ADD CONSTRAINT "associations_deal_devis_deal_id_pg_deals_id_pg_fk" FOREIGN KEY ("deal_id_pg") REFERENCES "public"."deals"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_deal_devis" ADD CONSTRAINT "associations_deal_devis_devis_id_pg_devis_id_pg_fk" FOREIGN KEY ("devis_id_pg") REFERENCES "public"."devis"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_devis_clients" ADD CONSTRAINT "associations_devis_clients_devis_id_pg_devis_id_pg_fk" FOREIGN KEY ("devis_id_pg") REFERENCES "public"."devis"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_devis_clients" ADD CONSTRAINT "associations_devis_clients_client_id_pg_clients_id_pg_fk" FOREIGN KEY ("client_id_pg") REFERENCES "public"."clients"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_devis_batiments" ADD CONSTRAINT "associations_devis_batiments_devis_id_pg_devis_id_pg_fk" FOREIGN KEY ("devis_id_pg") REFERENCES "public"."devis"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_devis_batiments" ADD CONSTRAINT "associations_devis_batiments_batiments_id_pg_batiments_id_pg_fk" FOREIGN KEY ("batiments_id_pg") REFERENCES "public"."batiments"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_devis_notes" ADD CONSTRAINT "associations_devis_notes_devis_id_pg_devis_id_pg_fk" FOREIGN KEY ("devis_id_pg") REFERENCES "public"."devis"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_devis_notes" ADD CONSTRAINT "associations_devis_notes_notes_id_pg_notes_id_pg_fk" FOREIGN KEY ("notes_id_pg") REFERENCES "public"."notes"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_devis_pros" ADD CONSTRAINT "associations_devis_pros_devis_id_pg_devis_id_pg_fk" FOREIGN KEY ("devis_id_pg") REFERENCES "public"."devis"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "associations_devis_pros" ADD CONSTRAINT "associations_devis_pros_pro_id_pg_pros_id_pg_fk" FOREIGN KEY ("pro_id_pg") REFERENCES "public"."pros"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "personne_morale_stats" ADD CONSTRAINT "personne_morale_stats_personne_morale_id_pg_personne_morale_id_pg_fk" FOREIGN KEY ("personne_morale_id_pg") REFERENCES "public"."personne_morale"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "batiments_bdnb_stats" ADD CONSTRAINT "batiments_bdnb_stats_batiments_bdnb_id_pg_batiments_bdnb_id_pg_fk" FOREIGN KEY ("batiments_bdnb_id_pg") REFERENCES "public"."batiments_bdnb"("id_pg") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mail_connections" ADD CONSTRAINT "mail_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_prospection_historique_leads_pro" ON "ProspectionHistoriqueLeads" USING btree ("pro_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_prospection_historique_leads_location_bdnb" ON "ProspectionHistoriqueLeads" USING btree ("batiments_bdnb_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_asso_bat_ext_pro_pro_location" ON "associations_batiments_externes_pro" USING btree ("pro_id_pg","batiments_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_asso_bat_ext_pro_pro_label_location" ON "associations_batiments_externes_pro" USING btree ("pro_id_pg","association_label","batiments_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "associations_batiments_bdnb_personne_morale_batiments_idx" ON "associations_batiments_bdnb_personne_morale" USING btree ("batiments_bdnb_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "associations_batiments_bdnb_personne_morale_personne_idx" ON "associations_batiments_bdnb_personne_morale" USING btree ("personne_morale_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "associations_batiments_bdnb_personne_morale_batiments_personne_idx" ON "associations_batiments_bdnb_personne_morale" USING btree ("batiments_bdnb_id_pg","personne_morale_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_associations_pros_contact_externe_pro_owner" ON "associations_pros_contact_externe" USING btree ("pro_id_pg","ajoute_par_contact_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_asso_pro_personne_pro_legal_entity" ON "associations_pros_personne_morale" USING btree ("pros_id_pg","personne_morale_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_asso_batiments_pro_batiment" ON "associations_batiments_pro" USING btree ("pro_id_pg","batiments_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_asso_batiments_pro_label_batiment" ON "associations_batiments_pro" USING btree ("pro_id_pg","association_label","batiments_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pro_stripe_customer_id" ON "pros" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_personne_morale_stats_nb_related_locations" ON "personne_morale_stats" USING btree ("nb_related_locations");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_personne_morale_stats_nb_related_pros" ON "personne_morale_stats" USING btree ("nb_related_pros");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "legal_entity_type" ON "personne_morale" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "legal_entity_name_index" ON "personne_morale" USING gin ("denomination" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "legal_entity_usual_name_index" ON "personne_morale" USING gin ("denomination_usuelle" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "legal_entity_siret_index" ON "personne_morale" USING gin ("siret" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "legal_entity_siren_index" ON "personne_morale" USING gin ("siren" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "legal_entity_nb_employees_range_index" ON "personne_morale" USING btree ("trancheEffectifs");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "legal_entity_nb_premises_index" ON "personne_morale" USING btree ("nb_locaux_du_groupe");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "legal_entity_activity_index" ON "personne_morale" USING btree ("activitePrincipale");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_batiments_bdnb_stats_batiment" ON "batiments_bdnb_stats" USING btree ("batiments_bdnb_id_pg");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_batiments_bdnb_stats_nb_legal_entities" ON "batiments_bdnb_stats" USING btree ("nb_legal_entities");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_batiments_bdnb_stats_nb_related_pros" ON "batiments_bdnb_stats" USING btree ("nb_related_pros");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_location_group_id_index" ON "batiments_bdnb" USING btree ("batiment_groupe_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_department_index" ON "batiments_bdnb" USING btree ("departement");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_dpe_label_index" ON "batiments_bdnb" USING btree ("etiquette_dpe");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_energy_type_index" ON "batiments_bdnb" USING btree ("type_d_energie");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_surface_that_requires_heating_index" ON "batiments_bdnb" USING btree ("surface_that_requires_heating");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_creation_date_index" ON "batiments_bdnb" USING btree ("annee_de_construction");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_heating_type_index" ON "batiments_bdnb" USING btree ("type_generateur_chauffage");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_surface_area_index" ON "batiments_bdnb" USING btree ("m2");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_glazing_area_index" ON "batiments_bdnb" USING btree ("glazing_area");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_height_index" ON "batiments_bdnb" USING btree ("hauteur");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_nb_storeys_index" ON "batiments_bdnb" USING btree ("nombre_d_etages");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_nb_units_index" ON "batiments_bdnb" USING btree ("nombre_de_lots");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_nb_buildings_index" ON "batiments_bdnb" USING btree ("nombre_de_batiments");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_is_in_qpv_index" ON "batiments_bdnb" USING btree ("dans_qpv");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_sector_index" ON "batiments_bdnb" USING btree ("secteur");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_building_usage_index" ON "batiments_bdnb" USING btree ("usage_batiment");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_street_number_index" ON "batiments_bdnb" USING gin ("numero_de_la_rue" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_street_name_index" ON "batiments_bdnb" USING gin ("nom_de_la_rue" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_zipcode_index" ON "batiments_bdnb" USING gin ("code_postal__new_" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_city_index" ON "batiments_bdnb" USING gin ("ville" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_max_construction_period_index" ON "batiments_bdnb" USING btree ("periode_construction_max");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_nb_parking_spots_index" ON "batiments_bdnb" USING btree ("nb_lot_garpark");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_habitable_surface_index" ON "batiments_bdnb" USING btree ("s_log_hab");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_pmr_accessible_index" ON "batiments_bdnb" USING btree ("accessible_pmr");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_glazing_type_index" ON "batiments_bdnb" USING btree ("type_vitrage");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_exterior_wall_insulation_type_index" ON "batiments_bdnb" USING gin ("type_isolation_mur_exterieur");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_lower_floor_insulation_type_index" ON "batiments_bdnb" USING gin ("type_isolation_plancher_bas");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_upper_floor_insulation_type_index" ON "batiments_bdnb" USING gin ("type_isolation_plancher_haut");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_habitable_surface_area_index" ON "batiments_bdnb" USING btree ("surface_habitable_logement");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_inertia_class_index" ON "batiments_bdnb" USING btree ("classe_inertie");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_has_air_conditioning_index" ON "batiments_bdnb" USING btree ("presence_climatisation");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_ventilation_type_index" ON "batiments_bdnb" USING btree ("type_ventilation");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_ecs_generator_type_index" ON "batiments_bdnb" USING btree ("type_generateur_ecs");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_main_ges_class_index" ON "batiments_bdnb" USING btree ("classe_ges_principale");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_dpe_established_date_index" ON "batiments_bdnb" USING btree ("date_etablissement_dpe");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_electricity_consumption_per_square_meter_index" ON "batiments_bdnb" USING btree ("consommation_electrique_par_m2");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_greenhouse_gas_emissions_per_square_meter_index" ON "batiments_bdnb" USING btree ("emission_gaz_a_effet_de_serre_par_m2");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_annual_electricity_consumption_index" ON "batiments_bdnb" USING btree ("annual_electricity_consumption");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_bdnb_dpe_label_uuid_index" ON "batiments_bdnb" USING btree ("etiquette_dpe","id_pg");