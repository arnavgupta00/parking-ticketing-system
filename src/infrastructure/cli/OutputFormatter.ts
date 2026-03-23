import { success, error, warning, info, highlight, bold, dim } from '../colors/AnsiColors';

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
   * Formats the "slot allocated" message.
   */
  formatSlotAllocated(slotNumber: number): string {
    const message = `Allocated slot number: ${slotNumber}`;
    return this.useColors ? success(message) : message;
  }

  /**
   * Formats the "parking lot is full" message.
   */
  formatParkingLotFull(): string {
    const message = 'Sorry, parking lot is full';
    return this.useColors ? error(message) : message;
  }

  /**
   * Formats the "slot is free" message.
   */
  formatSlotFreed(slotNumber: number): string {
    const message = `Slot number ${slotNumber} is free.`;
    return this.useColors ? warning(message) : message;
  }

  /**
   * Formats the status table showing all parked cars.
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
   * Formats a comma-separated list of slot numbers.
   */
  formatSlotNumbers(slots: number[]): string {
    if (slots.length === 0) {
      return this.formatNotFound();
    }
    const message = slots.join(', ');
    return this.useColors ? highlight(message) : message;
  }

  /**
   * Formats a single slot number result.
   */
  formatSlotNumber(slot: number | null): string {
    if (slot === null) {
      return this.formatNotFound();
    }
    const message = String(slot);
    return this.useColors ? highlight(message) : message;
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
   * Formats the help text showing available commands.
   */
  formatHelp(): string {
    const commands = [
      ['create_parking_lot <n>', 'Create a parking lot with n slots'],
      ['park <reg_no> <color>', 'Park a car'],
      ['leave <slot_no>', 'Free a parking slot'],
      ['status', 'Show all parked cars'],
      ['registration_numbers_for_cars_with_colour <color>', 'Find registrations by color'],
      ['slot_numbers_for_cars_with_colour <color>', 'Find slots by color'],
      ['slot_number_for_registration_number <reg_no>', 'Find slot by registration'],
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
