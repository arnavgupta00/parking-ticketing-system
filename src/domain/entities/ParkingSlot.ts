import { Car } from './Car';

/**
 * ParkingSlot - Represents a single parking space in the lot.
 * 
 * Each slot has a fixed number (assigned at creation) and can hold one car.
 * The slot number is immutable - it's like a physical parking space that
 * doesn't change location.
 */
export class ParkingSlot {
  private readonly _slotNumber: number;
  private _car: Car | null;

  /**
   * Creates a new parking slot with the given number.
   * 
   * @param slotNumber - The slot's number (1-indexed, lower = closer to entrance)
   */
  constructor(slotNumber: number) {
    this._slotNumber = slotNumber;
    this._car = null;
  }

  /**
   * Gets the slot number.
   */
  get slotNumber(): number {
    return this._slotNumber;
  }

  /**
   * Gets the car currently parked in this slot, or null if empty.
   */
  get car(): Car | null {
    return this._car;
  }

  /**
   * Checks if this slot is available for parking.
   */
  isAvailable(): boolean {
    return this._car === null;
  }

  /**
   * Parks a car in this slot.
   * 
   * Note: We don't check if slot is already occupied here - that's the
   * responsibility of the ParkingLotService which manages allocation.
   * This keeps the slot simple and focused on state.
   */
  assignCar(car: Car): void {
    this._car = car;
  }

  /**
   * Removes the car from this slot, making it available.
   * Returns the car that was removed, or null if slot was already empty.
   * 
   * Returning the removed car can be useful for logging or receipts.
   */
  removeCar(): Car | null {
    const removedCar = this._car;
    this._car = null;
    return removedCar;
  }
}
