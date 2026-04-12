import type { CoverageZone } from '@/core/domain/coverage-zone';

export interface CoverageRepository {
  save(zone: CoverageZone): Promise<void>;
  findById(id: string): Promise<CoverageZone | null>;
  list(): Promise<CoverageZone[]>;
  delete(id: string): Promise<void>;
  /**
   * Resolución por barrio (case-insensitive). En Fase 2 esto se reemplaza
   * por geocoding + matching contra polígonos de transportadora.
   */
  resolveByNeighborhood(city: string, neighborhood: string): Promise<CoverageZone | null>;
}
