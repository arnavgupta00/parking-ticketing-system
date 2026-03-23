import { ParkingLotService } from '../../src/domain/services/ParkingLotService';
import { CommandProcessor } from '../../src/application/CommandProcessor';
import { OutputFormatter } from '../../src/infrastructure/cli/OutputFormatter';

/**
 * Edge Cases Test Suite
 * 
 * Tests for boundary conditions and unusual scenarios that
 * might trip up a naive implementation.
 */
describe('Edge Cases', () => {
  let processor: CommandProcessor;

  beforeEach(() => {
    const service = new ParkingLotService();
    const formatter = new OutputFormatter(false);
    processor = new CommandProcessor(service, formatter);
  });

  describe('Operations before parking lot creation', () => {
    it('should handle park before create', () => {
      const result = processor.process('park KA-01-HH-1234 White');
      expect(result).toContain('create a parking lot first');
    });

    it('should handle leave before create', () => {
      const result = processor.process('leave 1');
      expect(result).toContain('create a parking lot first');
    });

    it('should handle status before create', () => {
      const result = processor.process('status');
      expect(result).toContain('create a parking lot first');
    });

    it('should return not found for queries before create', () => {
      expect(processor.process('registration_numbers_for_cars_with_colour White'))
        .toBe('Not found');
      expect(processor.process('slot_numbers_for_cars_with_colour White'))
        .toBe('Not found');
      expect(processor.process('slot_number_for_registration_number KA-01-HH-1234'))
        .toBe('Not found');
    });
  });

  describe('Invalid slot numbers', () => {
    beforeEach(() => {
      processor.process('create_parking_lot 6');
    });

    it('should handle leaving from slot 0', () => {
      const result = processor.process('leave 0');
      expect(result).toContain('positive number');
    });

    it('should handle negative slot numbers', () => {
      const result = processor.process('leave -1');
      expect(result).toContain('positive number');
    });

    it('should handle slot number beyond capacity', () => {
      // This should still return "slot is free" message
      // per the silent failure approach
      const result = processor.process('leave 100');
      expect(result).toBe('Slot number 100 is free.');
    });
  });

  describe('Leave from empty slots', () => {
    beforeEach(() => {
      processor.process('create_parking_lot 6');
    });

    it('should handle leaving from never-occupied slot', () => {
      const result = processor.process('leave 3');
      expect(result).toBe('Slot number 3 is free.');
    });

    it('should handle leaving from already-vacated slot', () => {
      processor.process('park CAR-1 White');
      processor.process('leave 1');
      
      // Leave again
      const result = processor.process('leave 1');
      expect(result).toBe('Slot number 1 is free.');
    });
  });

  describe('Query with no matches', () => {
    beforeEach(() => {
      processor.process('create_parking_lot 6');
      processor.process('park KA-01-HH-1234 White');
    });

    it('should return not found for color with no cars', () => {
      expect(processor.process('registration_numbers_for_cars_with_colour Purple'))
        .toBe('Not found');
      expect(processor.process('slot_numbers_for_cars_with_colour Purple'))
        .toBe('Not found');
    });

    it('should return not found for non-existent registration', () => {
      expect(processor.process('slot_number_for_registration_number FAKE-123'))
        .toBe('Not found');
    });
  });

  describe('Empty parking lot queries', () => {
    beforeEach(() => {
      processor.process('create_parking_lot 6');
    });

    it('should handle status on empty lot', () => {
      const result = processor.process('status');
      expect(result).not.toBeNull();
      expect(result!).toContain('Slot No.');
      // Should only have header, no car entries
      const lines = result!.split('\n');
      expect(lines).toHaveLength(1);
    });

    it('should return not found for color query on empty lot', () => {
      expect(processor.process('registration_numbers_for_cars_with_colour White'))
        .toBe('Not found');
    });
  });

  describe('Rapid park/leave cycles', () => {
    beforeEach(() => {
      processor.process('create_parking_lot 3');
    });

    it('should handle rapid cycling correctly', () => {
      // Park, leave, park same slot repeatedly
      for (let i = 0; i < 10; i++) {
        expect(processor.process(`park CAR-${i} White`))
          .toBe('Allocated slot number: 1');
        processor.process('leave 1');
      }
    });

    it('should maintain correct state after many operations', () => {
      // Complex sequence
      processor.process('park A White');  // Slot 1
      processor.process('park B White');  // Slot 2
      processor.process('park C White');  // Slot 3
      processor.process('leave 2');       // Free slot 2
      processor.process('leave 1');       // Free slot 1
      processor.process('park D White');  // Should get slot 1
      processor.process('park E White');  // Should get slot 2
      
      expect(processor.process('slot_number_for_registration_number D'))
        .toBe('1');
      expect(processor.process('slot_number_for_registration_number E'))
        .toBe('2');
      expect(processor.process('slot_number_for_registration_number C'))
        .toBe('3');
    });
  });

  describe('Color case sensitivity', () => {
    beforeEach(() => {
      processor.process('create_parking_lot 6');
      processor.process('park CAR-1 White');
      processor.process('park CAR-2 WHITE');
      processor.process('park CAR-3 white');
    });

    it('should find all cars regardless of input color case', () => {
      const result = processor.process('registration_numbers_for_cars_with_colour WhItE');
      expect(result).toBe('CAR-1, CAR-2, CAR-3');
    });

    it('should preserve original color in status', () => {
      const status = processor.process('status');
      expect(status).toContain('White');
      expect(status).toContain('WHITE');
      expect(status).toContain('white');
    });
  });

  describe('Special characters in registration', () => {
    beforeEach(() => {
      processor.process('create_parking_lot 6');
    });

    it('should handle various registration formats', () => {
      const registrations = [
        'KA-01-HH-1234',
        'MH-12-AB-9999',
        'DL-1C-CD-0001',
        'TN-99-ZZ-9999',
      ];

      for (let i = 0; i < registrations.length; i++) {
        processor.process(`park ${registrations[i]} White`);
        expect(processor.process(`slot_number_for_registration_number ${registrations[i]}`))
          .toBe(String(i + 1));
      }
    });
  });

  describe('Stress test', () => {
    it('should handle 1000 slot parking lot', () => {
      processor.process('create_parking_lot 1000');
      
      // Park 500 cars
      for (let i = 1; i <= 500; i++) {
        const result = processor.process(`park REG-${i} White`);
        expect(result).toBe(`Allocated slot number: ${i}`);
      }
      
      // Leave every other car (odd slots)
      for (let i = 1; i <= 500; i += 2) {
        processor.process(`leave ${i}`);
      }
      
      // Park 250 more - should fill odd slots first (nearest)
      for (let i = 501; i <= 750; i++) {
        const result = processor.process(`park REG-${i} Black`);
        // Should get odd slots 1, 3, 5, ...
        const expectedSlot = ((i - 501) * 2) + 1;
        expect(result).toBe(`Allocated slot number: ${expectedSlot}`);
      }
    });
  });

  describe('Same registration re-parking', () => {
    beforeEach(() => {
      processor.process('create_parking_lot 6');
    });

    it('should prevent parking same registration twice', () => {
      processor.process('park CAR-1 White');
      const result = processor.process('park CAR-1 White');
      
      expect(result).toContain('already parked in slot 1');
    });
  });
});
