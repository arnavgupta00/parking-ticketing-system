import { Car } from '../../../src/domain/entities/Car';

/**
 * Car Entity Test Suite
 * 
 * Tests for the Car value object. Main focus is on the
 * case-insensitive color matching.
 */
describe('Car', () => {
  describe('construction', () => {
    it('should store registration number correctly', () => {
      const car = new Car('KA-01-HH-1234', 'White');
      expect(car.registrationNumber).toBe('KA-01-HH-1234');
    });

    it('should store color correctly', () => {
      const car = new Car('KA-01-HH-1234', 'White');
      expect(car.color).toBe('White');
    });

    it('should preserve original color casing for display', () => {
      const car = new Car('KA-01-HH-1234', 'BRIGHT RED');
      expect(car.color).toBe('BRIGHT RED');
    });
  });

  describe('color matching', () => {
    it('should match color case-insensitively', () => {
      const car = new Car('KA-01-HH-1234', 'White');
      
      expect(car.matchesColor('White')).toBe(true);
      expect(car.matchesColor('white')).toBe(true);
      expect(car.matchesColor('WHITE')).toBe(true);
      expect(car.matchesColor('WhItE')).toBe(true);
    });

    it('should not match different colors', () => {
      const car = new Car('KA-01-HH-1234', 'White');
      
      expect(car.matchesColor('Black')).toBe(false);
      expect(car.matchesColor('Red')).toBe(false);
      expect(car.matchesColor('Blue')).toBe(false);
    });

    it('should handle empty color', () => {
      const car = new Car('KA-01-HH-1234', '');
      expect(car.matchesColor('')).toBe(true);
      expect(car.matchesColor('White')).toBe(false);
    });

    it('should handle color with spaces', () => {
      const car = new Car('KA-01-HH-1234', 'Light Blue');
      expect(car.matchesColor('Light Blue')).toBe(true);
      expect(car.matchesColor('light blue')).toBe(true);
      expect(car.matchesColor('Blue')).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should preserve registration through getter', () => {
      const car = new Car('KA-01-HH-1234', 'White');
      expect(car.registrationNumber).toBe('KA-01-HH-1234');
      expect(car.color).toBe('White');
      // Access multiple times - should remain consistent
      expect(car.registrationNumber).toBe('KA-01-HH-1234');
    });
  });
});
