import type { DataProvider } from "./types";
import { SeedProvider } from "./seed-provider";

/**
 * Single source of truth for the active market-data provider. Swap the
 * implementation here (e.g. a future LiveProvider gated on an env var)
 * without touching any feature code.
 */
export const dataProvider: DataProvider = new SeedProvider();

export type { DataProvider } from "./types";
