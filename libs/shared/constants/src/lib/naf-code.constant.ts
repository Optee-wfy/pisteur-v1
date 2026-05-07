export type NafInfo = {
  code: string; // code NAF normalisé (ex: "68.32A")
  field: string; // "Libellé officiel" — field of activity
};

export const NAF_MAP: Record<string, { field: string }> = {
  // 00 - Activité inconnue
  "00.00Z": { field: "Activité inconnue" },

  // 01 - Agriculture, sylviculture et pêche
  "01.11Z": {
    field:
      "Culture de céréales (à l’exception du riz), de légumineuses et de graines oléagineuses",
  },
  "01.12Z": { field: "Culture du riz" },
  "01.13Z": {
    field: "Culture de légumes, de melons, de racines et de tubercules",
  },
  "01.15Z": { field: "Culture du tabac" },
  "01.16Z": { field: "Culture de plantes à fibres" },
  "01.19Z": { field: "Autres cultures non permanentes" },
  "01.21Z": { field: "Culture de la vigne" },
  "01.23Z": { field: "Culture d'agrumes" },
  "01.24Z": { field: "Culture de fruits à pépins et à noyau" },
  "01.25Z": {
    field:
      "Culture d'autres fruits d'arbres ou d'arbustes et de fruits à coque",
  },
  "01.26Z": { field: "Cultures de fruits oléagineux" },
  "01.28Z": {
    field:
      "Culture de plantes à épices, aromatiques, médicinales et pharmaceutiques",
  },
  "01.29Z": { field: "Autres cultures permanentes" },
  "01.30Z": { field: "Reproduction de plantes" },
  "01.41Z": { field: "Élevage de vaches laitières" },
  "01.42Z": { field: "Élevage d'autres bovins et de buffles" },
  "01.43Z": { field: "Élevage de chevaux et d'autres équidés" },
  "01.45Z": { field: "Élevage d'ovins et de caprins" },
  "01.46Z": { field: "Élevage de porcins" },
  "01.47Z": { field: "Élevage de volailles" },
  "01.49Z": { field: "Élevage d'autres animaux" },
  "01.50Z": { field: "Culture et élevage associés" },
  "01.61Z": { field: "Activités de soutien aux cultures" },
  "01.62Z": { field: "Activités de soutien à la production animale" },
  "01.63Z": { field: "Traitement primaire des récoltes" },
  "01.64Z": { field: "Traitement des semences" },
  "01.70Z": { field: "Chasse, piégeage et services annexes" },

  // 02 - Sylviculture et exploitation forestière
  "02.10Z": { field: "Sylviculture et autres activités forestières" },
  "02.20": { field: "Exploitation forestière" },
  "02.20Z": { field: "Exploitation forestière" },
  "02.40Z": { field: "Services de soutien à l'exploitation forestière" },

  // 03 - Pêche et aquaculture
  "03.11Z": { field: "Pêche en mer" },
  "03.21Z": { field: "Aquaculture en mer" },
  "03.22Z": { field: "Aquaculture en eau douce" },

  // 05 - Extraction de houille et de lignite
  "05.10Z": { field: "Extraction de houille" },

  // 06 - Extraction de minerais métalliques
  "06.10Z": { field: "Extraction de pétrole brut" },

  // 07 - Extraction de minerais non métalliques
  "07.21Z": { field: "Extraction de minerais d'uranium et de thorium" },

  // 08 - Extraction de minerais non métalliques
  "08.11Z": {
    field:
      "Extraction de pierres ornementales et de construction, de calcaire industriel, de gypse, de craie et d'ardoise",
  },
  "08.12Z": {
    field:
      "Exploitation de gravières et sablières, extraction d'argiles et de kaolin",
  },
  "08.91Z": {
    field: "Extraction des minéraux chimiques et d'engrais minéraux",
  },
  "08.92Z": { field: "Extraction de tourbe" },
  "08.93Z": { field: "Production de sel" },
  "08.99Z": { field: "Autres activités extractives n.c.a." },

  // 09 - Activités de soutien aux industries extractives
  "09.10Z": { field: "Activités de soutien à l'extraction d'hydrocarbures" },
  "09.90Z": { field: "Activités de soutien aux autres industries extractives" },

  // 10 - Industries alimentaires
  "10.11Z": {
    field: "Transformation et conservation de la viande de boucherie",
  },
  "10.12Z": {
    field: "Transformation et conservation de la viande de volaille",
  },
  "10.13A": { field: "Préparation de produits à base de viande" },
  "10.13B": { field: "Charcuterie" },
  "10.20Z": {
    field:
      "Transformation et conservation de poisson, de crustacés et de mollusques",
  },
  "10.31Z": { field: "Transformation et conservation de pommes de terre" },
  "10.32Z": { field: "Préparation de jus de fruits et légumes" },
  "10.39A": { field: "Autre transformation et conservation de légumes" },
  "10.39B": { field: "Transformation et conservation de fruits" },
  "10.41A": { field: "Fabrication d'huiles et graisses brutes" },
  "10.41B": { field: "Fabrication d'huiles et graisses raffinées" },
  "10.42Z": {
    field: "Fabrication de margarine et graisses comestibles similaires",
  },
  "10.51A": { field: "Fabrication de lait liquide et de produits frais" },
  "10.51B": { field: "Fabrication de beurre" },
  "10.51C": { field: "Fabrication de fromage" },
  "10.51D": { field: "Fabrication d'autres produits laitiers" },
  "10.52Z": { field: "Fabrication de glaces et sorbets" },
  "10.61A": { field: "Meunerie" },
  "10.61B": { field: "Autres activités du travail des grains" },
  "10.62Z": { field: "Fabrication de produits amylacés" },
  "10.71A": {
    field: "Fabrication industrielle de pain et de pâtisserie fraîche",
  },
  "10.71B": { field: "Cuisson de produits de boulangerie" },
  "10.71C": { field: "Boulangerie et boulangerie-pâtisserie" },
  "10.71D": { field: "Pâtisserie" },
  "10.72Z": {
    field: "Fabrication de biscuits, biscottes et pâtisseries de conservation",
  },
  "10.73Z": { field: "Fabrication de pâtes alimentaires" },
  "10.81Z": { field: "Fabrication de sucre" },
  "10.82Z": {
    field: "Fabrication de cacao, chocolat et de produits de confiserie",
  },
  "10.83Z": { field: "Transformation du thé et du café" },
  "10.84Z": { field: "Fabrication de condiments et assaisonnements" },
  "10.85Z": { field: "Fabrication de plats préparés" },
  "10.86Z": { field: "Fabrication d'aliments homogénéisés et diététiques" },
  "10.89Z": { field: "Fabrication d’autres produits alimentaires n.c.a." },
  "10.91Z": { field: "Fabrication d'aliments pour animaux de ferme" },
  "10.92Z": { field: "Fabrication d'aliments pour animaux de compagnie" },

  // 11 - Boissons
  "11.01Z": { field: "Production de boissons alcooliques distillées" },
  "11.02A": { field: "Fabrication de vins effervescents" },
  "11.02B": { field: "Vinification" },
  "11.03Z": { field: "Fabrication de cidre et de vins de fruits" },
  "11.04Z": { field: "Production d'autres boissons fermentées non distillées" },
  "11.05Z": { field: "Fabrication de bière" },
  "11.06Z": { field: "Fabrication de malt" },
  "11.07A": { field: "Industrie des eaux de table" },
  "11.07B": { field: "Production de boissons rafraîchissantes" },

  // 12 - Tabac
  "12.00Z": { field: "Fabrication de produits à base de tabac" },

  // 13 - Textiles
  "13.10Z": { field: "Préparation de fibres textiles et filature" },
  "13.20Z": { field: "Tissage" },
  "13.30Z": { field: "Ennoblissement textile" },
  "13.91Z": { field: "Fabrication d'étoffes à mailles" },
  "13.92Z": { field: "Fabrication d’articles textiles, sauf habillement" },
  "13.93Z": { field: "Fabrication de tapis et moquettes" },
  "13.94Z": { field: "Fabrication de ficelles, cordes et filets" },
  "13.95Z": { field: "Fabrication de non-tissés, sauf habillement" },
  "13.96Z": {
    field: "Fabrication d'autres textiles techniques et industriels",
  },
  "13.99Z": { field: "Fabrication d'autres textiles n.c.a." },

  // 14 - Habillement
  "14.13Z": { field: "Fabrication de vêtements de dessus" },
  "14.12Z": { field: "Fabrication de vêtements de travail" },
  "14.14Z": { field: "Fabrication de vêtements de dessous" },
  "14.19Z": { field: "Fabrication d'autres vêtements et accessoires" },
  "14.20Z": { field: "Fabrication d'articles en fourrure" },
  "14.31Z": { field: "Fabrication d'articles chaussants à mailles" },
  "14.39Z": { field: "Fabrication d'autres articles à mailles" },

  // 15 - Cuir et articles en cuir
  "15.11Z": {
    field:
      "Apprêt et tannage des cuirs ; préparation et teinture des fourrures",
  },
  "15.12Z": {
    field: "Fabrication d'articles de voyage, de maroquinerie et de sellerie",
  },
  "15.20Z": { field: "Fabrication de chaussures" },

  // 16 - Bois et ouvrages en bois
  "16.10A": {
    field: "Sciage et rabotage du bois, hors imprégnation",
  },
  "16.10B": { field: "Imprégnation du bois" },
  "16.21Z": { field: "Fabrication de placage et de panneaux de bois" },
  "16.22Z": { field: "Fabrication de parquets assemblés" },

  "16.23Z": {
    field: "Fabrication de charpentes et d'autres menuiseries",
  },
  "16.24Z": { field: "Fabrication d'emballages en bois" },
  "16.29Z": {
    field:
      "Fabrication d'objets divers en bois ; fabrication d'objets en liège, vannerie et sparterie",
  },

  // 17 - Papier et carton
  "17.11Z": { field: "Fabrication de pâte à papier" },
  "17.12Z": { field: "Fabrication de papier et de carton" },
  "17.21A": { field: "Fabrication de carton ondulé" },
  "17.21B": { field: "Fabrication de cartonnages" },
  "17.21C": { field: "Fabrication d'emballages en papier" },
  "17.22Z": {
    field: "Fabrication d'articles en papier à usage sanitaire ou domestique",
  },
  "17.23Z": { field: "Fabrication d'articles de papeterie" },
  "17.29Z": { field: "Fabrication d'autres articles en papier ou en carton" },

  // 18 - Imprimerie et reproduction
  "18.11Z": { field: "Imprimerie de journaux" },
  "18.12Z": { field: "Autre imprimerie (labeur)" },
  "18.13Z": { field: "Activités de pré-presse" },
  "18.14Z": { field: "Reliure et activités connexes" },
  "18.20Z": { field: "Reproduction d'enregistrements" },

  // 19 - Cokéfaction et raffinage
  "19.10Z": { field: "Cokéfaction" },
  "19.20Z": { field: "Raffinage du pétrole" },

  // 20 - Chimie
  "20.11Z": { field: "Fabrication de gaz industriels" },
  "20.12Z": { field: "Fabrication de colorants et de pigments" },
  "20.13A": {
    field: "Enrichissement et retraitement de matières nucléaires",
  },
  "20.13B": {
    field:
      "Fabrication d'autres produits chimiques inorganiques de base n.c.a.",
  },
  "20.14Z": {
    field: "Fabrication d’autres produits chimiques organiques de base",
  },
  "20.15Z": { field: "Fabrication de produits azotés et d'engrais" },
  "20.16Z": { field: "Fabrication de matières plastiques de base" },
  "20.17Z": { field: "Fabrication de caoutchouc synthétique" },
  "20.20Z": {
    field: "Fabrication de pesticides et d'autres produits agrochimiques",
  },
  "20.30Z": {
    field: "Fabrication de peintures, vernis, encres et mastics",
  },
  "20.41Z": {
    field: "Fabrication de savons, détergents et produits d'entretien",
  },
  "20.42Z": {
    field: "Fabrication de parfums et de produits pour la toilette",
  },
  "20.51Z": { field: "Fabrication de produits explosifs" },
  "20.52Z": { field: "Fabrication de produits explosifs" },
  "20.53Z": { field: "Fabrication d’huiles essentielles" },
  "20.59Z": {
    field: "Fabrication d’autres produits chimiques n.c.a.",
  },
  "20.60Z": { field: "Fabrication de fibres artificielles ou synthétiques" },

  // 21 - Produits pharmaceutiques
  "21.10Z": { field: "Fabrication de produits pharmaceutiques de base" },
  "21.20Z": {
    field: "Fabrication de préparations pharmaceutiques",
  },

  // 22 - Plastiques et caoutchouc
  "22.2C": {
    field: "Fabrication de pièces techniques à base de matières plastiques",
  },
  "22.19Z": { field: "Fabrication d'autres articles en caoutchouc" },
  "22.29B": {
    field:
      "Fabrication de produits de consommation courante en matières plastiques",
  },
  "22.21Z": {
    field:
      "Fabrication de plaques, feuilles, tubes et profilés en matières plastiques",
  },
  "22.22Z": {
    field: "Fabrication d'emballages en matières plastiques",
  },
  "22.23Z": {
    field: "Fabrication d'éléments en matières plastiques pour la construction",
  },
  "22.29A": {
    field: "Fabrication de pièces techniques à base de matières plastiques",
  },

  // 23 - Autres industries manufacturières
  "23.11Z": { field: "Fabrication de verre plat" },
  "23.12Z": { field: "Façonnage et transformation du verre plat" },
  "23.13Z": { field: "Fabrication de verre creux" },
  "23.14Z": { field: "Fabrication de fibres de verre" },
  "23.19Z": {
    field:
      "Fabrication et façonnage d'autres articles en verre, y compris verre technique",
  },
  "23.20Z": { field: "Fabrication de produits réfractaires" },
  "23.31Z": { field: "Fabrication de carreaux en céramique" },
  "23.32Z": {
    field:
      "Fabrication de briques, tuiles et produits de construction, en terre cuite",
  },
  "23.41Z": {
    field: "Fabrication d'articles céramiques à usage domestique ou ornemental",
  },
  "23.43Z": {
    field: "Fabrication d'isolateurs et pièces isolantes en céramique",
  },
  "23.44Z": {
    field: "Fabrication d'autres produits céramiques à usage technique",
  },
  "23.49Z": { field: "Fabrication d'autres produits céramiques" },
  "23.51Z": { field: "Fabrication de ciment" },
  "23.52Z": { field: "Fabrication de chaux et plâtre" },
  "23.61Z": {
    field: "Fabrication d'éléments en béton pour la construction",
  },
  "23.62Z": { field: "Fabrication d'éléments en plâtre pour la construction" },

  "23.63Z": {
    field: "Fabrication de béton prêt à l'emploi",
  },
  "23.64Z": { field: "Fabrication de mortiers et bétons secs" },
  "23.69Z": {
    field: "Fabrication d'autres ouvrages en béton, en ciment ou en plâtre",
  },
  "23.70Z": { field: "Taille, façonnage et finissage de pierres" },
  "23.91Z": { field: "Fabrication de produits abrasifs" },
  "23.99Z": {
    field: "Fabrication d'autres produits minéraux non métalliques n.c.a.",
  },

  // 24 - Métallurgie
  "24.10Z": { field: "Sidérurgie" },
  "24.20Z": {
    field:
      "Fabrication de tubes, tuyaux, profilés creux et accessoires correspondants en acier",
  },
  "24.31Z": { field: "Étirage à froid de barres" },
  "24.32Z": { field: "Laminage à froid de feuillards" },
  "24.33Z": { field: "Profilage à froid par formage ou pliage" },
  "24.34Z": { field: "Tréfilage à froid" },
  "24.41Z": { field: "Production de métaux précieux" },
  "24.42Z": { field: "Métallurgie de l'aluminium" },
  "24.43Z": { field: "Métallurgie du plomb, du zinc ou de l'étain" },
  "24.44Z": { field: "Métallurgie du cuivre" },
  "24.45Z": { field: "Métallurgie des autres métaux non ferreux" },
  "24.51Z": { field: "Fonderie de fonte" },
  "24.52Z": { field: "Fonderie d'acier" },
  "24.53Z": { field: "Fonderie de métaux légers" },
  "24.54Z": { field: "Fonderie d'autres métaux non ferreux" },

  // 25 - Produits métalliques
  "25.11Z": {
    field: "Fabrication de structures métalliques et de parties de structures",
  },
  "25.12Z": { field: "Fabrication de portes et fenêtres en métal" },
  "25.21Z": {
    field:
      "Fabrication de radiateurs et de chaudières pour le chauffage central",
  },
  "25.29Z": {
    field:
      "Fabrication d'autres réservoirs, citernes et conteneurs métalliques",
  },
  "25.30Z": {
    field:
      "Fabrication de générateurs de vapeur, à l'exception des chaudières pour le chauffage central",
  },
  "25.40Z": { field: "Fabrication d'armes et de munitions" },
  "25.50A": { field: "Forge, estampage, matriçage ; métallurgie des poudres" },
  "25.50B": { field: "Découpage, emboutissage" },
  "25.61Z": {
    field: "Traitement et revêtement des métaux",
  },
  "25.62A": { field: "Décolletage" },
  "25.62B": { field: "Mécanique industrielle" },
  "25.71Z": { field: "Fabrication de coutellerie" },
  "25.72Z": {
    field: "Fabrication de serrures et de ferrures",
  },
  "25.73A": {
    field: "Fabrication de moules et modèles",
  },
  "25.73B": { field: "Fabrication d'autres outillages" },
  "25.91Z": {
    field: "Fabrication de fûts et emballages métalliques similaires",
  },
  "25.92Z": { field: "Fabrication d'emballages métalliques légers" },
  "25.94Z": { field: "Fabrication de vis et de boulons" },
  "25.93Z": {
    field:
      "Fabrication d’articles en fil métallique, de chaînes et de ressorts",
  },
  "25.99A": { field: "Fabrication d'articles métalliques ménagers" },
  "25.99B": { field: "Fabrication d'autres articles métalliques" },

  // 26 - Produits informatiques, électroniques et optiques
  "26.11Z": { field: "Fabrication de composants électroniques" },
  "26.12Z": {
    field: "Fabrication de cartes électroniques assemblées",
  },
  "26.20Z": {
    field: "Fabrication d'ordinateurs et d'équipements périphériques",
  },
  "26.30Z": { field: "Fabrication d'équipements de communication" },
  "26.40Z": { field: "Fabrication de produits électroniques grand public" },
  "26.51A": { field: "Fabrication d'équipements d'aide à la navigation" },
  "26.51B": {
    field: "Fabrication d'instrumentation scientifique et technique",
  },
  "26.52Z": { field: "Horlogerie" },
  "26.60Z": {
    field:
      "Fabrication d'équipements d'irradiation médicale, d'équipements électromédicaux et électrothérapeutiques",
  },
  "26.70Z": { field: "Fabrication de matériels optique et photographique" },

  // 27 - Équipements électriques
  "27.11Z": {
    field:
      "Fabrication de moteurs, génératrices et transformateurs électriques",
  },
  "27.12Z": {
    field: "Fabrication de matériel de distribution et de commande électrique",
  },
  "27.20Z": { field: "Fabrication de piles et d'accumulateurs électriques" },
  "27.31Z": { field: "Fabrication de câbles de fibres optiques" },
  "27.32Z": {
    field: "Fabrication d’autres fils et câbles électroniques ou électriques",
  },
  "27.33Z": { field: "Fabrication de matériel d'installation électrique" },
  "27.40Z": {
    field: "Fabrication d’appareils d’éclairage électrique",
  },
  "27.51Z": { field: "Fabrication d'appareils électroménagers" },
  "27.52Z": { field: "Fabrication d'appareils ménagers non électriques" },
  "27.90Z": { field: "Fabrication d'autres matériels électriques" },

  // 28 - Machines et équipements
  "28.11Z": {
    field:
      "Fabrication de moteurs et turbines, à l'exception des moteurs d'avions et de véhicules",
  },
  "28.12Z": { field: "Fabrication d'équipements hydrauliques et pneumatiques" },

  "28.13Z": {
    field: "Fabrication d’autres pompes et compresseurs",
  },
  "28.14Z": { field: "Fabrication d'autres articles de robinetterie" },
  "28.15Z": {
    field: "Fabrication d’engrenages et d’organes mécaniques de transmission",
  },
  "28.21Z": { field: "Fabrication de fours et brûleurs" },
  "28.22Z": { field: "Fabrication de matériel de levage et de manutention" },
  "28.23Z": {
    field:
      "Fabrication de machines et d'équipements de bureau (à l'exception des ordinateurs et équipements périphériques)",
  },
  "28.24Z": { field: "Fabrication d'outillage portatif à moteur incorporé" },
  "28.25Z": {
    field: "Fabrication d’équipements aérauliques et frigorifiques industriels",
  },
  "28.29A": {
    field:
      "Fabrication d'équipements d'emballage, de conditionnement et de pesage",
  },
  "28.29B": { field: "Fabrication d'autres machines d'usage général" },
  "28.30Z": { field: "Fabrication de machines agricoles et forestières" },

  "28.41Z": {
    field: "Fabrication de machines-outils pour le travail des métaux",
  },
  "28.49Z": { field: "Fabrication d'autres machines-outils" },

  "28.5D": {
    field: "Fabrication d’autres machines d’usage spécifique",
  },
  "28.91Z": { field: "Fabrication de machines pour la métallurgie" },
  "28.92Z": {
    field: "Fabrication de machines pour l'extraction ou la construction",
  },
  "28.93Z": {
    field: "Fabrication de machines pour l'industrie agro-alimentaire",
  },
  "28.94Z": { field: "Fabrication de machines pour les industries textiles" },
  "28.95Z": {
    field: "Fabrication de machines pour les industries du papier et du carton",
  },
  "28.96Z": {
    field:
      "Fabrication de machines pour le travail du caoutchouc ou des plastiques",
  },
  "28.99A": { field: "Fabrication de machines d'imprimerie" },
  "28.99B": { field: "Fabrication d'autres machines spécialisées" },

  // 29 - Véhicules automobiles, remorques et semi-remorques
  "29.10Z": { field: "Construction de véhicules automobiles" },
  "29.20Z": { field: "Fabrication de carrosseries et remorques" },
  "29.31Z": {
    field: "Fabrication d'équipements électriques et électroniques automobiles",
  },
  "29.32Z": { field: "Fabrication d'autres équipements automobiles" },

  // 30 - Fabrication d'autres matériels de transport
  "30.11Z": {
    field: "Construction de navires et de structures flottantes",
  },
  "30.12Z": { field: "Construction de bateaux de plaisance" },
  "30.20Z": {
    field:
      "Construction de locomotives et d'autre matériel ferroviaire roulant",
  },
  "30.30Z": {
    field: "Construction aéronautique et spatiale",
  },
  "30.40Z": { field: "Construction de véhicules militaires de combat" },
  "30.91Z": { field: "Fabrication de motocycles" },
  "30.92Z": {
    field: "Fabrication de bicyclettes et de véhicules pour invalides",
  },
  "30.99Z": { field: "Fabrication d'autres équipements de transport n.c.a." },

  // 31 - Meubles
  "31.01Z": {
    field: "Commerce de gros (commerce interentreprises) de mobilier de bureau",
  },
  "31.02Z": { field: "Fabrication de meubles de cuisine" },
  "31.03Z": { field: "Fabrication de matelas" },
  "31.09A": { field: "Fabrication de sièges d'ameublement d'intérieur" },
  "31.09B": {
    field:
      "Fabrication d'autres meubles et industries connexes de l'ameublement",
  },

  // 32 - Autres industries manufacturières
  "32.11Z": { field: "Frappe de monnaie" },
  "32.12Z": { field: "Fabrication d'articles de joaillerie et bijouterie" },
  "32.13Z": {
    field:
      "Fabrication d'articles de bijouterie fantaisie et articles similaires",
  },
  "32.20Z": { field: "Fabrication d'instruments de musique" },
  "32.30Z": { field: "Fabrication d'articles de sport" },
  "32.40Z": { field: "Fabrication de jeux et jouets" },
  "32.50A": { field: "Fabrication de matériel médico-chirurgical et dentaire" },
  "32.50B": { field: "Fabrication de lunettes" },
  "32.91Z": { field: "Fabrication d'articles de brosserie" },
  "32.99Z": { field: "Autres activités manufacturières n.c.a." },

  // 33 - Réparation et installation de machines et équipements
  "33.11Z": { field: "Réparation d'ouvrages en métaux" },
  "33.12Z": { field: "Réparation de machines et équipements mécaniques" },
  "33.13Z": { field: "Réparation de matériels électroniques et optiques" },
  "33.14Z": { field: "Réparation d'équipements électriques" },
  "33.15Z": { field: "Réparation et maintenance navale" },
  "33.16Z": {
    field: "Réparation et maintenance d'aéronefs et d'engins spatiaux",
  },
  "33.17Z": {
    field: "Réparation et maintenance d'autres équipements de transport",
  },
  "33.19Z": { field: "Réparation d'autres équipements" },
  "33.20A": {
    field:
      "Installation de structures métalliques, chaudronnées et de tuyauterie",
  },
  "33.20B": { field: "Installation de machines et équipements mécaniques" },
  "33.20C": {
    field:
      "Conception d'ensemble et assemblage sur site industriel d'équipements de contrôle des processus industriels",
  },
  "33.20D": {
    field:
      "Installation d'équipements électriques, de matériels électroniques et optiques ou d'autres matériels",
  },

  // 34 - Production et distribution d'électricité, de gaz, de vapeur et d'air conditionné

  // 35 - Énergie
  "35.11Z": { field: "Production d’électricité" },
  "35.12Z": { field: "Transport d’électricité" },
  "35.13Z": { field: "Distribution d’électricité" },
  "35.14Z": { field: "Commerce d’électricité" },
  "35.21Z": { field: "Production de combustibles gazeux" },
  "35.22Z": { field: "Distribution de combustibles gazeux par conduites" },
  "35.23Z": { field: "Commerce de combustibles gazeux par conduites" },
  "35.30Z": {
    field: "Production et distribution de vapeur et d’air conditionné",
  },

  // 36 - Eau
  "36.00Z": {
    field: "Captage, traitement et distribution d’eau",
  },

  // 37 - Assainissement
  "37.00Z": {
    field: "Collecte et traitement des eaux usées",
  },

  // 38 - Déchets
  "38.11Z": {
    field: "Collecte des déchets non dangereux",
  },
  "38.12Z": { field: "Collecte des déchets dangereux" },
  "38.21Z": {
    field: "Traitement et élimination des déchets non dangereux",
  },
  "38.22Z": {
    field: "Traitement et élimination des déchets dangereux",
  },
  "38.31Z": { field: "Démantèlement d'épaves" },
  "38.32Z": {
    field: "Récupération de déchets triés",
  },

  // 39 - Dépollution et autres services de gestion des déchets
  "39.00Z": { field: "Dépollution et autres services de gestion des déchets" },

  // 41 - Construction de bâtiments
  "41.10A": { field: "Promotion immobilière de logements" },
  "41.10B": { field: "Promotion immobilière de bureaux" },
  "41.10C": {
    field: "Promotion immobilière d’autres bâtiments",
  },
  "41.10D": { field: "Supports juridiques de programme" },
  "41.20A": {
    field: "Construction de maisons individuelles",
  },
  "41.20B": {
    field: "Construction d’autres bâtiments",
  },

  // 42 - Génie civil
  "42.11Z": {
    field: "Construction de routes et autoroutes",
  },
  "42.12Z": {
    field: "Construction de voies ferrées de surface et souterraines",
  },
  "42.13A": { field: "Construction d'ouvrages d'art" },
  "42.13B": { field: "Construction et entretien de tunnels" },
  "42.21Z": { field: "Construction de réseaux pour fluides" },
  "42.22Z": {
    field: "Construction de réseaux électriques et de télécommunications",
  },
  "42.91Z": { field: "Construction d'ouvrages maritimes et fluviaux" },
  "42.99Z": {
    field: "Construction d'autres ouvrages de génie civil n.c.a.",
  },

  // 43 - Travaux spécialisés
  "43.11Z": { field: "Travaux de démolition" },
  "43.12A": {
    field: "Travaux de terrassement courants et travaux préparatoires",
  },
  "43.12B": {
    field: "Travaux de terrassement spécialisés ou de grande masse",
  },
  "43.13Z": { field: "Forages et sondages" },
  "43.21A": {
    field: "Travaux d’installation électrique dans tous locaux",
  },
  "43.21B": { field: "Travaux d'installation électrique sur la voie publique" },
  "43.22A": {
    field:
      "Travaux de plomberie et installation de chauffage et de conditionnement d’air",
  },
  "43.22B": {
    field:
      "Travaux d'installation d'équipements thermiques et de climatisation",
  },
  "43.29A": { field: "Travaux d’isolation" },
  "43.29B": { field: "Autres travaux d’isolation" },
  "43.31Z": { field: "Travaux de plâtrerie" },
  "43.32A": {
    field: "Travaux de menuiserie bois et PVC",
  },
  "43.32B": {
    field: "Travaux de menuiserie métallique et serrurerie",
  },
  "43.32C": { field: "Agencement de lieux de vente" },
  "43.33Z": {
    field: "Travaux de revêtement des sols et des murs",
  },
  "43.34Z": {
    field: "Travaux de peinture et vitrerie",
  },
  "43.39Z": { field: "Autres travaux de finition" },
  "43.91A": { field: "Travaux de charpente" },
  "43.91B": {
    field: "Travaux de couverture par éléments",
  },
  "43.99A": { field: "Travaux d’étanchéification" },
  "43.99B": { field: "Travaux de montage de structures métalliques" },
  "43.99C": {
    field: "Travaux de maçonnerie générale et gros œuvre de bâtiment",
  },
  "43.99D": {
    field: "Autres travaux spécialisés de construction",
  },
  "43.99E": { field: "Location avec opérateur de matériel de construction" },

  // 45 - Commerce et réparation d'automobiles
  "45.11Z": {
    field: "Commerce de voitures et de véhicules automobiles légers",
  },
  "45.19Z": { field: "Commerce d'autres véhicules automobiles" },
  "45.20A": {
    field: "Entretien et réparation de véhicules automobiles légers",
  },
  "45.20B": { field: "Entretien et réparation d'autres véhicules automobiles" },
  "45.31Z": { field: "Commerce de gros d'équipements automobiles" },
  "45.32Z": { field: "Commerce de détail d'équipements automobiles" },
  "45.40Z": { field: "Commerce et réparation de motocycles" },

  // 46 - Commerce de gros
  "46.11Z": {
    field:
      "Intermédiaires du commerce en matières premières agricoles, animaux vivants, matières premières textiles et produits semi-finis",
  },
  "46.12B": {
    field:
      "Autres intermédiaires du commerce en combustibles, métaux, minéraux et produits chimiques",
  },
  "46.13Z": {
    field: "Intermédiaires du commerce en bois et matériaux de construction",
  },
  "46.14Z": {
    field:
      "Intermédiaires du commerce en machines, équipements industriels, navires et avions",
  },
  "46.15Z": {
    field:
      "Intermédiaires du commerce en meubles, articles de ménage et quincaillerie",
  },
  "46.16Z": {
    field:
      "Intermédiaires du commerce en textiles, habillement, fourrures, chaussures et articles en cuir",
  },
  "46.17A": { field: "Centrales d'achat alimentaires" },
  "46.17B": {
    field: "Autres intermédiaires du commerce en denrées, boissons et tabac",
  },
  "46.18Z": {
    field:
      "Intermédiaires spécialisés dans le commerce d'autres produits spécifiques",
  },
  "46.19A": { field: "Centrales d'achat non alimentaires" },
  "46.19B": {
    field: "Autres intermédiaires du commerce en produits divers",
  },
  "46.21Z": {
    field:
      "Commerce de gros de céréales, tabac non manufacturé, semences et aliments pour le bétail",
  },
  "46.22Z": {
    field: "Commerce de gros (commerce interentreprises) de fleurs et plantes",
  },
  "46.23Z": {
    field: "Commerce de gros (commerce interentreprises) d'animaux vivants",
  },
  "46.24Z": {
    field: " Commerce de gros (commerce interentreprises) de cuirs et peaux",
  },
  "46.31Z": {
    field: "Commerce de gros (commerce interentreprises) de fruits et légumes",
  },
  "46.32A": {
    field:
      "Commerce de gros (commerce interentreprises) de viandes de boucherie",
  },
  "46.32B": {
    field:
      "Commerce de gros (commerce interentreprises) de produits à base de viande",
  },
  "46.32C": {
    field:
      "Commerce de gros (commerce interentreprises) de volailles et gibier",
  },
  "46.33Z": {
    field:
      "Commerce de gros (commerce interentreprises) de produits laitiers, œufs, huiles et matières grasses comestibles",
  },
  "46.34Z": {
    field: "Commerce de gros de boissons",
  },
  "46.35Z": {
    field:
      "Commerce de gros (commerce interentreprises) de produits à base de tabac",
  },
  "46.36Z": {
    field:
      "Commerce de gros (commerce interentreprises) de sucre, chocolat et confiserie",
  },
  "46.37Z": {
    field:
      "Commerce de gros (commerce interentreprises) de café, thé, cacao et épices",
  },
  "46.38A": {
    field:
      "Commerce de gros (commerce interentreprises) de poissons, crustacés et mollusques",
  },
  "46.38B": {
    field:
      "Commerce de gros (commerce interentreprises) alimentaire spécialisé divers",
  },
  "46.39A": {
    field: "Commerce de gros (commerce interentreprises) de produits surgelés",
  },
  "46.39B": {
    field:
      "Commerce de gros (commerce interentreprises) alimentaire non spécialisé",
  },
  "46.41Z": {
    field: "Commerce de gros (commerce interentreprises) de textiles",
  },
  "46.42Z": {
    field: "Commerce de gros d'habillement et de chaussures",
  },
  "46.43Z": {
    field:
      "Commerce de gros (commerce interentreprises) d'appareils électroménagers",
  },
  "46.44Z": {
    field:
      "Commerce de gros (commerce interentreprises) de vaisselle, verrerie et produits d'entretien",
  },
  "46.45Z": {
    field:
      "Commerce de gros (commerce interentreprises) de parfumerie et de produits de beauté",
  },
  "46.46Z": {
    field:
      "Commerce de gros (commerce interentreprises) de produits pharmaceutiques",
  },
  "46.47Z": {
    field:
      "Commerce de gros (commerce interentreprises) de meubles, de tapis et d'appareils d'éclairage",
  },
  "46.48Z": {
    field:
      "Commerce de gros (commerce interentreprises) d'articles d'horlogerie et de bijouterie",
  },
  "46.49Z": {
    field: "Commerce de gros d'autres biens domestiques",
  },
  "46.51Z": {
    field:
      "Commerce de gros (commerce interentreprises) d'ordinateurs, d'équipements informatiques périphériques et de logiciels",
  },
  "46.52Z": {
    field:
      "Commerce de gros (commerce interentreprises) de composants et d'équipements électroniques et de télécommunication",
  },
  "46.61Z": {
    field: "Commerce de gros (commerce interentreprises) de matériel agricole",
  },
  "46.62Z": {
    field: "Commerce de gros (commerce interentreprises) de machines-outils",
  },
  "46.63Z": {
    field:
      "Commerce de gros (commerce interentreprises) de machines pour l'extraction, la construction et le génie civil",
  },
  "46.64Z": {
    field:
      "Commerce de gros (commerce interentreprises) de machines pour l'industrie textile et l'habillement",
  },
  "46.65Z": {
    field: "Commerce de gros (commerce interentreprises) de mobilier de bureau",
  },
  "46.66Z": {
    field:
      "Commerce de gros (commerce interentreprises) d'autres machines et équipements de bureau",
  },
  "46.69A": {
    field:
      "Commerce de gros (commerce interentreprises) de matériel électrique",
  },
  "46.69B": {
    field: "Commerce de gros de fournitures et équipements industriels divers",
  },
  "46.69C": {
    field:
      "Commerce de gros (commerce interentreprises) de fournitures et équipements divers pour le commerce et les services",
  },
  "46.71Z": {
    field: "Commerce de gros de combustibles et de produits annexes",
  },
  "46.72Z": {
    field: "Commerce de gros de minerais et métaux",
  },
  "46.73A": {
    field: "Commerce de gros de bois et de matériaux de construction",
  },
  "46.90Z": {
    field: "Commerce de gros (commerce interentreprises) non spécialisé",
  },
  "46.73B": {
    field:
      "Commerce de gros (commerce interentreprises) d'appareils sanitaires et de produits de décoration",
  },
  "46.74A": {
    field: "Commerce de gros (commerce interentreprises) de quincaillerie",
  },
  "46.74B": {
    field:
      "Commerce de gros (commerce interentreprises) de fournitures pour la plomberie et le chauffage",
  },
  "46.75Z": {
    field: "Commerce de gros (commerce interentreprises) de produits chimiques",
  },
  "46.76Z": {
    field:
      "Commerce de gros (commerce interentreprises) d'autres produits intermédiaires",
  },
  "46.77Z": {
    field: "Commerce de gros (commerce interentreprises) de déchets et débris",
  },

  // 47 - Commerce de détail
  "47.11A": { field: "Commerce de détail de produits surgelés" },
  "47.11B": { field: "Commerce d'alimentation générale" },
  "47.11C": { field: "Supérettes" },
  "47.11D": {
    field: "Supermarchés",
  },
  "47.11E": { field: "Magasins multi-commerces" },
  "47.11F": { field: "Hypermarchés" },
  "47.19A": { field: "Grands magasins" },
  "47.19B": { field: "Autres commerces de détail en magasin non spécialisé" },
  "47.21Z": {
    field: "Commerce de détail de fruits et légumes en magasin spécialisé",
  },
  "47.22Z": {
    field:
      "Commerce de détail de viandes et de produits à base de viande en magasin spécialisé",
  },
  "47.23Z": {
    field:
      "Commerce de détail de poissons, crustacés et mollusques en magasin spécialisé",
  },
  "47.24Z": {
    field:
      "Commerce de détail de pain, pâtisserie et confiserie en magasin spécialisé",
  },
  "47.25Z": { field: "Commerce de détail de boissons en magasin spécialisé" },
  "47.26Z": {
    field:
      "Commerce de détail de produits à base de tabac en magasin spécialisé",
  },
  "47.29Z": {
    field: "Autres commerces de détail alimentaires en magasin spécialisé",
  },
  "47.30Z": { field: "Commerce de détail de carburants en magasin spécialisé" },
  "47.41Z": {
    field:
      "Commerce de détail d'ordinateurs, d'unités périphériques et de logiciels en magasin spécialisé",
  },
  "47.42Z": {
    field:
      "Commerce de détail de matériels de télécommunication en magasin spécialisé",
  },
  "47.43Z": {
    field:
      "Commerce de détail de matériels audio et vidéo en magasin spécialisé",
  },
  "47.51Z": { field: "Commerce de détail de textiles en magasin spécialisé" },
  "47.52A": {
    field:
      "Commerce de détail de quincaillerie, peintures et verres en petites surfaces (moins de 400 m²)",
  },
  "47.52B": {
    field:
      "Commerce de détail de quincaillerie, peintures et verres en grandes surfaces (400 m² et plus)",
  },
  "47.53Z": {
    field:
      "Commerce de détail de tapis, moquettes et revêtements de murs et de sols en magasin spécialisé",
  },
  "47.54Z": {
    field:
      "Commerce de détail d'appareils électroménagers en magasin spécialisé",
  },
  "47.59A": { field: "Commerce de détail de meubles" },
  "47.59B": { field: "Commerce de détail d'autres équipements du foyer" },
  "47.61Z": { field: "Commerce de détail de livres en magasin spécialisé" },
  "47.62Z": {
    field: "Commerce de détail de journaux et papeterie en magasin spécialisé",
  },
  "47.63Z": {
    field:
      "Commerce de détail d'enregistrements musicaux et vidéo en magasin spécialisé",
  },
  "47.64Z": {
    field: "Commerce de détail d'articles de sport en magasin spécialisés",
  },
  "47.65Z": {
    field: "Commerce de détail de jeux et jouets en magasin spécialisé",
  },
  "47.71Z": {
    field: "Commerce de détail d'habillement en magasin spécialisé",
  },
  "47.72A": { field: "Commerce de détail de la chaussure" },
  "47.72B": {
    field: "Commerce de détail de maroquinerie et d'articles de voyage",
  },
  "47.73Z": {
    field:
      "Commerce de détail de produits pharmaceutiques en magasin spécialisé",
  },
  "47.74Z": {
    field:
      "Commerce de détail d'articles médicaux et orthopédiques en magasin spécialisé",
  },
  "47.75Z": {
    field:
      "Commerce de détail de parfumerie et de produits de beauté en magasin spécialisé",
  },
  "47.76Z": {
    field:
      "Commerce de détail de fleurs, plantes, graines, engrais, animaux de compagnie et aliments pour ces animaux en magasin spécialisé",
  },
  "47.77Z": {
    field:
      "Commerce de détail d'articles d'horlogerie et de bijouterie en magasin spécialisé",
  },
  "47.78A": {
    field: "Commerce de détail d'optiques",
  },
  "47.78B": { field: "Commerces de détail de charbons et combustibles" },

  "47.78C": {
    field: "Autres commerces de détail spécialisés divers",
  },
  "47.79Z": {
    field: "Commerce de détail de biens d'occasion en magasin",
  },
  "47.81Z": {
    field: "Commerce de détail alimentaire sur éventaires et marchés",
  },
  "47.82Z": {
    field:
      "Commerce de détail de textiles, d'habillement et de chaussures sur éventaires et marchés",
  },
  "47.89Z": { field: "Autres commerces de détail sur éventaires et marchés" },
  "47.91A": { field: "Vente à distance sur catalogue général" },
  "47.91B": { field: "Vente à distance sur catalogue spécialisé" },
  "47.99A": { field: "Vente à domicile" },
  "47.99B": {
    field:
      "Vente par automates et autres commerces de détail hors magasin, éventaires ou marchés n.c.a.",
  },

  // 49 - Transports terrestres et transport par conduites
  "49.10Z": { field: "Transport ferroviaire interurbain de voyageurs" },
  "49.20Z": { field: "Transports ferroviaires de fret" },
  "49.31Z": {
    field: "Transports urbains et suburbains de voyageurs",
  },
  "49.32Z": { field: "Transports de voyageurs par taxis" },
  "49.39A": { field: "Transports routiers réguliers de voyageurs" },
  "49.39B": { field: "Autres transports routiers de voyageurs" },
  "49.39C": {
    field: "Autres transports routiers de voyageurs",
  },
  "49.41A": { field: "Transports routiers de fret interurbains" },
  "49.41B": { field: "Transports routiers de fret de proximité" },
  "49.41C": { field: "Location de camions avec chauffeur" },
  "49.42Z": { field: "Services de déménagement" },
  "49.50Z": { field: "Transports par conduites" },

  // 50 - Transport maritime et côtier
  "50.10Z": { field: "Transports maritimes et côtiers de passagers" },
  "50.20Z": { field: "Transports maritimes et côtiers de fret" },
  "50.30Z": { field: "Transports fluviaux de passagers" },
  "50.40Z": { field: "Transports fluviaux de fret" },

  // 51 - Transport aérien
  "52.10A": { field: "Entreposage et stockage frigorifique" },

  "51.10Z": { field: "Transports aériens de passagers" },
  "51.22Z": { field: "Transports spatiaux" },
  "52.23Z": { field: "Services auxiliaires des transports aériens" },
  "52.24A": { field: "Manutention portuaire" },
  "52.24B": { field: "Manutention non portuaire" },

  // 52 - Entreposage et transport
  "52.10B": {
    field: "Entreposage et stockage non frigorifique",
  },
  "52.21Z": {
    field: "Services auxiliaires des transports terrestres",
  },
  "52.22Z": {
    field: "Services auxiliaires des transports par eau",
  },
  "52.29A": {
    field: "Messagerie, fret express",
  },
  "52.29B": {
    field: "Affrètement et organisation des transports",
  },

  // 53 - Activités postales et de courrier
  "53.10Z": {
    field:
      "Activités de poste dans le cadre d'une obligation de service universel",
  },
  "53.20Z": { field: "Autres activités de poste et de courrier" },

  "55.10": { field: "Hôtels et hébergement similaire" },
  // 55 - Hébergement
  "55.10Z": { field: "Hôtels et hébergement similaire" },
  "55.20Z": {
    field: "Hébergement touristique et autre hébergement de courte durée",
  },
  "55.30Z": {
    field:
      "Terrains de camping et parcs pour caravanes ou véhicules de loisirs",
  },
  "55.90Z": { field: "Autres hébergements" },

  // 56 - Restauration
  "56.10A": { field: "Restauration traditionnelle" },
  "56.10B": { field: "Cafétérias et autres libres-services" },
  "56.10C": {
    field: "Restauration de type rapide",
  },
  "56.21Z": { field: "Services des traiteurs" },

  "56.29A": {
    field: "Restauration collective sous contrat",
  },
  "56.29B": { field: "Autres services de restauration n.c.a." },

  "56.30Z": { field: "Débits de boissons" },

  // 58 - Édition
  "58.11Z": { field: "Édition de livres" },
  "58.13Z": { field: "Édition de journaux" },
  "58.14Z": { field: "Édition de revues et périodiques" },
  "58.19Z": { field: "Autres activités d'édition" },
  "58.29A": { field: "Édition de logiciels système et de réseau" },
  "58.29B": {
    field: "Edition de logiciels outils de développement et de langages",
  },
  "58.29C": { field: "Edition de logiciels applicatifs" },

  // 59 - Production de films et de programmes de télévision, enregistrement sonore et édition musicale
  "59.11A": {
    field: "Production de films et de programmes pour la télévision",
  },
  "59.11B": { field: "Production de films institutionnels et publicitaires" },
  "59.11C": { field: "Production de films pour le cinéma" },
  "59.12Z": {
    field:
      "Post-production de films cinématographiques, de vidéo et de programmes de télévision",
  },
  "59.13A": { field: "Distribution de films cinématographiques" },
  "59.13B": { field: "Edition et distribution vidéo" },
  "59.14Z": { field: "Projection de films cinématographiques" },
  "59.20Z": { field: "Enregistrement sonore et édition musicale" },

  // 60 - Programmation et diffusion
  "60.10Z": { field: "Édition et diffusion de programmes radio" },
  "60.20A": { field: "Edition de chaînes généralistes" },
  "60.20B": { field: "Edition de chaînes thématiques" },

  // 61 - Télécommunications
  "61.10Z": { field: "Télécommunications filaires" },
  "61.20Z": { field: "Télécommunications sans fil" },
  "61.30Z": { field: "Télécommunications par satellite" },
  "61.90Z": { field: "Autres activités de télécommunication" },

  // 62 - Programmation, conseil et activités informatiques
  "62.01Z": { field: "Programmation informatique" },
  "62.02A": {
    field: "Conseil en systèmes et logiciels informatiques",
  },
  "62.02B": {
    field: "Tierce maintenance de systèmes et d'applications informatiques",
  },
  "62.03Z": { field: "Gestion d'installations informatiques" },
  "62.09Z": { field: "Autres activités informatiques" },

  // 63 - Services d'information
  "63.11Z": {
    field: "Traitement de données, hébergement et activités connexes",
  },
  "63.12Z": { field: "Portails Internet" },
  "63.91Z": { field: "Activités des agences de presse" },
  "63.99Z": { field: "Autres services d'information n.c.a." },

  // 64 - Services financiers
  "64.11Z": { field: " Activités de banque centrale" },
  "64.19Z": {
    field: "Autres intermédiations monétaires",
  },
  "64.20Z": {
    field: "Activités des sociétés holding",
  },
  "64.30Z": {
    field: "Fonds de placement et entités financières similaires",
  },
  "64.91Z": { field: "Crédit-bail" },
  "64.92Z": { field: "Autre distribution de crédit" },
  "64.99Z": {
    field:
      "Autres activités des services financiers, hors assurance et caisses de retraite, n.c.a.",
  },

  // 65 - Assurance
  "65.11Z": { field: "Assurance vie" },
  "65.12Z": {
    field: "Autres assurances",
  },
  "65.20Z": { field: "Réassurance" },
  "65.30Z": { field: "Caisses de retraite" },

  // 66 - Activités auxiliaires de services financiers et d'assurance
  "66.10A": {
    field: "Supports juridiques de gestion de patrimoine mobilier",
  },
  "66.11Z": { field: "Administration de marchés financiers" },
  "66.12Z": { field: "Courtage de valeurs mobilières et de marchandises" },
  "66.19A": { field: "Supports juridiques de gestion de patrimoine mobilier" },
  "66.19B": {
    field:
      "Autres activités auxiliaires de services financiers, hors assurance et caisses de retraite, n.c.a.",
  },
  "66.21Z": { field: "Évaluation des risques et dommages" },
  "66.22Z": {
    field: "Activités des agents et courtiers d’assurances",
  },
  "66.29Z": {
    field: "Autres activités auxiliaires d'assurance et de caisses de retraite",
  },
  "66.30Z": {
    field: "Gestion de fonds",
  },

  // 68 - Activités immobilières
  "68.10Z": {
    field: "Activités des marchands de biens immobiliers",
  },
  "68.20A": { field: "Location de logements" },
  "68.20B": {
    field: "Location de terrains et d’autres biens immobiliers",
  },
  "68.31Z": {
    field: "Agences immobilières",
  },
  "68.32A": {
    field: "Administration d’immeubles et autres biens immobiliers",
  },
  "68.32B": {
    field: "Supports juridiques de gestion de patrimoine immobilier",
  },

  // 69 - Activités juridiques et comptables
  "69.10Z": { field: "Activités juridiques" },
  "69.20Z": {
    field: "Activités comptables",
  },

  // 70 - Activités des sièges sociaux et conseil
  "70.10Z": { field: "Activités des sièges sociaux" },
  "70.1A": {
    field: "Promotions immobilières de logements",
  },
  "70.1D": {
    field: "Supports juridiques de programme",
  },
  "70.1F": {
    field: "Marchands de biens immobiliers",
  },
  "70.2A": {
    field: "Location de logements",
  },
  "70.2C": {
    field: "Location d'autres biens immobiliers",
  },
  "70.21Z": {
    field: "Conseil en relations publiques et communication",
  },
  "70.22Z": {
    field: "Conseil pour les affaires et autres conseils de gestion",
  },
  "70.3A": { field: "Agence immobilière" },
  "70.3C": {
    field: "Administration d'immeubles résidentiels",
  },

  // 71 - Architecture et ingénierie
  "71.11Z": {
    field: "Activités d'architecture",
  },
  "71.12A": { field: "Activité des géomètres" },
  "71.12B": {
    field: "Ingénierie, études techniques",
  },
  "71.20A": { field: "Contrôle technique automobile" },
  "71.20B": {
    field: "Analyses, essais et inspections techniques",
  },

  // 72 - Recherche-développement
  "72.11Z": { field: "Recherche-développement en biotechnologie" },
  "72.19Z": {
    field: "Recherche-développement en autres sciences physiques et naturelles",
  },
  "72.20Z": {
    field: "Recherche-développement en sciences humaines et sociales",
  },

  // 73 - Publicité
  "73.11Z": {
    field: "Activités des agences de publicité",
  },
  "73.12Z": { field: "Régie publicitaire de médias" },
  "73.20Z": { field: "Études de marché et sondages" },

  // 74 - Activités spécialisées, scientifiques et techniques
  "74.10Z": { field: "Activités spécialisées de design" },
  "74.20Z": { field: "Activités photographiques" },
  "74.30Z": { field: "Traduction et interprétation" },

  "74.90A": {
    field: "Activité des économistes de la construction",
  },
  "74.90B": {
    field: "Activités spécialisées, scientifiques et techniques diverses",
  },

  // 75 - Activités vétérinaires
  "75.00Z": { field: "Activités vétérinaires" },

  // 77 - Activités de location et location-bail
  "77.11A": {
    field:
      "Location de courte durée de voitures et de véhicules automobiles légers",
  },
  "77.11B": {
    field:
      "Location de longue durée de voitures et de véhicules automobiles légers",
  },
  "77.12Z": { field: "Location et location-bail de camions" },
  "77.14": { field: "" },
  "77.21Z": {
    field: "Location et location-bail d'articles de loisirs et de sport",
  },
  "77.22Z": { field: "Location de vidéocassettes et disques vidéo" },
  "77.29Z": {
    field: "Location et location-bail d'autres biens personnels et domestiques",
  },
  "77.31Z": {
    field: "Location et location-bail de machines et équipements agricoles",
  },
  "77.32Z": {
    field:
      "Location et location-bail de machines et équipements pour la construction",
  },
  "77.33Z": {
    field:
      "Location et location-bail de machines de bureau et de matériel informatique",
  },
  "77.34Z": {
    field: "Location et location-bail de matériels de transport par eau",
  },
  "77.35Z": {
    field: "Location et location-bail de matériels de transport aérien",
  },
  "77.39Z": {
    field:
      "Location et location-bail d'autres machines, équipements et biens matériels n.c.a.",
  },
  "77.40Z": {
    field:
      "Location-bail de propriété intellectuelle et de produits similaires, à l'exception des œuvres soumises à copyright",
  },

  // 78 - Activités liées à l'emploi
  "78.10Z": { field: "Activités des agences de placement de main-d'œuvre" },
  "78.20Z": { field: "Activités des agences de travail temporaire" },
  "78.30Z": {
    field: "Autre mise à disposition de ressources humaines",
  },

  // 79 - Activités des agences de voyage, voyagistes, services de réservation et activités connexes
  "79.11Z": { field: "Activités des agences de voyage" },
  "79.12Z": { field: "Activités des voyagistes" },
  "79.90Z": { field: "Autres services de réservation et activités connexes" },

  // 80 - Activités de sécurité et d'enquête
  "80.10Z": { field: "Activités de sécurité privée" },
  "80.20Z": { field: "Activités liées aux systèmes de sécurité" },
  "80.30Z": { field: "Activités d'enquête" },

  // 81 - Services relatifs aux bâtiments
  "81.10Z": {
    field: "Services combinés de soutien lié aux bâtiments",
  },
  "81.21Z": {
    field: "Nettoyage courant des bâtiments",
  },
  "81.22Z": {
    field:
      "Autres activités de nettoyage des bâtiments et nettoyage industriel",
  },
  "81.29A": { field: "Désinfection, désinsectisation, dératisation" },
  "81.29B": { field: "Autres activités de nettoyage n.c.a." },
  "81.30Z": { field: "Services d'aménagement paysager" },

  // 82 - Activités administratives et autres activités de soutien
  "82.11Z": {
    field: "Services administratifs combinés de bureau",
  },
  "82.19Z": {
    field:
      "Photocopie, préparation de documents et autres activités spécialisées de soutien de bureau",
  },
  "82.20Z": { field: "Activités de centres d'appels" },
  "82.30Z": {
    field: "Organisation de foires, salons professionnels et congrès",
  },
  "82.91Z": {
    field:
      "Activités des agences de recouvrement de factures et des sociétés d'information financière sur la clientèle",
  },
  "82.92Z": { field: "Activités de conditionnement" },
  "82.99Z": {
    field: "Autres activités de soutien aux entreprises n.c.a.",
  },

  // 84 - Administration publique
  "84.11Z": {
    field: "Administration publique générale",
  },
  "84.12Z": {
    field:
      "Administration publique (tutelle) de la santé, de la formation, de la culture et des services sociaux",
  },
  "84.13Z": {
    field: "Administration publique (tutelle) des activités sociales",
  },
  "84.22Z": { field: "Défense" },
  "84.23Z": { field: "Justice" },
  "84.24Z": {
    field: "Sécurité et ordre public",
  },
  "84.25Z": { field: "Services du feu et de secours" },
  "84.30A": {
    field: "Activités générales de sécurité sociale",
  },
  "84.30B": {
    field: "Distribution sociale de revenus",
  },
  "84.30C": {
    field: "Distribution sociale de revenus sans contrepartie",
  },

  // 85 - Enseignement
  "85.10Z": { field: "Enseignement pré-primaire" },
  "85.20Z": { field: "Enseignement primaire" },
  "85.31Z": {
    field: "Enseignement secondaire général",
  },
  "85.32Z": {
    field: "Enseignement secondaire technique ou professionnel",
  },
  "85.41Z": {
    field: "Enseignement post-secondaire non supérieur",
  },
  "85.42Z": {
    field: "Enseignement supérieur",
  },
  "85.51Z": {
    field: "Enseignement de disciplines sportives et d’activités de loisirs",
  },
  "85.52Z": { field: "Enseignement culturel" },
  "85.53Z": { field: "Enseignement de la conduite" },
  "85.59A": {
    field: "Formation continue d’adultes",
  },
  "85.59B": {
    field: "Autres enseignements",
  },
  "85.60Z": { field: "Activités de soutien à l'enseignement" },

  // 86 - Santé humaine
  "86.10Z": { field: "Activités hospitalières" },
  "86.21Z": {
    field: "Activité des médecins généralistes",
  },
  "86.22A": { field: "Activités de radiodiagnostic et de radiothérapie" },
  "86.22B": { field: "Activités chirurgicales" },
  "86.22C": { field: "Autres activités des médecins spécialistes" },
  "86.22Z": { field: "Activité des médecins spécialistes" },
  "86.23Z": { field: "Pratique dentaire" },
  "86.90A": { field: "Ambulances" },
  "86.90B": { field: "Laboratoires d'analyses médicales" },
  "86.90C": { field: "Centres de collecte et banques d'organes" },
  "86.90D": { field: "Activités des infirmiers et des sages-femmes" },
  "86.90E": {
    field:
      "Activités des professionnels de la rééducation, de l’appareillage et des pédicures-podologues",
  },
  "86.90F": { field: "Activités de santé humaine non classées ailleurs" },

  // 87 - Hébergement médico-social et social
  "87.10A": {
    field: "Hébergement médicalisé pour personnes âgées",
  },
  "87.10B": { field: "Hébergement médicalisé pour enfants handicapés" },
  "87.10C": {
    field:
      "Hébergement médicalisé pour adultes handicapés et autre hébergement médicalisé",
  },
  "87.20A": {
    field: "Hébergement social pour handicapés mentaux et malades mentaux",
  },
  "87.20B": {
    field: "Hébergement social pour toxicomanes",
  },

  "87.30A": {
    field: "Hébergement social pour enfants en difficultés",
  },
  "87.30B": { field: "Hébergement social pour handicapés physiques" },
  "87.90A": {
    field: "Hébergement social pour enfants en difficultés",
  },
  "87.90B": {
    field:
      "Hébergement social pour adultes et familles en difficultés et autre hébergement social",
  },

  // 88 - Action sociale sans hébergement
  "88.10A": { field: "Aide à domicile" },
  "88.10B": {
    field:
      "Accueil ou accompagnement sans hébergement d'adultes handicapés ou de personnes âgées",
  },
  "88.10C": { field: "Aide par le travail" },
  "88.91A": {
    field: "Accueil de jeunes enfants",
  },
  "88.91B": {
    field: "Accueil ou accompagnement sans hébergement d'enfants handicapés",
  },
  "88.99A": {
    field:
      "Autre accueil ou accompagnement sans hébergement d'enfants et d'adolescents",
  },
  "88.99B": {
    field: "Autre action sociale sans hébergement n.c.a.",
  },

  // 90 - Activités créatives, artistiques et de spectacle
  "90.01Z": { field: "Arts du spectacle vivant" },
  "90.02Z": { field: "Activités de soutien au spectacle vivant" },
  "90.03A": { field: "Création artistique relevant des arts plastiques" },
  "90.03B": { field: "Autre création artistique" },
  "90.04Z": { field: "Gestion de salles de spectacles" },

  // 91 - Bibliothèques, archives, musées et autres activités culturelles
  "91.01Z": { field: "Gestion des bibliothèques et des archives" },
  "91.02Z": { field: "Gestion des musées" },
  "91.03Z": {
    field:
      "Gestion des sites et monuments historiques et des attractions touristiques similaires",
  },
  "91.04Z": {
    field:
      "Gestion des jardins botaniques et zoologiques et des réserves naturelles",
  },

  // 92 - Activités de jeux de hasard et d'argent
  "92.00Z": { field: "Organisation de jeux de hasard et d'argent" },

  // 93 - Activités sportives et récréatives
  "93.11Z": {
    field: "Gestion d’installations sportives",
  },
  "93.12Z": {
    field: "Activités des clubs de sports",
  },
  "93.13Z": {
    field: "Activités des centres de culture physique",
  },
  "93.19Z": { field: "Autres activités liées au sport" },

  "93.21Z": {
    field: "Activités des parcs d’attractions et parcs à thèmes",
  },
  "93.29Z": {
    field: "Autres activités récréatives et de loisirs",
  },

  // 94 - Organisations associatives
  "94.11Z": {
    field: "Activités des organisations patronales et consulaires",
  },
  "94.12Z": {
    field: "Activités des organisations professionnelles",
  },
  "94.20Z": {
    field: "Activités des syndicats de salariés",
  },
  "94.91Z": {
    field: "Activités des organisations religieuses",
  },
  "94.92Z": { field: "Activités des organisations politiques" },
  "94.99Z": {
    field: "Autres organisations fonctionnant par adhésion volontaire",
  },

  // 95 - Réparation d'ordinateurs et de biens personnels et domestiques
  "95.11Z": {
    field: "Réparation d'ordinateurs et d'équipements périphériques",
  },
  "95.12Z": { field: "Réparation d'équipements de communication" },
  "95.21Z": { field: "Réparation de produits électroniques grand public" },
  "95.22Z": {
    field:
      "Réparation d'appareils électroménagers et d'équipements pour la maison et le jardin",
  },
  "95.23Z": { field: "Réparation de chaussures et d'articles en cuir" },
  "95.24Z": { field: "Réparation de meubles et d'équipements du foyer" },
  "95.25Z": { field: "Réparation d'articles d'horlogerie et de bijouterie" },
  "95.29Z": { field: "Réparation d'autres biens personnels et domestiques" },

  // 96 - Autres services personnels
  "96.01A": { field: "Blanchisserie-teinturerie de gros" },
  "96.01B": { field: "Blanchisserie-teinturerie de détail" },
  "96.02A": {
    field: "Coiffure",
  },
  "96.02B": { field: "Soins de beauté" },
  "96.03Z": {
    field: "Services funéraires",
  },
  "96.04Z": { field: "Entretien corporel" },
  "96.09Z": { field: "Autres services personnels n.c.a." },

  // 99 - Activités des ménages en tant qu'employeurs de personnel domestique
  "99.00Z": {
    field: "Activités des organisations et organismes extraterritoriaux",
  },
};

export type NafCode = keyof typeof NAF_MAP;
export const NAF_CODES = Object.keys(NAF_MAP) as [NafCode, ...NafCode[]];

export type NafCategory =
  | "TECHNIQUES_INDETERMINEES"
  | "EXPLOITATIONS_AGRICOLES_SITES_RURAUX"
  | "EXTRACTION_INDUSTRIES_PRIMAIRES"
  | "INDUSTRIE_AGROALIMENTAIRE_BOISSONS"
  | "INDUSTRIE_MANUFACTURIERE_LEGERE"
  | "INDUSTRIE_LOURDE_CHIMIE_MATERIAUX"
  | "METALLURGIE_TRANSFORMATION_METAUX"
  | "INDUSTRIE_EQUIPEMENTS_MACHINES"
  | "INDUSTRIE_TRANSPORT_MOBILITE"
  | "INDUSTRIE_DIVERSE_MAINTENANCE"
  | "ENERGIE_EAU_ENVIRONNEMENT"
  | "BTP_TRAVAUX"
  | "COMMERCE_DISTRIBUTION"
  | "TRANSPORT_LOGISTIQUE"
  | "HOTELLERIE_RESTAURATION"
  | "BUREAUX_SERVICES_NUMERIQUES"
  | "FINANCE_IMMOBILIER"
  | "GESTION_IMMOBILIERE"
  | "SERVICES_PROFESSIONNELS"
  | "SERVICES_OPERATIONNELS_SUPPORT"
  | "SECTEUR_MEDICO_SOCIAL"
  | "SECTEUR_PUBLIC"
  | "CULTURE_SPORT_SERVICES_PERSONNE";

export enum LocationTypeNafCategoryEnum {
  BUREAUX_TERTIAIRE = "BUREAUX_TERTIAIRE",
  RESIDENTIEL_COLLECTIF_GERE = "RESIDENTIEL_COLLECTIF_GERE",
  SITES_INDUSTRIELS_USINES = "SITES_INDUSTRIELS_USINES",
  LOGISTIQUE_ENTREPOSAGE = "LOGISTIQUE_ENTREPOSAGE",
  BTP_BASES_TECHNIQUES = "BTP_BASES_TECHNIQUES",
  HOTELLERIE_TOURISME_LOISIRS = "HOTELLERIE_TOURISME_LOISIRS",
  SANTE_MEDICO_SOCIAL = "SANTE_MEDICO_SOCIAL",
  ENSEIGNEMENT_BATIMENTS_PUBLICS = "ENSEIGNEMENT_BATIMENTS_PUBLICS",
  COMMERCE_ERP = "COMMERCE_ERP",
  SERVICES_OPERATIONNELS_SUPPORT = "SERVICES_OPERATIONNELS_SUPPORT",
  CULTURE_SPORT_SERVICES_PERSONNE = "CULTURE_SPORT_SERVICES_PERSONNE",
}

export type LocationTypeNafCategory = keyof typeof LocationTypeNafCategoryEnum;

export const NAF_CATEGORY_LABELS: Record<NafCategory, string> = {
  TECHNIQUES_INDETERMINEES: "Codes techniques / indéterminés",
  EXPLOITATIONS_AGRICOLES_SITES_RURAUX:
    "Exploitations agricoles & sites ruraux",
  EXTRACTION_INDUSTRIES_PRIMAIRES: "Extraction & industries primaires",
  INDUSTRIE_AGROALIMENTAIRE_BOISSONS: "Industrie agroalimentaire & boissons",
  INDUSTRIE_MANUFACTURIERE_LEGERE: "Industrie manufacturière légère",
  INDUSTRIE_LOURDE_CHIMIE_MATERIAUX: "Industrie lourde, chimie & matériaux",
  METALLURGIE_TRANSFORMATION_METAUX: "Métallurgie & transformation des métaux",
  INDUSTRIE_EQUIPEMENTS_MACHINES: "Industrie équipements & machines",
  INDUSTRIE_TRANSPORT_MOBILITE: "Industrie transport & mobilité",
  INDUSTRIE_DIVERSE_MAINTENANCE: "Industrie diverse & maintenance",
  ENERGIE_EAU_ENVIRONNEMENT: "Énergie, eau & environnement",
  BTP_TRAVAUX: "BTP & travaux",
  COMMERCE_DISTRIBUTION: "Commerce & distribution",
  TRANSPORT_LOGISTIQUE: "Transport & logistique",
  HOTELLERIE_RESTAURATION: "Hôtellerie & restauration",
  BUREAUX_SERVICES_NUMERIQUES: "Bureaux & services numériques",
  FINANCE_IMMOBILIER: "Finance & immobilier",
  GESTION_IMMOBILIERE: "Gestion immobilière",
  SERVICES_PROFESSIONNELS: "Services professionnels",
  SERVICES_OPERATIONNELS_SUPPORT: "Services opérationnels & support",
  SECTEUR_MEDICO_SOCIAL: "Secteur médico-social",
  SECTEUR_PUBLIC: "Secteur public",
  CULTURE_SPORT_SERVICES_PERSONNE: "Culture, sport & services à la personne",
};

export const TYPE_LOCATION_LABELS: Record<LocationTypeNafCategory, string> = {
  BUREAUX_TERTIAIRE: "Bureaux & tertiaires",
  RESIDENTIEL_COLLECTIF_GERE: "Résidentiel collectif & géré",
  SITES_INDUSTRIELS_USINES: "Sites industriels & usines",
  LOGISTIQUE_ENTREPOSAGE: "Logistique & entreposage",
  BTP_BASES_TECHNIQUES: "BTP & bases techniques",
  HOTELLERIE_TOURISME_LOISIRS: "Hôtellerie, tourisme & loisirs",
  SANTE_MEDICO_SOCIAL: "Santé & médico-social",
  ENSEIGNEMENT_BATIMENTS_PUBLICS: "Enseignement & bâtiments publics",
  COMMERCE_ERP: "Commerce & ERP",
  SERVICES_OPERATIONNELS_SUPPORT: "Services opérationnels & support",
  CULTURE_SPORT_SERVICES_PERSONNE: "Culture, sport & services à la personne",
};

const NAF_CATEGORY_RULES: Record<NafCategory, (code: NafCode) => boolean> = {
  TECHNIQUES_INDETERMINEES: (code) =>
    code.startsWith("00.") || code === "99.00Z",
  EXPLOITATIONS_AGRICOLES_SITES_RURAUX: (code) =>
    code.startsWith("01.") || code.startsWith("02.") || code.startsWith("03."),
  EXTRACTION_INDUSTRIES_PRIMAIRES: (code) =>
    code.startsWith("05.") ||
    code.startsWith("06.") ||
    code.startsWith("07.") ||
    code.startsWith("08.") ||
    code.startsWith("09."),
  INDUSTRIE_AGROALIMENTAIRE_BOISSONS: (code) =>
    code.startsWith("10.") || code.startsWith("11.") || code === "12.00Z",
  INDUSTRIE_MANUFACTURIERE_LEGERE: (code) =>
    code.startsWith("13.") ||
    code.startsWith("14.") ||
    code.startsWith("15.") ||
    code.startsWith("16.") ||
    code.startsWith("17.") ||
    code.startsWith("18."),
  INDUSTRIE_LOURDE_CHIMIE_MATERIAUX: (code) =>
    code.startsWith("19.") ||
    code.startsWith("20.") ||
    code.startsWith("21.") ||
    code.startsWith("22.") ||
    code.startsWith("23."),
  METALLURGIE_TRANSFORMATION_METAUX: (code) =>
    code.startsWith("24.") || code.startsWith("25."),
  INDUSTRIE_EQUIPEMENTS_MACHINES: (code) =>
    code.startsWith("26.") || code.startsWith("27.") || code.startsWith("28."),
  INDUSTRIE_TRANSPORT_MOBILITE: (code) =>
    code.startsWith("29.") || code.startsWith("30."),
  INDUSTRIE_DIVERSE_MAINTENANCE: (code) =>
    code.startsWith("31.") ||
    code.startsWith("32.") ||
    code.startsWith("33.") ||
    code.startsWith("34."), // Obsolete but existing in SIRENE
  ENERGIE_EAU_ENVIRONNEMENT: (code) =>
    code.startsWith("35.") ||
    code.startsWith("36.") ||
    code.startsWith("37.") ||
    code.startsWith("38.") ||
    code.startsWith("39.") ||
    code.startsWith("40."), // old electricity/gaz code
  BTP_TRAVAUX: (code) =>
    code.startsWith("41.") ||
    code.startsWith("42.") ||
    code.startsWith("43.") ||
    code.startsWith("44."), // old construction-related code
  COMMERCE_DISTRIBUTION: (code) =>
    code.startsWith("45.") ||
    code.startsWith("46.") ||
    code.startsWith("47.") ||
    code.startsWith("48."), // old trade-related code
  TRANSPORT_LOGISTIQUE: (code) =>
    code.startsWith("49.") ||
    code.startsWith("50.") ||
    code.startsWith("51.") ||
    code.startsWith("52.") ||
    code.startsWith("53."),
  HOTELLERIE_RESTAURATION: (code) =>
    code.startsWith("55.") || code.startsWith("56.") || code.startsWith("57."), // old tourism-related code
  BUREAUX_SERVICES_NUMERIQUES: (code) =>
    code.startsWith("58.") ||
    code.startsWith("59.") ||
    code.startsWith("60.") ||
    code.startsWith("61.") ||
    code.startsWith("62.") ||
    code.startsWith("63."),
  FINANCE_IMMOBILIER: (code) =>
    code.startsWith("64.") ||
    code.startsWith("65.") ||
    code.startsWith("66.") ||
    code.startsWith("67."), // old finance-related code
  GESTION_IMMOBILIERE: (code) => code.startsWith("68."),
  SERVICES_PROFESSIONNELS: (code) =>
    code.startsWith("69.") ||
    code.startsWith("70.") ||
    code.startsWith("71.") ||
    code.startsWith("72.") ||
    code.startsWith("73.") ||
    code.startsWith("74.") ||
    code.startsWith("75.") ||
    code.startsWith("76."), // old professional services code
  SERVICES_OPERATIONNELS_SUPPORT: (code) =>
    code.startsWith("77.") ||
    code.startsWith("78.") ||
    code.startsWith("79.") ||
    code.startsWith("80.") ||
    code.startsWith("81.") ||
    code.startsWith("82.") ||
    code.startsWith("83."), // old operational support code
  SECTEUR_MEDICO_SOCIAL: (code) =>
    code.startsWith("86.") ||
    code.startsWith("87.") ||
    code.startsWith("88.") ||
    code.startsWith("89."), // old social code
  SECTEUR_PUBLIC: (code) => code.startsWith("84.") || code.startsWith("85."),
  CULTURE_SPORT_SERVICES_PERSONNE: (code) =>
    code.startsWith("90.") ||
    code.startsWith("91.") ||
    code.startsWith("92.") ||
    code.startsWith("93.") ||
    code.startsWith("94.") ||
    code.startsWith("95.") ||
    code.startsWith("96."), // old personal services code
};

const TYPE_LOCATION_RULES: Record<
  LocationTypeNafCategory,
  (code: NafCode) => boolean
> = {
  BUREAUX_TERTIAIRE: (code) =>
    NAF_CATEGORY_RULES.FINANCE_IMMOBILIER(code) ||
    NAF_CATEGORY_RULES.SERVICES_PROFESSIONNELS(code) ||
    NAF_CATEGORY_RULES.BUREAUX_SERVICES_NUMERIQUES(code),
  RESIDENTIEL_COLLECTIF_GERE: (code) =>
    NAF_CATEGORY_RULES.GESTION_IMMOBILIERE(code),
  SITES_INDUSTRIELS_USINES: (code) =>
    NAF_CATEGORY_RULES.EXPLOITATIONS_AGRICOLES_SITES_RURAUX(code) ||
    NAF_CATEGORY_RULES.EXTRACTION_INDUSTRIES_PRIMAIRES(code) ||
    NAF_CATEGORY_RULES.INDUSTRIE_AGROALIMENTAIRE_BOISSONS(code) ||
    NAF_CATEGORY_RULES.INDUSTRIE_MANUFACTURIERE_LEGERE(code) ||
    NAF_CATEGORY_RULES.INDUSTRIE_LOURDE_CHIMIE_MATERIAUX(code) ||
    NAF_CATEGORY_RULES.METALLURGIE_TRANSFORMATION_METAUX(code) ||
    NAF_CATEGORY_RULES.INDUSTRIE_EQUIPEMENTS_MACHINES(code) ||
    NAF_CATEGORY_RULES.INDUSTRIE_TRANSPORT_MOBILITE(code) ||
    NAF_CATEGORY_RULES.INDUSTRIE_DIVERSE_MAINTENANCE(code) ||
    NAF_CATEGORY_RULES.ENERGIE_EAU_ENVIRONNEMENT(code),
  LOGISTIQUE_ENTREPOSAGE: (code) =>
    NAF_CATEGORY_RULES.TRANSPORT_LOGISTIQUE(code),
  BTP_BASES_TECHNIQUES: (code) => NAF_CATEGORY_RULES.BTP_TRAVAUX(code),
  HOTELLERIE_TOURISME_LOISIRS: (code) =>
    NAF_CATEGORY_RULES.HOTELLERIE_RESTAURATION(code),
  SANTE_MEDICO_SOCIAL: (code) => NAF_CATEGORY_RULES.SECTEUR_MEDICO_SOCIAL(code),
  ENSEIGNEMENT_BATIMENTS_PUBLICS: (code) =>
    NAF_CATEGORY_RULES.SECTEUR_PUBLIC(code),
  COMMERCE_ERP: (code) => NAF_CATEGORY_RULES.COMMERCE_DISTRIBUTION(code),
  SERVICES_OPERATIONNELS_SUPPORT: (code) =>
    NAF_CATEGORY_RULES.SERVICES_OPERATIONNELS_SUPPORT(code),
  CULTURE_SPORT_SERVICES_PERSONNE: (code) =>
    NAF_CATEGORY_RULES.CULTURE_SPORT_SERVICES_PERSONNE(code),
};

export const NAF_CODE_CATEGORIES: Record<NafCategory, NafCode[]> = (
  Object.keys(NAF_CATEGORY_RULES) as NafCategory[]
).reduce(
  (acc, category) => {
    acc[category] = NAF_CODES.filter(NAF_CATEGORY_RULES[category]);
    return acc;
  },
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  {} as Record<NafCategory, NafCode[]>,
);

export const TYPE_LOCATION_NAF_CODES: Record<
  LocationTypeNafCategory,
  NafCode[]
> = (Object.keys(TYPE_LOCATION_RULES) as LocationTypeNafCategory[]).reduce(
  (acc, locationType) => {
    acc[locationType] = NAF_CODES.filter(TYPE_LOCATION_RULES[locationType]);
    return acc;
  },
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  {} as Record<LocationTypeNafCategory, NafCode[]>,
);

const INDUSTRIAL_LOCATION_CATEGORIES = [
  "SITES_INDUSTRIELS_USINES",
  "LOGISTIQUE_ENTREPOSAGE",
  "BTP_BASES_TECHNIQUES",
] as const satisfies LocationTypeNafCategory[];

export const INDUSTRIAL_LOCATION_NAF_CODES = Array.from(
  new Set(
    INDUSTRIAL_LOCATION_CATEGORIES.flatMap(
      (category) => TYPE_LOCATION_NAF_CODES[category],
    ),
  ),
) as NafCode[];

export function getLocationBuildingTypeSelection(
  codes: NafCode[] | null | undefined,
): LocationTypeNafCategory[] {
  if (!codes || codes.length === 0) {
    return [];
  }
  const codeSet = new Set(codes);
  return (Object.keys(TYPE_LOCATION_NAF_CODES) as LocationTypeNafCategory[])
    .filter((category) =>
      TYPE_LOCATION_NAF_CODES[category].some((code) => codeSet.has(code)),
    )
    .sort();
}

export function getLocationBuildingTypeLabelsFromNafCodes(
  codes: NafCode[] | null | undefined,
): string[] {
  return getLocationBuildingTypeSelection(codes).map(
    (category) => TYPE_LOCATION_LABELS[category],
  );
}

export function buildLocationBuildingTypeCodes(
  categories: LocationTypeNafCategory[],
): NafCode[] {
  return Array.from(
    new Set(
      categories.flatMap((category) => TYPE_LOCATION_NAF_CODES[category]),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

export function areSameNafCodes(a: NafCode[], b: NafCode[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const aSet = new Set(a);
  return b.every((code) => aSet.has(code));
}

export const INDUSTRIAL_NAF_CATEGORIES: NafCategory[] = [
  "EXTRACTION_INDUSTRIES_PRIMAIRES",
  "INDUSTRIE_AGROALIMENTAIRE_BOISSONS",
  "INDUSTRIE_MANUFACTURIERE_LEGERE",
  "INDUSTRIE_LOURDE_CHIMIE_MATERIAUX",
  "METALLURGIE_TRANSFORMATION_METAUX",
  "INDUSTRIE_EQUIPEMENTS_MACHINES",
  "INDUSTRIE_TRANSPORT_MOBILITE",
  "INDUSTRIE_DIVERSE_MAINTENANCE",
  "ENERGIE_EAU_ENVIRONNEMENT",
];

export const TERTIARY_NAF_CATEGORIES: NafCategory[] = [
  "COMMERCE_DISTRIBUTION",
  "BUREAUX_SERVICES_NUMERIQUES",
  "SERVICES_OPERATIONNELS_SUPPORT",
  "SERVICES_PROFESSIONNELS",
  "HOTELLERIE_RESTAURATION",
  "SECTEUR_PUBLIC",
  "SECTEUR_MEDICO_SOCIAL",
];

export const NAF_CODE_INDUSTRIALS = Array.from(
  new Set(
    INDUSTRIAL_NAF_CATEGORIES.flatMap(
      (category) => NAF_CODE_CATEGORIES[category],
    ),
  ),
) as NafCode[];

/**
 * Returns the field and main activity for a NAF code (exact match only)
 */
export function nafToInfo(code: string): NafInfo | null {
  if (!code) {
    return null;
  }
  const normalized = code.trim().toUpperCase();
  const info = NAF_MAP[normalized];
  if (!info) {
    return null;
  }
  return {
    code: normalized,
    field: info.field,
  };
}

export function nafToCategory(code: string): NafCategory | null {
  if (!code) {
    return null;
  }
  const normalized = code.trim().toUpperCase();
  if (!NAF_MAP[normalized]) {
    return null;
  }
  const categories = Object.keys(NAF_CATEGORY_RULES) as NafCategory[];
  const category = categories.find((entry) =>
    NAF_CATEGORY_RULES[entry](normalized as NafCode),
  );
  return category ?? null;
}

export function nafToCategoryLabel(code: string): string | null {
  const category = nafToCategory(code);
  if (!category) {
    return null;
  }
  return NAF_CATEGORY_LABELS[category] ?? null;
}

export function buildActivitySectorGroups() {
  const groupEntries = (
    Object.keys(NAF_CODE_CATEGORIES) as Array<keyof typeof NAF_CODE_CATEGORIES>
  )
    .map((category) => {
      const options = NAF_CODE_CATEGORIES[category]
        .map((code) => ({
          value: code,
          label: `${code} - ${NAF_MAP[code]?.field ?? "Autres"}`,
        }))
        .sort((a, b) => a.value.localeCompare(b.value));

      return {
        label: NAF_CATEGORY_LABELS[category],
        value: category,
        options,
      };
    })
    .filter((group) => group.options.length > 0);

  const categorizedCodes = new Set<NafCode>(
    Object.values(NAF_CODE_CATEGORIES).flat(),
  );
  const uncategorizedOptions = NAF_CODES.filter(
    (code) => !categorizedCodes.has(code),
  )
    .map((code) => ({
      value: code,
      label: `${code} - ${NAF_MAP[code]?.field ?? "Autres"}`,
    }))
    .sort((a, b) => a.value.localeCompare(b.value));

  if (uncategorizedOptions.length === 0) {
    return groupEntries;
  }

  return [
    ...groupEntries,
    {
      label: "Autres secteurs d'activité",
      value: "AUTRES",
      options: uncategorizedOptions,
    },
  ];
}

export function buildLocationTypeNafGroups() {
  return (Object.keys(TYPE_LOCATION_LABELS) as LocationTypeNafCategory[])
    .map((locationType) => {
      const options = TYPE_LOCATION_NAF_CODES[locationType]
        .map((code) => ({
          value: code,
          label: `${code} - ${NAF_MAP[code]?.field ?? "Unknown Field"}`,
        }))
        .sort((a, b) => a.value.localeCompare(b.value));

      return {
        label: TYPE_LOCATION_LABELS[locationType],
        value: locationType,
        options,
      };
    })
    .filter((group) => group.options.length > 0);
}

export const locationBuildingTypeOptions = (
  Object.keys(TYPE_LOCATION_LABELS) as LocationTypeNafCategory[]
).map((category) => ({
  label: TYPE_LOCATION_LABELS[category],
  value: category,
}));

export function hasAllLocationBuildingTypesSelected(
  categories: LocationTypeNafCategory[] | null | undefined,
): boolean {
  if (!categories || categories.length === 0) {
    return false;
  }

  const selected = new Set(categories);
  const allCategories = Object.keys(
    TYPE_LOCATION_LABELS,
  ) as LocationTypeNafCategory[];

  return (
    selected.size === allCategories.length &&
    allCategories.every((category) => selected.has(category))
  );
}

export function formatLocationBuildingTypeValue(
  locationBuildingType: LocationTypeNafCategory[],
): string {
  if (!locationBuildingType || locationBuildingType.length === 0) {
    return "";
  }
  return `${locationBuildingType.length} type(s) sélectionné(s)`;
}
