import z from "zod";

export const FRENCH_DEPARTMENTS = [
  "1 - Ain",
  "2 - Aisne",
  "3 - Allier",
  "4 - Alpes de Haute-Provence",
  "5 - Hautes-Alpes",
  "6 - Alpes-Maritimes",
  "7 - Ardêche",
  "8 - Ardennes",
  "9 - Ariège",
  "10 - Aube",
  "11 - Aude",
  "12 - Aveyron",
  "13 - Bouches-du-Rhône",
  "14 - Calvados",
  "15 - Cantal",
  "16 - Charente",
  "17 - Charente-Maritime",
  "18 - Cher",
  "19 - Corrèze",
  "2A - Corse-du-Sud",
  "2B - Haute-Corse",
  "21 - Côte-d'Or",
  "22 - Côtes d'Armor",
  "23 - Creuse",
  "24 - Dordogne",
  "25 - Doubs",
  "26 - Drôme",
  "27 - Eure",
  "28 - Eure-et-Loir",
  "29 - Finistère",
  "30 - Gard",
  "31 - Haute-Garonne",
  "32 - Gers",
  "33 - Gironde",
  "34 - Hérault",
  "35 - Îlle-et-Vilaine",
  "36 - Indre",
  "37 - Indre-et-Loire",
  "38 - Isère",
  "39 - Jura",
  "40 - Landes",
  "41 - Loir-et-Cher",
  "42 - Loire",
  "43 - Haute-Loire",
  "44 - Loire-Atlantique",
  "45 - Loiret",
  "46 - Lot",
  "47 - Lot-et-Garonne",
  "48 - Lozère",
  "49 - Maine-et-Loire",
  "50 - Manche",
  "51 - Marne",
  "52 - Haute-Marne",
  "53 - Mayenne",
  "54 - Meurthe-et-Moselle",
  "55 - Meuse",
  "56 - Morbihan",
  "57 - Moselle",
  "58 - Nièvre",
  "59 - Nord",
  "60 - Oise",
  "61 - Orne",
  "62 - Pas-de-Calais",
  "63 - Puy-de-Dôme",
  "64 - Pyrénées-Atlantiques",
  "65 - Hautes-Pyrénées",
  "66 - Pyrénées-Orientales",
  "67 - Bas-Rhin",
  "68 - Haut-Rhin",
  "69 - Rhône",
  "70 - Haute-Saône",
  "71 - Saône-et-Loire",
  "72 - Sarthe",
  "73 - Savoie",
  "74 - Haute-Savoie",
  "75 - Paris",
  "76 - Seine-Maritime",
  "77 - Seine-et-Marne",
  "78 - Yvelines",
  "79 - Deux-Sèvres",
  "80 - Somme",
  "81 - Tarn",
  "82 - Tarn-et-Garonne",
  "83 - Var",
  "84 - Vaucluse",
  "85 - Vendée",
  "86 - Vienne",
  "87 - Haute-Vienne",
  "88 - Vosges",
  "89 - Yonne",
  "90 - Territoire-de-Belfort",
  "91 - Essonne",
  "92 - Hauts-de-Seine",
  "93 - Seine-Saint-Denis",
  "94 - Val-de-Marne",
  "95 - Val-d'Oise",
] as const;
export type Department = (typeof FRENCH_DEPARTMENTS)[number];

export const frenchDepartmentsSchema = z.enum(FRENCH_DEPARTMENTS);

export function getDepartmentByCode(
  raw: string | null | undefined,
): Department | null {
  const code = raw?.trim()?.toUpperCase();
  if (!code || code.length < 2) {
    return null;
  }
  if (code.startsWith("20")) {
    if (code.startsWith("20")) {
      if (code.startsWith("201") || code.startsWith("200")) {
        return "2A - Corse-du-Sud";
      }
      if (/^20[2-6]/.test(code)) {
        return "2B - Haute-Corse";
      }
      return null;
    }
  }

  if (code.startsWith("2A")) {
    return "2A - Corse-du-Sud";
  }
  if (code.startsWith("2B")) {
    return "2B - Haute-Corse";
  }

  const sliced = code.slice(0, 2);
  const dptCode = sliced.replace(/^0/, "");

  if (!/^\d{1,2}$/.test(dptCode)) {
    return null;
  }

  const department = FRENCH_DEPARTMENTS.find((d) =>
    d.startsWith(dptCode + " - "),
  );
  return department ?? null;
}

// CLIMATE ZONES
export const CLIMATE_ZONES = ["H1", "H2", "H3"] as const;
export type ClimateZone = (typeof CLIMATE_ZONES)[number];

export const CLIMATE_ZONES_RECORD: Record<ClimateZone, string[]> = {
  H1: [
    "01",
    "02",
    "03",
    "05",
    "08",
    "10",
    "14",
    "15",
    "19",
    "21",
    "23",
    "25",
    "27",
    "28",
    "38",
    "39",
    "42",
    "43",
    "45",
    "51",
    "52",
    "54",
    "55",
    "57",
    "58",
    "59",
    "60",
    "61",
    "62",
    "63",
    "67",
    "68",
    "69",
    "70",
    "71",
    "73",
    "74",
    "75",
    "76",
    "77",
    "78",
    "80",
    "87",
    "88",
    "89",
    "90",
    "91",
    "92",
    "93",
    "94",
    "95",
  ],
  H2: [
    "04",
    "07",
    "09",
    "12",
    "16",
    "17",
    "18",
    "22",
    "24",
    "26",
    "29",
    "31",
    "32",
    "33",
    "35",
    "36",
    "37",
    "40",
    "41",
    "44",
    "46",
    "47",
    "49",
    "50",
    "53",
    "56",
    "64",
    "65",
    "72",
    "79",
    "81",
    "82",
    "84",
    "85",
    "86",
  ],
  H3: [
    "06",
    "11",
    "13",
    "20",
    "30",
    "34",
    "66",
    "83",
    "971",
    "972",
    "973",
    "974",
    "976",
  ],
};
export function getClimateZone(zipcode: string): ClimateZone {
  // Extract the first two digits of the postal code
  const departmentCode = zipcode.trim().substring(0, 2);
  // Some have 3 digits like 971
  const departmentCodeBis = zipcode.trim().substring(0, 3);

  if (
    CLIMATE_ZONES_RECORD.H1.includes(departmentCode) ||
    CLIMATE_ZONES_RECORD.H1.includes(departmentCodeBis)
  ) {
    return "H1";
  }

  if (
    CLIMATE_ZONES_RECORD.H2.includes(departmentCode) ||
    CLIMATE_ZONES_RECORD.H2.includes(departmentCodeBis)
  ) {
    return "H2";
  }

  if (
    CLIMATE_ZONES_RECORD.H3.includes(departmentCode) ||
    CLIMATE_ZONES_RECORD.H3.includes(departmentCodeBis)
  ) {
    return "H3";
  }

  throw new Error(
    `Impossible de déterminer la zone climatique pour le code postal "${zipcode}"`,
  );
}

export function getDepartments(zone: ClimateZone): Department[] {
  const code = CLIMATE_ZONES_RECORD[zone];
  return FRENCH_DEPARTMENTS.filter((d) =>
    code.some((c) => d.startsWith(c + " - ")),
  );
}

// Regions
export const FRENCH_REGIONS = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d'Azur",
] as const;
export type FrenchRegion = (typeof FRENCH_REGIONS)[number];

export const FRENCH_REGION_DEPARTMENT_CODES = {
  "Auvergne-Rhône-Alpes": [
    "01",
    "03",
    "07",
    "15",
    "26",
    "38",
    "42",
    "43",
    "63",
    "69",
    "73",
    "74",
  ],
  "Bourgogne-Franche-Comté": ["21", "25", "39", "58", "70", "71", "89", "90"],
  Bretagne: ["22", "29", "35", "56"],
  "Centre-Val de Loire": ["18", "28", "36", "37", "41", "45"],
  Corse: ["2A", "2B"],
  "Grand Est": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"],
  "Hauts-de-France": ["02", "59", "60", "62", "80"],
  "Île-de-France": ["75", "77", "78", "91", "92", "93", "94", "95"],
  Normandie: ["14", "27", "50", "61", "76"],
  "Nouvelle-Aquitaine": [
    "16",
    "17",
    "19",
    "23",
    "24",
    "33",
    "40",
    "47",
    "64",
    "79",
    "86",
    "87",
  ],
  Occitanie: [
    "09",
    "11",
    "12",
    "30",
    "31",
    "32",
    "34",
    "46",
    "48",
    "65",
    "66",
    "81",
    "82",
  ],
  "Pays de la Loire": ["44", "49", "53", "72", "85"],
  "Provence-Alpes-Côte d'Azur": ["04", "05", "06", "13", "83", "84"],
} as const satisfies Record<FrenchRegion, readonly string[]>;

const departmentOptionFromCode = (code: string) => {
  if (code === "2A" || code === "2B") {
    const department = FRENCH_DEPARTMENTS.find((d) =>
      d.startsWith(code + " - "),
    );
    if (!department) {
      throw new Error(`Département introuvable pour le code "${code}"`);
    }
    const name = department.split(" - ").slice(1).join(" - ");
    return { label: `${code} - ${name}`, value: department };
  }

  const normalized = code.replace(/^0/, "");
  const department = FRENCH_DEPARTMENTS.find((d) =>
    d.startsWith(normalized + " - "),
  );
  if (!department) {
    throw new Error(`Département introuvable pour le code "${code}"`);
  }
  const name = department.split(" - ").slice(1).join(" - ");
  return { label: `${code} - ${name}`, value: department };
};

export type FrenchRegionDepartmentOption = {
  label: string;
  value: Department;
};

export type FrenchRegionDepartmentGroup = {
  label: FrenchRegion;
  value: FrenchRegion;
  options: FrenchRegionDepartmentOption[];
};

export const FRENCH_REGION_DEPARTMENT_GROUPS: FrenchRegionDepartmentGroup[] =
  FRENCH_REGIONS.map((region) => ({
    label: region,
    value: region,
    options: FRENCH_REGION_DEPARTMENT_CODES[region].map(
      departmentOptionFromCode,
    ),
  }));
