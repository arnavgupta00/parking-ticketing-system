import { MinHeap } from '../data-structures/MinHeap';
import { Car } from '../entities/Car';
import { ParkingSlot } from '../entities/ParkingSlot';

/**
 * ParkingLotService - The heart of the parking lot system.
 * 
 * This service manages the entire parking lot state including:
 * - Available slot allocation using a min-heap (always assigns nearest slot)
 * - Occupied slot tracking with secondary indexes for fast lookups
 * - Query operations for finding cars by color or registration
 * 
 * Design decisions:
 * - Min-heap for O(log n) nearest-slot allocation
 * - Hash maps for O(1) lookups by color and registration
 * - Slots are 1-indexed (as specified in requirements)
 */
export class ParkingLotService {
  private slots: Map<number, ParkingSlot>;
  private availableSlots: MinHeap<number>;
  private capacity: number;
  
  // Secondary indexes for fast lookups
  // Color -> Set of slot numbers (one color can have many cars)
  private colorIndex: Map<string, Set<number>>;
  // Registration -> Slot number (each registration is unique per slot)
  private registrationIndex: Map<string, number>;

  constructor() {
    this.slots = new Map();
    this.availableSlots = new MinHeap<number>();
    this.capacity = 0;
    this.colorIndex = new Map();
    this.registrationIndex = new Map();
  }

  /**
   * Creates a new parking lot with the specified capacity.
   * 
   * This initializes all slots and adds them to the available pool.
   * Calling this again would reset the entire parking lot (rare use case,
   * but we handle it cleanly).
   */
  createParkingLot(capacity: number): void {
    // Reset everything for a fresh lot
    this.slots.clear();
    this.availableSlots = new MinHeap<number>();
    this.colorIndex.clear();
    this.registrationIndex.clear();
    this.capacity = capacity;

    // Create all slots and mark them as available
    // Slots are numbered 1 to n (1-indexed as per requirements)
    for (let i = 1; i <= capacity; i++) {
      this.slots.set(i, new ParkingSlot(i));
      this.availableSlots.insert(i);
    }
  }

  /**
   * Parks a car in the nearest available slot.
   * 
   * @returns The slot number where the car was parked, or null if lot is full
   * 
   * The min-heap ensures we always get the smallest available slot number,
   * which corresponds to the "nearest" slot as per requirements.
   */
  park(registrationNumber: string, color: string): number | null {
    // Check if this registration is already parked
    if (this.registrationIndex.has(registrationNumber)) {
      // Return -1 to indicate duplicate (special error case)
      return -1;
    }

    // No available slots? Lot is full.
    if (this.availableSlots.isEmpty()) {
      return null;
    }

    // Get the nearest available slot (smallest number = closest to entrance)
    const slotNumber = this.availableSlots.extractMin()!;
    const slot = this.slots.get(slotNumber)!;
    
    // Create and assign the car to this slot
    const car = new Car(registrationNumber, color);
    slot.assignCar(car);

    // Update our indexes for fast lookups later
    this.addToColorIndex(color, slotNumber);
    this.registrationIndex.set(registrationNumber, slotNumber);

    return slotNumber;
  }

  /**
   * Frees up a parking slot when a car leaves.
   * 
   * @returns true if a car was removed, false if slot was already empty or invalid
   */
  leave(slotNumber: number): boolean {
    const slot = this.slots.get(slotNumber);
    
    // Invalid slot number or slot doesn't exist
    if (!slot) {
      return false;
    }

    // If slot is already empty, nothing to do
    if (slot.isAvailable()) {
      return false;
    }

    // Get the car before removing (needed for index cleanup)
    const car = slot.car!;
    slot.removeCar();

    // Clean up our indexes
    this.removeFromColorIndex(car.color, slotNumber);
    this.registrationIndex.delete(car.registrationNumber);

    // Return this slot to the available pool
    // The heap will maintain proper ordering for next allocation
    this.availableSlots.insert(slotNumber);

    return true;
  }

  /**
   * Returns the current status of all occupied slots.
   * 
   * Slots are returned in order by slot number. This is useful for
   * displaying the "status" command output.
   */
  getStatus(): Array<{ slotNumber: number; registrationNumber: string; color: string }> {
    const occupied: Array<{ slotNumber: number; registrationNumber: string; color: string }> = [];

    // We need to iterate through all slots and collect occupied ones
    // Using Array.from to get slots, then filter and sort
    const sortedSlots = Array.from(this.slots.values())
      .filter(slot => !slot.isAvailable())
      .sort((a, b) => a.slotNumber - b.slotNumber);

    for (const slot of sortedSlots) {
      const car = slot.car!;
      occupied.push({
        slotNumber: slot.slotNumber,
        registrationNumber: car.registrationNumber,
        color: car.color,
      });
    }

    return occupied;
  }

  /**
   * Finds all registration numbers of cars with the specified color.
   * 
   * Case-insensitive matching: "White", "white", "WHITE" all match.
   */
  getRegistrationNumbersByColor(color: string): string[] {
    const colorKey = color.toLowerCase();
    const slotNumbers = this.colorIndex.get(colorKey);

    if (!slotNumbers || slotNumbers.size === 0) {
      return [];
    }

    // Get registrations from each slot, maintaining slot order for consistency
    const registrations: string[] = [];
    const sortedSlots = Array.from(slotNumbers).sort((a, b) => a - b);
    
    for (const slotNum of sortedSlots) {
      const slot = this.slots.get(slotNum);
      if (slot && slot.car) {
        registrations.push(slot.car.registrationNumber);
      }
    }

    return registrations;
  }

  /**
   * Finds all slot numbers containing cars of the specified color.
   * 
   * Results are sorted by slot number for consistent output.
   */
  getSlotNumbersByColor(color: string): number[] {
    const colorKey = color.toLowerCase();
    const slotNumbers = this.colorIndex.get(colorKey);

    if (!slotNumbers || slotNumbers.size === 0) {
      return [];
    }

    // Return sorted for consistent output
    return Array.from(slotNumbers).sort((a, b) => a - b);
  }

  /**
   * Finds the slot number for a car with the given registration.
   * 
   * @returns The slot number, or null if not found
   */
  getSlotNumberByRegistration(registrationNumber: string): number | null {
    const slotNumber = this.registrationIndex.get(registrationNumber);
    return slotNumber !== undefined ? slotNumber : null;
  }

  /**
   * Returns the total capacity of the parking lot.
   */
  getCapacity(): number {
    return this.capacity;
  }

  /**
   * Returns the number of available slots.
   */
  getAvailableCount(): number {
    return this.availableSlots.size();
  }

  /**
   * Checks if the parking lot has been created.
   */
  isInitialized(): boolean {
    return this.capacity > 0;
  }

  // ============================================================
  // Private helper methods for managing indexes
  // ============================================================

  /**
   * Adds a slot to the color index.
   * Creates a new set for the color if it doesn't exist.
   */
  private addToColorIndex(color: string, slotNumber: number): void {
    const colorKey = color.toLowerCase();
    
    if (!this.colorIndex.has(colorKey)) {
      this.colorIndex.set(colorKey, new Set());
    }
    
    this.colorIndex.get(colorKey)!.add(slotNumber);
  }

  /**
   * Removes a slot from the color index.
   * Also cleans up the color entry if no more slots have that color.
   */
  private removeFromColorIndex(color: string, slotNumber: number): void {
    const colorKey = color.toLowerCase();
    const slots = this.colorIndex.get(colorKey);
    
    if (slots) {
      slots.delete(slotNumber);
      
      // Clean up empty sets to avoid memory bloat over time
      if (slots.size === 0) {
        this.colorIndex.delete(colorKey);
      }
    }
  }
}
