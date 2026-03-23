import { ParkingLotService } from '../../src/domain/services/ParkingLotService';
import { CommandProcessor } from '../../src/application/CommandProcessor';
import { OutputFormatter } from '../../src/infrastructure/cli/OutputFormatter';

/**
 * Integration Test Suite
 * 
 * These tests verify the complete end-to-end flow matching
 * the expected output from the problem statement exactly.
 */
describe('Parking Lot Integration Tests', () => {
  let processor: CommandProcessor;

  beforeEach(() => {
    const service = new ParkingLotService();
    const formatter = new OutputFormatter(false);
    processor = new CommandProcessor(service, formatter);
  });

  describe('File-based execution example', () => {
    it('should produce exact expected output for the problem statement example', () => {
      const commandsAndExpectedOutputs = [
        { cmd: 'create_parking_lot 6', out: 'Created a parking lot with 6 slots' },
        { cmd: 'park KA-01-HH-1234 White', out: 'Allocated slot number: 1' },
        { cmd: 'park KA-01-HH-9999 White', out: 'Allocated slot number: 2' },
        { cmd: 'park KA-01-BB-0001 Black', out: 'Allocated slot number: 3' },
        { cmd: 'park KA-01-HH-7777 Red', out: 'Allocated slot number: 4' },
        { cmd: 'park KA-01-HH-2701 Blue', out: 'Allocated slot number: 5' },
        { cmd: 'park KA-01-HH-3141 Black', out: 'Allocated slot number: 6' },
        { cmd: 'leave 4', out: 'Slot number 4 is free.' },
      ];

      for (const { cmd, out } of commandsAndExpectedOutputs) {
        expect(processor.process(cmd)).toBe(out);
      }

      // Status command output
      const statusOutput = processor.process('status');
      expect(statusOutput).not.toBeNull();
      const lines = statusOutput!.split('\n');
      
      expect(lines[0]).toContain('Slot No.');
      expect(lines[0]).toContain('Registration No');
      expect(lines[0]).toContain('Colour');
      expect(lines[1]).toContain('1');
      expect(lines[1]).toContain('KA-01-HH-1234');
      expect(lines[1]).toContain('White');
      expect(lines[2]).toContain('2');
      expect(lines[2]).toContain('KA-01-HH-9999');
      expect(lines[2]).toContain('White');
      expect(lines[3]).toContain('3');
      expect(lines[3]).toContain('KA-01-BB-0001');
      expect(lines[3]).toContain('Black');
      expect(lines[4]).toContain('5');
      expect(lines[4]).toContain('KA-01-HH-2701');
      expect(lines[4]).toContain('Blue');
      expect(lines[5]).toContain('6');
      expect(lines[5]).toContain('KA-01-HH-3141');
      expect(lines[5]).toContain('Black');

      // Continue with remaining commands
      expect(processor.process('park KA-01-P-333 White'))
        .toBe('Allocated slot number: 4');
      expect(processor.process('park DL-12-AA-9999 White'))
        .toBe('Sorry, parking lot is full');
      expect(processor.process('registration_numbers_for_cars_with_colour White'))
        .toBe('KA-01-HH-1234, KA-01-HH-9999, KA-01-P-333');
      expect(processor.process('slot_numbers_for_cars_with_colour White'))
        .toBe('1, 2, 4');
      expect(processor.process('slot_number_for_registration_number KA-01-HH-3141'))
        .toBe('6');
      expect(processor.process('slot_number_for_registration_number MH-04-AY-1111'))
        .toBe('Not found');
    });
  });

  describe('Multiple parking lots', () => {
    it('should reset state when creating new lot', () => {
      // First lot
      processor.process('create_parking_lot 3');
      processor.process('park CAR-1 White');
      processor.process('park CAR-2 White');
      
      // Create new lot - should reset
      processor.process('create_parking_lot 2');
      
      // Should start fresh
      expect(processor.process('park CAR-3 Red')).toBe('Allocated slot number: 1');
      
      // Old cars should not be found
      expect(processor.process('slot_number_for_registration_number CAR-1'))
        .toBe('Not found');
    });
  });

  describe('Capacity edge cases', () => {
    it('should handle lot with capacity 1', () => {
      processor.process('create_parking_lot 1');
      
      expect(processor.process('park ONLY-CAR White'))
        .toBe('Allocated slot number: 1');
      expect(processor.process('park SECOND-CAR White'))
        .toBe('Sorry, parking lot is full');
      
      processor.process('leave 1');
      
      expect(processor.process('park THIRD-CAR Black'))
        .toBe('Allocated slot number: 1');
    });

    it('should handle large parking lot', () => {
      processor.process('create_parking_lot 100');
      
      // Fill all slots
      for (let i = 1; i <= 100; i++) {
        const result = processor.process(`park REG-${i} White`);
        expect(result).toBe(`Allocated slot number: ${i}`);
      }
      
      expect(processor.process('park EXTRA White'))
        .toBe('Sorry, parking lot is full');
    });
  });
});
