import { DispatchStrategy, LotInfo } from '../strategies/DispatchStrategy';
import { EvenDistributionStrategy } from '../strategies/EvenDistributionStrategy';

/**
 * Dispatcher - Manages parking lot selection for incoming customers.
 * 
 * The dispatcher uses a configurable strategy to decide which parking lot
 * should receive the next customer. This allows the business to adapt to
 * different traffic patterns (e.g., weekends vs weekdays).
 */
export class Dispatcher {
  private strategy: DispatchStrategy;

  /**
   * Creates a new Dispatcher with the default strategy.
   * Default is EvenDistributionStrategy as specified in requirements.
   */
  constructor(strategy?: DispatchStrategy) {
    this.strategy = strategy || new EvenDistributionStrategy();
  }

  /**
   * Sets the dispatch strategy.
   * 
   * @param strategy - The new strategy to use for lot selection
   */
  setStrategy(strategy: DispatchStrategy): void {
    this.strategy = strategy;
  }

  /**
   * Gets the current strategy.
   */
  getStrategy(): DispatchStrategy {
    return this.strategy;
  }

  /**
   * Selects the best parking lot for a new customer.
   * 
   * @param lots - Array of available parking lots
   * @returns The lot number to use, or null if no suitable lot available
   */
  selectLotForParking(lots: LotInfo[]): number | null {
    return this.strategy.selectLot(lots);
  }
}
