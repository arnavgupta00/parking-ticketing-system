import { CommandProcessor } from '../../../src/application/CommandProcessor';
import { ParkingLotManager } from '../../../src/domain/services/ParkingLotManager';
import { OutputFormatter } from '../../../src/infrastructure/cli/OutputFormatter';

/**
 * CommandProcessor Test Suite
 * 
 * Tests the command parsing and routing layer.
 * We use the non-colored formatter for easier assertion matching.
 */
describe('CommandProcessor', () => {
  let processor: CommandProcessor;
  let service: ParkingLotManager;

  beforeEach(() => {
    service = new ParkingLotManager();
    const formatter = new OutputFormatter(false); // No colors for testing
    processor = new CommandProcessor(service, formatter);
  });

  describe('create_parking_lot', () => {
    it('should create parking lot', () => {
      const result = processor.process('create_parking_lot 6');
      expect(result).toBe('Created a parking lot with 6 slots');
    });

    it('should handle missing capacity', () => {
      const result = processor.process('create_parking_lot');
      expect(result).toContain('Usage');
    });

    it('should handle invalid capacity', () => {
      const result = processor.process('create_parking_lot abc');
      expect(result).toContain('positive number');
    });

    it('should handle zero capacity', () => {
      const result = processor.process('create_parking_lot 0');
      expect(result).toContain('positive number');
    });
  });

  describe('park', () => {
    beforeEach(() => {
      processor.process('create_parking_lot 6');
    });

    it('should park a car', () => {
      const result = processor.process('park KA-01-HH-1234 White');
      expect(result).toBe('Allocated slot number: 1 in Lot 1');
    });

    it('should handle missing arguments', () => {
      const result = processor.process('park KA-01-HH-1234');
      expect(result).toContain('Usage');
    });

    it('should return full message when lot is full', () => {
      for (let i = 1; i <= 6; i++) {
        processor.process(`park REG-${i} White`);
      }
      const result = processor.process('park EXTRA White');
      expect(result).toBe('Sorry, all parking lots are full');
    });

    it('should require parking lot to be created first', () => {
      const newProcessor = new CommandProcessor(
        new ParkingLotManager(),
        new OutputFormatter(false)
      );
      const result = newProcessor.process('park KA-01-HH-1234 White');
      expect(result).toContain('create a parking lot first');
    });
  });

  describe('leave', () => {
    beforeEach(() => {
      processor.process('create_parking_lot 6');
      processor.process('park KA-01-HH-1234 White');
    });

    it('should free a slot', () => {
      const result = processor.process('leave 1 1');
      expect(result).toBe('Slot number 1 in Lot 1 is free.');
    });

    it('should handle missing slot number', () => {
      const result = processor.process('leave');
      expect(result).toContain('Usage');
    });

    it('should handle invalid slot number', () => {
      const result = processor.process('leave 1 abc');
      expect(result).toContain('positive number');
    });
  });

  describe('status', () => {
    beforeEach(() => {
      processor.process('create_parking_lot 6');
    });

    it('should show status header for empty lot', () => {
      const result = processor.process('status');
      expect(result).toContain('Slot No.');
      expect(result).toContain('Registration No');
      expect(result).toContain('Colour');
    });

    it('should show parked cars', () => {
      processor.process('park KA-01-HH-1234 White');
      processor.process('park KA-01-BB-0001 Black');
      
      const result = processor.process('status');
      
      expect(result).toContain('KA-01-HH-1234');
      expect(result).toContain('White');
      expect(result).toContain('KA-01-BB-0001');
      expect(result).toContain('Black');
    });
  });

  describe('registration_numbers_for_cars_with_colour', () => {
    beforeEach(() => {
      processor.process('create_parking_lot 6');
      processor.process('park KA-01-HH-1234 White');
      processor.process('park KA-01-HH-9999 White');
      processor.process('park KA-01-BB-0001 Black');
    });

    it('should find registrations by color', () => {
      const result = processor.process('registration_numbers_for_cars_with_colour White');
      expect(result).toBe('KA-01-HH-1234, KA-01-HH-9999');
    });

    it('should return not found for non-existent color', () => {
      const result = processor.process('registration_numbers_for_cars_with_colour Purple');
      expect(result).toBe('Not found');
    });

    it('should be case-insensitive', () => {
      const result = processor.process('registration_numbers_for_cars_with_colour white');
      expect(result).toBe('KA-01-HH-1234, KA-01-HH-9999');
    });
  });

  describe('slot_numbers_for_cars_with_colour', () => {
    beforeEach(() => {
      processor.process('create_parking_lot 6');
      processor.process('park KA-01-HH-1234 White');
      processor.process('park KA-01-HH-9999 White');
      processor.process('park KA-01-BB-0001 Black');
    });

    it('should find slots by color', () => {
      const result = processor.process('slot_numbers_for_cars_with_colour White');
      expect(result).toBe('L1-1, L1-2');
    });

    it('should return not found for non-existent color', () => {
      const result = processor.process('slot_numbers_for_cars_with_colour Purple');
      expect(result).toBe('Not found');
    });
  });

  describe('slot_number_for_registration_number', () => {
    beforeEach(() => {
      processor.process('create_parking_lot 6');
      processor.process('park KA-01-HH-1234 White');
      processor.process('park KA-01-HH-9999 Black');
    });

    it('should find slot by registration', () => {
      const result = processor.process('slot_number_for_registration_number KA-01-HH-1234');
      expect(result).toBe('L1-1');
    });

    it('should return not found for non-existent registration', () => {
      const result = processor.process('slot_number_for_registration_number MH-04-AY-1111');
      expect(result).toBe('Not found');
    });
  });

  describe('help', () => {
    it('should return help text', () => {
      const result = processor.process('help');
      expect(result).toContain('Available Commands');
      expect(result).toContain('create_parking_lot');
      expect(result).toContain('park');
      expect(result).toContain('leave');
    });
  });

  describe('exit', () => {
    it('should return null for exit', () => {
      const result = processor.process('exit');
      expect(result).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle empty input', () => {
      expect(processor.process('')).toBe('');
    });

    it('should handle whitespace-only input', () => {
      expect(processor.process('   ')).toBe('');
    });

    it('should handle unknown commands', () => {
      expect(processor.process('unknown_command')).toBe('');
    });

    it('should handle extra whitespace between arguments', () => {
      processor.process('create_parking_lot 6');
      const result = processor.process('park   KA-01-HH-1234    White');
      expect(result).toBe('Allocated slot number: 1 in Lot 1');
    });
  });

  describe('full workflow', () => {
    it('should handle the complete example workflow', () => {
      const commands = [
        'create_parking_lot 6',
        'park KA-01-HH-1234 White',
        'park KA-01-HH-9999 White',
        'park KA-01-BB-0001 Black',
        'park KA-01-HH-7777 Red',
        'park KA-01-HH-2701 Blue',
        'park KA-01-HH-3141 Black',
        'leave 1 4',
        'status',
        'park KA-01-P-333 White',
        'park DL-12-AA-9999 White',
        'registration_numbers_for_cars_with_colour White',
        'slot_numbers_for_cars_with_colour White',
        'slot_number_for_registration_number KA-01-HH-3141',
        'slot_number_for_registration_number MH-04-AY-1111',
      ];

      const expectedOutputs = [
        'Created a parking lot with 6 slots',
        'Allocated slot number: 1 in Lot 1',
        'Allocated slot number: 2 in Lot 1',
        'Allocated slot number: 3 in Lot 1',
        'Allocated slot number: 4 in Lot 1',
        'Allocated slot number: 5 in Lot 1',
        'Allocated slot number: 6 in Lot 1',
        'Slot number 4 in Lot 1 is free.',
        // Status output will be verified separately
        null,
        'Allocated slot number: 4 in Lot 1',
        'Sorry, all parking lots are full',
        'KA-01-HH-1234, KA-01-HH-9999, KA-01-P-333',
        'L1-1, L1-2, L1-4',
        'L1-6',
        'Not found',
      ];

      for (let i = 0; i < commands.length; i++) {
        const result = processor.process(commands[i]);
        if (expectedOutputs[i] !== null) {
          if (commands[i] === 'status') {
            // Verify status contains expected data
            expect(result).toContain('KA-01-HH-1234');
            expect(result).toContain('KA-01-HH-2701');
            expect(result).toContain('KA-01-HH-3141');
            expect(result).not.toContain('KA-01-HH-7777'); // Left slot 4
          } else {
            expect(result).toBe(expectedOutputs[i]);
          }
        }
      }
    });
  });
});
