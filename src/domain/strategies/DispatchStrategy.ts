import { ParkingLotService } from '../services/ParkingLotService';

/**
 * LotInfo - Information about a parking lot needed for dispatch decisions
 */
export interface LotInfo {
  lotNumber: number;
  service: ParkingLotService;
}

/**
 * DispatchStrategy - Interface for parking lot selection strategies
 * 
 * Different strategies can be implemented to control how customers
 * are distributed across multiple parking lots.
 */
export interface DispatchStrategy {
  /**
   * Selects the best parking lot for a new customer based on the strategy.
   * 
   * @param lots - Array of available parking lots with their info
   * @returns The lot number to use, or null if no suitable lot found
   */
  selectLot(lots: LotInfo[]): number | null;

  /**
   * Returns the name of this strategy for display purposes.
   */
  getName(): string;
}
