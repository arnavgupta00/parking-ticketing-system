import { Dispatcher } from '../../../src/domain/services/Dispatcher';
import { EvenDistributionStrategy } from '../../../src/domain/strategies/EvenDistributionStrategy';
import { FillFirstStrategy } from '../../../src/domain/strategies/FillFirstStrategy';
import { ParkingLotService } from '../../../src/domain/services/ParkingLotService';
import { LotInfo } from '../../../src/domain/strategies/DispatchStrategy';

describe('Dispatcher', () => {
  let dispatcher: Dispatcher;

  beforeEach(() => {
    dispatcher = new Dispatcher();
  });

  describe('default strategy', () => {
    it('should use EvenDistributionStrategy by default', () => {
      expect(dispatcher.getStrategy()).toBeInstanceOf(EvenDistributionStrategy);
    });
  });

  describe('setStrategy', () => {
    it('should allow changing strategy', () => {
      dispatcher.setStrategy(new FillFirstStrategy());
      expect(dispatcher.getStrategy()).toBeInstanceOf(FillFirstStrategy);
    });
  });

  describe('EvenDistributionStrategy', () => {
    beforeEach(() => {
      dispatcher.setStrategy(new EvenDistributionStrategy());
    });

    it('should select the emptiest lot', () => {
      const lot1 = new ParkingLotService();
      lot1.createParkingLot(10);
      lot1.park('CAR-1', 'White');
      lot1.park('CAR-2', 'White');

      const lot2 = new ParkingLotService();
      lot2.createParkingLot(10);
      lot2.park('CAR-3', 'Black');

      const lot3 = new ParkingLotService();
      lot3.createParkingLot(10);

      const lots: LotInfo[] = [
        { lotNumber: 1, service: lot1 },
        { lotNumber: 2, service: lot2 },
        { lotNumber: 3, service: lot3 },
      ];

      const selected = dispatcher.selectLotForParking(lots);
      expect(selected).toBe(3); // Lot 3 is completely empty
    });

    it('should pick closest lot when multiple lots have same occupancy', () => {
      const lot1 = new ParkingLotService();
      lot1.createParkingLot(10);

      const lot2 = new ParkingLotService();
      lot2.createParkingLot(10);

      const lot3 = new ParkingLotService();
      lot3.createParkingLot(10);

      const lots: LotInfo[] = [
        { lotNumber: 1, service: lot1 },
        { lotNumber: 2, service: lot2 },
        { lotNumber: 3, service: lot3 },
      ];

      const selected = dispatcher.selectLotForParking(lots);
      expect(selected).toBe(1); // All equal, pick lot 1 (closest)
    });

    it('should return null when all lots are full', () => {
      const lot1 = new ParkingLotService();
      lot1.createParkingLot(2);
      lot1.park('CAR-1', 'White');
      lot1.park('CAR-2', 'White');

      const lot2 = new ParkingLotService();
      lot2.createParkingLot(2);
      lot2.park('CAR-3', 'Black');
      lot2.park('CAR-4', 'Black');

      const lots: LotInfo[] = [
        { lotNumber: 1, service: lot1 },
        { lotNumber: 2, service: lot2 },
      ];

      const selected = dispatcher.selectLotForParking(lots);
      expect(selected).toBeNull();
    });

    it('should handle different capacities correctly', () => {
      const lot1 = new ParkingLotService();
      lot1.createParkingLot(4);
      lot1.park('CAR-1', 'White');
      lot1.park('CAR-2', 'White'); // 50% occupancy

      const lot2 = new ParkingLotService();
      lot2.createParkingLot(10);
      lot2.park('CAR-3', 'Black');
      lot2.park('CAR-4', 'Black');
      lot2.park('CAR-5', 'Black'); // 30% occupancy

      const lots: LotInfo[] = [
        { lotNumber: 1, service: lot1 },
        { lotNumber: 2, service: lot2 },
      ];

      const selected = dispatcher.selectLotForParking(lots);
      expect(selected).toBe(2); // Lot 2 has lower occupancy percentage
    });
  });

  describe('FillFirstStrategy', () => {
    beforeEach(() => {
      dispatcher.setStrategy(new FillFirstStrategy());
    });

    it('should select the first non-full lot', () => {
      const lot1 = new ParkingLotService();
      lot1.createParkingLot(2);
      lot1.park('CAR-1', 'White');
      lot1.park('CAR-2', 'White'); // Full

      const lot2 = new ParkingLotService();
      lot2.createParkingLot(5);
      lot2.park('CAR-3', 'Black');

      const lot3 = new ParkingLotService();
      lot3.createParkingLot(10);

      const lots: LotInfo[] = [
        { lotNumber: 1, service: lot1 },
        { lotNumber: 2, service: lot2 },
        { lotNumber: 3, service: lot3 },
      ];

      const selected = dispatcher.selectLotForParking(lots);
      expect(selected).toBe(2); // Lot 1 is full, so pick lot 2
    });

    it('should prefer closer lots even if farther ones are emptier', () => {
      const lot1 = new ParkingLotService();
      lot1.createParkingLot(10);
      lot1.park('CAR-1', 'White');

      const lot2 = new ParkingLotService();
      lot2.createParkingLot(10); // Completely empty

      const lots: LotInfo[] = [
        { lotNumber: 1, service: lot1 },
        { lotNumber: 2, service: lot2 },
      ];

      const selected = dispatcher.selectLotForParking(lots);
      expect(selected).toBe(1); // Pick lot 1 even though lot 2 is emptier
    });

    it('should return null when all lots are full', () => {
      const lot1 = new ParkingLotService();
      lot1.createParkingLot(1);
      lot1.park('CAR-1', 'White');

      const lot2 = new ParkingLotService();
      lot2.createParkingLot(1);
      lot2.park('CAR-2', 'White');

      const lots: LotInfo[] = [
        { lotNumber: 1, service: lot1 },
        { lotNumber: 2, service: lot2 },
      ];

      const selected = dispatcher.selectLotForParking(lots);
      expect(selected).toBeNull();
    });

    it('should handle empty lots array', () => {
      const selected = dispatcher.selectLotForParking([]);
      expect(selected).toBeNull();
    });
  });
});
