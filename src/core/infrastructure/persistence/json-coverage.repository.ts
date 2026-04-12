import type { CoverageZone } from '@/core/domain/coverage-zone';
import type { CoverageRepository } from '@/core/application/ports/coverage.repository';
import type { DbShape } from './json-store';

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export class JsonCoverageRepository implements CoverageRepository {
  constructor(private readonly db: DbShape) {}

  /** /// <inheritdoc /> */
  async save(zone: CoverageZone): Promise<void> {
    const idx = this.db.coverageZones.findIndex((z) => z.id === zone.id);
    if (idx >= 0) this.db.coverageZones[idx] = zone;
    else this.db.coverageZones.push(zone);
  }

  /** /// <inheritdoc /> */
  async findById(id: string): Promise<CoverageZone | null> {
    return this.db.coverageZones.find((z) => z.id === id) ?? null;
  }

  /** /// <inheritdoc /> */
  async list(): Promise<CoverageZone[]> {
    return [...this.db.coverageZones].sort((a, b) => a.neighborhood.localeCompare(b.neighborhood));
  }

  /** /// <inheritdoc /> */
  async delete(id: string): Promise<void> {
    this.db.coverageZones = this.db.coverageZones.filter((z) => z.id !== id);
  }

  /** /// <inheritdoc /> */
  async resolveByNeighborhood(city: string, neighborhood: string): Promise<CoverageZone | null> {
    return (
      this.db.coverageZones.find(
        (z) => z.active && norm(z.city) === norm(city) && norm(z.neighborhood) === norm(neighborhood),
      ) ?? null
    );
  }
}
