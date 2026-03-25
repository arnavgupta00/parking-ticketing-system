import { DispatchStrategy, LotInfo } from './DispatchStrategy';

/**
 * FillFirstStrategy - Fills parking lots sequentially before moving to the next.
 * 
 * This strategy directs customers to the closest parking lot (lowest number)
 * that still has available space. Only when a lot is completely full does it
 * move to the next one.
 * 
 * Use case: Weekdays or low-traffic periods when you want to consolidate
 * customers to minimize operational costs.
 */
export class FillFirstStrategy implements DispatchStrategy {
  selectLot(lots: LotInfo[]): number | null {
    if (lots.length === 0) {
      return null;
    }

    // Sort lots by lot number (closest to dispatcher first)
    const sortedLots = [...lots]
      .filter(lot => lot.service.isInitialized())
      .sort((a, b) => a.lotNumber - b.lotNumber);

    if (sortedLots.length === 0) {
      return null;
    }

    // Find the first lot that isn't full
    for (const lot of sortedLots) {
      if (lot.service.getAvailableCount() > 0) {
        return lot.lotNumber;
      }
    }

    // All lots are full
    return null;
  }

  getName(): string {
    return 'Fill First';
  }
}
