import { ParkingLotService } from './ParkingLotService';
import { Dispatcher } from './Dispatcher';
import { LotInfo } from '../strategies/DispatchStrategy';

/**
 * ParkingAllocation - Result of a parking operation
 */
export interface ParkingAllocation {
  lotNumber: number;
  slotNumber: number;
}

/**
 * StatusEntry - Extended status entry with lot information
 */
export interface StatusEntry {
  lotNumber: number;
  slotNumber: number;
  registrationNumber: string;
  color: string;
}

/**
 * ParkingLotManager - Manages multiple parking lots and coordinates operations.
 * 
 * This is the main orchestrator for the multi-lot system. It:
 * - Creates and tracks multiple parking lots
 * - Uses a dispatcher to route customers
 * - Provides unified query interface across all lots
 * - Ensures registration uniqueness globally
 */
export class ParkingLotManager {
  private lots: Map<number, ParkingLotService>;
  private dispatcher: Dispatcher;
  private nextLotNumber: number;
  private registrationToLot: Map<string, number>;

  constructor() {
    this.lots = new Map();
    this.dispatcher = new Dispatcher();
    this.nextLotNumber = 1;
    this.registrationToLot = new Map();
  }

  /**
   * Creates a new parking lot with the specified capacity.
   * Lots are numbered sequentially (1, 2, 3...) based on creation order.
   * 
   * @param capacity - Number of parking slots in the new lot
   * @returns The lot number assigned to this new lot
   */
  createParkingLot(capacity: number): number {
    const lotNumber = this.nextLotNumber++;
    const service = new ParkingLotService();
    service.createParkingLot(capacity);
    this.lots.set(lotNumber, service);
    return lotNumber;
  }

  /**
   * Gets the dispatcher for managing dispatch rules.
   */
  getDispatcher(): Dispatcher {
    return this.dispatcher;
  }

  /**
   * Parks a car using the dispatcher to select the best lot.
   * 
   * @returns ParkingAllocation with lot and slot, null if all lots full, or -1 for duplicate
   */
  park(registrationNumber: string, color: string): ParkingAllocation | null | -1 {
    // Check for duplicate registration across all lots
    if (this.registrationToLot.has(registrationNumber)) {
      return -1;
    }

    // Get all lots as LotInfo array for dispatcher
    const lotInfos: LotInfo[] = Array.from(this.lots.entries()).map(([lotNumber, service]) => ({
      lotNumber,
      service,
    }));

    // Let dispatcher select the best lot
    const selectedLotNumber = this.dispatcher.selectLotForParking(lotInfos);

    if (selectedLotNumber === null) {
      return null; // All lots are full
    }

    // Park in the selected lot
    const lot = this.lots.get(selectedLotNumber)!;
    const slotNumber = lot.park(registrationNumber, color);

    if (slotNumber === null || slotNumber === -1) {
      return null; // Shouldn't happen as dispatcher checks availability
    }

    // Track registration globally
    this.registrationToLot.set(registrationNumber, selectedLotNumber);

    return {
      lotNumber: selectedLotNumber,
      slotNumber,
    };
  }

  /**
   * Removes a car from a specific lot and slot.
   * 
   * @returns true if successful, false otherwise
   */
  leave(lotNumber: number, slotNumber: number): boolean {
    const lot = this.lots.get(lotNumber);
    
    if (!lot) {
      return false;
    }

    // Need to get the registration before removing to clean up global index
    const status = lot.getStatus();
    const entry = status.find(e => e.slotNumber === slotNumber);
    
    const success = lot.leave(slotNumber);
    
    if (success && entry) {
      this.registrationToLot.delete(entry.registrationNumber);
    }

    return success;
  }

  /**
   * Gets the status of all parking lots.
   * Returns entries sorted by lot number, then slot number.
   */
  getStatus(): StatusEntry[] {
    const allEntries: StatusEntry[] = [];

    // Get sorted lot numbers
    const sortedLotNumbers = Array.from(this.lots.keys()).sort((a, b) => a - b);

    for (const lotNumber of sortedLotNumbers) {
      const lot = this.lots.get(lotNumber)!;
      const lotStatus = lot.getStatus();
      
      for (const entry of lotStatus) {
        allEntries.push({
          lotNumber,
          slotNumber: entry.slotNumber,
          registrationNumber: entry.registrationNumber,
          color: entry.color,
        });
      }
    }

    return allEntries;
  }

  /**
   * Finds all registration numbers of cars with the specified color across all lots.
   * Results are sorted by lot number, then slot number.
   */
  getRegistrationNumbersByColor(color: string): string[] {
    const registrations: string[] = [];
    const sortedLotNumbers = Array.from(this.lots.keys()).sort((a, b) => a - b);

    for (const lotNumber of sortedLotNumbers) {
      const lot = this.lots.get(lotNumber)!;
      const lotRegistrations = lot.getRegistrationNumbersByColor(color);
      registrations.push(...lotRegistrations);
    }

    return registrations;
  }

  /**
   * Finds all slot numbers (with lot prefix) for cars with the specified color.
   * Format: L1-1, L1-2, L2-3, etc.
   */
  getSlotNumbersByColor(color: string): string[] {
    const slots: string[] = [];
    const sortedLotNumbers = Array.from(this.lots.keys()).sort((a, b) => a - b);

    for (const lotNumber of sortedLotNumbers) {
      const lot = this.lots.get(lotNumber)!;
      const lotSlots = lot.getSlotNumbersByColor(color);
      
      for (const slotNumber of lotSlots) {
        slots.push(`L${lotNumber}-${slotNumber}`);
      }
    }

    return slots;
  }

  /**
   * Finds the lot and slot for a car with the given registration.
   * Format: L2-4 (lot 2, slot 4)
   * 
   * @returns Formatted slot string or null if not found
   */
  getSlotNumberByRegistration(registrationNumber: string): string | null {
    const lotNumber = this.registrationToLot.get(registrationNumber);
    
    if (lotNumber === undefined) {
      return null;
    }

    const lot = this.lots.get(lotNumber);
    if (!lot) {
      return null;
    }

    const slotNumber = lot.getSlotNumberByRegistration(registrationNumber);
    if (slotNumber === null) {
      return null;
    }

    return `L${lotNumber}-${slotNumber}`;
  }

  /**
   * Gets a specific parking lot service.
   */
  getLot(lotNumber: number): ParkingLotService | undefined {
    return this.lots.get(lotNumber);
  }

  /**
   * Gets all parking lots.
   */
  getAllLots(): Map<number, ParkingLotService> {
    return this.lots;
  }

  /**
   * Returns the total number of parking lots.
   */
  getLotCount(): number {
    return this.lots.size;
  }

  /**
   * Checks if any parking lots have been created.
   */
  hasLots(): boolean {
    return this.lots.size > 0;
  }
}
