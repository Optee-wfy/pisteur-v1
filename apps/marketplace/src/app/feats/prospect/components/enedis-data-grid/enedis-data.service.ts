import { httpResource } from "@angular/common/http";
import { Injectable, resource, signal } from "@angular/core";
import { isNotNullish } from "@optee/utils";
import { z } from "zod";
import trpcClient from "../../../../../trpc-client";

const EnedisResponseSchema = z.object({
  total: z.coerce.number(),
  next: z.string().nullable().optional(),
  results: z.array(
    z.object({
      consommation_annuelle_totale_de_ladresse_mwh: z.coerce
        .number()
        .nullable(),
      _score: z.coerce.number().nullable().optional(),
      annee: z.coerce.number(),
    }),
  ),
});

type EnedisResponse = z.infer<typeof EnedisResponseSchema>;

export type EnedisResultRow = {
  consommation_annuelle_totale_de_ladresse_mwh: number | null;
  annee: number;
};

const apiEnedisUrlBase =
  "https://opendata.enedis.fr/data-fair/api/v1/datasets/";

@Injectable()
export class EnedisDataService {
  private readonly locationUuid = signal<string | null>(null);

  readonly location = resource({
    params: () => this.locationUuid(),
    loader: async ({ params: uuid }) => {
      if (!uuid) {
        return null;
      }
      const res = await trpcClient.locationsBdnb.get.query(uuid);
      return res?.batiments_bdnb ?? null;
    },
  });

  readonly consumptionResidentialEnedis = httpResource<EnedisResponse>(
    () => {
      const params = this.buildEnedisParams();
      if (!params) {
        return undefined;
      }
      return `${apiEnedisUrlBase}consommation-annuelle-residentielle-par-adresse/lines?${params.toString()}`;
    },
    {
      parse: (value) => this.parseEnedisResponse(value),
      defaultValue: { total: 0, next: null, results: [] },
    },
  );

  readonly consumptionEnterpriseEnedis = httpResource<EnedisResponse>(
    () => {
      const params = this.buildEnedisParams();
      if (!params) {
        return undefined;
      }
      return `${apiEnedisUrlBase}consommation-annuelle-entreprise-par-adresse/lines?${params.toString()}`;
    },
    {
      parse: (value) => this.parseEnedisResponse(value),
      defaultValue: { total: 0, next: null, results: [] },
    },
  );

  setLocationUuid(uuid: string | null) {
    this.locationUuid.set(uuid);
  }

  private buildEnedisParams(): URLSearchParams | null {
    const location = this.location.value();
    if (!location) {
      return null;
    }

    const params = new URLSearchParams({
      select: "annee,consommation_annuelle_totale_de_ladresse_mwh",
      sort: "annee",
      size: "20",
    });

    const address =
      location.sourceAddress ??
      location.rawBdnb?.libelle_adr_principale_ban ??
      location.rawBdnb?.l_libelle_adr?.[0] ??
      null;
    const normalizedAddress = this.normalizeAddressPart(address);
    if (normalizedAddress) {
      params.set("adresse_search", normalizedAddress);
    }

    const normalizedStreetName = this.normalizeAddressPart(location.streetName);
    if (normalizedStreetName) {
      params.set("libelle_de_voie_search", normalizedStreetName);
    }

    if (location.streetNumber) {
      params.set("numero_de_voie_eq", location.streetNumber);
    }

    if (location.irisCode) {
      params.set("code_iris_eq", location.irisCode);
    }

    if (location.inseeEpciCode) {
      params.set("code_epci_eq", location.inseeEpciCode);
    }

    return params;
  }

  private normalizeAddressPart(value?: string | null): string | null {
    if (!value) {
      return null;
    }
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();
  }

  private parseEnedisResponse(value: unknown): EnedisResponse {
    const parsed = EnedisResponseSchema.safeParse(value);
    if (parsed.success) {
      return parsed.data;
    }
    console.warn("Invalid Enedis response shape", parsed.error);
    return { total: 0, next: null, results: [] };
  }

  getLatestEnedisRow(
    results: EnedisResultRow[],
  ): { value: number; year: number } | null {
    const filtered = results
      .filter(
        (row) => row.consommation_annuelle_totale_de_ladresse_mwh !== null,
      )
      .filter(isNotNullish);

    if (filtered.length === 0) {
      return null;
    }
    const row = filtered[filtered.length - 1];
    if (!row) {
      return null;
    }
    return {
      value: row.consommation_annuelle_totale_de_ladresse_mwh!, // already filtered not null above
      year: row.annee,
    };
  }

  getLatestEnedisValue(results: EnedisResultRow[]): number | null {
    return this.getLatestEnedisRow(results)?.value ?? null;
  }
}
