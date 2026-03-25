import { ParkingLotManager } from '../../src/domain/services/ParkingLotManager';
import { CommandProcessor } from '../../src/application/CommandProcessor';
import { OutputFormatter } from '../../src/infrastructure/cli/OutputFormatter';

/**
 * Integration Test Suite
 * 
 * These tests verify the complete end-to-end flow for multi-lot system.
 */
describe('Parking Lot Integration Tests - Multi-Lot', () => {
  let processor: CommandProcessor;

  beforeEach(() => {
    const manager = new ParkingLotManager();
    const formatter = new OutputFormatter(false);
    processor = new CommandProcessor(manager, formatter);
  });

  describe('Multi-lot workflow', () => {
    it('should handle multi-lot system correctly', () => {
      const commands = [
        { cmd: 'create_parking_lot 5', out: 'Created a parking lot with 5 slots' },
        { cmd: 'create_parking_lot 3', out: 'Created a parking lot with 3 slots' },
        { cmd: 'create_parking_lot 6', out: 'Created a parking lot with 6 slots' },
        { cmd: 'dispatch_rule even_distribution', out: 'Dispatcher is now using the Even Distribution rule' },
        { cmd: 'park KA-01-HH-1234 White', out: 'Allocated slot number: 1 in Lot 1' },
        { cmd: 'park KA-01-HH-9999 White', out: 'Allocated slot number: 1 in Lot 2' },
        { cmd: 'leave 2 1', out: 'Slot number 1 in Lot 2 is free.' },
      ];

      for (const { cmd, out } of commands) {
        expect(processor.process(cmd)).toBe(out);
      }
    });

    it('should query across all lots', () => {
      processor.process('create_parking_lot 3');
      processor.process('create_parking_lot 3');
      processor.process('dispatch_rule fill_first');
      processor.process('park KA-01-HH-1234 White');
      processor.process('park KA-01-HH-9999 White');
      processor.process('park KA-01-BB-0001 Black');
      processor.process('park KA-01-HH-7777 White');

      expect(processor.process('registration_numbers_for_cars_with_colour White'))
        .toBe('KA-01-HH-1234, KA-01-HH-9999, KA-01-HH-7777');
      expect(processor.process('slot_numbers_for_cars_with_colour White'))
        .toBe('L1-1, L1-2, L2-1');
      expect(processor.process('slot_number_for_registration_number KA-01-BB-0001'))
        .toBe('L1-3');
    });
  });

  describe('Single lot compatibility', () => {
    it('should work with single lot', () => {
      const commandsAndExpectedOutputs = [
        { cmd: 'create_parking_lot 6', out: 'Created a parking lot with 6 slots' },
        { cmd: 'park KA-01-HH-1234 White', out: 'Allocated slot number: 1 in Lot 1' },
        { cmd: 'park KA-01-HH-9999 White', out: 'Allocated slot number: 2 in Lot 1' },
        { cmd: 'park KA-01-BB-0001 Black', out: 'Allocated slot number: 3 in Lot 1' },
        { cmd: 'park KA-01-HH-7777 Red', out: 'Allocated slot number: 4 in Lot 1' },
        { cmd: 'park KA-01-HH-2701 Blue', out: 'Allocated slot number: 5 in Lot 1' },
        { cmd: 'park KA-01-HH-3141 Black', out: 'Allocated slot number: 6 in Lot 1' },
        { cmd: 'leave 1 4', out: 'Slot number 4 in Lot 1 is free.' },
      ];

      for (const { cmd, out } of commandsAndExpectedOutputs) {
        expect(processor.process(cmd)).toBe(out);
      }

      const statusOutput = processor.process('status');
      expect(statusOutput).not.toBeNull();
      expect(typeof statusOutput).toBe('string');
      const lines = (statusOutput as string).split('\n');
      
      expect(lines[0]).toContain('Lot 1');

      // Continue with remaining commands
      expect(processor.process('park KA-01-P-333 White'))
        .toBe('Allocated slot number: 4 in Lot 1');
      expect(processor.process('park DL-12-AA-9999 White'))
        .toBe('Sorry, all parking lots are full');
      expect(processor.process('registration_numbers_for_cars_with_colour White'))
        .toBe('KA-01-HH-1234, KA-01-HH-9999, KA-01-P-333');
      expect(processor.process('slot_numbers_for_cars_with_colour White'))
        .toBe('L1-1, L1-2, L1-4');
      expect(processor.process('slot_number_for_registration_number KA-01-HH-3141'))
        .toBe('L1-6');
      expect(processor.process('slot_number_for_registration_number MH-04-AY-1111'))
        .toBe('Not found');
    });
  });

  describe('Dispatch strategies', () => {
    it('should use even distribution by default', () => {
      processor.process('create_parking_lot 2');
      processor.process('create_parking_lot 2');

      processor.process('park CAR-1 White');
      processor.process('park CAR-2 White');

      // Should distribute across lots
      const regs1 = processor.process('registration_numbers_for_cars_with_colour White');
      expect(regs1).toContain('CAR-1');
      expect(regs1).toContain('CAR-2');
    });

    it('should fill first when strategy is set', () => {
      processor.process('create_parking_lot 3');
      processor.process('create_parking_lot 3');
      processor.process('dispatch_rule fill_first');

      processor.process('park CAR-1 White');
      processor.process('park CAR-2 White');
      processor.process('park CAR-3 Black');

      // All should be in lot 1
      const slots = processor.process('slot_numbers_for_cars_with_colour White');
      expect(slots).toBe('L1-1, L1-2');
      
      const blackSlot = processor.process('slot_number_for_registration_number CAR-3');
      expect(blackSlot).toBe('L1-3');
    });
  });

  describe('Edge cases', () => {
    it('should handle all lots full', () => {
      processor.process('create_parking_lot 1');
      processor.process('create_parking_lot 1');

      processor.process('park CAR-1 White');
      processor.process('park CAR-2 White');

      expect(processor.process('park CAR-3 Black'))
        .toBe('Sorry, all parking lots are full');
    });

    it('should handle capacity 1 lots', () => {
      processor.process('create_parking_lot 1');

      expect(processor.process('park CAR-1 White'))
        .toBe('Allocated slot number: 1 in Lot 1');
      expect(processor.process('park CAR-2 White'))
        .toBe('Sorry, all parking lots are full');
    });

    it('should handle large multi-lot system', () => {
      processor.process('create_parking_lot 100');
      processor.process('create_parking_lot 100');
      processor.process('create_parking_lot 100');

      for (let i = 1; i <= 250; i++) {
        processor.process(`park CAR-${i} White`);
      }

      const result = processor.process('park CAR-251 White');
      expect(result).not.toBe('Sorry, all parking lots are full');
    });
  });
});

