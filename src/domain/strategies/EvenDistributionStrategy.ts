import { DispatchStrategy, LotInfo } from './DispatchStrategy';

/**
 * EvenDistributionStrategy - Distributes customers evenly across parking lots.
 * 
 * This strategy aims to balance the load by sending customers to the emptiest
 * parking lot (measured by occupancy percentage). If multiple lots are equally
 * empty, it picks the closest one (lowest lot number).
 * 
 * Use case: Busy periods (weekends) when you want to spread customers evenly.
 */
export class EvenDistributionStrategy implements DispatchStrategy {
  selectLot(lots: LotInfo[]): number | null {
    if (lots.length === 0) {
      return null;
    }

    // Filter out lots that are not initialized
    const validLots = lots.filter(lot => lot.service.isInitialized());
    
    if (validLots.length === 0) {
      return null;
    }

    // Calculate occupancy percentage for each lot
    let bestLot: LotInfo | null = null;
    let lowestOccupancy = 100;

    for (const lot of validLots) {
      const capacity = lot.service.getCapacity();
      const available = lot.service.getAvailableCount();
      const occupied = capacity - available;
      const occupancyPercent = (occupied / capacity) * 100;

      // Pick this lot if:
      // 1. It has lower occupancy than current best, OR
      // 2. Same occupancy but closer to dispatcher (lower lot number)
      if (occupancyPercent < lowestOccupancy || 
          (occupancyPercent === lowestOccupancy && (bestLot === null || lot.lotNumber < bestLot.lotNumber))) {
        lowestOccupancy = occupancyPercent;
        bestLot = lot;
      }
    }

    // If all lots are full, return null
    if (bestLot && bestLot.service.getAvailableCount() === 0) {
      return null;
    }

    return bestLot ? bestLot.lotNumber : null;
  }

  getName(): string {
    return 'Even Distribution';
  }
}
