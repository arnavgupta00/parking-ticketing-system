import { ParkingSlot } from '../../../src/domain/entities/ParkingSlot';
import { Car } from '../../../src/domain/entities/Car';

/**
 * ParkingSlot Entity Test Suite
 */
describe('ParkingSlot', () => {
  describe('construction', () => {
    it('should store slot number correctly', () => {
      const slot = new ParkingSlot(1);
      expect(slot.slotNumber).toBe(1);
    });

    it('should start with no car (available)', () => {
      const slot = new ParkingSlot(1);
      expect(slot.car).toBeNull();
      expect(slot.isAvailable()).toBe(true);
    });
  });

  describe('assignCar', () => {
    it('should assign a car to the slot', () => {
      const slot = new ParkingSlot(1);
      const car = new Car('KA-01-HH-1234', 'White');
      
      slot.assignCar(car);
      
      expect(slot.car).toBe(car);
      expect(slot.isAvailable()).toBe(false);
    });

    it('should allow overwriting existing car', () => {
      const slot = new ParkingSlot(1);
      const car1 = new Car('KA-01-HH-1234', 'White');
      const car2 = new Car('KA-02-HH-5678', 'Black');
      
      slot.assignCar(car1);
      slot.assignCar(car2);
      
      expect(slot.car).toBe(car2);
    });
  });

  describe('removeCar', () => {
    it('should remove and return the car', () => {
      const slot = new ParkingSlot(1);
      const car = new Car('KA-01-HH-1234', 'White');
      
      slot.assignCar(car);
      const removed = slot.removeCar();
      
      expect(removed).toBe(car);
      expect(slot.car).toBeNull();
      expect(slot.isAvailable()).toBe(true);
    });

    it('should return null when removing from empty slot', () => {
      const slot = new ParkingSlot(1);
      const removed = slot.removeCar();
      
      expect(removed).toBeNull();
      expect(slot.isAvailable()).toBe(true);
    });
  });

  describe('slot number immutability', () => {
    it('should maintain slot number through operations', () => {
      const slot = new ParkingSlot(5);
      const car = new Car('TEST', 'White');
      
      slot.assignCar(car);
      expect(slot.slotNumber).toBe(5);
      
      slot.removeCar();
      expect(slot.slotNumber).toBe(5);
    });
  });
});
