import { ParkingLotManager } from '../../../src/domain/services/ParkingLotManager';
import { EvenDistributionStrategy } from '../../../src/domain/strategies/EvenDistributionStrategy';
import { FillFirstStrategy } from '../../../src/domain/strategies/FillFirstStrategy';

describe('ParkingLotManager', () => {
  let manager: ParkingLotManager;

  beforeEach(() => {
    manager = new ParkingLotManager();
  });

  describe('createParkingLot', () => {
    it('should create parking lots with sequential numbers', () => {
      const lot1 = manager.createParkingLot(5);
      const lot2 = manager.createParkingLot(10);
      const lot3 = manager.createParkingLot(3);

      expect(lot1).toBe(1);
      expect(lot2).toBe(2);
      expect(lot3).toBe(3);
    });

    it('should track lot count', () => {
      expect(manager.getLotCount()).toBe(0);
      manager.createParkingLot(5);
      expect(manager.getLotCount()).toBe(1);
      manager.createParkingLot(10);
      expect(manager.getLotCount()).toBe(2);
    });
  });

  describe('park', () => {
    beforeEach(() => {
      manager.createParkingLot(3);
      manager.createParkingLot(3);
      manager.getDispatcher().setStrategy(new EvenDistributionStrategy());
    });

    it('should park car using dispatcher strategy', () => {
      const result = manager.park('CAR-1', 'White');
      expect(result).not.toBeNull();
      expect(result).not.toBe(-1);
      expect(result).toHaveProperty('lotNumber');
      expect(result).toHaveProperty('slotNumber');
    });

    it('should distribute evenly across lots with even_distribution', () => {
      const results = [];
      results.push(manager.park('CAR-1', 'White'));
      results.push(manager.park('CAR-2', 'White'));
      results.push(manager.park('CAR-3', 'Black'));

      const lot1Cars = results.filter(r => r && typeof r !== 'number' && r.lotNumber === 1).length;
      const lot2Cars = results.filter(r => r && typeof r !== 'number' && r.lotNumber === 2).length;

      // Should be distributed (not all in one lot)
      expect(lot1Cars).toBeGreaterThan(0);
      expect(lot2Cars).toBeGreaterThan(0);
    });

    it('should fill first lot with fill_first strategy', () => {
      manager.getDispatcher().setStrategy(new FillFirstStrategy());

      const result1 = manager.park('CAR-1', 'White');
      const result2 = manager.park('CAR-2', 'White');
      const result3 = manager.park('CAR-3', 'Black');

      expect(result1).toMatchObject({ lotNumber: 1 });
      expect(result2).toMatchObject({ lotNumber: 1 });
      expect(result3).toMatchObject({ lotNumber: 1 });
    });

    it('should prevent duplicate registrations', () => {
      manager.park('CAR-1', 'White');
      const duplicate = manager.park('CAR-1', 'Red');

      expect(duplicate).toBe(-1);
    });

    it('should return null when all lots are full', () => {
      manager.createParkingLot(2);
      manager.park('CAR-1', 'White');
      manager.park('CAR-2', 'White');
      manager.park('CAR-3', 'Black');
      manager.park('CAR-4', 'Black');
      manager.park('CAR-5', 'Red');
      manager.park('CAR-6', 'Red');
      manager.park('CAR-7', 'Blue');
      manager.park('CAR-8', 'Blue');

      const result = manager.park('CAR-9', 'Green');
      expect(result).toBeNull();
    });
  });

  describe('leave', () => {
    beforeEach(() => {
      manager.createParkingLot(5);
      manager.createParkingLot(5);
    });

    it('should remove car from specified lot and slot', () => {
      manager.park('CAR-1', 'White');
      const success = manager.leave(1, 1);

      expect(success).toBe(true);
    });

    it('should return false for invalid lot number', () => {
      const success = manager.leave(99, 1);
      expect(success).toBe(false);
    });

    it('should clean up global registration index', () => {
      manager.park('CAR-1', 'White');
      manager.leave(1, 1);

      // Should be able to park same registration again
      const result = manager.park('CAR-1', 'Red');
      expect(result).not.toBe(-1);
    });
  });

  describe('getStatus', () => {
    beforeEach(() => {
      manager.createParkingLot(3);
      manager.createParkingLot(3);
    });

    it('should return all parked cars sorted by lot and slot', () => {
      manager.getDispatcher().setStrategy(new FillFirstStrategy());
      manager.park('CAR-1', 'White');
      manager.park('CAR-2', 'Black');
      manager.park('CAR-3', 'Red');
      manager.park('CAR-4', 'Blue');

      const status = manager.getStatus();

      expect(status.length).toBe(4);
      expect(status[0].lotNumber).toBe(1);
      expect(status[0].slotNumber).toBe(1);
    });

    it('should return empty array when no cars parked', () => {
      const status = manager.getStatus();
      expect(status).toEqual([]);
    });
  });

  describe('query operations', () => {
    beforeEach(() => {
      manager.createParkingLot(5);
      manager.createParkingLot(5);
      manager.getDispatcher().setStrategy(new FillFirstStrategy());
    });

    describe('getRegistrationNumbersByColor', () => {
      it('should find registrations across all lots', () => {
        manager.park('CAR-1', 'White');
        manager.park('CAR-2', 'Black');
        manager.park('CAR-3', 'White');
        manager.park('CAR-4', 'Red');
        manager.park('CAR-5', 'White');

        const whiteCars = manager.getRegistrationNumbersByColor('White');
        expect(whiteCars).toContain('CAR-1');
        expect(whiteCars).toContain('CAR-3');
        expect(whiteCars).toContain('CAR-5');
        expect(whiteCars.length).toBe(3);
      });

      it('should be case-insensitive', () => {
        manager.park('CAR-1', 'White');
        const result = manager.getRegistrationNumbersByColor('white');
        expect(result).toContain('CAR-1');
      });
    });

    describe('getSlotNumbersByColor', () => {
      it('should return slots with lot prefix', () => {
        manager.park('CAR-1', 'White');
        manager.park('CAR-2', 'Black');
        manager.park('CAR-3', 'White');

        const slots = manager.getSlotNumbersByColor('White');
        expect(slots).toContain('L1-1');
        expect(slots).toContain('L1-3');
      });

      it('should return empty array when color not found', () => {
        const slots = manager.getSlotNumbersByColor('Purple');
        expect(slots).toEqual([]);
      });
    });

    describe('getSlotNumberByRegistration', () => {
      it('should return slot with lot prefix', () => {
        manager.park('CAR-1', 'White');
        manager.park('CAR-2', 'Black');

        const slot = manager.getSlotNumberByRegistration('CAR-2');
        expect(slot).toBe('L1-2');
      });

      it('should return null when registration not found', () => {
        const slot = manager.getSlotNumberByRegistration('UNKNOWN');
        expect(slot).toBeNull();
      });

      it('should track across multiple lots', () => {
        manager.park('CAR-1', 'White');
        manager.park('CAR-2', 'White');
        manager.park('CAR-3', 'White');
        manager.park('CAR-4', 'White');
        manager.park('CAR-5', 'White');
        manager.park('CAR-6', 'White'); // Should go to lot 2

        const slot = manager.getSlotNumberByRegistration('CAR-6');
        expect(slot).toBe('L2-1');
      });
    });
  });

  describe('hasLots', () => {
    it('should return false when no lots created', () => {
      expect(manager.hasLots()).toBe(false);
    });

    it('should return true after creating lots', () => {
      manager.createParkingLot(5);
      expect(manager.hasLots()).toBe(true);
    });
  });
});
