/**
 * Coverage Zone — modela la cobertura para Pago Contraentrega.
 * Fase 1: Medellín por barrio. Fase 2: nacional + integración transportadora.
 */

export interface CoverageZone {
  id: string;
  city: string;
  neighborhood: string;
  postalCodes: string[];
  shippingCOP: number;
  active: boolean;
  estimatedDelivery: string;
}
