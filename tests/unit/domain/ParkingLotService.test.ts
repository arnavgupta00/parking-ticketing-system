import { ParkingLotService } from '../../../src/domain/services/ParkingLotService';

/**
 * ParkingLotService Test Suite
 * 
 * This is the core of our business logic, so we test it thoroughly.
 * These tests mirror the expected behavior from the problem statement.
 */
describe('ParkingLotService', () => {
  let service: ParkingLotService;

  beforeEach(() => {
    service = new ParkingLotService();
  });

  describe('createParkingLot', () => {
    it('should create a parking lot with specified capacity', () => {
      service.createParkingLot(6);
      
      expect(service.getCapacity()).toBe(6);
      expect(service.getAvailableCount()).toBe(6);
      expect(service.isInitialized()).toBe(true);
    });

    it('should reset if called again', () => {
      service.createParkingLot(6);
      service.park('KA-01-HH-1234', 'White');
      
      service.createParkingLot(3);
      
      expect(service.getCapacity()).toBe(3);
      expect(service.getAvailableCount()).toBe(3);
      expect(service.getStatus()).toHaveLength(0);
    });

    it('should handle capacity of 1', () => {
      service.createParkingLot(1);
      
      expect(service.getCapacity()).toBe(1);
      expect(service.getAvailableCount()).toBe(1);
    });
  });

  describe('park', () => {
    beforeEach(() => {
      service.createParkingLot(6);
    });

    it('should allocate nearest available slot', () => {
      expect(service.park('KA-01-HH-1234', 'White')).toBe(1);
      expect(service.park('KA-01-HH-9999', 'White')).toBe(2);
      expect(service.park('KA-01-BB-0001', 'Black')).toBe(3);
    });

    it('should return null when parking lot is full', () => {
      // Fill the lot
      for (let i = 1; i <= 6; i++) {
        service.park(`REG-${i}`, 'White');
      }

      expect(service.park('EXTRA-CAR', 'White')).toBeNull();
    });

    it('should return -1 for duplicate registration', () => {
      service.park('CAR-1', 'White');
      expect(service.park('CAR-1', 'Red')).toBe(-1);
      
      // Verify original car is still in slot 1
      expect(service.getSlotNumberByRegistration('CAR-1')).toBe(1);
    });

    it('should reuse freed slot (nearest first)', () => {
      // Fill slots 1-4
      service.park('CAR-1', 'White');
      service.park('CAR-2', 'White');
      service.park('CAR-3', 'White');
      service.park('CAR-4', 'White');
      
      // Free slot 2
      service.leave(2);
      
      // Next park should get slot 2 (nearest available)
      expect(service.park('CAR-5', 'White')).toBe(2);
    });

    it('should allocate slots in order after multiple leaves', () => {
      // Fill slots 1-6
      for (let i = 1; i <= 6; i++) {
        service.park(`CAR-${i}`, 'White');
      }
      
      // Free slots 4, then 2, then 5
      service.leave(4);
      service.leave(2);
      service.leave(5);
      
      // Next parks should fill 2, then 4, then 5
      expect(service.park('NEW-1', 'Red')).toBe(2);
      expect(service.park('NEW-2', 'Red')).toBe(4);
      expect(service.park('NEW-3', 'Red')).toBe(5);
    });
  });

  describe('leave', () => {
    beforeEach(() => {
      service.createParkingLot(6);
    });

    it('should free the specified slot', () => {
      service.park('CAR-1', 'White');
      
      expect(service.leave(1)).toBe(true);
      expect(service.getAvailableCount()).toBe(6);
    });

    it('should return false for invalid slot number', () => {
      expect(service.leave(0)).toBe(false);
      expect(service.leave(-1)).toBe(false);
      expect(service.leave(100)).toBe(false);
    });

    it('should return false for already empty slot', () => {
      service.park('CAR-1', 'White');
      service.leave(1);
      
      // Try to leave again
      expect(service.leave(1)).toBe(false);
    });

    it('should update indexes correctly', () => {
      service.park('KA-01-HH-1234', 'White');
      service.park('KA-01-HH-9999', 'White');
      
      service.leave(1);
      
      // Registration should no longer be found
      expect(service.getSlotNumberByRegistration('KA-01-HH-1234')).toBeNull();
      // Color index should still have slot 2
      expect(service.getSlotNumbersByColor('White')).toEqual([2]);
    });
  });

  describe('getStatus', () => {
    beforeEach(() => {
      service.createParkingLot(6);
    });

    it('should return empty array for empty lot', () => {
      expect(service.getStatus()).toEqual([]);
    });

    it('should return occupied slots in order', () => {
      service.park('KA-01-HH-1234', 'White');
      service.park('KA-01-BB-0001', 'Black');
      service.park('KA-01-HH-9999', 'Red');

      const status = service.getStatus();
      
      expect(status).toHaveLength(3);
      expect(status[0]).toEqual({
        slotNumber: 1,
        registrationNumber: 'KA-01-HH-1234',
        color: 'White',
      });
      expect(status[1]).toEqual({
        slotNumber: 2,
        registrationNumber: 'KA-01-BB-0001',
        color: 'Black',
      });
      expect(status[2]).toEqual({
        slotNumber: 3,
        registrationNumber: 'KA-01-HH-9999',
        color: 'Red',
      });
    });

    it('should skip empty slots', () => {
      service.park('CAR-1', 'White');
      service.park('CAR-2', 'Black');
      service.park('CAR-3', 'Red');
      
      service.leave(2); // Free middle slot
      
      const status = service.getStatus();
      
      expect(status).toHaveLength(2);
      expect(status[0].slotNumber).toBe(1);
      expect(status[1].slotNumber).toBe(3);
    });
  });

  describe('getRegistrationNumbersByColor', () => {
    beforeEach(() => {
      service.createParkingLot(6);
      service.park('KA-01-HH-1234', 'White');
      service.park('KA-01-HH-9999', 'White');
      service.park('KA-01-BB-0001', 'Black');
      service.park('KA-01-HH-7777', 'Red');
    });

    it('should find all registrations for a color', () => {
      const registrations = service.getRegistrationNumbersByColor('White');
      expect(registrations).toEqual(['KA-01-HH-1234', 'KA-01-HH-9999']);
    });

    it('should be case-insensitive', () => {
      expect(service.getRegistrationNumbersByColor('white')).toEqual(['KA-01-HH-1234', 'KA-01-HH-9999']);
      expect(service.getRegistrationNumbersByColor('WHITE')).toEqual(['KA-01-HH-1234', 'KA-01-HH-9999']);
    });

    it('should return empty array for non-existent color', () => {
      expect(service.getRegistrationNumbersByColor('Purple')).toEqual([]);
    });

    it('should return registrations in slot order', () => {
      const registrations = service.getRegistrationNumbersByColor('White');
      expect(registrations[0]).toBe('KA-01-HH-1234'); // Slot 1
      expect(registrations[1]).toBe('KA-01-HH-9999'); // Slot 2
    });
  });

  describe('getSlotNumbersByColor', () => {
    beforeEach(() => {
      service.createParkingLot(6);
      service.park('KA-01-HH-1234', 'White');
      service.park('KA-01-HH-9999', 'White');
      service.park('KA-01-BB-0001', 'Black');
    });

    it('should find all slots for a color', () => {
      expect(service.getSlotNumbersByColor('White')).toEqual([1, 2]);
    });

    it('should be case-insensitive', () => {
      expect(service.getSlotNumbersByColor('white')).toEqual([1, 2]);
      expect(service.getSlotNumbersByColor('BLACK')).toEqual([3]);
    });

    it('should return empty array for non-existent color', () => {
      expect(service.getSlotNumbersByColor('Blue')).toEqual([]);
    });
  });

  describe('getSlotNumberByRegistration', () => {
    beforeEach(() => {
      service.createParkingLot(6);
      service.park('KA-01-HH-1234', 'White');
      service.park('KA-01-HH-9999', 'Black');
    });

    it('should find slot for registration', () => {
      expect(service.getSlotNumberByRegistration('KA-01-HH-1234')).toBe(1);
      expect(service.getSlotNumberByRegistration('KA-01-HH-9999')).toBe(2);
    });

    it('should return null for non-existent registration', () => {
      expect(service.getSlotNumberByRegistration('MH-04-AY-1111')).toBeNull();
    });

    it('should be case-sensitive for registration', () => {
      // Registration numbers should be exact match
      expect(service.getSlotNumberByRegistration('ka-01-hh-1234')).toBeNull();
    });
  });

  describe('problem statement example workflow', () => {
    it('should produce correct output for the full example', () => {
      // This test replicates the example from the problem statement
      service.createParkingLot(6);
      
      expect(service.park('KA-01-HH-1234', 'White')).toBe(1);
      expect(service.park('KA-01-HH-9999', 'White')).toBe(2);
      expect(service.park('KA-01-BB-0001', 'Black')).toBe(3);
      expect(service.park('KA-01-HH-7777', 'Red')).toBe(4);
      expect(service.park('KA-01-HH-2701', 'Blue')).toBe(5);
      expect(service.park('KA-01-HH-3141', 'Black')).toBe(6);
      
      expect(service.leave(4)).toBe(true);
      
      const status = service.getStatus();
      expect(status).toHaveLength(5);
      expect(status.map(s => s.slotNumber)).toEqual([1, 2, 3, 5, 6]);
      
      expect(service.park('KA-01-P-333', 'White')).toBe(4);
      expect(service.park('DL-12-AA-9999', 'White')).toBeNull();
      
      expect(service.getRegistrationNumbersByColor('White'))
        .toEqual(['KA-01-HH-1234', 'KA-01-HH-9999', 'KA-01-P-333']);
      expect(service.getSlotNumbersByColor('White')).toEqual([1, 2, 4]);
      expect(service.getSlotNumberByRegistration('KA-01-HH-3141')).toBe(6);
      expect(service.getSlotNumberByRegistration('MH-04-AY-1111')).toBeNull();
    });
  });
});
