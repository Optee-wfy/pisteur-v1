import { environmentCI } from './environment-ci';
import { localEnvironment } from './environment-local';
import { Environment } from './environment.type';

/**
 * Petite fonction générique : évite le diagnostic TS2783
 * car TypeScript ne tente pas de “dé‑dupliquer” les clés
 * lorsque les spreads viennent de paramètres *non constants*.
 */
function mergeEnvs<T extends object, U extends object>(
  defaults: T,
  overrides: U
): T & U {
  return { ...defaults, ...overrides };
}

export const environment: Environment = mergeEnvs(
  localEnvironment,
  environmentCI,
);
