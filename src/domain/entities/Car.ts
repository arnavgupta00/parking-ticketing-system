/**
 * Car - Represents a vehicle in the parking lot.
 * 
 * Simple value object that holds registration number and color.
 * We store the color in lowercase internally for case-insensitive comparisons,
 * but keep the original for display purposes.
 */
export class Car {
  private readonly _registrationNumber: string;
  private readonly _color: string;
  private readonly _colorLower: string;

  /**
   * Creates a new Car instance.
   * 
   * @param registrationNumber - The vehicle's registration (e.g., "KA-01-HH-1234")
   * @param color - The vehicle's color (e.g., "White", "Black")
   */
  constructor(registrationNumber: string, color: string) {
    this._registrationNumber = registrationNumber;
    this._color = color;
    // Store lowercase version for case-insensitive matching
    // This way "White" matches queries for "white", "WHITE", etc.
    this._colorLower = color.toLowerCase();
  }

  /**
   * Gets the registration number as provided.
   */
  get registrationNumber(): string {
    return this._registrationNumber;
  }

  /**
   * Gets the color as originally provided (for display).
   */
  get color(): string {
    return this._color;
  }

  /**
   * Checks if this car's color matches the given color (case-insensitive).
   * 
   * We do the comparison in lowercase so "White" matches "white", "WHITE", etc.
   * This makes the system more user-friendly.
   */
  matchesColor(color: string): boolean {
    return this._colorLower === color.toLowerCase();
  }
}
