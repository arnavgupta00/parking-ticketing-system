import { success, error, warning, info, highlight, bold, dim } from '../colors/AnsiColors';
import { StatusEntry } from '../../domain/services/ParkingLotManager';

/**
 * OutputFormatter - Handles all output formatting for the parking lot system.
 * 
 * This centralizes all the "prettifying" logic. The core business logic
 * doesn't need to know about colors or formatting - it just returns data,
 * and this class makes it look nice.
 * 
 * We have two modes:
 * - Interactive mode: Full colors, pretty output
 * - File mode: Plain text to match expected output exactly
 */
export class OutputFormatter {
  private useColors: boolean;

  constructor(useColors: boolean = true) {
    this.useColors = useColors;
  }

  /**
   * Formats the "parking lot created" message.
   */
  formatParkingLotCreated(capacity: number): string {
    const message = `Created a parking lot with ${capacity} slots`;
    return this.useColors ? success(message) : message;
  }

  /**
   * Formats the "slot allocated" message (legacy single-lot).
   */
  formatSlotAllocated(slotNumber: number): string {
    const message = `Allocated slot number: ${slotNumber}`;
    return this.useColors ? success(message) : message;
  }

  /**
   * Formats the "slot allocated" message with lot information.
   */
  formatSlotAllocatedWithLot(slotNumber: number, lotNumber: number): string {
    const message = `Allocated slot number: ${slotNumber} in Lot ${lotNumber}`;
    return this.useColors ? success(message) : message;
  }

  /**
   * Formats the "parking lot is full" message (legacy single-lot).
   */
  formatParkingLotFull(): string {
    const message = 'Sorry, parking lot is full';
    return this.useColors ? error(message) : message;
  }

  /**
   * Formats the "all lots full" message.
   */
  formatAllLotsFull(): string {
    const message = 'Sorry, all parking lots are full';
    return this.useColors ? error(message) : message;
  }

  /**
   * Formats the "duplicate registration" error message.
   * Supports both single-lot (number) and multi-lot (string with lot prefix) formats.
   */
  formatDuplicateRegistration(registrationNumber: string, existingSlot: number | string): string {
    const message = `Car with registration ${registrationNumber} is already parked in slot ${existingSlot}`;
    return this.useColors ? error(message) : message;
  }

  /**
   * Formats the "slot is free" message (legacy single-lot).
   */
  formatSlotFreed(slotNumber: number): string {
    const message = `Slot number ${slotNumber} is free.`;
    return this.useColors ? warning(message) : message;
  }

  /**
   * Formats the "slot is free" message with lot information.
   */
  formatSlotFreedWithLot(slotNumber: number, lotNumber: number): string {
    const message = `Slot number ${slotNumber} in Lot ${lotNumber} is free.`;
    return this.useColors ? warning(message) : message;
  }

  /**
   * Formats the status table showing all parked cars (legacy single-lot).
   * 
   * The table format matches the expected output exactly:
   * Slot No.    Registration No    Colour
   * 1           KA-01-HH-1234      White
   */
  formatStatus(
    entries: Array<{ slotNumber: number; registrationNumber: string; color: string }>
  ): string {
    const header = 'Slot No.    Registration No    Colour';
    
    if (entries.length === 0) {
      return this.useColors ? dim(header) : header;
    }

    const lines: string[] = [this.useColors ? bold(header) : header];
    
    for (const entry of entries) {
      // Align columns similar to expected output
      const slotStr = String(entry.slotNumber);
      const regStr = entry.registrationNumber;
      const colorStr = entry.color;
      
      // Format: slot(padded to ~12) + registration(padded to ~19) + color
      const line = `${slotStr.padEnd(12)}${regStr.padEnd(19)}${colorStr}`;
      lines.push(this.useColors ? info(line) : line);
    }

    return lines.join('\n');
  }

  /**
   * Formats the status table for multiple parking lots with separators.
   */
  formatStatusMultiLot(entries: StatusEntry[]): string {
    if (entries.length === 0) {
      const header = 'Lot No.     Slot No.    Registration No    Colour';
      return this.useColors ? dim(header) : header;
    }

    const lines: string[] = [];
    let currentLot = -1;

    for (const entry of entries) {
      // Add lot separator when we encounter a new lot
      if (entry.lotNumber !== currentLot) {
        if (currentLot !== -1) {
          lines.push(''); // Blank line between lots
        }
        
        const lotHeader = `Lot ${entry.lotNumber}:`;
        lines.push(this.useColors ? bold(lotHeader) : lotHeader);
        
        const header = 'Slot No.    Registration No    Colour';
        lines.push(this.useColors ? bold(header) : header);
        
        currentLot = entry.lotNumber;
      }

      // Format entry
      const slotStr = String(entry.slotNumber);
      const regStr = entry.registrationNumber;
      const colorStr = entry.color;
      
      const line = `${slotStr.padEnd(12)}${regStr.padEnd(19)}${colorStr}`;
      lines.push(this.useColors ? info(line) : line);
    }

    return lines.join('\n');
  }

  /**
   * Formats a comma-separated list of registration numbers.
   */
  formatRegistrationNumbers(registrations: string[]): string {
    if (registrations.length === 0) {
      return this.formatNotFound();
    }
    const message = registrations.join(', ');
    return this.useColors ? highlight(message) : message;
  }

  /**
   * Formats a comma-separated list of slot numbers (legacy single-lot).
   */
  formatSlotNumbers(slots: number[]): string {
    if (slots.length === 0) {
      return this.formatNotFound();
    }
    const message = slots.join(', ');
    return this.useColors ? highlight(message) : message;
  }

  /**
   * Formats a comma-separated list of slot numbers with lot prefix.
   * Format: L1-1, L1-2, L2-3
   */
  formatSlotNumbersWithLot(slots: string[]): string {
    if (slots.length === 0) {
      return this.formatNotFound();
    }
    const message = slots.join(', ');
    return this.useColors ? highlight(message) : message;
  }

  /**
   * Formats a single slot number result (legacy single-lot).
   */
  formatSlotNumber(slot: number | null): string {
    if (slot === null) {
      return this.formatNotFound();
    }
    const message = String(slot);
    return this.useColors ? highlight(message) : message;
  }

  /**
   * Formats a single slot number with lot prefix.
   * Format: L2-4
   */
  formatSlotNumberWithLot(slot: string | null): string {
    if (slot === null) {
      return this.formatNotFound();
    }
    return this.useColors ? highlight(slot) : slot;
  }

  /**
   * Formats the "not found" message.
   */
  formatNotFound(): string {
    const message = 'Not found';
    return this.useColors ? error(message) : message;
  }

  /**
   * Formats an error message for invalid commands or states.
   */
  formatError(message: string): string {
    return this.useColors ? error(message) : message;
  }

  /**
   * Formats the welcome banner for interactive mode.
   */
  formatWelcomeBanner(): string {
    if (!this.useColors) {
      return ''; // No banner in file mode
    }

    const lines = [
      '',
      highlight('╭─────────────────────────────────────────────────────╮'),
      highlight('│') + bold('          🚗  PARKING LOT SYSTEM  🚗                ') + highlight('│'),
      highlight('│') + dim('          ─────────────────────────                 ') + highlight('│'),
      highlight('│') + info('          Type \'help\' for commands                 ') + highlight('│'),
      highlight('│') + info('          Type \'exit\' to quit                      ') + highlight('│'),
      highlight('╰─────────────────────────────────────────────────────╯'),
      '',
    ];
    return lines.join('\n');
  }

  /**
   * Formats the dispatch rule set message.
   */
  formatDispatchRuleSet(ruleName: string): string {
    const message = `Dispatcher is now using the ${ruleName} rule`;
    return this.useColors ? success(message) : message;
  }

  /**
   * Formats the help text showing available commands.
   */
  formatHelp(): string {
    const commands = [
      ['create_parking_lot <n>', 'Create a parking lot with n slots'],
      ['dispatch_rule <rule>', 'Set dispatch rule (even_distribution or fill_first)'],
      ['park <reg_no> <color>', 'Park a car (dispatcher selects lot)'],
      ['leave <lot_no> <slot_no>', 'Free a parking slot'],
      ['status', 'Show all parked cars across all lots'],
      ['registration_numbers_for_cars_with_colour <color>', 'Find registrations by color'],
      ['slot_numbers_for_cars_with_colour <color>', 'Find slots by color'],
      ['slot_number_for_registration_number <reg_no>', 'Find slot by registration'],
      ['load <filename>', 'Execute commands from a file'],
      ['help', 'Show this help message'],
      ['exit', 'Exit the program'],
    ];

    const lines: string[] = [];
    lines.push(this.useColors ? bold('\nAvailable Commands:\n') : '\nAvailable Commands:\n');

    for (const [cmd, desc] of commands) {
      if (this.useColors) {
        lines.push(`  ${highlight(cmd)}`);
        lines.push(`      ${dim(desc)}`);
      } else {
        lines.push(`  ${cmd}`);
        lines.push(`      ${desc}`);
      }
    }
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Formats the interactive prompt.
   */
  formatPrompt(): string {
    return this.useColors ? `${info('parking_lot')}${dim('>')} ` : 'parking_lot> ';
  }
}
